import re
from typing import Optional

def extract_location_for_victim(victim_name: str, text: str) -> Optional[str]:
    """
    Extrae el lugar de asesinato para una víctima específica.
    """
    # Clean victim name
    name_parts = victim_name.split()
    if len(name_parts) >= 2:
        robust_name_pattern = f"{name_parts[0]}.*?{name_parts[-1]}"
    else:
        robust_name_pattern = re.escape(victim_name)
    
    # Text cleaning
    clean_text = text.replace('-\n', '').replace('\n', ' ')
    
    # Buscar contexto alrededor del nombre
    context_pattern = f'.{{0,400}}{robust_name_pattern}.{{0,400}}'
    context_matches = re.findall(context_pattern, clean_text, re.IGNORECASE)
    
    if not context_matches:
        name_pattern = re.escape(victim_name)
        context_pattern = f'.{{0,400}}{name_pattern}.{{0,400}}'
        context_matches = re.findall(context_pattern, clean_text, re.IGNORECASE)
        
        if not context_matches:
            return None
    
    context = ' '.join(context_matches)
    
    # Patrones de ubicación
    location_patterns = [
        r'[Vv]ereda\s+([^,]+),\s*([^,\n]+)',
        r'[Mm]unicipio\s+(?:de\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)',
        r'[Vv]ereda\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ\s]+?)(?:\s+de|\s+en|,|\.|$)'
    ]
    
    for pattern in location_patterns:
        matches = re.findall(pattern, context)
        if matches:
            if isinstance(matches[0], tuple):
                return f"Vereda {matches[0][0].strip()}, {matches[0][1].strip()}, Huila"
            else:
                return f"{matches[0].strip()}, Huila"
    
    # Si no se encuentra ubicación específica, buscar batallón
    if 'BIMAG' in context or 'BIPIG' in context or 'Magdalena' in context or 'Pigoanza' in context:
        return "Huila"
    
    return None
