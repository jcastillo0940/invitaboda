import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tables({ auth, event, unassignedMembers }) {
    const [showingAddModal, setShowingAddModal] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        capacity: 10,
    });

    const submitTable = (e) => {
        e.preventDefault();
        post(route('tables.store', event.id), {
            onSuccess: () => {
                setShowingAddModal(false);
                reset();
            }
        });
    };

    const assignGuest = (memberId, tableId) => {
        router.post(route('tables.assign', [event.id, tableId]), {
            member_id: memberId
        });
    };

    const unassignGuest = (memberId) => {
        router.post(route('tables.unassign', [event.id, memberId]));
    };

    const deleteTable = (tableId) => {
        if (confirm('¿Eliminar esta mesa? Los invitados quedarán sin asignar.')) {
            router.delete(route('tables.destroy', [event.id, tableId]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">Asignación de Mesas: {event.name}</h2>
                    <button
                        onClick={() => setShowingAddModal(true)}
                        className="bg-[#C5A059] text-white px-6 py-2 font-sans uppercase tracking-widest text-[10px] hover:bg-[#1A1A1A] transition-all"
                    >
                        + Nueva Mesa
                    </button>
                </div>
            }
        >
            <Head title="Gestión de Mesas" />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Panel de Mesas */}
                        <div className="flex-1 space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                {event.tables.map((table) => (
                                    <div key={table.id} className="bg-white border border-[#E0E0E0] shadow-sm p-6 relative group">
                                        <button
                                            onClick={() => deleteTable(table.id)}
                                            className="absolute top-4 right-4 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>

                                        <div className="mb-6">
                                            <h3 className="text-2xl font-serif text-[#1A1A1A]">{table.name}</h3>
                                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                                                Capacidad: {table.members.length} / {table.capacity}
                                            </p>
                                        </div>

                                        <div className="space-y-2 min-h-[100px] border-2 border-dashed border-gray-50 rounded-lg p-2">
                                            {table.members.map((member) => (
                                                <div key={member.id} className="flex justify-between items-center bg-gray-50 p-3 rounded group/item">
                                                    <span className="text-sm font-sans text-gray-700">{member.name}</span>
                                                    <button
                                                        onClick={() => unassignGuest(member.id)}
                                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                            {table.members.length === 0 && (
                                                <div className="h-full flex items-center justify-center py-8">
                                                    <p className="text-[10px] uppercase tracking-widest text-gray-300">Vacía</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {event.tables.length === 0 && (
                                <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-20 text-center">
                                    <h3 className="text-2xl font-serif text-gray-300 mb-4">No has creado mesas aún</h3>
                                    <button
                                        onClick={() => setShowingAddModal(true)}
                                        className="text-[#C5A059] font-sans uppercase tracking-widest text-xs font-bold"
                                    >
                                        Comenzar a organizar &rarr;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Invitados sin mesa */}
                        <div className="w-full lg:w-80">
                            <div className="bg-white border border-[#E0E0E0] shadow-sm sticky top-8">
                                <div className="p-6 border-b border-gray-100">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Invitados Pendientes</h4>
                                    <p className="text-xs text-gray-400 mt-1">{unassignedMembers.length} por ubicar</p>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
                                    {unassignedMembers.map((member) => (
                                        <div key={member.id} className="bg-[#FAF9F6] p-4 border border-gray-100">
                                            <p className="text-sm font-serif mb-3">{member.name}</p>
                                            <select
                                                className="w-full text-[10px] uppercase tracking-widest font-bold border-gray-200 focus:border-[#C5A059] focus:ring-0 rounded-none bg-white p-2"
                                                onChange={(e) => assignGuest(member.id, e.target.value)}
                                                value=""
                                            >
                                                <option value="" disabled>Asignar a...</option>
                                                {event.tables.map(t => (
                                                    <option key={t.id} value={t.id} disabled={t.members.length >= t.capacity}>
                                                        {t.name} ({t.members.length}/{t.capacity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    {unassignedMembers.length === 0 && (
                                        <div className="py-10 text-center">
                                            <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">¡Todo organizado!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Nueva Mesa */}
            <AnimatePresence>
                {showingAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md p-10 shadow-2xl relative"
                        >
                            <button onClick={() => setShowingAddModal(false)} className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-black">&times;</button>
                            <h3 className="text-3xl font-serif mb-8 text-[#1A1A1A] border-b border-gray-100 pb-4">Configurar Mesa</h3>

                            <form onSubmit={submitTable} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-bold">Nombre o Número</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border-0 border-b border-gray-200 focus:border-[#C5A059] focus:ring-0 font-serif text-xl p-0 py-2 bg-transparent"
                                        placeholder="Mesa 1, VIP, etc."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-bold">Capacidad Máxima</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={data.capacity}
                                        onChange={e => setData('capacity', e.target.value)}
                                        className="w-full border-0 border-b border-gray-200 focus:border-[#C5A059] focus:ring-0 font-sans text-xl p-0 py-2 bg-transparent"
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#1A1A1A] text-white px-10 py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all shadow-xl disabled:opacity-50"
                                    >
                                        Crear Mesa
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
