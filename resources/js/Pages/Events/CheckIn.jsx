import React, { useEffect, useState, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Users, CheckCircle, XCircle, MapPin, Scan, Camera, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function CheckIn({ auth, event }) {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 250,
            },
            fps: 5,
        });

        scanner.render(onScanSuccess, onScanError);

        function onScanSuccess(decodedText) {
            // Decoded text should be the group slug or a URL
            let slug = decodedText;
            if (decodedText.includes('?g=')) {
                slug = decodedText.split('?g=')[1];
            }

            handleValidation(slug);
            scanner.clear();
            setIsScanning(false);
        }

        function onScanError(err) {
            // Silently ignore scan errors (usual during scanning)
        }

        return () => {
            scanner.clear().catch(e => console.error("Error clearing scanner", e));
        };
    }, []);

    const handleValidation = async (slug) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(route('events.check-in.validate', event.id), { slug });
            setScanResult(response.data.group);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al validar el código QR.');
            setScanResult(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleCheckIn = async () => {
        if (!scanResult) return;

        setLoading(true);
        try {
            const response = await axios.post(route('events.check-in.toggle', [event.id, scanResult.id]));
            if (response.data.success) {
                // Refresh data to show updated logs and status
                const refreshResponse = await axios.post(route('events.check-in.validate', event.id), {
                    slug: event.guest_groups?.find(g => g.id === scanResult.id)?.slug || scanResult.name.toLowerCase().replace(/\s+/g, '-')
                    // Note: Ideally we'd pass the slug back or keep it in state, using scanResult.slug if we had it
                });
                // Since we don't have the slug easily here without storing it, let's just update the local state for now
                setScanResult({
                    ...scanResult,
                    is_checked_in: response.data.is_checked_in,
                    logs: refreshResponse.data.group.logs, // Update logs from the refresh
                });
                alert(response.data.message);
            }
        } catch (err) {
            alert('Error al registrar movimiento.');
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setIsScanning(true);
        setError(null);
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-serif text-2xl text-[#1A1A1A]">Puerta Virtual: {event.name}</h2>}
        >
            <Head title="Control de Acceso" />

            <div className="py-12 bg-[#F9F9F7] min-h-[calc(100vh-64px)] px-4">
                <div className="max-w-md mx-auto space-y-8">

                    {/* Scanner Section */}
                    {isScanning && !scanResult && !error && !loading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 border border-[#E0E0E0] shadow-xl overflow-hidden rounded-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-flex p-3 bg-amber-50 rounded-full mb-4">
                                    <Scan className="w-8 h-8 text-[#C5A059]" />
                                </div>
                                <h3 className="text-xl font-serif">Escanear Invitación</h3>
                                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Apunta la cámara al código QR del invitado</p>
                            </div>

                            <div id="reader" className="overflow-hidden rounded-xl border-4 border-dashed border-gray-100"></div>
                        </motion.div>
                    )}

                    {/* Result / Loading Section */}
                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-20"
                            >
                                <RefreshCw className="w-12 h-12 text-[#C5A059] animate-spin mx-auto mb-4" />
                                <p className="font-serif italic text-gray-500">Procesando...</p>
                            </motion.div>
                        )}

                        {!loading && scanResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-[#E0E0E0] shadow-2xl rounded-2xl overflow-hidden"
                            >
                                <div className={`p-8 text-center ${scanResult.is_checked_in ? 'bg-green-50' : 'bg-gray-50'}`}>
                                    <div className="flex justify-center mb-4 relative">
                                        {scanResult.status === 'confirmed' ? (
                                            <CheckCircle className="w-16 h-16 text-green-500" />
                                        ) : (
                                            <XCircle className="w-16 h-16 text-amber-500" />
                                        )}
                                        {scanResult.is_checked_in && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase">
                                                Dentro
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-2xl font-serif text-[#1A1A1A]">{scanResult.name}</h4>
                                    <p className={`text-[10px] uppercase font-bold tracking-[0.2em] mt-2 ${scanResult.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {scanResult.status === 'confirmed' ? 'Confirmado' : 'Pendiente / No Confirmado'}
                                    </p>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={toggleCheckIn}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${scanResult.is_checked_in
                                                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                                }`}
                                        >
                                            <RefreshCw className="w-5 h-5 mb-2" />
                                            <span className="text-[10px] uppercase font-bold tracking-widest">
                                                {scanResult.is_checked_in ? 'Registrar Salida' : 'Registrar Entrada'}
                                            </span>
                                        </button>

                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-serif text-[#C5A059]">{scanResult.total_passes}</span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pases</span>
                                        </div>
                                    </div>

                                    {/* History Logs */}
                                    {scanResult.logs && scanResult.logs.length > 0 && (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                                            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-3 border-b border-gray-200 pb-1">Historial del Evento</p>
                                            <div className="space-y-2">
                                                {scanResult.logs.map((log, i) => (
                                                    <div key={i} className="flex justify-between text-[10px]">
                                                        <span className={`font-bold uppercase ${log.type === 'entry' ? 'text-green-600' : 'text-amber-600'}`}>
                                                            {log.type === 'entry' ? 'Entrada' : 'Salida'}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Distribución en Mesas</p>
                                        {scanResult.members.map((member, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                                <div className="bg-white p-2 rounded-lg border border-gray-100">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-[#1A1A1A]">{member.name}</p>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                                                        <MapPin className="w-3 h-3" /> {member.table}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={resetScanner}
                                        className="w-full bg-[#1A1A1A] text-white py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all rounded-xl mt-8 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Camera className="w-4 h-4" /> Escanear Siguiente
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {!loading && error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-red-100 shadow-xl rounded-2xl p-8 text-center"
                            >
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h4 className="text-xl font-serif text-red-600 mb-2">Error de Validación</h4>
                                <p className="text-gray-500 text-sm mb-8">{error}</p>
                                <button
                                    onClick={resetScanner}
                                    className="w-full bg-red-600 text-white py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-4 h-4" /> Reintentar Escaneo
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
