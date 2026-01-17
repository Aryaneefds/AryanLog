import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ideas as ideasApi } from '../lib/api';
import type { Idea } from '../lib/api';

export function Ideas() {
    const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ideasApi.list()
            .then(data => setAllIdeas(data.ideas))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Sort by post count descending
    const sortedIdeas = [...allIdeas].sort((a, b) => b.postCount - a.postCount);

    return (
        <main className="page">
            {/* Back link */}
            <Link to="/" className="back-link">← back</Link>

            {/* Header */}
            <header className="mt-6 mb-5">
                <h1>All Ideas</h1>
                <p className="prose muted mt-2" style={{ fontSize: 'var(--text-base)' }}>
                    Concepts that connect my thinking. Click an idea to see all related writing.
                </p>
            </header>

            <hr className="divider" />

            {/* Ideas list */}
            {loading ? (
                <p className="muted">Loading...</p>
            ) : sortedIdeas.length > 0 ? (
                <ul className="post-list">
                    {sortedIdeas.map(idea => (
                        <li key={idea._id} className="post-item">
                            <Link to={`/ideas/${idea.slug}`} className="post-title link-underline">
                                {idea.name}
                            </Link>
                            <div className="mono text-xs muted mt-1">
                                {idea.postCount} post{idea.postCount !== 1 ? 's' : ''}
                                {idea.description && (
                                    <span> · {idea.description}</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="muted">No ideas yet.</p>
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
