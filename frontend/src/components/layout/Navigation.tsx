import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDarkMode, useKeyboardShortcuts } from '../../hooks';
import { CONSTANTS } from '../../lib/constants';

export function Navigation() {
    const [theme, toggleTheme] = useDarkMode();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu on navigation
    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Keyboard shortcut for theme toggle
    useKeyboardShortcuts([
        { key: 't', metaKey: true, handler: toggleTheme },
    ]);

    const navLinks = [
        { to: '/ideas', label: 'Ideas' },
        { to: '/threads', label: 'Threads' },
        { to: '/archive', label: 'Archive' },
    ];

    return (
        <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-border/50">
            <nav className="content-width py-3 sm:py-4 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    className="font-sans font-semibold text-base sm:text-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                    onClick={closeMobileMenu}
                >
                    <span className="text-xl">🧠</span>
                    <span className="hidden sm:inline">{CONSTANTS.SITE_NAME}</span>
                    <span className="sm:hidden">PTS</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-6">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `font-sans text-sm transition-colors ${isActive ? 'text-accent font-medium' : 'text-text-muted hover:text-text'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <button
                        onClick={toggleTheme}
                        className="p-2 text-text-muted hover:text-text transition-colors rounded-lg hover:bg-bg-subtle"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (⌘T)`}
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex sm:hidden items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-text-muted hover:text-text transition-colors"
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-text-muted hover:text-text transition-colors"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden border-t border-border bg-bg animate-slide-up">
                    <div className="content-width py-4 flex flex-col gap-1">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `font-sans text-base py-3 px-4 rounded-lg transition-colors ${isActive
                                        ? 'text-accent bg-accent/10 font-medium'
                                        : 'text-text-muted hover:text-text hover:bg-bg-subtle'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
