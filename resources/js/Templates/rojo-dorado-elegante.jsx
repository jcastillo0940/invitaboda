import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Music, Heart, Users, Gift, Info, Star, Phone, MessageCircle, Bed, Umbrella } from 'lucide-react';
import Weather from '@/Components/Wedding/Weather';

const CountdownItem = ({ value, label, goldColor }) => (
    <div className="flex flex-col items-center">
        <span
            className="text-4xl md:text-5xl font-light tracking-tighter"
            style={{ color: goldColor }}
        >
            {value.toString().padStart(2, '0')}
        </span>
        <span className="text-[8px] uppercase tracking-[0.3em] mt-3 opacity-60 font-sans text-gray-300">
            {label}
        </span>
    </div>
);

export default function RojoDoradoElegante({ data, guestGroup = null }) {
    // Normalización de datos con fallback total
    const d = data || {};
    const primaryNames = d.primaryNames || 'Nuestra Boda';
    const date = d.date || '2025-12-30';
    const showCountdown = d.showCountdown !== false;
    const mainColor = d.mainColor || '#D4AF37'; // Gold
    const secondaryColor = d.secondaryColor || '#8B0000'; // Dark Red / Wine
    const quote = d.quote || 'El amor es el lazo que une dos corazones en una sola melodía.';
    const ourStory = d.ourStory || '';
    const hashtag = d.hashtag || '';

    const parents = d.parents || { bride: { mother: '', father: '' }, groom: { mother: '', father: '' } };
    const godparents = d.godparents || [];
    const giftSettings = d.giftSettings || { type: 'none' };
    const dressCode = d.dressCode || { type: 'formal', customText: '' };
    const weather = d.weather || { enabled: false, city: '' };
    const contact = d.contact || { label: 'Contacto', phone: '', whatsapp: '' };
    const accommodation = d.accommodation || [];
    const calendarEnabled = d.calendarEnabled !== false;

    const safeGallery = d.gallery || [];
    const safeItinerary = d.itinerary || [];

    // State
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Parallax
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);

    useEffect(() => {
        const target = new Date(date).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;
            if (diff < 0) { clearInterval(interval); return; }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [date]);

    // Calendar Link
    const compactDate = date.replace(/-/g, '');
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Boda+${encodeURIComponent(primaryNames)}&dates=${compactDate}T180000Z/${compactDate}T235959Z&details=Invitación+Especial&location=${encodeURIComponent(d.location || '')}`;

    return (
        <div className="bg-[#0a0a0a] text-gray-200 font-serif overflow-x-hidden selection:bg-[#D4AF37] selection:text-black">

            {/* 1. HERO SECTION */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
                    {d.heroVideoUrl ? (
                        <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                            <source src={d.heroVideoUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={d.heroImageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000'} className="w-full h-full object-cover" alt="Hero" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]"></div>
                </motion.div>

                <div className="relative z-10 text-center px-6 pt-20">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2 }}>
                        <span className="text-[10px] uppercase tracking-[0.6em] mb-8 block font-sans" style={{ color: mainColor }}>Comienza nuestra aventura</span>
                        <h1 className="text-6xl md:text-9xl font-light mb-12 text-white italic">
                            {primaryNames.split('y').map((n, i) => (
                                <React.Fragment key={i}>
                                    <span className="block">{n.trim()}</span>
                                    {i === 0 && <span className="block text-4xl my-4">&</span>}
                                </React.Fragment>
                            ))}
                        </h1>
                        <div className="w-20 h-[1px] bg-white/30 mx-auto mb-12"></div>
                        <p className="text-xl md:text-2xl uppercase tracking-[0.4em] font-light text-white">
                            {new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div className="w-[1px] h-12 bg-white/20"></div>
                </div>
            </section>

            {/* 2. NUESTRA HISTORIA & PADRES */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
                            <span className="text-[9px] uppercase tracking-[0.4em] mb-4 block" style={{ color: mainColor }}>Nuestra Historia</span>
                            <h2 className="text-4xl mb-8 font-light italic">Cómo empezó todo...</h2>
                            <p className="text-gray-400 font-sans leading-relaxed text-justify italic">
                                {ourStory || 'Cada historia de amor es hermosa, pero la nuestra es mi favorita. Un viaje que comenzó con una mirada y hoy se convierte en una vida entera.'}
                            </p>
                            {hashtag && (
                                <p className="mt-8 text-lg italic" style={{ color: mainColor }}>{hashtag}</p>
                            )}
                        </motion.div>

                        <div className="space-y-12">
                            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}>
                                <h3 className="text-center text-[10px] uppercase tracking-[0.4em] mb-8 border-b border-white/10 pb-4">Nuestros Padres</h3>
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">De la novia</p>
                                        <p className="italic text-gray-300">{parents.bride.mother}</p>
                                        <p className="italic text-gray-300">{parents.bride.father}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] uppercase tracking-widest text-gray-500 mb-2">Del novio</p>
                                        <p className="italic text-gray-300">{parents.groom.mother}</p>
                                        <p className="italic text-gray-300">{parents.groom.father}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. WEATHER & QUOTE */}
            <section className="py-20 bg-[#070707]">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <Weather config={d.weather} eventDate={date} />

                    <motion.div className="mt-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                        <Heart className="mx-auto w-6 h-6 mb-8" style={{ color: mainColor }} strokeWidth={1} />
                        <p className="text-2xl md:text-4xl font-light italic text-white/90 leading-relaxed font-serif">
                            "{quote}"
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 4. DETAILS SECTION (Location & Itinerary) */}
            <section className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-[10px] uppercase tracking-[0.5em] font-sans block mb-4" style={{ color: mainColor }}>Logística del Día</span>
                        <h2 className="text-5xl font-light italic text-white">Donde & Cuando</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-20">
                        <div className="p-12 border border-white/5 bg-[#080808] rounded-sm relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                            <MapPin className="w-8 h-8 mb-8" style={{ color: mainColor }} />
                            <h4 className="text-2xl mb-4 italic text-white">Ceremonia</h4>
                            <p className="text-gray-400 mb-10 min-h-[50px] font-sans font-light">{d.location || 'Ubicación por confirmar'}</p>
                            <a href={d.locationUrl || '#'} target="_blank" className="inline-block text-[10px] uppercase tracking-widest border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-all">Ver en el mapa</a>
                        </div>
                        <div className="p-12 border border-white/5 bg-[#080808] rounded-sm relative overflow-hidden group hover:border-[#8B0000]/30 transition-all">
                            <Music className="w-8 h-8 mb-8" style={{ color: secondaryColor }} />
                            <h4 className="text-2xl mb-4 italic text-white">Recepción</h4>
                            <p className="text-gray-400 mb-10 min-h-[50px] font-sans font-light">{d.reception || 'Ubicación por confirmar'}</p>
                            <a href={d.receptionUrl || '#'} target="_blank" className="inline-block text-[10px] uppercase tracking-widest border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-all">Ver en el mapa</a>
                        </div>
                    </div>

                    {calendarEnabled && (
                        <div className="text-center mb-24">
                            <a href={calendarUrl} target="_blank" className="inline-flex items-center gap-4 bg-white text-black px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:scale-105 transition-all shadow-xl">
                                <Calendar className="w-4 h-4" /> Agendar Fecha
                            </a>
                        </div>
                    )}

                    {safeItinerary.length > 0 && (
                        <div className="max-w-2xl mx-auto space-y-16 py-10 border-t border-white/10">
                            {safeItinerary.map((item, i) => (
                                <motion.div key={i} className="flex gap-10 items-center" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}>
                                    <div className="w-32 text-right">
                                        <span className="text-3xl font-light italic" style={{ color: mainColor }}>{item.time}</span>
                                    </div>
                                    <div className="w-[1px] h-10 bg-white/10 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: secondaryColor }}></div>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-lg uppercase tracking-widest text-white/80 font-sans font-light">{item.activity}</h5>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 5. GUEST GROUP INFO */}
            {guestGroup && (
                <section className="py-24 bg-[#080808] border-y border-white/5">
                    <div className="max-w-xl mx-auto px-6 text-center">
                        <Users className="mx-auto w-8 h-8 mb-8 opacity-20" />
                        <h3 className="text-[10px] uppercase tracking-[0.5em] mb-4 text-gray-400">Pases reservados</h3>
                        <h2 className="text-4xl italic text-white mb-10">{guestGroup.group_name}</h2>
                        <div className="flex justify-center gap-12">
                            <div className="text-center">
                                <p className="text-3xl font-light" style={{ color: mainColor }}>{guestGroup.total_passes}</p>
                                <p className="text-[8px] uppercase tracking-widest opacity-50">Personas</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 6. LOGISTICS (Gift, Dress code, Accommodation) */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Dress Code */}
                        <div className="text-center p-10 bg-white/5 rounded-3xl backdrop-blur-sm">
                            <Star className="mx-auto w-6 h-6 mb-6" style={{ color: mainColor }} />
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Código de Vestimenta</h4>
                            <p className="text-2xl italic text-white mb-2">{dressCode.type === 'formal' ? 'Gala / Formal' : dressCode.type === 'cocktail' ? 'Cóctel' : dressCode.type === 'semi' ? 'Semi-Formal' : 'Informal'}</p>
                            <p className="text-xs text-gray-500 font-sans leading-relaxed">{dressCode.customText || 'Agradecemos su elegancia.'}</p>
                        </div>

                        {/* Gift */}
                        <div className="text-center p-10 bg-white/5 rounded-3xl backdrop-blur-sm">
                            <Gift className="mx-auto w-6 h-6 mb-6" style={{ color: mainColor }} />
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4">Sugerencia de Regalo</h4>
                            {giftSettings.type === 'registry' ? (
                                <a href={giftSettings.registryUrl} target="_blank" className="text-lg italic text-white underline decoration-[#C5A059] underline-offset-4">Ver mesa de regalos</a>
                            ) : giftSettings.type === 'bank' ? (
                                <p className="text-xs text-gray-400 whitespace-pre-line">{giftSettings.bankDetails}</p>
                            ) : giftSettings.type === 'text' ? (
                                <p className="text-sm italic text-white">{giftSettings.freeText}</p>
                            ) : (
                                <p className="text-xs text-gray-400 font-sans">Su presencia es nuestro mejor regalo.</p>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="text-center p-10 bg-white/5 rounded-3xl backdrop-blur-sm">
                            <Phone className="mx-auto w-6 h-6 mb-6" style={{ color: mainColor }} />
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4">{contact.label || 'Ayuda'}</h4>
                            <div className="flex justify-center gap-4">
                                {contact.whatsapp && (
                                    <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                                        <MessageCircle className="w-5 h-5" />
                                    </a>
                                )}
                                {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className="p-3 bg-white/10 rounded-full hover:bg-white hover:text-black transition-all">
                                        <Phone className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {accommodation.length > 0 && (
                        <div className="mt-20 p-12 bg-white/5 rounded-3xl text-center">
                            <Bed className="mx-auto w-6 h-6 mb-6 text-gray-400" />
                            <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-10">Hospedajes Recomendados</h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                {accommodation.map((hotel, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <span className="italic text-gray-300">{hotel.name}</span>
                                        {hotel.link && <a href={hotel.link} target="_blank" className="text-[10px] text-[#C5A059] border-b border-[#C5A059]">Ver info</a>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* 7. GALLERY */}
            {safeGallery.length > 0 && (
                <section className="py-32 bg-[#050505]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                            {safeGallery.map((url, i) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="relative group overflow-hidden rounded-sm">
                                    <img src={url} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" alt={`Gallery ${i}`} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. PADRINOS SECTION */}
            {godparents.length > 0 && (
                <section className="py-24 px-6 border-t border-white/5">
                    <div className="max-w-3xl mx-auto text-center">
                        <Star className="mx-auto w-8 h-8 mb-8 opacity-20" />
                        <h2 className="text-3xl italic mb-12">Nuestros Padrinos</h2>
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                            {godparents.map((name, i) => (
                                <span key={i} className="text-xl font-light italic text-gray-400">{name}</span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* SPACE FOR FIXED RSVP BUTTON */}
            <div className="h-40"></div>
        </div>
    );
}
