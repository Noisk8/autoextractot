# 🤖 AGENTS: Directrices y Configuración del Sistema

Este archivo centraliza la información crítica para cualquier **Agente de IA** (como yo, asistentes de código, o el propio modelo Gemini integrado) que trabaje en este proyecto.

---

## 1. 🎯 Propósito del Proyecto
**Nombre**: Auto Extractor JEP
**Objetivo**: Automatizar la extracción de información estructurada sobre **víctimas del conflicto armado** a partir de documentos legales PDF ("Autos") de la **JEP (Jurisdicción Especial para la Paz)** en Colombia.

### 🧠 Lógica de Dominio
- **Entrada**: Archivos PDF de gran tamaño (decenas de megabytes, cientos de páginas).
- **Salida**: CSV con lista de víctimas y metadatos.
- **Entidad Principal**: `Victim` (Víctima).
- **Campos Clave**:
    - Nombre Completo
    - Fechas (Muerte, Desaparición)
    - Ubicación (Lugar de los hechos)
    - Familiares (Padre, Madre, etc.)
    - Agente Responsable

---

## 2. 🏗️ Arquitectura del Sistema

### Backend (Python/FastAPI)
- **Path**: `auto-extractor/backend`
- **Framework**: FastAPI (Async)
- **Comunicación**: WebSocket (`/ws/extract/{session_id}`) para streaming de progreso.
- **Lógica de Extracción (`ExtractionOrchestrator`)**:
    1.  **Fase 1 (Regex)**: Identificación rápida de candidatos a víctimas basada en patrones de nombres (`extractors/names.py`).
    2.  **Fase 2 (Validación IA)**: Uso de **Google Gemini Pro** para filtrar falsos positivos y validar contexto.
    3.  **Fase 3 (Híbrida)**: Extracción de metadatos usando IA donde es posible, con fallback a Regex para fechas y lugares específicos.

### Frontend (Next.js/React)
- **Path**: `auto-extractor/frontend`
- **Tech**: Next.js 13+ (App Router), TypeScript, Tailwind CSS.
- **Estilo**: Diseño limpio con paleta específica (`bg-[#EDE8DC]`, header `#FFE5B4`, acentos negros).
- **Componentes Clave**:
    - `FileUpload`: Manejo de archivos grandes y conversión a Base64.
    - `ProgressTracker`: Visualización de los estados del WebSocket.
    - `DataTable`: Tabla interactiva de resultados.

---

## 3. 🤖 Prompts y Directrices para la IA

### Prompt Maestro: Validación de Víctimas
Este es el prompt que utiliza el sistema (`backend/services/gemini_client.py`) para decidir si un candidato es una víctima real.

**Rol**: Experto legal en Derechos Humanos y Justicia Transicional en Colombia.

**Instrucción Principal**:
> "Tu tarea es analizar una lista de posibles nombres de víctimas extraídos de un Auto de la JEP y VALIDAR cuáles son realmente personas (víctimas) y cuáles son falsos positivos (leyes, lugares, nombres de magistrados, etc.)."

**Reglas de Decisión (`PROMPTS_AGENTES` recuperado)**:
1.  **Es Víctima**: Si el contexto menciona "asesinato", "muerte", "desaparición forzada", "homicidio", "ejecución".
2.  **No es Víctima**:
    - Nombres de Magistrados o jueces firmantes.
    - Nombres de leyes o decretos.
    - Nombres de lugares geográficos (Veredas, Municipios) mal identificados como personas.
    - Nombres de unidades militares (Batallón, Brigada).
3.  **Metadatos a Extraer**:
    - Fecha exacta del hecho.
    - Lugar específico (Vereda/Municipio).
    - Presunto responsable (si se menciona explícitamente).

### Estructura JSON de Salida Esperada
```json
[
    {
        "nombre_completo": "Nombre de la Víctima",
        "es_victima": true,
        "metadatos": {
            "fecha_muerte": "DD-MM-AAAA",
            "lugar": "Nombre del sitio",
            "responsable": "Nombre del Batallón/Agente"
        }
    }
]
```

---

## 4. 🛠️ Guía para Agentes de Desarrollo (Coding Agents)

Si estás modificando el código de este proyecto, sigue estas reglas:

### Backend
- **Async First**: Todo el procesamiento pesado debe ser asíncrono para no bloquear el WebSocket.
- **Reporte de Progreso**: Cualquier proceso que tome más de 1 segundo debe emitir eventos de progreso vía `progress_callback`.
- **Manejo de Errores**: La IA (Gemini) puede fallar o tener timeout. **SIEMPRE** implementa lógica de fallback (retorno a Regex) para que el sistema siga funcionando sin IA.

### Frontend
- **UX Inmediato**: El usuario debe recibir feedback visual instantáneo al subir el archivo.
- **Estética**: Respetar los colores definidos (Beige `#EDE8DC`, Header Amarillo `#FFE5B4`, Bordes Negros gruesos). No introducir estilos genéricos de Bootstrap o Material UI.

### Control de Versiones
- **Archivos Temporales**: No commitear PDFs ni archivos `.tmp` o `.txt` de depuración.

---
*Este archivo debe ser consultado por cualquier agente antes de realizar cambios estructurales o de lógica de extracción.*
