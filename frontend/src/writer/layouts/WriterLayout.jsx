import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const WriterLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = async () => {
        try {
            await api.post("/admin/logout");
        } catch (e) {
            console.warn("Backend logout failed, proceeding with local cleanup", e);
        }
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminData");
        navigate("/admin/login");
    };

    const isActive = (path) => {
        return location.pathname === path ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:bg-gray-800 hover:text-white";
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 lg:static lg:inset-0`}
            >
                <div className="flex items-center justify-center h-16 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                            W
                        </div>
                        <span className="text-lg font-bold text-white tracking-wide">Writer Panel</span>
                    </div>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Menu Utama
                    </p>

                    <Link
                        to="/writer/dashboard"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/writer/dashboard")}`}
                    >
                        <i className="ri-dashboard-3-line text-lg mr-3"></i>
                        Dashboard
                    </Link>

                    <Link
                        to="/writer/tasks"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/writer/tasks")}`}
                    >
                        <i className="ri-task-line text-lg mr-3"></i>
                        Tugas dari Admin
                    </Link>

                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                        Manajemen Konten
                    </p>

                    <Link
                        to="/writer/articles"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/writer/articles")}`}
                    >
                        <i className="ri-article-line text-lg mr-3"></i>
                        Artikel Saya
                    </Link>

                    <Link
                        to="/writer/articles/create"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/writer/articles/create")}`}
                    >
                        <i className="ri-edit-circle-line text-lg mr-3"></i>
                        Tulis Artikel Baru
                    </Link>

                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                        Pengaturan
                    </p>

                    <Link
                        to="/writer/profile"
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/writer/profile")}`}
                    >
                        <i className="ri-user-settings-line text-lg mr-3"></i>
                        Profil Saya
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-gray-800">
                            {localStorage.getItem("adminName")?.charAt(0) || "W"}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">{localStorage.getItem("adminName") || "Writer"}</p>
                            <p className="text-xs text-gray-500">Content Writer</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
                    >
                        <i className="ri-logout-box-line mr-2"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <i className="ri-menu-2-line text-2xl"></i>
                        </button>
                        <span className="font-bold text-gray-800">Writer Panel</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WriterLayout;
