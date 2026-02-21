import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [role, setRole] = useState("writer"); // Default role
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (password !== passwordConfirmation) {
            setError("Password konfirmasi tidak cocok");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post("/admin/register", {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                role,
            });

            if (res.data.status) {
                setSuccess("Registrasi berhasil! Silakan login.");
                setTimeout(() => {
                    navigate("/admin/login");
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || "Terjadi kesalahan saat registrasi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="p-8 rounded-xl shadow-2xl w-[400px] bg-gray-800 border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">
                    Register Akun
                </h2>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500/10 border border-green-500 text-green-500 text-sm p-3 rounded mb-4">{success}</div>}

                <form className="space-y-4" onSubmit={handleRegister}>
                    {/* Name */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="mail@site.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Daftar Sebagai</label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`cursor-pointer border rounded py-2 text-center transition-all ${role === 'writer' ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="writer"
                                    className="hidden"
                                    checked={role === 'writer'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                Writer
                            </label>
                            <label className={`cursor-pointer border rounded py-2 text-center transition-all ${role === 'admin' ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    className="hidden"
                                    checked={role === 'admin'}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                Admin
                            </label>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Password Confirmation */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Konfirmasi Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                            placeholder="********"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition-colors mt-4"
                    >
                        {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                    </button>
                </form>

                <div className="mt-6 text-center text-gray-400 text-sm">
                    Sudah punya akun?{" "}
                    <Link to="/admin/login" className="text-blue-400 hover:underline">
                        Login disini
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
