import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Envelope({ 
    initials, 
    onOpen, 
    enabled, 
    mainColor = '#C5A059', 
    onSecretUnlock,
    groomName,      // Nuevo: Nombre del novio
    brideName,      // Nuevo: Nombre de la novia
    coverImage      // Nuevo: Imagen de fondo oscura del Hero
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    
    // Estados para las nuevas interacciones
    const [sealClicks, setSealClicks] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Efecto de Paralaje (Giroscopio) y Agitar (Shake)
    useEffect(() => {
        if (!enabled || isOpen || isRemoved) return;

        // 1. Detección de movimiento (Agitar para abrir)
        const handleMotion = (event) => {
            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;

            // Calcular fuerza del movimiento (shake)
            const force = Math.abs(acceleration.x) + Math.abs(acceleration.y) + Math.abs(acceleration.z);
            if (force > 25) { // Umbral de "agite"
                handleOpen();
            }
        };

        // 2. Detección de orientación (Paralaje)
        const handleOrientation = (event) => {
            // Limitar los valores para que no rote exageradamente
            const beta = Math.min(Math.max(event.beta, -30), 30); // Eje X (Atrás/Adelante)
            const gamma = Math.min(Math.max(event.gamma, -30), 30); // Eje Y (Izquierda/Derecha)
            
            setTilt({
                x: -(gamma / 3), // Ajuste de sensibilidad
                y: (beta / 3)
            });
        };

        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('devicemotion', handleMotion);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [enabled, isOpen, isRemoved]);

    if (!enabled || isRemoved) return null;

    const handleOpen = () => {
        if (isOpen) return;

        // Feedback Sensorial
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]); // Secuencia de vibración corta
        }
        
        try {
            // Nota: Asegúrate de tener un archivo de sonido en public/sounds/paper-tear.mp3
            const audio = new Audio('/sounds/paper-tear.mp3'); 
            audio.volume = 0.5;
            audio.play().catch(() => {}); // Catch por si el navegador bloquea el autoplay sin interacción
        } catch (error) {
            console.log("Audio not supported or missing");
        }

        setIsOpen(true);
        
        // Reducimos el tiempo a 2000ms para que coincida exactamente con el final 
        // de la animación de Zoom y Desvanecimiento de la carta.
        setTimeout(() => {
            setIsRemoved(true);
            if (onOpen) onOpen();
        }, 2000); 
    };

    const handleSealClick = (e) => {
        e.stopPropagation(); // Evitar que el clic abra el sobre inmediatamente
        if (sealClicks >= 2) {
            // ¡Easter Egg Desbloqueado!
            if (navigator.vibrate) navigator.vibrate(200);
            if (onSecretUnlock) onSecretUnlock();
            else alert("🎉 ¡Encontraste el secreto de los novios!"); // Fallback si no hay prop
        } else {
            setSealClicks(prev => prev + 1);
        }
    };

    return (
        <AnimatePresence>
            {!isRemoved && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }} // Transición más rápida al salir para no entorpecer la web de fondo
                    className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#FDFBF7]"
                    style={{
                        backgroundImage: `radial-gradient(circle at center, #ffffff 0%, #FDFBF7 100%)`
                    }}
                >
                    {/* Textura de fondo sutil (Lino) */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/linen-paper.png')` }}></div>

                    {/* Contenedor Principal con Paralaje Dinámico */}
                    <motion.div
                        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 cursor-pointer perspective-2000"
                        onClick={handleOpen}
                        animate={{
                            rotateX: tilt.y,
                            rotateY: tilt.x
                        }}
                        transition={{ type: "spring", stiffness: 100, damping: 30 }}
                    >

                        {/* Sombra de profundidad */}
                        <motion.div
                            animate={{ scale: isOpen ? 1.1 : 1, opacity: isOpen ? 0 : 0.4 }} // Ocultamos la sombra al abrir
                            className="absolute w-[80%] max-w-[500px] aspect-[4/3] bg-black/20 blur-[60px] rounded-[100%] translate-y-10"
                        ></motion.div>

                        {/* EL SOBRE FISICO (Añadido 'drag' para hacer Swipe Up) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0, rotateX: 5 }}
                            animate={{ y: isOpen ? 100 : 0, opacity: isOpen ? 0 : 1, rotateX: 0 }} // El sobre cae y desaparece mientras la carta sube
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative w-full max-w-[550px] aspect-[4/3] z-10"
                            drag={!isOpen ? "y" : false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, info) => {
                                // Si arrastran hacia arriba más de 50px, abrir el sobre
                                if (info.offset.y < -50) {
                                    handleOpen();
                                }
                            }}
                        >
                            {/* Cuerpo Trasero del Sobre */}
                            <div className="absolute inset-0 bg-[#F4F1EA] shadow-xl border border-[#E8E4D9]">

                                {/* LA INVITACIÓN (CARTA QUE IMITA EL DISEÑO REAL) */}
                                <motion.div
                                    animate={{
                                        y: isOpen ? '-40%' : '5%', // Sube hasta centrarse
                                        scale: isOpen ? [0.98, 1.05, 3] : 0.98, // Efecto "Zoom in" hacia la pantalla
                                        opacity: isOpen ? [1, 1, 0] : 1, // Se vuelve transparente al final del zoom
                                        zIndex: isOpen ? 50 : 5
                                    }}
                                    transition={{ 
                                        delay: 0.4, 
                                        duration: 1.5, 
                                        times: [0, 0.6, 1], // Controla los tiempos: sube normal, luego hace zoom brutal y desaparece
                                        ease: "easeInOut" 
                                    }}
                                    className="absolute inset-x-2 top-0 h-[95%] shadow-md border border-gray-800 p-8 flex flex-col items-center justify-center text-center overflow-hidden bg-[#1a1a1a]"
                                >
                                    {/* Imagen de fondo oscura imitando el Hero Section */}
                                    {coverImage && (
                                        <img 
                                            src={coverImage} 
                                            alt="Cover" 
                                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                                        />
                                    )}
                                    
                                    {/* Contenido Dinámico */}
                                    <div className="relative z-10 flex flex-col items-center">
                                        <p className="text-[8px] uppercase tracking-[0.4em] mb-3" style={{ color: mainColor }}>
                                            Comienza nuestra aventura
                                        </p>
                                        <h2 className="text-3xl font-serif italic text-white drop-shadow-lg mb-1">
                                            {groomName || 'Juan'}
                                        </h2>
                                        <span className="text-xl font-serif italic text-white/80">&</span>
                                        <h2 className="text-3xl font-serif italic text-white drop-shadow-lg mt-1">
                                            {brideName || 'Camila'}
                                        </h2>
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
                                                onClick={handleSealClick}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 relative cursor-pointer"
                                                    style={{
                                                        backgroundColor: mainColor,
                                                        backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)`
                                                    }}
                                                >
                                                    <div className="absolute inset-1.5 rounded-full border border-white/10"></div>
                                                    <span className="text-white font-serif text-lg tracking-tighter drop-shadow-md select-none">
                                                        {initials || 'A&B'}
                                                    </span>
                                                    
                                                    {/* Indicador sutil de clics para el Easter Egg */}
                                                    {sealClicks > 0 && (
                                                        <motion.div 
                                                            initial={{ scale: 0, opacity: 0 }} 
                                                            animate={{ scale: 1, opacity: 1 }} 
                                                            className="absolute -top-2 -right-2 bg-white text-[#1A1A1A] w-5 h-5 flex items-center justify-center rounded-full text-[10px] shadow-sm font-bold"
                                                        >
                                                            {3 - sealClicks}
                                                        </motion.div>
                                                    )}
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
                                    className="absolute bottom-16 left-0 right-0 text-center z-50 px-6 pointer-events-none"
                                >
                                    <motion.p
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2.5 }}
                                        className="text-[10px] uppercase tracking-[0.6em] text-[#C5A059] font-bold mb-4 flex items-center justify-center gap-2"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7-7-7 7"/></svg>
                                        Desliza, agita o toca para abrir
                                    </motion.p>
                                    <div className="w-px h-12 bg-gradient-to-b from-[#C5A059] to-transparent mx-auto"></div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}