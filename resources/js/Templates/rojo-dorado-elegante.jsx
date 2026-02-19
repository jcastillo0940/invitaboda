import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CountdownItem = ({ value, label, goldColor }) => (
    <div className="flex flex-col items-center">
        <span
            className="text-4xl md:text-6xl font-light tracking-tighter"
            style={{ color: goldColor }}
        >
            {value.toString().padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase tracking-[0.3em] mt-3 opacity-70 font-sans text-gray-300">
            {label}
        </span>
    </div>
);

export default function RojoDoradoElegante({ data, guestGroup = null }) {
    // Extracción de datos con fallbacks seguros
    // NOTA: los defaults en destructuring sólo aplican para `undefined`.
    // Si el backend envía `null` explicitamente, debemos normalizar con || después.
    const {
        primaryNames,
        date,
        location,
        locationUrl,
        reception,
        receptionUrl,
        heroImageUrl,
        heroVideoUrl,
        gallery,
        itinerary,
        showCountdown,
        mainColor,
        secondaryColor,
        quote
    } = data || {};

    // Normalización segura de todos los campos (null → fallback)
    const safeNames = primaryNames || 'Nuestra Boda';
    const safeDate = date || '2025-12-31';           // nunca null
    const safeLocation = location || 'Por confirmar';
    const safeLocationUrl = locationUrl || '#';
    const safeReception = reception || 'Por confirmar';
    const safeReceptionUrl = receptionUrl || '#';
    const safeHeroImage = heroImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2070';
    const safeVideo = heroVideoUrl || '';
    const safeGallery = gallery || [];
    const safeItinerary = itinerary || [];
    const safeCountdown = showCountdown !== false;  // undefined/null → true
    const gold = mainColor || '#D4AF37';
    const darkRed = secondaryColor || '#8B0000';
    const safeQuote = quote || 'Dos almas, un solo corazón, y una vida entera por delante.';

    // Estado del contador
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Parallax para el Hero
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);

    useEffect(() => {
        const target = new Date(safeDate).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [safeDate]);

    // Google Calendar URL — usa safeDate (nunca null)
    const safeDateCompact = safeDate.replace(/-/g, '');
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Boda+${encodeURIComponent(safeNames)}&dates=${safeDateCompact}T180000Z/${safeDateCompact}T235959Z&details=Invitación+Especial&location=${encodeURIComponent(safeLocation)}`;

    return (
        <div className="bg-[#0a0a0a] text-gray-200 font-serif overflow-x-hidden selection:bg-[#8B0000] selection:text-white">

            {/* 1. HERO SECTION - PARALLAX */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    {safeVideo ? (
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                            <source src={safeVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={safeHeroImage} alt="Wedding Hero" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]"></div>
                </motion.div>

                <div className="relative z-10 text-center px-6 mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                        <span
                            className="font-sans uppercase tracking-[0.5em] text-[10px] mb-6 block"
                            style={{ color: gold }}
                        >
                            Tenemos el honor de invitarte
                        </span>

                        <h1 className="text-5xl md:text-8xl text-white font-light leading-tight mb-8 drop-shadow-lg">
                            {safeNames.split('y').map((name, i) => (
                                <span key={i} className="block">
                                    {name.trim()}
                                    {i === 0 && (
                                        <span
                                            className="italic block text-4xl md:text-6xl my-2"
                                            style={{ color: darkRed }}
                                        >
                                            &
                                        </span>
                                    )}
                                </span>
                            ))}
                        </h1>

                        <div className="w-16 h-[1px] mx-auto mb-10" style={{ backgroundColor: gold }}></div>

                        <p className="text-white text-lg md:text-2xl tracking-[0.2em] uppercase font-light">
                            {new Date(safeDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </motion.div>
                </div>

                {/* Animated Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                >
                    <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent"></div>
                </motion.div>
            </section>

            {/* 2. COUNTDOWN SECTION */}
            {safeCountdown && (
                <section className="py-24 border-y border-white/5" style={{ backgroundColor: '#050505' }}>
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="italic text-3xl mb-12" style={{ color: darkRed }}>
                                La cuenta regresiva
                            </h3>
                            <div className="flex justify-center gap-8 md:gap-16">
                                <CountdownItem value={timeLeft.days} label="Días" goldColor={gold} />
                                <CountdownItem value={timeLeft.hours} label="Horas" goldColor={gold} />
                                <CountdownItem value={timeLeft.minutes} label="Min" goldColor={gold} />
                                <CountdownItem value={timeLeft.seconds} label="Seg" goldColor={gold} />
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* 3. QUOTE SECTION */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto mb-10" style={{ fill: darkRed, opacity: 0.5 }}>
                            <path d="M10 20H0V0H20V20L10 40H0L10 20ZM30 20H20V0H40V20L30 40H20L30 20Z" />
                        </svg>
                        <p className="text-2xl md:text-4xl italic text-gray-300 leading-relaxed font-serif">
                            "{safeQuote}"
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 4. GALLERY SECTION */}
            {safeGallery.length > 0 && (
                <section className="py-24" style={{ backgroundColor: '#050505' }}>
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-16 text-center">
                            <span className="font-sans uppercase tracking-[0.5em] text-[10px] mb-4 block" style={{ color: gold }}>
                                Memorias
                            </span>
                            <h2 className="text-4xl md:text-5xl font-light text-white">Nuestra Historia</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {safeGallery.map((url, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`relative overflow-hidden group ${i % 3 === 1 ? 'md:row-span-2' : ''}`}
                                >
                                    <img
                                        src={url}
                                        alt={`Gallery ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                        style={{ minHeight: i % 3 === 1 ? '600px' : '300px' }}
                                    />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center border-4 pointer-events-none"
                                        style={{ borderColor: darkRed }}
                                    ></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. LOCATION DETAILS */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <span className="text-[10px] uppercase tracking-[0.5em] font-sans block mb-4" style={{ color: gold }}>
                            ¿Cuándo y Dónde?
                        </span>
                        <h2 className="text-5xl font-light italic text-white">Los Detalles</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Ceremonia */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="p-10 border border-white/10 relative overflow-hidden group"
                            style={{ backgroundColor: '#080808' }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: darkRed }}></div>
                            <h4 className="text-2xl mb-4 italic text-white">Ceremonia Religiosa</h4>
                            <p className="text-gray-400 mb-8 font-sans text-sm leading-relaxed min-h-[60px]">{safeLocation}</p>
                            <div className="flex flex-wrap gap-4">
                                <a href={safeLocationUrl} target="_blank" rel="noreferrer" className="text-[10px] text-white uppercase tracking-widest border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all">Google Maps</a>
                                <a href={safeLocationUrl !== '#' ? safeLocationUrl.replace('maps', 'waze') : '#'} target="_blank" rel="noreferrer" className="text-[10px] text-white uppercase tracking-widest border border-white/20 px-6 py-3 hover:bg-[#33CCFF] hover:border-[#33CCFF] hover:text-black transition-all">Waze</a>
                            </div>
                        </motion.div>

                        {/* Recepción */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-10 border border-white/10 relative overflow-hidden group"
                            style={{ backgroundColor: '#080808' }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: gold }}></div>
                            <h4 className="text-2xl mb-4 italic text-white">Recepción</h4>
                            <p className="text-gray-400 mb-8 font-sans text-sm leading-relaxed min-h-[60px]">{safeReception}</p>
                            <div className="flex gap-4">
                                <a href={safeReceptionUrl} target="_blank" rel="noreferrer" className="text-[10px] text-white uppercase tracking-widest border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all">Cómo llegar</a>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-16 text-center">
                        <a
                            href={calendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 text-black px-10 py-5 font-sans uppercase tracking-[0.3em] text-[10px] transition-all hover:scale-105"
                            style={{ backgroundColor: gold }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Agendar en mi Calendario
                        </a>
                    </div>
                </div>
            </section>

            {/* 6. ITINERARY */}
            {safeItinerary.length > 0 && (
                <section className="py-24 px-6 border-t border-white/5" style={{ backgroundColor: '#050505' }}>
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-20">
                            <span className="text-[10px] uppercase tracking-[0.5em] block mb-4" style={{ color: darkRed }}>
                                El Camino
                            </span>
                            <h2 className="text-4xl md:text-5xl font-light italic text-white">Itinerario de Amor</h2>
                        </div>

                        <div className="space-y-12">
                            {safeItinerary.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-8 group"
                                >
                                    <div className="w-24 text-right">
                                        <span className="text-2xl font-light" style={{ color: gold }}>{item.time}</span>
                                    </div>
                                    <div className="w-3 h-3 rounded-full relative z-10" style={{ backgroundColor: darkRed }}>
                                        <div className="absolute inset-0 bg-red-900 rounded-full animate-ping opacity-20"></div>
                                    </div>
                                    <div className="flex-1 pb-8 border-b border-white/10 group-last:border-0 group-last:pb-0">
                                        <h4 className="text-xl font-light uppercase tracking-widest text-white">{item.activity}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 7. INVITADOS (Guest Group Dinámico de Invitaboda) */}
            {guestGroup && (
                <section className="py-20 px-6 border-y border-white/10" style={{ backgroundColor: '#080808' }}>
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl mb-4 font-sans uppercase tracking-[0.2em]" style={{ color: gold }}>
                            Pases reservados para:
                        </h2>
                        <h3 className="text-4xl md:text-5xl italic mb-10 text-white">
                            {guestGroup.group_name}
                        </h3>

                        <div className="p-8 border border-white/5 bg-[#0a0a0a]">
                            <p className="text-[10px] uppercase tracking-widest mb-6 text-gray-500">
                                Personas en este pase ({guestGroup.total_passes})
                            </p>
                            <ul className="space-y-4">
                                {guestGroup.members.map(m => (
                                    <li key={m.id} className="text-lg text-gray-300 font-light border-b border-white/5 pb-2 last:border-0">
                                        {m.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            {/* 8. GIFT & DRESS CODE SECTION */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 gap-8"
                    >
                        {/* Lluvia de Sobres */}
                        <div className="p-12 border border-white/10 bg-[#050505]">
                            <svg className="w-8 h-8 mx-auto mb-6" style={{ color: gold }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-2xl italic mb-4 text-white">Lluvia de Sobres</h2>
                            <p className="text-gray-400 font-sans text-sm leading-relaxed">
                                Su presencia es nuestro mayor regalo. Si desean tener un detalle adicional con nosotros, contaremos con un buzón en el evento.
                            </p>
                        </div>

                        {/* Dress Code */}
                        <div className="p-12 border border-white/10 bg-[#050505]">
                            <svg className="w-8 h-8 mx-auto mb-6" style={{ color: darkRed }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs uppercase tracking-[0.3em] font-bold block mb-4" style={{ color: gold }}>
                                Dress Code
                            </span>
                            <p className="text-2xl font-light text-white italic">Etiqueta Rigurosa</p>
                            <p className="text-gray-500 font-sans text-xs mt-4">Nos reservamos el uso del color blanco.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer space for RSVP Button in Invitation.jsx */}
            <div className="h-40"></div>

        </div>
    );
}