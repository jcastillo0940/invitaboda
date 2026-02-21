import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Calendar,
    Users,
    Heart,
    ClipboardList,
    ExternalLink,
    Settings,
    MoreHorizontal,
    Plus,
    Scan,
    Wine
} from 'lucide-react';

export default function Dashboard({ auth, events, stats, role }) {
    const isPlanner = role === 'planner';
    const isCouple = role === 'couple';

    const mainStats = [
        {
            label: isPlanner ? 'Bodas Gestionadas' : 'Mis Eventos',
            value: stats.total_events,
            icon: Calendar,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            label: 'Total Invitados',
            value: stats.total_guests,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Dentro del Evento',
            value: stats.currently_inside,
            icon: Wine,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-serif leading-tight text-[#1A1A1A]">
                        {isPlanner ? 'Panel de Wedding Planner' : 'Mi Dashboard de Boda'}
                    </h2>
                    {isPlanner && (
                        <Link
                            href={route('events.index')}
                            className="bg-[#C5A059] text-white px-6 py-2 font-sans uppercase tracking-widest text-[10px] hover:bg-[#1A1A1A] transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Crear Nueva Boda
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-[#F9F9F7] min-h-[calc(100vh-64px)]">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-12">

                    {/* Welcome Section */}
                    <div className="bg-white p-8 border border-[#E0E0E0] shadow-sm overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-serif text-[#1A1A1A] mb-2">
                                ¡Hola, {auth.user.name.split(' ')[0]}!
                            </h3>
                            <p className="text-gray-500 font-sans text-sm">
                                {isPlanner
                                    ? 'Aquí tienes un resumen en tiempo real de la asistencia a tus eventos.'
                                    : 'Todo listo para empezar a gestionar los invitados de tu gran día.'}
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Wine className="w-32 h-32" />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mainStats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-6 border border-[#E0E0E0] shadow-sm flex items-center gap-4"
                            >
                                <div className={`${stat.bg} p-3 rounded-lg`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
                                    <p className="text-3xl font-serif text-[#1A1A1A]">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Events List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-serif text-[#1A1A1A]">Eventos en Curso</h3>
                            <Link href={route('events.index')} className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold hover:underline">
                                Ver todos los eventos
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event, i) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white border border-[#E0E0E0] shadow-sm flex flex-col group overflow-hidden"
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-gray-50 px-3 py-1 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex gap-1">
                                                {event.checked_in_groups_count > 0 && (
                                                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                                )}
                                                <MoreHorizontal className="w-5 h-5 text-gray-300" />
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-serif text-[#1A1A1A] mb-4 group-hover:text-[#C5A059] transition-colors">
                                            {event.name}
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-sans">
                                                <span className="text-gray-400 italic">Estado de Asistencia</span>
                                                <span className="font-bold text-[#1A1A1A]">{event.checked_in_people || 0} de {event.checked_in_people + event.pending_arrival_people || 0}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden flex">
                                                <div
                                                    className="bg-green-500 h-full transition-all duration-1000 border-r border-white"
                                                    style={{ width: `${(event.checked_in_people / (event.checked_in_people + event.pending_arrival_people || 1)) * 100}%` }}
                                                ></div>
                                                <div
                                                    className="bg-amber-200 h-full transition-all duration-1000"
                                                    style={{ width: `${(event.pending_arrival_people / (event.checked_in_people + event.pending_arrival_people || 1)) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-[10px] font-sans pt-1">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <span className="text-gray-500 uppercase">En Puerta</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-amber-200"></div>
                                                    <span className="text-gray-500 uppercase">Por Llegar</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 border-t border-[#F0F0F0]">
                                        <Link
                                            href={route('events.guests', event.id)}
                                            className="px-2 py-4 text-center text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:bg-[#F9F9F7] border-r border-[#F0F0F0] transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Users className="w-3 h-3" /> Invitados
                                        </Link>
                                        <Link
                                            href={route('events.edit', event.id)}
                                            className="px-2 py-4 text-center text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:bg-[#F9F9F7] border-r border-[#F0F0F0] transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Settings className="w-3 h-3" /> Editor
                                        </Link>
                                        <Link
                                            href={route('events.check-in', event.id)}
                                            className="px-2 py-4 text-center text-[10px] uppercase font-bold tracking-widest text-[#C5A059] hover:bg-[#F9F9F7] transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Scan className="w-3 h-3" /> Puerta
                                        </Link>
                                    </div>
                                    <Link
                                        href={route('event.public', event.slug)}
                                        target="_blank"
                                        className="w-full bg-[#1A1A1A] text-white py-3 text-center text-[9px] uppercase font-bold tracking-widest hover:bg-[#C5A059] transition-all flex items-center justify-center gap-2"
                                    >
                                        Ver Invitación Pública <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </motion.div>
                            ))}

                            {events.length === 0 && (
                                <div className="col-span-full py-20 bg-white border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center">
                                    <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-serif italic mb-6">No tienes eventos registrados aún.</p>
                                    <Link
                                        href={route('events.index')}
                                        className="bg-[#C5A059] text-white px-8 py-3 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#1A1A1A] transition-all"
                                    >
                                        Comenzar con tu primera boda
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
