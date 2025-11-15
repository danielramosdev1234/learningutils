import React, { Component } from 'react';
import { XCircle, RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para monitoramento
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode enviar para um serviço de monitoramento
    // Exemplo: Sentry.captureException(error, { extra: errorInfo });
    
    // Analytics
    if (window.va) {
      window.va('event', {
        name: 'error_boundary_triggered',
        data: {
          error: error?.message || 'Unknown error',
          componentStack: errorInfo?.componentStack || ''
        }
      });
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const errorMessage = error?.message || 'Algo inesperado aconteceu';
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-lg w-full">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="text-red-600" size={48} />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Oops! Algo deu errado
            </h1>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-red-800 font-semibold mb-1">Erro:</p>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Não se preocupe, seus dados estão seguros. Tente recarregar a página ou voltar para a página inicial.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                aria-label="Tentar novamente"
              >
                <RefreshCw size={20} />
                Tentar Novamente
              </button>
              
              <Link
                to="/"
                className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                aria-label="Voltar para página inicial"
              >
                <Home size={20} />
                Página Inicial
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Detalhes técnicos (apenas em desenvolvimento)
                </summary>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48">
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

