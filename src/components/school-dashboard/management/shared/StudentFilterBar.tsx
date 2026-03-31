import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StudentFilterBarProps {
    searchQuery: string;
    onSearchChange: (val: string) => void;
    gradeFilter: string;
    onGradeChange: (val: string) => void;
    sectionFilter: string;
    onSectionChange: (val: string) => void;
    onClear: () => void;
}

export function StudentFilterBar({
    searchQuery,
    onSearchChange,
    gradeFilter,
    onGradeChange,
    sectionFilter,
    onSectionChange,
    onClear
}: StudentFilterBarProps) {
    const hasActiveFilters = gradeFilter !== 'all' || sectionFilter !== 'all' || searchQuery !== '';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search students..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Grade Selector */}
            <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={gradeFilter}
                onChange={(e) => onGradeChange(e.target.value)}
            >
                <option value="all">All Grades</option>
                {[...Array(12)].map((_, i) => (
                    <option key={i} value={`${i + 1}`}>Grade {i + 1}</option>
                ))}
            </select>

            {/* Section Selector */}
            <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={sectionFilter}
                onChange={(e) => onSectionChange(e.target.value)}
            >
                <option value="all">All Sections</option>
                {['A', 'B', 'C', 'D'].map(s => (
                    <option key={s} value={s}>Section {s}</option>
                ))}
            </select>

            <div>
                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={onClear}
                    >
                        Clear Filters
                    </Button>
                )}
            </div>
        </div>
    );
}
