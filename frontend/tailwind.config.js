/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                // Custom refined palette
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    900: '#1e3a8a',
                },
                secondary: {
                    50: '#f8fafc',
                    900: '#0f172a',
                },
                dark: {
                    bg: '#0f172a', // Slate 900
                    card: '#1e293b', // Slate 800
                    text: '#f8fafc', // Slate 50
                }
            }
        },
    },
    plugins: [],
}
