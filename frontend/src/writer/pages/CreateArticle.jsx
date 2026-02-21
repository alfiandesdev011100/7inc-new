import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateArticle = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [targetPage, setTargetPage] = useState("beranda");
    const [displayType, setDisplayType] = useState("section");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("adminToken");
            const res = await axios.post(
                "import.meta.env.VITE_API_URL/articles",
                { title, content, target_page: targetPage, display_type: displayType },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.status) {
                navigate("/writer/drafts");
            }
        } catch (error) {
            console.error("Error creating article:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Buat Artikel Baru</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Judul Artikel
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Masukkan judul menarik..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Target Halaman
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={targetPage}
                                onChange={(e) => setTargetPage(e.target.value)}
                            >
                                <option value="beranda">Beranda</option>
                                <option value="tentang-kami">Tentang Kami</option>
                                <option value="lowongan-kerja">Lowongan Kerja</option>
                                <option value="bisnis-kami">Bisnis Kami</option>
                                <option value="kontak">Kontak</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipe Tampilan
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                value={displayType}
                                onChange={(e) => setDisplayType(e.target.value)}
                            >
                                <option value="hero">Hero Section</option>
                                <option value="section">Standard Section</option>
                                <option value="card">Card Grid</option>
                                <option value="banner">Banner</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Konten Artikel
                        </label>
                        <textarea
                            required
                            rows="12"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="Tulis artikel anda disini..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate("/writer/articles")}
                            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            {loading ? "Menyimpan..." : "Simpan Draft"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateArticle;
