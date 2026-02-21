import React, { useState, useEffect, useCallback } from "react";
import api from "../../api/axios";
import ArticlePreviewModal from "../../components/ArticlePreviewModal";

/**
 * SectionArticlesManager
 * Component to manage articles assigned to a specific target page.
 * Displays "Ready to Publish" (Approved) and "Published" articles.
 */
const SectionArticlesManager = ({ targetPage, title = "Artikel Terkait Halaman Ini" }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all articles for this target page
            // We'll filter them on the client side for simplicity or we could add a backend filter
            const res = await api.get("/admin/articles");
            if (res.data.status && res.data.data) {
                const allData = res.data.data.data || res.data.data;
                const filtered = allData.filter(a =>
                    a.target_page === targetPage &&
                    ['approved', 'published'].includes(a.status)
                );
                setArticles(filtered);
            }
        } catch (error) {
            console.error("Error fetching section articles:", error);
        } finally {
            setLoading(false);
        }
    }, [targetPage]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleAction = async (id, action) => {
        const actionLabel = action === 'publish' ? 'mempublikasikan' : 'menjadikan draft kembali';
        if (!window.confirm(`Yakin ingin ${actionLabel} artikel ini?`)) return;

        try {
            await api.post(`/admin/articles/${id}/${action}`);
            fetchArticles();
        } catch (error) {
            alert(`Gagal ${actionLabel} artikel.`);
        }
    };

    const handlePreview = (article) => {
        setSelectedArticle(article);
        setIsPreviewOpen(true);
    };

    if (!loading && articles.length === 0) return null;

    return (
        <div className="mt-12 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <span className="loading loading-spinner text-blue-600"></span>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                    <th className="w-16 text-center">No</th>
                                    <th>Judul Artikel</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-right pr-8">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {articles.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="text-center text-gray-400 font-medium">{index + 1}</td>
                                        <td>
                                            <div className="font-bold text-gray-800 line-clamp-1">{item.title}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5">Penulis: {item.author?.name || "Admin"}</div>
                                        </td>
                                        <td className="text-center">
                                            {item.status === 'published' ? (
                                                <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700 border border-green-200">LIVE / PUBLISHED</span>
                                            ) : (
                                                <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">READY TO PUBLISH</span>
                                            )}
                                        </td>
                                        <td className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handlePreview(item)}
                                                    className="btn btn-sm btn-square btn-ghost text-teal-600 hover:bg-teal-50 tooltip"
                                                    data-tip="Preview Isi"
                                                >
                                                    <i className="ri-eye-line text-lg"></i>
                                                </button>

                                                {item.status === 'approved' ? (
                                                    <button
                                                        onClick={() => handleAction(item.id, 'publish')}
                                                        className="btn btn-sm px-4 btn-primary text-white shadow-lg shadow-blue-500/20"
                                                    >
                                                        <i className="ri-rocket-2-line mr-1 text-sm"></i>
                                                        Publish
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAction(item.id, 'approve')} // 'approve' returns it to approved/draft state
                                                        className="btn btn-sm px-4 btn-outline btn-error"
                                                    >
                                                        <i className="ri-arrow-go-back-line mr-1 text-sm"></i>
                                                        Unpublish
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ArticlePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                article={selectedArticle}
            />
        </div>
    );
};

export default SectionArticlesManager;
