import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { motion } from 'framer-motion';

export default function Settings({ auth, user }) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        agency_name: user.agency_name || '',
        agency_settings: user.agency_settings || {
            logo_url: '',
            brand_color: '#1A1A1A'
        }
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('agency.update-settings'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">Configuración de Agencia (White-Label)</h2>}
        >
            <Head title="Configuración de Agencia" />

            <div className="py-12 bg-[#F9F9F7]">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm border border-[#E0E0E0] p-12">
                        <form onSubmit={submit} className="space-y-12">
                            {/* General Branding */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold border-b border-[#F0F0F0] pb-4">Identidad de Marca</h3>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Nombre de la Agencia</label>
                                        <input
                                            type="text"
                                            value={data.agency_name}
                                            onChange={e => setData('agency_name', e.target.value)}
                                            className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-serif text-xl p-0 py-2"
                                            placeholder="Ej: Elite Weddings"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">URL del Logo (PNG/SVG)</label>
                                        <input
                                            type="text"
                                            value={data.agency_settings.logo_url}
                                            onChange={e => setData('agency_settings', { ...data.agency_settings, logo_url: e.target.value })}
                                            className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-2"
                                            placeholder="https://su-agencia.com/logo.png"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Color Corporativo</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={data.agency_settings.brand_color}
                                            onChange={e => setData('agency_settings', { ...data.agency_settings, brand_color: e.target.value })}
                                            className="w-12 h-12 border-0 p-0 bg-transparent cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-gray-400">{data.agency_settings.brand_color}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Preview White Label */}
                            <section className="bg-gray-50 p-8 border border-dashed border-gray-200">
                                <h4 className="text-[10px] uppercase tracking-widest text-gray-400 mb-6 text-center">Previsualización de tu Marca</h4>
                                <div className="flex justify-center flex-col items-center">
                                    {data.agency_settings.logo_url ? (
                                        <img src={data.agency_settings.logo_url} alt="Logo Agencia" className="h-12 object-contain mb-4" />
                                    ) : (
                                        <div className="h-12 flex items-center mb-4 italic text-gray-300 font-serif text-2xl">
                                            {data.agency_name || 'Tu Agencia'}
                                        </div>
                                    )}
                                    <div className="w-16 h-px" style={{ backgroundColor: data.agency_settings.brand_color }}></div>
                                </div>
                            </section>

                            <div className="flex justify-end pt-8">
                                <button
                                    disabled={processing}
                                    className="bg-[#1A1A1A] text-white px-12 py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Configuración B2B'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Notificación de éxito */}
            {recentlySuccessful && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-8 right-8 bg-[#1A1A1A] text-white px-8 py-4 rounded shadow-2xl z-50 font-sans text-[10px] uppercase tracking-widest"
                >
                    Configuración actualizada con éxito
                </motion.div>
            )}
        </AuthenticatedLayout>
    );
}
