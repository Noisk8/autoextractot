'use client'

import { motion } from 'framer-motion'

interface ExtractionAnimationProps {
    stage: string
    message: string
    progress: number
}

export default function ExtractionAnimation({ stage, message, progress }: ExtractionAnimationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl mx-auto"
        >
            {/* Animated background */}
            <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 shadow-2xl">
                {/* Animated circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [360, 180, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
                    />
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                y: [0, -100, 0],
                                x: [0, Math.random() * 50 - 25, 0],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: "easeInOut"
                            }}
                            className="absolute w-2 h-2 bg-indigo-400 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Central content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center space-y-6 bg-black/30 backdrop-blur-md px-10 py-8 rounded-2xl border border-white/10"
                    >
                        {/* Spinning loader */}
                        <div className="flex items-center justify-center space-x-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
                            />
                            <h3 className="text-3xl font-bold text-white">
                                Extrayendo Datos
                            </h3>
                        </div>

                        <p className="text-indigo-200 text-xl font-medium">
                            {message || 'Procesando Auto...'}
                        </p>

                        {/* Progress bar */}
                        <div className="w-96 h-4 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                <motion.div
                                    animate={{ x: ['0%', '100%'] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                />
                            </motion.div>
                        </div>

                        <div className="flex items-center justify-between w-96 text-sm">
                            <span className="text-indigo-300 font-bold text-lg">{progress}%</span>
                            <span className="text-gray-400 font-medium">{stage}</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Status indicators */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 grid grid-cols-3 gap-6"
            >
                {[
                    { label: 'Nombres', icon: '👥', active: progress >= 20 },
                    { label: 'Fechas', icon: '📅', active: progress >= 50 },
                    { label: 'Ubicaciones', icon: '📍', active: progress >= 80 }
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-500 ${item.active
                                ? 'bg-indigo-500/20 border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105'
                                : 'bg-gray-800/30 border-gray-700'
                            }`}
                    >
                        <div className="text-center">
                            <motion.div
                                animate={item.active ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.5 }}
                                className="text-4xl mb-3"
                            >
                                {item.icon}
                            </motion.div>
                            <div className={`text-base font-bold ${item.active ? 'text-indigo-300' : 'text-gray-500'
                                }`}>
                                {item.label}
                            </div>
                            {item.active && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="mt-2 text-green-400 text-sm font-semibold"
                                >
                                    ✓ Completado
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}
