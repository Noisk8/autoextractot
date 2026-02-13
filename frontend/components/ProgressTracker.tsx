'use client'

interface ProgressTrackerProps {
    stage: string
    message: string
    progress: number
}

export default function ProgressTracker({ stage, message, progress }: ProgressTrackerProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">⚙️</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Procesando Auto...
                    </h3>
                    <p className="text-gray-300 text-lg">
                        {message}
                    </p>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="text-center text-gray-400 font-mono">
                    {progress}%
                </div>
            </div>
        </div>
    )
}
