import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function UserSubscriptionsIndex({ auth, subscriptions, users, plans }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    
    // Estados para el Live Search y Toggle de Creación
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        user_id: '',
        new_user_name: '',
        new_user_email: '',
        new_user_password: '',
        plan_id: '',
        status: 'active',
        next_billing_date: '',
        ends_at: '',
    });

    const openModal = (sub = null) => {
        setEditingSub(sub);
        setIsCreatingUser(false);
        setSearchQuery('');
        clearErrors();
        
        if (sub) {
            setData({
                user_id: sub.user_id,
                new_user_name: '',
                new_user_email: '',
                new_user_password: '',
                plan_id: sub.plan_id,
                status: sub.status,
                next_billing_date: sub.next_billing_date ? sub.next_billing_date.split('T')[0] : '',
                ends_at: sub.ends_at ? sub.ends_at.split('T')[0] : '',
            });
        } else {
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSub(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSub) {
            put(route('admin.user-subscriptions.update', editingSub.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.user-subscriptions.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleToggleCreateUser = () => {
        setIsCreatingUser(!isCreatingUser);
        setData('user_id', ''); // Limpiar si había uno seleccionado
        setSearchQuery('');
        clearErrors();
    };

    // Filtrar usuarios en vivo para el Live Search
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES');
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Suscripciones de Clientes</h2>}>
            <Head title="Control de Suscripciones" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Gestor Manual de Planes</h3>
                        <p className="text-sm text-gray-500">Asigna, pausa o regala días premium a tus clientes manualmente.</p>
                    </div>
                    <button onClick={() => openModal()} className="bg-[#C5A059] hover:bg-[#b08d4f] text-white px-4 py-2 rounded-md font-bold transition">
                        + Nueva Suscripción Manual
                    </button>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próximo Cobro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin Acceso</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900">{sub.user?.name}</div>
                                        <div className="text-xs text-gray-500">{sub.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        {sub.plan?.name || 'Desconocido'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                                            sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                            sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                            sub.status === 'past_due' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {sub.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(sub.next_billing_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(sub.ends_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(sub)} className="text-[#C5A059] hover:text-[#b08d4f] font-bold">
                                            Editar Manual
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No hay suscripciones registradas aún.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL DE EDICIÓN / CREACIÓN MANUAL */}
                <Modal show={isModalOpen} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">
                            {editingSub ? `Modificar suscripción de ${editingSub.user?.name}` : 'Asignar Nueva Suscripción'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            
                            {/* COMPONENTE CLIENTE: Live Search o Crear Nuevo */}
                            {!editingSub && (
                                <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-gray-700">Seleccionar Cliente</label>
                                        <button 
                                            type="button" 
                                            onClick={handleToggleCreateUser} 
                                            className="text-[#C5A059] text-sm font-bold hover:underline"
                                        >
                                            {isCreatingUser ? '← Buscar cliente existente' : '+ Crear un cliente nuevo'}
                                        </button>
                                    </div>

                                    {isCreatingUser ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <input type="text" placeholder="Nombre completo" value={data.new_user_name} onChange={e => setData('new_user_name', e.target.value)} className="block w-full text-sm border-gray-300 rounded-md" required={isCreatingUser}/>
                                                {errors.new_user_name && <p className="text-red-500 text-xs mt-1">{errors.new_user_name}</p>}
                                            </div>
                                            <div>
                                                <input type="email" placeholder="Correo electrónico" value={data.new_user_email} onChange={e => setData('new_user_email', e.target.value)} className="block w-full text-sm border-gray-300 rounded-md" required={isCreatingUser}/>
                                                {errors.new_user_email && <p className="text-red-500 text-xs mt-1">{errors.new_user_email}</p>}
                                            </div>
                                            <div>
                                                <input type="password" placeholder="Contraseña provisoria" value={data.new_user_password} onChange={e => setData('new_user_password', e.target.value)} className="block w-full text-sm border-gray-300 rounded-md" required={isCreatingUser}/>
                                                {errors.new_user_password && <p className="text-red-500 text-xs mt-1">{errors.new_user_password}</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {data.user_id ? (
                                                <div className="flex items-center justify-between p-3 border border-[#C5A059] rounded-md bg-[#C5A059]/10">
                                                    <span className="text-sm font-bold text-gray-800">
                                                        ✅ {users.find(u => u.id == data.user_id)?.name} ({users.find(u => u.id == data.user_id)?.email})
                                                    </span>
                                                    <button type="button" onClick={() => setData('user_id', '')} className="text-red-500 text-xs font-bold hover:underline">Eliminar Selección</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Escribe el nombre o correo del cliente para buscar..." 
                                                        value={searchQuery} 
                                                        onChange={e => setSearchQuery(e.target.value)} 
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-[#C5A059] focus:border-[#C5A059]" 
                                                    />
                                                    {searchQuery && (
                                                        <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-1 max-h-48 overflow-y-auto rounded-md shadow-lg">
                                                            {filteredUsers.map(u => (
                                                                <li key={u.id} className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0" onClick={() => { setData('user_id', u.id); setSearchQuery(''); }}>
                                                                    <div className="font-bold text-gray-800 text-sm">{u.name}</div>
                                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                                </li>
                                                            ))}
                                                            {filteredUsers.length === 0 && (
                                                                <li className="p-3 text-sm text-gray-500">No se encontraron clientes con esa búsqueda.</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </>
                                            )}
                                            {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CAMPOS DEL PLAN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Plan Asignado</label>
                                <select value={data.plan_id} onChange={e => setData('plan_id', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                                    <option value="">Selecciona un plan...</option>
                                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Estado de la Suscripción</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="active">Activa (Acceso Total)</option>
                                    <option value="paused">Pausada (Sin acceso temporal)</option>
                                    <option value="past_due">Vencida (Falta de pago)</option>
                                    <option value="canceled">Cancelada (Bloqueado)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Próximo Cobro (next_billing_date)</label>
                                <input type="date" value={data.next_billing_date} onChange={e => setData('next_billing_date', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                <p className="text-xs text-gray-500 mt-1">Fecha en la que el sistema intentará cobrar o suspenderá.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Fin de Acceso (ends_at)</label>
                                <input type="date" value={data.ends_at} onChange={e => setData('ends_at', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                <p className="text-xs text-gray-500 mt-1">Déjalo en blanco si el plan es indefinido.</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition">Cancelar</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium transition disabled:opacity-50">
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}