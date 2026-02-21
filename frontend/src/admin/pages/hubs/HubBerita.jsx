import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import SectionArticlesManager from '../../components/SectionArticlesManager';

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

const tokenHeader = () => {
    const t = localStorage.getItem("adminToken");
    return t ? { Authorization: `Bearer ${t}`, Accept: "application/json" } : { Accept: "application/json" };
};

const HubBerita = () => {
    // ==========================================
    // 1. BANNER HEADER STATE (Ported from EditNewsHeader)
    // ==========================================
    const [hForm, setHForm] = useState({
        banner_title: "",
        banner_subtitle: "",
        banner_image_url: "",
        banner_image: null,
    });
    const [hBusy, setHBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const showMsg = (text, type = 'success') => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    useEffect(() => {
        axios.get(`${API_BASE}/news-page-settings`)
            .then(res => {
                if (res.data) {
                    setHForm(s => ({
                        ...s,
                        banner_title: res.data.banner_title || "",
                        banner_subtitle: res.data.banner_subtitle || "",
                        banner_image_url: res.data.banner_image_url || "",
                    }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const saveHeader = async () => {
        setHBusy(true);
        try {
            const fd = new FormData();
            fd.append("banner_title", hForm.banner_title);
            fd.append("banner_subtitle", hForm.banner_subtitle);
            if (hForm.banner_image) fd.append("banner_image", hForm.banner_image);

            const res = await axios.post(`${API_BASE}/admin/news-page-settings`, fd, {
                headers: { ...tokenHeader() }
            });
            setHForm(s => ({
                ...s,
                banner_image_url: res.data.data.banner_image_url || s.banner_image_url,
                banner_image: null
            }));
            showMsg("Banner Halaman Berita diperbarui.");
        } catch (e) {
            showMsg("Gagal menyimpan banner.", "error");
        } finally {
            setHBusy(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-10 text-center">Memuat Pengaturan Halaman Berita...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Header Hub */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 italic">Dashboard Editor Halaman Berita</h1>
                    <p className="text-gray-500">Kelola banner pembuka dan daftar publikasi berita.</p>
                </div>

                {msg.text && (
                    <div className={`fixed top-24 right-10 z-50 px-6 py-3 rounded-xl shadow-2xl transition-all animate-bounce ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        <i className={`ri-${msg.type === 'error' ? 'error-warning' : 'checkbox-circle'}-line mr-2`}></i>
                        {msg.text}
                    </div>
                )}

                <div className="space-y-12">
                    {/* SECTION 1: HEADER BANNER */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-1 bg-gradient-to-r from-purple-600 via-indigo-400 to-purple-600"></div>
                        <div className="p-10">
                            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                    <i className="ri-image-2-line"></i>
                                </span>
                                Banner Header (Public Page)
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Judul Banner (Heading)</span>
                                        <input
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all text-lg font-bold"
                                            value={hForm.banner_title}
                                            onChange={e => setHForm({ ...hForm, banner_title: e.target.value })}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Sub-judul (Kicker)</span>
                                        <input
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all"
                                            value={hForm.banner_subtitle}
                                            onChange={e => setHForm({ ...hForm, banner_subtitle: e.target.value })}
                                        />
                                    </label>

                                    <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                                        <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                            <i className="ri-information-fill"></i>
                                            Akses Cepat Artikel
                                        </h4>
                                        <p className="text-sm text-purple-800 leading-relaxed mb-4">
                                            Ingin memproses artikel baru dari Writer? Silakan buka menu Artikel utama untuk melakukan review dan forwarding.
                                        </p>
                                        <Link
                                            to="/admin/berita"
                                            className="inline-flex items-center gap-2 bg-white text-purple-700 font-bold px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                                        >
                                            Ke Database Artikel <i className="ri-external-link-line"></i>
                                        </Link>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-sm font-bold text-gray-700 uppercase block">Preview Banner</span>
                                    <div className="relative group rounded-3xl overflow-hidden aspect-[16/7] border-2 border-gray-100 bg-gray-50 flex items-center justify-center">
                                        <img
                                            src={hForm.banner_image ? URL.createObjectURL(hForm.banner_image) : hForm.banner_image_url || "/assets/img/Banner3.png"}
                                            className="w-full h-full object-cover"
                                            alt="Header Banner"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold cursor-pointer hover:scale-105 transition-transform">
                                                Ganti Gambar Banner
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={e => setHForm({ ...hForm, banner_image: e.target.files[0] })}
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-gray-400 italic">Rekomendasi ukuran: 1440x510px atau aspek 16:9 yang lebar.</p>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={saveHeader}
                                    disabled={hBusy}
                                    className="bg-purple-600 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-purple-200 transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {hBusy ? <span className="loading loading-spinner loading-xs"></span> : <i className="ri-save-fill text-xl"></i>}
                                    Simpan Perubahan Banner
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: PUBLISHED ARTICLES MANAGER */}
                    <div className="bg-gray-100 rounded-[2.5rem] p-4 shadow-inner overflow-hidden">
                        <div className="bg-white rounded-[2rem] p-10 border border-gray-200">
                            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                                            <i className="ri-newspaper-line"></i>
                                        </span>
                                        Daftar Publikasi Halaman Berita
                                    </h2>
                                    <p className="text-gray-500 mt-2">Kumpulan seluruh artikel yang saat ini tampil secara live di halaman Berita publik.</p>
                                </div>
                            </div>

                            {/* Berita usually doesn't have a specific targetPage filter like sections, it shows all official news */}
                            <SectionArticlesManager
                                targetPage="news"
                                title="Manajer Publikasi Berita"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default HubBerita;
