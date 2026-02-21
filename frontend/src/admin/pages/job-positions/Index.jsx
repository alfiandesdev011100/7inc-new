import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
import AdminLayout from "../../layouts/AdminLayout";
import JobFormModal from "./components/JobFormModal";
import RequirementsModal from "./components/RequirementsModal";
import DeleteModal from "./components/DeleteModal";

const JobPositionsIndex = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReqOpen, setIsReqOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchPositions = async () => {
    setLoading(true);
    try {
      // Pastikan URL API backend sudah benar
      const res = await axios.get(
        `${API_BASE}/job-works?page=${currentPage}`
      );

      // Logika Pagination Laravel
      // Jika pakai paginate(), data ada di res.data.data
      setPositions(res.data.data);
      setTotalPages(res.data.last_page || 1);
    } catch (error) {
      console.error("Error fetching", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Actions Handlers
  const handleAdd = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEditInfo = (item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const navigate = useNavigate();

  // ...

  const handleManageReq = (item) => {
    navigate("/admin/syarat-loker", { state: { job: item } });
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Posisi Pekerjaan</h1>
          <p className="text-gray-500 text-sm">
            Kelola lowongan dan persyaratan kerja.
          </p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary text-white">
          <i className="ri-add-line mr-2"></i> Tambah Posisi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <span className="loading loading-spinner loading-lg text-blue-600"></span>
          </div>
        ) : positions.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <i className="ri-briefcase-line text-2xl"></i>
            </div>
            <p>Belum ada data posisi pekerjaan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th>No</th>
                  <th>Posisi / Judul</th>
                  <th>Perusahaan & Lokasi</th>
                  <th>Deadline</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Persyaratan</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td>{index + 1 + (currentPage - 1) * 10}</td>
                    <td className="font-bold text-gray-800">{item.title}</td>
                    <td>
                      <div className="text-sm font-semibold">
                        {item.company}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.location}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost text-xs whitespace-nowrap">
                        {item.close_date}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className={`badge ${item.is_active ? 'badge-success text-white' : 'badge-ghost text-gray-400'} text-xs`}>
                        {item.is_active ? 'Aktif' : 'Non-Aktif'}
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleManageReq(item)}
                        className="btn btn-sm btn-outline btn-accent"
                      >
                        <i className="ri-list-check mr-1"></i> Atur Syarat
                      </button>
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditInfo(item)}
                          className="btn btn-sm btn-square btn-ghost text-yellow-600 tooltip"
                          data-tip="Edit Info Dasar"
                        >
                          <i className="ri-pencil-line text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="btn btn-sm btn-square btn-ghost text-red-600 tooltip"
                          data-tip="Hapus Posisi"
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
          <div className="p-4 flex justify-center border-t border-gray-100">
            <div className="join">
              <button
                className="join-item btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((c) => c - 1)}
              >
                «
              </button>
              <button className="join-item btn btn-sm bg-white pointer-events-none">
                Page {currentPage}
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
      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchPositions}
        dataToEdit={selectedItem}
      />

      <RequirementsModal
        isOpen={isReqOpen}
        onClose={() => setIsReqOpen(false)}
        jobData={selectedItem}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={fetchPositions}
        dataToDelete={selectedItem}
      />
    </AdminLayout>
  );
};

// --- INI BAGIAN PENTING YANG TADI MUNGKIN HILANG ---
export default JobPositionsIndex;
