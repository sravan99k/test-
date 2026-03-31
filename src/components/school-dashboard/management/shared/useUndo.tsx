import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export interface UndoAction {
    id: string;
    action: string;
    data: any;
    timestamp: number;
    expiresAt: number;
}

export function useUndo(duration: number = 30000) {
    const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
    const { toast } = useToast();

    const addUndoAction = useCallback((
        action: string,
        data: any,
        onUndo: () => Promise<void>
    ) => {
        const id = `undo-${Date.now()}-${Math.random()}`;
        const expiresAt = Date.now() + duration;

        const undoAction: UndoAction = {
            id,
            action,
            data,
            timestamp: Date.now(),
            expiresAt,
        };

        setUndoStack(prev => [...prev, undoAction]);

        // Auto-remove after duration
        setTimeout(() => {
            setUndoStack(prev => prev.filter(item => item.id !== id));
        }, duration);

        // Show toast with undo button
        toast({
            title: action,
            description: `Action completed successfully`,
            action: (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                        await onUndo();
                        setUndoStack(prev => prev.filter(item => item.id !== id));
                        toast({
                            title: 'Undone',
                            description: 'Action has been reversed',
                        });
                    }}
                >
                    Undo
                </Button>
            ),
            duration,
        });

        return id;
    }, [duration, toast]);

    const clearUndo = useCallback((id: string) => {
        setUndoStack(prev => prev.filter(item => item.id !== id));
    }, []);

    return {
        addUndoAction,
        clearUndo,
        undoStack,
    };
}
