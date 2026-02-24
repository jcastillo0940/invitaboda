import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { motion } from 'framer-motion';

// Agregamos `plans` a los props que recibe el componente desde el controlador
export default function Pricing({ auth, user, plans }) {
    
    const handleCheckout = (planSlug) => {
        router.get(route('subscriptions.checkout'), { plan: planSlug });
    };

    // Función para construir dinámicamente la lista de características según los límites de la BD
    const buildFeaturesList = (plan) => {
        const features = [];
        
        // Límite de eventos
        if (plan.max_events) features.push(`Hasta ${plan.max_events} Eventos Activos`);
        else features.push('Eventos Ilimitados');

        // Funciones booleanas de la base de datos
        if (plan.feature_custom_site) features.push('Diseños Premium / Web Personalizada');
        if (plan.feature_rsvp) features.push('RSVP Personalizado (Confirmación)');
        if (plan.feature_custom_domain) features.push('Dominio Personalizado');
        if (plan.feature_advanced_reports) features.push('Reportes Avanzados');
        if (plan.feature_export_data) features.push('Exportación de Datos (Excel/PDF)');
        if (plan.feature_provider_integration) features.push('Integración con Proveedores');

        return features;
    };

    // Lógica para determinar el texto del botón y si debe estar deshabilitado
    const getButtonStatus = (planSlug) => {
        const isCurrentPlan = user.plan === planSlug;
        // Se deshabilita si es el plan actual, O si tiene un plan superior (ej. tiene Agency y quiere Elite)
        const isDisabled = isCurrentPlan || (user.plan === 'agency' && planSlug === 'elite');

        let ctaText = 'Seleccionar Plan';
        if (isCurrentPlan) ctaText = 'Plan Actual';
        else if (planSlug === 'agency') ctaText = 'Liderar Agencia';
        else if (planSlug === 'elite') ctaText = 'Subir a Elite';

        return { disabled: isDisabled, cta: ctaText };
    };

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="text-xl font-semibold leading-tight text-[#1A1A1A] font-serif">Planes y Suscripciones</h2>}
        >
            <Head title="Planes" />

            <div className="py-20 bg-[#F9F9F7] min-h-screen">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-serif text-[#1A1A1A] mb-4">Lleva tu Agencia al Siguiente Nivel</h3>
                        <p className="text-gray-400 font-sans uppercase tracking-widest text-xs">Escoge el plan que mejor se adapte a tus eventos</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Iteramos sobre los planes que vienen de la base de datos */}
                        {plans && plans.map((plan, i) => {
                            // Definimos visualmente que el 'agency' (o los más caros) son los premium
                            const isPremium = plan.slug === 'agency' || plan.sort_order > 1;
                            const { disabled, cta } = getButtonStatus(plan.slug);
                            const features = buildFeaturesList(plan);

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`bg-white p-12 border ${isPremium ? 'border-[#C5A059] shadow-2xl relative' : 'border-[#E0E0E0] shadow-sm'}`}
                                >
                                    {isPremium && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C5A059] text-white px-4 py-1 text-[10px] uppercase tracking-widest font-bold">
                                            Más Popular
                                        </div>
                                    )}

                                    <h4 className="text-[10px] uppercase tracking-[0.3em] text-[#888888] font-bold mb-4">{plan.name}</h4>
                                    <div className="flex items-baseline mb-8">
                                        <span className="text-5xl font-serif text-[#1A1A1A]">${plan.price}</span>
                                        <span className="text-gray-400 ml-2 font-sans text-sm">
                                            {plan.billing_type === 'subscription' ? '/ mes' : 'pago único'}
                                        </span>
                                    </div>

                                    <ul className="space-y-4 mb-12">
                                        {features.map((feature, j) => (
                                            <li key={j} className="flex items-center gap-3 text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-[#C5A059] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path>
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleCheckout(plan.slug)}
                                        disabled={disabled}
                                        className={`w-full py-4 font-sans uppercase tracking-[0.2em] text-[10px] transition-all border ${
                                            isPremium && !disabled
                                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-[#C5A059] hover:border-[#C5A059]'
                                                : disabled
                                                    ? 'bg-transparent text-gray-400 border-gray-200 cursor-default'
                                                    : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-gray-50'
                                        }`}
                                    >
                                        {cta}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}