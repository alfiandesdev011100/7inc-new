import React from "react";
import { createPortal } from "react-dom";

const ArticlePreviewModal = ({ isOpen, onClose, article }) => {
    if (!isOpen || !article) return null;

    // Handle different schemas (Article uses 'image_url', News uses 'cover_url')
    const imageUrl = article.image_url || article.cover_url;

    // Handle different content field names
    const content = article.content || article.body || "";

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate__animated animate__fadeInUp animate__faster">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <i className="ri-eye-line text-xl"></i>
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 leading-none">Preview Artikel</h2>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Tampilan Review Konten</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 bg-white">
                    <div className="max-w-3xl mx-auto">
                        {/* Title Section */}
                        <div className="mb-8">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4 uppercase tracking-widest">
                                {article.target_page || "General Content"}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">
                                {article.title}
                            </h1>
                        </div>

                        {/* Author Meta */}
                        <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                    {(article.author?.name || article.author || "A").charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-none">{article.author?.name || article.author || "Administrator"}</p>
                                    <p className="text-[11px] text-gray-400 font-medium">Penulis Artikel</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <i className="ri-calendar-event-line text-lg text-blue-500"></i>
                                <span className="text-sm font-medium">
                                    {new Date(article.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <i className="ri-time-line text-lg text-blue-500"></i>
                                <span className="text-sm font-medium">
                                    {new Date(article.created_at || new Date()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {imageUrl && (
                            <div className="mb-12 group">
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
                                    <img
                                        src={imageUrl}
                                        alt={article.title}
                                        className="w-full h-auto object-cover max-h-[500px] transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.parentElement.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                </div>
                                <p className="text-center text-xs text-gray-400 mt-4 italic">Gambar sampul artikel</p>
                            </div>
                        )}

                        {/* Main Content Body */}
                        <div className="prose prose-lg max-w-none">
                            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap font-serif">
                                {content}
                            </div>
                        </div>

                        {/* Tags / Display Info */}
                        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold border border-gray-100 flex items-center gap-2">
                                <i className="ri-layout-line"></i> Tampilan: {article.display_type || "N/A"}
                            </span>
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold border border-gray-100 flex items-center gap-2">
                                <i className="ri-check-double-line"></i> Status: <span className="capitalize">{article.status}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-5 border-t bg-gray-50 flex justify-between items-center sm:px-10">
                    <p className="text-xs text-gray-400 font-medium hidden md:block">
                        &copy; 2026 Seven Inc. Content Management System
                    </p>
                    <button
                        onClick={onClose}
                        className="btn btn-primary px-10 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        Tutup Review
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ArticlePreviewModal;
