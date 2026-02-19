import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Crown, CheckCircle, XCircle, Code } from 'lucide-react';

export default function Show({ auth, design }) {
    const handleDelete = () => {
        if (confirm(`¿Eliminar la plantilla "${design.name}"? Esta acción no se puede deshacer.`)) {
            router.delete(route('admin.designs.destroy', design.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.designs.index')}
                            className="p-2 rounded-xl border border-gray-200 hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="font-serif text-2xl text-[#1A1A1A]">{design.name}</h2>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">slug: {design.slug}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('admin.designs.edit', design.id)}
                            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-[#C5A059] transition-all"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Editar
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 border-2 border-red-200 text-red-400 px-5 py-2.5 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Diseño: ${design.name}`} />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Thumbnail + Info Principal */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col md:flex-row">
                        <div className="md:w-64 h-48 md:h-auto bg-[#F0EDE8] flex items-center justify-center shrink-0">
                            {design.thumbnail ? (
                                <img src={design.thumbnail} alt={design.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-200 text-center p-8">
                                    <div className="text-4xl mb-2">🖼</div>
                                    <p className="text-xs">Sin thumbnail</p>
                                </div>
                            )}
                        </div>
                        <div className="p-8 flex-1">
                            <div className="flex gap-2 mb-4">
                                {design.is_premium ? (
                                    <span className="flex items-center gap-1 bg-[#C5A059]/10 text-[#C5A059] text-[9px] uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                                        <Crown className="w-3 h-3" /> Premium
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-400 text-[9px] uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                                        Gratuita
                                    </span>
                                )}
                                {design.is_active ? (
                                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[9px] uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                                        <CheckCircle className="w-3 h-3" /> Activa
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 bg-red-50 text-red-400 text-[9px] uppercase tracking-wider px-3 py-1 rounded-full font-bold">
                                        <XCircle className="w-3 h-3" /> Inactiva
                                    </span>
                                )}
                            </div>
                            <h3 className="text-3xl font-serif text-[#1A1A1A] mb-2">{design.name}</h3>
                            <p className="text-sm text-gray-400 font-mono mb-6">ID #{design.id}</p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Slug (Template ID)</p>
                                    <code className="text-[#C5A059] bg-[#FDFAF5] px-3 py-1 rounded-lg text-sm font-mono">{design.slug}</code>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Creado</p>
                                    <p className="text-[#1A1A1A] font-sans">{new Date(design.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Archivo del template */}
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Code className="w-5 h-5 text-[#C5A059]" />
                            <h3 className="font-serif text-lg text-[#1A1A1A]">Archivo de Template</h3>
                        </div>
                        <div className="bg-[#1A1A1A] rounded-xl p-5 font-mono text-sm">
                            <p className="text-gray-500 text-xs mb-2">// Ruta del archivo JSX</p>
                            <p className="text-[#C5A059]">
                                resources/js/Templates/<span className="text-white">{design.slug}.jsx</span>
                            </p>
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-sans">
                            El slug <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#C5A059]">{design.slug}</code> debe coincidir exactamente con el nombre del archivo JSX en la carpeta <code className="bg-gray-100 px-1.5 py-0.5 rounded">Templates/</code>.
                            Consulta <code className="bg-gray-100 px-1.5 py-0.5 rounded">docs/TEMPLATES.md</code> para más información.
                        </p>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
