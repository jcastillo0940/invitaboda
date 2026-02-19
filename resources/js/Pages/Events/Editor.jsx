import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import InvitationCard1 from '@/Components/Invitations/InvitationCard1';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music } from 'lucide-react';
import FileUploader from '@/Components/Media/FileUploader';

export default function Editor({ auth, event }) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        template_name: event.design?.template_name || 'InvitationCard1',
        design_data: event.design?.design_data || {
            primaryNames: event.name || '',
            date: event.date || '',
            location: '',
            locationUrl: '',
            reception: '',
            receptionUrl: '',
            heroImageUrl: '',
            heroVideoUrl: '',
            gallery: [], // Array of image URLs
            itinerary: [],
            musicUrl: '',
            showCountdown: true,
            rsvpOptions: {
                askMenu: false,
                askDrinks: false,
                menuOptions: 'Res, Pollo, Vegetariano',
                drinkOptions: 'Vino, Whisky, Soda'
            },
            mainColor: '#C5A059',
            secondaryColor: '#1A1A1A'
        }
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleDesignChange = (field, value) => {
        setData('design_data', {
            ...data.design_data,
            [field]: value
        });
    };

    const addItineraryItem = () => {
        const newItem = { time: '00:00', activity: '' };
        handleDesignChange('itinerary', [...(data.design_data.itinerary || []), newItem]);
    };

    const updateItineraryItem = (index, field, value) => {
        const newItinerary = [...data.design_data.itinerary];
        newItinerary[index][field] = value;
        handleDesignChange('itinerary', newItinerary);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('events.update-design', event.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">
                        Editor de Invitación: {event.name}
                    </h2>
                    <div className="flex gap-4">
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="bg-[#C5A059] text-white px-6 py-2 uppercase tracking-widest text-xs font-sans hover:bg-[#1A1A1A] transition-all"
                        >
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Editar ${event.name}`} />

            <div className="flex min-h-[calc(100vh-65px)] bg-[#F9F9F7]">
                {/* Panel Izquierdo: Formularios */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r border-[#E0E0E0]">
                    <div className="max-w-xl mx-auto">

                        {/* Tabs del Editor */}
                        <div className="flex gap-8 border-b border-[#E0E0E0] mb-8 overflow-x-auto">
                            {['general', 'multimedia', 'ubicacion', 'cronograma', 'estilo'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-[10px] uppercase tracking-[0.2em] font-sans whitespace-nowrap transition-all ${activeTab === tab ? 'border-b-2 border-[#C5A059] text-[#1A1A1A]' : 'text-gray-400'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={submit} className="space-y-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'general' && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Nombres Principales</label>
                                            <input
                                                type="text"
                                                value={data.design_data.primaryNames}
                                                onChange={e => handleDesignChange('primaryNames', e.target.value)}
                                                className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-serif text-xl p-0 py-2 bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Fecha del Evento</label>
                                            <input
                                                type="date"
                                                value={data.design_data.date}
                                                onChange={e => handleDesignChange('date', e.target.value)}
                                                className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans p-0 py-2 bg-transparent"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={data.design_data.showCountdown}
                                                onChange={e => handleDesignChange('showCountdown', e.target.checked)}
                                                className="rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                            />
                                            <label className="text-sm font-sans uppercase tracking-widest text-[#888888]">Mostrar Cuenta Regresiva</label>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'multimedia' && (
                                    <motion.div
                                        key="multimedia"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Imagen Hero (Portada)</label>
                                                {data.design_data.heroImageUrl && (
                                                    <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-xl border border-gray-100 group">
                                                        <img src={data.design_data.heroImageUrl} className="w-full h-full object-cover" alt="Hero Preview" />
                                                        <button
                                                            onClick={() => handleDesignChange('heroImageUrl', '')}
                                                            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                )}
                                                <FileUploader
                                                    event={event}
                                                    type="hero"
                                                    label="Subir y Encuadrar Hero"
                                                    aspect={16 / 9}
                                                    onUploadSuccess={(url) => handleDesignChange('heroImageUrl', url)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Video Hero (Opcional)</label>
                                                {data.design_data.heroVideoUrl && (
                                                    <div className="relative aspect-[16/9] mb-4 bg-black rounded-xl overflow-hidden flex items-center justify-center group">
                                                        <video src={data.design_data.heroVideoUrl} className="max-w-full max-h-full" muted />
                                                        <button
                                                            onClick={() => handleDesignChange('heroVideoUrl', '')}
                                                            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                )}
                                                <FileUploader
                                                    event={event}
                                                    type="video"
                                                    label="Subir Video MP4"
                                                    onUploadSuccess={(url) => handleDesignChange('heroVideoUrl', url)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold italic">Galería de Fotos</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                {data.design_data.gallery?.map((url, i) => (
                                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                                                        <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                                        <button
                                                            onClick={() => {
                                                                const newGallery = data.design_data.gallery.filter((_, idx) => idx !== i);
                                                                handleDesignChange('gallery', newGallery);
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3 text-red-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <FileUploader
                                                    event={event}
                                                    type="gallery"
                                                    label="+"
                                                    aspect={1}
                                                    onUploadSuccess={(url) => handleDesignChange('gallery', [...(data.design_data.gallery || []), url])}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'ubicacion' && (
                                    <motion.div
                                        key="ubicacion"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Lugar de la Ceremonia</label>
                                                <input
                                                    type="text"
                                                    value={data.design_data.location}
                                                    onChange={e => handleDesignChange('location', e.target.value)}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-serif p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">URL Mapa Ceremonia</label>
                                                <input
                                                    type="text"
                                                    value={data.design_data.locationUrl}
                                                    onChange={e => handleDesignChange('locationUrl', e.target.value)}
                                                    placeholder="Google Maps link"
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Lugar de la Recepción</label>
                                                <input
                                                    type="text"
                                                    value={data.design_data.reception}
                                                    onChange={e => handleDesignChange('reception', e.target.value)}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-serif p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">URL Mapa Recepción</label>
                                                <input
                                                    type="text"
                                                    value={data.design_data.receptionUrl}
                                                    onChange={e => handleDesignChange('receptionUrl', e.target.value)}
                                                    placeholder="Google Maps link"
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'cronograma' && (
                                    <motion.div
                                        key="cronograma"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex justify-between items-center">
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] font-sans font-bold">Itinerario</label>
                                            <button
                                                type="button"
                                                onClick={addItineraryItem}
                                                className="text-[#C5A059] text-[10px] uppercase tracking-widest border border-[#C5A059] px-3 py-1 hover:bg-[#C5A059] hover:text-white transition-all"
                                            >
                                                + Agregar Item
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {(data.design_data.itinerary || []).map((item, index) => (
                                                <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded border border-gray-100">
                                                    <input
                                                        type="time"
                                                        value={item.time}
                                                        onChange={e => updateItineraryItem(index, 'time', e.target.value)}
                                                        className="border-0 border-b border-gray-200 bg-transparent focus:ring-0 p-0 text-sm w-20"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Actividad..."
                                                        value={item.activity}
                                                        onChange={e => updateItineraryItem(index, 'activity', e.target.value)}
                                                        className="flex-1 border-0 border-b border-gray-200 bg-transparent focus:ring-0 p-0 text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newItinerary = data.design_data.itinerary.filter((_, i) => i !== index);
                                                            handleDesignChange('itinerary', newItinerary);
                                                        }}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'estilo' && (
                                    <motion.div
                                        key="estilo"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold italic">Música de Fondo</label>
                                            {data.design_data.musicUrl && (
                                                <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-lg mb-4 border border-gray-100">
                                                    <Music className="w-5 h-5 text-[#C5A059]" />
                                                    <span className="text-xs text-gray-400 truncate flex-1">{data.design_data.musicUrl}</span>
                                                    <button onClick={() => handleDesignChange('musicUrl', '')} className="text-red-400">&times;</button>
                                                </div>
                                            )}
                                            <FileUploader
                                                event={event}
                                                type="music"
                                                label="Subir MP3"
                                                onUploadSuccess={(url) => handleDesignChange('musicUrl', url)}
                                            />
                                        </div>
                                        <div className="flex gap-12">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Color Primario</label>
                                                <input
                                                    type="color"
                                                    value={data.design_data.mainColor}
                                                    onChange={e => handleDesignChange('mainColor', e.target.value)}
                                                    className="w-16 h-16 border-0 p-0 bg-transparent cursor-pointer rounded-full overflow-hidden"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Fondo Acordado</label>
                                                <input
                                                    type="color"
                                                    value={data.design_data.secondaryColor}
                                                    onChange={e => handleDesignChange('secondaryColor', e.target.value)}
                                                    className="w-16 h-16 border-0 p-0 bg-transparent cursor-pointer rounded-full overflow-hidden"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-8 border-t border-gray-100">
                                            <h4 className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Opciones de RSVP</h4>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    id="askMenu"
                                                    checked={data.design_data.rsvpOptions?.askMenu}
                                                    onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, askMenu: e.target.checked })}
                                                    className="w-5 h-5 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                                />
                                                <label htmlFor="askMenu" className="text-sm font-sans text-gray-600">Preguntar preferencia de menú</label>
                                            </div>
                                            {data.design_data.rsvpOptions?.askMenu && (
                                                <input
                                                    type="text"
                                                    placeholder="Opciones: Res, Pollo, Vegetariano..."
                                                    value={data.design_data.rsvpOptions.menuOptions}
                                                    onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, menuOptions: e.target.value })}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-sm bg-transparent"
                                                />
                                            )}

                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    id="askDrinks"
                                                    checked={data.design_data.rsvpOptions?.askDrinks}
                                                    onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, askDrinks: e.target.checked })}
                                                    className="w-5 h-5 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                                />
                                                <label htmlFor="askDrinks" className="text-sm font-sans text-gray-600">Preguntar preferencia de bebida</label>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </div>

                {/* Panel Derecho: Previsualización Móvil */}
                <div className="hidden md:flex w-1/2 p-8 items-center justify-center bg-[#ECECE6]">
                    <div className="relative w-[375px] h-[750px] bg-white rounded-[60px] border-[12px] border-[#1A1A1A] shadow-2xl overflow-hidden">
                        {/* Notch simulado */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-[#1A1A1A] rounded-b-3xl z-20"></div>

                        <div className="h-full overflow-y-auto pt-10">
                            <InvitationCard1
                                data={data.design_data}
                                guestGroup={{ group_name: 'Familia Castillo', total_passes: 2 }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notificación de éxito */}
            <AnimatePresence>
                {recentlySuccessful && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-8 py-3 rounded shadow-2xl z-50 font-sans text-xs uppercase tracking-widest"
                    >
                        Cambios guardados con éxito
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
