import React, { lazy, Suspense, memo } from 'react';

// ─── 1. Importaciones lazy en el nivel de MÓDULO (fuera de cualquier componente)
//        Esto garantiza que la referencia de cada componente sea estable entre renders.
const TemplateClasico = lazy(() => import('../Templates/clasico.jsx'));
const TemplateRojoDorado = lazy(() => import('../Templates/rojo-dorado-elegante.jsx'));
const TemplateBohoChic = lazy(() => import('../Templates/boho-chic.jsx'));
const TemplateRusticaCampestre = lazy(() => import('../Templates/rustica-campestre.jsx'));
const TemplateFallback = lazy(() => import('./TemplateFallback.jsx'));

// ─── 2. Mapa slug → componente (objeto estático, creado 1 sola vez)
const TEMPLATE_MAP = {
    'clasico': TemplateClasico,
    'rojo-dorado-elegante': TemplateRojoDorado,
    'boho-chic': TemplateBohoChic,
    'rustica-campestre': TemplateRusticaCampestre,
};

// ─── 3. Spinner como componente externo (NUNCA dentro de otro componente)
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
        <div className="text-center">
            <div className="w-16 h-16 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[#C5A059] font-sans tracking-[0.3em] uppercase text-xs">Cargando invitación...</p>
        </div>
    </div>
);

// ─── 4. TemplateLoader envuelto en memo para evitar re-renders innecesarios
const TemplateLoader = memo(function TemplateLoader({ slug, ...props }) {
    // Resuelve el componente desde el mapa estático — NUNCA crea uno dinámico
    const Template = TEMPLATE_MAP[slug] ?? TemplateFallback;

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Template {...props} />
        </Suspense>
    );
});

export default TemplateLoader;
