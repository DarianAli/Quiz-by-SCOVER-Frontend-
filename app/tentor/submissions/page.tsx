"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, Eye } from "lucide-react";
import { get } from "@/lib/api-bridge";
import { getCookie } from "@/lib/client-cookie";
import { BASE_API_URL } from "@/global";
import { Pagination, PaginationData } from "@/components/shared/Pagination";

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface Submission {
    id: number;
    student_name: string;
    class_name: string;
    subject_name: string;
    quiz_title: string;
    score: number;
    status: string;
    submitted_at: string;
    duration: number;
}

export default function TentorSubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState("");
    const [sortValue, setSortValue] = useState("newest");

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = getCookie("token") as string;
            const url = new URL(`${BASE_API_URL}/tentor/submissions`);
            url.searchParams.append("page", page.toString());
            url.searchParams.append("limit", limit.toString());
            if (debouncedSearch) url.searchParams.append("search", debouncedSearch);
            if (statusFilter) url.searchParams.append("status", statusFilter);
            if (sortValue) url.searchParams.append("sort", sortValue);

            const res = await get(url.toString(), token);
            if (res.data?.success) {
                setSubmissions(res.data.data.data);
                setPagination(res.data.data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, debouncedSearch, statusFilter, sortValue]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter, sortValue]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "WAITING_REVIEW":
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">Menunggu Review</span>;
            case "REVIEWED":
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">Telah Direview</span>;
            case "AUTO_GRADED":
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">Selesai (Auto)</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#083E63]">Student Submissions</h1>
                    <p className="text-sm text-gray-500 mt-1">Kelola dan review hasil pekerjaan kuis/essay siswa.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col w-full animate-fade-in">
                {/* Filters */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari nama siswa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#1D61D2] focus:ring-1 focus:ring-[#1D61D2] transition-all bg-white"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none min-w-[150px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 appearance-none rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#1D61D2] focus:ring-1 focus:ring-[#1D61D2] transition-all bg-white cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="WAITING_REVIEW">Menunggu Review</option>
                                <option value="REVIEWED">Telah Direview</option>
                                <option value="AUTO_GRADED">Selesai (Auto)</option>
                            </select>
                        </div>
                        <div className="relative flex-1 sm:flex-none min-w-[150px]">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={sortValue}
                                onChange={(e) => setSortValue(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 appearance-none rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#1D61D2] focus:ring-1 focus:ring-[#1D61D2] transition-all bg-white cursor-pointer"
                            >
                                <option value="newest">Terbaru</option>
                                <option value="oldest">Terlama</option>
                                <option value="highest_score">Skor Tertinggi</option>
                                <option value="lowest_score">Skor Terendah</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject & Quiz</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-sm text-gray-500 bg-white">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-[#1D61D2] border-t-transparent rounded-full animate-spin" />
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : submissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-sm text-gray-500 bg-white">
                                        Tidak ada data yang ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-700">
                                                {new Date(sub.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {new Date(sub.submitted_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#083E63] group-hover:text-[#1D61D2] transition-colors">
                                                {sub.student_name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">{sub.class_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-700">{sub.quiz_title}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{sub.subject_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(sub.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700">
                                                {sub.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link 
                                                href={`/tentor/submissions/${sub.id}`}
                                                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-[#1D61D2] hover:bg-[#1D61D2]/10 transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <Pagination pagination={pagination} onPageChange={setPage} />
                )}
            </div>
        </div>
    );
}
