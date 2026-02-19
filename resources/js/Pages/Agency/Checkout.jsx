import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CreditCard, Smartphone, Banknote, Loader2, CheckCircle2 } from 'lucide-react';

export default function Checkout({ auth, plan, amount, orderNumber, tilopayConfig, user }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [yappyPhone, setYappyPhone] = useState('');
    const [sinpeDni, setSinpeDni] = useState('');
    const [sinpeTypeDni, setSinpeTypeDni] = useState('1');
    const [sinpeInst, setSinpeInst] = useState(null);
    const tilopayRef = useRef(null);

    useEffect(() => {
        const initTilopay = async () => {
            try {
                // 1. Get Token from Backend
                const response = await axios.post(route('tilopay.token'), {
                    amount: amount,
                    currency: 'USD',
                    orderNumber: orderNumber
                });

                const { token } = response.data;

                // 2. Initialize Tilopay SDK
                // We assume Tilopay is already loaded via <script> in app.blade.php
                if (typeof Tilopay !== 'undefined') {
                    const setup = await Tilopay.Init({
                        token: token,
                        currency: 'USD',
                        language: 'es',
                        amount: amount.toFixed(2),
                        billToEmail: user.email,
                        orderNumber: orderNumber,
                        billToFirstName: user.name.split(' ')[0],
                        billToLastName: user.name.split(' ')[1] || 'Usuario',
                        billToAddress: 'San Jose, Costa Rica', // Dynamic address can be added if needed
                        capture: 1,
                        redirect: route('payment.callback'),
                        subscription: 0, // 1 for recurring
                    });

                    console.log('Tilopay initialized', setup);
                    setLoading(false);
                } else {
                    setError('El SDK de Tilopay no se cargó correctamente.');
                }
            } catch (err) {
                console.error('Error initializing Tilopay:', err);
                setError('Error al conectar con la pasarela de pagos.');
                setLoading(false);
            }
        };

        const checkSdkLoaded = setInterval(() => {
            if (typeof Tilopay !== 'undefined') {
                clearInterval(checkSdkLoaded);
                initTilopay();
            }
        }, 500);

        return () => clearInterval(checkSdkLoaded);
    }, []);

    const handleStartPayment = async () => {
        if (paymentMethod === 'yappy') {
            if (!yappyPhone) {
                alert('Por favor ingrese su número de Yappy');
                return;
            }
            Tilopay.updateOptions({ phoneYappy: yappyPhone });
        }

        if (paymentMethod === 'sinpe') {
            if (!sinpeDni) {
                alert('Por favor ingrese su DNI para SINPE');
                return;
            }
            try {
                Tilopay.updateOptions({
                    typeDni: sinpeTypeDni,
                    dni: sinpeDni
                });
                const inst = await Tilopay.getSinpeMovil();
                setSinpeInst(inst);
                return; // SINPE doesn't need startPayment
            } catch (err) {
                console.error('SINPE Error:', err);
                alert('Error al generar datos de SINPE');
                return;
            }
        }

        Tilopay.startPayment();
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif uppercase tracking-widest">Finalizar Compra</h2>}
        >
            <Head title="Checkout - Tilopay" />

            <div className="py-12 bg-[#FAF9F6] min-h-screen">
                <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-5 gap-8">

                    {/* Resumen de Compra - Izquierda */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-2xl">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold mb-6">Tu Pedido</h3>

                            <div className="flex justify-between items-end mb-4 pb-4 border-b border-gray-50">
                                <div>
                                    <p className="font-serif text-lg text-[#1A1A1A] capitalize">Plan {plan}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Pago único / Mes</p>
                                </div>
                                <span className="font-sans text-xl font-bold">${amount}</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Orden</span>
                                    <span className="font-mono text-gray-600">{orderNumber}</span>
                                </div>
                                <div className="flex justify-between text-lg pt-4 border-t border-gray-50 font-bold text-[#1A1A1A]">
                                    <span className="font-serif italic font-normal">Total</span>
                                    <span>${amount} USD</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1A1A1A] p-8 rounded-2xl text-white">
                            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold mb-4">Preguntas Frecuentes</h4>
                            <div className="space-y-4">
                                <p className="text-[11px] leading-relaxed text-gray-400">
                                    <span className="text-white block font-bold mb-1">¿Cuándo se activa mi plan?</span>
                                    Instantáneamente después de confirmar el pago.
                                </p>
                                <p className="text-[11px] leading-relaxed text-gray-400">
                                    <span className="text-white block font-bold mb-1">¿Es seguro?</span>
                                    Usamos Tilopay con protocolos de seguridad bancaria y 3DS.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pasarela de Pago - Derecha */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden min-h-[500px] flex flex-col">

                            {loading && (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-[#C5A059] mb-4" />
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">Cargando pasarela segura...</p>
                                </div>
                            )}

                            {error && (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                                        <Banknote className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-serif mb-2">{error}</p>
                                    <button onClick={() => window.location.reload()} className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold underline">Reintentar</button>
                                </div>
                            )}

                            {!loading && !error && (
                                <div className="p-8 md:p-12 payFormTilopay space-y-8">
                                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A] font-bold mb-8 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-[#C5A059]" /> Método de Pago
                                    </h3>

                                    {/* Select de Métodos Personalizado */}
                                    <div className="grid grid-cols-3 gap-2 mb-8">
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-100 grayscale hover:grayscale-0'}`}
                                        >
                                            <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-[#C5A059]' : 'text-gray-300'}`} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold">Tarjeta</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('yappy')}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'yappy' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-100 grayscale hover:grayscale-0'}`}
                                        >
                                            <Smartphone className={`w-5 h-5 ${paymentMethod === 'yappy' ? 'text-[#C5A059]' : 'text-gray-300'}`} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold">Yappy</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('sinpe')}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${paymentMethod === 'sinpe' ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-100 grayscale hover:grayscale-0'}`}
                                        >
                                            <Banknote className={`w-5 h-5 ${paymentMethod === 'sinpe' ? 'text-[#C5A059]' : 'text-gray-300'}`} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold">SINPE</span>
                                        </button>
                                    </div>

                                    {/* Divs Obligatorios de Tilopay */}
                                    <div className={paymentMethod === 'card' ? 'block animate-in fade-in slide-in-from-top-4' : 'hidden'}>
                                        <div id="tlpy_card_payment_div" className="space-y-4"></div>
                                    </div>

                                    <div className={paymentMethod === 'yappy' ? 'block animate-in fade-in slide-in-from-top-4' : 'hidden'}>
                                        <div className="space-y-4">
                                            <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold">Número de Teléfono Yappy</label>
                                            <input
                                                id="tlpy_phone_number"
                                                type="text"
                                                value={yappyPhone}
                                                onChange={(e) => setYappyPhone(e.target.value)}
                                                className="w-full border-0 border-b border-gray-100 focus:border-[#C5A059] focus:ring-0 text-lg px-0 py-3 font-serif"
                                                placeholder="6000-0000"
                                            />
                                            <div id="tlpy_yappy_payment_div"></div>
                                        </div>
                                    </div>

                                    <div className={paymentMethod === 'sinpe' ? 'block animate-in fade-in slide-in-from-top-4' : 'hidden'}>
                                        {sinpeInst ? (
                                            <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 text-center">
                                                <CheckCircle2 className="w-10 h-10 text-teal-500 mx-auto mb-4" />
                                                <h4 className="font-serif text-lg text-teal-900 mb-2">Instrucciones SINPE</h4>
                                                <p className="text-sm text-teal-700 leading-relaxed">{sinpeInst.message}</p>
                                                <div className="mt-4 p-4 bg-white rounded-xl font-mono text-lg font-bold text-teal-800">
                                                    #{sinpeInst.number} <br />
                                                    Monto: {sinpeInst.currency} {sinpeInst.amount}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Tipo DNI</label>
                                                        <select
                                                            value={sinpeTypeDni}
                                                            onChange={(e) => setSinpeTypeDni(e.target.value)}
                                                            className="w-full border-gray-100 rounded-lg text-sm focus:border-[#C5A059] focus:ring-[#C5A059]/20"
                                                        >
                                                            <option value="1">Cédula Identidad</option>
                                                            <option value="2">Jurídica</option>
                                                            <option value="6">DIMEX</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">DNI / Cédula</label>
                                                        <input
                                                            type="text"
                                                            value={sinpeDni}
                                                            onChange={(e) => setSinpeDni(e.target.value)}
                                                            className="w-full border-gray-100 rounded-lg text-sm focus:border-[#C5A059] focus:ring-[#C5A059]/20"
                                                            placeholder="000000000"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botón Acción Tilopay */}
                                    {(!sinpeInst || paymentMethod !== 'sinpe') && (
                                        <button
                                            onClick={handleStartPayment}
                                            className="w-full bg-[#1A1A1A] text-white py-5 rounded-xl font-sans uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#C5A059] hover:shadow-xl hover:shadow-[#C5A059]/20 transition-all active:scale-[0.98]"
                                        >
                                            {paymentMethod === 'sinpe' ? 'Generar SINPE' : `Pagar $${amount} USD`}
                                        </button>
                                    )}

                                    {/* Div Obligatorio para 3DS */}
                                    <div id="responseTilopay" className="mt-4"></div>

                                    <div className="flex items-center justify-center gap-6 pt-12 opacity-30 grayscale">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4 object-contain" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6 object-contain" />
                                        <img src="https://app.tilopay.com/assets/img/logo-tilopay-white.png" className="h-5 object-contain invert" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
