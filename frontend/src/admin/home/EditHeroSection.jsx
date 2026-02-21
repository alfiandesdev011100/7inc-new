// src/admin/home/EditHeroSection.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import SectionArticlesManager from "../components/SectionArticlesManager";

const API_BASE = "import.meta.env.VITE_API_URL";

const EditHeroSection = () => {
    // ====== States utama ======
    const [currentId, setCurrentId] = useState(null);

    const [heading, setHeading] = useState("");
    const [subheading, setSubheading] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    // Gambar
    const [imageUrl, setImageUrl] = useState(null); // url dari server (preview saat tidak ganti)
    const [file, setFile] = useState(null); // file baru
    const [preview, setPreview] = useState(null); // preview file baru

    // Snapshot (untuk deteksi perubahan)
    const [base, setBase] = useState({
        heading: "",
        subheading: "",
        isPublished: true,
        imageUrl: null,
    });

    // UI
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState(null); // {type:'success'|'error', text:''}

    const token = useMemo(() => localStorage.getItem("adminToken"), []);
    const authHeaders = token
        ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
        : { Accept: "application/json" };

    const cacheKey = "hero_published_cache_v1";

    // ====== Helpers ======
    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 2500);
    };

    const clearImagePicker = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
    };

    const resetForm = () => {
        setCurrentId(null);
        setHeading("");
        setSubheading("");
        setIsPublished(true);
        setImageUrl(null);
        setBase({ heading: "", subheading: "", isPublished: true, imageUrl: null });
        clearImagePicker();
    };

    // hitung perubahan (untuk logika tombol)
    const isDirty = useMemo(() => {
        return (
            heading !== base.heading ||
            subheading !== base.subheading ||
            isPublished !== base.isPublished ||
            !!file
        );
    }, [heading, subheading, isPublished, file, base]);

    // ====== Load: Published (Public GET /api/hero) ======
    const loadPublished = async () => {
        setLoading(true);
        try {
            // tampilkan dari cache dulu (anti-kedip)
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const j = JSON.parse(cached);
                setCurrentId(j.id ?? null);
                setHeading(j.heading || "");
                setSubheading(j.subheading || "");
                setIsPublished(j.is_published ?? true);
                setImageUrl(j.image_url || null);
                setBase({
                    heading: j.heading || "",
                    subheading: j.subheading || "",
                    isPublished: !!j.is_published,
                    imageUrl: j.image_url || null,
                });
            }

            const res = await axios.get(`${API_BASE}/hero`, { headers: { Accept: "application/json" } });
            const data = res?.data?.data;
            if (data) {
                setCurrentId(data.id ?? null);
                setHeading(data.heading || "");
                setSubheading(data.subheading || "");
                setIsPublished(!!data.is_published);
                setImageUrl(data.image_url || null);
                setBase({
                    heading: data.heading || "",
                    subheading: data.subheading || "",
                    isPublished: !!data.is_published,
                    imageUrl: data.image_url || null,
                });
                localStorage.setItem(cacheKey, JSON.stringify(data));
                showMsg("success", "Hero (published) dimuat.");
            }
        } catch (e) {
            resetForm();
            showMsg("error", "Belum ada hero published atau gagal memuat.");
        } finally {
            setLoading(false);
        }
    };

    // ====== Pick File ======
    const onPick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 4 * 1024 * 1024) {
            showMsg("error", "Maksimal 4MB");
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    // ====== Save (Create/Update) ======
    const onSave = async () => {
        if (!heading.trim()) {
            showMsg("error", "Heading wajib diisi.");
            return;
        }

        setSaving(true);
        try {
            const form = new FormData();
            form.append("heading", heading);
            if (subheading !== undefined) form.append("subheading", subheading);
            form.append("is_published", isPublished ? "1" : "0");
            if (file) form.append("image", file);

            let data;
            if (currentId) {
                // update
                const res = await axios.patch(`${API_BASE}/admin/hero/${currentId}`, form, {
                    headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
                });
                data = res?.data?.data;
            } else {
                // create
                const res = await axios.post(`${API_BASE}/admin/hero`, form, {
                    headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
                });
                data = res?.data?.data;
            }

            if (data) {
                setCurrentId(data.id ?? null);
                setImageUrl(data.image_url || null);
                // jadikan baseline baru (tidak dirty lagi)
                setBase({
                    heading: data.heading || "",
                    subheading: data.subheading || "",
                    isPublished: !!data.is_published,
                    imageUrl: data.image_url || null,
                });
                clearImagePicker();
                localStorage.setItem(cacheKey, JSON.stringify(data)); // refresh cache jika published
                showMsg("success", currentId ? "Berhasil diperbarui." : "Berhasil dibuat.");
            }
        } catch (e) {
            showMsg("error", "Gagal menyimpan (cek form/token).");
        } finally {
            setSaving(false);
        }
    };

    // ====== Reset/Hapus Gambar ======
    const onResetImage = async () => {
        if (!currentId) {
            // hanya hapus pilihan lokal
            clearImagePicker();
            setImageUrl(null);
            return;
        }
        setSaving(true);
        try {
            const form = new FormData();
            form.append("image_reset", "1");
            const res = await axios.patch(`${API_BASE}/admin/hero/${currentId}`, form, {
                headers: { ...authHeaders, "Content-Type": "multipart/form-data" },
            });
            const data = res?.data?.data;
            setImageUrl(data?.image_url || null);
            // baseline ikut terbarui (perubahan sudah disimpan)
            setBase((b) => ({ ...b, imageUrl: data?.image_url || null }));
            clearImagePicker();
            showMsg("success", "Gambar dihapus.");
        } catch (e) {
            showMsg("error", "Gagal menghapus gambar.");
        } finally {
            setSaving(false);
        }
    };

    // ====== Delete ======
    const onDelete = async () => {
        if (!currentId) {
            showMsg("error", "Tidak ada data aktif untuk dihapus.");
            return;
        }
        if (!confirm("Yakin hapus hero ini?")) return;
        setDeleting(true);
        try {
            await axios.delete(`${API_BASE}/admin/hero/${currentId}`, { headers: authHeaders });
            resetForm();
            localStorage.removeItem(cacheKey);
            showMsg("success", "Hero dihapus.");
        } catch (e) {
            showMsg("error", "Gagal menghapus (periksa token).");
        } finally {
            setDeleting(false);
        }
    };

    // auto-load published saat buka halaman
    useEffect(() => {
        loadPublished();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AdminLayout>
            <h1 className="text-black text-center font-bold text-5xl italic">EditHeroSection</h1>

            {/* Alerts */}
            {message && (
                <div
                    role="alert"
                    className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} mt-6 w-full max-w-4xl mx-auto`}
                >
                    <span>{message.text}</span>
                </div>
            )}

            {/* Loader tipis */}
            {loading && (
                <div className="mt-4 flex justify-center">
                    <span className="loading loading-dots loading-lg" />
                </div>
            )}

            {/* Form utama (Panel "Konten Hero" + "Gambar Hero") */}
            <div className="mx-auto max-w-4xl mt-8 p-6 rounded-xl border border-gray-200 bg-white">
                <h2 className="text-xl font-bold text-black mb-3">Konten Hero</h2>

                <label className="label text-black">Heading</label>
                <textarea
                    className="textarea textarea-bordered w-full min-h-[80px]"
                    placeholder="Menaungi Inovasi, Merajut Masa Depan"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                />

                <label className="label text-black mt-4">Subheading</label>
                <textarea
                    className="textarea textarea-bordered w-full min-h-[70px]"
                    placeholder="Holding Multisektor Teknologi, Fashion, Edukasi & Jasa"
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                />

                <div className="mt-4 flex items-center gap-4">
                    <label className="cursor-pointer label">
                        <span className="label-text text-black mr-3">Published</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-success"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                        />
                    </label>
                </div>

                {/* Gambar */}
                <div className="mt-6">
                    <h3 className="font-semibold text-black mb-2">Gambar Hero</h3>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="W-full md:w-1/2">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="file-input file-input-bordered w-full"
                                onChange={onPick}
                            />
                            <div className="mt-2 flex gap-2">
                                <button className="btn btn-outline btn-error btn-sm" onClick={clearImagePicker} disabled={!file}>
                                    Cancel File
                                </button>
                                <button className="btn btn-neutral btn-outline btn-sm" onClick={onResetImage} disabled={saving}>
                                    Reset/Hapus Gambar
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <div className="text-sm text-gray-500 mb-1">Preview</div>
                            <img
                                src={preview || imageUrl || "/assets/img/placeholder-16x9.png"}
                                alt="hero preview"
                                className="w-full max-h-60 object-cover rounded-lg border"
                                onError={(e) => {
                                    e.currentTarget.src = "/assets/img/placeholder-16x9.png";
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions (logika baru: Buat Baru default, Simpan hanya saat ada perubahan) */}
                <div className="mt-6 flex items-center gap-3">
                    <button className="btn btn-accent" onClick={onSave} disabled={saving}>
                        {saving ? (
                            <>
                                <span className="loading loading-spinner" /> Menyimpan...
                            </>
                        ) : isDirty ? (
                            "Simpan"
                        ) : (
                            "Buat Baru"
                        )}
                    </button>

                    <button className="btn btn-error" onClick={onDelete} disabled={!currentId || deleting}>
                        {deleting ? (
                            <>
                                <span className="loading loading-spinner" /> Menghapus...
                            </>
                        ) : (
                            "Hapus"
                        )}
                    </button>

                    <button className="btn" onClick={resetForm} disabled={saving || deleting}>
                        Reset Form
                    </button>

                    {currentId && <span className="text-xs text-gray-400 ml-2">ID: {currentId}</span>}
                </div>

                {/* Section Drafts & Articles */}
                <SectionArticlesManager
                    targetPage="home"
                    title="Daftar Artikel Section Beranda"
                />
            </div>
        </AdminLayout>
    );
};

export default EditHeroSection;
