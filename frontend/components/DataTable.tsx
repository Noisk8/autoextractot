'use client'

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
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-gray-700/50 text-gray-300">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Nombre Completo</th>
                            <th className="px-6 py-4">Fecha Muerte</th>
                            <th className="px-6 py-4">Fecha Desaparición</th>
                            <th className="px-6 py-4">Lugar</th>
                            <th className="px-6 py-4">Agente Responsable</th>
                            <th className="px-6 py-4">Madre</th>
                            <th className="px-6 py-4">Padre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {victims.map((victim) => (
                            <tr
                                key={victim.id}
                                className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                            >
                                <td className="px-6 py-4 font-medium text-white">
                                    {victim.id}
                                </td>
                                <td className="px-6 py-4 text-white font-semibold">
                                    {victim.nombre_completo}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {victim.fecha_muerte || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {victim.fecha_desaparicion || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {victim.lugar_asesinato || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-300 text-xs">
                                    {victim.agente_responsable || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {victim.nombre_madre || '-'}
                                </td>
                                <td className="px-6 py-4 text-gray-300">
                                    {victim.nombre_padre || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
