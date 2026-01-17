import { Link } from 'react-router-dom';
import type { Backlink } from '../../lib/api';

interface PostBacklinksProps {
    backlinks: Backlink[];
}

export function PostBacklinks({ backlinks }: PostBacklinksProps) {
    if (backlinks.length === 0) return null;

    return (
        <section className="mt-16 pt-8 border-t border-border">
            <h2 className="font-sans text-lg font-semibold mb-6 text-text-muted">
                Referenced by
            </h2>
            <ul className="space-y-4">
                {backlinks.map((backlink, index) => (
                    <li key={index}>
                        <Link
                            to={`/posts/${backlink.post.slug}`}
                            className="block group"
                        >
                            <span className="font-sans font-medium text-text group-hover:text-accent transition-colors">
                                {backlink.post.title}
                            </span>
                            {backlink.context && (
                                <p
                                    className="text-sm text-text-muted mt-1"
                                    dangerouslySetInnerHTML={{
                                        __html: backlink.context.replace(
                                            /\[\[[^\]]+\]\]/g,
                                            '<span class="text-accent">$&</span>'
                                        ),
                                    }}
                                />
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
