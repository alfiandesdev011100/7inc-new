import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const WriterSidebar = () => {
    const location = useLocation();
    const [role, setRole] = useState("");

    useEffect(() => {
        const data = localStorage.getItem("adminData");
        if (data) {
            const parsed = JSON.parse(data);
            setRole(parsed.role);
        }
    }, []);

    const MenuItem = ({ to, icon, label }) => {
        const isActive = location.pathname === to;

        return (
            <li>
                <Link
                    to={to}
                    className={`flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                            ? "text-white bg-blue-600 shadow-lg shadow-blue-500/30"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    {isActive && (
                        <span className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 animate-pulse"></span>
                    )}
                    <i
                        className={`${icon} text-lg transition-colors duration-200 ${isActive ? "text-cyan-200" : "text-gray-500 group-hover:text-gray-300"
                            }`}
                    />
                    <span className="ms-3">{label}</span>
                </Link>
            </li>
        );
    };

    return (
        <aside
            className="h-full w-full bg-[#0f172a] border-r border-gray-800 flex flex-col"
            aria-label="Sidebar"
        >
            {/* Header */}
            <div className="flex-none flex items-center justify-center h-20 border-b border-gray-800 bg-[#0f172a]">
                <Link to="/writer" className="flex items-center gap-2 group">
                    <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                        <span className="text-white font-bold text-lg">7</span>
                    </div>
                    <span className="text-xl font-bold tracking-wide text-white font-poppins">
                        WRITER <span className="text-blue-500">PANEL</span>
                    </span>
                </Link>
            </div>

            {/* MENU */}
            <div className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Main Menu
                    </div>

                    <MenuItem
                        to="/writer"
                        icon="ri-dashboard-3-line"
                        label="Dashboard"
                    />

                    <MenuItem
                        to="/writer/articles"
                        icon="ri-article-line"
                        label="Artikel Saya"
                    />

                    <MenuItem
                        to="/writer/create-article"
                        icon="ri-file-add-line"
                        label="Buat Artikel"
                    />

                    <MenuItem
                        to="/writer/tasks"
                        icon="ri-task-line"
                        label="Tugas Admin"
                    />
                </ul>

                <ul className="space-y-1 mt-6">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                    </div>

                    <MenuItem
                        to="/writer/drafts"
                        icon="ri-draft-line"
                        label="Drafts"
                    />

                    <MenuItem
                        to="/writer/pending"
                        icon="ri-time-line"
                        label="Menunggu Review"
                    />
                </ul>
            </div>

            <div className="flex-none absolute bottom-0 left-0 w-full px-4 py-3 bg-[#0f172a] border-t border-gray-800 md:static">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs text-gray-400">Writer Mode Active</span>
                </div>
            </div>
        </aside>
    );
};

export default WriterSidebar;
