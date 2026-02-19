import React, { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, CheckCircle, Save, Crown } from 'lucide-react';

export default function Edit({ auth, design }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'PUT',
        name: design.name,
        is_premium: design.is_premium ? '1' : '0',
        is_active: design.is_active ? '1' : '0',
        thumbnail: null, // null = no reemplazar
    });

    const [preview, setPreview] = useState(design.thumbnail || null);
    const fileRef = useRef(null);

    const handleFile = (file) => {
        if (!file) return;
        setData('thumbnail', file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    };

    const removeThumbnail = () => {
        setData('thumbnail', null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        // Usamos post con _method: PUT para poder enviar el multipart
        post(route('admin.designs.update', design.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.designs.index')}
                        className="p-2 rounded-xl border border-gray-200 hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="font-serif text-2xl text-[#1A1A1A]">Editar Plantilla</h2>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{design.slug}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Editar: ${design.name}`} />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} encType="multipart/form-data">
                        <div className="space-y-6">

                            {/* Nombre */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-3">
                                    Nombre de la Plantilla
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ej: Clásico Elegante"
                                    className="w-full border-0 border-b-2 border-gray-200 focus:border-[#C5A059] outline-none text-xl font-serif text-[#1A1A1A] py-2 bg-transparent transition-colors"
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-xs mt-2">{errors.name}</p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-3 font-mono">
                                    Slug generado:{' '}
                                    <strong>
                                        {data.name
                                            ? data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                            : design.slug}
                                    </strong>
                                    <span className="text-amber-500 ml-2">⚠ Cambiar el nombre cambiará el slug</span>
                                </p>
                            </div>

                            {/* Thumbnail */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-4">
                                    Thumbnail / Vista Previa
                                </label>

                                {preview ? (
                                    <div className="relative rounded-xl overflow-hidden border-2 border-[#C5A059]/30 group">
                                        <img
                                            src={preview}
                                            alt="Thumbnail"
                                            className="w-full h-56 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => fileRef.current?.click()}
                                                className="bg-white text-[#1A1A1A] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] hover:text-white transition-all"
                                            >
                                                Cambiar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeThumbnail}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" /> Quitar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={e => e.preventDefault()}
                                        onClick={() => fileRef.current?.click()}
                                        className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-[#C5A059] hover:bg-[#FDFAF5] transition-all group"
                                    >
                                        <Upload className="w-8 h-8 text-gray-200 group-hover:text-[#C5A059] mx-auto mb-4 transition-colors" />
                                        <p className="text-sm font-serif text-gray-400 mb-1">
                                            Arrastra una imagen o haz click
                                        </p>
                                        <p className="text-[10px] text-gray-300 uppercase tracking-widest">
                                            JPG, PNG, WebP — Máx 4MB
                                        </p>
                                    </div>
                                )}

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleFile(e.target.files[0])}
                                />
                            </div>

                            {/* Opciones */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 mb-6">
                                    Opciones
                                </label>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Premium */}
                                    <button
                                        type="button"
                                        onClick={() => setData('is_premium', data.is_premium === '1' ? '0' : '1')}
                                        className={`flex items-center gap-3 p-5 rounded-xl border-2 transition-all text-left ${data.is_premium === '1'
                                                ? 'border-[#C5A059] bg-[#FDFAF5] text-[#C5A059]'
                                                : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        <Crown className={`w-6 h-6 ${data.is_premium === '1' ? 'text-[#C5A059]' : 'text-gray-200'}`} />
                                        <div>
                                            <p className="font-bold text-xs uppercase tracking-widest">Premium</p>
                                            <p className="text-[10px] mt-0.5 text-gray-400">Solo usuarios pagos</p>
                                        </div>
                                    </button>

                                    {/* Activo */}
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', data.is_active === '1' ? '0' : '1')}
                                        className={`flex items-center gap-3 p-5 rounded-xl border-2 transition-all text-left ${data.is_active === '1'
                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                                                : 'border-gray-100 text-gray-400 hover:border-gray-200'
                                            }`}
                                    >
                                        <CheckCircle className={`w-6 h-6 ${data.is_active === '1' ? 'text-emerald-500' : 'text-gray-200'}`} />
                                        <div>
                                            <p className="font-bold text-xs uppercase tracking-widest">
                                                {data.is_active === '1' ? 'Activo' : 'Inactivo'}
                                            </p>
                                            <p className="text-[10px] mt-0.5 text-gray-400">Visible para usuarios</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4">
                                <Link
                                    href={route('admin.designs.index')}
                                    className="flex-1 py-4 border-2 border-gray-200 rounded-xl text-center font-sans font-bold uppercase tracking-widest text-sm text-gray-500 hover:border-gray-400 transition-all"
                                >
                                    Cancelar
                                </Link>
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex-1 py-4 bg-[#1A1A1A] text-white rounded-xl font-sans font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-[#C5A059] transition-all disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </motion.button>
                            </div>

                            {recentlySuccessful && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-emerald-500 text-sm font-sans"
                                >
                                    ✓ Cambios guardados
                                </motion.p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
