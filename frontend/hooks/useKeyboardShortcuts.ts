import { useEffect } from 'react';

interface KeyboardShortcutsProps {
    onSearchFocus: () => void;
    onToggleBookmarks: () => void;
    onStartQuiz: () => void;
}

export const useKeyboardShortcuts = ({
    onSearchFocus,
    onToggleBookmarks,
    onStartQuiz,
}: KeyboardShortcutsProps) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Search: Ctrl/Cmd + K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onSearchFocus();
            }

            // Bookmarks: Ctrl/Cmd + B
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                onToggleBookmarks();
            }

            // Quiz: Ctrl/Cmd + Q
            if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
                e.preventDefault();
                onStartQuiz();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSearchFocus, onToggleBookmarks, onStartQuiz]);
};
