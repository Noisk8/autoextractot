# CSV Template - Plantilla de Headers

Este archivo contiene únicamente los headers (cabeceras) del CSV que se usará como plantilla para la aplicación Auto Extractor.

## Uso

La aplicación `auto-extractor` usa este archivo como referencia para:
1. Generar CSVs con el formato correcto
2. Mantener consistencia en los nombres de columnas
3. Asegurar compatibilidad con otros sistemas

## Columnas

1. **ID** - Identificador único de la víctima
2. **Nombre Completo de la Víctima** - Nombre completo
3. **Sexo** - Masculino/Femenino
4. **Ocupación** - Ocupación de la víctima
5. **Grupo Étnico** - Pertenencia étnica (Indígena, Afrodescendiente, etc.)
6. **Fecha de Nacimiento** - Formato: DD-MM-YYYY
7. **Fecha de Muerte** - Formato: DD-MM-YYYY
8. **Fecha de Desaparición** - Formato: DD-MM-YYYY
9. **Lugar de Asesinato** - Vereda, Municipio, Departamento
10. **Agente/Entidad Responsable** - Batallón, brigada, etc.
11. **Nombre de la Madre** - Nombre completo de la madre
12. **Nombre del Padre** - Nombre completo del padre
13. **Nombre del Hermano/a** - Nombre de hermano(s)
14. **Nombre de la Pareja** - Esposo(a)/Compañero(a)
15. **Alias** - Alias o apodo

## Modificaciones

Si necesitas agregar o modificar columnas:
1. Edita `csv_template.csv`
2. Actualiza `backend/models/victim.py` con los nuevos campos
3. Actualiza `backend/main.py` en la función `export_csv()`
4. Actualiza `frontend/components/DataTable.tsx` para mostrar las nuevas columnas
