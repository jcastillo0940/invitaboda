import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function PinEntry({ event_slug, event_name, g }) {
    const { data, setData, post, processing, errors } = useForm({
        pin: '',
        g: g // Enviamos el token de vuelta al backend
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('event.public.verify-pin', { event_slug }));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title={`Acceso Privado - ${event_name}`} />

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Boda de {event_name}</h2>
                <p className="text-gray-600 mb-6">Este evento es privado. Por favor, ingresa el PIN proporcionado por los novios para ver la invitación.</p>

                <form onSubmit={submit}>
                    <div>
                        <input
                            type="text"
                            name="pin"
                            value={data.pin}
                            onChange={(e) => setData('pin', e.target.value)}
                            className="w-full text-center text-2xl tracking-widest border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            placeholder="****"
                            maxLength={10}
                            autoFocus
                        />
                        {errors.pin && <p className="text-red-500 text-sm mt-2">{errors.pin}</p>}
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 active:bg-gray-900 focus:outline-none focus:border-gray-900 focus:ring ring-gray-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            {processing ? 'Verificando...' : 'Desbloquear Invitación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}