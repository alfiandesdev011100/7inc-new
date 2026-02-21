import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const LoginAdmin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await api.post("/admin/login", {
                email,
                password,
            });

            if (res.data.status) {
                const admin = res.data.data.user;
                const token = res.data.data.token;

                // Simpan token & data admin
                localStorage.setItem("adminToken", token);
                localStorage.setItem("adminData", JSON.stringify(admin));

                setSuccess("Login berhasil!");

                // ================================
                // REDIRECT BERDASARKAN ROLE
                // ================================
                let target = "/admin"; // default redirect

                if (admin.role === "writer") {
                    target = "/writer"; // writer masuk dashboard writer
                } else if (admin.role === "admin") {
                    target = "/admin"; // admin masuk dashboard admin
                }

                setTimeout(() => {
                    navigate(target);
                }, 1000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Email atau password salah");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="p-8 rounded-xl shadow-2xl w-[380px] bg-gray-800 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">
                    Login System
                </h2>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500/10 border border-green-500 text-green-500 text-sm p-3 rounded mb-4">{success}</div>}

                <form className="space-y-4" onSubmit={handleLogin}>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <i className="ri-mail-line"></i>
                            </span>
                            <input
                                type="email"
                                placeholder="mail@site.com"
                                required
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded pl-10 pr-3 py-2 focus:outline-none focus:border-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <i className="ri-lock-line"></i>
                            </span>
                            <input
                                type="password"
                                required
                                placeholder="********"
                                minLength={6}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded pl-10 pr-3 py-2 focus:outline-none focus:border-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tombol Login */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition-colors mt-2"
                    >
                        {loading ? "Sedang Masuk..." : "Masuk ke Dashboard"}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    Belum punya akun?{" "}
                    <Link to="/register" className="text-blue-400 hover:underline">
                        Daftar disini
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;
