import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import WriterLayout from "../../layouts/WriterLayout";
import { Link } from "react-router-dom";
import ArticlePreviewModal from "../../../components/ArticlePreviewModal";

const WriterArticlesIndex = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/articles/my-articles");
            if (res.data.status) {
                setArticles(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const filteredArticles = filterStatus === "all"
        ? articles
        : articles.filter(article => article.status === filterStatus);

    const handlePreview = (article) => {
        setSelectedArticle(article);
        setIsPreviewOpen(true);
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Yakin ingin ${action === 'submit' ? 'mengirim' : action} artikel ini?`)) return;

        try {
            await api.post(`/admin/articles/${id}/${action}`);
            fetchArticles();
        } catch (error) {
            alert("Gagal memproses aksi.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft': return <span className="badge badge-ghost">Draft</span>;
            case 'pending': return <span className="badge badge-warning text-white">Pending Review</span>;
            case 'approved': return <span className="badge badge-info text-white">Approved</span>;
            case 'published': return <span className="badge badge-success text-white">Published</span>;
            case 'rejected': return <span className="badge badge-error text-white">Rejected</span>;
            default: return <span className="badge badge-ghost">{status}</span>;
        }
    };

    return (
        <WriterLayout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Artikel Saya</h1>
                    <p className="text-gray-500 text-sm">
                        Kelola semua artikel yang telah Anda buat.
                    </p>
                </div>
                <Link
                    to="/writer/articles/create"
                    className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
                >
                    <i className="ri-edit-circle-line mr-2 text-lg"></i> Tulis Artikel
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'draft', 'pending', 'published', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`btn btn-sm capitalize ${filterStatus === status ? 'btn-neutral' : 'btn-ghost bg-white'}`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-2 text-gray-400">Memuat artikel...</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <i className="ri-file-text-line text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Belum ada artikel</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {filterStatus === 'all'
                                ? "Anda belum membuat artikel apapun."
                                : `Tidak ada artikel dengan status "${filterStatus}".`}
                        </p>
                        {filterStatus === 'all' && (
                            <Link to="/writer/articles/create" className="btn btn-link btn-sm text-blue-600">
                                Mulai Menulis Sekarang
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-12">#</th>
                                    <th className="w-20">Cover</th>
                                    <th>Judul Artikel</th>
                                    <th>Target Page</th>
                                    <th>Status</th>
                                    <th>Terakhir Update</th>
                                    <th className="text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredArticles.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-gray-400 text-center">{index + 1}</td>
                                        <td>
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="cover" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <i className="ri-image-line"></i>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-bold text-gray-800 line-clamp-2">{item.title}</div>
                                            {item.rejection_reason && item.status === 'rejected' && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    <i className="ri-error-warning-line mr-1"></i>
                                                    Alasan: {item.rejection_reason}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-outline text-xs">{item.target_page || "-"}</span>
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td className="text-xs text-gray-500">
                                            {new Date(item.updated_at).toLocaleDateString()}
                                            <div className="text-[10px] text-gray-400">{new Date(item.updated_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td>
                                            {/* Actions block */}
                                            <div className="flex justify-center gap-1">
                                                {/* Preview Button */}
                                                <button
                                                    onClick={() => handlePreview(item)}
                                                    className="btn btn-sm btn-square btn-ghost text-teal-600 hover:bg-teal-50 tooltip"
                                                    data-tip="Preview Artikel"
                                                >
                                                    <i className="ri-eye-line text-lg"></i>
                                                </button>

                                                {/* Submit button (Kirim ke Admin) - Only for Draft/Rejected */}
                                                {(item.status === 'draft' || item.status === 'rejected') && (
                                                    <button
                                                        onClick={() => handleAction(item.id, 'submit')}
                                                        className="btn btn-sm btn-ghost text-green-600 hover:bg-green-50 tooltip"
                                                        data-tip="Kirim ke Admin"
                                                    >
                                                        <i className="ri-send-plane-2-line text-lg"></i>
                                                    </button>
                                                )}

                                                <Link
                                                    to={`/writer/articles/edit/${item.id}`}
                                                    className="btn btn-sm btn-square btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
                                                    data-tip="Edit"
                                                >
                                                    <i className="ri-pencil-line text-lg"></i>
                                                </Link>

                                                {/* Only show delete for Draft/Rejected */}
                                                {(item.status === 'draft' || item.status === 'rejected') && (
                                                    <button
                                                        className="btn btn-sm btn-square btn-ghost text-red-600 hover:bg-red-50 tooltip"
                                                        data-tip="Hapus"
                                                        onClick={() => {
                                                            if (window.confirm("Yakin hapus artikel ini?")) {
                                                                api.delete(`/admin/articles/${item.id}`)
                                                                    .then(() => fetchArticles())
                                                                    .catch(err => alert("Gagal menghapus: " + (err.response?.data?.message || "Error")));
                                                            }
                                                        }}
                                                    >
                                                        <i className="ri-delete-bin-line text-lg"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ArticlePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                article={selectedArticle}
            />
        </WriterLayout>
    );
};

export default WriterArticlesIndex;
