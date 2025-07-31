import { create } from 'zustand';

const useThemeStore = create((set) => {
    return {
        theme: 'dark', // Default theme
        setTheme: (newTheme) => set({ theme: newTheme }), // Function to update the theme
    };
})

export default useThemeStore;