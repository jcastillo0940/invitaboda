import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, ThermometerSun, Wind, Sun } from 'lucide-react';

/**
 * Animated Weather Icons (Outline Style)
 */
const AnimatedIcon = ({ code }) => {
    // Condition mapping: https://www.weatherapi.com/docs/weather_conditions.json
    const isSunny = code === 1000;
    const isCloudy = [1003, 1006, 1009].includes(code);
    const isRain = [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code);
    const isStorm = [1087, 1273, 1276, 1279, 1282].includes(code);

    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
            {isSunny && (
                <motion.svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    className="w-10 h-10 text-[#C5A059]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                >
                    <circle cx="12" cy="12" r="5" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                        <line
                            key={deg} x1="12" y1="1" x2="12" y2="4"
                            transform={`rotate(${deg} 12 12)`}
                        />
                    ))}
                </motion.svg>
            )}

            {(isCloudy || isRain || isStorm) && (
                <div className="relative">
                    <motion.svg
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        className="w-10 h-10 text-gray-400"
                    >
                        <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5S20 10 17.5 10c-.2 0-.5 0-.7.1C15.8 7.6 13.1 6 10 6 5.6 6 2 9.6 2 14s3.6 8 8 8h7.5" />
                    </motion.svg>

                    {isRain && (
                        <div className="absolute top-8 left-2 flex gap-2">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    className="w-0.5 h-2 bg-blue-400 rounded-full"
                                    animate={{ y: [0, 5], opacity: [0, 1, 0] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.3 }}
                                />
                            ))}
                        </div>
                    )}

                    {isStorm && (
                        <motion.path
                            d="M13 10l-3 4h5l-3 4"
                            stroke="#C5A059" strokeWidth="1.5"
                            className="absolute inset-0 m-auto mt-8 ml-4 w-4"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        />
                    )}
                </div>
            )}

            {!isSunny && !isCloudy && !isRain && !isStorm && (
                <Sun className="w-8 h-8 text-[#C5A059] opacity-50" />
            )}
        </div>
    );
};

export default function Weather({ config, eventDate }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { enabled, lat, lng, apiKey, city } = config || {};
    const effectiveApiKey = apiKey || import.meta.env.VITE_WEATHER_API_KEY;

    useEffect(() => {
        if (!enabled || !effectiveApiKey || !lat || !lng) {
            setLoading(false);
            return;
        }

        const fetchWeatherData = async () => {
            try {
                const today = new Date();
                const event = new Date(eventDate);
                const diffTime = event - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // ESTADO 1: Faltan 9 días o más
                if (diffDays >= 9) {
                    setWeather({ state: 1 });
                    setLoading(false);
                    return;
                }

                // Determinar si es HOY o Proximamente (Estado 2 o 3)
                const isToday = new Date(eventDate).toDateString() === today.toDateString();
                const endpoint = isToday ? 'current.json' : 'forecast.json';
                const params = isToday ? '&aqi=no' : `&days=10`; // Ajustado para forecast general

                const response = await fetch(
                    `https://api.weatherapi.com/v1/${endpoint}?key=${effectiveApiKey}&q=${lat},${lng}${params}&lang=es`
                );

                if (!response.ok) throw new Error('API Error');
                const data = await response.json();

                if (isToday) {
                    setWeather({
                        state: 3,
                        current: data.current,
                        alerts: data.alerts || []
                    });
                } else {
                    // Buscar el día exacto en el array de forecast
                    const targetDay = data.forecast.forecastday.find(d => d.date === eventDate);
                    const dayData = targetDay ? targetDay.day : data.forecast.forecastday[0].day;

                    setWeather({
                        state: 2,
                        max: Math.round(dayData.maxtemp_c),
                        min: Math.round(dayData.mintemp_c),
                        condition: dayData.condition
                    });
                }
            } catch (err) {
                console.error("Clima Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();
    }, [enabled, lat, lng, effectiveApiKey, eventDate]);

    if (!enabled) return null;
    if (loading) return <div className="text-center py-8 text-[10px] uppercase tracking-[0.3em] text-[#C5A059] animate-pulse">Sincronizando Clima...</div>;
    if (error || !weather) return null;

    // Lógica de Mensajes Dinámicos (Estado 3 - Hoy)
    const getDynamicMessage = (current) => {
        const code = current.condition.code;
        if ([1087, 1273, 1276, 1279, 1282, 1186, 1189, 1192, 1195].includes(code)) {
            return "Parece que tendremos algunas gotas de bendición. ¡Recuerda traer un paraguas para la llegada!";
        }
        if (code === 1000) {
            return "¡Hace un día espectacular! Todo está listo para una celebración perfecta.";
        }
        if (current.feelslike_c < 15 || current.wind_kph > 30) {
            return "El clima estará un poco fresco, te sugerimos traer un abrigo ligero.";
        }
        return "Disfruta de este día especial bajo el cielo de nuestro compromiso.";
    };

    return (
        <div className="max-w-md mx-auto px-6">
            <AnimatePresence mode="wait">
                {/* ESTADO 1: Futuro Lejano */}
                {weather.state === 1 && (
                    <motion.div
                        key="state1"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-8 text-center border border-white/5 bg-black/5 rounded-3xl backdrop-blur-sm"
                    >
                        <AnimatedIcon code={1000} />
                        <p className="mt-4 text-[10px] uppercase tracking-[0.4em] text-gray-400 leading-relaxed max-w-xs mx-auto">
                            Pronto tendremos los detalles del clima en tiempo real para nuestro gran día.
                        </p>
                    </motion.div>
                )}

                {/* ESTADO 2: Pronóstico (1-8 días) */}
                {weather.state === 2 && (
                    <motion.div
                        key="state2"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-8 border border-white/5 bg-black/20 rounded-3xl backdrop-blur-md flex flex-col items-center gap-6"
                    >
                        <span className="text-[9px] uppercase tracking-[0.6em] text-[#C5A059] font-sans">Pronóstico del Clima</span>
                        <div className="flex items-center gap-8">
                            <AnimatedIcon code={weather.condition.code} />
                            <div className="text-left">
                                <div className="text-4xl font-serif text-white">{weather.max}°<span className="text-xl opacity-40 ml-1">/ {weather.min}°</span></div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{weather.condition.text}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ESTADO 3: El Día de la Boda */}
                {weather.state === 3 && (
                    <motion.div
                        key="state3"
                        initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
                        className="p-10 border border-[#C5A059]/20 bg-[#0a0a0a] rounded-3xl shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent"></div>

                        <div className="flex justify-between items-start mb-10">
                            <div className="text-left">
                                <span className="text-[8px] uppercase tracking-[0.5em] text-[#C5A059] mb-2 block">{city || 'Hoy'}</span>
                                <div className="text-5xl font-light text-white">{Math.round(weather.current.temp_c)}°C</div>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500 uppercase tracking-widest">
                                    <ThermometerSun className="w-3 h-3" />
                                    Sensación: {Math.round(weather.current.feelslike_c)}°C
                                </div>
                            </div>
                            <AnimatedIcon code={weather.current.condition.code} />
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl flex items-start gap-4 mb-8">
                            <Info className="w-5 h-5 text-[#C5A059] shrink-0" />
                            <p className="text-[11px] font-sans italic text-gray-300 leading-relaxed text-left">
                                {getDynamicMessage(weather.current)}
                            </p>
                        </div>

                        {weather.alerts?.length > 0 && (
                            <div className="flex items-center gap-3 text-red-400 bg-red-950/20 p-3 rounded-xl border border-red-900/30">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-[9px] uppercase tracking-widest font-bold">Alerta Meteorológica Activa</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
