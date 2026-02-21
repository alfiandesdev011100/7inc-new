import React, { useEffect, useState, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";

const AdminLandingPage = () => {
    const [stats, setStats] = useState({
        applicants: 0,
        interns: 0,
        messages: 0,
        tasks: 0
    });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    api.get("/admin/dashboard-stats"),
                    api.get("/admin/activity-logs")
                ]);

                if (statsRes.data.status) setStats(statsRes.data.data);
                if (logsRes.data.status || logsRes.data.success) setLogs(logsRes.data.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Chart Logic ---
    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const counts = last7Days.map(date => {
            return logs.filter(log => log.created_at.startsWith(date)).length;
        });

        return {
            series: [{
                name: 'Aktivitas',
                data: counts
            }],
            options: {
                chart: {
                    type: 'area',
                    height: 350,
                    toolbar: { show: false },
                    fontFamily: 'Poppins, sans-serif'
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3 },
                colors: ['#3b82f6'],
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.45,
                        opacityTo: 0.05,
                        stops: [20, 100]
                    }
                },
                xaxis: {
                    categories: last7Days.map(d => {
                        const date = new Date(d);
                        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                    }),
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                },
                yaxis: {
                    labels: {
                        formatter: (val) => Math.floor(val)
                    }
                },
                grid: {
                    borderColor: '#f1f1f1',
                    strokeDashArray: 4
                },
                tooltip: {
                    x: { format: 'dd MMM yyyy' }
                }
            }
        };
    }, [logs]);

    const StatCard = ({ title, value, icon, color, link, linkText }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                {link && (
                    <Link to={link || "#"} className={`text-xs font-medium mt-3 inline-block ${color}`}>
                        {linkText || "Lihat Detail"} <i className="ri-arrow-right-line ml-1"></i>
                    </Link>
                )}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <i className={`${icon} text-2xl ${color}`}></i>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Selamat datang kembali di panel administrasi Seven Inc.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Pelamar Kerja"
                    value={stats.applicants}
                    icon="ri-briefcase-line"
                    color="text-blue-600"
                    link="/admin/job-applications"
                />
                <StatCard
                    title="Peserta Internship"
                    value={stats.interns}
                    icon="ri-user-star-line"
                    color="text-purple-600"
                    link="/admin/internship-applications"
                />
                <StatCard
                    title="Pesan Masuk"
                    value={stats.messages}
                    icon="ri-mail-line"
                    color="text-orange-500"
                    link="/admin/contacts"
                />
                <StatCard
                    title="Tugas Writer"
                    value={stats.tasks}
                    icon="ri-task-line"
                    color="text-emerald-500"
                    link="/admin/tasks"
                    linkText="Kelola Tugas"
                />
            </div>

            {/* Quick Actions / Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="ri-line-chart-line text-blue-500"></i>
                        Tren Aktivitas (7 Hari Terakhir)
                    </h3>
                    <div className="h-[350px] w-full">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                            </div>
                        ) : logs.length > 0 ? (
                            <ReactApexChart
                                options={chartData.options}
                                series={chartData.series}
                                type="area"
                                height={350}
                            />
                        ) : (
                            <div className="text-center py-20 text-gray-400 text-sm">
                                <i className="ri-history-line text-3xl mb-2 block"></i>
                                Belum ada aktivitas tercatat untuk divisualisasikan.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="ri-flashlight-line text-orange-500"></i>
                        Pintasan Cepat
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/admin/berita" className="p-4 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex flex-col items-center justify-center text-center gap-2 border border-blue-100 font-semibold group">
                            <i className="ri-file-add-line text-2xl group-hover:scale-110 transition-transform"></i>
                            <span className="text-sm">Tulis Artikel Baru</span>
                        </Link>
                        <Link to="/admin/berita" className="p-4 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex flex-col items-center justify-center text-center gap-2 border border-emerald-100 font-semibold group">
                            <i className="ri-newspaper-line text-2xl group-hover:scale-110 transition-transform"></i>
                            <span className="text-sm">Kelola Berita</span>
                        </Link>
                        <Link to="/admin/job-applications" className="p-4 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition flex flex-col items-center justify-center text-center gap-2 border border-purple-100 font-semibold group">
                            <i className="ri-user-add-line text-2xl group-hover:scale-110 transition-transform"></i>
                            <span className="text-sm">Input Pelamar</span>
                        </Link>
                        <Link to="/admin/profil" className="p-4 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition flex flex-col items-center justify-center text-center gap-2 border border-orange-100 font-semibold group">
                            <i className="ri-user-settings-line text-2xl group-hover:scale-110 transition-transform"></i>
                            <span className="text-sm">Edit Profil</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminLandingPage;
