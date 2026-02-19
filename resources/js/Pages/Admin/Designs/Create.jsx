import React, { useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft, Save, Upload, Image, X } from 'lucide-react';

export default function Create({ auth }) {
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        is_premium: false,
        is_active: true,
        thumbnail: null,
    });

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setData('thumbnail', file);
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.designs.store'), {
            forceFormData: true, // needed for file upload
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.designs.index')} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <h2 className="font-serif text-2xl text-[#1A1A1A]">Nuevo Diseño</h2>
                </div>
            }
        >
            <Head title="Crear Diseño" />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">

                    <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                        {/* LEFT: Thumbnail Upload */}
                        <div className="lg:col-span-2">
                            <div
                                className={`relative aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
                                    ${dragging ? 'border-[#C5A059] bg-[#C5A059]/5 scale-[1.02]' : 'border-gray-200 bg-white hover:border-[#C5A059]/50 hover:bg-gray-50'}`}
                                onClick={() => fileInputRef.current.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                            >
                                {preview ? (
                                    <>
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setPreview(null); setData('thumbnail', null); }}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur p-1.5 rounded-full shadow-lg hover:bg-red-50 transition-all"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            {dragging ? (
                                                <Upload className="w-8 h-8 text-[#C5A059] animate-bounce" />
                                            ) : (
                                                <Image className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-500">Arrastra tu imagen aquí</p>
                                            <p className="text-xs text-gray-400 mt-1">o haz click para seleccionar</p>
                                            <p className="text-[10px] text-gray-300 mt-2">JPG, PNG, WEBP — máx 2MB</p>
                                        </div>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                />
                            </div>
                            {errors.thumbnail && (
                                <p className="text-red-500 text-xs mt-2">{errors.thumbnail}</p>
                            )}
                            <p className="text-center text-[10px] text-gray-400 mt-3 uppercase tracking-widest">
                                Thumbnail del diseño
                            </p>
                        </div>

                        {/* RIGHT: Form Fields */}
                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 space-y-8">

                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-3 font-bold">Nombre del Diseño *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Elegancia Atemporal"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all duration-300 p-0 pb-2 text-xl font-serif placeholder:text-gray-200"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-2">{errors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Toggle Premium */}
                                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Premium</p>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={data.is_premium}
                                                    onChange={e => setData('is_premium', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C5A059]"></div>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400">¿Requiere suscripción?</p>
                                    </div>

                                    {/* Toggle Activo */}
                                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Activo</p>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={data.is_active}
                                                    onChange={e => setData('is_active', e.target.checked)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-400">¿Visible para usuarios?</p>
                                    </div>
                                </div>

                                {/* Slug Preview */}
                                {data.name && (
                                    <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Slug generado automáticamente</p>
                                        <p className="text-sm font-mono text-[#C5A059]">
                                            {data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                                        </p>
                                    </div>
                                )}

                            </div>

                            <div className="bg-gray-50 px-8 py-6 flex justify-end gap-4 border-t border-gray-100">
                                <Link
                                    href={route('admin.designs.index')}
                                    className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#1A1A1A] transition-all"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#1A1A1A] text-white px-10 py-3 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-[#C5A059] transition-all flex items-center gap-2 shadow-lg shadow-black/5 disabled:opacity-60"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Guardando...' : 'Crear Diseño'}
                                </button>
                            </div>
                        </div>

                    </form>

                    {/* ──────────────────────────────────────────────────────────── */}
                    {/* 💡 EXPLICACIÓN: ¿Cómo funciona el código del template? */}
                    {/* ──────────────────────────────────────────────────────────── */}
                    <div className="mt-12 bg-[#0f172a] rounded-2xl p-8 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-[#C5A059]/20 rounded-lg flex items-center justify-center text-[#C5A059] font-bold text-sm">💡</div>
                            <h3 className="text-lg font-serif">¿Cómo agrego el código de un diseño?</h3>
                        </div>
                        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                            <p>Los diseños son componentes <strong className="text-white">React (JSX)</strong> guardados en:</p>
                            <code className="block bg-slate-800 rounded-xl p-4 text-[#C5A059] font-mono text-xs">
                                resources/js/Templates/[slug-del-diseno].jsx
                            </code>
                            <p>El sistema busca automáticamente el componente usando el <strong className="text-white">slug</strong> del diseño. Por ejemplo, si el nombre es <em>"Elegancia Atemporal"</em>, el slug será <code className="text-[#C5A059]">elegancia-atemporal</code> y el archivo debe ser:</p>
                            <code className="block bg-slate-800 rounded-xl p-4 text-[#C5A059] font-mono text-xs">
                                resources/js/Templates/elegancia-atemporal.jsx
                            </code>
                            <p>Ese componente recibirá los datos del evento como <code className="text-[#C5A059]">props</code> y se renderizará como la invitación pública de la boda.</p>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
