import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Auto Extractor - JEP',
    description: 'Extracción automática de datos de víctimas desde Autos judiciales',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>{children}</body>
        </html>
    )
}
