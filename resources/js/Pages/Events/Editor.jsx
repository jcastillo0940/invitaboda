import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, CheckCircle2, Lock, Palette } from 'lucide-react';
import FileUploader from '@/Components/Media/FileUploader';
import TemplateLoader from '@/Components/TemplateLoader';
import LocationPicker from '@/Components/Inputs/LocationPicker';
import DebugBoundary from '@/Components/DebugBoundary';

export default function Editor({ auth, event, designs }) {
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
        envelopeAnimation: {
            enabled: true,
            initials: ''
        },
        parents: {
            bride: { father: '', mother: '' },
            groom: { father: '', mother: '' }
        },
        ourStory: '',
        godparents: [],
        quote: '',
        weather: {
            enabled: false,
            city: '',
            apiKey: '',
            lat: null,
            lng: null
        },
        giftSettings: {
            type: 'none',
            registryUrl: '',
            bankDetails: '',
            freeText: ''
        },
        contact: {
            label: 'Cualquier duda, contáctanos',
            phone: '',
            whatsapp: ''
        },
        accommodation: [],
        songSuggestions: false,
        guestBook: false,
        dressCode: {
            type: 'formal',
            customText: ''
        },
        hashtag: '',
        calendarEnabled: true,
        rsvpOptions: {
            askMenu: false,
            askDrinks: false,
            menuOptions: 'Res, Pollo, Vegetariano',
            drinkOptions: 'Vino, Whisky, Soda',
            askAllergies: true
        },
        mainColor: '#C5A059',
        secondaryColor: '#1A1A1A'
    };

    const savedData = event.design?.design_data || {};

    // Función para combinar datos guardados con estructura por defecto (Deep merge básico)
    const mergedData = {
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

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        template_name: event.design?.template_name || 'rojo-dorado-elegante',
        design_data: mergedData
    });

    const [activeTab, setActiveTab] = useState('plantilla');
    const tabs = ['plantilla', 'general', 'multimedia', 'detalles', 'logistica', 'interaccion', 'estilo'];

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
                            {tabs.map(tab => (
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

                                {/* ── PLANTILLA ── */}
                                {activeTab === 'plantilla' && (
                                    <motion.div
                                        key="plantilla"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold mb-1">Plantilla seleccionada</p>
                                            <p className="text-lg font-serif text-[#1A1A1A]">
                                                {designs.find(d => d.slug === data.template_name)?.name || 'Ninguna'}
                                            </p>
                                        </div>

                                        {!designs || designs.length === 0 ? (
                                            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                                <Palette className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                                <p className="text-sm text-gray-400 font-serif italic">Aún no hay diseños disponibles</p>
                                                <p className="text-xs text-gray-400 mt-2 font-sans">El administrador debe crear diseños primero.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                {designs.map(design => {
                                                    const isSelected = data.template_name === design.slug;
                                                    return (
                                                        <button
                                                            key={design.id}
                                                            type="button"
                                                            onClick={() => setData('template_name', design.slug)}
                                                            className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left group ${isSelected
                                                                ? 'border-[#C5A059] shadow-lg shadow-[#C5A059]/20'
                                                                : 'border-gray-100 hover:border-[#C5A059]/40'
                                                                }`}
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="aspect-[4/3] bg-gray-100 relative">
                                                                {design.thumbnail ? (
                                                                    <img
                                                                        src={design.thumbnail}
                                                                        alt={design.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Palette className="w-8 h-8 text-gray-200" />
                                                                    </div>
                                                                )}

                                                                {/* Selected overlay */}
                                                                {isSelected && (
                                                                    <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center">
                                                                        <CheckCircle2 className="w-10 h-10 text-[#C5A059] drop-shadow-lg" />
                                                                    </div>
                                                                )}

                                                                {/* Premium badge */}
                                                                {design.is_premium && (
                                                                    <span className="absolute top-2 right-2 bg-[#1A1A1A]/80 backdrop-blur text-[#C5A059] text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                        <Lock className="w-2.5 h-2.5" /> Premium
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Name */}
                                                            <div className="p-3 bg-white">
                                                                <p className={`text-xs font-serif transition-colors ${isSelected ? 'text-[#C5A059]' : 'text-[#1A1A1A]'
                                                                    }`}>
                                                                    {design.name}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* ── GENERAL ── */}
                                {activeTab === 'general' && (
                                    <motion.div
                                        key="general"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Nombres Principales</label>
                                                <input
                                                    type="text"
                                                    value={data.design_data.primaryNames}
                                                    onChange={e => handleDesignChange('primaryNames', e.target.value)}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 font-serif text-xl p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Hashtag del Evento</label>
                                                <input
                                                    type="text"
                                                    value={data.design_data.hashtag}
                                                    onChange={e => handleDesignChange('hashtag', e.target.value)}
                                                    placeholder="#BodaDeJuanYMaria"
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-sm font-sans p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Fecha del Evento</label>
                                                <input
                                                    type="date"
                                                    value={data.design_data.date}
                                                    onChange={e => handleDesignChange('date', e.target.value)}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                            <div className="space-y-4 pt-4">
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.design_data.showCountdown}
                                                        onChange={e => handleDesignChange('showCountdown', e.target.checked)}
                                                        className="rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                                    />
                                                    <label className="text-xs font-sans uppercase tracking-[0.1em] text-[#888888]">Mostrar Cuenta Regresiva</label>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.design_data.calendarEnabled}
                                                        onChange={e => handleDesignChange('calendarEnabled', e.target.checked)}
                                                        className="rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                                    />
                                                    <label className="text-xs font-sans uppercase tracking-[0.1em] text-[#888888]">Botón "Agendar Fecha"</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex-1">
                                                    <p className="text-sm font-serif text-[#1A1A1A] mb-1">Animación de Sobre Inicial</p>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Iniciales (Ex: J & M)"
                                                            value={data.design_data.envelopeAnimation.initials}
                                                            onChange={e => handleDesignChange('envelopeAnimation', { ...data.design_data.envelopeAnimation, initials: e.target.value })}
                                                            className="w-32 border-b border-gray-200 bg-transparent text-xs p-1 focus:ring-0 focus:border-[#C5A059]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400">Activar</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={data.design_data.envelopeAnimation.enabled}
                                                        onChange={e => handleDesignChange('envelopeAnimation', { ...data.design_data.envelopeAnimation, enabled: e.target.checked })}
                                                        className="w-5 h-5 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── MULTIMEDIA ── */}
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
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Imagen Portada</label>
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
                                                    label="Subir Imagen Hero"
                                                    aspect={16 / 9}
                                                    onUploadSuccess={(url) => handleDesignChange('heroImageUrl', url)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold italic">Música de Fondo</label>
                                                {data.design_data.musicUrl && (
                                                    <div className="flex items-center gap-4 bg-[#FAF9F6] p-4 rounded-lg mb-4 border border-gray-100">
                                                        <Music className="w-5 h-5 text-[#C5A059]" />
                                                        <span className="text-xs text-gray-400 truncate flex-1">{data.design_data.musicUrl}</span>
                                                        <button type="button" onClick={() => handleDesignChange('musicUrl', '')} className="text-red-400">&times;</button>
                                                    </div>
                                                )}
                                                <FileUploader
                                                    event={event}
                                                    type="music"
                                                    label="Subir MP3"
                                                    onUploadSuccess={(url) => handleDesignChange('musicUrl', url)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold italic">Galería de Fotos (Máx. 8)</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                {data.design_data.gallery?.map((url, i) => (
                                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 group">
                                                        <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                                        <button
                                                            type="button"
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
                                                {(!data.design_data.gallery || data.design_data.gallery.length < 8) && (
                                                    <FileUploader
                                                        event={event}
                                                        type="gallery"
                                                        label="+"
                                                        aspect={1}
                                                        onUploadSuccess={(url) => handleDesignChange('gallery', [...(data.design_data.gallery || []), url])}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── DETALLES ── */}
                                {activeTab === 'detalles' && (
                                    <motion.div
                                        key="detalles"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold italic">Nuestra Historia</label>
                                            <textarea
                                                value={data.design_data.ourStory}
                                                onChange={e => handleDesignChange('ourStory', e.target.value)}
                                                rows={4}
                                                className="w-full border border-[#E0E0E0] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] transition-all font-serif text-sm p-3 bg-transparent rounded-lg"
                                                placeholder="Cuéntales cómo empezó todo..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Frase o Cita Inspiracional</label>
                                            <input
                                                type="text"
                                                value={data.design_data.quote}
                                                onChange={e => handleDesignChange('quote', e.target.value)}
                                                className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 font-serif italic text-lg p-0 py-2 bg-transparent"
                                                placeholder="Ej: El amor lo puede todo..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Padres de la Novia</p>
                                                <input
                                                    type="text"
                                                    placeholder="Madre"
                                                    value={data.design_data.parents.bride.mother}
                                                    onChange={e => handleDesignChange('parents', { ...data.design_data.parents, bride: { ...data.design_data.parents.bride, mother: e.target.value } })}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-xs p-0 py-2 bg-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Padre"
                                                    value={data.design_data.parents.bride.father}
                                                    onChange={e => handleDesignChange('parents', { ...data.design_data.parents, bride: { ...data.design_data.parents.bride, father: e.target.value } })}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-xs p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Padres del Novio</p>
                                                <input
                                                    type="text"
                                                    placeholder="Madre"
                                                    value={data.design_data.parents.groom.mother}
                                                    onChange={e => handleDesignChange('parents', { ...data.design_data.parents, groom: { ...data.design_data.parents.groom, mother: e.target.value } })}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-xs p-0 py-2 bg-transparent"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Padre"
                                                    value={data.design_data.parents.groom.father}
                                                    onChange={e => handleDesignChange('parents', { ...data.design_data.parents, groom: { ...data.design_data.parents.groom, father: e.target.value } })}
                                                    className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-xs p-0 py-2 bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] font-sans font-bold">Padrinos</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDesignChange('godparents', [...(data.design_data.godparents || []), ''])}
                                                    className="text-[#C5A059] text-[9px] uppercase tracking-widest border border-[#C5A059] px-2 py-0.5 hover:bg-[#C5A059] transition-all"
                                                >
                                                    + Agregar
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {(data.design_data.godparents || []).map((name, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={e => {
                                                                const newGodparents = [...data.design_data.godparents];
                                                                newGodparents[idx] = e.target.value;
                                                                handleDesignChange('godparents', newGodparents);
                                                            }}
                                                            className="flex-1 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 text-xs p-0 py-1 bg-transparent"
                                                        />
                                                        <button type="button" onClick={() => handleDesignChange('godparents', data.design_data.godparents.filter((_, i) => i !== idx))} className="text-red-300">&times;</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── LOGÍSTICA ── */}
                                {activeTab === 'logistica' && (
                                    <motion.div
                                        key="logistica"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        {/* Ubicación (Ubicación & Link) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Lugar Ceremonia</p>
                                                <input
                                                    type="text"
                                                    value={data.design_data.location}
                                                    onChange={e => handleDesignChange('location', e.target.value)}
                                                    className="w-full border-b border-[#E0E0E0] focus:ring-0 text-serif text-sm p-1 bg-transparent"
                                                    placeholder="Nombre del lugar..."
                                                />
                                                <input
                                                    type="text"
                                                    value={data.design_data.locationUrl}
                                                    onChange={e => handleDesignChange('locationUrl', e.target.value)}
                                                    className="w-full border-b border-[#E0E0E0] focus:ring-0 text-xs p-1 bg-transparent"
                                                    placeholder="Link Google Maps..."
                                                />
                                            </div>
                                            <div className="space-y-6">
                                                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">Lugar Recepción</p>
                                                <input
                                                    type="text"
                                                    value={data.design_data.reception}
                                                    onChange={e => handleDesignChange('reception', e.target.value)}
                                                    className="w-full border-b border-[#E0E0E0] focus:ring-0 text-serif text-sm p-1 bg-transparent"
                                                    placeholder="Nombre del lugar..."
                                                />
                                                <input
                                                    type="text"
                                                    value={data.design_data.receptionUrl}
                                                    onChange={e => handleDesignChange('receptionUrl', e.target.value)}
                                                    className="w-full border-b border-[#E0E0E0] focus:ring-0 text-xs p-1 bg-transparent"
                                                    placeholder="Link Google Maps..."
                                                />
                                            </div>
                                        </div>

                                        {/* Regalos */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <p className="text-[10px] uppercase tracking-widest text-[#888888] font-bold mb-4">Mesa de Regalos</p>
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                {['none', 'registry', 'bank', 'text'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, type })}
                                                        className={`py-2 text-[8px] uppercase tracking-widest border rounded transition-all ${data.design_data.giftSettings.type === type ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-gray-200 text-gray-400'}`}
                                                    >
                                                        {type === 'none' ? 'Inactivo' : type === 'registry' ? 'Link Mesa' : type === 'bank' ? 'Cuentas' : 'Libre'}
                                                    </button>
                                                ))}
                                            </div>
                                            {data.design_data.giftSettings.type === 'registry' && (
                                                <input type="text" value={data.design_data.giftSettings.registryUrl} onChange={e => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, registryUrl: e.target.value })} className="w-full border-b border-gray-200 text-xs p-1" placeholder="Link a mesa de regalos (Amazon, etc)..." />
                                            )}
                                            {data.design_data.giftSettings.type === 'bank' && (
                                                <textarea value={data.design_data.giftSettings.bankDetails} onChange={e => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, bankDetails: e.target.value })} rows={3} className="w-full border border-gray-100 rounded text-xs p-2" placeholder="Datos bancarios..." />
                                            )}
                                            {data.design_data.giftSettings.type === 'text' && (
                                                <input type="text" value={data.design_data.giftSettings.freeText} onChange={e => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, freeText: e.target.value })} className="w-full border-b border-gray-200 text-xs p-1" placeholder="Ex: Lluvia de sobres..." />
                                            )}
                                        </div>

                                        {/* Código de Vestimenta */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-bold">Código de Vestimenta</label>
                                            <div className="flex gap-4 items-center">
                                                <select
                                                    value={data.design_data.dressCode.type}
                                                    onChange={e => handleDesignChange('dressCode', { ...data.design_data.dressCode, type: e.target.value })}
                                                    className="border-gray-100 text-xs rounded-lg"
                                                >
                                                    <option value="formal">Gala / Formal</option>
                                                    <option value="semi">Semi-Formal</option>
                                                    <option value="cocktail">Cóctel</option>
                                                    <option value="casual">Informal / Guayabera</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Texto adicional (Ej: No blanco)..."
                                                    value={data.design_data.dressCode.customText}
                                                    onChange={e => handleDesignChange('dressCode', { ...data.design_data.dressCode, customText: e.target.value })}
                                                    className="flex-1 border-b border-gray-100 text-xs p-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Hospedaje */}
                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] font-bold">Hospedaje Recomendado</label>
                                                <button type="button" onClick={() => handleDesignChange('accommodation', [...(data.design_data.accommodation || []), { name: '', link: '' }])} className="text-[#C5A059] text-[9px] uppercase tracking-widest border border-[#C5A059] px-2 py-0.5 hover:bg-[#C5A059] transition-all">+ Agregar Hotel</button>
                                            </div>
                                            <div className="space-y-3">
                                                {(data.design_data.accommodation || []).map((hotel, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input type="text" placeholder="Nombre Hotel" value={hotel.name} onChange={e => {
                                                            const newAcc = [...data.design_data.accommodation];
                                                            newAcc[idx].name = e.target.value;
                                                            handleDesignChange('accommodation', newAcc);
                                                        }} className="flex-1 border-b border-gray-100 text-xs p-1" />
                                                        <input type="text" placeholder="Link (opcional)" value={hotel.link} onChange={e => {
                                                            const newAcc = [...data.design_data.accommodation];
                                                            newAcc[idx].link = e.target.value;
                                                            handleDesignChange('accommodation', newAcc);
                                                        }} className="flex-1 border-b border-gray-100 text-[10px] p-1" />
                                                        <button type="button" onClick={() => handleDesignChange('accommodation', data.design_data.accommodation.filter((_, i) => i !== idx))} className="text-red-300">&times;</button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── INTERACCIÓN ── */}
                                {activeTab === 'interaccion' && (
                                    <motion.div
                                        key="interaccion"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                                                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mb-2">Peticiones RSVP</p>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={data.design_data.rsvpOptions.askMenu} onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, askMenu: e.target.checked })} className="rounded" />
                                                    <label className="text-[10px] uppercase tracking-wider text-gray-500">¿Preguntar Menú?</label>
                                                </div>
                                                {data.design_data.rsvpOptions.askMenu && (
                                                    <input type="text" placeholder="Res, Pollo, Veggie..." value={data.design_data.rsvpOptions.menuOptions} onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, menuOptions: e.target.value })} className="w-full border-b border-gray-200 text-[10px] p-1 bg-transparent" />
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={data.design_data.rsvpOptions.askAllergies} onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, askAllergies: e.target.checked })} className="rounded" />
                                                    <label className="text-[10px] uppercase tracking-wider text-gray-500">¿Preguntar Alergias?</label>
                                                </div>
                                            </div>

                                            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                                                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold mb-2">Extras de Invitados</p>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={data.design_data.songSuggestions} onChange={e => handleDesignChange('songSuggestions', e.target.checked)} className="rounded" />
                                                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Pedir Sugerencias de Canciones</label>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input type="checkbox" checked={data.design_data.guestBook} onChange={e => handleDesignChange('guestBook', e.target.checked)} className="rounded" />
                                                    <label className="text-[10px] uppercase tracking-wider text-gray-500">Habilitar Muro de Deseos</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] uppercase tracking-widest text-[#888888] font-bold italic">Configuración de Clima (WeatherAPI.com)</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] uppercase font-bold text-gray-400">Activar Módulo</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={data.design_data.weather.enabled}
                                                        onChange={e => handleDesignChange('weather', { ...data.design_data.weather, enabled: e.target.checked })}
                                                        className="rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]"
                                                    />
                                                </div>
                                            </div>

                                            {data.design_data.weather.enabled && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    className="space-y-6 overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-1">API Key (Opcional si está en .env)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Clave de WeatherAPI..."
                                                                value={data.design_data.weather.apiKey}
                                                                onChange={e => handleDesignChange('weather', { ...data.design_data.weather, apiKey: e.target.value })}
                                                                autoComplete="off"
                                                                className="w-full border-0 border-b border-gray-100 text-xs p-1 focus:ring-0 focus:border-[#C5A059] bg-transparent"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-1">Nombre Ciudad (Display)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Ciudad..."
                                                                value={data.design_data.weather.city}
                                                                onChange={e => handleDesignChange('weather', { ...data.design_data.weather, city: e.target.value })}
                                                                className="w-full border-b border-gray-100 text-xs p-1 focus:ring-0 focus:border-[#C5A059] bg-transparent"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-3">Ubicación Precisa para Pronóstico</label>
                                                        <DebugBoundary name="LocationPicker (Weather)">
                                                            <LocationPicker
                                                                lat={data.design_data.weather.lat}
                                                                lng={data.design_data.weather.lng}
                                                                onLocationSelect={(lat, lng) => {
                                                                    handleDesignChange('weather', {
                                                                        ...data.design_data.weather,
                                                                        lat,
                                                                        lng
                                                                    });
                                                                }}
                                                            />
                                                        </DebugBoundary>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-gray-100">
                                            <p className="text-[10px] uppercase tracking-widest text-[#888888] font-bold mb-4 italic">Contacto Ayuda</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input type="text" placeholder="Label (Ej: Wedding Planner)" value={data.design_data.contact.label} onChange={e => handleDesignChange('contact', { ...data.design_data.contact, label: e.target.value })} className="border-b border-gray-200 text-xs p-1" />
                                                <input type="text" placeholder="WhatsApp (Con prefijo: 549...)" value={data.design_data.contact.whatsapp} onChange={e => handleDesignChange('contact', { ...data.design_data.contact, whatsapp: e.target.value })} className="border-b border-gray-200 text-xs p-1" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── ESTILO ── */}
                                {activeTab === 'estilo' && (
                                    <motion.div
                                        key="estilo"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex gap-12 justify-center">
                                            <div className="text-center">
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Resaltado</label>
                                                <input
                                                    type="color"
                                                    value={data.design_data.mainColor}
                                                    onChange={e => handleDesignChange('mainColor', e.target.value)}
                                                    className="w-20 h-20 border-0 p-0 bg-transparent cursor-pointer rounded-full overflow-hidden shadow-lg"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-4 font-sans font-bold">Fondo / Contraste</label>
                                                <input
                                                    type="color"
                                                    value={data.design_data.secondaryColor}
                                                    onChange={e => handleDesignChange('secondaryColor', e.target.value)}
                                                    className="w-20 h-20 border-0 p-0 bg-transparent cursor-pointer rounded-full overflow-hidden shadow-lg border-2 border-gray-100"
                                                />
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

                        <div className="h-full overflow-y-auto pt-10 text-[60%]">
                            <DebugBoundary name="TemplateLoader Preview">
                                <TemplateLoader
                                    slug={data.template_name}
                                    data={data.design_data}
                                    event={event}
                                    guestGroup={{
                                        group_name: 'Familia Castillo', total_passes: 2, members: [
                                            { id: 0, name: 'Juan Castillo', is_attending: true, menu_choice: '', drink_choice: '', allergies: '' },
                                            { id: 1, name: 'María Castillo', is_attending: true, menu_choice: '', drink_choice: '', allergies: '' },
                                        ]
                                    }}
                                />
                            </DebugBoundary>
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
