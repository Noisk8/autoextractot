import re
from typing import List, Tuple

def extract_victim_names(text: str) -> List[str]:
    """
    Extrae nombres de víctimas del texto del Auto.
    Busca patrones como listas de nombres completos.
    """
    names = []
    
    # Patrón 1: Nombres en listas (Nombre Apellido Apellido)
    # Busca nombres que aparecen en contexto de víctimas
    pattern = r'\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,4})\b'
    
    # Buscar en secciones relevantes
    victim_sections = re.findall(
        r'(?:víctima|asesinato|muerte|ejecutado|desaparición).*?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){2,4})',
        text,
        re.IGNORECASE
    )
    
    for match in victim_sections:
        name = match.strip()
        if len(name.split()) >= 3 and name not in names:
            names.append(name)
    
    return names[:200]  # Limitar a 200 nombres para evitar falsos positivos
