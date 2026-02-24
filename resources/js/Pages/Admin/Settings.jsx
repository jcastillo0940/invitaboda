import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Save, CreditCard, DollarSign, Globe, CheckCircle2, XCircle } from 'lucide-react';

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

// Agregamos paymentMethods a las props que recibe el componente
export default function AdminSettings({ auth, settings, paymentMethods }) {
    const s = (key) => settings[key]?.value ?? '';

    // Eliminamos los precios del formulario general
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        site_name: s('site_name'),
        contact_email: s('contact_email'),
        currency: s('currency'),
        payment_mode: s('payment_mode'),
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'), { preserveScroll: true });
    };

    // Función que envía el clic del switch al backend sin recargar la página
    const togglePaymentMethod = (methodId, currentState) => {
        router.put(route('admin.settings.payment-methods.toggle', methodId), {
            is_active: !currentState
        }, {
            preserveScroll: true,
        });
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

                        {/* Opciones Generales de Pago */}
                        <FieldGroup title="Opciones Generales de Pago" icon={DollarSign}>
                            <Field label="Divisa Principal" description="Código ISO 4217 (ej. USD)">
                                <input
                                    type="text"
                                    value={data.currency}
                                    onChange={e => setData('currency', e.target.value)}
                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 pb-2 text-sm font-serif uppercase"
                                    maxLength={3}
                                />
                            </Field>
                            <Field label="Entorno de Transacciones" description="Sandbox para pruebas, Production para cobros reales">
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

                        {/* Pasarelas de Pago Dinámicas */}
                        <FieldGroup title="Pasarelas de Pago Habilitadas" icon={CreditCard}>
                            <div className="space-y-4">
                                {paymentMethods && paymentMethods.map((method) => (
                                    <div key={method.id} className={`flex items-center justify-between p-5 rounded-xl border transition-all ${method.is_active ? 'bg-white border-green-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                        <div className="flex items-center gap-4">
                                            {method.is_active ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-gray-300" />
                                            )}
                                            <div>
                                                <h4 className="font-serif text-[#1A1A1A]">{method.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{method.identifier}</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => togglePaymentMethod(method.id, method.is_active)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${method.is_active ? 'bg-[#C5A059]' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${method.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                ))}
                                {!paymentMethods || paymentMethods.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No hay métodos de pago configurados.</p>
                                ) : null}
                            </div>
                        </FieldGroup>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#C5A059] hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all duration-500 flex items-center gap-2 disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Guardando...' : 'Guardar Opciones Generales'}
                            </button>
                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}