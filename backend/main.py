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

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Recibe el PDF vía HTTP POST tradicional (evita caídas por tamaño de payload en WebSockets).
    Devuelve un session_id para conectarse al WebSocket y recibir el progreso.
    """
    import time
    session_id = str(int(time.time() * 1000))
    
    # Leer archivo completo a memoria localmente
    content = await file.read()
    
    # Podríamos guardar el archivo temporalmente, pero para un uso stand-alone de un solo usuario, 
    # podemos guardarlo en un dict global temporal 
    # (En producción real usaría redis o almacenamiento temporal de archivos)
    global pdf_store
    if 'pdf_store' not in globals():
        globals()['pdf_store'] = {}
        
    pdf_store[session_id] = content
    
    import sys
    sys.stdout.write(f"File {file.filename} uploaded with session {session_id}, size: {len(content)} bytes\n")
    sys.stdout.flush()
    return {"session_id": session_id, "filename": file.filename}

@app.websocket("/ws/extract/{session_id}")
async def websocket_extract(websocket: WebSocket, session_id: str):
    """
    WebSocket EXCLUSIVO para progreso y extracción (no transfiere archivos pesados).
    """
    await websocket.accept()
    print(f"WebSocket accepted for session: {session_id}")
    
    try:
        global pdf_store
        if 'pdf_store' not in globals() or session_id not in pdf_store:
            await websocket.send_json({"error": "No se encontró el archivo PDF para esta sesión"})
            await websocket.close()
            return

        pdf_bytes = pdf_store[session_id]
        
        # Enviar un mensaje inicial
        await websocket.send_json({"type": "progress", "data": {"stage": "upload", "message": "📥 Archivo recuperado de la memoria del servidor...", "progress": 5}})
        
        # Extraer texto del PDF
        print(f"Extracting text from PDF for session {session_id}")
        text = extract_text_from_pdf(pdf_bytes)
        
        # Limpiar memoria
        del pdf_store[session_id]
        
        # Callback para enviar progreso
        async def progress_callback(progress: ExtractionProgress):
            await websocket.send_json({
                "type": "progress",
                "data": progress.model_dump()
            })
        
        # Callback para enviar lotes de víctimas en tiempo real (streaming)
        all_victims_accumulated = []
        async def batch_callback(batch: list, processed: int, total: int, is_last: bool):
            all_victims_accumulated.extend(batch)
            await websocket.send_json({
                "type": "partial_result",
                "data": {
                    "victims": batch,
                    "processed": processed,
                    "total": total
                }
            })
        
        # Ejecutar extracción con streaming de lotes
        orchestrator = ExtractionOrchestrator(progress_callback, batch_callback)
        victims = await orchestrator.extract_all(text)
        
        # Guardar resultados para exportación CSV
        extraction_results[session_id] = victims
        
        # Enviar señal de completado (sin re-enviar todas las víctimas, ya llegaron en parciales)
        await websocket.send_json({
            "type": "complete",
            "data": {
                "total_found": len(victims)
            }
        })
        
    except WebSocketDisconnect:
        print(f"Client disconnected: {session_id}")
    except Exception as e:
        print(f"Error in websocket: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass



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
    # Configurar tamaño máximo de mensaje WebSocket para PDFs grandes (50MB) 
    # y evitar timeouts durante el parsing Base64 pesado inicial.
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        ws_max_size=52428800,  # 50 MB en bytes
        timeout_keep_alive=120,
        ws_ping_interval=60.0,
        ws_ping_timeout=60.0
    )
