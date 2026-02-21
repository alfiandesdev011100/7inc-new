import React from "react";

const Dashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Artikel</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">12</h3>
                    </div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <i className="ri-article-line text-xl"></i>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Draft</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">3</h3>
                    </div>
                    <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                        <i className="ri-draft-line text-xl"></i>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Pending Review</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">2</h3>
                    </div>
                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <i className="ri-time-line text-xl"></i>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Published</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">7</h3>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <i className="ri-check-double-line text-xl"></i>
                    </div>
                </div>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Aktivitas Terakhir</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <i className="ri-edit-line"></i>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 text-sm">Menulis artikel baru "Tips Frontend 2026"</h4>
                                <p className="text-xs text-gray-500">2 jam yang lalu</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <i className="ri-send-plane-line"></i>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 text-sm">Submit artikel "Laravel 12 Authentication" untuk review</h4>
                                <p className="text-xs text-gray-500">5 jam yang lalu</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
