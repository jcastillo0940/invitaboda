import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function Dashboard({ auth, role, dashboardData }) {
    
    // ────────────────────────────────────────────────────────────────────────
    // DASHBOARD B2B (WEDDING PLANNERS / AGENCIAS)
    // ────────────────────────────────────────────────────────────────────────
    const renderB2BDashboard = () => {
        const { totalEvents, totalRevenue, subscription, revenueChart } = dashboardData;

        return (
            <div className="space-y-6">
                {/* Tarjetas de Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Eventos Activos</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalEvents}</h3>
                        </div>
                        <div className="w-12 h-12 bg-[#C5A059]/10 rounded-full flex items-center justify-center text-[#C5A059]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Suscripción</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-1 uppercase">
                                {subscription ? subscription.plan?.name : 'Gratis'}
                            </h3>
                            {subscription?.status === 'active' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">Activa</span>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Gráfico Animado B2B */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Crecimiento de Ingresos (Últimos 6 Meses)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value}`, 'Ingresos']}
                                />
                                <Line type="monotone" dataKey="ingresos" stroke="#C5A059" strokeWidth={3} dot={{r: 4, fill: '#C5A059', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} animationDuration={1500} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    // ────────────────────────────────────────────────────────────────────────
    // DASHBOARD B2C (NOVIOS)
    // ────────────────────────────────────────────────────────────────────────
    const renderB2CDashboard = () => {
        const { event, totalGuests, confirmedGuests, attendanceChart, daysLeft } = dashboardData;

        if (!event) {
            return (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">¡Comienza a planear tu boda!</h2>
                    <p className="text-gray-500 mb-6">Crea tu evento para empezar a gestionar invitados, mesas y tu invitación digital.</p>
                    <Link href={route('events.create')} className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                        Crear mi Evento
                    </Link>
                </div>
            );
        }

        const percentage = totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0;

        return (
            <div className="space-y-6">
                {/* Cabecera del Evento B2C */}
                <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-serif italic mb-2">{event.title}</h2>
                        <p className="text-gray-300 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 z-10 text-right">
                        <p className="text-[#C5A059] text-sm font-bold uppercase tracking-widest mb-1">Faltan</p>
                        <p className="text-5xl font-bold text-white leading-none">{daysLeft} <span className="text-lg font-normal text-gray-300">días</span></p>
                    </div>
                    {/* Elemento Decorativo */}
                    <svg className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5" fill="currentColor" viewBox="0 0 100 100"><path d="M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z" /></svg>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico Circular Asistencia */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 self-start">Progreso de Asistencia</h3>
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={attendanceChart} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="cantidad" animationDuration={1500}>
                                        {attendanceChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Confirmados</span>
                            </div>
                        </div>
                    </div>

                    {/* Accesos Rápidos B2C */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Gestión de la Boda</h3>
                        <div className="space-y-4">
                            <Link href={route('events.guests', event.id)} className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#C5A059]/20 flex items-center justify-center mr-4 transition-colors">
                                    <svg className="w-5 h-5 text-gray-600 group-hover:text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">Lista de Invitados</h4>
                                    <p className="text-xs text-gray-500">{totalGuests} invitados registrados</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>

                            <Link href={route('tables.index', event.id)} className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-[#C5A059]/20 flex items-center justify-center mr-4 transition-colors">
                                    <svg className="w-5 h-5 text-gray-600 group-hover:text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">Asignar Mesas</h4>
                                    <p className="text-xs text-gray-500">Organiza a tus confirmados</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Panel de Control</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                {role === 'agency' ? renderB2BDashboard() : renderB2CDashboard()}
            </div>
        </AuthenticatedLayout>
    );
}