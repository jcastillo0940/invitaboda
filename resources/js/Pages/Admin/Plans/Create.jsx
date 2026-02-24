import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

// 1. MOVEMOS LOS SUB-COMPONENTES AFUERA PARA NO PERDER EL FOCO
const InputField = ({ label, id, type = "text", errors, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888] mb-2">{label}</label>
        <input 
            id={id} 
            type={type} 
            className="w-full border border-[#E0E0E0] bg-[#F9F9F7] px-4 py-3 text-sm text-[#1A1A1A] focus:ring-[#C5A059] focus:border-[#C5A059]" 
            {...props} 
        />
        {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </div>
);

const CheckboxField = ({ label, id, ...props }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" id={id} className="w-5 h-5 text-[#C5A059] border-gray-300 rounded focus:ring-[#C5A059]" {...props} />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', slug: '', description: '', price: '0.00', billing_type: 'subscription', duration_months: '',
        max_events: '', max_guests: '', days_accessible_before: '', max_admins: '1', storage_mb: '', max_providers: '', max_lists: '',
        feature_rsvp: false, feature_custom_site: false, feature_custom_domain: false, feature_advanced_reports: false, feature_export_data: false, feature_provider_integration: false,
        is_active: true, sort_order: '0',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.plans.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-serif text-2xl">Crear Nuevo Plan</h2>}>
            <Head title="Crear Plan" />
            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Link href={route('admin.plans.index')} className="inline-flex items-center text-xs uppercase tracking-widest text-gray-500 hover:text-[#C5A059] mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la lista
                    </Link>
                    
                    <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                        {/* Básicos */}
                        <div>
                            <h3 className="text-lg font-serif mb-4 border-b pb-2">Datos Principales</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <InputField label="Nombre del Plan *" id="name" value={data.name} onChange={e => setData('name', e.target.value)} errors={errors} required />
                                <InputField label="Slug (URL amigable)" id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} errors={errors} placeholder="ej: plan-pro" />
                                <div className="col-span-2">
                                    <InputField label="Descripción" id="description" value={data.description} onChange={e => setData('description', e.target.value)} errors={errors} />
                                </div>
                                <InputField label="Precio (USD) *" id="price" type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} errors={errors} required />
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888] mb-2">Tipo de Cobro *</label>
                                    <select className="w-full border border-[#E0E0E0] bg-[#F9F9F7] px-4 py-3 text-sm focus:ring-[#C5A059]" value={data.billing_type} onChange={e => setData('billing_type', e.target.value)}>
                                        <option value="subscription">Suscripción Mensual</option>
                                        <option value="one_time">Pago Único</option>
                                        <option value="free_trial">Prueba Gratis</option>
                                    </select>
                                </div>
                                <InputField label="Orden visual" id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} errors={errors} />
                                <div className="flex items-center pt-6">
                                    <CheckboxField label="Plan Activo" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                </div>
                            </div>
                        </div>

                        {/* Límites Operativos */}
                        <div>
                            <h3 className="text-lg font-serif mb-4 border-b pb-2">Límites Operativos</h3>
                            <div className="grid grid-cols-3 gap-6">
                                <InputField label="Max. Eventos" id="max_events" type="number" value={data.max_events} onChange={e => setData('max_events', e.target.value)} errors={errors} />
                                <InputField label="Max. Invitados" id="max_guests" type="number" value={data.max_guests} onChange={e => setData('max_guests', e.target.value)} errors={errors} />
                                <InputField label="Días previo" id="days_accessible_before" type="number" value={data.days_accessible_before} onChange={e => setData('days_accessible_before', e.target.value)} errors={errors} />
                                <InputField label="Max. Admins" id="max_admins" type="number" value={data.max_admins} onChange={e => setData('max_admins', e.target.value)} errors={errors} required />
                                <InputField label="Almacenamiento (MB)" id="storage_mb" type="number" value={data.storage_mb} onChange={e => setData('storage_mb', e.target.value)} errors={errors} />
                                <InputField label="Max. Proveedores" id="max_providers" type="number" value={data.max_providers} onChange={e => setData('max_providers', e.target.value)} errors={errors} />
                            </div>
                        </div>

                        {/* Funcionalidades */}
                        <div>
                            <h3 className="text-lg font-serif mb-4 border-b pb-2">Funcionalidades Incluidas</h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <CheckboxField label="RSVP" id="feature_rsvp" checked={data.feature_rsvp} onChange={e => setData('feature_rsvp', e.target.checked)} />
                                <CheckboxField label="Web Personalizada" id="feature_custom_site" checked={data.feature_custom_site} onChange={e => setData('feature_custom_site', e.target.checked)} />
                                <CheckboxField label="Marca Blanca" id="feature_custom_domain" checked={data.feature_custom_domain} onChange={e => setData('feature_custom_domain', e.target.checked)} />
                                <CheckboxField label="Reportes" id="feature_advanced_reports" checked={data.feature_advanced_reports} onChange={e => setData('feature_advanced_reports', e.target.checked)} />
                                <CheckboxField label="Exportar" id="feature_export_data" checked={data.feature_export_data} onChange={e => setData('feature_export_data', e.target.checked)} />
                                <CheckboxField label="Proveedores" id="feature_provider_integration" checked={data.feature_provider_integration} onChange={e => setData('feature_provider_integration', e.target.checked)} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={processing} className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#C5A059] transition-all flex items-center gap-2">
                                <Save className="w-4 h-4" /> {processing ? 'Guardando...' : 'Guardar Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}