from fastapi import FastAPI, WebSocket, UploadFile, File, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from models.victim import Victim, ExtractionProgress, ExtractionResult
from utils.pdf_parser import extract_text_from_pdf
from extractors.orchestrator import ExtractionOrchestrator
import json
import csv
import io
from typing import List

app = FastAPI(title="Auto Extractor API")

# CORS para permitir requests desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar el dominio exacto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Almacenamiento temporal de resultados
extraction_results: dict = {}

@app.get("/")
async def root():
    return {"message": "Auto Extractor API", "status": "running"}

@app.websocket("/ws/extract/{session_id}")
async def websocket_extract(websocket: WebSocket, session_id: str):
    """
    WebSocket para extracción con progreso en tiempo real
    """
    await websocket.accept()
    
    try:
        # Recibir archivo PDF
        data = await websocket.receive_json()
        pdf_base64 = data.get("pdf_data")
        
        if not pdf_base64:
            await websocket.send_json({
                "error": "No se recibió archivo PDF"
            })
            return
        
        # Decodificar PDF
        import base64
        pdf_bytes = base64.b64decode(pdf_base64)
        
        # Extraer texto del PDF
        text = extract_text_from_pdf(pdf_bytes)
        
        # Callback para enviar progreso
        async def progress_callback(progress: ExtractionProgress):
            await websocket.send_json({
                "type": "progress",
                "data": progress.dict()
            })
        
        # Ejecutar extracción
        orchestrator = ExtractionOrchestrator(progress_callback)
        victims = await orchestrator.extract_all(text)
        
        # Guardar resultados
        extraction_results[session_id] = victims
        
        # Enviar resultados finales
        await websocket.send_json({
            "type": "complete",
            "data": {
                "victims": [v.dict() for v in victims],
                "total_found": len(victims)
            }
        })
        
    except WebSocketDisconnect:
        print(f"Client disconnected: {session_id}")
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        await websocket.close()

@app.get("/export/{session_id}")
async def export_csv(session_id: str):
    """
    Exporta los resultados como CSV usando la plantilla de headers
    """
    victims = extraction_results.get(session_id, [])
    
    if not victims:
        return {"error": "No se encontraron resultados para esta sesión"}
    
    # Crear CSV en memoria
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Leer headers desde la plantilla
    template_path = "csv_template.csv"
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template_reader = csv.reader(f)
            headers = next(template_reader)
            writer.writerow(headers)
    except FileNotFoundError:
        # Fallback a headers por defecto si no existe la plantilla
        writer.writerow([
            "ID",
            "Nombre Completo de la Víctima",
            "Sexo",
            "Ocupación",
            "Grupo Étnico",
            "Fecha de Nacimiento",
            "Fecha de Muerte",
            "Fecha de Desaparición",
            "Lugar de Asesinato",
            "Agente/Entidad Responsable",
            "Nombre de la Madre",
            "Nombre del Padre",
            "Nombre del Hermano/a",
            "Nombre de la Pareja",
            "Alias"
        ])
    
    # Datos
    for victim in victims:
        writer.writerow([
            victim.id,
            victim.nombre_completo,
            victim.sexo or "",
            victim.ocupacion or "",
            victim.grupo_etnico or "",
            victim.fecha_nacimiento or "",
            victim.fecha_muerte or "",
            victim.fecha_desaparicion or "",
            victim.lugar_asesinato or "",
            victim.agente_responsable or "",
            victim.nombre_madre or "",
            victim.nombre_padre or "",
            victim.nombre_hermano or "",
            victim.nombre_pareja or "",
            victim.alias or ""
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=victimas_auto_{session_id}.csv"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
