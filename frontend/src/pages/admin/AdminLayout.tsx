import type { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import '../../styles/admin.css';

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="admin">
                <div className="admin-main">
                    <p className="muted">loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="admin">
            <header className="admin-header">
                <nav className="admin-nav">
                    <Link to="/admin" className={isActive('/admin') && location.pathname === '/admin' ? 'active' : ''}>
                        dashboard
                    </Link>
                    <Link to="/admin/posts" className={isActive('/admin/posts') ? 'active' : ''}>
                        posts
                    </Link>
                    <Link to="/admin/ideas" className={isActive('/admin/ideas') ? 'active' : ''}>
                        ideas
                    </Link>
                    <Link to="/admin/threads" className={isActive('/admin/threads') ? 'active' : ''}>
                        threads
                    </Link>
                </nav>
                <div className="admin-nav">
                    <Link to="/" style={{ marginRight: 'var(--space-3)' }}>
                        view site →
                    </Link>
                    <button onClick={logout} className="admin-btn" style={{ padding: 'var(--space-1) var(--space-2)' }}>
                        logout
                    </button>
                </div>
            </header>
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
