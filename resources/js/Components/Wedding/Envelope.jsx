import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Envelope({ initials, onOpen, enabled, mainColor = '#C5A059' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);

    if (!enabled || isRemoved) return null;

    const handleOpen = () => {
        setIsOpen(true);
        // Esperamos a que la solapa se abra y la invitación suba
        setTimeout(() => {
            setIsRemoved(true);
            if (onOpen) onOpen();
        }, 2200); // Un poco más de tiempo para apreciar la animación
    };

    return (
        <AnimatePresence>
            {!isRemoved && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#FDFBF7]"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, #ffffff 0%, #FDFBF7 100%)`
                    }}
                >
                    {/* Textura de fondo sutil (Lino) */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/linen-paper.png')` }}></div>

                    {/* Contenedor Principal */}
                    <div
                        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 cursor-pointer perspective-2000"
                        onClick={handleOpen}
                    >

                        {/* Sombra de profundidad */}
                        <motion.div
                            animate={{ scale: isOpen ? 1.1 : 1, opacity: isOpen ? 0.2 : 0.4 }}
                            className="absolute w-[80%] max-w-[500px] aspect-[4/3] bg-black/20 blur-[60px] rounded-[100%] translate-y-10"
                        ></motion.div>

                        {/* EL SOBRE FISICO */}
                        <motion.div
                            initial={{ y: 50, opacity: 0, rotateX: 5 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-full max-w-[550px] aspect-[4/3] z-10"
                        >
                            {/* Cuerpo Trasero del Sobre */}
                            <div className="absolute inset-0 bg-[#F4F1EA] shadow-xl border border-[#E8E4D9]">

                                {/* LA INVITACIÓN (CARTA) */}
                                <motion.div
                                    animate={{
                                        y: isOpen ? '-90%' : '5%',
                                        scale: isOpen ? 1.02 : 0.98,
                                        zIndex: isOpen ? 40 : 5
                                    }}
                                    transition={{ delay: 0.6, duration: 1.2, ease: "easeInOut" }}
                                    className="absolute inset-x-4 top-0 h-[90%] bg-white shadow-md border border-gray-100 p-8 flex flex-col items-center justify-start text-center"
                                >
                                    <div className="w-16 h-px bg-[#C5A059]/30 mb-6"></div>
                                    <p className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] mb-4">You are invited</p>
                                    <h2 className="text-4xl font-serif italic text-gray-800 mb-2">Our Wedding</h2>
                                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center mt-auto">
                                        <span className="text-[8px] text-gray-300">♥</span>
                                    </div>
                                </motion.div>

                                {/* Interiores - Laterales y Base */}
                                <div className="absolute inset-0 z-20 pointer-events-none">
                                    <svg className="w-full h-full" viewBox="0 0 550 412.5" preserveAspectRatio="none">
                                        {/* Laterales */}
                                        <path d="M0 0 L275 220 L0 412.5 Z" fill="#FAF8F5" stroke="#E8E4D9" strokeWidth="0.5" />
                                        <path d="M550 0 L275 220 L550 412.5 Z" fill="#FAF8F5" stroke="#E8E4D9" strokeWidth="0.5" />
                                        {/* Base inferior */}
                                        <path d="M0 412.5 L275 210 L550 412.5 Z" fill="#F4F1EA" stroke="#E8E4D9" strokeWidth="0.5" />
                                    </svg>
                                </div>

                                {/* Solapa Superior (Flap) */}
                                <motion.div
                                    animate={{
                                        rotateX: isOpen ? -175 : 0,
                                        zIndex: isOpen ? 0 : 30
                                    }}
                                    transition={{ duration: 0.9, ease: "easeInOut" }}
                                    style={{ transformOrigin: "top" }}
                                    className="absolute inset-x-0 top-0 h-[55%] pointer-events-none"
                                >
                                    <svg className="w-full h-full drop-shadow-lg" viewBox="0 0 550 226.8" preserveAspectRatio="none">
                                        <path d="M0 0 L275 226.8 L550 0 Z" fill="#F4F1EA" stroke="#E8E4D9" strokeWidth="1" />
                                    </svg>

                                    {/* Sello de Lacre */}
                                    <AnimatePresence>
                                        {!isOpen && (
                                            <motion.div
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 pointer-events-auto"
                                            >
                                                <div
                                                    className="w-full h-full rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 relative"
                                                    style={{
                                                        backgroundColor: mainColor,
                                                        backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)`
                                                    }}
                                                >
                                                    <div className="absolute inset-1.5 rounded-full border border-white/10"></div>
                                                    <span className="text-white font-serif text-lg tracking-tighter drop-shadow-md select-none">
                                                        {initials || 'A&B'}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Floating Help text */}
                        <AnimatePresence>
                            {!isOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute bottom-16 left-0 right-0 text-center z-50 px-6"
                                >
                                    <motion.p
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2.5 }}
                                        className="text-[10px] uppercase tracking-[0.6em] text-[#C5A059] font-bold mb-4"
                                    >
                                        Haz clic para abrir
                                    </motion.p>
                                    <div className="w-px h-12 bg-gradient-to-b from-[#C5A059] to-transparent mx-auto"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
