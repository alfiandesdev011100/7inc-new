import { useEffect, useRef, useState } from "react";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = import.meta.env.VITE_API_BASE || "import.meta.env.VITE_API_URL";

const tokenHeader = () => {
    const t = localStorage.getItem("adminToken");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

const EditNewsHeader = () => {
    const [form, setForm] = useState({
        banner_title: "",
        banner_subtitle: "",
        banner_image_url: "",
        banner_image: null,
    });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");
    const fileRef = useRef(null);

    useEffect(() => {
        axios.get(`${API_BASE}/news-page-settings`)
            .then(res => {
                if (res.data) {
                    setForm(s => ({
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

    const onSave = async () => {
        setBusy(true);
        setMsg("");
        try {
            const fd = new FormData();
            fd.append("banner_title", form.banner_title);
            fd.append("banner_subtitle", form.banner_subtitle);
            if (form.banner_image) fd.append("banner_image", form.banner_image);

            await axios.post(`${API_BASE}/admin/news-page-settings`, fd, {
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
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Banner Halaman Berita</h1>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Judul Banner (Heading)</span>
                        <input
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                            value={form.banner_title}
                            onChange={e => setForm({ ...form, banner_title: e.target.value })}
                        />
                    </label>

                    <label className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Sub-judul (Kicker)</span>
                        <input
                            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 outline-none"
                            value={form.banner_subtitle}
                            onChange={e => setForm({ ...form, banner_subtitle: e.target.value })}
                        />
                    </label>

                    <div className="block">
                        <span className="text-gray-700 text-sm font-bold mb-1 block">Gambar Banner</span>
                        <input
                            type="file"
                            ref={fileRef}
                            onChange={e => setForm({ ...form, banner_image: e.target.files[0] })}
                            className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                        {form.banner_image_url && !form.banner_image && (
                            <div className="mt-4">
                                <img src={form.banner_image_url} alt="Preview" className="w-full max-h-48 object-cover rounded-xl border shadow-sm" />
                            </div>
                        )}
                    </div>

                    <div className="pt-6 flex items-center justify-between">
                        <button
                            disabled={busy}
                            onClick={onSave}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-8 rounded-lg transition-colors disabled:opacity-50"
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

export default EditNewsHeader;
