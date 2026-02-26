# Guía de Extracción de Datos (Topología de Autos JEP)

Esta carpeta (`backend/extractors`) contiene el motor de Expresiones Regulares (Regex) encargado de minar información desde los PDFs (Autos de la JEP). 

## 1. Topología del Documento a Leer
Los Autos de Determinación de Hechos y Conductas de la JEP poseen dinámicas textuales muy marcadas, que dictan cómo funciona nuestro extractor:

* **Estructura de Índice/Listado**: Gran parte de los nombres de víctimas se condensan en tablas de contenido o subsecciones del tipo: `Caso ilustrativo X: el homicidio de [Nombre Completo]`.
* **Narrativa de Casos**: Cada víctima tiene apartados narrativos donde, en cercanía al nombre (usualmente en un radio no mayor a unos pocos párrafos), se documentan datos vitales (fecha de desaparición/muerte, municipio, vereda o batallón involucrado, y filiación familiar).
* **Ruido OCR/Formatos**: Los archivos PDF se traducen a texto plano (`txt`) de manera cruda, dejando saltos de línea (`\n`) a mitad de frases y tablas invisibles, por lo tanto, el texto debe acondicionarse antes de su análisis.

## 2. Flujo de Lectura y Extracción
El orquestador (`orchestrator.py`) controla el proceso de extracción, fragmentado en dos grandes fases lógicas:

### Fase 1: Identificación de Entidades (Víctimas)
El archivo **`names.py`** es el más intensivo. Se encarga de hacer barridos completos del documento completo para detectar a las personas afectadas. Utiliza estrategias combinadas:
1. **Búsqueda Lineal/Listas Numeradas**: Extrae nombres vinculados a conteos (`1. Juan Perez`). 
2. **Búsqueda por Palabras Clave (Contexto)**: Busca anclas (ej. *"víctima"*, *"asesinato"*) y analiza un espectro de 300 caracteres buscando cadenas que posean formato Title Case (Iniciales Mayúsculas) o Mayúsculas Sostenidas, y las extrae. **Filtra falsos positivos** desechando coincidencias de instituciones (JEP, Ejército, Fiscalía, etc).

### Fase 2: Tabulación de Metadatos por Víctima (Ventanas de Contexto)
Una vez que `names.py` retorna una lista consolidada (ej. `["Juan Pérez", "María Vargas"]`), el orquestador repasa el nombre de cada víctima y crea una **ventana de contexto** exclusiva aislando una porción del texto madre (típicamente 500 caracteres antes y después de cada vez que se menciona el nombre).
Esa porción de texto aislada se le entrega en paralelo a:
* **`dates.py`**: Aplica Regex para buscar patrones del tipo "DD de Mes de AAAA" que dictan muerte o desaparición.
* **`locations.py`**: Identifica prefijos geográficos como "Municipio de", o "Vereda", y la presencia de batallones (BIMAG, BIPIG) para extraer el lugar ("Huila").
* **`families.py`**: Analiza palabras conECTOR (ej. *"hijo de"*, *"madre"*) para localizar e identificar a sus familiares en la narrativa inmediata.

## 3. Guía de Mantenimiento para Regex
Si los test de extracción muestran mala lectura de datos para nuevas tipologías de archivos, revise estas pautas:
- **Nombres Partidos:** Cuidado con el `\s+` que pueda no interpretar el salto de línea. Reemplace espacios por limpieza previa del buffer (por ej. cambiar `\n` por `' '`).
- **Instituciones infiltradas:** Actualice la lista negra en `names.py` excluyendo términos nuevos como SIJIN, CTI u oficinas estatales.
