import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import WriterLayout from "../../layouts/WriterLayout";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

const WriterArticleForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        target_page: "",
        display_type: "list",
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    // Initial Data Loading (Edit Mode or Pre-filled from Task)
    useEffect(() => {
        if (isEditMode) {
            const fetchArticle = async () => {
                try {
                    const res = await api.get(`/admin/articles/${id}`);
                    if (res.data.status) {
                        const data = res.data.data;
                        setFormData({
                            title: data.title,
                            content: data.content,
                            target_page: data.target_page || "",
                            display_type: data.display_type || "list",
                            image: null // Check logic for image update
                        });
                        setPreviewImage(data.image_url || null);
                    }
                } catch (error) {
                    console.error("Error fetching article:", error);
                    alert("Gagal memuat artikel.");
                    navigate("/writer/articles");
                } finally {
                    setInitialLoading(false);
                }
            };
            fetchArticle();
        } else {
            // Check for pre-filled state from Task
            if (location.state?.prefilled) {
                const pre = location.state.prefilled;
                setFormData(prev => ({
                    ...prev,
                    title: pre.title || "",
                    target_page: pre.target_page || "",
                    display_type: pre.display_type || "list"
                }));
            }
        }
    }, [id, isEditMode, navigate, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("content", formData.content);
        data.append("target_page", formData.target_page);
        data.append("display_type", formData.display_type);
        if (formData.image) {
            data.append("image", formData.image);
        }
        // If edit mode, we use PUT (method spoofing for Laravel FormData)
        if (isEditMode) {
            data.append("_method", "PUT");
        }

        try {
            const url = isEditMode
                ? `/admin/articles/${id}`
                : `/admin/articles`;

            const res = await api.post(url, data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (res.data.status) {
                // If created new, ask to submit? or just redirect to list
                // Simple flow: Redirect to list
                alert(`Artikel berhasil ${isEditMode ? 'diperbarui' : 'dibuat'} (Status: Draft)`);
                navigate("/writer/articles");
            }
        } catch (error) {
            console.error("Error saving article:", error);
            alert("Gagal menyimpan artikel. " + (error.response?.data?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <WriterLayout>
                <div className="p-12 text-center">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                </div>
            </WriterLayout>
        );
    }

    return (
        <WriterLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEditMode ? "Edit Artikel" : "Tulis Artikel Baru"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isEditMode ? "Perbarui konten artikel Anda." : "Buat konten menarik untuk pembaca."}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="form-control">
                        <label className="label font-bold text-gray-700">Judul Artikel</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input input-bordered w-full bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 border-gray-300"
                            placeholder="Contoh: 5 Tips Karir Cemerlang di Dunia Digital"
                            required
                        />
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Halaman Target</label>
                            <select
                                name="target_page"
                                value={formData.target_page}
                                onChange={handleChange}
                                className="select select-bordered w-full bg-white text-gray-800 border-gray-300"
                            >
                                <option value="">Pilih Halaman Target</option>
                                <option value="home">Beranda</option>
                                <option value="about">Tentang Kami</option>
                                <option value="news">Berita & Artikel</option>
                                <option value="career">Karir / Lowongan</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-gray-700">Tipe Tampilan</label>
                            <select
                                name="display_type"
                                value={formData.display_type}
                                onChange={handleChange}
                                className="select select-bordered w-full bg-white text-gray-800 border-gray-300"
                            >
                                <option value="list">List Item (Standard)</option>
                                <option value="hero">Hero Section (Headline)</option>
                                <option value="card">Card Grid (Kotak Info)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="form-control">
                        <label className="label font-bold text-gray-700 flex justify-between">
                            <span>Konten Artikel</span>
                            <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">Editor Text</span>
                        </label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="textarea textarea-bordered h-96 bg-white text-gray-800 border-gray-300 focus:ring-2 focus:ring-blue-500 text-base leading-relaxed p-4"
                            placeholder="Mulai menulis artikel Anda di sini..."
                            required
                        ></textarea>
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-100">
                            <strong>Tips Format:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Gunakan enter 2x untuk paragraf baru.</li>
                                <li>Untuk judul bagian, gunakan tanda pagar (Contoh: # Judul Utama, ## Sub Judul).</li>
                                <li>Untuk list, gunakan tanda strip (Contoh: - Poin satu).</li>
                            </ul>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="form-control">
                        <label className="label font-bold text-gray-700">Gambar Cover</label>
                        <div className="flex items-start gap-6 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-input file-input-bordered w-full bg-white text-gray-600"
                                />
                                <label className="label">
                                    <span className="label-text-alt text-gray-400">Format: JPG, PNG. Max: 2MB. Disarankan rasio 16:9.</span>
                                </label>
                            </div>
                            {previewImage ? (
                                <div className="w-40 h-24 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm flex-shrink-0 relative group">
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white text-xs font-bold">Preview</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-40 h-24 rounded-lg border border-dashed border-gray-300 bg-gray-100 flex items-center justify-center text-gray-400">
                                    <span className="text-xs">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Link to="/writer/articles" className="btn btn-ghost text-gray-600 hover:bg-gray-100">
                            Batal
                        </Link>
                        <button type="submit" className={`btn btn-primary text-white shadow-lg shadow-blue-500/30 ${loading ? 'loading' : ''}`} disabled={loading}>
                            {isEditMode ? "Simpan Perubahan" : "Simpan Sebagai Draft"}
                        </button>
                    </div>
                </form>
            </div>
        </WriterLayout>
    );
};

export default WriterArticleForm;
