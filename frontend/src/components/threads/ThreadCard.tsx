import { Link } from 'react-router-dom';
import type { Thread } from '../../lib/api';

interface ThreadCardProps {
    thread: Pick<Thread, 'title' | 'slug' | 'description' | 'status'>;
}

export function ThreadCard({ thread }: ThreadCardProps) {
    const statusConfig = {
        active: { label: 'Active', color: 'bg-green-500/10 text-green-500' },
        concluded: { label: 'Concluded', color: 'bg-accent/10 text-accent' },
        paused: { label: 'Paused', color: 'bg-text-faint/10 text-text-faint' },
    };

    const status = statusConfig[thread.status] || statusConfig.active;

    return (
        <Link
            to={`/threads/${thread.slug}`}
            className="card card-interactive block"
        >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-sans text-lg font-semibold group-hover:text-accent transition-colors">
                        {thread.title}
                    </h3>
                    {thread.description && (
                        <p className="text-text-muted mt-2 text-sm sm:text-base line-clamp-2">
                            {thread.description}
                        </p>
                    )}
                </div>
                <span
                    className={`
                        inline-flex self-start flex-shrink-0
                        text-xs font-mono uppercase tracking-wide 
                        px-2.5 py-1 rounded-full
                        ${status.color}
                    `}
                >
                    {status.label}
                </span>
            </div>
        </Link>
    );
}
