import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * @param {string} query - CSS media query string
 * @returns {boolean} - Whether the media query matches
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);

        // Set initial value
        setMatches(media.matches);

        // Create listener
        const listener = () => setMatches(media.matches);

        // Add listener (modern browsers)
        if (media.addEventListener) {
            media.addEventListener('change', listener);
        } else {
            // Fallback for older browsers
            media.addListener(listener);
        }

        // Cleanup
        return () => {
            if (media.removeEventListener) {
                media.removeEventListener('change', listener);
            } else {
                media.removeListener(listener);
            }
        };
    }, [query]);

    return matches;
}

/**
 * Hook to detect if viewport is mobile (max-width: 768px)
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');

/**
 * Hook to detect if viewport is tablet (max-width: 1024px)
 */
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');

/**
 * Hook to detect if viewport is desktop (min-width: 1025px)
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
