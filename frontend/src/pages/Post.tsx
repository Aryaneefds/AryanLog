import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { posts as postsApi } from '../lib/api';
import type { Post, Idea, Backlink, ThreadSummary } from '../lib/api';

export function PostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [backlinks, setBacklinks] = useState<Backlink[]>([]);
    const [threads, setThreads] = useState<ThreadSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [readingMode, setReadingMode] = useState(false);
    const contentRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);

        postsApi.get(slug, { includeBacklinks: true })
            .then(data => {
                setPost(data.post);
                setIdeas(data.ideas || []);
                setBacklinks(data.backlinks || []);
                setThreads(data.threads || []);
            })
            .catch(err => setError(err.message || 'Failed to load post'))
            .finally(() => setLoading(false));
    }, [slug]);

    // Reading progress
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;
            const rect = contentRef.current.getBoundingClientRect();
            const totalHeight = contentRef.current.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY - contentRef.current.offsetTop;
            const percentage = Math.min(100, Math.max(0, (scrolled / totalHeight) * 100));
            setProgress(percentage);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reading mode keyboard shortcut
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !e.altKey) {
            const target = e.target as HTMLElement;
            if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                setReadingMode(prev => !prev);
            }
        }
        if (e.key === 'Escape' && readingMode) {
            setReadingMode(false);
        }
    }, [readingMode]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        document.documentElement.setAttribute('data-reading', readingMode.toString());
        return () => document.documentElement.removeAttribute('data-reading');
    }, [readingMode]);

    if (loading) {
        return (
            <main className="page">
                <p className="muted">Loading...</p>
            </main>
        );
    }

    if (error || !post) {
        return (
            <main className="page">
                <Link to="/" className="back-link">← back</Link>
                <div className="mt-6">
                    <h1>Not found</h1>
                    <p className="muted mt-2">{error || 'This post doesn\'t exist.'}</p>
                </div>
            </main>
        );
    }

    return (
        <>
            {/* Progress bar */}
            <div className="progress-bar" style={{ width: `${progress}%` }} />

            <article className="page" ref={contentRef}>
                {/* Back link */}
                <Link to="/" className="back-link">← back</Link>

                {/* Title */}
                <header className="mt-6 mb-5">
                    <h2 className="text-xl" style={{ fontWeight: 400, lineHeight: 1.3 }}>
                        {post.title}
                    </h2>
                    <div className="mono text-xs muted mt-2">
                        {post.publishedAt && formatDate(post.publishedAt)}
                        {post.publishedAt && ' · '}
                        {post.readingTime} min
                        {post.currentVersion > 1 && ` · v${post.currentVersion}`}
                    </div>
                </header>

                {/* Content */}
                <div className="markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                    </ReactMarkdown>
                </div>

                {/* Post footer */}
                <footer className="post-footer mt-6">
                    <hr className="divider" />

                    {/* Ideas */}
                    {ideas.length > 0 && (
                        <section className="mb-5">
                            <div className="label mb-2">Concepts</div>
                            <p className="text-sm">
                                {ideas.map((idea, i) => (
                                    <span key={idea._id}>
                                        <Link to={`/ideas/${idea.slug}`} className="link">
                                            {idea.name}
                                        </Link>
                                        {i < ideas.length - 1 && ' · '}
                                    </span>
                                ))}
                            </p>
                        </section>
                    )}

                    {/* Backlinks */}
                    {backlinks.length > 0 && (
                        <section className="mb-5">
                            <div className="label mb-2">Referenced By</div>
                            <ul className="post-list">
                                {backlinks.map(link => (
                                    <li key={link.slug} className="text-sm">
                                        <Link to={`/posts/${link.slug}`} className="link">
                                            → {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Threads */}
                    {threads.length > 0 && (
                        <section className="mb-5">
                            <div className="label mb-2">Part Of</div>
                            <ul className="post-list">
                                {threads.map(thread => (
                                    <li key={thread.slug} className="text-sm">
                                        <Link to={`/threads/${thread.slug}`} className="link">
                                            → Thread: {thread.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <hr className="divider" />

                    {/* Footer nav */}
                    <nav className="footer-nav">
                        <Link to="/">home</Link>
                        <span>·</span>
                        <Link to="/archive">archive</Link>
                        <span>·</span>
                        <span className="muted">press R for reading mode</span>
                    </nav>
                </footer>
            </article>
        </>
    );
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    });
}
