import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message || 'Unexpected error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white text-[#0D0D0D] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#F2F2F2] rounded-2xl p-6 border border-black/10 space-y-4 text-center">
            <img
              src="/logo.png"
              alt="Oubeid Cell"
              className="w-14 h-14 mx-auto rounded-full"
            />
            <h1 className="text-lg font-semibold">Oubeid Cell</h1>
            <p className="text-sm text-zinc-600">
              Something went wrong while loading the store.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full min-h-[44px] px-5 py-2.5 bg-[#0D0D0D] text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
