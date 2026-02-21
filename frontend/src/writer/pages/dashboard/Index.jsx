import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import WriterLayout from "../../layouts/WriterLayout";
import { Link } from "react-router-dom";

const WriterDashboard = () => {
    const [stats, setStats] = useState({
        pendingTasks: 0,
        draftArticles: 0,
        pendingArticles: 0,
        publishedArticles: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const userName = localStorage.getItem("adminName") || "Writer";

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch Tasks & Articles menggunakan instance central api
                const [tasksRes, articlesRes] = await Promise.all([
                    api.get("/admin/tasks"),
                    api.get("/admin/articles/my-articles")
                ]);

                if (tasksRes.data.status && articlesRes.data.status) {
                    const tasks = tasksRes.data.data.data || tasksRes.data.data;
                    const articles = articlesRes.data.data;

                    setStats({
                        pendingTasks: tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length,
                        draftArticles: articles.filter(a => a.status === 'draft').length,
                        pendingArticles: articles.filter(a => a.status === 'pending').length,
                        publishedArticles: articles.filter(a => a.status === 'published').length
                    });

                    setRecentTasks(tasks.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <WriterLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    Halo, {userName} 👋
                </h1>
                <p className="text-gray-500 mt-1">
                    Selamat datang kembali! Berikut adalah ringkasan aktivitasmu hari ini.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 mr-4">
                        <i className="ri-task-line text-2xl"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tugas Pending</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.pendingTasks}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 mr-4">
                        <i className="ri-edit-line text-2xl"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Draft Artikel</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.draftArticles}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mr-4">
                        <i className="ri-time-line text-2xl"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Menunggu Review</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.pendingArticles}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mr-4">
                        <i className="ri-article-line text-2xl"></i>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Artikel Terbit</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.publishedArticles}</h3>
                    </div>
                </div>
            </div>

            {/* Content & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Tasks */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Tugas Terbaru</h3>
                            <Link to="/writer/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {recentTasks.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Belum ada tugas yang diberikan.
                                </div>
                            ) : (
                                recentTasks.map((task) => (
                                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 text-sm mb-1">{task.title}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                                            </div>
                                            <span className={`badge text-xs ${task.status === 'completed' ? 'badge-success text-white' : 'badge-warning text-white'}`}>
                                                {task.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <i className="ri-calendar-line mr-1"></i>
                                                Deadline: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <i className="ri-layout-line mr-1"></i>
                                                {task.target_page}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white mb-6">
                        <h3 className="font-bold text-lg mb-2">Siap menulis konten hebat?</h3>
                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                            Mulai tulis artikel baru atau lanjutkan draft artikelmu yang belum selesai.
                        </p>
                        <Link
                            to="/writer/articles/create"
                            className="block w-full py-3 bg-white text-blue-600 font-bold text-center rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            + Buat Artikel Baru
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 text-sm mb-4">Panduan Singkat</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start">
                                <i className="ri-checkbox-circle-fill text-green-500 mt-0.5 mr-2"></i>
                                Pastikan konten orisinal dan unik.
                            </li>
                            <li className="flex items-start">
                                <i className="ri-checkbox-circle-fill text-green-500 mt-0.5 mr-2"></i>
                                Gunakan gambar berkualitas tinggi.
                            </li>
                            <li className="flex items-start">
                                <i className="ri-checkbox-circle-fill text-green-500 mt-0.5 mr-2"></i>
                                Periksa ejaan sebelum submit.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </WriterLayout>
    );
};

export default WriterDashboard;
