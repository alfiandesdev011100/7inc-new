import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const MyArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await api.get("/articles/my-articles");
            if (res.data.status) {
                setArticles(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Artikel Saya</h2>
                <a href="/writer/create-article" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <i className="ri-add-line mr-2"></i>Buat Artikel
                </a>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Judul</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Tanggal</th>
                                <th className="p-4 font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length > 0 ? (
                                articles.map((article) => (
                                    <tr key={article.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-800">{article.title}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${article.status === 'published' ? 'bg-green-100 text-green-700' :
                                                article.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    article.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <button className="text-blue-600 hover:text-blue-800 mr-2">
                                                <i className="ri-edit-line"></i>
                                            </button>
                                            <button className="text-red-600 hover:text-red-800">
                                                <i className="ri-delete-bin-line"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        Belum ada artikel.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyArticles;
