import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const PublicAuthModal = ({ isOpen, onClose, onAuthenticated, initialView = "register" }) => {
    const [view, setView] = useState(initialView);
    const [loading, setLoading] = useState(false);

    // Update view when modal opens with a new initialView
    useEffect(() => {
        if (isOpen) {
            setView(initialView);
            setError(""); // Reset error when modal opens
        }
    }, [isOpen, initialView]);

    // Clear error and reset form when switching views
    useEffect(() => {
        setError("");
    }, [view]);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    if (!isOpen) return null;

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(`${API_BASE}/v1/auth/public-register`, formData);
            if (res.data.status) {
                localStorage.setItem("publicToken", res.data.data.token);
                localStorage.setItem("publicUser", JSON.stringify(res.data.data.user));
                // Ubah ke view confirm agar user klik tombol manual (mencegah Popup Blocked)
                setView("confirm");
            }
        } catch (err) {
            const msg = err.response?.data?.message;
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(" "));
            } else {
                setError(msg || "Gagal mendaftar. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(`${API_BASE}/v1/auth/login`, {
                email: formData.email,
                password: formData.password
            });
            if (res.data.status) {
                // Check if role is public
                if (res.data.data.user.role === 'public') {
                    localStorage.setItem("publicToken", res.data.data.token);
                    localStorage.setItem("publicUser", JSON.stringify(res.data.data.user));
                    // Ubah ke view confirm agar user klik tombol manual (mencegah Popup Blocked)
                    setView("confirm");
                } else {
                    setError("Gunakan akun pelamar, bukan akun staff.");
                }
            }
        } catch (err) {
            setError("Email atau password salah.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-lg w-full transform transition-all scale-100 border border-gray-100 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black transition-all active:scale-90 z-10"
                >
                    <i className="ri-close-line text-2xl"></i>
                </button>

                <div className="text-center">
                    {/* Header Icon */}
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className={`ri-${view === 'confirm' ? 'check-double' : view === 'login' ? 'user-shared' : 'user-add'}-fill text-red-500 text-4xl animate-pulse`}></i>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2">
                        {view === "confirm" ? "Pernyataan Keseriusan" : view === "login" ? "Masuk Akun Pelamar" : "Registrasi Pelamar"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        {view === "confirm"
                            ? "Pastikan Anda telah membaca kualifikasi dengan teliti dan benar-benar berniat bergabung."
                            : view === "login"
                                ? "Masuk untuk melanjutkan proses pendaftaran Anda."
                                : "Daftar singkat untuk menyimpan progres pendaftaran Anda."
                        }
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-6 border border-red-100 font-bold">
                            {error}
                        </div>
                    )}

                    {/* VIEW: CONFIRMATION (Bagi yang sudah Login) */}
                    {view === "confirm" && (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={onAuthenticated}
                                className="w-full py-4 bg-[#DC3933] text-white rounded-2xl hover:bg-black transition-all duration-300 font-black shadow-lg shadow-red-200 active:scale-95"
                            >
                                Ya, Saya Serius & Lanjutkan
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all font-bold"
                            >
                                Batal
                            </button>
                        </div>
                    )}

                    {/* VIEW: REGISTER (Bagi yang Belum Punya Akun) */}
                    {view === "register" && (
                        <form onSubmit={handleRegister} className="space-y-4 text-left">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nama Lengkap</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 focus:border-red-500 focus:bg-white transition-all outline-none text-sm font-bold text-gray-900 placeholder-gray-400"
                                    placeholder="Nama Sesuai KTP"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email</label>
                                <input
                                    required type="email"
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 focus:border-red-500 focus:bg-white transition-all outline-none text-sm font-bold text-gray-900 placeholder-gray-400"
                                    placeholder="user@mail.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Buat Password</label>
                                <input
                                    required type="password" minLength={6}
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 focus:border-red-500 focus:bg-white transition-all outline-none text-sm font-bold text-gray-900 placeholder-gray-400"
                                    placeholder="Minimal 6 Karakter"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-[#DC3933] text-white rounded-2xl hover:bg-black transition-all duration-300 font-black shadow-lg shadow-red-200 mt-4 disabled:opacity-50"
                            >
                                {loading ? "Memproses..." : "Daftar & Lanjutkan"}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                Sudah punya akun? <button type="button" onClick={() => setView("login")} className="text-red-500 font-bold hover:underline">Masuk Disini</button>
                            </p>
                        </form>
                    )}

                    {/* VIEW: LOGIN (Bagi yang Sudah Punya Akun tapi Belum Login) */}
                    {view === "login" && (
                        <form onSubmit={handleLogin} className="space-y-4 text-left">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email</label>
                                <input
                                    required type="email"
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 focus:border-red-500 focus:bg-white transition-all outline-none text-sm font-bold text-gray-900 placeholder-gray-400"
                                    placeholder="user@mail.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Password</label>
                                <input
                                    required type="password"
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 focus:border-red-500 focus:bg-white transition-all outline-none text-sm font-bold text-gray-900 placeholder-gray-400"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-black text-white rounded-2xl hover:bg-red-600 transition-all duration-300 font-black shadow-lg shadow-gray-200 mt-4 disabled:opacity-50"
                            >
                                {loading ? "Masuk..." : "Masuk & Lanjutkan"}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                Belum punya akun? <button type="button" onClick={() => setView("register")} className="text-red-500 font-bold hover:underline">Daftar Sekarang</button>
                            </p>
                        </form>
                    )}

                    {/* External Link Indicator */}
                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        <i className="ri-google-fill text-lg"></i>
                        Akan Diteruskan ke Google Form
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicAuthModal;
