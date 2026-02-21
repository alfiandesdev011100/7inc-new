import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";
import DeleteModal from "../news/components/DeleteModal";

const ContactMessageIndex = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Modals
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await axios.get("import.meta.env.VITE_API_URL/admin/contact-messages", {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            if (res.data.status) {
                setMessages(res.data.data);
            }

            const countRes = await axios.get("import.meta.env.VITE_API_URL/admin/contact-messages/unread-count", {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            if (countRes.data.status) {
                setUnreadCount(countRes.data.data.unread_count);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`import.meta.env.VITE_API_URL/admin/contact-messages/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            });
            // Update local state locally to avoid full re-fetch flicker
            setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, is_read: true } : msg));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking read", err);
        }
    };

    const handleDelete = (item) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pesan Masuk</h1>
                    <p className="text-gray-500 text-sm">
                        Pesan dari formulir kontak website.
                    </p>
                </div>
                <div>
                    {unreadCount > 0 && (
                        <div className="badge badge-error text-white p-3 font-semibold shadow-lg animate-pulse">
                            {unreadCount} Pesan Baru Belum Dibaca
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-2 text-gray-400">Memuat pesan...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <i className="ri-mail-open-line text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">
                            Kotak Masuk Kosong
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Belum ada pesan masuk dari pengunjung website.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`p-4 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 ${!msg.is_read ? 'bg-blue-50/60' : ''}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold text-gray-800 ${!msg.is_read ? 'text-blue-700' : ''}`}>
                                            {msg.name}
                                        </span>
                                        {!msg.is_read && <span className="badge badge-xs badge-primary">New</span>}
                                        <span className="text-xs text-gray-400">• {new Date(msg.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-600 mb-1">
                                        {msg.subject || 'No Subject'}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                        {msg.message}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><i className="ri-mail-line"></i> {msg.email}</span>
                                        <span className="flex items-center gap-1"><i className="ri-phone-line"></i> {msg.phone || '-'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-end gap-2">
                                    {!msg.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(msg.id)}
                                            className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-100"
                                            title="Tandai sudah dibaca"
                                        >
                                            <i className="ri-mail-check-line"></i>
                                            <span className="md:hidden">Read</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(msg)}
                                        className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50"
                                        title="Hapus Pesan"
                                    >
                                        <i className="ri-delete-bin-line"></i>
                                        <span className="md:hidden">Hapus</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onSuccess={fetchMessages}
                dataToDelete={selectedItem}
                endpoint="/api/admin/contact-messages"
            />
        </AdminLayout>
    );
};

export default ContactMessageIndex;
