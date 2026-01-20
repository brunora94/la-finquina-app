/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                nature: {
                    50: '#f2fcf2',
                    100: '#e1f8e1',
                    200: '#c3efc3',
                    300: '#94e094',
                    400: '#5cc75c',
                    500: '#32ad32',
                    600: '#248a24',
                    700: '#1e6e1e',
                    800: '#1b571b',
                    900: '#174817',
                    950: '#0a270a',
                },
                earth: {
                    50: '#fbf7f4',
                    100: '#f5efe9',
                    200: '#eddfd2',
                    300: '#dfbf9e',
                    400: '#d09e6f',
                    500: '#c5824b',
                    600: '#b8673d',
                    700: '#995033',
                    800: '#7d422e',
                    900: '#653729',
                    950: '#361b14',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
