/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#09090B',
                surface: '#18181B',
                'surface-elevated': '#27272A',
                border: '#3F3F46',
                'text-primary': '#FAFAFA',
                'text-secondary': '#A1A1AA',
                accent: {
                    green: '#22C55E',
                    purple: '#A855F7',
                    blue: '#3B82F6',
                },
                shadow: {
                    dark: '#09090B',
                    light: '#27272A',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'glow': 'glow 2s ease-in-out infinite alternate',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            },
        },
    },
    plugins: [],
}
