import React from "react";

const AssignedTasks = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tugas dari Admin</h2>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-task-line text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Tidak ada tugas baru</h3>
                <p className="text-gray-500 mt-2">Semua tugas telah diselesaikan dengan baik.</p>
            </div>
        </div>
    );
};

export default AssignedTasks;
