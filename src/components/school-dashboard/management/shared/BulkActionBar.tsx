import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2, UserPlus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkAction {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    requiresConfirmation?: boolean;
}

export interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    actions: BulkAction[];
    className?: string;
}

export function BulkActionBar({
    selectedCount,
    onClearSelection,
    actions,
    className,
}: BulkActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div
            className={cn(
                'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
                'bg-white border border-gray-200 rounded-lg shadow-lg',
                'px-6 py-4 flex items-center gap-4',
                'animate-in slide-in-from-bottom-5 duration-200',
                className
            )}
        >
            {/* Selection count */}
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                    {selectedCount}
                </div>
                <span className="text-sm font-medium text-gray-700">
                    {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                </span>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200" />

            {/* Actions */}
            <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={action.onClick}
                        className="flex items-center gap-2"
                    >
                        {action.icon}
                        {action.label}
                    </Button>
                ))}
            </div>

            {/* Clear selection */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="ml-2"
            >
                <X className="h-4 w-4" />
                Clear
            </Button>
        </div>
    );
}
