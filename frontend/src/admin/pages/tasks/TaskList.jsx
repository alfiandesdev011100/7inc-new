import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import TaskFormModal from "./components/TaskFormModal";
import DeleteModal from "../news/components/DeleteModal";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/tasks?page=${currentPage}`);
            if (res.data.status) {
                const data = res.data.data.data ? res.data.data.data : res.data.data;
                setTasks(data);
                setTotalPages(res.data.data.last_page || 1);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [currentPage]);

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'assigned': return <span className="badge badge-warning text-white">Assigned</span>;
            case 'in_progress': return <span className="badge badge-info text-white">In Progress</span>;
            case 'submitted': return <span className="badge badge-primary text-white">Submitted</span>;
            case 'completed': return <span className="badge badge-success text-white">Completed</span>;
            default: return <span className="badge badge-ghost">Unknown</span>;
        }
    };

    return (
        <div className="mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Tugas Writer</h2>
                    <p className="text-gray-500 text-sm">
                        Kelola dan berikan tugas penulisan kepada writer.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="btn btn-outline btn-primary shadow-sm"
                >
                    <i className="ri-add-line mr-2 text-lg"></i> Buat Tugas Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                        <p className="mt-2 text-gray-400">Memuat tugas...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <i className="ri-task-line text-3xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Belum ada tugas</h3>
                        <p className="text-gray-500 text-sm">Silakan buat tugas baru untuk writer.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full align-middle">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="w-16">#</th>
                                    <th>Judul Tugas</th>
                                    <th>Target Page</th>
                                    <th>Assigned To</th>
                                    <th>Status</th>
                                    <th>Deadline</th>
                                    <th className="text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tasks.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-center text-gray-400 font-medium">
                                            {(currentPage - 1) * 10 + index + 1}
                                        </td>
                                        <td>
                                            <div className="font-bold text-gray-800 text-base">{item.title}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{item.description}</div>
                                        </td>
                                        <td>
                                            <div className="badge badge-outline text-xs">{item.target_page}</div>
                                            <div className="text-[10px] text-gray-400 mt-1">{item.display_type}</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="avatar placeholder">
                                                    <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                                                        <span className="text-xs">{item.assigned_to?.name?.charAt(0) || '?'}</span>
                                                    </div>
                                                </div>
                                                <div className="font-medium text-sm text-gray-700">
                                                    {item.writer?.name || 'Unassigned'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td className="text-sm text-gray-600">
                                            {item.due_date ? new Date(item.due_date).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td>
                                            <div className="flex justify-center gap-2">
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

            <TaskFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchTasks}
                dataToEdit={selectedItem}
            />
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onSuccess={fetchTasks}
                dataToDelete={selectedItem}
                endpoint="/api/admin/tasks"
            />
        </div>
    );
};

export default TaskList;
