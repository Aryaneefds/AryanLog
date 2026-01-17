import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { posts as postsApi } from '../lib/api';
import type { Post } from '../lib/api';

export function Archive() {
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        postsApi.list({ limit: 100 })
            .then(data => setAllPosts(data.posts))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Group posts by year
    const postsByYear = allPosts.reduce((acc, post) => {
        const year = post.publishedAt
            ? new Date(post.publishedAt).getFullYear().toString()
            : 'Drafts';
        if (!acc[year]) acc[year] = [];
        acc[year].push(post);
        return acc;
    }, {} as Record<string, Post[]>);

    const years = Object.keys(postsByYear).sort((a, b) => {
        if (a === 'Drafts') return 1;
        if (b === 'Drafts') return -1;
        return Number(b) - Number(a);
    });

    return (
        <main className="page">
            {/* Back link */}
            <Link to="/" className="back-link">← back</Link>

            {/* Header */}
            <header className="mt-6 mb-5">
                <h1>Archive</h1>
                <p className="mono text-xs muted mt-2">
                    {allPosts.length} post{allPosts.length !== 1 ? 's' : ''} total
                </p>
            </header>

            <hr className="divider" />

            {/* Posts by year */}
            {loading ? (
                <p className="muted">Loading...</p>
            ) : years.length > 0 ? (
                <div>
                    {years.map(year => (
                        <section key={year} className="mb-6">
                            <div className="label mb-3">{year}</div>
                            <ul className="post-list">
                                {postsByYear[year].map(post => (
                                    <li key={post._id} className="post-item">
                                        <Link to={`/posts/${post.slug}`} className="post-title link-underline">
                                            {post.title}
                                        </Link>
                                        <div className="post-meta">
                                            {post.publishedAt && formatDate(post.publishedAt)}
                                            {post.publishedAt && ' · '}
                                            {post.readingTime} min
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            ) : (
                <p className="muted">No posts yet.</p>
            )}

            <hr className="divider" />

            {/* Footer */}
            <nav className="footer-nav">
                <Link to="/">home</Link>
                <span>·</span>
                <Link to="/ideas">ideas</Link>
            </nav>
        </main>
    );
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short'
    });
}
