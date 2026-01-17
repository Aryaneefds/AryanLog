import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ideas as ideasApi } from '../lib/api';
import type { Idea, Post } from '../lib/api';

interface IdeaDetail {
    idea: Idea;
    posts: Array<{ title: string; slug: string; publishedAt: string; readingTime: number }>;
    relatedIdeas: Array<{ name: string; slug: string; sharedPosts: number }>;
}

export function IdeaPage() {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<IdeaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);

        ideasApi.get(slug)
            .then(response => setData(response as IdeaDetail))
            .catch(err => setError(err.message || 'Failed to load idea'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <main className="page">
                <p className="muted">Loading...</p>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="page">
                <Link to="/ideas" className="back-link">← all ideas</Link>
                <div className="mt-6">
                    <h1>Not found</h1>
                    <p className="muted mt-2">{error || 'This idea doesn\'t exist.'}</p>
                </div>
            </main>
        );
    }

    const { idea, posts, relatedIdeas } = data;

    return (
        <main className="page">
            {/* Back link */}
            <Link to="/ideas" className="back-link">← all ideas</Link>

            {/* Header */}
            <header className="mt-5 mb-5">
                <h2 className="text-xl" style={{ fontWeight: 400 }}>
                    {idea.name}
                </h2>
                {idea.description && (
                    <p className="prose muted mt-2" style={{ fontSize: 'var(--text-base)' }}>
                        {idea.description}
                    </p>
                )}
                <p className="mono text-xs muted mt-2">
                    Appears in {idea.postCount} post{idea.postCount !== 1 ? 's' : ''}.
                </p>
            </header>

            <hr className="divider" />

            {/* Posts */}
            {posts.length > 0 && (
                <section className="mb-5">
                    <div className="label mb-3">Posts</div>
                    <ul className="post-list">
                        {posts.map(post => (
                            <li key={post.slug} className="post-item">
                                <Link to={`/posts/${post.slug}`} className="post-title link-underline">
                                    {post.title}
                                </Link>
                                <div className="post-meta">
                                    {formatDate(post.publishedAt)} · {post.readingTime} min
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Related ideas */}
            {relatedIdeas.length > 0 && (
                <>
                    <hr className="divider" />
                    <section>
                        <div className="label mb-2">Related Concepts</div>
                        <p className="text-sm">
                            {relatedIdeas.map((related, i) => (
                                <span key={related.slug}>
                                    <Link to={`/ideas/${related.slug}`} className="link">
                                        {related.name}
                                    </Link>
                                    {i < relatedIdeas.length - 1 && ' · '}
                                </span>
                            ))}
                        </p>
                    </section>
                </>
            )}

            <hr className="divider" />

            {/* Footer */}
            <nav className="footer-nav">
                <Link to="/">home</Link>
                <span>·</span>
                <Link to="/ideas">all ideas</Link>
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
