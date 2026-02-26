'use client'

import { useEffect, useRef } from 'react'
import { Terminal, CheckCircle2, XCircle, ChevronRight, Activity } from 'lucide-react'

interface LogMessage {
    id: string
    message: string
    stage: string
    timestamp: Date
}

interface ProgressTrackerProps {
    logs: LogMessage[]
    currentProgress: number
    stage: string
}

export default function ProgressTracker({ logs, currentProgress, stage }: ProgressTrackerProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    return (
        <div className="bg-[#111827] border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
            {/* Header / Traffic Lights */}
            <div className="bg-[#1F2937] border-b border-slate-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium tracking-widest text-slate-400 uppercase">
                        Motor de Extracción
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        {currentProgress < 100 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${currentProgress === 100 ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-medium">
                        {currentProgress}%
                    </span>
                </div>
            </div>

            {/* Scrollable Logs */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 font-mono text-[13px] leading-relaxed space-y-3 bg-[#030712] relative"
            >
                {logs.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <Activity className="w-8 h-8 mb-3 opacity-20" />
                        <p>A la espera del documento PDF...</p>
                    </div>
                )}

                {logs.map((log) => {
                    const isError = log.stage === 'error'
                    const isSuccess = log.stage === 'complete' || log.stage === 'success'

                    return (
                        <div key={log.id} className="flex items-start gap-3 animate-fade-in group">
                            <span className="text-slate-600 flex-shrink-0 mt-0.5">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <span className="flex-shrink-0 mt-0.5">
                                {isError ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                ) : isSuccess ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-blue-500" />
                                )}
                            </span>
                            <span className={`flex-1 break-words ${isError ? 'text-red-400 font-semibold' : isSuccess ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>
                                {log.message}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Progress Bar Footer */}
            <div className="bg-[#1F2937] p-4 border-t border-slate-700">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">
                        {currentProgress === 100 ? 'Proceso finalizado' : 'Progreso Actual'}
                    </span>
                    <span className="text-xs font-semibold text-blue-400">STATUS {currentProgress === 100 ? 'OK' : 'SYS'}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ease-out rounded-full ${currentProgress === 100 ? 'bg-blue-500' : 'bg-blue-500'}`}
                        style={{ width: `${currentProgress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
