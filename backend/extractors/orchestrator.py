from typing import List, Callable
from models.victim import Victim, ExtractionProgress
from extractors.names import extract_victim_names
from extractors.dates import extract_dates_for_victim
from extractors.locations import extract_location_for_victim
from extractors.families import extract_family_for_victim
import asyncio

class ExtractionOrchestrator:
    """
    Coordina la extracción de datos y envía actualizaciones de progreso.
    """
    
    def __init__(self, progress_callback: Callable[[ExtractionProgress], None] = None):
        self.progress_callback = progress_callback
    
    async def send_progress(self, stage: str, message: str, progress: int):
        """Envía actualización de progreso vía callback"""
        if self.progress_callback:
            await self.progress_callback(ExtractionProgress(
                stage=stage,
                message=message,
                progress=progress
            ))
    
    async def extract_all(self, text: str) -> List[Victim]:
        """
        Extrae todos los datos del texto del Auto.
        """
        victims = []
        
        # Paso 1: Extraer nombres
        await self.send_progress("names", "📄 Procesando PDF...", 10)
        await asyncio.sleep(0.5)  # Simular procesamiento
        
        await self.send_progress("names", "👥 Extrayendo nombres de víctimas...", 20)
        names = extract_victim_names(text)
        await asyncio.sleep(0.5)
        
        total_names = len(names)
        if total_names == 0:
            await self.send_progress("error", "❌ No se encontraron víctimas", 100)
            return []
        
        # Paso 2: Extraer datos para cada víctima
        for idx, name in enumerate(names):
            progress = 20 + int((idx / total_names) * 60)
            
            if idx % 5 == 0:  # Actualizar cada 5 víctimas
                await self.send_progress(
                    "extracting",
                    f"🔍 Extrayendo datos ({idx + 1}/{total_names})...",
                    progress
                )
            
            victim = Victim(
                id=idx + 1,
                nombre_completo=name
            )
            
            # Extraer fechas
            dates = extract_dates_for_victim(name, text)
            victim.fecha_muerte = dates.get('fecha_muerte')
            victim.fecha_desaparicion = dates.get('fecha_desaparicion')
            
            # Extraer ubicación
            location = extract_location_for_victim(name, text)
            victim.lugar_asesinato = location
            
            # Extraer familia
            family = extract_family_for_victim(name, text)
            victim.nombre_madre = family.get('nombre_madre')
            victim.nombre_padre = family.get('nombre_padre')
            victim.nombre_hermano = family.get('nombre_hermano')
            victim.nombre_pareja = family.get('nombre_pareja')
            
            victims.append(victim)
        
        await self.send_progress("complete", "✅ Extracción completada", 100)
        return victims
