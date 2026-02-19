import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CountdownItem = ({ value, label, mainColor }) => (
    <div className="flex flex-col items-center">
        <span
            className="text-4xl md:text-6xl font-serif italic tracking-tighter"
            style={{ color: mainColor }}
        >
            {value.toString().padStart(2, '0')}
        </span>
        <span className="text-[9px] uppercase tracking-[0.3em] mt-3 font-sans text-[#5A4634]/60">
            {label}
        </span>
    </div>
);

export default function BohoChic({ data, guestGroup = null }) {
    // Extracción de datos con fallbacks seguros
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
    const safeNames = primaryNames || 'Sofía y Mateo';
    const safeDate = date || '2026-11-15';
    const safeLocation = location || 'Jardín Botánico';
    const safeLocationUrl = locationUrl || '#';
    const safeReception = reception || 'Hacienda La Pampa';
    const safeReceptionUrl = receptionUrl || '#';
    const safeHeroImage = heroImageUrl || 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=2070'; // Boda boho/luces
    const safeVideo = heroVideoUrl || '';
    const safeGallery = gallery || [];
    const safeItinerary = itinerary || [];
    const safeCountdown = showCountdown !== false;

    // Paleta Boho: Terracota y Verde Oliva
    const terracotta = mainColor || '#C17767';
    const oliveGreen = secondaryColor || '#8A9A5B';
    const safeQuote = quote || 'Dos espíritus libres que encontraron su hogar el uno en el otro.';

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

    // Google Calendar URL
    const safeDateCompact = safeDate.replace(/-/g, '');
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Boda+${encodeURIComponent(safeNames)}&dates=${safeDateCompact}T180000Z/${safeDateCompact}T235959Z&details=Invitación+Especial&location=${encodeURIComponent(safeLocation)}`;

    return (
        <div className="bg-[#FDFBF7] text-[#5A4634] font-serif overflow-x-hidden selection:bg-[#C17767] selection:text-white">

            {/* 1. HERO SECTION - PARALLAX CON ARCO BOHO */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center p-6">
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 opacity-50">
                    {safeVideo ? (
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                            <source src={safeVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={safeHeroImage} alt="Wedding Hero" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-[#FDFBF7]/30"></div>
                </motion.div>

                <div className="relative z-10 text-center w-full max-w-lg mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-[#FDFBF7]/80 backdrop-blur-md p-10 md:p-14 rounded-t-full rounded-b-2xl border border-[#5A4634]/10 shadow-xl relative"
                    >
                        {/* Detalle geométrico superior */}
                        <div className="absolute top-6 left-1/2 -translate-x-1/2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={terracotta} strokeWidth="1">
                                <polygon points="12 2 22 8.5 22 19.5 12 26 2 19.5 2 8.5 12 2" />
                            </svg>
                        </div>

                        <span className="font-sans uppercase tracking-[0.4em] text-[9px] mb-8 block mt-6 text-[#5A4634]/70">
                            Celebra con nosotros
                        </span>

                        <h1 className="text-5xl md:text-7xl font-serif italic mb-8" style={{ color: terracotta }}>
                            {safeNames.split('y').map((name, i) => (
                                <span key={i} className="block leading-tight">
                                    {name.trim()}
                                    {i === 0 && (
                                        <span className="block text-3xl md:text-4xl my-2 font-light" style={{ color: oliveGreen }}>
                                            &
                                        </span>
                                    )}
                                </span>
                            ))}
                        </h1>

                        <div className="w-12 h-[1px] mx-auto mb-8" style={{ backgroundColor: oliveGreen }}></div>

                        <p className="text-[#5A4634] text-sm md:text-base tracking-[0.2em] uppercase font-sans">
                            {new Date(safeDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 2. COUNTDOWN SECTION */}
            {safeCountdown && (
                <section className="py-24 bg-[#F8F4EE]">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="font-sans uppercase tracking-[0.3em] text-[10px] mb-12 text-[#5A4634]/60">
                                La magia comienza en
                            </h3>
                            <div className="flex justify-center gap-6 md:gap-16">
                                <CountdownItem value={timeLeft.days} label="Días" mainColor={terracotta} />
                                <CountdownItem value={timeLeft.hours} label="Horas" mainColor={terracotta} />
                                <CountdownItem value={timeLeft.minutes} label="Min" mainColor={terracotta} />
                                <CountdownItem value={timeLeft.seconds} label="Seg" mainColor={terracotta} />
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* 3. QUOTE SECTION (Estilo Botánico) */}
            <section className="py-32 px-6">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                    >
                        {/* SVG Rama botánica */}
                        <svg className="w-16 h-16 mx-auto mb-8 opacity-60" viewBox="0 0 24 24" fill="none" stroke={oliveGreen} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22v-9"></path>
                            <path d="M12 13c-2.5-3-5.5-2.5-8-1 1.5-2 4-3.5 8 1z"></path>
                            <path d="M12 13c2.5-3 5.5-2.5 8-1-1.5-2-4-3.5-8 1z"></path>
                            <path d="M12 9c-2-2-4-2-6-1 1-1.5 3-2.5 6 1z"></path>
                            <path d="M12 9c2-2 4-2 6-1-1-1.5-3-2.5-6 1z"></path>
                        </svg>
                        <p className="text-3xl md:text-4xl italic text-[#5A4634] leading-relaxed">
                            "{safeQuote}"
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 4. GALLERY SECTION (Arcos Boho) */}
            {safeGallery.length > 0 && (
                <section className="py-24 bg-[#F8F4EE]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20 text-center">
                            <span className="font-sans uppercase tracking-[0.3em] text-[10px] mb-4 block text-[#5A4634]/60">
                                Colección de Instantes
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif italic" style={{ color: terracotta }}>
                                Nuestra Historia
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                            {safeGallery.map((url, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    viewport={{ once: true }}
                                    // Borde en forma de arco tan característico del Boho
                                    className={`relative overflow-hidden group rounded-t-[150px] rounded-b-2xl shadow-lg border-4 border-white ${i % 3 === 1 ? 'md:mt-16' : ''}`}
                                >
                                    <img
                                        src={url}
                                        alt={`Gallery ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        style={{ minHeight: i % 3 === 1 ? '500px' : '400px' }}
                                    />
                                    {/* Overlay sutil rosa/terracota */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                                        style={{ backgroundColor: terracotta }}
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
                        <span className="text-[10px] uppercase tracking-[0.3em] font-sans block mb-4 text-[#5A4634]/60">
                            Punto de Encuentro
                        </span>
                        <h2 className="text-5xl font-serif italic" style={{ color: oliveGreen }}>Los Detalles</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Ceremonia */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="p-10 bg-[#F8F4EE] rounded-tr-3xl rounded-bl-3xl relative border border-[#5A4634]/5"
                        >
                            <h4 className="text-3xl mb-4 font-serif italic" style={{ color: terracotta }}>Ceremonia</h4>
                            <p className="text-[#5A4634]/80 mb-10 font-sans text-sm leading-relaxed min-h-[60px] uppercase tracking-wider">{safeLocation}</p>
                            <div className="flex flex-wrap gap-4">
                                <a href={safeLocationUrl} target="_blank" rel="noreferrer" className="text-[9px] text-[#5A4634] uppercase tracking-[0.2em] border border-[#5A4634]/30 px-6 py-3 hover:bg-[#5A4634] hover:text-[#FDFBF7] transition-colors rounded-full">Ver en Mapa</a>
                                <a href={safeLocationUrl !== '#' ? safeLocationUrl.replace('maps', 'waze') : '#'} target="_blank" rel="noreferrer" className="text-[9px] text-[#5A4634] uppercase tracking-[0.2em] border border-[#5A4634]/30 px-6 py-3 hover:bg-[#33CCFF] hover:border-[#33CCFF] hover:text-white transition-colors rounded-full">Waze</a>
                            </div>
                        </motion.div>

                        {/* Recepción */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="p-10 bg-[#F8F4EE] rounded-tl-3xl rounded-br-3xl relative border border-[#5A4634]/5"
                        >
                            <h4 className="text-3xl mb-4 font-serif italic" style={{ color: terracotta }}>Recepción</h4>
                            <p className="text-[#5A4634]/80 mb-10 font-sans text-sm leading-relaxed min-h-[60px] uppercase tracking-wider">{safeReception}</p>
                            <div className="flex gap-4">
                                <a href={safeReceptionUrl} target="_blank" rel="noreferrer" className="text-[9px] text-[#5A4634] uppercase tracking-[0.2em] border border-[#5A4634]/30 px-6 py-3 hover:bg-[#5A4634] hover:text-[#FDFBF7] transition-colors rounded-full">Cómo llegar</a>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-20 text-center">
                        <a
                            href={calendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-3 text-white px-10 py-4 font-sans uppercase tracking-[0.2em] text-[10px] transition-transform hover:scale-105 rounded-full shadow-lg"
                            style={{ backgroundColor: oliveGreen }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Agendar en Calendario
                        </a>
                    </div>
                </div>
            </section>

            {/* 6. ITINERARY */}
            {safeItinerary.length > 0 && (
                <section className="py-24 px-6 border-t border-[#5A4634]/10">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-center mb-20">
                            <span className="text-[10px] font-sans uppercase tracking-[0.3em] block mb-4 text-[#5A4634]/60">
                                Ritual del Día
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif italic" style={{ color: terracotta }}>Itinerario</h2>
                        </div>

                        <div className="space-y-0 relative">
                            {/* Línea central sutil */}
                            <div className="absolute top-0 bottom-0 left-[15px] md:left-1/2 md:-translate-x-1/2 w-[1px] bg-[#5A4634]/20"></div>

                            {safeItinerary.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className={`relative flex items-center md:justify-between w-full mb-12 last:mb-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Diamante del Timeline */}
                                    <div
                                        className="absolute left-[11px] md:left-1/2 md:-translate-x-1/2 w-[9px] h-[9px] rotate-45 border border-white z-10"
                                        style={{ backgroundColor: oliveGreen }}
                                    ></div>

                                    <div className="ml-12 md:ml-0 md:w-5/12 text-left md:text-right flex flex-col justify-center">
                                        <div className={`flex items-center gap-4 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                            <span className="text-2xl font-serif italic" style={{ color: terracotta }}>{item.time}</span>
                                        </div>
                                    </div>

                                    <div className={`ml-12 md:ml-0 md:w-5/12 text-left ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'} mt-2 md:mt-0`}>
                                        <h4 className="text-sm font-sans uppercase tracking-widest text-[#5A4634]">{item.activity}</h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 7. INVITADOS (Guest Group Dinámico de Invitaboda) */}
            {guestGroup && (
                <section className="py-24 px-6 bg-[#F8F4EE] border-y border-[#5A4634]/5">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-[#FDFBF7] p-10 md:p-16 rounded-[40px] shadow-sm border border-[#5A4634]/10 relative overflow-hidden">
                            {/* SVG Decorativo en la esquina */}
                            <svg className="absolute -top-10 -right-10 w-32 h-32 opacity-5 text-[#8A9A5B]" fill="currentColor" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="50" />
                            </svg>

                            <h2 className="text-xs mb-4 font-sans uppercase tracking-[0.3em] text-[#5A4634]/60">
                                Pases reservados para:
                            </h2>
                            <h3 className="text-4xl md:text-5xl font-serif italic mb-10" style={{ color: terracotta }}>
                                {guestGroup.group_name}
                            </h3>

                            <div className="pt-8 border-t border-[#5A4634]/10">
                                <p className="text-[9px] font-sans uppercase tracking-[0.2em] mb-6 text-[#5A4634]/50">
                                    Invitados especiales ({guestGroup.total_passes})
                                </p>
                                <ul className="space-y-4">
                                    {guestGroup.members.map(m => (
                                        <li key={m.id} className="text-lg text-[#5A4634] font-serif">
                                            {m.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
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
                        <div className="p-12 border border-[#5A4634]/10 bg-white rounded-t-full rounded-b-2xl shadow-sm">
                            <svg className="w-8 h-8 mx-auto mb-6" style={{ color: terracotta }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-2xl font-serif italic mb-4 text-[#5A4634]">Buzón de Deseos</h2>
                            <p className="text-[#5A4634]/70 font-sans text-xs leading-relaxed uppercase tracking-widest mt-6">
                                Su presencia es nuestro mayor regalo. Si desean tener un detalle extra, contaremos con lluvia de sobres en el lugar.
                            </p>
                        </div>

                        {/* Dress Code */}
                        <div className="p-12 border border-[#5A4634]/10 bg-white rounded-t-full rounded-b-2xl shadow-sm">
                            <svg className="w-8 h-8 mx-auto mb-6" style={{ color: oliveGreen }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] font-sans uppercase tracking-[0.3em] block mb-4" style={{ color: terracotta }}>
                                Código de Vestimenta
                            </span>
                            <p className="text-2xl font-serif italic text-[#5A4634]">Bohemio / Formal</p>
                            <p className="text-[#5A4634]/60 font-sans text-[10px] uppercase tracking-widest mt-6">Respetar el uso del color blanco.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer space for RSVP Button in Invitation.jsx */}
            <div className="h-40"></div>

        </div>
    );
}