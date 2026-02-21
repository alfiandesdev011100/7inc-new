// src/admin/home/EditBisnisKami.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AdminLayout from "../layouts/AdminLayout";
import SectionArticlesManager from "../components/SectionArticlesManager";

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

function AlertBridge({ autoCloseMs = 2500, position = "top-center" }) {
    const [msg, setMsg] = useState(null);
    const [type, setType] = useState("success");

    const posClass =
        position === "top-left"
            ? "top-4 left-4"
            : position === "top-center"
                ? "top-4 left-1/2 -translate-x-1/2"
                : position === "bottom-right"
                    ? "bottom-4 right-4"
                    : position === "bottom-left"
                        ? "bottom-4 left-4"
                        : "top-4 right-4";

    useEffect(() => {
        const original = window.alert;
        window.alert = (text) => {
            const t = String(text ?? "");
            const isError = /gagal|error|failed|tidak/i.test(t);
            setType(isError ? "error" : "success");
            setMsg(t);
            clearTimeout(window.__alertBridgeTimer);
            window.__alertBridgeTimer = setTimeout(() => setMsg(null), autoCloseMs);
        };
        return () => {
            window.alert = original;
            clearTimeout(window.__alertBridgeTimer);
        };
    }, [autoCloseMs]);

    if (!msg) return null;

    return createPortal(
        <div
            role="alert"
            className={`alert ${type === "success" ? "alert-success" : "alert-error"
                } fixed ${posClass} z-[1000] w-[520px] max-w-[92vw] shadow-lg`}
        >
            {type === "success" ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            )}
            <span>{msg}</span>
        </div>,
        document.body
    );
}

