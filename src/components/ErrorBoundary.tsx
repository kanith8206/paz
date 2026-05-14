
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      try {
        // Check if it's a Firestore JSON error
        if (this.state.error?.message.startsWith('{')) {
          const errData = JSON.parse(this.state.error.message);
          if (errData.error.includes('Missing or insufficient permissions')) {
            errorMessage = "You don't have permission to perform this action. Please make sure you're signed in.";
          }
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-[#6C5CE7]/10 border border-[#E2E8F0] p-10 text-center">
            <div className="w-20 h-20 bg-[#FF7675]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-[#D63031] w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-[#2D3436] mb-3">Oops! Something happened</h1>
            <p className="text-[#636E72] mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-[#6C5CE7] hover:bg-[#5B4BC4] text-white rounded-xl h-12 font-bold"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Refreshing
              </Button>
              <Button 
                variant="ghost" 
                onClick={this.handleReset}
                className="text-[#636E72] font-bold"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
