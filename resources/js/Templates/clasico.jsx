import { motion } from 'framer-motion';

/**
 * TEMPLATE: clasico
 * Diseño minimalista y elegante en tonos crema, negro y dorado.
 *
 * Props recibidas:
 *   @param {Object}  data          — datos del diseño guardados en event_designs.design_data
 *   @param {Object}  event         — datos crudos del evento (id, name, date, slug…)
 *   @param {Object|null} guestGroup — grupo de invitados (con .members[]) o null
 */
export default function Clasico({ data, event, guestGroup }) {
    const names = data?.primaryNames || event?.name || 'La Boda';
    const location = data?.location || 'Por confirmar';
    const reception = data?.reception || null;
    const gold = data?.mainColor || '#C5A059';
    const dark = data?.secondaryColor || '#1A1A1A';

    const date = event?.date
        ? new Date(event.date).toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        })
        : '';

    return (
        <div
            className="min-h-screen bg-[#F5F5F0] text-[#333333] font-serif"
            style={{ '--gold': gold, '--dark': dark }}
        >

            {/* ── HERO ── */}
            <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
                {/* Decorative corner lines */}
                <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 opacity-30" style={{ borderColor: gold }}></div>
                <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 opacity-30" style={{ borderColor: gold }}></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 opacity-30" style={{ borderColor: gold }}></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 opacity-30" style={{ borderColor: gold }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    className="max-w-2xl"
                >
                    <p className="text-[10px] uppercase tracking-[0.6em] mb-8 font-sans" style={{ color: gold }}>
                        Con alegría te invitamos a celebrar
                    </p>

                    <div className="w-px h-16 mx-auto mb-8 opacity-20" style={{ background: gold }}></div>

                    <h1 className="text-5xl md:text-7xl italic leading-tight mb-8" style={{ color: dark }}>
                        {names}
                    </h1>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-16 opacity-30" style={{ background: gold }}></div>
                        <span className="text-[10px] uppercase tracking-[0.4em] font-sans" style={{ color: gold }}>♥</span>
                        <div className="h-px w-16 opacity-30" style={{ background: gold }}></div>
                    </div>

                    {date && (
                        <p className="text-sm uppercase tracking-[0.3em] font-sans text-gray-500 mb-4">{date}</p>
                    )}
                    {location && (
                        <p className="text-xs uppercase tracking-[0.3em] font-sans text-gray-400">{location}</p>
                    )}
                </motion.div>
            </section>

            {/* ── DETALLES ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-[0.5em] font-sans mb-8" style={{ color: gold }}>
                        Detalles del evento
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <div className="text-2xl mb-3" style={{ color: gold }}>⊹</div>
                            <h3 className="text-lg italic mb-2" style={{ color: dark }}>Ceremonia</h3>
                            <p className="text-xs font-sans text-gray-400 uppercase tracking-widest">{location}</p>
                        </div>
                        {reception && (
                            <div>
                                <div className="text-2xl mb-3" style={{ color: gold }}>⊹</div>
                                <h3 className="text-lg italic mb-2" style={{ color: dark }}>Recepción</h3>
                                <p className="text-xs font-sans text-gray-400 uppercase tracking-widest">{reception}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── INVITADOS ── */}
            {guestGroup && (
                <section className="py-24 px-6 bg-[#F5F5F0]">
                    <div className="max-w-xl mx-auto text-center">
                        <p className="text-[10px] uppercase tracking-[0.5em] font-sans mb-2" style={{ color: gold }}>
                            Esta invitación es para
                        </p>
                        <h2 className="text-3xl italic mb-6" style={{ color: dark }}>
                            {guestGroup.group_name}
                        </h2>
                        <div className="flex flex-wrap justify-center gap-3">
                            {guestGroup.members.map(m => (
                                <span
                                    key={m.id}
                                    className="text-xs uppercase tracking-widest font-sans px-4 py-2 border border-opacity-30 rounded-full"
                                    style={{ borderColor: gold, color: dark }}
                                >
                                    {m.name}
                                </span>
                            ))}
                        </div>
                        <p className="mt-8 text-xs text-gray-400 font-sans uppercase tracking-widest">
                            {guestGroup.total_passes} {guestGroup.total_passes === 1 ? 'pase' : 'pases'}
                        </p>
                    </div>
                </section>
            )}

            {/* ── FOOTER ── */}
            <footer className="py-12 text-center" style={{ background: dark }}>
                <p className="text-[9px] uppercase tracking-[0.5em] font-sans" style={{ color: gold }}>
                    Invitaboda · Invitaciones Digitales
                </p>
            </footer>

        </div>
    );
}
