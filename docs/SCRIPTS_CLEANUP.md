# Scripts de Análisis Manual - Clasificación

## ✅ Scripts que DEBEN MANTENERSE (útiles para referencia/debugging)

Estos scripts contienen lógica que fue integrada en la aplicación web, pero pueden ser útiles para:
- Debugging de la lógica de extracción
- Análisis manual adicional
- Referencia de patrones de búsqueda

**Mantener:**
- `analyze_dates.py` - Lógica de extracción de fechas (base para `backend/extractors/dates.py`)
- `analyze_families.py` - Lógica de extracción de familias (base para `backend/extractors/families.py`)
- `analyze_places.py` - Lógica de extracción de lugares (base para `backend/extractors/locations.py`)
- `search_locations.py` - Búsqueda de ubicaciones (integrado en `locations.py`)

## 🗑️ Scripts que PUEDEN ELIMINARSE (ya integrados o específicos del CSV actual)

Estos scripts fueron creados para el análisis manual del CSV específico de Huila y ya cumplieron su propósito:

**Scripts de actualización específica (batch updates):**
- `update_alvira.py` - Actualización específica familia Alvira
- `update_barco_restrepo_quintero.py` - Actualización específica
- `update_batch_8.py` - Actualización por lotes
- `update_batch_9.py` - Actualización por lotes
- `update_bustos.py` - Actualización específica
- `update_correa_cuadrado.py` - Actualización específica
- `update_cuellar_pena.py` - Actualización específica
- `update_ethnicity.py` - Ya ejecutado, datos en CSV
- `update_families.py` - Ya ejecutado, datos en CSV
- `update_final_batch.py` - Ya ejecutado
- `update_galvis_barrera.py` - Actualización específica
- `update_locations.py` - Ya ejecutado, datos en CSV
- `update_lozada_bermeo.py` - Actualización específica
- `update_missing_dates.py` - Ya ejecutado, datos en CSV
- `update_murcia.py` - Actualización específica
- `update_polania.py` - Actualización específica
- `update_sunz_neira.py` - Actualización específica

**Scripts de análisis exploratorio:**
- `analyze_agents.py` - Análisis de agentes responsables
- `analyze_ages.py` - Análisis de edades (no se encontraron fechas de nacimiento)
- `analyze_missing_locations.py` - Análisis de ubicaciones faltantes
- `analyze_occupation.py` - Análisis de ocupaciones

**Scripts de sincronización/merge:**
- `merge_data.py` - Merge de datos (ya ejecutado)
- `sync_csv.py` - Sincronización (ya ejecutado)
- `sync_csv_v2.py` - Sincronización v2 (ya ejecutado)
- `standardize_agents.py` - Estandarización (ya ejecutado)
- `standardize_jurisdictions.py` - Estandarización (ya ejecutado)
- `standardize_places.py` - Estandarización (ya ejecutado)

## 📦 Recomendación

**Crear carpeta de archivo:**
```bash
mkdir -p /home/noisk8/Documentos/WIKIMEDIA/Colaboratorio/AUTOS/scripts_legacy
```

**Mover scripts obsoletos:**
- Todos los `update_*.py` → `scripts_legacy/updates/`
- Todos los `analyze_*.py` (excepto los 4 de referencia) → `scripts_legacy/analysis/`
- Todos los `sync_*.py`, `merge_*.py`, `standardize_*.py` → `scripts_legacy/processing/`

**Mantener en raíz:**
- `analyze_dates.py`
- `analyze_families.py`
- `analyze_places.py`
- `search_locations.py`

Esto mantiene el proyecto limpio pero conserva los scripts por si necesitas consultarlos en el futuro.
