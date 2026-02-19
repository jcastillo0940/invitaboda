import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#F9F9F7] font-serif selection:bg-[#C5A059] selection:text-white">
            {/* Left Side: Brand Experience */}
            <div className="hidden lg:flex w-1/2 bg-[#1A1A1A] items-center justify-center p-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center"
                >
                    <div className="inline-block border-2 border-[#C5A059] p-8 mb-8">
                        <h1 className="text-5xl text-[#C5A059] italic uppercase tracking-[0.2em]">Alta Costura</h1>
                        <p className="text-[#C5A059] font-sans tracking-[0.5em] text-[10px] uppercase mt-2">Weddings & Events</p>
                    </div>
                    <p className="text-white text-xl italic font-light max-w-md mx-auto leading-loose">
                        "Donde la elegancia se encuentra con la logística. Crea experiencias memorables para tus clientes más exclusivos."
                    </p>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute bottom-10 left-10 w-32 h-px bg-[#C5A059]/30"></div>
                <div className="absolute top-10 right-10 w-px h-32 bg-[#C5A059]/30"></div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:bg-transparent">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="lg:hidden text-center mb-12">
                        <h1 className="text-3xl text-[#1A1A1A] italic uppercase tracking-widest font-bold">Alta Costura</h1>
                        <div className="w-12 h-px bg-[#C5A059] mx-auto mt-2"></div>
                    </div>

                    <div className="bg-white lg:shadow-2xl lg:p-12 border lg:border-[#F0F0F0]">
                        {children}
                    </div>

                    <div className="text-center pt-8">
                        <Link href="/" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#C5A059] transition-all font-sans font-bold">
                            &larr; Volver al Inicio
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
