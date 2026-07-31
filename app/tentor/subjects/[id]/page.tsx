"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit2, Trash2, Folder, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { get, post, put, drop } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";
import { toast } from "react-toastify";

export default function TentorModuleManagementPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const [modules, setModules] = useState<any[]>([]);
    const [subjectName, setSubjectName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingModule, setEditingModule] = useState<any>(null);
    const [formData, setFormData] = useState({ module_name: "", description: "", order_index: 0 });

    const fetchModules = async () => {
        setIsLoading(true);
        try {
            const token = getCookie("token") as string;
            const res = await get(`${BASE_API_URL}/module/subject/${id}`, token);
            if (res.data?.success) {
                setModules(res.data.data.modules || []);
                setSubjectName(res.data.data.subject_name);
            }
        } catch (error) {
            console.error("Failed to fetch modules", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchModules();
    }, [id]);

    const handleOpenModal = (mod?: any) => {
        if (mod) {
            setEditingModule(mod);
            setFormData({ module_name: mod.module_name, description: mod.description || "", order_index: mod.order_index });
        } else {
            setEditingModule(null);
            setFormData({ module_name: "", description: "", order_index: modules.length });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingModule(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = getCookie("token") as string;
        setIsSubmitting(true);
        try {
            if (editingModule) {
                const res = await put(`${BASE_API_URL}/module/update/${editingModule.uuid}`, formData, token);
                if (res.data?.success) {
                    toast.success("Module berhasil diupdate");
                    fetchModules();
                    handleCloseModal();
                } else {
                    toast.error(res.data?.message || "Failed to update module");
                }
            } else {
                const res = await post(`${BASE_API_URL}/module/add`, { subjectUuid: id, ...formData }, token);
                if (res.data?.success) {
                    toast.success("Module berhasil dibuat");
                    fetchModules();
                    handleCloseModal();
                } else {
                    toast.error(res.data?.message || "Failed to create module");
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (uuid: string) => {
        if (!confirm("Hapus module ini? Kuis di dalamnya mungkin menjadi yatim piatu atau tersembunyi.")) return;
        const token = getCookie("token") as string;
        try {
            const res = await drop(`${BASE_API_URL}/module/delete/${uuid}`, token);
            if (res.data?.success) {
                toast.success("Module deleted!");
                fetchModules();
            } else {
                toast.error(res.data?.message || "Failed to delete module");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "An error occurred");
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">
            <Link href="/tentor/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft size={16} /> Kembali ke Dashboard
            </Link>

            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Manajemen Modul</p>
                    <h1 className="text-2xl font-bold text-slate-900">{subjectName}</h1>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Create Module
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((mod) => (
                    <div key={mod.uuid} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Folder size={20} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(mod)} className="text-slate-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(mod.uuid)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{mod.module_name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{mod.description || "Tidak ada deskripsi."}</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                                <BookOpen size={15} className="text-slate-400" /> {mod.total_quiz} Quiz
                            </span>
                            <span className="text-slate-500 font-medium text-xs">
                                Order : {mod.order_index}
                            </span>
                        </div>
                    </div>
                ))}
                {modules.length === 0 && (
                    <div className="col-span-full py-16 text-center text-slate-400 bg-white border border-slate-200 border-dashed rounded-2xl">
                        <Folder size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium text-slate-500 mb-1">Belum ada module.</p>
                        <p className="text-sm">Klik "Create Module" untuk membuat module pertama.</p>
                    </div>
                )}
            </div>

            {/* Slide-over Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={handleCloseModal} />
                    <div className="relative w-full max-w-sm h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">{editingModule ? "Edit Module" : "Create Module"}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Module Name</label>
                                <input
                                    required
                                    value={formData.module_name}
                                    onChange={(e) => setFormData({ ...formData, module_name: e.target.value })}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Order</label>
                                <input
                                    type="number"
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                />
                            </div>
                            <div className="pt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 h-10 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-10 bg-[#111827] text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            {editingModule ? "Saving..." : "Creating..."}
                                        </>
                                    ) : (
                                        editingModule ? "Save Changes" : "Create Module"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
