import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../layouts/AdminLayout";
import NewsFormModal from "./components/NewsFormModal";
import DeleteModal from "./components/DeleteModal";

const NewsIndex = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Menggunakan endpoint /admin/news yang baru kita buat (mengembalikan semua data termasuk draft)
      const res = await axios.get(
        `http://127.0.0.1:8000/api/admin/news?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      // Sesuaikan dengan struktur response adminIndex di controller
      setNews(res.data.data.list);
      setTotalPages(res.data.data.meta.last_page);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage]);

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

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Berita & Artikel</h1>
          <p className="text-gray-500 text-sm">
            Kelola berita, blog, dan artikel perusahaan.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
        >
          <i className="ri-add-line mr-2 text-lg"></i> Tulis Berita Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="loading loading-spinner loading-lg text-blue-600"></span>
            <p className="mt-2 text-gray-400">Memuat berita...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <i className="ri-article-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-700">
              Belum ada berita
            </h3>
            <p className="text-gray-500 mb-6">
              Mulai tulis berita pertama Anda sekarang.
            </p>
            <button
              onClick={handleAdd}
              className="btn btn-outline btn-primary btn-sm"
            >
              Tulis Berita
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full align-middle">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="w-24">Cover</th>
                  <th>Judul & Info</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td>
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 relative">
                        {item.cover_url ? (
                          <img
                            src={item.cover_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <i className="ri-image-line text-2xl"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded">
                          <i className="ri-user-line"></i>{" "}
                          {item.author || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>{" "}
                          {new Date(item.updated_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      {item.is_published ? (
                        <div className="badge badge-success badge-sm text-white gap-1 pl-1 pr-2">
                          <i className="ri-check-line"></i> Published
                        </div>
                      ) : (
                        <div className="badge badge-warning badge-sm text-white gap-1 pl-1 pr-2">
                          <i className="ri-draft-line"></i> Draft
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-sm btn-square btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
                          data-tip="Edit Berita"
                        >
                          <i className="ri-pencil-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn btn-sm btn-square btn-ghost text-red-600 hover:bg-red-50 tooltip"
                          data-tip="Hapus Berita"
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
      />
    </AdminLayout>
  );
};

export default NewsIndex;
