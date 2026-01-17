import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { threads as threadsApi } from '../lib/api';

interface ThreadNode {
    postId: string;
    order: number;
    status: string;
    annotation: string;
    post: {
        title: string;
        slug: string;
        publishedAt?: string;
        readingTime: number;
    } | null;
}

interface ThreadDetail {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    status: string;
    nodes: ThreadNode[];
}

export function ThreadPage() {
    const { slug } = useParams<{ slug: string }>();
    const [thread, setThread] = useState<ThreadDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);

        threadsApi.get(slug)
            .then(data => setThread(data as ThreadDetail))
            .catch(err => setError(err.message || 'Failed to load thread'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <main className="page">
                <p className="muted">Loading...</p>
            </main>
        );
    }

    if (error || !thread) {
        return (
            <main className="page">
                <Link to="/threads" className="back-link">← all threads</Link>
                <div className="mt-6">
                    <h1>Not found</h1>
                    <p className="muted mt-2">{error || 'This thread doesn\'t exist.'}</p>
                </div>
            </main>
        );
    }

    const statusLabel = {
        foundational: '⬤',
        active: '●',
        superseded: '○',
        tangent: '◐',
    } as Record<string, string>;

    return (
        <main className="page">
            {/* Back link */}
            <Link to="/threads" className="back-link">← all threads</Link>

            {/* Header */}
            <header className="mt-5 mb-5">
                <h2 className="text-xl" style={{ fontWeight: 400 }}>
                    {thread.title}
                </h2>
                {thread.description && (
                    <p className="prose muted mt-2" style={{ fontSize: 'var(--text-base)' }}>
                        {thread.description}
                    </p>
                )}
                <p className="mono text-xs muted mt-2">
                    {thread.status} · {thread.nodes.length} posts
                </p>
            </header>

            <hr className="divider" />

            {/* Timeline legend */}
            <div className="mono text-xs muted mb-4">
                ⬤ foundational · ● active · ○ superseded · ◐ tangent
            </div>

            {/* Thread timeline */}
            {thread.nodes.length > 0 ? (
                <ul className="post-list">
                    {thread.nodes
                        .sort((a, b) => a.order - b.order)
                        .map(node => (
                            <li key={node.postId} className="post-item">
                                {node.post ? (
                                    <>
                                        <div className="mono text-xs muted mb-1">
                                            {statusLabel[node.status] || '●'}
                                        </div>
                                        <Link
                                            to={`/posts/${node.post.slug}`}
                                            className="post-title link-underline"
                                            style={{
                                                opacity: node.status === 'superseded' ? 0.6 : 1
                                            }}
                                        >
                                            {node.post.title}
                                        </Link>
                                        {node.annotation && (
                                            <p className="text-sm muted mt-1" style={{ fontStyle: 'italic' }}>
                                                {node.annotation}
                                            </p>
                                        )}
                                        <div className="post-meta mt-1">
                                            {node.post.publishedAt && formatDate(node.post.publishedAt)}
                                            {node.post.publishedAt && ' · '}
                                            {node.post.readingTime} min
                                        </div>
                                    </>
                                ) : (
                                    <p className="muted text-sm">[Post not found]</p>
                                )}
                            </li>
                        ))}
                </ul>
            ) : (
                <p className="muted">No posts in this thread yet.</p>
            )}

            <hr className="divider" />

            {/* Footer */}
            <nav className="footer-nav">
                <Link to="/">home</Link>
                <span>·</span>
                <Link to="/threads">all threads</Link>
            </nav>
        </main>
    );
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}
