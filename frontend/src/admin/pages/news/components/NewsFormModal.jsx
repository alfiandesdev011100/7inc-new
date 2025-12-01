import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const NewsFormModal = ({ isOpen, onClose, onSuccess, dataToEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    body: "",
    author: "",
    is_published: false,
    cover: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset atau Isi Data saat Modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (dataToEdit) {
        setFormData({
          title: dataToEdit.title,
          excerpt: dataToEdit.excerpt || "",
          body: dataToEdit.body || "",
          author: dataToEdit.author || "",
          is_published: !!dataToEdit.is_published,
          cover: null,
        });
        setPreviewImage(dataToEdit.cover_url);
      } else {
        setFormData({
          title: "",
          excerpt: "",
          body: "",
          author: "",
          is_published: false,
          cover: null,
        });
        setPreviewImage(null);
      }
    }
  }, [isOpen, dataToEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, cover: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("excerpt", formData.excerpt);
    payload.append("body", formData.body);
    payload.append("author", formData.author);
    // Kirim "1" atau "0" string agar FormData bisa menerimanya dengan baik
    payload.append("is_published", formData.is_published ? "1" : "0");

    if (formData.cover) {
      payload.append("cover", formData.cover);
    }

    // Trik Laravel: Jika update dan ada file, gunakan POST dengan _method PATCH
    if (dataToEdit) {
      payload.append("_method", "PATCH");
    }

    try {
      const url = dataToEdit
        ? `${API_BASE}/admin/news/${dataToEdit.slug}`
        : `${API_BASE}/admin/news`;

      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving news:", error);
      const msg = error.response?.data?.message || "Gagal menyimpan berita.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 p-0 animate__animated animate__fadeInDown flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            {dataToEdit ? "Edit Berita" : "Tulis Berita Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1">
          <form
            id="news-form"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* KOLOM KIRI: Konten Utama */}
            <div className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Judul Berita <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full font-semibold text-lg"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Masukkan judul yang menarik..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Isi Berita (Body) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  className="textarea textarea-bordered w-full h-80 font-mono text-sm leading-relaxed"
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  placeholder="Tulis konten lengkap berita di sini..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Ringkasan (Excerpt)
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Ringkasan singkat untuk ditampilkan di kartu berita..."
                ></textarea>
              </div>
            </div>

            {/* KOLOM KANAN: Sidebar Settings */}
            <div className="space-y-6">
              {/* Upload Gambar */}
              <div className="form-control w-full">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gambar Sampul
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:border-blue-500 transition bg-gray-50 relative overflow-hidden group">
                  {previewImage ? (
                    <>
                      <img
                        src={previewImage}
                        alt="Cover"
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                        <span className="text-white text-sm font-medium">
                          <i className="ri-upload-2-line mr-1"></i> Ganti Gambar
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-gray-400">
                      <i className="ri-image-add-line text-4xl block mb-2"></i>
                      <span className="text-xs">
                        Klik untuk upload (JPG/PNG)
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Penulis */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Penulis
                </label>
                <div className="relative">
                  <i className="ri-user-line absolute left-3 top-3 text-gray-400"></i>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Nama Penulis"
                  />
                </div>
              </div>

              {/* Status Publish */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-800">
                    Status Publikasi
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_published: e.target.checked,
                      })
                    }
                  />
                </div>
                <p className="text-xs text-blue-600">
                  {formData.is_published
                    ? "Berita akan TAMPIL di website publik."
                    : "Berita tersimpan sebagai DRAFT (tersembunyi)."}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-gray-600"
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            form="news-form"
            disabled={loading}
            className="btn btn-primary px-8 text-white shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>{" "}
                Menyimpan...
              </>
            ) : (
              <>
                <i className="ri-save-line mr-2"></i> Simpan Berita
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NewsFormModal;
