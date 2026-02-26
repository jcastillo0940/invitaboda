import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function Billing({ auth, subscription, orders }) {
    
    const handlePause = (id) => {
        if (confirm('¿Estás seguro de que deseas pausar tu suscripción? Se detendrán tus cobros pero perderás acceso a las funciones premium temporalmente.')) {
            router.post(route('subscriptions.pause', id));
        }
    };

    const handleResume = (id) => {
        if (confirm('¿Deseas reanudar tu suscripción? Se reactivará tu acceso y tus próximos cobros.')) {
            router.post(route('subscriptions.resume', id));
        }
    };

    const handleCancel = (id) => {
        if (confirm('¿Estás COMPLETAMENTE seguro de cancelar tu suscripción? Esta acción no se puede deshacer.')) {
            router.post(route('subscriptions.cancel', id));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">Activa</span>;
            case 'paused':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Pausada</span>;
            case 'past_due':
                return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Vencida / Pago Pendiente</span>;
            case 'canceled':
                return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">Cancelada</span>;
            default:
                return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{status}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Facturación y Suscripción</h2>}
        >
            <Head title="Facturación" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Tarjeta de Suscripción Actual */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900">Tu Suscripción Actual</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Gestiona tu plan recurrente, revisa tu fecha de próximo cobro o detén el servicio.
                                </p>
                            </header>

                            {subscription ? (
                                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Plan {subscription.plan?.name || 'Agencia'}
                                            </h3>
                                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                                <p><span className="font-semibold text-gray-800">Estado:</span> {getStatusBadge(subscription.status)}</p>
                                                <p><span className="font-semibold text-gray-800">Inició el:</span> {formatDate(subscription.starts_at)}</p>
                                                
                                                {subscription.status === 'active' && subscription.next_billing_date && (
                                                    <p><span className="font-semibold text-gray-800">Próximo cobro:</span> {formatDate(subscription.next_billing_date)}</p>
                                                )}

                                                {subscription.status === 'paused' && subscription.paused_at && (
                                                    <p><span className="font-semibold text-gray-800">Pausada desde:</span> {formatDate(subscription.paused_at)}</p>
                                                )}

                                                {subscription.status === 'canceled' && subscription.ends_at && (
                                                    <p><span className="font-semibold text-gray-800">Acceso hasta:</span> {formatDate(subscription.ends_at)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botones de Acción de la Suscripción */}
                                        <div className="flex flex-col gap-2">
                                            {subscription.status === 'active' && (
                                                <>
                                                    <button
                                                        onClick={() => handlePause(subscription.id)}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-yellow-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        Pausar Suscripción
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(subscription.id)}
                                                        className="inline-flex items-center justify-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        Cancelar Plan
                                                    </button>
                                                </>
                                            )}

                                            {subscription.status === 'paused' && (
                                                <button
                                                    onClick={() => handleResume(subscription.id)}
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    Reanudar Suscripción
                                                </button>
                                            )}

                                            {(subscription.status === 'canceled' || subscription.status === 'past_due') && (
                                                <a
                                                    href={route('subscriptions.pricing')}
                                                    className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                >
                                                    Comprar Nuevo Plan
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-gray-600 mb-4">Actualmente no tienes ninguna suscripción activa.</p>
                                    <a
                                        href={route('subscriptions.pricing')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Ver Planes de Agencia
                                    </a>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Tarjeta de Historial de Órdenes / Pagos */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900">Historial de Pagos</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Aquí puedes ver todas tus compras, recibos de suscripción y pagos individuales.
                                </p>
                            </header>

                            {orders && orders.length > 0 ? (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Orden</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Concepto</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {order.type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                                                        {order.payment_method || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        {formatCurrency(order.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        {order.status === 'completed' ? (
                                                            <span className="text-green-600 font-semibold">Pagado</span>
                                                        ) : order.status === 'failed' ? (
                                                            <span className="text-red-600 font-semibold">Fallido</span>
                                                        ) : (
                                                            <span className="text-yellow-600 font-semibold">Pendiente</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic">Aún no tienes ningún historial de pago registrado.</p>
                            )}
                        </section>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}