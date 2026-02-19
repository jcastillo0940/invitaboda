import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { LayoutDashboard, Palette, Users, DollarSign, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ auth, stats }) {
    const cards = [
        { label: 'Usuarios Totales', value: stats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Bodas Creadas', value: stats.total_events, icon: LayoutDashboard, color: 'text-purple-500', bg: 'bg-purple-50' },
        { label: 'Ingresos Totales', value: `$${stats.total_revenue}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-serif text-2xl text-[#1A1A1A]">Panel de Administración</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {cards.map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6"
                            >
                                <div className={`${card.bg} p-4 rounded-xl`}>
                                    <card.icon className={`w-8 h-8 ${card.color}`} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">{card.label}</p>
                                    <h4 className="text-3xl font-serif text-[#1A1A1A]">{card.value}</h4>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-serif text-[#1A1A1A] mb-6">Pedidos Recientes</h3>
                            <div className="space-y-4">
                                {stats.recent_orders.length > 0 ? (
                                    stats.recent_orders.map((order) => (
                                        <div key={order.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                                            <div>
                                                <p className="font-bold text-sm text-[#1A1A1A]">{order.user.name}</p>
                                                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-serif text-[#C5A059] font-bold">${order.amount}</p>
                                                <span className="text-[10px] uppercase font-bold text-green-500">{order.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-8 italic font-serif">No hay pedidos recientes</p>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-serif text-[#1A1A1A] mb-6">Acciones Rápidas</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href={route('admin.designs.create')}
                                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all group"
                                >
                                    <Palette className="w-8 h-8 text-gray-300 group-hover:text-[#C5A059] mb-3" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#C5A059]">Nuevo Diseño</span>
                                </Link>
                                <button className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-100 hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all group opacity-50 cursor-not-allowed">
                                    <Users className="w-8 h-8 text-gray-300 group-hover:text-[#C5A059] mb-3" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-[#C5A059]">Gestionar Usuarios</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
