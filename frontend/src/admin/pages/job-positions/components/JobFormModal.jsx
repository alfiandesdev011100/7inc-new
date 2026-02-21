import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // Import Portal
import axios from "axios";

const API_BASE = "import.meta.env.VITE_API_URL";

const JobFormModal = ({ isOpen, onClose, onSuccess, dataToEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    close_date: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  // Mengisi form jika mode edit
  useEffect(() => {
    if (isOpen) {
      if (dataToEdit) {
        setFormData({
          title: dataToEdit.title,
          company: dataToEdit.company,
          location: dataToEdit.location,
          close_date: dataToEdit.close_date,
          is_active: dataToEdit.is_active === 1 || dataToEdit.is_active === true,
        });
      } else {
        // Reset form jika mode tambah baru
        setFormData({ title: "", company: "", location: "", close_date: "", is_active: true });
      }
    }
  }, [isOpen, dataToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = dataToEdit
        ? `${API_BASE}/admin/job-works/${dataToEdit.id}`
        : `${API_BASE}/admin/job-works`;

      const method = dataToEdit ? "put" : "post";

      await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          Accept: "application/json",
        },
      });

      // Refresh data tabel & tutup modal
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving job:", error);
      const msg =
        error.response?.data?.message || "Gagal menyimpan data posisi.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // GUNAKAN createPortal DI SINI
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate__animated animate__fadeInDown">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {dataToEdit ? "Edit Informasi Posisi" : "Tambah Posisi Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Judul Posisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posisi / Judul
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full bg-white text-gray-800"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Contoh: UI/UX Designer"
            />
          </div>

          {/* Input Perusahaan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perusahaan
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full bg-white text-gray-800"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="Contoh: Seven Inc"
            />
          </div>

          {/* Input Lokasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full bg-white text-gray-800"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Contoh: Yogyakarta"
            />
          </div>

          {/* Input Tanggal Tutup */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Tutup
            </label>
            <input
              type="date"
              required
              className="input input-bordered w-full bg-white text-gray-800"
              value={formData.close_date}
              onChange={(e) =>
                setFormData({ ...formData, close_date: e.target.value })
              }
            />
          </div>

          {/* Status Toggle */}
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <span className="label-text font-medium text-gray-700">Status Aktif</span>
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </label>
            <span className="text-xs text-gray-500 mt-1">
              Jika tidak aktif, lowongan tidak akan muncul di halaman publik.
            </span>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-gray-600 hover:bg-gray-100"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-white shadow-lg shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>{" "}
                  Menyimpan...
                </>
              ) : (
                "Simpan Data"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body // Target Render
  );
};

export default JobFormModal;
