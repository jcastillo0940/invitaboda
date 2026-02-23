import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PaymentSuccess({ order, user }) {
    const planLabels = {
        agency: 'Plan Agency',
        elite:  'Plan Elite',
    };

    return (
        <>
            <Head title="Pago Exitoso" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg overflow-hidden">

                    {/* Header verde */}
                    <div className="bg-green-500 px-8 py-10 text-center">
                        <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white">¡Pago Exitoso!</h1>
                        <p className="text-green-100 mt-2 text-sm">
                            Tu suscripción ha sido activada correctamente.
                        </p>
                    </div>

                    {/* Detalles de la transacción */}
                    <div className="px-8 py-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Detalle de la Transacción
                        </h2>

                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Número de orden</dt>
                                <dd className="font-mono font-semibold text-gray-800">{order.order_number}</dd>
                            </div>

                            <div className="flex justify-between">
                                <dt className="text-gray-500">Plan adquirido</dt>
                                <dd className="font-semibold text-gray-800">
                                    {planLabels[order.type] ?? order.type}
                                </dd>
                            </div>

                            <div className="flex justify-between">
                                <dt className="text-gray-500">Monto pagado</dt>
                                <dd className="font-semibold text-gray-800">
                                    {order.currency} ${parseFloat(order.amount).toFixed(2)}
                                </dd>
                            </div>

                            <div className="flex justify-between">
                                <dt className="text-gray-500">Estado</dt>
                                <dd>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Completado
                                    </span>
                                </dd>
                            </div>

                            <div className="flex justify-between">
                                <dt className="text-gray-500">Fecha</dt>
                                <dd className="text-gray-800">{order.created_at}</dd>
                            </div>

                            {order.payment_details?.authCode && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Código de autorización</dt>
                                    <dd className="font-mono text-gray-800">{order.payment_details.authCode}</dd>
                                </div>
                            )}

                            {order.payment_details?.cardLastFour && (
                                <div className="flex justify-between">
                                    <dt className="text-gray-500">Tarjeta</dt>
                                    <dd className="text-gray-800">**** **** **** {order.payment_details.cardLastFour}</dd>
                                </div>
                            )}
                        </dl>

                        {/* Nota de vigencia */}
                        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                            Tu plan estará activo durante <strong>30 días</strong> a partir de hoy.
                        </div>

                        {/* Botones */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Link
                                href={route('dashboard')}
                                className="flex-1 text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                Ir al Dashboard
                            </Link>
                            <Link
                                href={route('subscriptions.pricing')}
                                className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                Ver planes
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}