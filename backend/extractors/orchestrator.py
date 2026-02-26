from typing import List, Callable
from models.victim import Victim, ExtractionProgress
from extractors.names import extract_victim_names
from extractors.dates import extract_dates_for_victim
from extractors.locations import extract_location_for_victim
from extractors.families import extract_family_for_victim
import asyncio
import os

class ExtractionOrchestrator:
    """
    Coordina la extracción de datos y envía actualizaciones de progreso.
    Ahora con soporte híbrido: Regex + Gemini AI (si está disponible)
    """
    
    def __init__(self, progress_callback: Callable[[ExtractionProgress], None] = None):
        self.progress_callback = progress_callback
    
    async def send_progress(self, stage: str, message: str, progress: int):
        if self.progress_callback:
            await self.progress_callback(ExtractionProgress(
                stage=stage,
                message=message,
                progress=progress
            ))
    
    async def extract_all(self, text: str) -> List[Victim]:
        victims = []
        
        # Paso 1: Extracción inicial de candidatos (Regex)
        await self.send_progress("names", "📄 Procesando documento PDF y buscando candidatos...", 10)
        
        async def name_progress(p: int):
            await self.send_progress("names", f"👥 Buscando nombres (Fase 1: Motor Regex activo)... {p}%", 10 + int(p * 0.3))
        
        # Regex encuentra candidatos (incluyendo falsos positivos)
        candidates = await extract_victim_names(text, name_progress)
        
        total_candidates = len(candidates)
        if total_candidates == 0:
            await self.send_progress("error", "❌ No se encontraron candidatos en el documento", 100)
            return []
            
        final_names = candidates
        total_names = len(final_names)
        await self.send_progress("names", f"✅ Se estructuraron {total_names} menciones", 45)
        
        # Paso 3: Completar datos adicionales mediante Regex detallado
        for idx, name in enumerate(final_names):
            progress = 45 + int((idx / total_names) * 50)
            
            if idx % 15 == 0 or idx == total_names - 1:
                await self.send_progress(
                    "extracting",
                    f"🔍 Tabulando datos ({idx + 1}/{total_names}): {name}",
                    progress
                )
            
            # Use small sleeps to allow websocket to flush messages
            if idx % 50 == 0:
                await asyncio.sleep(0.01)
            
            victim = Victim(id=idx + 1, nombre_completo=name)
            
            # Fechas (Regex)
            dates = extract_dates_for_victim(name, text)
            victim.fecha_muerte = dates.get('fecha_muerte')
            victim.fecha_desaparicion = dates.get('fecha_desaparicion')
            
            # Lugar (Regex)
            victim.lugar_asesinato = extract_location_for_victim(name, text)
            
            # Agente Responsable (No soportado nativamente por Regex básico, requiere AI)
            victim.agente_responsable = None 
            
            # Familia (Regex)
            family = extract_family_for_victim(name, text)
            victim.nombre_madre = family.get('nombre_madre')
            victim.nombre_padre = family.get('nombre_padre')
            
            victims.append(victim)
        
        await self.send_progress("complete", "✅ Extracción completada al 100%", 100)
        return victims
