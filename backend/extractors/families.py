import re
from typing import Dict, Optional

def extract_family_for_victim(victim_name: str, text: str) -> Dict[str, Optional[str]]:
    """
    Extrae datos familiares para una víctima específica.
    """
    result = {
        'nombre_madre': None,
        'nombre_padre': None,
        'nombre_hermano': None,
        'nombre_pareja': None
    }
    
    # Buscar contexto alrededor del nombre
    name_pattern = re.escape(victim_name)
    context_pattern = f'.{{0,500}}{name_pattern}.{{0,500}}'
    context_matches = re.findall(context_pattern, text, re.IGNORECASE | re.DOTALL)
    
    if not context_matches:
        return result
    
    context = ' '.join(context_matches)
    
    # Patrones de relaciones familiares
    patterns = {
        'padre': r'(?:padre|hijo de)\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+){1,3})',
        'madre': r'(?:madre|hija de)\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+){1,3})',
        'hermano': r'(?:hermano|hermana)\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+){1,3})',
        'pareja': r'(?:esposo|esposa|compañero|compañera)\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+){1,3})'
    }
    
    for relation, pattern in patterns.items():
        matches = re.findall(pattern, context, re.IGNORECASE)
        if matches:
            if relation == 'padre':
                result['nombre_padre'] = matches[0].strip()
            elif relation == 'madre':
                result['nombre_madre'] = matches[0].strip()
            elif relation == 'hermano':
                result['nombre_hermano'] = matches[0].strip()
            elif relation == 'pareja':
                result['nombre_pareja'] = matches[0].strip()
    
    return result
