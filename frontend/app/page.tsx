'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Database, ShieldCheck, Download, Bot, Search, FileSearch } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import ProgressTracker from '@/components/ProgressTracker'
import DataTable from '@/components/DataTable'

interface LogMessage {
    id: string
    message: string
    stage: string
    timestamp: Date
}

export default function Home() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const [progress, setProgress] = useState({ stage: 'start', message: '', progress: 0 })
    const [logs, setLogs] = useState<LogMessage[]>([])
    const [victims, setVictims] = useState<any[]>([])

    const addLog = (message: string, stage: string) => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            message,
            stage,
            timestamp: new Date()
        }])
    }

    const handleFileUpload = async (file: File) => {
        setIsExtracting(true)
        setVictims([])
        setLogs([])
        setProgress({ stage: 'start', message: '', progress: 0 })
        addLog(`Preparando archivo para transferencia: ${file.name}`, 'start')

        try {
            // Fase 1: Enviar archivo pesado por HTTP POST normal (multipart formData)
            const formData = new FormData()
            formData.append('file', file)

            addLog('Subiendo PDF al servidor backend...', 'upload')

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Error al subir el archivo al servidor. Verifica que el backend esté corriendo.')
            }

            const data = await response.json()
            const newSessionId = data.session_id
            setSessionId(newSessionId)

            addLog(`PDF transferido con éxito. ID de Sesión de Extracción: ${newSessionId}`, 'connection')

            // Fase 2: Conectar al WebSocket para iniciar la extracción en segundo plano y recibir eventos
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const ws = new WebSocket(`${protocol}//${window.location.host}/api/ws/extract/${newSessionId}`)

            ws.onopen = () => {
                addLog('Conexión Tcp en tiempo real establecida. Iniciando Motor.', 'connection')
            }

            ws.onmessage = (event) => {
                const messageData = JSON.parse(event.data)

                if (messageData.type === 'progress') {
                    setProgress(messageData.data)
                    addLog(messageData.data.message, messageData.data.stage)
                } else if (messageData.type === 'partial_result') {
                    // Acumular víctimas en tiempo real conforme llegan los lotes
                    setVictims(prev => [...prev, ...messageData.data.victims])
                } else if (messageData.type === 'complete') {
                    addLog(`Proceso completado. Se tabularon estructuralmente ${messageData.data.total_found} víctimas.`, 'complete')
                    setIsExtracting(false)
                    ws.close()
                } else if (messageData.type === 'error') {
                    console.error('Error del servidor:', messageData.message)
                    addLog(`Error fatal del motor REST: ${messageData.message}`, 'error')
                    setIsExtracting(false)
                    ws.close()
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                addLog('Error de comunicación persistente con el motor Local', 'error')
                setIsExtracting(false)
            }

            ws.onclose = () => {
                if (isExtracting) {
                    // Solo registrar desconexiones extrañas si la UI sigue en loading
                    console.log('El socket se cerró en pleno proceso.')
                }
            }

        } catch (err: any) {
            console.error('Upload error:', err)
            addLog(`Error de Red: ${err.message}`, 'error')
            setIsExtracting(false)
        }
    }

    const handleExport = () => {
        if (sessionId) {
            window.open(`/api/export/${sessionId}`, '_blank')
        }
    }

    const handleReset = () => {
        setSessionId(null)
        setIsExtracting(false)
        setVictims([])
        setLogs([])
        setProgress({ stage: 'start', message: '', progress: 0 })
    }

    return (
        <main className="min-h-screen bg-[#0F172A] text-slate-50 flex flex-col font-sans">
            {/* Navbar */}
            <header className="border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleReset}>
                        <div className="w-8 h-8 rounded-lg bg-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-white">Auto Extractor <span className="text-blue-400">AI</span></h1>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 w-fit text-slate-300">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs tracking-wide">REGEX LOCAL MODE</span>
                        </div>
                        <div className="text-slate-400">JEP / UBPD</div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column (Upload & Progress) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {!isExtracting && victims.length === 0 && (
                            <div className="mb-2">
                                <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                                    Extracción Masiva<br />de Datos
                                </h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Procesa Autos judiciales automáticamente utilizando expresiones regulares de alta precisión. La información nunca abandona tu dispositivo.
                                </p>
                            </div>
                        )}

                        {!isExtracting && victims.length === 0 && logs.length === 0 && (
                            <FileUpload onFileSelect={handleFileUpload} />
                        )}

                        {(isExtracting || victims.length > 0 || logs.length > 0) && (
                            <ProgressTracker
                                logs={logs}
                                currentProgress={progress.progress}
                                stage={progress.stage}
                            />
                        )}
                    </div>

                    {/* Right Column (Results & Placeholder) */}
                    <div className="lg:col-span-8 flex flex-col">
                        {victims.length > 0 ? (
                            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col flex-grow animate-slide-up">
                                <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Database className="w-6 h-6 text-blue-400" />
                                            {victims.length} Menciones Extraídas
                                            {isExtracting && (
                                                <span className="text-sm font-normal text-blue-400 animate-pulse ml-2">
                                                    ● procesando...
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {isExtracting
                                                ? 'Recibiendo datos en tiempo real. El CSV estará listo al terminar.'
                                                : 'Registros parseados y tabulados correctamente.'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleExport}
                                        disabled={isExtracting}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 flex-shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Descargar CSV</span>
                                    </button>
                                </div>
                                <div className="flex-1 p-0 overflow-hidden">
                                    <DataTable victims={victims} />
                                </div>
                            </div>
                        ) : (
                            !isExtracting ? (
                                /* Idle Placeholder */
                                <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[500px] border border-dashed border-slate-700/50 bg-slate-800/20 rounded-2xl p-12 text-center">
                                    <FileSearch className="w-16 h-16 text-slate-700 mb-6" />
                                    <h3 className="text-xl font-medium text-slate-400 mb-2">Ingresa un documento para iniciar</h3>
                                    <p className="text-slate-500 max-w-sm">Los resultados del parsing, fechas, locaciones y nexos familiares aparecerán tabulados en esta sección.</p>
                                </div>
                            ) : (
                                /* Extracting Status Box */
                                <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[500px] border border-slate-700/50 bg-slate-800/40 rounded-2xl p-12 text-center animate-pulse-slow">
                                    <div className="relative mb-6">
                                        <Search className="w-16 h-16 text-blue-500" />
                                        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/20 blur-xl rounded-full" />
                                    </div>
                                    <h3 className="text-xl font-medium text-blue-300 mb-2">Parsing Engine Activo...</h3>
                                    <p className="text-slate-400 max-w-sm">
                                        Aplicando reglas Regex sobre el PDF. Esto puede tomar algunos segundos.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
