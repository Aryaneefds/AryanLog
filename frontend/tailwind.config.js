/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                serif: ['Newsreader', 'Georgia', 'serif'],
                sans: ['Inter', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            fontSize: {
                'body': '1.3125rem', // 21px
            },
            lineHeight: {
                'relaxed': '1.7',
                'loose': '1.9',
            },
            maxWidth: {
                'content': '42rem',  // ~680px
                'wide': '56rem',     // ~896px
            },
            spacing: {
                'rhythm': '1.7rem',
            },
            colors: {
                bg: {
                    DEFAULT: 'var(--color-bg)',
                    subtle: 'var(--color-bg-subtle)',
                },
                text: {
                    DEFAULT: 'var(--color-text)',
                    muted: 'var(--color-text-muted)',
                    faint: 'var(--color-text-faint)',
                },
                accent: 'var(--color-accent)',
                border: 'var(--color-border)',
            },
            typography: {
                DEFAULT: {
                    css: {
                        '--tw-prose-body': 'var(--color-text)',
                        '--tw-prose-headings': 'var(--color-text)',
                        '--tw-prose-links': 'var(--color-accent)',
                        '--tw-prose-code': 'var(--color-text)',
                        '--tw-prose-quotes': 'var(--color-text-muted)',
                        fontSize: '1.3125rem',
                        lineHeight: '1.7',
                        maxWidth: '42rem',
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
