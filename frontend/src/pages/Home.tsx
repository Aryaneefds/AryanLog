import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { posts as postsApi, ideas as ideasApi } from '../lib/api';
import type { Post, Idea } from '../lib/api';

export function Home() {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            postsApi.list({ limit: 8 }),
            ideasApi.list(),
        ])
            .then(([postData, ideaData]) => {
                setRecentPosts(postData.posts);
                setAllIdeas(ideaData.ideas);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Sort ideas by post count
    const sortedIdeas = [...allIdeas].sort((a, b) => b.postCount - a.postCount);

    return (
        <main className="page">
            {/* Site identifier */}
            <header className="mono text-xs muted mb-8">
                aryanlog · my blogs
            </header>

            {/* Main heading */}
            <h1>Welcome to AryanLog</h1>

            <p className="prose muted mb-6" style={{ maxWidth: '520px' }}>
                A space for my thoughts, ideas, and writings.
                Documenting my journey in tech and beyond.
            </p>

            <hr className="divider" />

            {/* Ideas section */}
            <section>
                <div className="label mb-3">By Concept</div>

                {loading ? (
                    <p className="muted">Loading...</p>
                ) : sortedIdeas.length > 0 ? (
                    <p className="idea-list">
                        {sortedIdeas.map((idea, index) => (
                            <span key={idea._id}>
                                <Link to={`/ideas/${idea.slug}`} className="idea-link">
                                    {idea.name}
                                </Link>
                                {' '}
                                <span className="idea-count">({idea.postCount})</span>
                                {index < sortedIdeas.length - 1 && (
                                    <span className="muted"> · </span>
                                )}
                            </span>
                        ))}
                    </p>
                ) : (
                    <p className="muted text-sm">No ideas yet.</p>
                )}
            </section>

            <hr className="divider" />

            {/* Recent posts */}
            <section className="mt-6">
                <div className="label mb-4">Recent Posts</div>

                {loading ? (
                    <p className="muted">Loading...</p>
                ) : recentPosts.length > 0 ? (
                    <ul className="post-list">
                        {recentPosts.map(post => (
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
                ) : (
                    <p className="muted text-sm">No posts yet.</p>
                )}
            </section>

            <hr className="divider" />

            {/* Footer navigation */}
            <footer className="footer-nav">
                <Link to="/threads">threads</Link>
                <span>·</span>
                <Link to="/archive">archive</Link>
                <span>·</span>
                <Link to="/ideas">all ideas</Link>
            </footer>
        </main>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}