export default function EditBisnisKami() {
    const token = localStorage.getItem("adminToken");
    const auth = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : { headers: {} };

    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    // file upload state
    const [files, setFiles] = useState({});
    // cache-busting versi gambar
    const [imgVer, setImgVer] = useState({});
    // status simpan masing-masing field
    const [saving, setSaving] = useState({});

    const handleFileChange = (field, file) => {
        setFiles((prev) => ({ ...prev, [field]: file }));
    };

    const bumpImgVer = (field) =>
        setImgVer((prev) => ({ ...prev, [field]: Date.now() }));

    const displayImg = (field, fallback) =>
        data?.[field]
            ? `${data[field]}${imgVer[field] ? `?t=${imgVer[field]}` : ""}`
            : fallback;

    const handleTextChange = (field, value) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const saveTextField = async (field) => {
        try {
            setSaving((s) => ({ ...s, [field]: true }));
            const payload = { [field]: data[field] ?? null };
            // ⬇️ gunakan route ber-prefix admin
            await axios.put(`${API_BASE}/admin/bisnis-kami-full/text`, payload, auth);
            alert("Teks berhasil diperbarui.");
            localStorage.setItem("BISNIS_KAMI_CHANGED", String(Date.now()));
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "Gagal menyimpan teks.");
        } finally {
            setSaving((s) => ({ ...s, [field]: false }));
        }
    };

    const uploadImage = async (field) => {
        const file = files[field];
        if (!file) return alert("Pilih file terlebih dahulu.");

        const form = new FormData();
        form.append("field", field);
        form.append("image", file);

        try {
            // ⬇️ gunakan route ber-prefix admin
            const res = await axios.post(
                `${API_BASE}/admin/bisnis-kami-full/image`,
                form,
                {
                    ...auth,
                    headers: {
                        ...(auth.headers || {}),
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setData(res.data.data || {});
            bumpImgVer(field);
            alert("Gambar berhasil diperbarui.");
            localStorage.setItem("BISNIS_KAMI_CHANGED", String(Date.now()));
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.message || "Gagal mengunggah gambar.");
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // GET publik (boleh kirim auth, tapi tidak wajib)
                const res = await axios.get(`${API_BASE}/bisnis-kami-full`, auth);
                if (!cancelled) setData(res.data || {});
            } catch (e) {
                console.error(e);
                if (!cancelled) setData({});
                alert("Gagal memuat data Bisnis Kami");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <AlertBridge />
                <div className="w-full py-24 text-center">Memuat…</div>
            </AdminLayout>
        );
    }

    const sections = [
        {
            key: "seven_tech",
            label: "Seven Tech",
            titleField: "seven_tech_title",
            textField: "seven_tech_text",
            imageField: "seven_tech_image",
            fallback: "/assets/img/Perusahaan.png",
        },
        {
            key: "seven_style",
            label: "Seven Style",
            titleField: "seven_style_title",
            textField: "seven_style_text",
            imageField: "seven_style_image",
            fallback: "/assets/img/cardPakaian.png",
        },
        {
            key: "seven_serve",
            label: "Seven Serve",
            titleField: "seven_serve_title",
            textField: "seven_serve_text",
            imageField: "seven_serve_image",
            fallback: "/assets/img/Keuntungan.png",
        },
        {
            key: "seven_edu",
            label: "Seven Edu",
            titleField: "seven_edu_title",
            textField: "seven_edu_text",
            imageField: "seven_edu_image",
            fallback: "/assets/img/School.png",
        },
    ];

    return (
        <AdminLayout>
            <AlertBridge />

            <div className="w-full mx-auto py-12">
                {/* HEADER */}
                <section className="border-2 border-gray-200 rounded-lg p-6 mb-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm text-center mb-8">
                        EDIT GAMBAR DAN TEKS BISNIS KAMI
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Left: texts */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Subjudul */}
                            <div>
                                <label className="block font-semibold mb-1 text-black">
                                    Subjudul (atas)
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-700"
                                        value={data.header_subtitle || ""}
                                        onChange={(e) =>
                                            handleTextChange("header_subtitle", e.target.value)
                                        }
                                        placeholder="Lini Bisnis Kami"
                                    />
                                    <button
                                        className="btn btn-neutral btn-outline whitespace-nowrap"
                                        disabled={!!saving.header_subtitle}
                                        onClick={() => saveTextField("header_subtitle")}
                                    >
                                        {saving.header_subtitle ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </div>

                            {/* Judul */}
                            <div>
                                <label className="block font-semibold mb-1 text-black">
                                    Judul utama
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-md bg-white text-gray-700"
                                        value={data.header_title || ""}
                                        onChange={(e) =>
                                            handleTextChange("header_title", e.target.value)
                                        }
                                        placeholder="Satu Visi, Banyak Solusi"
                                    />
                                    <button
                                        className="btn btn-neutral btn-outline whitespace-nowrap"
                                        disabled={!!saving.header_title}
                                        onClick={() => saveTextField("header_title")}
                                    >
                                        {saving.header_title ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </div>

                            {/* Deskripsi umum */}
                            <div>
                                <label className="block font-semibold mb-1 text-black">
                                    Deskripsi Umum
                                </label>
                                <div className="flex gap-3">
                                    <textarea
                                        className="w-full h-40 bg-white text-gray-700 border px-4 py-3 rounded resize-none"
                                        value={data.general_description || ""}
                                        onChange={(e) =>
                                            handleTextChange("general_description", e.target.value)
                                        }
                                        placeholder="Tulis deskripsi umum perusahaan di sini..."
                                    />
                                    <button
                                        className="btn btn-neutral btn-outline whitespace-nowrap"
                                        disabled={!!saving.general_description}
                                        onClick={() => saveTextField("general_description")}
                                    >
                                        {saving.general_description ? "Menyimpan..." : "Simpan"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right: header image */}
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Header image saat ini</p>
                            <img
                                src={displayImg("header_image", "/assets/img/Banner2.png")}
                                alt="Header"
                                className="w-full h-[180px] object-cover rounded border mb-3"
                            />
                            <input
                                type="file"
                                className="file-input w-full bg-white border border-gray-300 text-gray-700"
                                onChange={(e) =>
                                    handleFileChange("header_image", e.target.files[0])
                                }
                            />
                            <div className="mt-4 flex justify-start">
                                <button
                                    className="btn btn-neutral btn-outline ml-[60px]"
                                    onClick={() => uploadImage("header_image")}
                                >
                                    Upload Header Image
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTIONS */}
                {sections.map((sec) => (
                    <section
                        key={sec.key}
                        className="border-2 border-gray-200 rounded-lg p-6 mb-10"
                    >
                        <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-black mb-6">
                            Edit {sec.label}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* texts */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Judul */}
                                <div>
                                    <label className="block font-semibold mb-1 text-black">
                                        Judul
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border rounded-md bg-white text-gray-700"
                                            value={data[sec.titleField] || ""}
                                            onChange={(e) =>
                                                handleTextChange(sec.titleField, e.target.value)
                                            }
                                            placeholder={sec.label}
                                        />
                                        <button
                                            className="btn btn-neutral btn-outline whitespace-nowrap"
                                            disabled={!!saving[sec.titleField]}
                                            onClick={() => saveTextField(sec.titleField)}
                                        >
                                            {saving[sec.titleField] ? "Menyimpan..." : "Simpan"}
                                        </button>
                                    </div>
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <label className="block font-semibold mb-1 text-black">
                                        Deskripsi
                                    </label>
                                    <div className="flex gap-3">
                                        <textarea
                                            className="w-full h-40 bg-white text-gray-700 border px-4 py-3 rounded resize-none"
                                            value={data[sec.textField] || ""}
                                            onChange={(e) =>
                                                handleTextChange(sec.textField, e.target.value)
                                            }
                                            placeholder={`Tulis deskripsi ${sec.label}...`}
                                        />
                                        <button
                                            className="btn btn-neutral btn-outline whitespace-nowrap"
                                            disabled={!!saving[sec.textField]}
                                            onClick={() => saveTextField(sec.textField)}
                                        >
                                            {saving[sec.textField] ? "Menyimpan..." : "Simpan"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* image */}
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Gambar saat ini</p>
                                <img
                                    src={displayImg(sec.imageField, sec.fallback)}
                                    alt={sec.label}
                                    className="w-full h-[220px] object-cover rounded border mb-3"
                                />
                                <input
                                    type="file"
                                    className="file-input w-full bg-white border border-gray-300 text-gray-700"
                                    onChange={(e) =>
                                        handleFileChange(sec.imageField, e.target.files[0])
                                    }
                                />
                                <div className="mt-4 flex justify-start">
                                    <button
                                        className="btn btn-neutral btn-outline ml-[40px]"
                                        onClick={() => uploadImage(sec.imageField)}
                                    >
                                        Upload Gambar {sec.label}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}

                {/* Section Drafts & Articles */}
                <SectionArticlesManager
                    targetPage="bisnis-kami"
                    title="Daftar Artikel Section Bisnis Kami"
                />
            </div>
        </AdminLayout>
    );
}
