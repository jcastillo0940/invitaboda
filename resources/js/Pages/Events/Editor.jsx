import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Music, CheckCircle2, Lock, Palette,
    Image, BookOpen, MapPin, Users, Save,
    LayoutTemplate, Settings, Eye, EyeOff,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import FileUploader from '@/Components/Media/FileUploader';
import TemplateLoader from '@/Components/TemplateLoader';
import LocationPicker from '@/Components/Inputs/LocationPicker';
import DebugBoundary from '@/Components/DebugBoundary';

const NAV_SECTIONS = [
    { id: 'plantilla',   label: 'Plantilla',   icon: LayoutTemplate },
    { id: 'general',     label: 'General',      icon: Settings       },
    { id: 'multimedia',  label: 'Multimedia',   icon: Image          },
    { id: 'detalles',    label: 'Detalles',     icon: BookOpen       },
    { id: 'logistica',   label: 'Logística',    icon: MapPin         },
    { id: 'interaccion', label: 'Interacción',  icon: Users          },
    { id: 'estilo',      label: 'Estilo',       icon: Palette        },
];

export default function Editor({ auth, event, designs }) {
    const defaultDesignData = {
        primaryNames: event.name || '',
        date: event.date || '',
        location: '', locationLat: null, locationLng: null, locationUrl: '',
        reception: '', receptionLat: null, receptionLng: null, receptionUrl: '',
        heroImageUrl: '', heroVideoUrl: '',
        gallery: [], itinerary: [], musicUrl: '',
        showCountdown: true,
        envelopeAnimation: { enabled: true, initials: '' },
        parents: {
            bride: { father: '', mother: '' },
            groom: { father: '', mother: '' }
        },
        ourStory: '', godparents: [], quote: '', quoteSource: '',
        weather: { enabled: false, city: '', apiKey: '', lat: null, lng: null },
        giftSettings: { type: 'none', registryUrl: '', bankDetails: '', freeText: '' },
        contact: { label: 'Cualquier duda, contáctanos', phone: '', whatsapp: '' },
        accommodation: [],
        songSuggestions: false, guestBook: false,
        dressCode: { type: 'formal', customText: '' },
        hashtag: '', calendarEnabled: true,
        rsvpOptions: {
            askMenu: false, askDrinks: false,
            menuOptions: 'Res, Pollo, Vegetariano',
            drinkOptions: 'Vino, Whisky, Soda',
            askAllergies: true
        },
        mainColor: '#C5A059', secondaryColor: '#1A1A1A'
    };

    const savedData = event.design?.design_data || {};
    const mergedData = {
        ...defaultDesignData, ...savedData,
        envelopeAnimation: { ...defaultDesignData.envelopeAnimation, ...(savedData.envelopeAnimation || {}) },
        parents: {
            bride: { ...defaultDesignData.parents.bride, ...(savedData.parents?.bride || {}) },
            groom: { ...defaultDesignData.parents.groom, ...(savedData.parents?.groom || {}) }
        },
        weather:      { ...defaultDesignData.weather,      ...(savedData.weather      || {}) },
        giftSettings: { ...defaultDesignData.giftSettings, ...(savedData.giftSettings || {}) },
        contact:      { ...defaultDesignData.contact,      ...(savedData.contact      || {}) },
        dressCode:    { ...defaultDesignData.dressCode,    ...(savedData.dressCode    || {}) },
        rsvpOptions:  { ...defaultDesignData.rsvpOptions,  ...(savedData.rsvpOptions  || {}) }
    };

    const { data, setData, post, processing, recentlySuccessful } = useForm({
        template_name: event.design?.template_name || 'rojo-dorado-elegante',
        design_data: mergedData
    });

    const [activeSection, setActiveSection] = useState('plantilla');
    const [showPreview, setShowPreview] = useState(false);

    const handleDesignChange = (field, value) => {
        let newData = { ...data.design_data, [field]: value };
        if (typeof value === 'object' && value !== null && value.lat) {
            if (field === 'location') {
                newData.location    = value.address || value.city || '';
                newData.locationLat = value.lat;
                newData.locationLng = value.lng;
                newData.locationUrl = value.url || '';
            } else if (field === 'reception') {
                newData.reception    = value.address || value.city || '';
                newData.receptionLat = value.lat;
                newData.receptionLng = value.lng;
                newData.receptionUrl = value.url || '';
            }
            if ((field === 'location' || field === 'reception') && (!newData.weather.lat || !newData.weather.city)) {
                newData.weather = { ...newData.weather, lat: value.lat, lng: value.lng, city: value.city || (value.address ? value.address.split(',')[0] : '') };
            }
        }
        setData('design_data', newData);
    };

    const submit = (e) => { e?.preventDefault(); post(route('events.update-design', event.id)); };

    const currentIdx  = NAV_SECTIONS.findIndex(s => s.id === activeSection);
    const prevSection = currentIdx > 0 ? NAV_SECTIONS[currentIdx - 1] : null;
    const nextSection = currentIdx < NAV_SECTIONS.length - 1 ? NAV_SECTIONS[currentIdx + 1] : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] font-bold leading-none mb-1">Editor de Invitación</p>
                        <h2 className="text-base font-serif text-[#1A1A1A] leading-tight">{event.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowPreview(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                                showPreview
                                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                            }`}
                        >
                            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {showPreview ? 'Ocultar' : 'Vista previa'}
                        </button>
                        <button
                            onClick={submit}
                            disabled={processing}
                            className="flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#b8903f] disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider"
                        >
                            <Save className="w-3 h-3" />
                            {processing ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Editar ${event.name}`} />

            {/*
                Sin contenedor h-screen ni overflow-hidden adicional.
                Todo fluye en el scroll único del AuthenticatedLayout.
            */}
            <div className="bg-[#F5F4EF] min-h-screen">

                {/* ── NAV DE SECCIONES — sticky bajo el header del layout ── */}
                <div className="sticky top-0 z-20 bg-white border-b border-[#E8E8E2] shadow-sm">
                    <div className="flex items-stretch px-4">
                        {NAV_SECTIONS.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        // Scroll suave al inicio del contenido
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`relative flex flex-col items-center gap-1 px-4 py-3 transition-all duration-150 ${
                                        isActive ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    <Icon className={`w-[15px] h-[15px] ${isActive ? 'text-[#C5A059]' : ''}`} />
                                    <span className="text-[8.5px] uppercase tracking-wider font-bold whitespace-nowrap">
                                        {section.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#C5A059] rounded-t-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── CONTENIDO + PREVIEW SIDE-BY-SIDE ── */}
                <div className="flex items-start">

                    {/* ── FORMULARIO — crece y no tiene scroll propio ── */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={submit}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSection}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.16 }}
                                    className="p-6 max-w-2xl space-y-4"
                                >

                                    {/* ── PLANTILLA ── */}
                                    {activeSection === 'plantilla' && (
                                        <Card title="Elige tu plantilla" subtitle={designs?.find(d => d.slug === data.template_name)?.name}>
                                            {(!designs || designs.length === 0) ? (
                                                <div className="text-center py-12 rounded-xl border-2 border-dashed border-gray-200">
                                                    <Palette className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-400 italic">Aún no hay diseños disponibles</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {designs.map(design => {
                                                        const isSelected = data.template_name === design.slug;
                                                        return (
                                                            <button key={design.id} type="button" onClick={() => setData('template_name', design.slug)}
                                                                className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 text-left ${isSelected ? 'border-[#C5A059] shadow-md shadow-[#C5A059]/20 scale-[1.02]' : 'border-gray-100 hover:border-[#C5A059]/40'}`}>
                                                                <div className="aspect-[4/3] bg-gray-100 relative">
                                                                    {design.thumbnail
                                                                        ? <img src={design.thumbnail} alt={design.name} className="w-full h-full object-cover" />
                                                                        : <div className="w-full h-full flex items-center justify-center"><Palette className="w-6 h-6 text-gray-200" /></div>
                                                                    }
                                                                    {isSelected && <div className="absolute inset-0 bg-[#C5A059]/10 flex items-center justify-center"><CheckCircle2 className="w-9 h-9 text-[#C5A059]" /></div>}
                                                                    {design.is_premium && (
                                                                        <span className="absolute top-2 right-2 bg-black/70 text-[#C5A059] text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                            <Lock className="w-2.5 h-2.5" /> Premium
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="px-3 py-2 bg-white">
                                                                    <p className={`text-xs font-serif ${isSelected ? 'text-[#C5A059]' : 'text-[#1A1A1A]'}`}>{design.name}</p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </Card>
                                    )}

                                    {/* ── GENERAL ── */}
                                    {activeSection === 'general' && (<>
                                        <Card title="Información principal">
                                            <div className="grid grid-cols-2 gap-5">
                                                <Field label="Nombres principales">
                                                    <input type="text" value={data.design_data.primaryNames} onChange={e => handleDesignChange('primaryNames', e.target.value)} className="fi font-serif text-lg" placeholder="Ana & Carlos" />
                                                </Field>
                                                <Field label="Hashtag">
                                                    <input type="text" value={data.design_data.hashtag} onChange={e => handleDesignChange('hashtag', e.target.value)} className="fi" placeholder="#BodaAnaYCarlos" />
                                                </Field>
                                            </div>
                                            <Field label="Fecha del evento">
                                                <input type="date" value={data.design_data.date} onChange={e => handleDesignChange('date', e.target.value)} className="fi w-auto" />
                                            </Field>
                                        </Card>
                                        <Card title="Opciones">
                                            <Toggle label="Mostrar cuenta regresiva" description="Un contador en tiempo real hasta el gran día" checked={data.design_data.showCountdown} onChange={v => handleDesignChange('showCountdown', v)} />
                                            <Toggle label='Botón "Agendar fecha"' description="Permite agregar el evento al calendario personal" checked={data.design_data.calendarEnabled} onChange={v => handleDesignChange('calendarEnabled', v)} />
                                        </Card>
                                        <Card title="Animación de sobre">
                                            <div className="flex items-end gap-6">
                                                <Field label="Iniciales en el sobre" className="flex-1">
                                                    <input type="text" placeholder="J & C" value={data.design_data.envelopeAnimation.initials} onChange={e => handleDesignChange('envelopeAnimation', { ...data.design_data.envelopeAnimation, initials: e.target.value })} className="fi" />
                                                </Field>
                                                <Toggle label="Activar" checked={data.design_data.envelopeAnimation.enabled} onChange={v => handleDesignChange('envelopeAnimation', { ...data.design_data.envelopeAnimation, enabled: v })} />
                                            </div>
                                        </Card>
                                    </>)}

                                    {/* ── MULTIMEDIA ── */}
                                    {activeSection === 'multimedia' && (<>
                                        <Card title="Imagen de portada">
                                            {data.design_data.heroImageUrl && (
                                                <div className="relative aspect-video mb-3 overflow-hidden rounded-xl border border-gray-100 group">
                                                    <img src={data.design_data.heroImageUrl} className="w-full h-full object-cover" alt="Portada" />
                                                    <button type="button" onClick={() => handleDesignChange('heroImageUrl', '')} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"><X className="w-3.5 h-3.5 text-red-500" /></button>
                                                </div>
                                            )}
                                            <FileUploader event={event} type="hero" label="Subir imagen principal" aspect={16 / 9} onUploadSuccess={(url) => handleDesignChange('heroImageUrl', url)} />
                                        </Card>
                                        <Card title="Música de fondo">
                                            {data.design_data.musicUrl && (
                                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl mb-3 border border-gray-100">
                                                    <div className="w-8 h-8 bg-[#C5A059]/10 rounded-full flex items-center justify-center flex-shrink-0"><Music className="w-4 h-4 text-[#C5A059]" /></div>
                                                    <span className="text-xs text-gray-400 truncate flex-1">{data.design_data.musicUrl}</span>
                                                    <button type="button" onClick={() => handleDesignChange('musicUrl', '')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                                </div>
                                            )}
                                            <FileUploader event={event} type="music" label="Subir archivo MP3" onUploadSuccess={(url) => handleDesignChange('musicUrl', url)} />
                                        </Card>
                                        <Card title="Galería de fotos" badge={`${data.design_data.gallery?.length || 0} / 8`}>
                                            <div className="grid grid-cols-4 gap-3">
                                                {data.design_data.gallery?.map((url, i) => (
                                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group">
                                                        <img src={url} className="w-full h-full object-cover" alt={`Foto ${i + 1}`} />
                                                        <button type="button" onClick={() => handleDesignChange('gallery', data.design_data.gallery.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"><X className="w-3 h-3 text-red-500" /></button>
                                                    </div>
                                                ))}
                                                {(!data.design_data.gallery || data.design_data.gallery.length < 8) && (
                                                    <div className="aspect-square"><FileUploader event={event} type="gallery" label="+" aspect={1} onUploadSuccess={(url) => handleDesignChange('gallery', [...(data.design_data.gallery || []), url])} /></div>
                                                )}
                                            </div>
                                        </Card>
                                    </>)}

                                    {/* ── DETALLES ── */}
                                    {activeSection === 'detalles' && (<>
                                        <Card title="Nuestra historia">
                                            <textarea value={data.design_data.ourStory} onChange={e => handleDesignChange('ourStory', e.target.value)} rows={4} placeholder="Cuéntales cómo empezó todo..." className="w-full border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/20 font-serif text-sm p-3 rounded-xl resize-none bg-transparent transition-all outline-none" />
                                        </Card>
                                        <Card title="Frase inspiracional">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="Frase o cita"><input type="text" value={data.design_data.quote} onChange={e => handleDesignChange('quote', e.target.value)} className="fi font-serif italic" placeholder="El amor lo puede todo..." /></Field>
                                                <Field label="Fuente"><input type="text" value={data.design_data.quoteSource} onChange={e => handleDesignChange('quoteSource', e.target.value)} className="fi" placeholder="Juan 13:31" /></Field>
                                            </div>
                                        </Card>
                                        <Card title="Familia">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <p className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">Padres de la Novia</p>
                                                    <Field label="Madre"><input type="text" value={data.design_data.parents.bride.mother} onChange={e => handleDesignChange('parents', { ...data.design_data.parents, bride: { ...data.design_data.parents.bride, mother: e.target.value } })} className="fi" placeholder="Nombre" /></Field>
                                                    <Field label="Padre"><input type="text" value={data.design_data.parents.bride.father} onChange={e => handleDesignChange('parents', { ...data.design_data.parents, bride: { ...data.design_data.parents.bride, father: e.target.value } })} className="fi" placeholder="Nombre" /></Field>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[9px] uppercase tracking-widest text-[#C5A059] font-bold">Padres del Novio</p>
                                                    <Field label="Madre"><input type="text" value={data.design_data.parents.groom.mother} onChange={e => handleDesignChange('parents', { ...data.design_data.parents, groom: { ...data.design_data.parents.groom, mother: e.target.value } })} className="fi" placeholder="Nombre" /></Field>
                                                    <Field label="Padre"><input type="text" value={data.design_data.parents.groom.father} onChange={e => handleDesignChange('parents', { ...data.design_data.parents, groom: { ...data.design_data.parents.groom, father: e.target.value } })} className="fi" placeholder="Nombre" /></Field>
                                                </div>
                                            </div>
                                        </Card>
                                        <Card title="Padrinos" action={
                                            <button type="button" onClick={() => handleDesignChange('godparents', [...(data.design_data.godparents || []), ''])} className="text-[9px] uppercase tracking-widest text-[#C5A059] border border-[#C5A059] px-3 py-1 rounded hover:bg-[#C5A059] hover:text-white transition-all">+ Agregar</button>
                                        }>
                                            {!(data.design_data.godparents?.length) && <p className="text-xs text-gray-400 italic">No hay padrinos agregados.</p>}
                                            <div className="grid grid-cols-2 gap-3">
                                                {(data.design_data.godparents || []).map((name, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input type="text" value={name} onChange={e => { const g = [...data.design_data.godparents]; g[idx] = e.target.value; handleDesignChange('godparents', g); }} className="fi flex-1" placeholder={`Padrino ${idx + 1}`} />
                                                        <button type="button" onClick={() => handleDesignChange('godparents', data.design_data.godparents.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </>)}

                                    {/* ── LOGÍSTICA ── */}
                                    {activeSection === 'logistica' && (
                                        <DebugBoundary name="Logistica">
                                            <Card title="Lugar de la ceremonia">
                                                <LocationPicker lat={data.design_data.locationLat} lng={data.design_data.locationLng} placeholder="Buscar lugar de la ceremonia..." onLocationSelect={(loc) => handleDesignChange('location', loc)} />
                                                <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <Field label="Nombre / dirección"><input type="text" value={data.design_data.location} onChange={e => handleDesignChange('location', e.target.value)} className="fi" placeholder="Nombre del lugar..." /></Field>
                                                    <Field label="Link Google Maps"><input type="text" value={data.design_data.locationUrl} onChange={e => handleDesignChange('locationUrl', e.target.value)} className="fi text-blue-500" placeholder="https://maps.google.com/..." /></Field>
                                                </div>
                                            </Card>
                                            <Card title="Lugar de la recepción">
                                                <LocationPicker lat={data.design_data.receptionLat} lng={data.design_data.receptionLng} placeholder="Buscar lugar de la recepción..." onLocationSelect={(loc) => handleDesignChange('reception', loc)} />
                                                <div className="grid grid-cols-2 gap-4 mt-3">
                                                    <Field label="Nombre / dirección"><input type="text" value={data.design_data.reception} onChange={e => handleDesignChange('reception', e.target.value)} className="fi" placeholder="Nombre del lugar..." /></Field>
                                                    <Field label="Link Google Maps"><input type="text" value={data.design_data.receptionUrl} onChange={e => handleDesignChange('receptionUrl', e.target.value)} className="fi text-blue-500" placeholder="https://maps.google.com/..." /></Field>
                                                </div>
                                            </Card>
                                            <Card title="Mesa de regalos">
                                                <div className="grid grid-cols-4 gap-2 mb-4">
                                                    {[{ id: 'none', l: 'Inactivo' }, { id: 'registry', l: 'Mesa online' }, { id: 'bank', l: 'Cuenta bancaria' }, { id: 'text', l: 'Texto libre' }].map(t => (
                                                        <button key={t.id} type="button" onClick={() => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, type: t.id })}
                                                            className={`py-2 text-[9px] uppercase tracking-widest rounded-lg font-bold transition-all ${data.design_data.giftSettings.type === t.id ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{t.l}</button>
                                                    ))}
                                                </div>
                                                {data.design_data.giftSettings.type === 'registry' && <input type="text" value={data.design_data.giftSettings.registryUrl} onChange={e => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, registryUrl: e.target.value })} className="fi w-full" placeholder="Link a mesa de regalos..." />}
                                                {data.design_data.giftSettings.type === 'bank' && <textarea value={data.design_data.giftSettings.bankDetails} onChange={e => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, bankDetails: e.target.value })} rows={3} className="w-full border border-gray-100 rounded-xl text-xs p-3 resize-none outline-none focus:border-[#C5A059]" placeholder="Datos bancarios..." />}
                                                {data.design_data.giftSettings.type === 'text' && <input type="text" value={data.design_data.giftSettings.freeText} onChange={e => handleDesignChange('giftSettings', { ...data.design_data.giftSettings, freeText: e.target.value })} className="fi w-full" placeholder="Ej: Lluvia de sobres..." />}
                                            </Card>
                                            <Card title="Código de vestimenta">
                                                <div className="flex gap-4 items-end">
                                                    <Field label="Tipo">
                                                        <select value={data.design_data.dressCode.type} onChange={e => handleDesignChange('dressCode', { ...data.design_data.dressCode, type: e.target.value })} className="fi">
                                                            <option value="formal">Gala / Formal</option>
                                                            <option value="semi">Semi-Formal</option>
                                                            <option value="cocktail">Cóctel</option>
                                                            <option value="casual">Informal</option>
                                                        </select>
                                                    </Field>
                                                    <Field label="Nota adicional" className="flex-1">
                                                        <input type="text" placeholder="Ej: No usar blanco..." value={data.design_data.dressCode.customText} onChange={e => handleDesignChange('dressCode', { ...data.design_data.dressCode, customText: e.target.value })} className="fi" />
                                                    </Field>
                                                </div>
                                            </Card>
                                            <Card title="Hospedaje recomendado" action={
                                                <button type="button" onClick={() => handleDesignChange('accommodation', [...(data.design_data.accommodation || []), { name: '', link: '' }])} className="text-[9px] uppercase tracking-widest text-[#C5A059] border border-[#C5A059] px-3 py-1 rounded hover:bg-[#C5A059] hover:text-white transition-all">+ Hotel</button>
                                            }>
                                                {!(data.design_data.accommodation?.length) && <p className="text-xs text-gray-400 italic">No hay hoteles agregados.</p>}
                                                <div className="space-y-3">
                                                    {(data.design_data.accommodation || []).map((hotel, idx) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <input type="text" placeholder="Nombre del hotel" value={hotel.name} onChange={e => { const a = data.design_data.accommodation.map((h, i) => i === idx ? { ...h, name: e.target.value } : h); handleDesignChange('accommodation', a); }} className="fi flex-1" />
                                                            <input type="text" placeholder="Link (opcional)" value={hotel.link} onChange={e => { const a = data.design_data.accommodation.map((h, i) => i === idx ? { ...h, link: e.target.value } : h); handleDesignChange('accommodation', a); }} className="fi flex-1 text-blue-500" />
                                                            <button type="button" onClick={() => handleDesignChange('accommodation', data.design_data.accommodation.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 p-1"><X className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        </DebugBoundary>
                                    )}

                                    {/* ── INTERACCIÓN ── */}
                                    {activeSection === 'interaccion' && (<>
                                        <Card title="Opciones de RSVP">
                                            <Toggle label="Preguntar preferencia de menú" description="Los invitados podrán elegir su plato" checked={data.design_data.rsvpOptions.askMenu} onChange={v => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, askMenu: v })} />
                                            {data.design_data.rsvpOptions.askMenu && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pl-10 overflow-hidden">
                                                    <Field label="Opciones (separar con comas)"><input type="text" value={data.design_data.rsvpOptions.menuOptions} onChange={e => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, menuOptions: e.target.value })} className="fi" placeholder="Res, Pollo, Vegetariano..." /></Field>
                                                </motion.div>
                                            )}
                                            <Toggle label="Preguntar por alergias" description="Campo libre para restricciones alimentarias" checked={data.design_data.rsvpOptions.askAllergies} onChange={v => handleDesignChange('rsvpOptions', { ...data.design_data.rsvpOptions, askAllergies: v })} />
                                        </Card>
                                        <Card title="Extras para invitados">
                                            <Toggle label="Sugerencias de canciones" description="Los invitados pueden proponer canciones para el DJ" checked={data.design_data.songSuggestions} onChange={v => handleDesignChange('songSuggestions', v)} />
                                            <Toggle label="Muro de deseos" description="Un libro de visitas digital para mensajes" checked={data.design_data.guestBook} onChange={v => handleDesignChange('guestBook', v)} />
                                        </Card>
                                        <Card title="Pronóstico del clima" action={<Toggle label="" checked={data.design_data.weather.enabled} onChange={v => handleDesignChange('weather', { ...data.design_data.weather, enabled: v })} />}>
                                            {data.design_data.weather.enabled && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                                                    {data.design_data.weather.city && <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs text-blue-600">📍 Ciudad detectada: <strong>{data.design_data.weather.city}</strong></div>}
                                                    <DebugBoundary name="LocationPicker (Weather)">
                                                        <LocationPicker lat={data.design_data.weather.lat} lng={data.design_data.weather.lng} onLocationSelect={(loc) => handleDesignChange('weather', { ...data.design_data.weather, lat: loc.lat, lng: loc.lng, city: loc.city || data.design_data.weather.city })} />
                                                    </DebugBoundary>
                                                </motion.div>
                                            )}
                                        </Card>
                                        <Card title="Contacto de ayuda">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="Etiqueta"><input type="text" placeholder="Wedding Planner" value={data.design_data.contact.label} onChange={e => handleDesignChange('contact', { ...data.design_data.contact, label: e.target.value })} className="fi" /></Field>
                                                <Field label="WhatsApp (con prefijo)"><input type="text" placeholder="549XXXXXXXXXX" value={data.design_data.contact.whatsapp} onChange={e => handleDesignChange('contact', { ...data.design_data.contact, whatsapp: e.target.value })} className="fi" /></Field>
                                            </div>
                                        </Card>
                                    </>)}

                                    {/* ── ESTILO ── */}
                                    {activeSection === 'estilo' && (
                                        <Card title="Colores de la invitación">
                                            <p className="text-xs text-gray-400 mb-5">Haz clic en los círculos para cambiar los colores. Los cambios se reflejan en la vista previa.</p>
                                            <div className="grid grid-cols-2 gap-8">
                                                {[{ key: 'mainColor', label: 'Color Resaltado' }, { key: 'secondaryColor', label: 'Fondo / Contraste' }].map(({ key, label }) => (
                                                    <div key={key} className="text-center">
                                                        <div className="relative w-20 h-20 mx-auto mb-3 cursor-pointer">
                                                            <div className="w-full h-full rounded-full shadow-xl border-4 border-white" style={{ backgroundColor: data.design_data[key] }} />
                                                            <input type="color" value={data.design_data[key]} onChange={e => handleDesignChange(key, e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" />
                                                        </div>
                                                        <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{label}</p>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">{data.design_data[key]}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-5 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-2">Previsualización</p>
                                                <div className="flex gap-2 h-8">
                                                    <div className="flex-1 rounded-lg" style={{ backgroundColor: data.design_data.mainColor }} />
                                                    <div className="flex-1 rounded-lg" style={{ backgroundColor: data.design_data.secondaryColor }} />
                                                    <div className="flex-1 rounded-lg" style={{ background: `linear-gradient(135deg, ${data.design_data.mainColor}, ${data.design_data.secondaryColor})` }} />
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* ── Anterior / Siguiente ── */}
                                    <div className="flex items-center justify-between pt-2 pb-8">
                                        {prevSection ? (
                                            <button type="button" onClick={() => { setActiveSection(prevSection.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] transition-colors">
                                                <ChevronLeft className="w-3.5 h-3.5" /> {prevSection.label}
                                            </button>
                                        ) : <div />}
                                        {nextSection && (
                                            <button type="button" onClick={() => { setActiveSection(nextSection.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#C5A059] hover:text-[#b8903f] transition-colors">
                                                {nextSection.label} <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </div>

                    {/* ── PREVIEW — sticky al lado, sin scroll propio ── */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 320, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex-shrink-0 overflow-hidden"
                            >
                                {/* sticky: se queda fijo mientras el formulario scrollea */}
                                <div className="sticky top-[49px] h-[calc(100vh-49px)] bg-[#ECECE6] border-l border-[#DDDDD5] flex items-center justify-center">
                                    <div className="p-5 flex items-center justify-center w-full">
                                        <div className="relative w-[220px] h-[450px] bg-white rounded-[36px] border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden flex-shrink-0">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#1A1A1A] rounded-b-2xl z-20" />
                                            <div className="h-full overflow-y-auto pt-5 text-[40%]">
                                                <DebugBoundary name="Preview">
                                                    <TemplateLoader
                                                        slug={data.template_name}
                                                        data={data.design_data}
                                                        event={event}
                                                        guestGroup={{
                                                            group_name: 'Familia Castillo', total_passes: 2,
                                                            members: [
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
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {recentlySuccessful && (
                    <motion.div
                        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-2xl z-50 text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                        Cambios guardados
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .fi {
                    width: 100%;
                    border: none;
                    border-bottom: 1.5px solid #E0E0E0;
                    padding: 5px 2px;
                    font-size: 13px;
                    background: transparent;
                    outline: none;
                    transition: border-color 0.15s;
                    font-family: inherit;
                }
                .fi:focus { border-bottom-color: #C5A059; }
                select.fi { cursor: pointer; }
            `}</style>
        </AuthenticatedLayout>
    );
}

/* ── Sub-componentes ── */

function Card({ title, subtitle, badge, action, children }) {
    return (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F2F2F2]">
                <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">{title}</h4>
                    {subtitle && <p className="text-sm font-serif text-[#C5A059] mt-0.5">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {badge && <span className="text-[8px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{badge}</span>}
                    {action}
                </div>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, children, className = '' }) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && <label className="block text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">{label}</label>}
            {children}
        </div>
    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center gap-3 py-0.5">
            <button type="button" onClick={() => onChange(!checked)}
                className={`relative flex-shrink-0 w-9 h-[18px] rounded-full transition-colors duration-300 ${checked ? 'bg-[#C5A059]' : 'bg-gray-200'}`}>
                <motion.div animate={{ x: checked ? 19 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-[14px] h-[14px] bg-white rounded-full shadow" />
            </button>
            {(label || description) && (
                <div>
                    {label && <p className="text-xs font-medium text-[#1A1A1A] leading-tight">{label}</p>}
                    {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
                </div>
            )}
        </div>
    );
}