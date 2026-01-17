import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { threads as threadsApi } from '../lib/api';
import type { Thread } from '../lib/api';

export function Threads() {
    const [threadList, setThreadList] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        threadsApi.list()
            .then(data => setThreadList(data.threads as Thread[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="page">
            {/* Back link */}
            <Link to="/" className="back-link">← back</Link>

            {/* Header */}
            <header className="mt-6 mb-5">
                <h1>Thought Threads</h1>
                <p className="prose muted mt-2" style={{ fontSize: 'var(--text-base)' }}>
                    Curated journeys through connected ideas. Each thread traces how a line
                    of thinking evolved, including pivots and superseded beliefs.
                </p>
            </header>

            <hr className="divider" />

            {/* Threads list */}
            {loading ? (
                <p className="muted">Loading...</p>
            ) : threadList.length > 0 ? (
                <ul className="post-list">
                    {threadList.map(thread => (
                        <li key={thread._id} className="post-item">
                            <Link to={`/threads/${thread.slug}`} className="post-title link-underline">
                                {thread.title}
                            </Link>
                            <div className="mono text-xs muted mt-1">
                                {thread.status}
                                {thread.description && (
                                    <span> · {thread.description}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="muted">No threads yet.</p>
            )}

            <hr className="divider" />

            {/* Footer */}
            <nav className="footer-nav">
                <Link to="/">home</Link>
                <span>·</span>
                <Link to="/archive">archive</Link>
            </nav>
        </main>
    );
}
