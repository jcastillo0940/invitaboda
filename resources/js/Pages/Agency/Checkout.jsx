import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, router } from '@inertiajs/react'
import { motion } from 'framer-motion'
// IMPORTACIÓN AÑADIDA PARA PAYPAL
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

// AÑADIDO: Recibe planDetails y paymentMethods desde la base de datos
export default function Checkout({ plan, planDetails, amount, orderNumber, user, callbackUrl, paypalClientId, paymentMethods = [] }) {
    // status: loading | ready | card | offline | paypal | processing | error
    const [status, setStatus]               = useState('loading')
    const [errorMsg, setErrorMsg]           = useState(null)
    const [selectedMethod, setSelectedMethod] = useState(null)
    const sdkLoaded                         = useRef(false)
    const sdkInitialized                    = useRef(false)

    // LECTURA DINÁMICA DE LA BASE DE DATOS
    // Filtramos qué métodos están habilitados desde el backend
    const hasTilopay = paymentMethods.some(m => m.identifier === 'tilopay')
    const hasPaypal  = paymentMethods.some(m => m.identifier === 'paypal')
    const offlineMethods = paymentMethods.filter(m => !['tilopay', 'paypal'].includes(m.identifier))

    // Leemos los datos del plan desde DB, con fallback a los quemados por compatibilidad
    const planLabel = planDetails?.name || (plan === 'agency' ? 'Master Agency' : 'Elite Planner')
    const planSub   = planDetails?.description || (plan === 'agency' ? 'Eventos ilimitados y White-Label' : 'Hasta 5 eventos activos')

    const buildRedirectUrl = () => {
        const url = new URL(callbackUrl)
        url.searchParams.set('order_number', orderNumber)
        return url.toString()
    }

    useEffect(() => {
        if (sdkLoaded.current) return
        sdkLoaded.current = true

        // Si Tilopay está habilitado en DB, cargamos su SDK
        if (hasTilopay) {
            if (typeof window.Tilopay !== 'undefined') {
                fetchTokenAndInit()
                return
            }

            const existing = document.getElementById('tilopay-sdk')
            if (existing) existing.remove()

            const script   = document.createElement('script')
            script.id      = 'tilopay-sdk'
            script.src     = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js'
            script.async   = false
            script.onload  = () => fetchTokenAndInit()
            script.onerror = () => {
                setErrorMsg('No se pudo cargar el SDK de Tilopay.')
                setStatus('error')
            }
            document.body.appendChild(script)
        } else {
            // Si Tilopay NO está activo, llenamos el dropdown solo con PayPal y Offline
            populateDropdown([])
            setStatus('ready')
        }
    }, [hasTilopay])

    const fetchTokenAndInit = async () => {
        if (sdkInitialized.current) return
        sdkInitialized.current = true

        try {
            const res         = await axios.post('/tilopay/token', { orderNumber })
            const token       = res.data.token
            const redirectUrl = buildRedirectUrl()

            const initialize = await window.Tilopay.Init({
                token,
                currency:          'USD',
                language:          'es',
                amount:            parseFloat(amount),
                billToFirstName:   user?.name?.split(' ')[0] || 'Cliente',
                billToLastName:    user?.name?.split(' ').slice(1).join(' ') || 'N',
                billToAddress:     user?.address || 'N/A',
                billToAddress2:    '',
                billToCity:        user?.city || '',
                billToState:       user?.state || '',
                billToZipPostCode: user?.zip || '',
                billToCountry:     user?.country || 'PA',
                billToTelephone:   user?.phone || '',
                billToEmail:       user?.email || '',
                orderNumber,
                capture:           1,
                redirect:          redirectUrl,
                subscription:      0,
                hashVersion:       'V2',
            })

            console.log('[Tilopay] Init response:', initialize)
            console.log('[Tilopay] Methods:', initialize?.methods)

            populateDropdown(initialize?.methods || [])
            setStatus('ready')

        } catch (err) {
            console.error('[Tilopay] Init error:', err)
            setErrorMsg('Error al inicializar el formulario de pago.')
            setStatus('error')
        }
    }

    // NUEVA FUNCIÓN PARA POBLAR EL SELECTOR DINÁMICAMENTE
    const populateDropdown = (tilopayMethods) => {
        const select = document.getElementById('tlpy_payment_method')
        if (!select) return

        // Clonamos el select para limpiar EventListeners anteriores sin perder el DOM
        const newSelect = select.cloneNode(false)
        newSelect.innerHTML = '<option value="">Seleccione método de pago</option>'

        // 1. Agregar Tilopay
        if (hasTilopay && tilopayMethods.length > 0) {
            tilopayMethods.forEach(m => {
                const opt   = document.createElement('option')
                opt.value   = m.id
                opt.text    = m.name.toLowerCase() === 'contado' ? 'Pago en línea (Tarjeta)' : m.name
                opt.dataset.tilopay = '1'
                newSelect.appendChild(opt)
            })
        }

        // 2. Agregar Métodos Offline (Leídos desde DB)
        offlineMethods.forEach(m => {
            const opt           = document.createElement('option')
            opt.value           = m.identifier
            opt.text            = m.name
            opt.dataset.offline = '1'
            opt.dataset.instructions = m.instructions || ''
            newSelect.appendChild(opt)
        })

        // 3. Agregar PayPal (Si está habilitado en DB)
        if (hasPaypal) {
            const optPaypal = document.createElement('option')
            optPaypal.value = 'paypal_method'
            optPaypal.text  = 'PayPal / Tarjeta de Crédito (Internacional)'
            optPaypal.dataset.paypal = '1'
            newSelect.appendChild(optPaypal)
        }

        // 4. Lógica de Cambio
        newSelect.addEventListener('change', (e) => {
            const val         = e.target.value
            const selectedOpt = e.target.options[e.target.selectedIndex]
            const isOffline   = selectedOpt?.dataset?.offline === '1'
            const isPaypal    = selectedOpt?.dataset?.paypal === '1'
            const label       = selectedOpt?.text || ''
            const instructions= selectedOpt?.dataset?.instructions || ''

            console.log('[Payment] Select change → value:', val)

            if (!val) {
                setStatus('ready')
                setSelectedMethod(null)
                document.getElementById('tlpy_card_payment_div').style.display  = 'none'
                document.getElementById('tlpy_yappy_payment_div').style.display = 'none'
                return
            }

            if (isPaypal) {
                setSelectedMethod({ id: val, label })
                setStatus('paypal')
                document.getElementById('tlpy_card_payment_div').style.display  = 'none'
                document.getElementById('tlpy_yappy_payment_div').style.display = 'none'
            } else if (isOffline) {
                // Pasamos las instrucciones extraídas de la BD
                setSelectedMethod({ id: val, label, instructions })
                setStatus('offline')
                document.getElementById('tlpy_card_payment_div').style.display  = 'none'
                document.getElementById('tlpy_yappy_payment_div').style.display = 'none'
            } else {
                setSelectedMethod({ id: val, label })
                setStatus('card')
                setTimeout(() => {
                    const cardDiv = document.getElementById('tlpy_card_payment_div')
                    if (cardDiv) cardDiv.style.display = 'block'
                    document.getElementById('tlpy_yappy_payment_div').style.display = 'none'
                }, 100)
            }
        })

        // Reemplazamos el select viejo por el nuevo
        select.parentNode.replaceChild(newSelect, select)
    }

    const handlePay = async () => {
        const methodValue = document.getElementById('tlpy_payment_method')?.value

        if (!methodValue) {
            setErrorMsg('Por favor selecciona un método de pago.')
            return
        }

        setStatus('processing')
        setErrorMsg(null)

        try {
            const result = await window.Tilopay.startPayment()

            if (result?.error || result?.type === 'error') {
                setErrorMsg(result?.message || result?.error || 'El pago fue rechazado.')
                setStatus('card')
                return
            }

            if (result?.response === '1' || result?.responseCode === '1') {
                window.location.href = buildRedirectUrl() + '&response=1'
                return
            }

            if (result !== undefined && result !== null) {
                setErrorMsg('El pago no pudo completarse. Verifica los datos de tu tarjeta.')
                setStatus('card')
            }
        } catch (err) {
            console.error('[Tilopay] startPayment error:', err)
            setErrorMsg('Error al procesar el pago. Intenta de nuevo.')
            setStatus('card')
        }
    }

    // Construye la lista de Features basándose en los datos de la DB
    const getFeaturesList = () => {
        if (planDetails) {
            const list = []
            if (planDetails.max_events) list.push(`Hasta ${planDetails.max_events} Eventos Activos`)
            else list.push('Eventos Ilimitados')

            if (planDetails.feature_custom_site) list.push('Diseños Premium / Web Personalizada')
            if (planDetails.feature_rsvp) list.push('RSVP Personalizado (Confirmación)')
            if (planDetails.feature_custom_domain) list.push('Dominio Personalizado')
            if (planDetails.feature_advanced_reports) list.push('Reportes Avanzados')
            if (planDetails.feature_export_data) list.push('Exportación de Datos')
            if (planDetails.feature_provider_integration) list.push('Integración con Proveedores')
            
            return list
        }
        return plan === 'agency'
            ? ['Eventos Ilimitados', 'White-Label (Tu Marca)', 'Panel para Clientes', 'Soporte VIP 24/7', 'Dominio Personalizado']
            : ['Hasta 5 Eventos Activos', 'Diseños Premium', 'RSVP Personalizado', 'Soporte Prioritario']
    }

    const inputClass = "w-full border border-[#E0E0E0] bg-[#F9F9F7] px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-colors"
    const labelClass = "block text-[10px] uppercase tracking-[0.25em] text-[#888888] font-bold mb-2"

    const showSdkForm = ['ready', 'card', 'processing', 'paypal'].includes(status)

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">
                    Completar Pago
                </h2>
            }
        >
            <Head title="Checkout" />

            <div className="py-12 bg-[#F9F9F7]">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid md:grid-cols-5 gap-8"
                    >
                        {/* ── LEFT: Resumen ─────────────────────────────────── */}
                        <div className="md:col-span-2">
                            <div className="bg-[#1A1A1A] p-8 h-full flex flex-col">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold mb-6">
                                    Resumen de orden
                                </p>
                                <div className="border-b border-[#2A2A2A] pb-6 mb-6">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#666] mb-2">{planSub}</p>
                                    <h3 className="text-2xl font-serif text-white mb-1">{planLabel}</h3>
                                    <div className="flex items-baseline gap-2 mt-4">
                                        <span className="text-4xl font-serif text-[#C5A059]">${amount}</span>
                                        <span className="text-[#666] text-sm">USD / mes</span>
                                    </div>
                                </div>
                                <ul className="space-y-3 flex-1">
                                    {getFeaturesList().map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-[#999]">
                                            <svg className="w-4 h-4 text-[#C5A059] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                            </svg>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-8 pt-6 border-t border-[#2A2A2A]">
                                    <p className="text-[10px] text-[#555] uppercase tracking-widest">Orden</p>
                                    <p className="text-xs text-[#666] mt-1 font-mono">{orderNumber}</p>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT: Formulario ─────────────────────────────── */}
                        <div className="md:col-span-3">
                            <div className="bg-white border border-[#E0E0E0] p-8 min-h-[400px]">

                                {/* Error banner */}
                                {errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded"
                                    >
                                        {errorMsg}
                                    </motion.div>
                                )}

                                {/* ── Loading ── */}
                                {status === 'loading' && (
                                    <div className="text-center py-16">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059] mx-auto mb-4"></div>
                                        <p className="text-[#888] text-xs uppercase tracking-widest">Cargando...</p>
                                    </div>
                                )}

                                {/* ── Processing ── */}
                                {status === 'processing' && (
                                    <div className="text-center py-16">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C5A059] mx-auto mb-4"></div>
                                        <p className="text-[#888] text-xs uppercase tracking-widest">Procesando pago...</p>
                                        <p className="text-[#BBB] text-[10px] mt-2">No cierres esta ventana</p>
                                    </div>
                                )}

                                {/* ── OFFLINE: ACH / Yappy (Dinámico) ── */}
                                {status === 'offline' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-2"
                                    >
                                        <div className="flex items-center justify-center w-14 h-14 border border-[#C5A059]/30 bg-[#C5A059]/5 mx-auto mb-5">
                                            <svg className="w-7 h-7 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>

                                        <h3 className="text-center font-serif text-xl text-[#1A1A1A] mb-1">
                                            Pago pendiente de verificación
                                        </h3>
                                        <p className="text-center text-[#999] text-xs leading-relaxed mt-2 mb-5 max-w-xs mx-auto">
                                            {selectedMethod?.instructions || `Seleccionaste ${selectedMethod?.label}. Una vez que realices el pago, nuestro equipo lo verificará y activará tu plan en menos de 24 horas.`}
                                        </p>

                                        <div className="bg-[#F9F9F7] border border-[#E0E0E0] p-4 mb-5 text-xs space-y-3">
                                            {[
                                                ['Plan',   planLabel],
                                                ['Monto',  `$${amount} USD`],
                                                ['Método', selectedMethod?.label],
                                                ['Orden',  orderNumber],
                                                ['Email',  user?.email],
                                            ].map(([k, v]) => (
                                                <div key={k} className="flex justify-between">
                                                    <span className="uppercase tracking-widest text-[#AAA]">{k}</span>
                                                    <span className="font-mono text-[#555]">{v}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 p-3 mb-6 text-xs text-amber-700 leading-relaxed">
                                            📧 Recibirás un correo en <strong>{user?.email}</strong> cuando tu pago sea confirmado.
                                        </div>

                                        <button
                                            onClick={() => router.visit(route('dashboard'))}
                                            className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-white py-4 font-sans uppercase tracking-[0.2em] text-[10px] transition-all"
                                        >
                                            Entendido — Ir al Dashboard
                                        </button>
                                        <button
                                            onClick={() => { setStatus('ready'); setSelectedMethod(null) }}
                                            className="w-full mt-3 text-[#AAA] hover:text-[#C5A059] text-[10px] uppercase tracking-widest transition-colors py-2"
                                        >
                                            ← Cambiar método de pago
                                        </button>
                                    </motion.div>
                                )}

                                {/* ── SDK FORM: siempre en DOM, Tilopay lo requiere ── */}
                                <div style={{ display: showSdkForm && status !== 'processing' ? 'block' : 'none' }}>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#888] font-bold mb-8">
                                        Datos de pago
                                    </p>
                                    <div className="payFormTilopay space-y-6">

                                        {/* Select Dinámico */}
                                        <div>
                                            <label className={labelClass}>Método de pago</label>
                                            <select
                                                id="tlpy_payment_method"
                                                name="tlpy_payment_method"
                                                className={inputClass}
                                            >
                                                <option value="">Seleccione método de pago</option>
                                            </select>
                                        </div>

                                        {/* ── Campos tarjeta (Tilopay los usa internamente) ── */}
                                        <div id="tlpy_card_payment_div" className="space-y-6" style={{ display: 'none' }}>
                                            <div id="saved-cards-wrapper" style={{ display: 'none' }}>
                                                <label className={labelClass}>Tarjetas guardadas</label>
                                                <select id="tlpy_saved_cards" name="tlpy_saved_cards" className={inputClass}>
                                                    <option value="">Nueva tarjeta</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Número de tarjeta</label>
                                                <input type="text" id="tlpy_cc_number" name="tlpy_cc_number" placeholder="0000 0000 0000 0000" className={inputClass} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClass}>Vencimiento</label>
                                                    <input type="text" id="tlpy_cc_expiration_date" name="tlpy_cc_expiration_date" placeholder="MM/AA" className={inputClass} />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>CVV</label>
                                                    <input type="text" id="tlpy_cvv" name="tlpy_cvv" placeholder="123" className={inputClass} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Yappy oculto — requerido por SDK internamente */}
                                        <div id="tlpy_yappy_payment_div" style={{ display: 'none' }}>
                                            <input type="hidden" id="tlpy_phone_number" name="tlpy_phone_number" />
                                        </div>

                                        {/* Botón pagar — solo con tarjeta online seleccionada */}
                                        {status === 'card' && (
                                            <button
                                                onClick={handlePay}
                                                className="w-full bg-[#1A1A1A] hover:bg-[#C5A059] text-white py-4 font-sans uppercase tracking-[0.2em] text-[10px] transition-all border border-[#1A1A1A] hover:border-[#C5A059]"
                                            >
                                                Pagar ${amount} USD
                                            </button>
                                        )}

                                        {/* Botones de PayPal (Solo se muestran si se seleccionó la opción) */}
                                        {status === 'paypal' && (
                                            <div className="mt-2">
                                                <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
                                                    <PayPalButtons 
                                                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                                                        createOrder={(data, actions) => {
                                                            return actions.order.create({
                                                                purchase_units: [{
                                                                    amount: { value: amount },
                                                                    description: `Plan ${planLabel} - Invitaboda`,
                                                                    custom_id: orderNumber
                                                                }]
                                                            });
                                                        }}
                                                        onApprove={(data, actions) => {
                                                            setStatus('processing');
                                                            return actions.order.capture().then((details) => {
                                                                router.post(route('paypal.success'), {
                                                                    paypal_order_id: data.orderID,
                                                                    internal_order: orderNumber,
                                                                    status: details.status,
                                                                    amount: amount
                                                                });
                                                            });
                                                        }}
                                                    />
                                                </PayPalScriptProvider>
                                            </div>
                                        )}

                                        <p className="text-center text-[10px] text-[#AAAAAA] uppercase tracking-widest mt-4">
                                            Pago seguro procesado por {status === 'paypal' ? 'PayPal' : (status === 'offline' ? 'transferencia' : 'Tilopay')}
                                        </p>
                                    </div>
                                </div>

                                {/* Requerido por SDK para flujo 3DS */}
                                <div id="responseTilopay"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}