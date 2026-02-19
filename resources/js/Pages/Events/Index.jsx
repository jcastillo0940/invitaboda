import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Index({ auth, events }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('events.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">
                    Mis Bodas
                </h2>
            }
        >
            <Head title="Mis Bodas" />

            <div className="py-12 bg-[#F9F9F7]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Crear Nuevo Evento */}
                    <div className="mb-12 overflow-hidden bg-white shadow-xl sm:rounded-2xl border border-[#E0E0E0]/50 relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-bl-full -z-0"></div>
                        <div className="p-10 relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-2xl font-serif text-[#1A1A1A]">Crear Nueva Boda</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#C5A059]/30 to-transparent"></div>
                            </div>

                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                                <div className="md:col-span-5">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-3 font-sans font-bold">Nombres de los Novios</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Jose y Maria"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all duration-300 p-0 pb-2 text-lg font-serif placeholder:text-gray-300 placeholder:italic"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-3 font-sans font-bold">Fecha del Evento</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all duration-300 p-0 pb-2 text-lg font-serif"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <button
                                        disabled={processing}
                                        className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] font-sans font-bold hover:bg-[#C5A059] hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all duration-500 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {processing ? 'Creando...' : 'Comenzar Diseño'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Lista de Eventos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event, i) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white overflow-hidden shadow-sm border border-[#E0E0E0] relative group hover:shadow-2xl hover:border-[#C5A059]/30 transition-all duration-500 rounded-xl flex flex-col"
                            >
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`text-[9px] uppercase tracking-[0.3em] font-bold px-3 py-1.5 rounded-full ${event.is_premium ? 'bg-[#C5A059]/10 text-[#C5A059]' : 'bg-gray-100 text-gray-400'}`}>
                                            {event.is_premium ? 'Premium' : 'Básico'}
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></div>
                                        </div>
                                    </div>

                                    <h4 className="text-2xl font-serif text-[#1A1A1A] mb-3 group-hover:text-[#C5A059] transition-colors duration-500 line-clamp-2">{event.name}</h4>

                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="h-[1px] w-4 bg-[#C5A059]"></div>
                                        <p className="text-[#888888] font-sans text-[10px] uppercase tracking-[0.2em]">
                                            {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-x-6 gap-y-3 mt-auto pt-6 border-t border-gray-50">
                                        <Link
                                            href={route('event.public', event.slug)}
                                            className="text-[#C5A059] text-[10px] uppercase tracking-widest font-bold hover:text-[#1A1A1A] transition-all flex items-center gap-1 group/link"
                                        >
                                            Ver <span className="transform translate-x-0 group-hover/link:translate-x-1 transition-transform">→</span>
                                        </Link>
                                        <Link
                                            href={route('events.edit', event.id)}
                                            className="text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:text-[#C5A059] transition-all"
                                        >
                                            Diseño
                                        </Link>
                                        <Link
                                            href={route('events.guests', event.id)}
                                            className="text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:text-[#C5A059] transition-all"
                                        >
                                            Invitados
                                        </Link>
                                        <Link
                                            href={route('tables.index', event.id)}
                                            className="text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold hover:text-[#C5A059] transition-all"
                                        >
                                            Mesas
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
