import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Auto Extractor AI',
    description: 'Procesamiento de Autos judiciales automátizado bajo estrictos parámetros Regex locales.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className="dark">
            <body className="antialiased min-h-screen bg-[#0F172A] selection:bg-blue-500/30">
                {children}
            </body>
        </html>
    )
}
