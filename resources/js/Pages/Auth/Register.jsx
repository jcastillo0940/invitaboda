import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registro de Planner" />

            <div className="mb-8 text-center">
                <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Comienza tu Agencia</h2>
                <p className="text-xs font-sans uppercase tracking-widest text-gray-400">Digitaliza tus invitaciones con estilo</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Nombre Completo</label>
                    <input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-3 bg-transparent"
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Correo Corporativo</label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-3 bg-transparent"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-3 bg-transparent"
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Confirmar</label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-3 bg-transparent"
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        className="w-full bg-[#1A1A1A] text-white py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Creando cuenta...' : 'Registrar mi Agencia'}
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs font-sans uppercase tracking-widest">
                            ¿Ya tienes cuenta? <br />
                            <Link href={route('login')} className="text-[#C5A059] font-bold mt-2 inline-block">Inicia sesión aquí</Link>
                        </p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
