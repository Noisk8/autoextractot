'use client'

import { useState } from 'react'
import { UploadCloud } from 'lucide-react'

interface FileUploadProps {
    onFileSelect: (file: File) => void
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true)
        } else if (e.type === 'dragleave') {
            setIsDragging(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files[0]) {
            const isValid = files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf')
            if (isValid) {
                onFileSelect(files[0])
            } else {
                alert('Por favor, sube únicamente un archivo PDF.')
            }
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0])
        }
    }

    return (
        <div className="w-full">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`transition-all duration-300 relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer 
                    ${isDragging
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                        : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500 hover:shadow-lg'
                    }`}
            >
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-6">
                    <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
                        <UploadCloud className="w-12 h-12" />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-100">
                            {isDragging ? 'SUELTA EL DOCUMENTO AQUÍ' : 'Sube tu archivo PDF'}
                        </h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Arrastra y suelta el documento oficial (Auto) para comenzar el proceso de extracción estructurada.
                        </p>
                    </div>

                    <div>
                        <label className="inline-flex cursor-pointer">
                            <span className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2.5 px-6 rounded-lg transition-colors border border-slate-600">
                                Explorar archivos
                            </span>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-[11px] font-semibold tracking-wider text-slate-500 uppercase pt-4">
                        <span>Extracción Privada</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span>Revisado Offline</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
