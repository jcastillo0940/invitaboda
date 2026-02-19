import { lazy, Suspense } from 'react';

/**
 * TemplateLoader — Dynamic template resolver by slug.
 *
 * How it works:
 *   1. Receives the design slug (e.g. "elegancia-atemporal")
 *   2. Lazy-loads resources/js/Templates/{slug}.jsx
 *   3. Passes all props directly to the template component
 *   4. If the template doesn't exist, renders a sensible fallback
 */

// Vite requires static analysis of import paths, so we use
// a dynamic import with a known base path pattern.
const loadTemplate = (slug) => {
    return lazy(() =>
        import(`../Templates/${slug}.jsx`).catch(() =>
            // If the file doesn't exist, load the built-in fallback
            import('./TemplateFallback.jsx')
        )
    );
};

const Spinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#1A1A1A]">
        <div className="text-center">
            <div className="w-16 h-16 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[#C5A059] font-sans tracking-[0.3em] uppercase text-xs">Cargando invitación...</p>
        </div>
    </div>
);

export default function TemplateLoader({ slug, ...props }) {
    // Normalize slug: fallback to 'clasico' if null/undefined
    const resolvedSlug = slug || 'clasico';
    const TemplateComponent = loadTemplate(resolvedSlug);

    return (
        <Suspense fallback={<Spinner />}>
            <TemplateComponent {...props} />
        </Suspense>
    );
}
