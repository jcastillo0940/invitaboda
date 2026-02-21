import React, { useState, useEffect } from 'react';
import { Search, MapPin, ExternalLink } from 'lucide-react';

/**
 * LocationPicker — sin react-leaflet (causa crashes en producción con Vite).
 * Usa Nominatim para búsqueda de lugar y muestra un iframe de OpenStreetMap
 * como referencia visual. Sin dependencias problemáticas de hooks de Leaflet.
 */
export default function LocationPicker({ lat, lng, onLocationSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localLat, setLocalLat] = useState(lat || '');
    const [localLng, setLocalLng] = useState(lng || '');

    // Sincronizar si los props cambian desde afuera
    useEffect(() => {
        if (lat) setLocalLat(lat);
        if (lng) setLocalLng(lng);
    }, [lat, lng]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
                { headers: { 'Accept-Language': 'es' } }
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const newLat = parseFloat(data[0].lat);
                const newLng = parseFloat(data[0].lon);
                setLocalLat(newLat);
                setLocalLng(newLng);
                onLocationSelect(newLat, newLng);
                setError('');
            } else {
                setError('No se encontró el lugar. Intenta con otro nombre.');
            }
        } catch {
            setError('Error al buscar. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualApply = () => {
        const parsedLat = parseFloat(localLat);
        const parsedLng = parseFloat(localLng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            onLocationSelect(parsedLat, parsedLng);
        }
    };

    const hasCoords = localLat && localLng && !isNaN(parseFloat(localLat)) && !isNaN(parseFloat(localLng));
    const mapUrl = hasCoords
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(localLng) - 0.05},${parseFloat(localLat) - 0.05},${parseFloat(localLng) + 0.05},${parseFloat(localLat) + 0.05}&layer=mapnik&marker=${localLat},${localLng}`
        : null;

    return (
        <div className="space-y-4">
            {/* Buscador */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar lugar (Ej: Hacienda San Pancho, México)..."
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-24 py-2 text-xs focus:ring-[#C5A059] focus:border-[#C5A059]"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 top-1.5 bg-[#C5A059] text-white text-[10px] px-3 py-1 rounded hover:bg-[#A88948] transition-all disabled:opacity-50"
                >
                    {loading ? '...' : 'Buscar'}
                </button>
            </form>

            {error && (
                <p className="text-[10px] text-red-500 font-sans">{error}</p>
            )}

            {/* Inputs manuales de coordenadas */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-1">Latitud</label>
                    <input
                        type="number"
                        step="any"
                        value={localLat}
                        onChange={(e) => setLocalLat(e.target.value)}
                        onBlur={handleManualApply}
                        placeholder="19.4326"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:ring-[#C5A059] focus:border-[#C5A059]"
                    />
                </div>
                <div>
                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-1">Longitud</label>
                    <input
                        type="number"
                        step="any"
                        value={localLng}
                        onChange={(e) => setLocalLng(e.target.value)}
                        onBlur={handleManualApply}
                        placeholder="-99.1332"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs font-mono focus:ring-[#C5A059] focus:border-[#C5A059]"
                    />
                </div>
            </div>

            {/* Vista previa del mapa (iframe — sin react-leaflet) */}
            {mapUrl ? (
                <div className="rounded-xl overflow-hidden border border-gray-100 relative">
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        loading="lazy"
                        title="Ubicación en el mapa"
                    />
                    <a
                        href={`https://www.openstreetmap.org/?mlat=${localLat}&mlon=${localLng}#map=14/${localLat}/${localLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 text-[9px] text-gray-600 px-2 py-1 rounded shadow text-[9px] uppercase tracking-wider"
                    >
                        <ExternalLink className="w-3 h-3" /> Ver mapa
                    </a>
                </div>
            ) : (
                <div className="h-20 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-5 h-5" />
                        <span className="text-[10px] uppercase tracking-widest">
                            Busca un lugar para ver el mapa
                        </span>
                    </div>
                </div>
            )}

            {hasCoords && (
                <p className="text-[9px] font-mono text-gray-400 text-center">
                    📍 {parseFloat(localLat).toFixed(6)}, {parseFloat(localLng).toFixed(6)}
                </p>
            )}
        </div>
    );
}
