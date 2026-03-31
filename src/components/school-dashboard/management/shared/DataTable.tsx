import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    sortKey?: keyof T;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    selection?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    onRowClick?: (row: T) => void;
    getRowId: (row: T) => string;
    searchable?: boolean;
    searchPlaceholder?: string;
    pageSize?: number;
    emptyMessage?: React.ReactNode;
    loading?: boolean;
    className?: string;
    entityName?: string;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    selection,
    onSelectionChange,
    onRowClick,
    getRowId,
    searchable = true,
    searchPlaceholder = 'Search...',
    pageSize = 50,
    emptyMessage = 'No data found',
    loading = false,
    className,
    entityName = 'students',
}: DataTableProps<T>) {
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set(selection || []));

    // Sync external selection if provided
    useEffect(() => {
        if (selection) {
            setSelectedRows(new Set(selection));
        }
    }, [selection]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [internalPageSize, setInternalPageSize] = useState(pageSize);

    // Sync internalPageSize if prop changes
    useEffect(() => {
        setInternalPageSize(pageSize);
    }, [pageSize]);

    // Search and filter
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        return data.filter(row => {
            return Object.values(row).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [data, searchTerm]);

    // Sort
    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / internalPageSize);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * internalPageSize;
        return sortedData.slice(start, start + internalPageSize);
    }, [sortedData, currentPage, internalPageSize]);

    // Selection handlers
    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            const allIds = new Set(paginatedData.map(getRowId));
            setSelectedRows(allIds);
            onSelectionChange?.(Array.from(allIds));
        } else {
            setSelectedRows(new Set());
            onSelectionChange?.([]);
        }
    }, [paginatedData, getRowId, onSelectionChange]);

    const handleSelectRow = useCallback((id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedRows(newSelected);
        onSelectionChange?.(Array.from(newSelected));
    }, [selectedRows, onSelectionChange]);

    const handleSort = useCallback((column: keyof T) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    const getCellValue = useCallback((row: T, column: Column<T>) => {
        if (typeof column.accessor === 'function') {
            return column.accessor(row);
        }
        return row[column.accessor];
    }, []);

    const allSelected = paginatedData.length > 0 && paginatedData.every(row => selectedRows.has(getRowId(row)));

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search */}
            {searchable && (
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9"
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            {onSelectionChange && (
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                            )}
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    style={{ width: column.width }}
                                    className={cn(
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.sortable && 'cursor-pointer select-none'
                                    )}
                                    onClick={() => {
                                        if (!column.sortable) return;
                                        const key = column.sortKey || (typeof column.accessor === 'string' ? column.accessor : null);
                                        if (key) handleSort(key);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.header}</span>
                                        {column.sortable && (column.sortKey || typeof column.accessor === 'string') && (
                                            <ArrowUpDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="h-32 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="h-32 text-center text-gray-500">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row) => {
                                const rowId = getRowId(row);
                                const isSelected = selectedRows.has(rowId);

                                return (
                                    <TableRow
                                        key={rowId}
                                        className={cn(
                                            'hover:bg-gray-50 transition-colors',
                                            isSelected && 'bg-blue-50',
                                            onRowClick && 'cursor-pointer'
                                        )}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {onSelectionChange && (
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => handleSelectRow(rowId, checked as boolean)}
                                                    aria-label={`Select row ${rowId}`}
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((column, colIndex) => (
                                            <TableCell
                                                key={colIndex}
                                                className={cn(
                                                    column.align === 'center' && 'text-center',
                                                    column.align === 'right' && 'text-right'
                                                )}
                                            >
                                                {getCellValue(row, column)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {data.length > 0 && (
                <div className="flex items-center justify-between border-t p-4 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 whitespace-nowrap">Rows per page:</span>
                            <select
                                value={internalPageSize}
                                onChange={(e) => {
                                    setInternalPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="text-sm border rounded px-1 py-1 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            >
                                {[10, 20, 50, 100].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium text-gray-900">{Math.min(data.length, (currentPage - 1) * internalPageSize + 1)}</span> to{' '}
                            <span className="font-medium text-gray-900">{Math.min(data.length, currentPage * internalPageSize)}</span> of{' '}
                            <span className="font-medium text-gray-900">{data.length}</span> {entityName}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
