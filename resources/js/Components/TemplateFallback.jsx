import { motion } from 'framer-motion';

/**
 * TemplateFallback — shown when the requested template slug
 * does not have a matching JSX file in resources/js/Templates/.
 * Renders a minimal but elegant placeholder so the invitation
 * still works end-to-end.
 */
export default function TemplateFallback({ data, guestGroup }) {
    const names = data?.primaryNames || 'La Boda';
    const date = data?.date ? new Date(data.date).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-center max-w-lg"
            >
                <div className="w-px h-24 bg-[#C5A059] mx-auto mb-10 opacity-40"></div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] font-sans mb-6">
                    Con alegría te invitamos a celebrar
                </p>
                <h1 className="text-5xl font-serif text-[#1A1A1A] italic mb-6 leading-tight">
                    {names}
                </h1>
                {date && (
                    <p className="text-sm font-sans uppercase tracking-[0.3em] text-gray-400">{date}</p>
                )}
                <div className="w-px h-24 bg-[#C5A059] mx-auto mt-10 opacity-40"></div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                        <p className="text-xs font-mono text-amber-700 font-bold mb-1">
                            ⚠️ Template no encontrado
                        </p>
                        <p className="text-xs text-amber-600">
                            Crea el archivo JSX del template del diseño asignado en:
                            <br />
                            <code>resources/js/Templates/[slug].jsx</code>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
