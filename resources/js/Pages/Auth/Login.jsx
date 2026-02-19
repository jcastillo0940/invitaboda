import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar Sesión" />

            <div className="mb-8 text-center">
                <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">Bienvenido de nuevo</h2>
                <p className="text-xs font-sans uppercase tracking-widest text-gray-400">Ingresa tus credenciales para continuar</p>
            </div>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Correo Electrónico</label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-3 bg-transparent"
                        autoComplete="username"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-[#888888] mb-2 font-sans font-bold">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="w-full border-0 border-b border-[#E0E0E0] focus:border-[#C5A059] focus:ring-0 transition-all font-sans text-sm p-0 py-3 bg-transparent"
                        autoComplete="current-password"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#C5A059] shadow-sm focus:ring-[#C5A059]"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-[10px] uppercase tracking-widest text-[#888888] font-bold">Recordarme</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-[10px] uppercase tracking-widest text-[#C5A059] hover:text-[#1A1A1A] font-bold transition-all"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        className="w-full bg-[#1A1A1A] text-white py-4 font-sans uppercase tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Procesando...' : 'Entrar a mi Taller'}
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-xs font-sans uppercase tracking-widest">
                            ¿Aún no eres parte? <br />
                            <Link href={route('register')} className="text-[#C5A059] font-bold mt-2 inline-block">Crea tu cuenta de Planner</Link>
                        </p>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
