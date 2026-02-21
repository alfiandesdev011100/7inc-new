import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

const AdminActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); // Tabs: 'all', 'admin', 'writer', 'public'

    const token = localStorage.getItem("adminToken");
    const authHeaders = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/admin/activity-logs`, {
                headers: authHeaders,
            });
            if (res.data.status || res.data.success) {
                setLogs(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
            setError("Gagal memuat riwayat aktivitas.");
        } finally {
            setLoading(false);
        }
    };

    // --- Filtering Logic ---
    const filteredLogs = logs.filter(log => {
        if (activeTab === 'all') return true;
        if (activeTab === 'admin') return log.role === 'admin' || log.role === 'super_admin';
        if (activeTab === 'writer') return log.role === 'writer';
        if (activeTab === 'public') return log.role === 'public';
        return true;
    });

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getActionBadge = (action) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create') || actionLower.includes('store'))
            return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">Create</span>;
        if (actionLower.includes('update') || actionLower.includes('edit') || actionLower.includes('patch') || actionLower.includes('put'))
            return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">Update</span>;
        if (actionLower.includes('delete') || actionLower.includes('destroy'))
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold uppercase">Delete</span>;
        if (actionLower.includes('approve') || actionLower.includes('publish'))
            return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold uppercase">Publish/Approve</span>;

        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase">{action}</span>;
    };

    // Helper for Tab Button
    const TabBtn = ({ id, label, icon, color }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === id
                ? `border-${color}-500 text-${color}-600 bg-${color}-50/50`
                : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
        >
            <i className={`${icon} text-lg`}></i>
            {label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === id ? `bg-${color}-100 text-${color}-700` : "bg-gray-100 text-gray-500"}`}>
                {logs.filter(log => {
                    if (id === 'all') return true;
                    if (id === 'admin') return log.role === 'admin' || log.role === 'super_admin';
                    if (id === 'writer') return log.role === 'writer';
                    if (id === 'public') return log.role === 'public';
                    return true;
                }).length}
            </span>
        </button>
    );

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 italic">Log Aktivitas Sistem</h1>
                        <p className="text-gray-500 mt-1 text-sm">Transparansi penuh atas setiap perubahan yang dilakukan Admin, Writer, & Public.</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-sm transition-all active:scale-95"
                    >
                        <i className={`ri-refresh-line ${loading ? 'animate-spin' : ''}`}></i>
                        Refresh Data
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
                        <i className="ri-error-warning-fill text-xl"></i>
                        {error}
                    </div>
                )}

                {/* --- NAVIGATION TABS --- */}
                <div className="flex bg-white rounded-t-3xl border-x border-t border-gray-200 overflow-hidden">
                    <TabBtn id="all" label="Semua" icon="ri-list-check" color="blue" />
                    <TabBtn id="admin" label="Admin" icon="ri-user-settings-line" color="indigo" />
                    <TabBtn id="writer" label="Writer" icon="ri-edit-2-line" color="emerald" />
                    <TabBtn id="public" label="Public" icon="ri-user-voice-line" color="orange" />
                </div>

                <div className="bg-white rounded-b-3xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden text-black font-medium">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Waktu</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Aktor (Role)</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Model & ID</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                            <span className="loading loading-dots loading-md mb-2 block mx-auto"></span>
                                            Sedang menyinkronkan data...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic font-normal">
                                            <i className="ri-history-line text-4xl mb-2 block opacity-20"></i>
                                            Belum ada log aktivitas {activeTab !== 'all' ? `untuk kategori ${activeTab}` : ''} yang tercatat.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                        {log.role?.substring(0, 2).toUpperCase() || 'AD'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800">User ID: #{log.user_id}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{log.role || 'Admin'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getActionBadge(log.action)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <span className="font-bold text-gray-700">{log.model}</span>
                                                    <span className="text-gray-400 mx-1">•</span>
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">ID: {log.model_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono text-gray-600">{log.ip_address}</span>
                                                    <span className="text-[9px] text-gray-400 truncate max-w-[150px]" title={log.user_agent}>
                                                        {log.user_agent}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 shadow-sm">
                        <i className="ri-shield-user-line text-lg"></i>
                    </div>
                    <p className="text-sm text-orange-800 font-medium">
                        <strong>Keamanan Data:</strong> Hanya role <strong>Admin</strong> dan <strong>Super Admin</strong> yang dapat mengakses riwayat audit ini untuk menjamin akuntabilitas data.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminActivityLog;
