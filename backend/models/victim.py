from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class Victim(BaseModel):
    id: int
    nombre_completo: str
    sexo: Optional[str] = None
    ocupacion: Optional[str] = None
    grupo_etnico: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    fecha_muerte: Optional[str] = None
    fecha_desaparicion: Optional[str] = None
    lugar_asesinato: Optional[str] = None
    agente_responsable: Optional[str] = None
    nombre_madre: Optional[str] = None
    nombre_padre: Optional[str] = None
    nombre_hermano: Optional[str] = None
    nombre_pareja: Optional[str] = None
    alias: Optional[str] = None

class ExtractionProgress(BaseModel):
    stage: str
    message: str
    progress: int  # 0-100
    
class ExtractionResult(BaseModel):
    victims: List[Victim]
    total_found: int
