import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Palette, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index({ auth, designs }) {
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDelete = (design) => {
        setConfirmDelete(design);
    };

    const confirmDestroy = () => {
        router.delete(route('admin.designs.destroy', confirmDelete.id), {
            onFinish: () => setConfirmDelete(null),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-serif text-2xl text-[#1A1A1A]">Plantillas de Diseño</h2>
                        <p className="text-xs text-gray-400 mt-1 font-sans uppercase tracking-widest">
                            {designs.length} plantilla{designs.length !== 1 ? 's' : ''} registrada{designs.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Link
                        href={route('admin.designs.create')}
                        className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl uppercase tracking-widest text-[10px] font-sans font-bold hover:bg-[#C5A059] transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nueva Plantilla
                    </Link>
                </div>
            }
        >
            <Head title="Admin → Diseños" />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Flash message */}
                    {/* Grid de plantillas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {designs.length > 0 ? (
                            designs.map((design) => (
                                <motion.div
                                    key={design.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-[4/3] bg-[#F0EDE8] flex items-center justify-center relative overflow-hidden">
                                        {design.thumbnail ? (
                                            <img
                                                src={design.thumbnail}
                                                alt={design.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <Palette className="w-12 h-12 text-gray-200" />
                                                <span className="text-[10px] uppercase tracking-widest text-gray-300">Sin thumbnail</span>
                                            </div>
                                        )}

                                        {/* Overlay de acciones */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                                            <Link
                                                href={route('admin.designs.show', design.id)}
                                                className="bg-white text-[#1A1A1A] p-3 rounded-full hover:bg-[#C5A059] hover:text-white transition-all shadow-lg transform translate-y-3 group-hover:translate-y-0 duration-300 delay-[0ms]"
                                                title="Ver"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={route('admin.designs.edit', design.id)}
                                                className="bg-white text-[#1A1A1A] p-3 rounded-full hover:bg-[#1A1A1A] hover:text-white transition-all shadow-lg transform translate-y-3 group-hover:translate-y-0 duration-300 delay-[50ms]"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(design)}
                                                className="bg-white text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg transform translate-y-3 group-hover:translate-y-0 duration-300 delay-[100ms]"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                                            {design.is_premium && (
                                                <span className="flex items-center gap-1 bg-[#C5A059] text-black text-[8px] uppercase tracking-wider px-2 py-1 rounded-full font-bold shadow">
                                                    <Crown className="w-2.5 h-2.5" /> Premium
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-serif text-[#1A1A1A] leading-tight">{design.name}</h3>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{design.slug}</p>
                                            </div>
                                        </div>

                                        {/* Status + Actions row */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${design.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                                    {design.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('admin.designs.edit', design.id)}
                                                    className="text-[10px] text-gray-500 hover:text-[#1A1A1A] font-sans uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                >
                                                    <Pencil className="w-3 h-3" /> Editar
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-20 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                                <Palette className="w-16 h-16 text-gray-100 mb-6" />
                                <p className="font-serif text-xl text-gray-400 mb-6">Aún no hay diseños creados</p>
                                <Link
                                    href={route('admin.designs.create')}
                                    className="text-[#C5A059] font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:text-[#1A1A1A] transition-all"
                                >
                                    Crea el primero ahora <Plus className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <AnimatePresence>
                {confirmDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setConfirmDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-7 h-7 text-red-500" />
                            </div>
                            <h3 className="text-center font-serif text-2xl text-[#1A1A1A] mb-3">¿Eliminar plantilla?</h3>
                            <p className="text-center text-sm text-gray-500 font-sans mb-2">
                                Vas a eliminar <strong className="text-[#1A1A1A]">"{confirmDelete.name}"</strong>.
                            </p>
                            <p className="text-center text-xs text-red-400 mb-8">
                                Esta acción no se puede deshacer. Los eventos que usaban esta plantilla mostrarán el diseño fallback.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-sans font-bold uppercase tracking-widest text-gray-600 hover:border-gray-400 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDestroy}
                                    className="flex-1 py-3 bg-red-500 rounded-xl text-sm font-sans font-bold uppercase tracking-widest text-white hover:bg-red-600 transition-all"
                                >
                                    Sí, eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
