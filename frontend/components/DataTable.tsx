'use client'

import { MapPin, Calendar, User, Contact } from 'lucide-react'

interface Victim {
    id: number
    nombre_completo: string
    sexo?: string
    ocupacion?: string
    grupo_etnico?: string
    fecha_nacimiento?: string
    fecha_muerte?: string
    fecha_desaparicion?: string
    lugar_asesinato?: string
    agente_responsable?: string
    nombre_madre?: string
    nombre_padre?: string
    nombre_hermano?: string
    nombre_pareja?: string
    alias?: string
}

interface DataTableProps {
    victims: Victim[]
}

export default function DataTable({ victims }: DataTableProps) {
    if (!victims || victims.length === 0) return null

    return (
        <div className="h-full overflow-hidden flex flex-col bg-[#1E293B]">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-[#0F172A] z-10 box-border">
                        <tr>
                            <th className="px-5 py-3 text-xs font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-700">#</th>
                            <th className="px-5 py-3 text-xs font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-700">Víctima</th>
                            <th className="px-5 py-3 text-xs font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-700">Fechas</th>
                            <th className="px-5 py-3 text-xs font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-700">Operación / Imputado</th>
                            <th className="px-5 py-3 text-xs font-semibold text-slate-400 tracking-wider uppercase border-b border-slate-700">Familia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {victims.map((v, i) => (
                            <tr key={v.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="px-5 py-4 text-sm text-slate-500 font-mono align-top">
                                    {(i + 1).toString().padStart(3, '0')}
                                </td>
                                <td className="px-5 py-4 align-top">
                                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                                        <User className="w-4 h-4 text-blue-400 opacity-50" />
                                        {v.nombre_completo}
                                    </div>
                                    {v.alias && (
                                        <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-medium tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
                                            Alias: {v.alias}
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-4 align-top text-sm">
                                    <div className="space-y-1.5">
                                        {v.fecha_muerte && (
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 relative flex-shrink-0" />
                                                <span className="font-medium text-slate-200">M: {v.fecha_muerte}</span>
                                            </div>
                                        )}
                                        {v.fecha_desaparicion && (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 relative flex-shrink-0" />
                                                <span>D: {v.fecha_desaparicion}</span>
                                            </div>
                                        )}
                                        {!v.fecha_muerte && !v.fecha_desaparicion && (
                                            <span className="text-slate-600 italic">No especificada</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-5 py-4 align-top text-sm space-y-2">
                                    {v.lugar_asesinato && (
                                        <div className="flex items-start gap-1.5 text-slate-300">
                                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                            <span>{v.lugar_asesinato}</span>
                                        </div>
                                    )}
                                    {v.agente_responsable && (
                                        <div className="flex items-start gap-1.5 text-slate-400 text-xs">
                                            <ShieldCheck className="w-3.5 h-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                                            <span>{v.agente_responsable}</span>
                                        </div>
                                    )}
                                    {!v.lugar_asesinato && !v.agente_responsable && (
                                        <span className="text-slate-600 italic">Datos insuficientes</span>
                                    )}
                                </td>
                                <td className="px-5 py-4 align-top text-sm">
                                    <div className="space-y-1">
                                        {v.nombre_madre && <div className="text-slate-300 flex items-center gap-1"><span className="text-slate-500 font-medium">M:</span> {v.nombre_madre}</div>}
                                        {v.nombre_padre && <div className="text-slate-300 flex items-center gap-1"><span className="text-slate-500 font-medium">P:</span> {v.nombre_padre}</div>}
                                        {v.nombre_hermano && <div className="text-slate-400 flex items-center gap-1"><span className="text-slate-600 font-medium">H:</span> {v.nombre_hermano}</div>}
                                        {v.nombre_pareja && <div className="text-slate-400 flex items-center gap-1"><span className="text-slate-600 font-medium">C:</span> {v.nombre_pareja}</div>}
                                        {!v.nombre_madre && !v.nombre_padre && !v.nombre_hermano && !v.nombre_pareja && (
                                            <span className="text-slate-600 italic">Sin registros</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-[#0F172A] p-2 text-center border-t border-slate-700">
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    Fin del reporte — {victims.length} registros estructurados
                </span>
            </div>
        </div>
    )
}
