import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateLoader from '@/Components/TemplateLoader';
import Envelope from '@/Components/Wedding/Envelope';

export default function Invitation({ event, guestGroup }) {
    const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
    const [showRSVP, setShowRSVP] = useState(false);

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        members: guestGroup?.members.map(m => ({
            id: m.id,
            name: m.name,
            is_attending: m.is_attending ?? true,
            menu_choice: m.menu_choice || '',
            drink_choice: m.drink_choice || '',
            allergies: m.allergies || ''
        })) || []
    });

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...data.members];
        newMembers[index][field] = value;
        setData('members', newMembers);
    };

    const submitRSVP = (e) => {
        e.preventDefault();
        post(route('rsvp.submit', guestGroup.id), {
            onSuccess: () => setShowRSVP(false)
        });
    };

    const defaultDesignData = {
        primaryNames: event.name || '',
        date: event.date || '',
        location: '',
        locationUrl: '',
        reception: '',
        receptionUrl: '',
        heroImageUrl: '',
        heroVideoUrl: '',
        gallery: [],
        itinerary: [],
        musicUrl: '',
        showCountdown: true,
        envelopeAnimation: { enabled: true, initials: '' },
        parents: {
            bride: { father: '', mother: '' },
            groom: { father: '', mother: '' }
        },
        ourStory: '',
        godparents: [],
        quote: '',
        weather: { enabled: false, city: '', apiKey: '', lat: null, lng: null },
        giftSettings: { type: 'none', registryUrl: '', bankDetails: '', freeText: '' },
        contact: { label: 'Contacto', phone: '', whatsapp: '' },
        accommodation: [],
        songSuggestions: false,
        guestBook: false,
        dressCode: { type: 'formal', customText: '' },
        hashtag: '',
        calendarEnabled: true,
        rsvpOptions: { askMenu: false, askDrinks: false, menuOptions: '', drinkOptions: '', askAllergies: true },
        mainColor: '#C5A059',
        secondaryColor: '#1A1A1A'
    };

    const savedData = event.design?.design_data || {};

    const designData = {
        ...defaultDesignData,
        ...savedData,
        envelopeAnimation: { ...defaultDesignData.envelopeAnimation, ...(savedData.envelopeAnimation || {}) },
        parents: {
            bride: { ...defaultDesignData.parents.bride, ...(savedData.parents?.bride || {}) },
            groom: { ...defaultDesignData.parents.groom, ...(savedData.parents?.groom || {}) }
        },
        weather: { ...defaultDesignData.weather, ...(savedData.weather || {}) },
        giftSettings: { ...defaultDesignData.giftSettings, ...(savedData.giftSettings || {}) },
        contact: { ...defaultDesignData.contact, ...(savedData.contact || {}) },
        dressCode: { ...defaultDesignData.dressCode, ...(savedData.dressCode || {}) },
        rsvpOptions: { ...defaultDesignData.rsvpOptions, ...(savedData.rsvpOptions || {}) }
    };

    const rsvpOptions = designData.rsvpOptions || { askMenu: false, askDrinks: false };

    return (
        <div className="min-h-screen bg-[#F5F5F0] text-[#333333] font-serif selection:bg-[#C5A059] selection:text-white overflow-x-hidden">
            <Head title={`Boda - ${event.name}`} />

            {/* Sobre de Bienvenida (Solo visible al cargar) */}
            <Envelope
                initials={designData.envelopeAnimation?.initials}
                enabled={designData.envelopeAnimation?.enabled}
                onOpen={() => setIsEnvelopeOpen(true)}
                mainColor={designData.mainColor}
            />

            <AnimatePresence>
                {/* La invitación se muestra una vez el sobre se abre o si el sobre está desactivado */}
                {(isEnvelopeOpen || !designData.envelopeAnimation?.enabled) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Template dinámico — se resuelve por slug del diseño */}
                        <div className="relative z-10">
                            <TemplateLoader
                                slug={event.design?.template_name}
                                data={designData}
                                guestGroup={guestGroup}
                                event={event}
                            />
                        </div>

                        {/* Botón de RSVP Flotante */}
                        {guestGroup && !showRSVP && !recentlySuccessful && (
                            <motion.div
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40"
                            >
                                <button
                                    onClick={() => setShowRSVP(true)}
                                    className="bg-[#1A1A1A] text-white px-12 py-5 font-sans uppercase tracking-[0.3em] text-[10px] hover:bg-[#C5A059] transition-all shadow-2xl rounded-full border border-white/10 backdrop-blur-sm bg-opacity-90"
                                >
                                    Confirmar Asistencia
                                </button>
                            </motion.div>
                        )}

                        {recentlySuccessful && (
                            <div className="bg-white py-20 px-6 text-center border-t border-[#C5A059]">
                                <h3 className="text-3xl italic text-[#C5A059] mb-4">¡Gracias por confirmar!</h3>
                                <p className="text-gray-400 font-sans text-xs uppercase tracking-widest">Hemos recibido tu respuesta con éxito.</p>
                            </div>
                        )}

                        {/* Formulario RSVP */}
                        <AnimatePresence>
                            {showRSVP && (
                                <motion.div
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 100 }}
                                    className="fixed inset-0 z-[60] bg-white overflow-y-auto"
                                >
                                    <div className="max-w-2xl mx-auto px-6 py-20">
                                        <div className="flex justify-between items-center mb-12">
                                            <h3 className="text-3xl font-serif text-[#1A1A1A]">Confirmar Asistencia</h3>
                                            <button
                                                onClick={() => setShowRSVP(false)}
                                                className="text-gray-400 hover:text-black font-sans text-xs uppercase tracking-widest"
                                            >
                                                Cerrar &times;
                                            </button>
                                        </div>

                                        <form onSubmit={submitRSVP} className="space-y-12">
                                            {data.members.map((member, index) => (
                                                <div key={member.id} className="pb-12 border-b border-gray-100 last:border-0">
                                                    <div className="md:flex justify-between items-center mb-6 space-y-4 md:space-y-0">
                                                        <h4 className="text-xl italic text-[#1A1A1A]">{member.name}</h4>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMemberChange(index, 'is_attending', true)}
                                                                className={`flex-1 md:flex-none px-6 py-3 text-[10px] uppercase tracking-widest border transition-all ${member.is_attending ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-gray-200 text-gray-400'}`}
                                                            >Asistiré</button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleMemberChange(index, 'is_attending', false)}
                                                                className={`flex-1 md:flex-none px-6 py-3 text-[10px] uppercase tracking-widest border transition-all ${!member.is_attending ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 text-gray-400'}`}
                                                            >No asistiré</button>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {member.is_attending && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="grid md:grid-cols-2 gap-6 overflow-hidden"
                                                            >
                                                                {rsvpOptions.askMenu && (
                                                                    <div>
                                                                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Elección de Menú</label>
                                                                        <select
                                                                            value={member.menu_choice}
                                                                            onChange={e => handleMemberChange(index, 'menu_choice', e.target.value)}
                                                                            className="w-full border-0 border-b border-gray-100 focus:border-[#C5A059] focus:ring-0 text-sm p-0 py-2"
                                                                        >
                                                                            <option value="">Seleccionar...</option>
                                                                            {rsvpOptions.menuOptions.split(',').map(opt => (
                                                                                <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Alergias / Notas</label>
                                                                    <input
                                                                        type="text"
                                                                        value={member.allergies}
                                                                        onChange={e => handleMemberChange(index, 'allergies', e.target.value)}
                                                                        className="w-full border-0 border-b border-gray-100 focus:border-[#C5A059] focus:ring-0 text-sm p-0 py-2"
                                                                        placeholder="Ej: Gluten, Lactosa..."
                                                                    />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}

                                            <div className="pt-12">
                                                <button
                                                    disabled={processing}
                                                    className="w-full bg-[#1A1A1A] text-white py-5 font-sans uppercase tracking-[0.4em] text-xs hover:bg-[#C5A059] transition-all shadow-2xl"
                                                >
                                                    {processing ? 'Procesando...' : 'Confirmar Todo'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
