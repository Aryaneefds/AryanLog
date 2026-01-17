import { Link } from 'react-router-dom';
import type { Idea } from '../../lib/api';

interface IdeaCardProps {
    idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
    return (
        <Link
            to={`/ideas/${idea.slug}`}
            className="card card-interactive block"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <span className="font-sans font-medium text-base truncate block">
                        {idea.name}
                    </span>
                    {idea.description && (
                        <p className="text-sm text-text-muted mt-1 line-clamp-2">
                            {idea.description}
                        </p>
                    )}
                </div>
                <span className="flex-shrink-0 text-sm text-text-faint font-mono bg-bg px-2 py-1 rounded">
                    {idea.postCount}
                </span>
            </div>
        </Link>
    );
}
