import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const Icons = {
    Dashboard: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Events: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    Agency: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    Elite: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    Admin: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Designs: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
    ),
    SettingsIcon: (props) => (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // NavItem rediseñado para Sidebar Oscuro
    const NavItem = ({ href, active, icon: Icon, children }) => (
        <Link
            href={href}
            className={`group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                ? 'bg-teal-500/10 text-teal-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${active
                    ? 'text-teal-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                    }`}
            />
            {children}
        </Link>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">

            {/* Overlay para móviles */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Lateral (SIEMPRE OSCURO Y ELEGANTE) */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 transform flex-col border-r border-slate-800 bg-[#0f172a] transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-serif text-white font-bold">IB</div>
                        <span className="text-white font-serif tracking-widest text-sm font-bold">INVITABODA</span>
                    </Link>
                </div>

                {/* Enlaces de Navegación */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-hide">
                    <NavItem href={route('dashboard')} active={route().current('dashboard')} icon={Icons.Dashboard}>
                        Dashboard
                    </NavItem>
                    <NavItem href={route('events.index')} active={route().current('events.*')} icon={Icons.Events}>
                        Mis Eventos
                    </NavItem>
                    <NavItem href={route('agency.settings')} active={route().current('agency.settings')} icon={Icons.Agency}>
                        Agencia (B2B)
                    </NavItem>
                    <NavItem href={route('subscriptions.pricing')} active={route().current('subscriptions.*')} icon={Icons.Elite}>
                        Planes Elite
                    </NavItem>

                    {user.role === 'admin' && (
                        <>
                            <div className="mt-8 mb-2 px-4 text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                                Administración
                            </div>
                            <NavItem href={route('admin.dashboard')} active={route().current('admin.dashboard')} icon={Icons.Admin}>
                                Panel Admin
                            </NavItem>
                            <NavItem href={route('admin.designs.index')} active={route().current('admin.designs.*')} icon={Icons.Designs}>
                                Diseños
                            </NavItem>
                            <NavItem href={route('admin.settings')} active={route().current('admin.settings')} icon={Icons.SettingsIcon}>
                                Configuración
                            </NavItem>
                        </>
                    )}
                </nav>

                {/* Pie del Sidebar (Perfil de usuario) */}
                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30">
                            {user.name.charAt(0)}
                        </div>
                        <div className="ml-3 truncate">
                            <p className="truncate text-sm font-medium text-white">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Contenedor Principal (SIEMPRE CLARO) */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Navbar Superior */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center lg:hidden">
                        <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Abrir sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-1 items-center justify-end lg:ml-6">
                        <div className="relative ml-3">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
                                        >
                                            <span className="hidden sm:inline-block">{user.name}</span>
                                            <svg className="ml-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Mi Perfil</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Cerrar Sesión
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Contenido Dinámico de la Página */}
                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 sm:p-6 lg:p-8 text-gray-900">
                    {/* Header secundario (si la vista lo envía) */}
                    {header && (
                        <div className="mb-8 border-b border-gray-200 pb-4">
                            {header}
                        </div>
                    )}

                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}