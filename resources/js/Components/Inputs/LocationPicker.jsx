import React, { useState, useEffect } from 'react';

export default function LocationPicker({ lat, lng, onLocationSelect, placeholder = "Buscar lugar..." }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [error, setError] = useState('');
    const [localLat, setLocalLat] = useState(lat || '');
    const [localLng, setLocalLng] = useState(lng || '');

    useEffect(() => {
        if (lat) setLocalLat(lat);
        if (lng) setLocalLng(lng);
    }, [lat, lng]);

    const hasCoords = localLat && localLng && !isNaN(parseFloat(localLat)) && !isNaN(parseFloat(localLng));

    const iframeSrc = hasCoords
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(localLng) - 0.005},${parseFloat(localLat) - 0.005},${parseFloat(localLng) + 0.005},${parseFloat(localLat) + 0.005}&layer=mapnik&marker=${localLat},${localLng}`
        : `https://www.openstreetmap.org/export/embed.html?bbox=-99.15,-19.45,-99.11,-19.41&layer=mapnik`;

    const tryFetch = async (url) => {
        // Determinamos si es Photon para no enviar cabeceras incompatibles
        const isPhoton = url.includes('photon.komoot.io');

        const res = await fetch(url, {
            // Eliminamos headers complejos que causan problemas de CORS en algunos navegadores/entornos
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            throw new Error(`API Error: ${res.status} - ${errorText}`);
        }
        return res.json();
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        setError('');

        try {
            // Intento 1: Photon (Más robusto para CORS y sin rate limits agresivos)
            try {
                // Photon no soporta lang=es, usamos lang=en que es el default o lo quitamos
                const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=1`;
                const pData = await tryFetch(photonUrl);

                if (pData && pData.features && pData.features.length > 0) {
                    const feature = pData.features[0];
                    const [pLng, pLat] = feature.geometry.coordinates;
                    const props = feature.properties;

                    // Extraer ciudad/nombre
                    const city = props.city || props.state || props.country || '';
                    const address = [props.name, props.street, props.city, props.country].filter(Boolean).join(', ');
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${pLat},${pLng}`;

                    setLocalLat(pLat);
                    setLocalLng(pLng);
                    onLocationSelect({ lat: pLat, lng: pLng, city, address, url: mapsUrl });
                    setLoading(false);
                    return;
                }
            } catch (pErr) {
                console.warn("Photon failed, trying Nominatim...", pErr);
            }

            // Fallback: Nominatim (Si Photon falla por alguna razón)
            const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`;
            const data = await tryFetch(nominatimUrl);

            if (data && data.length > 0) {
                const item = data[0];
                const newLat = parseFloat(item.lat);
                const newLng = parseFloat(item.lon);
                const city = item.address.city || item.address.town || item.address.village || item.address.county || '';
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${newLat},${newLng}`;
                setLocalLat(newLat);
                setLocalLng(newLng);
                onLocationSelect({ lat: newLat, lng: newLng, city, address: item.display_name, url: mapsUrl });
            } else {
                setError('No se pudo encontrar el lugar. Intenta con un nombre más general.');
            }
        } catch (err) {
            console.error("Search error:", err);
            setError('Error de conexión con el servicio de mapas. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleManualApply = () => {
        const parsedLat = parseFloat(localLat);
        const parsedLng = parseFloat(localLng);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            onLocationSelect({ lat: parsedLat, lng: parsedLng });
        }
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) { setError('Geolocalización no soportada'); return; }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocalLat(latitude);
                setLocalLng(longitude);
                try {
                    // Reverse geocoding (Nominatim o Photon)
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
                    const item = await tryFetch(url).catch(() => null);

                    if (item) {
                        const city = item.address?.city || item.address?.town || item.address?.village || '';
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                        onLocationSelect({ lat: latitude, lng: longitude, city, address: item.display_name, url: mapsUrl });
                    } else {
                        onLocationSelect({ lat: latitude, lng: longitude });
                    }
                } catch {
                    onLocationSelect({ lat: latitude, lng: longitude });
                }
                setGeoLoading(false);
            },
            () => { setError('Acceso a ubicación denegado.'); setGeoLoading(false); }
        );
    };

    return (
        <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-24 py-2 text-xs focus:ring-[#C5A059] focus:border-[#C5A059] transition-all"
                />
                <div className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </div>
                <div className="absolute right-2 top-1.5 flex gap-1">
                    <button type="button" onClick={useCurrentLocation} disabled={geoLoading} title="Usar mi ubicación"
                        className="p-1 px-2 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center">
                        {geoLoading
                            ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                            : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M3 12h3m12 0h3M12 3v3m0 12v3" /></svg>
                        }
                    </button>
                    <button type="button" onClick={handleSearch} disabled={loading}
                        className="bg-[#C5A059] text-white text-[10px] px-3 py-1 rounded hover:bg-[#A88948] transition-all disabled:opacity-50 flex items-center gap-1 min-w-[70px] justify-center">
                        {loading
                            ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                            : 'Buscar'}
                    </button>
                </div>
            </div>

            {error && <p className="text-[10px] text-red-500 font-medium px-1">{error}</p>}

            {/* Coords manuales */}
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-1 ml-1">Latitud</label>
                    <input type="number" step="any" value={localLat}
                        onChange={(e) => setLocalLat(e.target.value)}
                        onBlur={handleManualApply}
                        className="w-full border border-gray-100 rounded-lg px-3 py-2 text-xs font-mono focus:ring-[#C5A059] focus:border-[#C5A059] bg-white shadow-sm" />
                </div>
                <div className="relative">
                    <label className="block text-[9px] uppercase tracking-widest text-gray-400 mb-1 ml-1">Longitud</label>
                    <input type="number" step="any" value={localLng}
                        onChange={(e) => setLocalLng(e.target.value)}
                        onBlur={handleManualApply}
                        className="w-full border border-gray-100 rounded-lg px-3 py-2 text-xs font-mono focus:ring-[#C5A059] focus:border-[#C5A059] bg-white shadow-sm" />
                </div>
            </div>

            {/* Mapa via iframe */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner h-[220px] bg-gray-50 relative group">
                <iframe
                    src={iframeSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', filter: 'grayscale(0.2) contrast(1.1)' }}
                    title="Mapa"
                    className="transition-all duration-700 group-hover:grayscale-0"
                />
                {!hasCoords && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Sin ubicación seleccionada</p>
                    </div>
                )}
            </div>

            {hasCoords && (
                <div className="bg-[#FAF9F6] border border-[#E0E0E0]/50 py-2 px-4 rounded-xl flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-[9px] font-mono text-gray-400 tracking-tight">
                        Ubicación fijada: {parseFloat(localLat).toFixed(6)}, {parseFloat(localLng).toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
}
