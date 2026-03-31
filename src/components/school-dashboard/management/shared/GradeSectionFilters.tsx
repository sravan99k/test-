import React from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GradeSectionFiltersProps {
    gradeCounts: Record<string, number>;
    selectedGrade: string;
    onGradeChange: (grade: string) => void;
    activeSections: string[];
    sectionCounts: Record<string, number>;
    selectedSection: string;
    onSectionChange: (section: string) => void;
    totalStudents: number;
}

export function GradeSectionFilters({
    gradeCounts,
    selectedGrade,
    onGradeChange,
    activeSections,
    sectionCounts,
    selectedSection,
    onSectionChange,
    totalStudents
}: GradeSectionFiltersProps) {
    // Sort grades numerically
    const sortedGrades = Object.keys(gradeCounts)
        .filter(g => g !== 'all' && g !== 'N/A')
        .sort((a, b) => parseInt(a) - parseInt(b));

    return (
        <div className="space-y-4 py-2">
            {/* Grades Row */}
            <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex w-max space-x-2 p-1">
                    <button
                        onClick={() => onGradeChange('all')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            selectedGrade === 'all'
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                        )}
                    >
                        All ({totalStudents})
                    </button>
                    {sortedGrades.map((grade) => (
                        <button
                            key={grade}
                            onClick={() => onGradeChange(grade)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                selectedGrade === grade
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            )}
                        >
                            Grade {grade} ({gradeCounts[grade]})
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Sections Row (Only show when a grade is selected and has sections) */}
            {selectedGrade !== 'all' && activeSections.length > 0 && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 ml-2">
                        Sections:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onSectionChange('all')}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                                selectedSection === 'all'
                                    ? "bg-gray-800 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            All Sections
                        </button>
                        {activeSections.map((section) => (
                            <button
                                key={section}
                                onClick={() => onSectionChange(section)}
                                className={cn(
                                    "px-3 py-1 rounded-md text-xs font-semibold transition-colors",
                                    selectedSection === section
                                        ? "bg-gray-800 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                Section {section} ({sectionCounts[section] || 0})
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
