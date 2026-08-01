import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

export interface PaginationData {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface PaginationProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ pagination, onPageChange }: PaginationProps) => {
    if (pagination.totalPages <= 1) return null;

    const { page, totalPages, totalItems, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, totalItems);

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                        i === page
                            ? "bg-[#1D61D2] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <span className="text-sm text-gray-500 mb-4 sm:mb-0">
                Showing <span className="font-semibold text-gray-700">{startItem}</span> to <span className="font-semibold text-gray-700">{endItem}</span> of <span className="font-semibold text-gray-700">{totalItems}</span> entries
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={!pagination.hasPrevious}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                </button>
                
                <div className="flex items-center gap-1 px-2">
                    {renderPageNumbers()}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
