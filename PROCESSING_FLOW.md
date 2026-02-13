# Flujo de Procesamiento Interno - Auto Extractor

## 📋 Visión General

Cuando un usuario sube un PDF, la aplicación ejecuta un pipeline de procesamiento en 7 fases principales:

```
PDF Upload → WebSocket Connection → PDF Parsing → Data Extraction → 
Progress Updates → Result Storage → CSV Export
```

---

## 🔄 Flujo Detallado Paso a Paso

### **FASE 1: Upload del PDF (Frontend)**

**Ubicación**: `frontend/app/page.tsx` → `handleFileUpload()`

1. Usuario arrastra/selecciona PDF
2. Frontend lee el archivo como **Base64**
3. Se genera un `sessionId` único (timestamp)
4. Se establece estado `isExtracting = true`

```typescript
const newSessionId = Date.now().toString()
const base64 = fileReader.result.split(',')[1]
```

---

### **FASE 2: Conexión WebSocket (Frontend → Backend)**

**Ubicación**: `frontend/app/page.tsx` → WebSocket client

1. Frontend abre conexión WebSocket:
   ```
   ws://localhost:8000/ws/extract/{sessionId}
   ```

2. Al conectarse, envía el PDF en Base64:
   ```json
   {
     "pdf_data": "JVBERi0xLjQKJeLjz9MK..."
   }
   ```

3. Frontend escucha 3 tipos de mensajes:
   - `type: "progress"` → Actualiza barra de progreso
   - `type: "complete"` → Recibe datos finales
   - `type: "error"` → Muestra error

---

### **FASE 3: Recepción en Backend (WebSocket)**

**Ubicación**: `backend/main.py` → `websocket_extract()`

1. Backend acepta conexión WebSocket
2. Recibe JSON con `pdf_data`
3. Decodifica Base64 a bytes:
   ```python
   pdf_bytes = base64.b64decode(pdf_base64)
   ```

---

### **FASE 4: Extracción de Texto del PDF**

**Ubicación**: `backend/utils/pdf_parser.py` → `extract_text_from_pdf()`

1. Convierte bytes a objeto PDF con PyPDF2:
   ```python
   pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_bytes))
   ```

2. Itera sobre todas las páginas
3. Extrae texto de cada página
4. Concatena todo en un string único

**Output**: String de ~3MB con todo el contenido del Auto

---

### **FASE 5: Extracción de Datos (Orchestrator)**

**Ubicación**: `backend/extractors/orchestrator.py` → `extract_all()`

Esta es la fase más compleja. El **Orchestrator** coordina 4 extractores especializados:

#### **5.1 Extracción de Nombres**
**Ubicación**: `backend/extractors/names.py`

```python
# Progreso: 10% → "📄 Procesando PDF..."
# Progreso: 20% → "👥 Extrayendo nombres de víctimas..."

# Busca patrones como:
pattern = r'\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,4})\b'

# Filtra por contexto:
- Busca cerca de palabras: "víctima", "asesinato", "muerte"
- Valida que tenga al menos 3 palabras (Nombre Apellido Apellido)
- Limita a 200 nombres máximo
```

**Output**: Lista de nombres completos
```python
["Alba Luz Mejía Álvarez", "Daniel Alvarado Rivera", ...]
```

#### **5.2 Extracción de Fechas (por cada víctima)**
**Ubicación**: `backend/extractors/dates.py`

```python
# Progreso: 20-80% → "🔍 Extrayendo datos (X/total)..."

for each victim_name:
    # 1. Busca contexto (500 caracteres alrededor del nombre)
    context = find_context_around_name(victim_name, text)
    
    # 2. Busca patrones de fecha:
    patterns = [
        r'(\d{1,2}) de (enero|febrero|...) de (\d{4})',
        r'(\d{1,2})-(\d{1,2})-(\d{4})',
        r'(\d{4})-(\d{1,2})-(\d{1,2})'
    ]
    
    # 3. Convierte a formato DD-MM-YYYY
    fecha_muerte = "13-01-2007"
```

**Output**: Fechas por víctima
```python
{
    'fecha_muerte': '13-01-2007',
    'fecha_desaparicion': '10-01-2007'
}
```

#### **5.3 Extracción de Ubicaciones (por cada víctima)**
**Ubicación**: `backend/extractors/locations.py`

```python
for each victim_name:
    # 1. Busca contexto (300 caracteres alrededor)
    context = find_context_around_name(victim_name, text)
    
    # 2. Busca patrones de ubicación:
    patterns = [
        r'Vereda\s+([^,]+),\s*([^,\n]+)',
        r'Municipio\s+(?:de\s+)?([A-Z][a-záéíóúñ]+)',
    ]
    
    # 3. Si no encuentra ubicación específica:
    if 'BIMAG' in context or 'BIPIG' in context:
        return "Huila"  # Departamento por jurisdicción
```

**Output**: Ubicación por víctima
```python
"Vereda La Palma, Suaza, Huila"
# o
"Huila"
```

