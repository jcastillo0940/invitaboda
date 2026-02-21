import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Guests({ auth, event, stats }) {
    const [showingAddModal, setShowingAddModal] = useState(false);

    const [showingWhatsAppModal, setShowingWhatsAppModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        group_name: '',
        total_passes: 1,
        contact_phone: '',
        members: [{ name: '' }]
    });

    const { data: wsData, setData: setWsData, put: putWs, processing: wsProcessing } = useForm({
        settings: {
            whatsapp_template: event.settings?.whatsapp_template || '¡Hola {nombre}! Nos encantaría que nos acompañes en nuestro gran día. Aquí tienes tu invitación personalizada: {link}'
        }
    });

    const addMemberRow = () => {
        setData('members', [...data.members, { name: '' }]);
    };

    const removeMemberRow = (index) => {
        const newMembers = data.members.filter((_, i) => i !== index);
        setData('members', newMembers);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('guests.store', event.id), {
            onSuccess: () => {
                setShowingAddModal(false);
                reset();
            }
        });
    };

    const submitWhatsAppTemplate = (e) => {
        e.preventDefault();
        putWs(route('events.update', event.id), {
            onSuccess: () => setShowingWhatsAppModal(false)
        });
    };

    const deleteGroup = (groupId) => {
        if (confirm('¿Estás seguro de eliminar este invitado?')) {
            router.delete(route('guests.destroy', [event.id, groupId]));
        }
    };

    const getPersonalizedLink = (groupSlug) => {
        return `${window.location.origin}/${event.slug}?g=${groupSlug}`;
    };

    const copyLink = (groupSlug) => {
        const url = getPersonalizedLink(groupSlug);
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
    };

    const sendWhatsApp = (group) => {
        if (!group.contact_phone) {
            alert('Este invitado no tiene un número de teléfono registrado.');
            return;
        }

        const link = getPersonalizedLink(group.slug);
        let message = wsData.settings.whatsapp_template
            .replace('{nombre}', group.group_name)
            .replace('{link}', link);

        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = group.contact_phone.replace(/\D/g, ''); // Remove non-digits
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">Lista de Invitados: {event.name}</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowingWhatsAppModal(true)}
                            className="border border-[#C5A059] text-[#C5A059] px-6 py-2 font-sans uppercase tracking-widest text-[10px] hover:bg-[#C5A059] hover:text-white transition-all"
                        >
                            Configurar WhatsApp
                        </button>
                        <button
                            onClick={() => setShowingAddModal(true)}
                            className="bg-[#C5A059] text-white px-6 py-2 font-sans uppercase tracking-widest text-[10px] hover:bg-[#1A1A1A] transition-all"
                        >
                            + Nuevo Grupo
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Gestión de Invitados" />

            <div className="py-12 bg-[#F9F9F7]">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Grupos', value: stats.total_groups },
                            { label: 'Invitados Totales', value: stats.total_guests },
                            { label: 'Confirmados', value: stats.confirmed_guests, color: 'text-green-600' },
                            { label: 'Pendientes', value: stats.pending_guests, color: 'text-amber-600' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 border border-[#E0E0E0] shadow-sm">
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{stat.label}</p>
                                <p className={`text-3xl font-serif ${stat.color || 'text-[#1A1A1A]'}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Guest Table */}
                    <div className="bg-white border border-[#E0E0E0] shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-[#E0E0E0]">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Grupo / Familia</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Pases</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Estado</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Link Personalizado</th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {event.guest_groups.map((group) => (
                                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-serif text-lg text-[#1A1A1A]">{group.group_name}</div>
                                            <div className="text-[10px] text-gray-400 font-sans uppercase tracking-widest">
                                                {group.members?.length || 0} integrantes · {group.contact_phone || 'Sin teléfono'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-sans text-sm">{group.total_passes}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] uppercase tracking-widest px-2 py-1 font-bold ${group.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {group.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-gray-50 border border-gray-100 px-3 py-1 rounded text-[10px] text-gray-500 font-mono truncate max-w-[150px]">
                                                    {event.slug}?g={group.slug}
                                                </div>
                                                <button
                                                    onClick={() => copyLink(group.slug)}
                                                    className="text-[#C5A059] hover:text-[#1A1A1A] transition-colors p-1"
                                                    title="Copiar Enlace"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => sendWhatsApp(group)}
                                                    className="text-green-500 hover:text-green-700 transition-colors p-1"
                                                    title="Enviar por WhatsApp"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteGroup(group.id)}
                                                className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-600 font-bold transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {event.guest_groups.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center italic text-gray-400 font-serif">Aún no hay invitados registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Agregar */}
            <AnimatePresence>
                {showingAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl p-8 md:p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowingAddModal(false)} className="absolute top-8 right-8 text-2xl text-gray-400 hover:text-black">&times;</button>
                            <h3 className="text-3xl font-serif mb-8 border-b border-gray-100 pb-4 text-[#1A1A1A]">Nuevo Grupo de Invitados</h3>

                            <form onSubmit={submit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-bold">Nombre del Grupo / Familia</label>
                                        <input
                                            type="text"
                                            value={data.group_name}
                                            onChange={e => setData('group_name', e.target.value)}
                                            className="w-full border-0 border-b border-gray-200 focus:border-[#C5A059] focus:ring-0 font-serif text-xl p-0 py-2 bg-transparent"
                                            placeholder="Ej: Familia Castillo"
                                            required
                                        />
                                        {errors.group_name && <div className="text-red-500 text-[10px] mt-1 uppercase">{errors.group_name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-bold">Pases de Cortesía</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.total_passes}
                                            onChange={e => setData('total_passes', e.target.value)}
                                            className="w-full border-0 border-b border-gray-200 focus:border-[#C5A059] focus:ring-0 font-sans text-xl p-0 py-2 bg-transparent"
                                        />
                                        {errors.total_passes && <div className="text-red-500 text-[10px] mt-1 uppercase">{errors.total_passes}</div>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-1 gap-8">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-bold">Teléfono de Contacto (Preferiblemente con WhatsApp)</label>
                                        <input
                                            type="text"
                                            value={data.contact_phone}
                                            onChange={e => setData('contact_phone', e.target.value)}
                                            className="w-full border-0 border-b border-gray-200 focus:border-[#C5A059] focus:ring-0 font-sans text-xl p-0 py-2 bg-transparent"
                                            placeholder="Ej: +506 8888 8888"
                                        />
                                        {errors.contact_phone && <div className="text-red-500 text-[10px] mt-1 uppercase">{errors.contact_phone}</div>}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#888888] font-bold">Integrantes Individuales</label>
                                        <button
                                            type="button"
                                            onClick={addMemberRow}
                                            className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest hover:text-[#1A1A1A] transition-colors"
                                        >
                                            + Añadir Integrante
                                        </button>
                                    </div>
                                    <div className="grid gap-4 max-h-60 overflow-y-auto pr-2">
                                        {data.members.map((member, idx) => (
                                            <div key={idx} className="flex gap-4 items-center group">
                                                <input
                                                    type="text"
                                                    placeholder={`Nombre del invitado ${idx + 1}`}
                                                    value={member.name}
                                                    onChange={e => {
                                                        const members = [...data.members];
                                                        members[idx].name = e.target.value;
                                                        setData('members', members);
                                                    }}
                                                    className="flex-1 border-0 border-b border-gray-100 focus:border-[#C5A059] focus:ring-0 text-sm p-0 py-2 bg-transparent"
                                                    required
                                                />
                                                {data.members.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMemberRow(idx)}
                                                        className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#1A1A1A] text-white px-12 py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all disabled:opacity-50 shadow-xl"
                                    >
                                        {processing ? 'Guardando...' : 'Registrar Invitado'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Configurar WhatsApp */}
            <AnimatePresence>
                {showingWhatsAppModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl p-8 md:p-12 shadow-2xl relative"
                        >
                            <button onClick={() => setShowingWhatsAppModal(false)} className="absolute top-8 right-8 text-2xl text-gray-400 hover:text-black">&times;</button>
                            <h3 className="text-3xl font-serif mb-4 border-b border-gray-100 pb-4 text-[#1A1A1A]">Personalizar Mensaje de WhatsApp</h3>
                            <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">Utiliza las etiquetas para personalizar el mensaje.</p>

                            <form onSubmit={submitWhatsAppTemplate} className="space-y-8">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-bold">Mensaje Predeterminado</label>
                                    <textarea
                                        value={wsData.settings.whatsapp_template}
                                        onChange={e => setWsData('settings', { ...wsData.settings, whatsapp_template: e.target.value })}
                                        className="w-full border border-gray-100 focus:border-[#C5A059] focus:ring-0 font-sans text-sm p-4 h-40 bg-gray-50 resize-none"
                                        placeholder="Ej: ¡Hola {nombre}!..."
                                        required
                                    />
                                    <div className="mt-4 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setWsData('settings', { ...wsData.settings, whatsapp_template: wsData.settings.whatsapp_template + '{nombre}' })}
                                            className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            + {`{nombre}`}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWsData('settings', { ...wsData.settings, whatsapp_template: wsData.settings.whatsapp_template + '{link}' })}
                                            className="text-[10px] bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            + {`{link}`}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8">
                                    <button
                                        type="submit"
                                        disabled={wsProcessing}
                                        className="bg-[#1A1A1A] text-white px-12 py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all disabled:opacity-50 shadow-xl"
                                    >
                                        {wsProcessing ? 'Guardando...' : 'Guardar Template'}
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
