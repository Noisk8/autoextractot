import re
import asyncio
from typing import List, Tuple, Callable, Awaitable

async def extract_victim_names(text: str, progress_callback: Callable[[int], Awaitable[None]] = None) -> List[str]:
    """
    Extrae nombres de víctimas del texto del Auto de forma asíncrona.
    Reporta progreso para evitar bloqueos en la UI.
    """
    names = []
    seen = set()
    
    # Clean up newline artifacts that might break names across lines
    search_text = text.replace('-\n', '').replace('\n', ' ')
    
    # Exclusion list for false positives (Institutions, Military Entities, generic roles)
    exclusion_list = [
        'BATALLON', 'BATALLÓN', 'BRIGADA', 'EJERCITO', 'EJÉRCITO', 'NACIONAL', 
        'CTI', 'FISCALIA', 'FISCALÍA', 'JEP', 'SALA', 'JURISDICCION', 
        'JURISDICCIÓN', 'MINISTERIO', 'DEFENSA', 'POLICIA', 'POLICÍA', 
        'SIJIN', 'CASO', 'AUTO', 'RADICADO', 'EXPEDIENTE', 'INFORME',
        'COMANDANTE', 'SOLDADO', 'SARGENTO', 'CORONEL', 'CAPITAN', 'CAPITÁN',
        'MAYOR', 'TENIENTE', 'CABO', 'GENERAL', 'SEÑOR', 'FUERZA', 'LEY', 
        'ACTO', 'LEGISLATIVO', 'ARTICULO', 'ARTÍCULO', 'REPÚBLICA', 'REPUBLICA',
        'COLOMBIA', 'SECCIÓN', 'SECCION', 'DERECHO', 'PENAL', 'CÓDIGO', 'CODIGO'
    ]
    
    # 1. Pattern for numbered lists (e.g., "1. Juan Perez", "2) Maria INDIRA Gomez")
    # Captures names with 2-5 words, allowing for ALL CAPS or Title Case
    list_pattern = r'(?:^|\s)(?:\d+[\.|-|\)]|•)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]+){1,4})\b'
    
    # 2. Strict Pattern for text flow (3-5 words, Title Case)
    text_pattern = r'\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,4})\b'
    
    def is_valid_name(name_str: str) -> bool:
        # Check against exclusion list
        for word in name_str.upper().split():
            if word in exclusion_list:
                return False
        # Avoid things that are all lowercase or weirdly formatted
        if name_str.islower() or name_str.count(' ') > 5:
            return False
        return True

    # Strategy 1: Extract from Lists (High confidence)
    for match in re.finditer(list_pattern, search_text):
        name = match.group(1).strip()
        name = re.sub(r'[^\w\s]', '', name)
        
        if is_valid_name(name) and len(name.split()) >= 2 and len(name) > 4 and name.upper() not in seen:
             names.append(name.upper()) # Save uniformly
             seen.add(name.upper())
    
    # Strategy 2: Contextual Search
    keywords = [
        'víctima', 'asesinato', 'muerte', 'ejecutado', 'desaparición', 'fallecido', 
        'homicidio', 'occiso', 'cadáver', 'cuerpo', 'asesinado', 'retención', 'secuestro',
        'identificado', 'nombre', 'alias'
    ]
    total_keywords = len(keywords)
    
    if progress_callback:
        await progress_callback(20)
    
    for i, keyword in enumerate(keywords):
        if progress_callback:
            current_prog = 20 + int((i / total_keywords) * 70)
            await progress_callback(current_prog)
            await asyncio.sleep(0.01)
            
        # Context window search
        for match in re.finditer(keyword, search_text, re.IGNORECASE):
            start = max(0, match.start() - 300)
            end = min(len(search_text), match.end() + 300)
            context = search_text[start:end]
            
            # Apply Strict Pattern in context
            for name_match in re.finditer(text_pattern, context):
                name = name_match.group(1).strip()
                name_clean = re.sub(r'[^\w\s]', '', name)
                
                if is_valid_name(name_clean) and len(name_clean.split()) >= 3 and name_clean.upper() not in seen:
                    names.append(name_clean.upper())
                    seen.add(name_clean.upper())
                    
            # Apply ALL CAPS pattern in context if strictly associated with 'nombre' or 'identificado'
            if keyword in ['identificado', 'nombre']:
                all_caps_pattern = r'\b([A-ZÁÉÍÓÚÑ]{3,}(?:\s+[A-ZÁÉÍÓÚÑ]{3,}){1,4})\b'
                for cap_match in re.finditer(all_caps_pattern, context):
                    name = cap_match.group(1).strip()
                    name_clean = re.sub(r'[^\w\s]', '', name)
                    
                    if is_valid_name(name_clean) and len(name_clean.split()) >= 2 and name_clean.upper() not in seen:
                        names.append(name_clean.upper())
                        seen.add(name_clean.upper())
                        
            await asyncio.sleep(0) # Yield control
            
    # Return formatted to Title Case for better presentation
    return [name.title() for name in names]

