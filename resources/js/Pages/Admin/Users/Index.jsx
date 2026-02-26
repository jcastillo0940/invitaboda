import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function UsersIndex({ auth, users }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'couple',
        agency_name: '',
    });

    const openModal = (user = null) => {
        setEditingUser(user);
        clearErrors();
        
        if (user) {
            setData({
                name: user.name,
                email: user.email,
                password: '', // Siempre lo dejamos vacío por seguridad. Si escribe algo, se cambiará.
                role: user.role,
                agency_name: user.agency_name || '',
            });
        } else {
            reset();
            setData('role', 'couple');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('admin.users.update', editingUser.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás SEGURO de que deseas eliminar este usuario? Se borrarán todos sus eventos, suscripciones y datos. Esta acción no se puede deshacer.')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    // Filtro rápido de búsqueda en la tabla
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-purple-100 text-purple-800',
            planner: 'bg-blue-100 text-blue-800',
            couple: 'bg-green-100 text-green-800',
            guest: 'bg-gray-100 text-gray-800',
        };
        return <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${badges[role] || badges.guest}`}>{role}</span>;
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Gestión de Usuarios</h2>}>
            <Head title="Usuarios" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-lg shadow-sm gap-4">
                    <div className="flex-1 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Buscar usuario por nombre, correo o rol..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#C5A059] focus:border-[#C5A059]"
                        />
                    </div>
                    <button onClick={() => openModal()} className="w-full md:w-auto bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6 py-2 rounded-md font-bold transition">
                        + Registrar Usuario
                    </button>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol / Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agencia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Registro</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.agency_name || <span className="text-gray-300 italic">No aplica</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => openModal(user)} className="text-[#C5A059] hover:text-[#b08d4f] font-bold">Editar</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 font-bold" disabled={auth.user.id === user.id}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL DE CREACIÓN / EDICIÓN */}
                <Modal show={isModalOpen} onClose={closeModal}>
                    <form onSubmit={handleSubmit} className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">
                            {editingUser ? `Editar datos de ${editingUser.name}` : 'Registrar Nuevo Usuario'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Nombre Completo</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700">Correo Electrónico</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700">Contraseña {editingUser && <span className="text-gray-400 font-normal">(Dejar en blanco para mantener la actual)</span>}</label>
                                <input 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
                                    required={!editingUser} 
                                    placeholder={editingUser ? "Escribe nueva contraseña solo si quieres cambiarla" : ""}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Rol del Usuario</label>
                                    <select value={data.role} onChange={e => setData('role', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                                        <option value="couple">Novios (B2C)</option>
                                        <option value="planner">Wedding Planner (B2B)</option>
                                        <option value="admin">Administrador del Sistema</option>
                                    </select>
                                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                                </div>

                                {/* Mostrar Nombre de Agencia solo si el rol es planner o admin */}
                                {(data.role === 'planner' || data.role === 'admin') && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Nombre de la Agencia</label>
                                        <input type="text" value={data.agency_name} onChange={e => setData('agency_name', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Ej: Elite Weddings CR" />
                                        {errors.agency_name && <p className="text-red-500 text-xs mt-1">{errors.agency_name}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition">Cancelar</button>
                            <button type="submit" disabled={processing} className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 font-medium transition disabled:opacity-50">
                                {processing ? 'Guardando...' : 'Guardar Usuario'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}