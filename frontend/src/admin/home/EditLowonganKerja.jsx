import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import SectionArticlesManager from "../components/SectionArticlesManager";

const API_BASE = "import.meta.env.VITE_API_URL";

// Fallback (tampilan statis awal)
const FALLBACK_HERO = {
    heading: "Lowongan Kerja",
    title: "Berkarir bersama \n Seven INC.",
    subtitle: "Temukan peluang karir Anda dengan posisi yang sesuai.",
    hero_url: "/assets/img/cardLoker.png",
};

const tokenHeader = () => {
    const t = localStorage.getItem("adminToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const EditLowonganKerja = () => {
    const [loaded, setLoaded] = useState(false);

    // snapshot terakhir yang tersimpan (server atau fallback)
    const [base, setBase] = useState({
        id: null,
        heading: FALLBACK_HERO.heading,
        title: FALLBACK_HERO.title,
        subtitle: FALLBACK_HERO.subtitle,
        hero_url: FALLBACK_HERO.hero_url,
        job_position: "",  // Menambahkan job_position
        career_growth_description: ""  // Menambahkan career_growth_description
    });

    // form aktif (bisa berbeda dari base saat user mengedit)
    const [form, setForm] = useState({
        id: null,
        heading: FALLBACK_HERO.heading,
        title: FALLBACK_HERO.title,
        subtitle: FALLBACK_HERO.subtitle,
        heroFile: null, // File baru (opsional)
        heroPreview: FALLBACK_HERO.hero_url, // url preview (base/baru)
        job_position: "",  // Form untuk job_position
        career_growth_description: ""  // Form untuk career_growth_description
    });

    // menandai permintaan reset gambar (hapus gambar server)
    const [resetHero, setResetHero] = useState(false);

    const fileRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    // ========== Helpers ========== 
    const isDirty = () =>
        form.heading !== base.heading ||
        form.title !== base.title ||
        form.subtitle !== base.subtitle ||
        !!form.heroFile ||
        resetHero ||
        form.job_position !== base.job_position ||
        form.career_growth_description !== base.career_growth_description;

    // simpan newline apa adanya
    const toMultiline = (text) => String(text || "");
    const fromMultiline = (text) => String(text || "");

    // ========== Load latest on mount ========== 
    useEffect(() => {
        let stop = false;
        (async () => {
            try {
                const res = await axios.get(`${API_BASE}/works/latest`);
                const d = res?.data?.data;
                if (!stop && d) {
                    const nextBase = {
                        id: d.id,
                        heading: d.heading ?? FALLBACK_HERO.heading,
                        title: d.title ?? FALLBACK_HERO.title,
                        subtitle: d.subtitle ?? FALLBACK_HERO.subtitle,
                        hero_url: d.hero_url ?? FALLBACK_HERO.hero_url,
                        job_position: d.id ? (d.job_position ?? "") : "",
                        career_growth_description: d.id ? (d.career_growth_description ?? "") : ""
                    };
                    setBase(nextBase);
                    setForm({
                        id: nextBase.id,
                        heading: nextBase.heading,
                        title: nextBase.title,
                        subtitle: nextBase.subtitle,
                        heroFile: null,
                        heroPreview: nextBase.hero_url,
                        job_position: nextBase.job_position,
                        career_growth_description: nextBase.career_growth_description
                    });
                    setResetHero(false);
                }
                if (!stop) setLoaded(true);
            } catch {
                if (!stop) {
                    // tidak ada data → tampilkan fallback
                    setBase({
                        id: null,
                        heading: FALLBACK_HERO.heading,
                        title: FALLBACK_HERO.title,
                        subtitle: FALLBACK_HERO.subtitle,
                        hero_url: FALLBACK_HERO.hero_url,
                        job_position: "",
                        career_growth_description: ""
                    });
                    setForm({
                        id: null,
                        heading: FALLBACK_HERO.heading,
                        title: FALLBACK_HERO.title,
                        subtitle: FALLBACK_HERO.subtitle,
                        heroFile: null,
                        heroPreview: FALLBACK_HERO.hero_url,
                        job_position: "",
                        career_growth_description: ""
                    });
                    setLoaded(true);
                }
            }
        })();
        return () => { stop = true; };
    }, []);

    // ========== Handlers ========== 
    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const onFile = (e) => {
        const f = e.target.files?.[0] || null;
        if (!f) {
            setForm((s) => ({ ...s, heroFile: null, heroPreview: base.hero_url }));
            setResetHero(false);
            return;
        }
        setForm((s) => ({ ...s, heroFile: f, heroPreview: URL.createObjectURL(f) }));
        setResetHero(false);
    };

    const clearFileInput = () => {
        if (fileRef.current) fileRef.current.value = "";
    };

    const onCancel = () => {
        setForm({
            id: base.id,
            heading: base.heading,
            title: base.title,
            subtitle: base.subtitle,
            heroFile: null,
            heroPreview: base.hero_url,
            job_position: base.job_position,
            career_growth_description: base.career_growth_description
        });
        setResetHero(false);
        clearFileInput();
        setMsg("Perubahan dibatalkan.");
    };

    const onReset = () => {
        setForm({
            id: base.id,
            heading: FALLBACK_HERO.heading,
            title: FALLBACK_HERO.title,
            subtitle: FALLBACK_HERO.subtitle,
            heroFile: null,
            heroPreview: FALLBACK_HERO.hero_url,
            job_position: "",
            career_growth_description: ""
        });
        setResetHero(!!base.hero_url);
        clearFileInput();
        setMsg("Dikembalikan ke tampilan default (belum disimpan).");
    };

    const onSave = async () => {
        if (!form.heading || !form.title) {
            setMsg("Heading & Title wajib diisi.");
            return;
        }
        setBusy(true);
        setMsg("");
        try {
            const fd = new FormData();
            if (form.heading !== base.heading) fd.append("heading", form.heading);
            if (form.title !== base.title) fd.append("title", form.title);
            if (form.subtitle !== base.subtitle) fd.append("subtitle", form.subtitle);
            if (form.heroFile) fd.append("hero", form.heroFile);
            if (resetHero) fd.append("hero_reset", "1");
            if (form.job_position !== base.job_position) fd.append("job_position", form.job_position);
            if (form.career_growth_description !== base.career_growth_description) fd.append("career_growth_description", form.career_growth_description);

            let res;
            if (form.id) {
                fd.append("_method", "PATCH");
                res = await axios.post(`${API_BASE}/admin/works/${form.id}`, fd, {
                    headers: { ...tokenHeader() },
                });
            } else {
                if (!fd.has("heading")) fd.append("heading", form.heading);
                if (!fd.has("title")) fd.append("title", form.title);
                res = await axios.post(`${API_BASE}/admin/works`, fd, {
                    headers: { ...tokenHeader() },
                });
            }

            const dataReturned = res?.data?.data;
            if (dataReturned) {
                const nextBase = {
                    id: dataReturned.id,
                    heading: dataReturned.heading ?? form.heading,
                    title: dataReturned.title ?? form.title,
                    subtitle: dataReturned.subtitle ?? form.subtitle,
                    hero_url: dataReturned.hero_url ?? null,
                    job_position: dataReturned.job_position ?? form.job_position,
                    career_growth_description: dataReturned.career_growth_description ?? form.career_growth_description
                };
                setBase(nextBase);
                setForm({
                    id: nextBase.id,
                    heading: nextBase.heading,
                    title: nextBase.title,
                    subtitle: nextBase.subtitle,
                    heroFile: null,
                    heroPreview: nextBase.hero_url,
                    job_position: nextBase.job_position,
                    career_growth_description: nextBase.career_growth_description
                });
                setResetHero(false);
                clearFileInput();
                setMsg("Perubahan disimpan.");
            } else {
                setMsg("Tidak ada perubahan disimpan.");
            }
        } catch (e) {
            console.error(e);
            setMsg("Gagal menyimpan. Pastikan sudah login & field valid.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-black text-5xl font-bold text-center italic">Lowongan Kerja</h1>

            {!loaded ? (
                <div className="max-w-[980px] mx-auto mt-8 h-[520px] bg-gray-50 rounded-xl shadow animate-pulse" />
            ) : (
                <>
                    <div className="max-w-[980px] mx-auto mt-8 bg-white rounded-xl shadow p-6 text-black">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-4">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                        Heading <span className="text-red-500">*</span>
                                    </span>
                                    <input
                                        name="heading"
                                        value={form.heading}
                                        onChange={onChange}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Lowongan Kerja"
                                    />
                                </label>

                                <label className="block mb-4">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </span>
                                    <textarea
                                        name="title"
                                        value={toMultiline(form.title)}
                                        onChange={(e) => setForm((s) => ({ ...s, title: fromMultiline(e.target.value) }))}
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder={"Berkarir bersama \n Seven INC."}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Gunakan Enter untuk baris baru.</p>
                                </label>

                                <label className="block mb-4">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">Subtitle</span>
                                    <textarea
                                        name="subtitle"
                                        value={form.subtitle}
                                        onChange={onChange}
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Temukan peluang karir Anda dengan posisi yang sesuai."
                                    />
                                </label>

                                <label className="block mb-4">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">Posisi Pekerjaan</span>
                                    <input
                                        name="job_position"
                                        value={form.job_position}
                                        onChange={onChange}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Masukkan posisi pekerjaan"
                                    />
                                </label>

                                <label className="block mb-4">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">Mulai pertumbuhan karirmu sekarang</span>
                                    <textarea
                                        name="career_growth_description"
                                        value={form.career_growth_description}
                                        onChange={onChange}
                                        rows={3}
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Masukkan deskripsi pertumbuhan karirmu"
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Gambar Hero (jpg/png/webp)</label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={onFile}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                                />
                                <div className="mt-4">
                                    <img
                                        src={form.heroPreview || "/assets/img/cardLoker.png"}
                                        alt="Preview"
                                        className="w-full max-h-64 object-cover rounded-lg border"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={busy}
                                className="inline-flex items-center px-5 py-2 rounded-lg border text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            {isDirty() ? (
                                <button
                                    type="button"
                                    onClick={onSave}
                                    disabled={busy}
                                    className="inline-flex items-center px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    Simpan
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onReset}
                                    disabled={busy}
                                    className="inline-flex items-center px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {msg && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                {msg}
                            </div>
                        )}

                        <div className="mt-4 text-xs text-gray-500">
                            <p>* Cancel: batalkan perubahan yang belum disimpan (kembali ke versi terakhir).</p>
                            <p>* Reset: kembalikan konten ke default statis (perlu klik Simpan untuk menyimpan ke server).</p>
                            <p>* Simpan: buat/update data hero di server.</p>
                        </div>
                    </div>

                    <SectionArticlesManager
                        targetPage="lowongan-kerja"
                        title="Daftar Artikel Section Karir"
                    />
                </>
            )}
        </AdminLayout>
    );
};

export default EditLowonganKerja;
