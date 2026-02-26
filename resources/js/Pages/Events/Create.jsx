import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ArrowLeft, Calendar, Type, Save } from 'lucide-react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('events.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Crear Nuevo Evento
                </h2>
            }
        >
            <Head title="Crear Evento" />

            {/* Mismo fondo gris claro que en el Index para mantener consistencia */}
            <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)]">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Botón de regreso */}
                    <div className="mb-6">
                        <Link 
                            href={route('events.index')} 
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver a mis eventos
                        </Link>
                    </div>

                    {/* Tarjeta del formulario */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
                        <div className="p-8">
                            <div className="mb-8 border-b border-gray-100 pb-5">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Detalles del Evento
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Ingresa la información básica. No te preocupes, podrás cambiar estos detalles y personalizar el diseño más adelante.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Campo: Nombre */}
                                <div>
                                    <div className="flex items-center mb-1">
                                        <Type className="w-4 h-4 text-gray-400 mr-2" />
                                        <InputLabel htmlFor="name" value="Nombre del Evento" className="mb-0" />
                                    </div>
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        type="text"
                                        className="mt-1 block w-full"
                                        placeholder="Ej. Boda de Ana y Carlos"
                                        required
                                        autoFocus
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Este nombre aparecerá en tu panel y en la URL pública.
                                    </p>
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                {/* Campo: Fecha */}
                                <div>
                                    <div className="flex items-center mb-1">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                        <InputLabel htmlFor="date" value="Fecha del Evento" className="mb-0" />
                                    </div>
                                    <TextInput
                                        id="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        type="date"
                                        className="mt-1 block w-full text-gray-700"
                                        required
                                    />
                                    <InputError message={errors.date} className="mt-2" />
                                </div>

                                {/* Botones de acción */}
                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100 mt-8">
                                    <Link
                                        href={route('events.index')}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Cancelar
                                    </Link>
                                    
                                    <PrimaryButton 
                                        disabled={processing}
                                        className="bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900"
                                    >
                                        {processing ? (
                                            'Creando...'
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Crear Evento
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}