
export function useColorScheme() {
    // Always return dark theme
    return {
        colorScheme: 'dark',
        isDarkColorScheme: true,
        setColorScheme: () => { }, // No-op since we don't allow theme changes
        toggleColorScheme: () => { }, // No-op since we don't allow theme changes
    };
}
