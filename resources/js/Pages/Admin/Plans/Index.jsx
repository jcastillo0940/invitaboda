import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function Index({ auth, plans }) {
    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.')) {
            router.delete(route('admin.plans.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-serif text-2xl text-[#1A1A1A]">Gestión de Planes</h2>
                    <Link
                        href={route('admin.plans.create')}
                        className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#C5A059] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Plan
                    </Link>
                </div>
            }
        >
            <Head title="Planes" />

            <div className="py-12 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-500">
                                    <th className="p-6 font-bold">Orden</th>
                                    <th className="p-6 font-bold">Plan</th>
                                    <th className="p-6 font-bold">Precio</th>
                                    <th className="p-6 font-bold">Tipo</th>
                                    <th className="p-6 font-bold text-center">Estado</th>
                                    <th className="p-6 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 text-sm text-gray-400 font-mono">{plan.sort_order}</td>
                                        <td className="p-6">
                                            <p className="font-serif text-[#1A1A1A] text-lg">{plan.name}</p>
                                            <p className="text-xs text-gray-400 mt-1">{plan.slug}</p>
                                        </td>
                                        <td className="p-6 font-serif text-[#C5A059] text-xl font-bold">
                                            ${plan.price}
                                        </td>
                                        <td className="p-6 text-xs text-gray-500 uppercase tracking-wider">
                                            {plan.billing_type === 'subscription' ? 'Mensual' : plan.billing_type}
                                        </td>
                                        <td className="p-6 text-center">
                                            {plan.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold">
                                                    <CheckCircle2 className="w-3 h-3" /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-bold">
                                                    <XCircle className="w-3 h-3" /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right space-x-3">
                                            <Link
                                                href={route('admin.plans.edit', plan.id)}
                                                className="inline-flex p-2 text-gray-400 hover:text-[#C5A059] transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                className="inline-flex p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {plans.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-400 italic">
                                            No hay planes creados todavía.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}