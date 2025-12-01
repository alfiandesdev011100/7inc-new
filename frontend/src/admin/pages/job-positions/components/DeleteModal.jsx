import { useState } from "react";
import { createPortal } from "react-dom"; // Import Portal
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

const DeleteModal = ({ isOpen, onClose, onSuccess, dataToDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!dataToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/admin/job-works/${dataToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          Accept: "application/json",
        },
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus data. Pastikan Anda memiliki akses.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // GUNAKAN createPortal DI SINI
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate__animated animate__fadeInUp">
        <div className="text-center">
          {/* Icon Tong Sampah */}
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <i className="ri-delete-bin-line text-3xl"></i>
          </div>

          <h3 className="text-xl font-bold text-gray-800">Hapus Posisi?</h3>

          <p className="text-gray-500 mt-2 mb-6">
            Anda yakin ingin menghapus posisi <br />
            <span className="font-semibold text-gray-800">
              "{dataToDelete?.title}"
            </span>
            ?
            <br />
            <span className="text-xs text-red-400 mt-1 block">
              Tindakan ini tidak dapat dibatalkan.
            </span>
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="btn btn-ghost text-gray-600"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn btn-error text-white shadow-lg shadow-red-500/30"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>{" "}
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body // Target Render
  );
};

export default DeleteModal;
