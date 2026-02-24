import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft } from 'lucide-react';

// ✅ SUB-COMPONENTES FUERA DEL COMPONENTE PRINCIPAL
// Esto evita que React los recree en cada render (cada keystroke),
// lo que causaba la pérdida de foco al escribir.
const InputField = ({ label, id, type = "text", errors = {}, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888] mb-2">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            className="w-full border border-[#E0E0E0] bg-[#F9F9F7] px-4 py-3 text-sm text-[#1A1A1A] focus:ring-[#C5A059] focus:border-[#C5A059]"
            {...props}
        />
        {errors[id] && <p className="text-red-500 text-xs mt-1">{errors[id]}</p>}
    </div>
);

const CheckboxField = ({ label, id, ...props }) => (
    <label className="flex items-center gap-3 cursor-pointer">
        <input
            type="checkbox"
            id={id}
            name={id}
            className="w-5 h-5 text-[#C5A059] border-gray-300 rounded focus:ring-[#C5A059]"
            {...props}
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

export default function Edit({ auth, plan }) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.name || '',
        slug: plan.slug || '',
        description: plan.description || '',
        price: plan.price || '0.00',
        billing_type: plan.billing_type || 'subscription',
        duration_months: plan.duration_months || '',
        max_events: plan.max_events ?? '',
        max_guests: plan.max_guests ?? '',
        days_accessible_before: plan.days_accessible_before ?? '',
        max_admins: plan.max_admins ?? '1',
        storage_mb: plan.storage_mb ?? '',
        max_providers: plan.max_providers ?? '',
        max_lists: plan.max_lists ?? '',
        feature_rsvp: !!plan.feature_rsvp,
        feature_custom_site: !!plan.feature_custom_site,
        feature_custom_domain: !!plan.feature_custom_domain,
        feature_advanced_reports: !!plan.feature_advanced_reports,
        feature_export_data: !!plan.feature_export_data,
        feature_provider_integration: !!plan.feature_provider_integration,
        is_active: !!plan.is_active,
        sort_order: plan.sort_order ?? '0',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.plans.update', plan.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-serif text-2xl">Editar Plan: {plan.name}</h2>}>
            <Head title={`Editar ${plan.name}`} />
            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Link href={route('admin.plans.index')} className="inline-flex items-center text-xs uppercase tracking-widest text-gray-500 hover:text-[#C5A059] mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la lista
                    </Link>

                    <form onSubmit={submit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                        {/* Datos Principales */}
                        <div>
                            <h3 className="text-lg font-serif mb-4 border-b pb-2">Datos Principales</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <InputField label="Nombre del Plan *" id="name" value={data.name} onChange={e => setData('name', e.target.value)} errors={errors} required />
                                <InputField label="Slug (URL amigable) - Opcional" id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} errors={errors} placeholder="ej: plan-pro" />
                                <div className="col-span-2">
                                    <InputField label="Descripción" id="description" value={data.description} onChange={e => setData('description', e.target.value)} errors={errors} />
                                </div>
                                <InputField label="Precio (USD) *" id="price" type="number" step="0.01" value={data.price} onChange={e => setData('price', e.target.value)} errors={errors} required />
                                <div>
                                    <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-[#888888] mb-2">Tipo de Cobro *</label>
                                    <select
                                        name="billing_type"
                                        className="w-full border border-[#E0E0E0] bg-[#F9F9F7] px-4 py-3 text-sm focus:ring-[#C5A059]"
                                        value={data.billing_type}
                                        onChange={e => setData('billing_type', e.target.value)}
                                    >
                                        <option value="subscription">Suscripción Mensual</option>
                                        <option value="one_time">Pago Único</option>
                                        <option value="free_trial">Prueba Gratis</option>
                                    </select>
                                </div>
                                <InputField label="Orden visual (0, 1, 2...)" id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', e.target.value)} errors={errors} />
                                <div className="flex items-center pt-6">
                                    <CheckboxField label="Plan Activo (Visible en la web)" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                </div>
                            </div>
                        </div>

                        {/* Límites Operativos */}
                        <div>
                            <h3 className="text-lg font-serif mb-4 border-b pb-2">
                                Límites Operativos
                                <span className="text-xs text-gray-400 font-sans ml-2">(Dejar en blanco para ilimitado)</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-6">
                                <InputField label="Max. Eventos Activos" id="max_events" type="number" value={data.max_events} onChange={e => setData('max_events', e.target.value)} errors={errors} />
                                <InputField label="Max. Invitados" id="max_guests" type="number" value={data.max_guests} onChange={e => setData('max_guests', e.target.value)} errors={errors} />
                                <InputField label="Días de acceso previo" id="days_accessible_before" type="number" value={data.days_accessible_before} onChange={e => setData('days_accessible_before', e.target.value)} errors={errors} />
                                <InputField label="Max. Administradores" id="max_admins" type="number" value={data.max_admins} onChange={e => setData('max_admins', e.target.value)} errors={errors} required />
                                <InputField label="Almacenamiento (MB)" id="storage_mb" type="number" value={data.storage_mb} onChange={e => setData('storage_mb', e.target.value)} errors={errors} />
                                <InputField label="Max. Proveedores" id="max_providers" type="number" value={data.max_providers} onChange={e => setData('max_providers', e.target.value)} errors={errors} />
                            </div>
                        </div>

                        {/* Funcionalidades */}
                        <div>
                            <h3 className="text-lg font-serif mb-4 border-b pb-2">Funcionalidades Incluidas</h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <CheckboxField label="Confirmación de asistencia (RSVP)" id="feature_rsvp" checked={data.feature_rsvp} onChange={e => setData('feature_rsvp', e.target.checked)} />
                                <CheckboxField label="Sitio web personalizado" id="feature_custom_site" checked={data.feature_custom_site} onChange={e => setData('feature_custom_site', e.target.checked)} />
                                <CheckboxField label="Dominio propio (Marca blanca)" id="feature_custom_domain" checked={data.feature_custom_domain} onChange={e => setData('feature_custom_domain', e.target.checked)} />
                                <CheckboxField label="Reportes avanzados" id="feature_advanced_reports" checked={data.feature_advanced_reports} onChange={e => setData('feature_advanced_reports', e.target.checked)} />
                                <CheckboxField label="Exportar datos (Excel/PDF)" id="feature_export_data" checked={data.feature_export_data} onChange={e => setData('feature_export_data', e.target.checked)} />
                                <CheckboxField label="Integración de proveedores" id="feature_provider_integration" checked={data.feature_provider_integration} onChange={e => setData('feature_provider_integration', e.target.checked)} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#1A1A1A] text-white px-10 py-4 rounded-xl uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#C5A059] transition-all flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing ? 'Actualizando...' : 'Actualizar Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}