import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-void-deep px-4">
          <div className="glass-card p-8 max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-neon-cyan mb-2">Oops! Something went wrong</h1>
            <p className="text-text-secondary mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-xs text-text-muted mb-4 bg-void-light p-3 rounded border border-neon-cyan/20">
                <summary className="cursor-pointer font-semibold mb-2">Error Details (Dev Only)</summary>
                <pre className="whitespace-pre-wrap break-words">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-neon-cyan text-void-deep rounded font-semibold hover:bg-neon-cyan/90 transition w-full"
            >
              Go to Home
            </button>
            <button
              onClick={this.handleReset}
              className="mt-2 px-6 py-2 border border-neon-cyan text-neon-cyan rounded font-semibold hover:bg-neon-cyan/10 transition w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
