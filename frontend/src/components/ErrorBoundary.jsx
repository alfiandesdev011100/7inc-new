import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
                    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="ri-error-warning-fill text-red-500 text-4xl"></i>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-4">Ups! Terjadi Kesalahan</h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Halaman ini mengalami gangguan teknis. Jangan khawatir, Anda bisa mencoba memuat ulang halaman.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-[#DC3933] text-white rounded-2xl hover:bg-black transition-all duration-300 font-black shadow-lg shadow-red-200 active:scale-95"
                        >
                            Muat Ulang Halaman
                        </button>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="mt-4 text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors"
                        >
                            Coba Lanjutkan (Mungkin Tidak Stabil)
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
