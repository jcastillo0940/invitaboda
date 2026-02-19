import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { motion } from 'framer-motion';

export default function Welcome({ auth }) {
    return (
        <div className="bg-[#F9F9F7] min-h-screen font-serif text-[#1A1A1A] selection:bg-[#C5A059] selection:text-white overflow-x-hidden">
            <Head title="Alta Costura Weddings - Elite Digital Invitations" />

            {/* Navigation Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-[#F9F9F7]/80 backdrop-blur-md border-b border-[#E0E0E0] px-8 py-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-2xl italic tracking-[0.2em] uppercase">Alta Costura</span>
                </div>
                <div className="flex gap-8 items-center">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="text-[10px] uppercase tracking-widest font-sans font-bold hover:text-[#C5A059] transition-all">Mi Dashboard</Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="text-[10px] uppercase tracking-widest font-sans font-bold hover:text-[#C5A059] transition-all">Iniciar Sesión</Link>
                            <Link
                                href={route('register')}
                                className="bg-[#1A1A1A] text-white px-6 py-3 text-[10px] uppercase tracking-widest font-sans font-bold hover:bg-[#C5A059] transition-all"
                            >
                                Commenzar Ahora
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-8 text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-4xl mx-auto"
                >
                    <span className="text-[10px] uppercase tracking-[0.5em] text-[#C5A059] font-sans font-bold mb-6 block">SaaS para Planners & Agencias</span>
                    <h1 className="text-6xl md:text-8xl font-light leading-tight mb-8">
                        Invitaciones Digitales <br />
                        <span className="italic">de Alta Costura</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto mb-12 leading-loose">
                        Transforma la experiencia de tus novios con invitaciones dinámicas, confirmación en tiempo real y branding exclusivo para tu agencia.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link
                            href={route('register')}
                            className="bg-[#1A1A1A] text-white px-12 py-5 text-xs uppercase tracking-widest font-sans font-bold hover:bg-[#C5A059] transition-all shadow-2xl"
                        >
                            Crear mi Primera Boda
                        </Link>
                        <button className="text-xs uppercase tracking-widest font-sans font-bold border-b-2 border-[#1A1A1A] pb-1 hover:text-[#C5A059] hover:border-[#C5A059] transition-all">
                            Ver Demo en Vivo
                        </button>
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5 pointer-events-none select-none">
                    <span className="text-[20rem] font-serif italic text-[#1A1A1A]">A</span>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-5 pointer-events-none select-none">
                    <span className="text-[20rem] font-serif italic text-[#1A1A1A]">C</span>
                </div>
            </section>

            {/* Features Preview */}
            <section className="py-32 px-8 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
                    <div>
                        <span className="text-[#C5A059] text-5xl font-serif italic mb-6 block">01</span>
                        <h3 className="text-2xl font-light mb-4">Diseño a Medida</h3>
                        <p className="text-gray-400 font-light leading-relaxed">Editor visual avanzado con previsualización en tiempo real para móviles iPhone 15 Pro.</p>
                    </div>
                    <div>
                        <span className="text-[#C5A059] text-5xl font-serif italic mb-6 block">02</span>
                        <h3 className="text-2xl font-light mb-4">Gestión Logística</h3>
                        <p className="text-gray-400 font-light leading-relaxed">Control total de invitados, grupos familiares, alérgenos y confirmaciones vía WhatsApp.</p>
                    </div>
                    <div>
                        <span className="text-[#C5A059] text-5xl font-serif italic mb-6 block">03</span>
                        <h3 className="text-2xl font-light mb-4">Branding Agencia</h3>
                        <p className="text-gray-400 font-light leading-relaxed">White-label total. Tu logo, tus colores y tu dominio para una experiencia 100% profesional.</p>
                    </div>
                </div>
            </section>

            {/* Portfolio / Mockup Section */}
            <section className="py-20 bg-[#ECECE6]">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="relative w-[320px] h-[640px] bg-white rounded-[50px] border-[10px] border-[#1A1A1A] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1A1A] rounded-b-2xl z-20"></div>
                        <div className="p-8 pt-12 text-center h-full flex flex-col justify-center items-center">
                            <div className="w-12 h-12 border border-[#C5A059] rounded-full flex items-center justify-center mb-6">
                                <span className="text-[#C5A059] text-lg italic">AC</span>
                            </div>
                            <h4 className="text-3xl mb-4 leading-tight">Juan & Maria</h4>
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-8">10 de Octubre, 2026</p>
                            <div className="w-12 h-px bg-[#C5A059]"></div>
                        </div>
                    </div>
                    <p className="mt-12 text-gray-400 font-sans text-[10px] uppercase tracking-[0.4em]">Experiencia Mobile-First</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1A1A1A] py-20 px-8 text-center text-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl italic mb-12 uppercase tracking-[0.2em] text-[#C5A059]">Alta Costura</h2>
                    <div className="flex justify-center gap-12 text-[10px] uppercase tracking-widest text-[#888888] font-bold mb-12">
                        <Link href="#" className="hover:text-white transition-all">Privacidad</Link>
                        <Link href="#" className="hover:text-white transition-all">Términos</Link>
                        <Link href="#" className="hover:text-white transition-all">Contacto</Link>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-[#555555]">© 2026 Alta Costura Weddings. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
