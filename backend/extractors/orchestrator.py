from typing import List, Callable
from models.victim import Victim, ExtractionProgress
from extractors.names import extract_victim_names
from extractors.dates import extract_dates_for_victim
from extractors.locations import extract_location_for_victim
from extractors.families import extract_family_for_victim
import asyncio

BATCH_SIZE = 20  # Enviar al frontend cada N víctimas procesadas

class ExtractionOrchestrator:
    """
    Coordina la extracción de datos y envía actualizaciones de progreso.
    Usa streaming: envía lotes de víctimas al frontend en tiempo real.
    """
    
    def __init__(self, progress_callback: Callable = None, batch_callback: Callable = None):
        self.progress_callback = progress_callback
        self.batch_callback = batch_callback  # Callback para enviar lotes de víctimas
    
    async def send_progress(self, stage: str, message: str, progress: int):
        if self.progress_callback:
            await self.progress_callback(ExtractionProgress(
                stage=stage,
                message=message,
                progress=progress
            ))
    
    async def extract_all(self, text: str) -> List[Victim]:
        all_victims = []
        
        # Paso 1: Extracción inicial de candidatos (Regex)
        await self.send_progress("names", "📄 Procesando documento PDF y buscando candidatos...", 10)
        
        async def name_progress(p: int):
            await self.send_progress("names", f"👥 Buscando nombres (Fase 1: Motor Regex activo)... {p}%", 10 + int(p * 0.3))
        
        candidates = await extract_victim_names(text, name_progress)
        
        total_names = len(candidates)
        if total_names == 0:
            await self.send_progress("error", "❌ No se encontraron candidatos en el documento", 100)
            return []
            
        await self.send_progress("names", f"✅ Se estructuraron {total_names} menciones", 45)
        
        # Paso 2: Extracción detallada con streaming por lotes
        batch = []
        
        for idx, name in enumerate(candidates):
            progress = 45 + int((idx / total_names) * 50)
            
            # Ceder el event loop en cada víctima para que WebSocket fluya
            await asyncio.sleep(0)
            
            # Reportar progreso cada 25 víctimas
            if idx % 25 == 0 or idx == total_names - 1:
                await self.send_progress(
                    "extracting",
                    f"🔍 Tabulando datos ({idx + 1}/{total_names}): {name}",
                    progress
                )
            
            # Extraer datos
            victim = Victim(id=idx + 1, nombre_completo=name)
            
            dates = extract_dates_for_victim(name, text)
            victim.fecha_muerte = dates.get('fecha_muerte')
            victim.fecha_desaparicion = dates.get('fecha_desaparicion')
            
            victim.lugar_asesinato = extract_location_for_victim(name, text)
            victim.agente_responsable = None
            
            family = extract_family_for_victim(name, text)
            victim.nombre_madre = family.get('nombre_madre')
            victim.nombre_padre = family.get('nombre_padre')
            
            batch.append(victim)
            all_victims.append(victim)
            
            # Enviar lote cuando llega al tamaño objetivo o es el último
            is_last = (idx == total_names - 1)
            if len(batch) >= BATCH_SIZE or is_last:
                if self.batch_callback:
                    await self.batch_callback([v.dict() for v in batch], idx + 1, total_names, is_last)
                batch = []
        
        await self.send_progress("complete", "✅ Extracción completada al 100%", 100)
        return all_victims
