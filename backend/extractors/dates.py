import re
from typing import Dict, Optional
from datetime import datetime

def extract_dates_for_victim(victim_name: str, text: str) -> Dict[str, Optional[str]]:
    """
    Extrae fechas de muerte y desaparición para una víctima específica.
    """
    result = {
        'fecha_muerte': None,
        'fecha_desaparicion': None
    }
    
    # Clean victim name and create a robust search
    # Sometimes names come with slight variations or are part of larger strings
    name_parts = victim_name.split()
    if len(name_parts) >= 2:
        # Use first and last name for generic search if it's too long
        robust_name_pattern = f"{name_parts[0]}.*?{name_parts[-1]}"
    else:
        robust_name_pattern = re.escape(victim_name)
    
    # Find context around the name, clean up newlines to prevent broken phrases
    clean_text = text.replace('-\n', '').replace('\n', ' ')
    context_pattern = f'.{{0,500}}{robust_name_pattern}.{{0,500}}'
    context_matches = re.findall(context_pattern, clean_text, re.IGNORECASE)
    
    if not context_matches:
        # Fallback to exact match if robust failed
        name_pattern = re.escape(victim_name)
        context_pattern = f'.{{0,500}}{name_pattern}.{{0,500}}'
        context_matches = re.findall(context_pattern, clean_text, re.IGNORECASE)
        
        if not context_matches:
            return result
    
    context = ' '.join(context_matches)
    
    # Patrones de fecha
    date_patterns = [
        r'(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})',
        r'(\d{1,2})-(\d{1,2})-(\d{4})',
        r'(\d{4})-(\d{1,2})-(\d{1,2})'
    ]
    
    months = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
        'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    }
    
    # Buscar fechas
    for pattern in date_patterns:
        matches = re.findall(pattern, context, re.IGNORECASE)
        if matches:
            match = matches[0]
            if len(match) == 3 and match[1].lower() in months:
                # Formato: DD de MONTH de YYYY
                day, month, year = match
                fecha = f"{day.zfill(2)}-{months[month.lower()]}-{year}"
                if not result['fecha_muerte']:
                    result['fecha_muerte'] = fecha
            break
    
    return result
