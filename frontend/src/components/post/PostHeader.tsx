import { Link } from 'react-router-dom';
import type { Idea } from '../../lib/api';

interface PostHeaderProps {
    title: string;
    subtitle?: string;
    publishedAt?: string;
    readingTime: number;
    currentVersion: number;
    ideas: Idea[];
}

export function PostHeader({
    title,
    subtitle,
    publishedAt,
    readingTime,
    currentVersion,
    ideas,
}: PostHeaderProps) {
    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    return (
        <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-sans font-bold mb-4">{title}</h1>
            {subtitle && (
                <p className="text-xl text-text-muted font-serif mb-6">{subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-text-muted">
                <span className="meta">
                    v{currentVersion} · {formattedDate} · {readingTime} min
                </span>

                {ideas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {ideas.map((idea) => (
                            <Link
                                key={idea._id}
                                to={`/ideas/${idea.slug}`}
                                className="text-sm font-sans text-text-faint hover:text-accent transition-colors"
                            >
                                {idea.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
