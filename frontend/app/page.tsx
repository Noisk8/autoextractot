'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ProgressTracker from '@/components/ProgressTracker'
import DataTable from '@/components/DataTable'

export default function Home() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const [progress, setProgress] = useState({ stage: '', message: '', progress: 0 })
    const [victims, setVictims] = useState<any[]>([])

    const handleFileUpload = (file: File) => {
        // Generar session ID único
        const newSessionId = Date.now().toString()
        setSessionId(newSessionId)
        setIsExtracting(true)
        setVictims([])

        // Leer archivo como base64
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result?.toString().split(',')[1]

            // Conectar WebSocket
            const ws = new WebSocket(`ws://localhost:8000/ws/extract/${newSessionId}`)

            ws.onopen = () => {
                ws.send(JSON.stringify({ pdf_data: base64 }))
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)

                if (data.type === 'progress') {
                    setProgress(data.data)
                } else if (data.type === 'complete') {
                    setVictims(data.data.victims)
                    setIsExtracting(false)
                } else if (data.type === 'error') {
                    console.error('Error:', data.message)
                    setIsExtracting(false)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                setIsExtracting(false)
            }
        }

        reader.readAsDataURL(file)
    }

    const handleExport = () => {
        if (sessionId) {
            window.open(`http://localhost:8000/export/${sessionId}`, '_blank')
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Auto Extractor
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Extracción automática de datos de víctimas desde Autos judiciales de la JEP
                    </p>
                </div>

                {!isExtracting && victims.length === 0 && (
                    <FileUpload onFileSelect={handleFileUpload} />
                )}

                {isExtracting && (
                    <ProgressTracker
                        stage={progress.stage}
                        message={progress.message}
                        progress={progress.progress}
                    />
                )}

                {victims.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                {victims.length} víctimas encontradas
                            </h2>
                            <button
                                onClick={handleExport}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                📥 Descargar CSV
                            </button>
                        </div>
                        <DataTable victims={victims} />
                    </div>
                )}
            </div>
        </main>
    )
}
