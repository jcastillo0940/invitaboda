import React from 'react';

/**
 * ErrorBoundary de Debug — Captura errores de renderizado de React
 * y muestra información útil para identificar el componente culpable.
 * 
 * Uso: envuelve el componente sospechoso con <DebugBoundary name="NombreComponente">
 */
export default class DebugBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error(
            `%c[DebugBoundary] Error en: "${this.props.name || 'Desconocido'}"`,
            'background: #ff4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
            '\nError:', error?.message,
            '\nStack del componente:\n', errorInfo?.componentStack
        );
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    background: '#1a0000',
                    border: '1px solid #ff4444',
                    borderRadius: 8,
                    padding: 16,
                    margin: 8,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#ff8888'
                }}>
                    <strong style={{ color: '#ff4444', fontSize: 14 }}>
                        💥 Error en: "{this.props.name || 'Componente desconocido'}"
                    </strong>
                    <p style={{ marginTop: 8, color: '#ffaaaa' }}>
                        {this.state.error?.message}
                    </p>
                    <details style={{ marginTop: 8 }}>
                        <summary style={{ cursor: 'pointer', color: '#ff6666' }}>
                            Ver stack de componentes
                        </summary>
                        <pre style={{ marginTop: 8, fontSize: 10, whiteSpace: 'pre-wrap', color: '#ff9999' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                        style={{
                            marginTop: 12, padding: '4px 12px',
                            background: '#ff4444', color: 'white',
                            border: 'none', borderRadius: 4, cursor: 'pointer'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