#### **5.4 Extracción de Familias (por cada víctima)**
**Ubicación**: `backend/extractors/families.py`

```python
for each victim_name:
    # 1. Busca contexto (500 caracteres)
    context = find_context_around_name(victim_name, text)
    
    # 2. Busca relaciones familiares:
    patterns = {
        'padre': r'(?:padre|hijo de)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
        'madre': r'(?:madre|hija de)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
        'hermano': r'(?:hermano|hermana)\s+([A-Z][a-z]+)',
        'pareja': r'(?:esposo|esposa|compañero)\s+([A-Z][a-z]+)'
    }
```

**Output**: Datos familiares
```python
{
    'nombre_padre': 'Ángel María Petevi',
    'nombre_madre': None,
    'nombre_hermano': 'Jhon Vilmer Satiaca',
    'nombre_pareja': None
}
```

#### **5.5 Construcción del Objeto Victim**

```python
victim = Victim(
    id=1,
    nombre_completo="Alba Luz Mejía Álvarez",
    fecha_muerte="13-01-2007",
    fecha_desaparicion="10-01-2007",
    lugar_asesinato="Vereda La Palma, Suaza, Huila",
    nombre_padre="Daniel Alvarado Rivera",
    # ... otros campos
)
```

---

### **FASE 6: Actualizaciones de Progreso (WebSocket)**

Durante todo el proceso, el Orchestrator envía actualizaciones:

```python
async def send_progress(stage, message, progress):
    await websocket.send_json({
        "type": "progress",
        "data": {
            "stage": "extracting",
            "message": "🔍 Extrayendo datos (50/151)...",
            "progress": 55
        }
    })
```

**Frontend recibe y actualiza UI**:
```typescript
ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'progress') {
        setProgress(data.data)  // Actualiza barra
    }
}
```

---

### **FASE 7: Almacenamiento y Finalización**

**Ubicación**: `backend/main.py`

1. Orchestrator termina extracción
2. Backend guarda resultados en memoria:
   ```python
   extraction_results[session_id] = victims  # Lista de Victim objects
   ```

3. Envía mensaje final por WebSocket:
   ```json
   {
     "type": "complete",
     "data": {
       "victims": [...],
       "total_found": 151
     }
   }
   ```

4. Frontend recibe datos y actualiza estado:
   ```typescript
   setVictims(data.data.victims)
   setIsExtracting(false)
   ```

---

### **FASE 8: Visualización (Frontend)**

**Ubicación**: `frontend/components/DataTable.tsx`

1. Frontend renderiza tabla con los datos
2. Usuario puede revisar todos los campos
3. Datos están listos para exportar

---

### **FASE 9: Exportación a CSV**

**Ubicación**: `backend/main.py` → `export_csv()`

Cuando usuario hace clic en "Descargar CSV":

1. Frontend hace request GET:
   ```
   GET /export/{sessionId}
   ```

2. Backend recupera datos de memoria:
   ```python
   victims = extraction_results[session_id]
   ```

3. Lee headers desde plantilla:
   ```python
   with open('csv_template.csv') as f:
       headers = next(csv.reader(f))
   ```

4. Genera CSV en memoria:
   ```python
   writer.writerow(headers)
   for victim in victims:
       writer.writerow([victim.id, victim.nombre_completo, ...])
   ```

5. Retorna como descarga:
   ```python
   return StreamingResponse(
       iter([csv_content]),
       media_type="text/csv",
       headers={"Content-Disposition": "attachment; filename=..."}
   )
   ```

---

## 🎯 Resumen del Pipeline

```
1. PDF (15MB) 
   ↓
2. Base64 encoding → WebSocket
   ↓
3. PDF bytes → PyPDF2
   ↓
4. Text extraction (3MB string)
   ↓
5. Parallel extraction:
   - Names (regex patterns)
   - Dates (context search)
   - Locations (context + patterns)
   - Families (relationship patterns)
   ↓
6. Victim objects (151 items)
   ↓
7. JSON → WebSocket → Frontend
   ↓
8. Table visualization
   ↓
9. CSV export (22KB file)
```

---

## ⚡ Optimizaciones Implementadas

1. **WebSocket**: Comunicación bidireccional en tiempo real
2. **Progreso granular**: Actualización cada 5 víctimas
3. **Búsqueda contextual**: Solo busca en ±500 caracteres del nombre
4. **Límite de nombres**: Máximo 200 para evitar falsos positivos
5. **Almacenamiento en memoria**: Resultados disponibles para múltiples exports

---

## 🔧 Puntos de Mejora Futura

1. **Cache de PDF**: Evitar reprocesar el mismo PDF
2. **Base de datos**: Persistir resultados en lugar de memoria
3. **ML/NLP**: Usar modelos de lenguaje para mejor extracción
4. **Validación**: Verificar consistencia de datos extraídos
5. **Edición en tabla**: Permitir editar datos antes de exportar
