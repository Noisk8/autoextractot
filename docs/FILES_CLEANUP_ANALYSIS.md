# Análisis de Archivos para Limpieza Final

## 🗑️ ARCHIVOS QUE PUEDEN ELIMINARSE (Duplicados/Temporales)

### Archivos TXT duplicados del Auto (extracciones del PDF)
- ❌ `auto_huila.txt` (3.2 MB) - Extracción básica del PDF
- ❌ `auto_huila_layout.txt` (3.5 MB) - Extracción con layout del PDF
- ❌ `extracted_content.txt` (3.2 MB) - **DUPLICADO** de `auto_huila.txt`
- ❌ `extracted_layout.txt` (3.5 MB) - **DUPLICADO** de `auto_huila_layout.txt`

**Razón**: Son extracciones temporales del PDF. El PDF original ya contiene toda la información.
**Ahorro**: ~13 MB

### Archivos de trabajo temporal
- ❌ `PERSONAS FILTRADAS.txt` - Lista temporal de personas
- ❌ `VICTIMAS_LISTADAS.txt` - Lista temporal de víctimas
- ❌ `Datos_Filtrados-md` - Archivo temporal de filtrado
- ❌ `ideas.txt` - Notas temporales (ya implementadas en la app)

**Razón**: Archivos de trabajo temporal del proceso de análisis inicial.

### Archivos Markdown de trabajo
- ❌ `Listado_Victimas.md` - Lista de víctimas (ya en CSV)
- ❌ `VICTIMAS_LISTADAS.md` - Lista extendida de víctimas (ya en CSV)
- ❌ `PROMPTS_AGENTES.md` - Prompts de trabajo (no necesarios en producción)

**Razón**: Información ya consolidada en el CSV final.

---

## ✅ ARCHIVOS QUE DEBEN MANTENERSE

### Archivos esenciales del proyecto
- ✅ `Auto_SRVR-SUB-D-SUBCASO-HUILA-081_20-noviembre-2023.pdf` (15 MB) - **Fuente original**
- ✅ `Bases+ontologia-Auto4-Huila.csv` - **CSV completado con datos**
- ✅ `csv_template.csv` - **Plantilla para la aplicación**

### Documentación
- ✅ `CSV_TEMPLATE_README.md` - Documentación de la plantilla
- ✅ `SCRIPTS_CLEANUP.md` - Documentación de limpieza de scripts

### Scripts de referencia
- ✅ `analyze_dates.py` - Referencia para extracción de fechas
- ✅ `analyze_families.py` - Referencia para extracción de familias
- ✅ `analyze_places.py` - Referencia para extracción de lugares
- ✅ `search_locations.py` - Referencia para búsqueda de ubicaciones

### Utilidades
- ✅ `cleanup_scripts.sh` - Script de limpieza ejecutado

### Directorios
- ✅ `auto-extractor/` - **Aplicación web completa**
- ✅ `scripts_legacy/` - **Scripts archivados** (pueden moverse a .archive/ si quieres)

---

## 📊 Resumen

**Total a eliminar**: 11 archivos (~13.5 MB)
**Total a mantener**: 10 archivos + 2 directorios

**Estructura final recomendada**:
```
AUTOS/
├── Auto_SRVR-SUB-D-SUBCASO-HUILA-081_20-noviembre-2023.pdf  # Fuente
├── Bases+ontologia-Auto4-Huila.csv                          # Datos completados
├── csv_template.csv                                         # Plantilla
├── CSV_TEMPLATE_README.md                                   # Docs
├── SCRIPTS_CLEANUP.md                                       # Docs
├── analyze_dates.py                                         # Referencia
├── analyze_families.py                                      # Referencia
├── analyze_places.py                                        # Referencia
├── search_locations.py                                      # Referencia
├── cleanup_scripts.sh                                       # Utilidad
├── auto-extractor/                                          # Aplicación web
└── scripts_legacy/                                          # Scripts archivados
```

**Peso final**: ~15 MB (vs ~28 MB actual) = **50% de reducción**
