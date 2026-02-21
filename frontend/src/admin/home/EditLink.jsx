import axios from "axios";
import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://127.0.0.1:8000";

const PLATFORMS = [
    { key: "linkedin", label: "LinkedIn", icon: "ri-linkedin-box-fill", iconClass: "text-lime-500", labelClass: "text-lime-500" },
    { key: "instagram", label: "Instagram", icon: "ri-instagram-line", iconClass: "text-lime-500", labelClass: "text-lime-500" },
    { key: "facebook", label: "Facebook", icon: "ri-facebook-circle-fill", iconClass: "text-lime-500", labelClass: "text-lime-500" },
    { key: "x", label: "Twitter", icon: "ri-twitter-x-fill", iconClass: "text-lime-500", labelClass: "text-lime-500" },
    { key: "gforms", label: "Google Form", icon: "ri-google-fill", iconClass: "text-lime-500", labelClass: "text-lime-500" },
];

const emptyState = {
    linkedin: { url: "", is_active: true },
    instagram: { url: "", is_active: true },
    facebook: { url: "", is_active: true },
    x: { url: "", is_active: true },
    gforms: { url: "", is_active: true },
};

const EditLink = () => {
    const [links, setLinks] = useState(emptyState);
    const [initialLinks, setInitialLinks] = useState(emptyState); // snapshot untuk deteksi perubahan
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null); // hanya untuk error fatal (load/save)
    const [savingAll, setSavingAll] = useState(false);

    // pesan per card { linkedin: {type,text}|null, ... }
    const [msgMap, setMsgMap] = useState({
        linkedin: null,
        instagram: null,
        facebook: null,
        x: null,
        gforms: null,
    });

    const authHeaders = () => {
        const token = localStorage.getItem("adminToken");
        return {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    };

    // LOAD awal (GET /api/admin/social-links)
    useEffect(() => {
        (async () => {
            setLoading(true);
            setGlobalError(null);
            try {
                const res = await axios.get(`${API_BASE}/api/admin/social-links`, {
                    headers: authHeaders(),
                });
                const arr = res.data || [];
                const next = { ...emptyState };
                arr.forEach((row) => {
                    if (next[row.platform] !== undefined) {
                        next[row.platform] = {
                            url: row.url ?? "",
                            is_active: !!row.is_active,
                        };
                    }
                });
                setLinks(next);
                setInitialLinks(next);
            } catch (e) {
                console.error(e);
                const msg = e?.response?.data?.message || "Gagal memuat data URL link.";
                setGlobalError(msg);
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ubah URL per card
    const handleChangeUrl = (platform, value) => {
        setLinks((prev) => ({ ...prev, [platform]: { ...prev[platform], url: value } }));
    };

    // SIMPAN SEMUA (PUT /api/admin/social-links) – hanya kirim yang berubah
    const handleSaveAll = async () => {
        setSavingAll(true);
        setGlobalError(null);

        const changed = PLATFORMS.filter(
            (p) =>
                links[p.key].url !== initialLinks[p.key].url ||
                links[p.key].is_active !== initialLinks[p.key].is_active
        );

        if (changed.length === 0) {
            setSavingAll(false);
            return;
        }

        try {
            const payload = {
                links: changed.map((p) => ({
                    platform: p.key,
                    url: links[p.key].url || null,
                    is_active: !!links[p.key].is_active,
                })),
            };

            await axios.put(`${API_BASE}/api/admin/social-links`, payload, {
                headers: authHeaders(),
            });

            // sukses → pesan per card + sinkron snapshot
            const updates = {};
            changed.forEach((p) => {
                updates[p.key] = { type: "success", text: `Berhasil mengubah URL ${p.label}.` };
            });
            setMsgMap((prev) => ({ ...prev, ...updates }));

            setInitialLinks((base) => {
                const copy = { ...base };
                changed.forEach((p) => {
                    copy[p.key] = { ...links[p.key] };
                });
                return copy;
            });

            changed.forEach((p) => {
                setTimeout(() => {
                    setMsgMap((m) => ({ ...m, [p.key]: null }));
                }, 3500);
            });
        } catch (e) {
            console.error(e);
            const errText = e?.response?.data?.message || "Gagal menyimpan URL.";
            const errors = {};
            changed.forEach((p) => {
                errors[p.key] = { type: "error", text: `Gagal menyimpan URL ${p.label}.` };
            });
            setMsgMap((prev) => ({ ...prev, ...errors }));
            setGlobalError(errText);

            changed.forEach((p) => {
                setTimeout(() => {
                    setMsgMap((m) => ({ ...m, [p.key]: null }));
                }, 4000);
            });
        } finally {
            setSavingAll(false);
        }
    };

    // SVG ikon untuk alert
    const SuccessIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
    const ErrorIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <AdminLayout>
            <div className="pt-[120px] pb-[100px]">
                <div className="w-full mx-auto border-2 border-gray-200 rounded-lg p-6 max-w-5xl bg-white">
                    {/* Judul */}
                    <div className="mb-6 text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-lime-500 italic">
                            EDIT LINK
                        </h1>
                    </div>

                    {/* Alert global hanya untuk error fatal */}
                    {globalError && (
                        <div role="alert" className="alert alert-error mb-4">
                            <ErrorIcon />
                            <span>{globalError}</span>
                        </div>
                    )}

                    {/* Body */}
                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Memuat data…</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {PLATFORMS.map((p) => (
                                    <div key={p.key} className="border rounded-xl p-4">
                                        {/* Header card */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div id={`icon-wrap-${p.key}`} className="w-8 h-8 flex items-center justify-center rounded">
                                                <i id={`icon-${p.key}`} className={`${p.icon} text-[28px] ${p.iconClass}`} />
                                            </div>
                                            <div id={`label-${p.key}`} className={`font-semibold ${p.labelClass}`}>
                                                {p.label}
                                            </div>
                                        </div>

                                        {/* Textbox */}
                                        <input
                                            type="url"
                                            placeholder="https://example.com"
                                            value={links[p.key].url}
                                            onChange={(e) => handleChangeUrl(p.key, e.target.value)}
                                            aria-label={`${p.label} URL`}
                                            className="w-full rounded-md border border-lime-500 px-3 py-2 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
                                        />

                                        {/* Alert per card (daisyUI) */}
                                        {msgMap[p.key] && (
                                            <div
                                                role="alert"
                                                className={`alert mt-3 ${msgMap[p.key].type === "success" ? "alert-success" : "alert-error"}`}
                                            >
                                                {msgMap[p.key].type === "success" ? <SuccessIcon /> : <ErrorIcon />}
                                                <span>{msgMap[p.key].text}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* BUTTON SIMPAN – bawah, center */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handleSaveAll}
                                    disabled={savingAll}
                                    className="px-6 py-2 rounded-lg font-semibold
                             border border-lime-500
                             bg-lime-500 text-white
                             hover:bg-green-500 hover:text-white hover:border-green-500
                             focus:bg-green-500 focus:text-white focus:border-green-500
                             focus:ring-2 focus:ring-green-500
                             active:bg-green-500 active:text-white active:border-green-500
                             disabled:opacity-60 disabled:cursor-not-allowed
                             transition-colors duration-200 cursor-pointer"
                                >
                                    {savingAll ? "Menyimpan…" : "Simpan"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditLink;
