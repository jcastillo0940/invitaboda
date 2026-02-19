import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const CountdownItem = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <span className="text-3xl md:text-5xl font-light tracking-tighter">{value.toString().padStart(2, '0')}</span>
        <span className="text-[8px] uppercase tracking-[0.3em] mt-2 opacity-60 font-sans">{label}</span>
    </div>
);

export default function InvitationCard1({ data, guestGroup = null }) {
    const {
        primaryNames = 'Boda de Ensueño',
        date = '2027-10-10',
        location = 'Catedral de la Asunción',
        locationUrl = '#',
        reception = 'Palacio de Cristal',
        receptionUrl = '#',
        heroImageUrl = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2070',
        heroVideoUrl = '',
        gallery = [],
        itinerary = [],
        musicUrl = '',
        showCountdown = true,
        mainColor = '#C5A059',
        secondaryColor = '#1A1A1A'
    } = data;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);

    useEffect(() => {
        const target = new Date(date).getTime();
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
    }, [date]);

    // Calendar link helper
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Boda+${encodeURIComponent(primaryNames)}&dates=${date.replace(/-/g, '')}T180000Z/${date.replace(/-/g, '')}T235959Z&details=Invitación+Especial&location=${encodeURIComponent(location)}`;

    return (
        <div className="bg-[#FAF9F6] text-[#333333] font-serif overflow-x-hidden selection:bg-[#C5A059] selection:text-white">

            {/* HER0 SECTION - PARALLAX */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    {heroVideoUrl ? (
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                            <source src={heroVideoUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={heroImageUrl} alt="Wedding Hero" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                </motion.div>

                <div className="relative z-10 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                        <span className="text-white/80 font-sans uppercase tracking-[0.5em] text-[10px] mb-6 block">Nuestra Unión</span>
                        <h1 className="text-5xl md:text-8xl text-white font-light leading-tight mb-8">
                            {primaryNames.split('y').map((name, i) => (
                                <span key={i} className="block">
                                    {name.trim()}
                                    {i === 0 && <span className="text-[#C5A059] italic block text-4xl md:text-6xl my-2">&</span>}
                                </span>
                            ))}
                        </h1>
                        <div className="w-16 h-[2px] bg-[#C5A059] mx-auto mb-12"></div>
                        <p className="text-white/90 text-lg md:text-2xl tracking-[0.2em] uppercase font-light">
                            {new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </motion.div>
                </div>

                {/* Animated SVG Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
                >
                    <svg width="30" height="50" viewBox="0 0 30 50">
                        <rect x="0.5" y="0.5" width="29" height="49" rx="14.5" fill="none" stroke="white" strokeOpacity="0.3" />
                        <circle cx="15" cy="15" r="3" fill="#C5A059" />
                    </svg>
                </motion.div>
            </section>

            {/* COUNTDOWN SECTION */}
            {showCountdown && (
                <section className="py-24 bg-[#1A1A1A] text-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-[#C5A059] italic text-3xl mb-12">Faltan solo...</h3>
                            <div className="flex justify-center gap-8 md:gap-16">
                                <CountdownItem value={timeLeft.days} label="Días" />
                                <CountdownItem value={timeLeft.hours} label="Horas" />
                                <CountdownItem value={timeLeft.minutes} label="Min" />
                                <CountdownItem value={timeLeft.seconds} label="Seg" />
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* QUOTE SECTION */}
            <section className="py-32 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" className="mx-auto mb-12 opacity-20">
                            <path d="M10 20H0V0H20V20L10 40H0L10 20ZM30 20H20V0H40V20L30 40H20L30 20Z" fill="black" />
                        </svg>
                        <p className="text-2xl md:text-4xl italic text-gray-600 leading-relaxed font-serif">
                            "Andábamos sin buscarnos, pero sabiendo que andábamos para encontrarnos."
                        </p>
                        <span className="block mt-8 text-[10px] uppercase tracking-widest text-[#C5A059] font-sans font-bold">— Julio Cortázar</span>
                    </motion.div>
                </div>
            </section>

            {/* GALLERY SECTION */}
            {gallery && gallery.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-16 text-center">
                            <span className="font-sans uppercase tracking-[0.5em] text-[10px] text-gray-400 mb-4 block">Fragmentos de Amor</span>
                            <h2 className="text-4xl md:text-5xl font-light">Nuestra Galería</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {gallery.map((url, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className={`relative overflow-hidden group border border-gray-100 ${i % 3 === 1 ? 'md:row-span-2' : ''}`}
                                >
                                    <img
                                        src={url}
                                        alt={`Gallery ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        style={{ minHeight: i % 3 === 1 ? '600px' : '300px' }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-12 h-12 border border-white/50 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xl">+</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* LOCATION DETAILS */}
            <section className="py-32 px-6 bg-[#FAF9F6]">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20">
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        <div>
                            <span className="text-[#C5A059] text-sm uppercase tracking-[0.3em] font-sans block mb-4">¿Cuándo y Dónde?</span>
                            <h2 className="text-5xl font-light mb-8 italic">Los Detalles</h2>
                        </div>

                        <div className="space-y-12">
                            <div className="flex gap-6">
                                <div className="text-4xl text-[#C5A059] opacity-30 mt-1">01</div>
                                <div>
                                    <h4 className="text-xl mb-2 italic">Ceremonia Religiosa</h4>
                                    <p className="text-gray-500 mb-6 font-sans text-sm">{location}</p>
                                    <div className="flex gap-4">
                                        <a href={locationUrl} target="_blank" className="text-[10px] uppercase tracking-widest border border-gray-200 px-6 py-3 hover:bg-[#1A1A1A] hover:text-white transition-all">Google Maps</a>
                                        <a href={locationUrl.replace('maps', 'waze')} target="_blank" className="text-[10px] uppercase tracking-widest border border-gray-200 px-6 py-3 hover:bg-[#33CCFF] hover:border-[#33CCFF] hover:text-white transition-all">Waze</a>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="text-4xl text-[#C5A059] opacity-30 mt-1">02</div>
                                <div>
                                    <h4 className="text-xl mb-2 italic">Recepción / Fiesta</h4>
                                    <p className="text-gray-500 mb-6 font-sans text-sm">{reception}</p>
                                    <div className="flex gap-4">
                                        <a href={receptionUrl} target="_blank" className="text-[10px] uppercase tracking-widest border border-gray-200 px-6 py-3 hover:bg-[#1A1A1A] hover:text-white transition-all">Cómo llegar</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12">
                            <a
                                href={calendarUrl}
                                target="_blank"
                                className="inline-flex items-center gap-3 bg-[#C5A059] text-white px-10 py-5 font-sans uppercase tracking-[0.3em] text-[10px] hover:bg-[#1A1A1A] transition-all shadow-xl"
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
                    </motion.div>

                    <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] bg-gray-200 overflow-hidden shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2069" alt="Location" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                        </div>
                        {/* Fake SVG Path Animation overlay */}
                        <svg className="absolute -top-10 -right-10 w-40 h-40 text-[#C5A059] opacity-20" viewBox="0 0 100 100">
                            <motion.path
                                d="M10,50 Q25,10 50,50 T90,50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.5"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* ITINERARY */}
            {itinerary && itinerary.length > 0 && (
                <section className="py-24 px-6 bg-[#1A1A1A] text-white">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-20">
                            <span className="text-[#C5A059] text-[10px] uppercase tracking-[0.5em] block mb-4">El Camino</span>
                            <h2 className="text-4xl md:text-5xl font-light italic">Itinerario de Amor</h2>
                        </div>

                        <div className="space-y-16">
                            {itinerary.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-8 last:border-0"
                                >
                                    <div className="text-3xl font-light text-[#C5A059] mb-4 md:mb-0">{item.time}</div>
                                    <div className="text-center md:text-right">
                                        <h4 className="text-2xl font-light uppercase tracking-widest">{item.activity}</h4>
                                        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-2">Día Especial</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* GIFT SECTION */}
            <section className="py-32 bg-white px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-4xl italic mb-8">Pase de Lluvia de Sobres</h2>
                        <p className="text-gray-500 font-sans text-sm leading-relaxed mb-12">
                            Su presencia es nuestro mayor regalo. Sin embargo, si desean tener un detalle con nosotros, contaremos con lluvia de sobres en el evento.
                        </p>
                        <div className="inline-block p-12 border border-dashed border-[#C5A059]/30 rounded-2xl bg-[#FAF9F6]">
                            <span className="text-[#C5A059] text-xs uppercase tracking-widest font-bold">Dress Code</span>
                            <p className="text-2xl mt-4 font-light">Gala / Formal</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer space for RSVP Button in Invitation.jsx */}
            <div className="h-40"></div>

        </div>
    );
}
