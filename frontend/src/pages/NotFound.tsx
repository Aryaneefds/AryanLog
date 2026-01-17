import { Link } from 'react-router-dom';

export function NotFound() {
    return (
        <main className="page">
            <Link to="/" className="back-link">← back</Link>

            <div className="mt-6">
                <h1>404</h1>
                <p className="prose muted mt-2">
                    This page doesn't exist—or perhaps it was never meant to.
                </p>
            </div>

            <hr className="divider" />

            <nav className="footer-nav">
                <Link to="/">home</Link>
                <span>·</span>
                <Link to="/archive">archive</Link>
            </nav>
        </main>
    );
}
