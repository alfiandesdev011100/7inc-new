import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

const tokenHeader = () => {
    const t = localStorage.getItem("adminToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const EditJoinBanner = () => {
    const [form, setForm] = useState({
        join_title: "",
        join_subtitle: "",
        join_button_text: "Daftar Sekarang",
        join_image_url: "",
        join_image: null,
    });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const fileRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_BASE}/home-settings`)
            .then(res => {
                if (res.data) {
                    setForm(s => ({
                        ...s,
                        join_title: res.data.join_title || "",
                        join_subtitle: res.data.join_subtitle || "",
                        join_button_text: res.data.join_button_text || "Daftar Sekarang",
                        join_image_url: res.data.join_image_url || "",
                    }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const onSave = async () => {
        setBusy(true);
        setMsg("");
        try {
            const fd = new FormData();
            fd.append("join_title", form.join_title);
            fd.append("join_subtitle", form.join_subtitle);
            fd.append("join_button_text", form.join_button_text);
            if (form.join_image) fd.append("join_image", form.join_image);

            await axios.post(`${API_BASE}/admin/home-settings`, fd, {
                headers: { ...tokenHeader() }
            });
            setMsg("Berhasil menyimpan perubahan.");
        } catch (e) {
            setMsg("Gagal menyimpan perubahan.");
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-10">Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Banner Ajakan (Join)</h1>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Judul Banner</span>
                        <input
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                            value={form.join_title}
                            onChange={e => setForm({ ...form, join_title: e.target.value })}
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Sub-judul</span>
                        <textarea
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                            rows={3}
                            value={form.join_subtitle}
                            onChange={e => setForm({ ...form, join_subtitle: e.target.value })}
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Teks Tombol</span>
                        <input
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 outline-none"
                            value={form.join_button_text}
                            onChange={e => setForm({ ...form, join_button_text: e.target.value })}
                        />
                    </label>

                    <div className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Gambar Banner</span>
                        <input
                            type="file"
                            ref={fileRef}
                            onChange={e => setForm({ ...form, join_image: e.target.files[0] })}
                            className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                        {form.join_image_url && !form.join_image && (
                            <div className="mt-4">
                                <img src={form.join_image_url} alt="Preview" className="w-64 rounded-xl border shadow-sm" />
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                        <button
                            disabled={busy}
                            onClick={onSave}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {busy ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                        {msg && <span className="text-sm font-medium text-gray-600 italic">{msg}</span>}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default EditJoinBanner;
