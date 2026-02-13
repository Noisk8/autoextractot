'use client'

import { useState } from 'react'

interface FileUploadProps {
    onFileSelect: (file: File) => void
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file && file.type === 'application/pdf') {
            onFileSelect(file)
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onFileSelect(file)
        }
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        border-4 border-dashed rounded-2xl p-16 text-center transition-all
        ${isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }
      `}
        >
            <div className="space-y-6">
                <div className="text-6xl">📄</div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Arrastra tu Auto aquí
                    </h3>
                    <p className="text-gray-400">
                        o haz clic para seleccionar un archivo PDF
                    </p>
                </div>
                <label className="inline-block">
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <span className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer inline-block transition-colors">
                        Seleccionar PDF
                    </span>
                </label>
            </div>
        </div>
    )
}
