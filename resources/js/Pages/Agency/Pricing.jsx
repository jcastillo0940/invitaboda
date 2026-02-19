import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { motion } from 'framer-motion';

export default function Pricing({ auth, user }) {
    const plans = [
        {
            id: 'elite',
            name: 'Elite Planner',
            price: '$19.99',
            period: '/ mes',
            features: [
                'Hasta 5 Eventos Activos',
                'Diseños Premium',
                'RSVP Personalizado',
                'Soporte Prioritario'
            ],
            cta: user.plan === 'elite' ? 'Plan Actual' : 'Subir a Elite',
            premium: false,
            disabled: user.plan === 'elite' || user.plan === 'agency'
        },
        {
            id: 'agency',
            name: 'Master Agency',
            price: '$49.99',
            period: '/ mes',
            features: [
                'Eventos Ilimitados',
                'White-Label (Tu Marca)',
                'Panel para Clientes',
                'Soporte VIP 24/7',
                'Dominio Personalizado'
            ],
            cta: user.plan === 'agency' ? 'Plan Actual' : 'Liderar Agencia',
            premium: true,
            disabled: user.plan === 'agency'
        }
    ];

    const handleCheckout = (planId) => {
        router.get(route('subscriptions.checkout'), { plan: planId });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">Planes y Suscripciones</h2>}
        >
            <Head title="Planes" />

            <div className="py-20 bg-[#F9F9F7]">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-serif text-[#1A1A1A] mb-4">Lleva tu Agencia al Siguiente Nivel</h3>
                        <p className="text-gray-400 font-sans uppercase tracking-widest text-xs">Escoge el plan que mejor se adapte a tus eventos</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`bg-white p-12 border ${plan.premium ? 'border-[#C5A059] shadow-2xl relative' : 'border-[#E0E0E0] shadow-sm'}`}
                            >
                                {plan.premium && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C5A059] text-white px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                                        Más Popular
                                    </div>
                                )}

                                <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#888888] font-bold mb-4">{plan.name}</h4>
                                <div className="flex items-baseline mb-8">
                                    <span className="text-5xl font-serif text-[#1A1A1A]">{plan.price}</span>
                                    <span className="text-gray-400 ml-2 font-sans text-sm">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-12">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-[#C5A059]" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleCheckout(plan.id)}
                                    disabled={plan.disabled}
                                    className={`w-full py-4 font-sans uppercase tracking-[0.2em] text-[10px] transition-all border ${plan.premium
                                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-[#C5A059] hover:border-[#C5A059]'
                                        : 'bg-transparent text-gray-400 border-gray-200 cursor-default'
                                        }`}
                                >
                                    {plan.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
