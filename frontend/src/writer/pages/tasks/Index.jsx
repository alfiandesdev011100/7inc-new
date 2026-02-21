import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import WriterLayout from "../../layouts/WriterLayout";
import { Link, useNavigate } from "react-router-dom";

const WriterTaskIndex = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/tasks");
            if (res.data.status) {
                // Ensure we get the list correctly (pagination or direct)
                const data = res.data.data.data || res.data.data;
                setTasks(data);
            }
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStartWriting = (task) => {
        // Navigate to create article page with pre-filled state
        navigate("/writer/articles/create", {
            state: {
                prefilled: {
                    title: task.title,
                    target_page: task.target_page,
                    display_type: task.display_type,
                    // Note: Ideally we link task_id to article, but for now just pre-fill data
                }
            }
        });
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/admin/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            alert("Gagal update status");
        }
    };

    return (
        <WriterLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Tugas Penulisan</h1>
                <p className="text-gray-500 text-sm">
                    Daftar tugas yang diberikan oleh admin untuk dikerjakan.
                </p>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    <p className="mt-2 text-gray-400">Memuat tugas...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                        <i className="ri-task-line text-3xl"></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-700">Belum ada tugas</h3>
                    <p className="text-gray-500 text-sm">Hore! Tidak ada tugas tertunda saat ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`badge ${task.status === 'completed' ? 'badge-success text-white' : 'badge-warning text-white'}`}>
                                        {task.status === 'assigned' ? 'Baru' : task.status}
                                    </span>
                                    {task.due_date && (
                                        <div className="text-xs text-red-500 font-medium flex items-center bg-red-50 px-2 py-1 rounded">
                                            <i className="ri-alarm-warning-line mr-1"></i>
                                            {new Date(task.due_date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2" title={task.title}>
                                    {task.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {task.description}
                                </p>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="badge badge-outline text-xs">{task.target_page}</span>
                                    <span className="badge badge-outline text-xs">{task.display_type}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                {task.status !== 'completed' && (
                                    <button
                                        onClick={() => handleStartWriting(task)}
                                        className="btn btn-sm btn-primary flex-1 text-white"
                                    >
                                        <i className="ri-edit-line mr-1"></i> Tulis Artikel
                                    </button>
                                )}
                                <div className="dropdown dropdown-top dropdown-end">
                                    <label tabIndex={0} className="btn btn-sm btn-square btn-ghost">
                                        <i className="ri-more-2-fill"></i>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                        <li><a onClick={() => handleUpdateStatus(task.id, 'in_progress')}>Set In Progress</a></li>
                                        <li><a onClick={() => handleUpdateStatus(task.id, 'completed')}>Set Selesai</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </WriterLayout>
    );
};

export default WriterTaskIndex;
