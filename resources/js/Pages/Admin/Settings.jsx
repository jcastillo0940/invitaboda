import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Settings, CreditCard, DollarSign, Globe } from 'lucide-react';

const FieldGroup = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-4 px-8 py-6 border-b border-gray-50">
            <div className="bg-gray-50 p-3 rounded-xl">
                <Icon className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A]">{title}</h3>
        </div>
        <div className="p-8 space-y-6">
            {children}
        </div>
    </div>
);

const Field = ({ label, description, children }) => (
    <div className="flex items-start justify-between gap-8">
        <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888] mb-1">{label}</label>
            {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
        <div className="w-72 flex-shrink-0">
            {children}
        </div>
    </div>
);

export default function AdminSettings({ auth, settings }) {
    const s = (key) => settings[key]?.value ?? '';

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        site_name: s('site_name'),
        contact_email: s('contact_email'),
        currency: s('currency'),
        payment_mode: s('payment_mode'),
        price_basic: s('price_basic'),
        price_premium: s('price_premium'),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-serif text-2xl text-[#1A1A1A]">Configuración del Sistema</h2>}
        >
            <Head title="Admin Settings" />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">

                    {recentlySuccessful && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3">
                            <span className="text-lg">✓</span>
                            <span className="text-sm font-bold">Configuración guardada correctamente</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8">

                        {/* General */}
                        <FieldGroup title="General" icon={Globe}>
                            <Field label="Nombre del Sitio" description="Aparece en correos y notificaciones">
                                <input
                                    type="text"
                                    value={data.site_name}
                                    onChange={e => setData('site_name', e.target.value)}
                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm font-serif"
                                />
                            </Field>
                            <Field label="Email de Contacto" description="Dirección para recibir consultas">
                                <input
                                    type="email"
                                    value={data.contact_email}
                                    onChange={e => setData('contact_email', e.target.value)}
                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm font-serif"
                                />
                            </Field>
                        </FieldGroup>

                        {/* Pagos */}
                        <FieldGroup title="Configuración de Pagos" icon={CreditCard}>
                            <Field label="Divisa" description="Código ISO 4217 (USD, CRC, EUR)">
                                <input
                                    type="text"
                                    value={data.currency}
                                    onChange={e => setData('currency', e.target.value)}
                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm font-serif uppercase"
                                    maxLength={3}
                                />
                            </Field>
                            <Field label="Modo de Pago" description="Sandbox para pruebas, Production para cobros reales">
                                <select
                                    value={data.payment_mode}
                                    onChange={e => setData('payment_mode', e.target.value)}
                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm bg-transparent"
                                >
                                    <option value="sandbox">🧪 Sandbox (Pruebas)</option>
                                    <option value="production">🚀 Production (Real)</option>
                                </select>
                            </Field>
                        </FieldGroup>

                        {/* Precios */}
                        <FieldGroup title="Precios" icon={DollarSign}>
                            <Field label="Precio Plan Básico" description="Precio mensual. 0 = gratis">
                                <div className="relative">
                                    <span className="absolute left-0 bottom-2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price_basic}
                                        onChange={e => setData('price_basic', e.target.value)}
                                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm font-serif pl-5"
                                    />
                                </div>
                            </Field>
                            <Field label="Precio Plan Premium" description="Precio mensual del plan de pago">
                                <div className="relative">
                                    <span className="absolute left-0 bottom-2 text-gray-400 text-sm">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.price_premium}
                                        onChange={e => setData('price_premium', e.target.value)}
                                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm font-serif pl-5"
                                    />
                                </div>
                            </Field>
                        </FieldGroup>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#C5A059] hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all duration-500 flex items-center gap-2 disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Guardando...' : 'Guardar Configuración'}
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
