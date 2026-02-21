import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const EditNavbar = () => {
    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentLogo, setCurrentLogo] = useState(() => {
        return localStorage.getItem("navbarLogoUrl") || null;
    });
    const [success, setSuccess] = useState(false);
    const [inputKey, setInputKey] = useState(Date.now());

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await axios.get("import.meta.env.VITE_API_URL/admin/logo");
                const url = res.data?.data?.url || null;
                setCurrentLogo(url);
                if (url) localStorage.setItem("navbarLogoUrl", url); // cache untuk halaman lain
            } catch (e) {
                console.error(e);
            }
        };
        fetchLogo();
    }, []);

    const onPick = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 2 * 1024 * 1024) {
            alert("Maksimal 2MB");
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setSuccess(false);
    };

    const onCancel = () => {
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setInputKey(Date.now());
    };

    // helper untuk menunggu minimal 'ms'
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const onSave = async () => {
        if (!file) return alert("Pilih file dulu");
        try {
            setLoading(true);
            setSuccess(false);

            const start = Date.now();

            const form = new FormData();
            form.append("image", file);

            const token = localStorage.getItem("adminToken");
            await axios.post("import.meta.env.VITE_API_URL/admin/logo", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            // refresh logo yang tersimpan
            const res = await axios.get("import.meta.env.VITE_API_URL/admin/logo");
            const url = res.data?.data?.url || null;
            setCurrentLogo(url);
            if (url) localStorage.setItem("navbarLogoUrl", url);

            // pastikan loader terlihat minimal 3 detik
            const elapsed = Date.now() - start;
            if (elapsed < 3000) await sleep(3000 - elapsed);

            onCancel();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            console.error(e);
            alert("Gagal menyimpan logo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col items-center w-full mx-auto pt-[120px] pb-[100px] border-2 border-gray-200 rounded-lg">
                <h1 className="text-black text-6xl font-bold text-center italic">EDIT LOGO</h1>

                {/* ALERT SUKSES */}
                {success && (
                    <div role="alert" className="alert alert-success mt-6 w-full max-w-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Gambar Berhasil Diperbarui!</span>
                    </div>
                )}

                {/* Current logo */}
                <div className="mt-10 flex flex-col items-center gap-4">
                    <span className="text-sm text-gray-500">Logo saat ini</span>
                    <img
                        src={preview || currentLogo || "/assets/img/Logo.png"}
                        alt="logo"
                        className="h-30 w-auto object-contain rounded-md border border-base-300 bg-white p-2"
                        // jika URL DB rusak, jatuhkan ke fallback & bersihkan cache
                        onError={(e) => {
                            if (currentLogo) {
                                localStorage.removeItem("navbarLogoUrl");
                                setCurrentLogo(null);
                            }
                            e.currentTarget.src = "/assets/img/Logo.png";
                        }}
                    />
                </div>

                {/* Form upload DaisyUI */}
                <div className="w-full max-w-xl mt-10">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-black">Pick a file</legend>
                        {/* key agar bisa reset input saat Cancel */}
                        <input
                            key={inputKey}
                            type="file"
                            accept="image/png,image/jpeg"
                            className="file-input file-input-primary"
                            onChange={onPick}
                        />
                        <label className="label text-black">Max size 2MB</label>
                    </fieldset>

                    {/* Actions: tampil HANYA ketika ada file dipilih atau sedang loading */}
                    {(file || loading) && (
                        <div className="mt-6 flex items-center gap-3">
                            {/* Cancel */}
                            <button
                                className="px-5 h-11 rounded-full bg-[#3b3b3b] text-white font-semibold disabled:opacity-60 cursor-pointer"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            {/* Save / Loading */}
                            <button
                                onClick={onSave}
                                disabled={loading || !file}
                                className="px-6 h-11 rounded-full bg-[#D43026] text-white font-semibold disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner" />
                                        loading
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditNavbar;
