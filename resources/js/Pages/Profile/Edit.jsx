import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const isAgency = auth.user.role === 'agency';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Mi Cuenta</h2>}
        >
            <Head title="Mi Cuenta" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* SECCIÓN DE FACTURACIÓN Y SUSCRIPCIÓN (Especial para B2B) */}
                    {isAgency && (
                        <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg border-l-4 border-[#C5A059]">
                            <section>
                                <header className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">Suscripción y Facturación</h2>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Gestiona tu plan Elite, revisa tus recibos y métodos de pago de tu agencia.
                                        </p>
                                    </div>
                                    <Link 
                                        href={route('agency.billing')} 
                                        className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
                                    >
                                        Ir al Panel de Facturación
                                    </Link>
                                </header>
                            </section>
                        </div>
                    )}

                    {/* SECCIÓN DE MÉTODOS DE PAGO / TARJETAS TOKENIZADAS (UI Visual) */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <section>
                            <header className="mb-6">
                                <h2 className="text-lg font-medium text-gray-900">Métodos de Pago Guardados</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    Tus tarjetas tokenizadas de forma segura para compras rápidas.
                                </p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Tarjeta Simulada (Aquí conectarías con Stripe/Tilopay Tokens en el futuro) */}
                                <div className="relative p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                                    </div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Tarjeta Principal</p>
                                    <p className="text-xl font-mono tracking-widest mb-4">**** **** **** 4242</p>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase">Expira</p>
                                            <p className="text-sm">12/28</p>
                                        </div>
                                        <span className="text-sm font-bold italic">VISA</span>
                                    </div>
                                </div>

                                {/* Botón para agregar nueva tarjeta */}
                                <button className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#C5A059] hover:text-[#C5A059] transition-colors bg-gray-50 hover:bg-[#C5A059]/5 min-h-[140px]">
                                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    <span className="text-sm font-medium">Agregar Método de Pago</span>
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Información encriptada de forma segura mediante bóveda bancaria (Tilopay/Stripe).
                            </p>
                        </section>
                    </div>

                    {/* SECCIONES ESTÁNDAR DE BREEZE (Perfil, Password, Delete) */}
                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}