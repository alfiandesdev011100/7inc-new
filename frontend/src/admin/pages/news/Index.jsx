import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import NewsFormModal from "./components/NewsFormModal";
import DeleteModal from "./components/DeleteModal";
import TaskList from "../tasks/TaskList";
import ArticlePreviewModal from "../../../components/ArticlePreviewModal";

const NewsIndex = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Menggunakan endpoint /admin/news yang baru kita buat
      let url = `/admin/articles?page=${currentPage}`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const res = await api.get(url);
      if (res.data.status && res.data.data) {
        // Handle both paginated and non-paginated data defensively
        const newsData = res.data.data.data || res.data.data;
        setNews(Array.isArray(newsData) ? newsData : []);
        setTotalPages(res.data.data.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage, filterStatus]);

  // Handlers
  const handleAdd = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };
  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const handlePreview = (article) => {
    setSelectedArticle(article);
    setIsPreviewOpen(true);
  };

  // Actions Workflow
  const handleAction = async (id, action) => {
    if (!window.confirm(`Yakin ingin ${action} artikel ini?`)) return;

    try {
      await api.post(`/admin/articles/${id}/${action}`);
      fetchNews();
    } catch (error) {
      alert("Gagal memproses aksi.");
    }
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'published': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">Published</span>;
      case 'draft': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">Draft</span>;
      case 'pending': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse">Pending Review</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">Rejected</span>;
      default: return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">{status}</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Berita & Artikel</h1>
          <p className="text-gray-500 text-sm">
            Kelola konten, review artikel writer, dan publikasi.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
          >
            <i className="ri-add-line mr-2 text-lg"></i> Tulis Berita
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto space-x-1 mb-6 bg-white p-1 rounded-lg border border-gray-100 shadow-sm w-fit">
        {['all', 'published', 'pending', 'draft', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-all ${filterStatus === status
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
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
        ) : news.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <i className="ri-file-list-line text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-700">
              Tidak ada artikel ditemukan
            </h3>
            <p className="text-gray-500 text-sm">
              Coba ganti filter atau buat artikel baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full align-middle">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="w-16">#</th>
                  <th>Judul & Penulis</th>
                  <th className="text-center">Status</th>
                  <th className="text-center w-40">Review Action</th>
                  <th className="text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="text-center text-gray-400 font-medium">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td>
                      <div className="font-bold text-gray-800 text-base mb-1 line-clamp-1 max-w-sm">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                          <i className="ri-user-line"></i>{" "}
                          {item.author?.name || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>{" "}
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-center">
                      {item.status === 'pending' && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(item.id, 'approve')}
                            className="btn btn-xs btn-success text-white"
                            title="Teruskan ke Halaman">
                            <i className="ri-check-line"></i>
                          </button>
                          <button
                            onClick={() => handleAction(item.id, 'reject')}
                            className="btn btn-xs btn-error text-white"
                            title="Reject">
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}
                      {item.status === 'approved' && (
                        <div className="flex flex-col items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 py-1 px-2 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-1">
                            <i className="ri-send-plane-fill"></i>
                            <span>TERKIRIM KE:</span>
                          </div>
                          <span className="uppercase text-blue-800">
                            {item.target_page === 'about' ? 'Tentang Kami' :
                              item.target_page === 'bisnis-kami' ? 'Bisnis Kami' :
                                item.target_page === 'home' ? 'Beranda' :
                                  item.target_page === 'internship' ? 'Internship' :
                                    item.target_page === 'lowongan-kerja' ? 'Karir' :
                                      item.target_page || 'Halaman'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handlePreview(item)}
                          className="btn btn-sm btn-square btn-ghost text-teal-600 hover:bg-teal-50 tooltip"
                          data-tip="Preview Artikel"
                        >
                          <i className="ri-eye-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-sm btn-square btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
                          data-tip="Edit"
                        >
                          <i className="ri-pencil-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn btn-sm btn-square btn-ghost text-red-600 hover:bg-red-50 tooltip"
                          data-tip="Hapus"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-center border-t border-gray-100 bg-gray-50/50">
            <div className="join shadow-sm bg-white">
              <button
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => c - 1)}
              >
                «
              </button>
              <button className="join-item btn btn-sm bg-white pointer-events-none border-t border-b">
                Halaman {currentPage} dari {totalPages}
              </button>
              <button
                className="join-item btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((c) => c + 1)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewsFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchNews}
        dataToEdit={selectedItem}
      />
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={fetchNews}
        dataToDelete={selectedItem}
        endpoint="/admin/articles"
      />

      {/* 🔹 TUGAS WRITER SECTION */}
      <div className="my-8 border-t border-gray-200"></div>
      <TaskList />

      <ArticlePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        article={selectedArticle}
      />
    </AdminLayout>
  );
};

export default NewsIndex;
