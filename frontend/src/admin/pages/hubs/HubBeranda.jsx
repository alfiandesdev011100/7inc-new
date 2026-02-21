import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import SectionArticlesManager from '../../components/SectionArticlesManager';

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

const tokenHeader = () => {
    const t = localStorage.getItem("adminToken");
    return t ? { Authorization: `Bearer ${t}`, Accept: "application/json" } : { Accept: "application/json" };
};

const HubBeranda = () => {
    // ==========================================
    // 1. HERO SECTION STATE (Ported from EditHeroSection)
    // ==========================================
    const [heroId, setHeroId] = useState(null);
    const [hHeading, setHHeading] = useState("");
    const [hSubheading, setHSubheading] = useState("");
    const [hIsPublished, setHIsPublished] = useState(true);
    const [hImageUrl, setHImageUrl] = useState(null);
    const [hFile, setHFile] = useState(null);
    const [hPreview, setHPreview] = useState(null);
    const [hBase, setHBase] = useState({ heading: "", subheading: "", isPublished: true, imageUrl: null });
    const [hBusy, setHBusy] = useState(false);

    // ==========================================
    // 2. JOIN BANNER STATE (Ported from EditJoinBanner)
    // ==========================================
    const [jForm, setJForm] = useState({
        join_title: "",
        join_subtitle: "",
        join_button_text: "Daftar Sekarang",
        join_image_url: "",
        join_image: null,
    });
    const [jBusy, setJBusy] = useState(false);

    // UI States
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const showMsg = (text, type = 'success') => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    };

    // ==========================================
    // DATA LOADING
    // ==========================================
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load Hero (using public endpoint for initial load is fine or admin)
                const heroRes = await axios.get(`${API_BASE}/hero`);
                if (heroRes.data.status) {
                    const d = heroRes.data.data;
                    setHeroId(d.id);
                    setHHeading(d.heading || "");
                    setHSubheading(d.subheading || "");
                    setHIsPublished(!!d.is_published);
                    setHImageUrl(d.image_url);
                    setHBase({ heading: d.heading || "", subheading: d.subheading || "", isPublished: !!d.is_published, imageUrl: d.image_url });
                }

                // Load Join Banner
                const joinRes = await axios.get(`${API_BASE}/home-settings`);
                if (joinRes.data) {
                    setJForm(s => ({
                        ...s,
                        join_title: joinRes.data.join_title || "",
                        join_subtitle: joinRes.data.join_subtitle || "",
                        join_button_text: joinRes.data.join_button_text || "Daftar Sekarang",
                        join_image_url: joinRes.data.join_image_url || "",
                    }));
                }
            } catch (e) {
                console.error("Failed to load some Beranda settings", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // ==========================================
    // HERO LOGIC
    // ==========================================
    const onHeroPick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setHFile(f);
        setHPreview(URL.createObjectURL(f));
    };

    const saveHero = async () => {
        setHBusy(true);
        try {
            const fd = new FormData();
            fd.append("heading", hHeading);
            fd.append("subheading", hSubheading);
            fd.append("is_published", hIsPublished ? "1" : "0");
            if (hFile) fd.append("image", hFile);

            let res;
            if (heroId) {
                fd.append("_method", "PATCH");
                res = await axios.post(`${API_BASE}/admin/hero/${heroId}`, fd, {
                    headers: { ...tokenHeader(), "Content-Type": "multipart/form-data" }
                });
            } else {
                res = await axios.post(`${API_BASE}/admin/hero`, fd, {
                    headers: { ...tokenHeader(), "Content-Type": "multipart/form-data" }
                });
            }

            if (res.data.status) {
                const d = res.data.data;
                setHeroId(d.id);
                setHImageUrl(d.image_url);
                setHBase({ heading: d.heading, subheading: d.subheading, isPublished: !!d.is_published, imageUrl: d.image_url });
                setHFile(null);
                setHPreview(null);
                showMsg("Hero Section diperbarui.");
            }
        } catch (e) {
            showMsg("Gagal menyimpan Hero Section.", "error");
        } finally {
            setHBusy(false);
        }
    };

    const resetHeroImage = async () => {
        if (!heroId) return;
        setHBusy(true);
        try {
            const fd = new FormData();
            fd.append("image_reset", "1");
            fd.append("_method", "PATCH");
            const res = await axios.post(`${API_BASE}/admin/hero/${heroId}`, fd, {
                headers: { ...tokenHeader() }
            });
            setHImageUrl(res.data.data.image_url);
            setHBase(b => ({ ...b, imageUrl: res.data.data.image_url }));
            setHFile(null);
            setHPreview(null);
            showMsg("Gambar Hero dihapus.");
        } catch (e) {
            showMsg("Gagal mereset gambar Hero.", "error");
        } finally {
            setHBusy(false);
        }
    };

    // ==========================================
    // JOIN BANNER LOGIC
    // ==========================================
    const saveJoinBanner = async () => {
        setJBusy(true);
        try {
            const fd = new FormData();
            fd.append("join_title", jForm.join_title);
            fd.append("join_subtitle", jForm.join_subtitle);
            fd.append("join_button_text", jForm.join_button_text);
            if (jForm.join_image) fd.append("join_image", jForm.join_image);

            const res = await axios.post(`${API_BASE}/admin/home-settings`, fd, {
                headers: { ...tokenHeader() }
            });
            setJForm(s => ({ ...s, join_image_url: res.data.data.join_image_url || s.join_image_url, join_image: null }));
            showMsg("Banner Join diperbarui.");
        } catch (e) {
            showMsg("Gagal menyimpan Banner Join.", "error");
        } finally {
            setJBusy(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-10 text-center">Memuat Pengaturan Beranda...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* Header Hub */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 italic">Dashboard Editor Beranda</h1>
                    <p className="text-gray-500">Kontrol penuh atas seluruh elemen visual di halaman depan.</p>
                </div>

                {msg.text && (
                    <div className={`fixed top-24 right-10 z-50 px-6 py-3 rounded-xl shadow-2xl transition-all animate-bounce ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        <i className={`ri-${msg.type === 'error' ? 'error-warning' : 'checkbox-circle'}-line mr-2`}></i>
                        {msg.text}
                    </div>
                )}

                <div className="space-y-16">
                    {/* SECTION 1: HERO SECTION */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600"></div>
                        <div className="p-10">
                            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <i className="ri-layout-top-line"></i>
                                </span>
                                Section Hero (Top Page)
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Heading</span>
                                        <textarea
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all h-32 text-lg font-medium"
                                            placeholder="Menaungi Inovasi..."
                                            value={hHeading}
                                            onChange={e => setHHeading(e.target.value)}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Subheading</span>
                                        <textarea
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all h-24"
                                            placeholder="Holding Multisektor..."
                                            value={hSubheading}
                                            onChange={e => setHSubheading(e.target.value)}
                                        />
                                    </label>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <span className="font-bold text-gray-700">Tampilkan di Web Publik?</span>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-primary toggle-lg"
                                            checked={hIsPublished}
                                            onChange={e => setHIsPublished(e.target.checked)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-sm font-bold text-gray-700 uppercase block">Ganti Background Hero</span>
                                    <div className="relative group rounded-3xl overflow-hidden aspect-video border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 transition-colors">
                                        <img
                                            src={hPreview || hImageUrl || "/assets/img/Hero.jpg"}
                                            className="w-full h-full object-cover"
                                            alt="Hero"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold cursor-pointer hover:scale-105 transition-transform">
                                                Pilih Foto Baru
                                                <input type="file" className="hidden" onChange={onHeroPick} accept="image/*" />
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetHeroImage}
                                        className="text-xs text-red-500 font-bold hover:underline"
                                    >
                                        Hapus Gambar & Gunakan Default
                                    </button>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={saveHero}
                                    disabled={hBusy}
                                    className="bg-blue-600 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {hBusy ? <span className="loading loading-spinner loading-xs"></span> : <i className="ri-save-fill text-xl"></i>}
                                    Simpan Section Hero
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: JOIN BANNER */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-1 bg-gradient-to-r from-red-600 via-orange-400 to-red-600"></div>
                        <div className="p-10">
                            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                                    <i className="ri-advertisement-line"></i>
                                </span>
                                Banner Ajakan (CTA)
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Judul Banner</span>
                                        <input
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-red-500 focus:ring-4 focus:ring-red-50 focus:outline-none transition-all text-lg font-bold"
                                            value={jForm.join_title}
                                            onChange={e => setJForm({ ...jForm, join_title: e.target.value })}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Sub-judul</span>
                                        <textarea
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-red-500 focus:ring-4 focus:ring-red-50 focus:outline-none transition-all h-24"
                                            value={jForm.join_subtitle}
                                            onChange={e => setJForm({ ...jForm, join_subtitle: e.target.value })}
                                        />
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-bold text-gray-700 uppercase mb-2 block">Teks Pada Tombol</span>
                                        <input
                                            className="w-full border-2 border-gray-100 rounded-2xl px-5 py-4 focus:border-red-500 focus:ring-4 focus:ring-red-50 focus:outline-none transition-all"
                                            value={jForm.join_button_text}
                                            onChange={e => setJForm({ ...jForm, join_button_text: e.target.value })}
                                        />
                                    </label>
                                </div>

                                <div className="space-y-6">
                                    <span className="text-sm font-bold text-gray-700 uppercase block">Preview Banner & Foto</span>
                                    <div className="relative group rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 border-2 border-gray-100 flex items-center justify-center">
                                        <img
                                            src={jForm.join_image ? URL.createObjectURL(jForm.join_image) : jForm.join_image_url || "/assets/img/Hero2.png"}
                                            className="h-full w-auto object-contain"
                                            alt="Join"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="bg-white text-red-600 px-6 py-3 rounded-full font-bold cursor-pointer hover:scale-105 transition-transform">
                                                Ganti Foto Orang
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={e => setJForm({ ...jForm, join_image: e.target.files[0] })}
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-gray-400">Rekomendasi: Gambar PNG transparan.</p>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={saveJoinBanner}
                                    disabled={jBusy}
                                    className="bg-red-600 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {jBusy ? <span className="loading loading-spinner loading-xs"></span> : <i className="ri-save-fill text-xl"></i>}
                                    Simpan Banner CTA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: ARTICLES */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden">
                        <div className="bg-white rounded-[2rem] p-10">
                            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                            <i className="ri-article-line"></i>
                                        </span>
                                        Manage News Section
                                    </h2>
                                    <p className="text-gray-500 mt-2">Daftar artikel yang diteruskan Admin Berita untuk tampil di halaman depan.</p>
                                </div>
                            </div>

                            <SectionArticlesManager
                                targetPage="home"
                                title="Draft Artikel Aktif di Beranda"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default HubBeranda;
