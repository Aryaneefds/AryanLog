import { Link } from 'react-router-dom';

interface PostCardProps {
    post: {
        slug: string;
        title: string;
        excerpt?: string;
        publishedAt?: string;
        readingTime: number;
        ideas?: Array<{ name: string; slug: string }>;
    };
}

export function PostCard({ post }: PostCardProps) {
    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : 'Draft';

    return (
        <article className="group">
            <Link to={`/posts/${post.slug}`} className="block">
                <h2 className="font-sans text-lg sm:text-xl font-semibold mb-2 group-hover:text-accent transition-colors leading-tight">
                    {post.title}
                </h2>
                {post.excerpt && (
                    <p className="text-text-muted text-sm sm:text-base mb-3 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-text-faint text-xs sm:text-sm font-mono">
                    <span>{formattedDate}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{post.readingTime} min read</span>
                </div>
            </Link>
            {post.ideas && post.ideas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {post.ideas.slice(0, 5).map((idea) => (
                        <Link
                            key={idea.slug}
                            to={`/ideas/${idea.slug}`}
                            className="text-xs font-sans px-2 py-1 rounded-full bg-bg-subtle text-text-faint hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                            {idea.name}
                        </Link>
                    ))}
                    {post.ideas.length > 5 && (
                        <span className="text-xs font-sans px-2 py-1 text-text-faint">
                            +{post.ideas.length - 5} more
                        </span>
                    )}
                </div>
            )}
        </article>
    );
}

// Default export for lazy loading
export default PostCard;
