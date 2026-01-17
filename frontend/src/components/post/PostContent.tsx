import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PostContentProps {
    content: string;
}

export function PostContent({ content }: PostContentProps) {
    return (
        <article className="prose max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom heading renderers with IDs for TOC
                    h2: ({ children, ...props }) => {
                        const text = String(children);
                        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                        return <h2 id={id} {...props}>{children}</h2>;
                    },
                    h3: ({ children, ...props }) => {
                        const text = String(children);
                        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                        return <h3 id={id} {...props}>{children}</h3>;
                    },
                    // Code blocks with syntax highlighting placeholder
                    code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                            return <code {...props}>{children}</code>;
                        }
                        return (
                            <code className={`block ${className}`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Links - handle internal wiki-style links
                    a: ({ href, children, ...props }) => {
                        const isInternal = href?.startsWith('/') || href?.startsWith('[[');
                        return (
                            <a
                                href={href}
                                {...props}
                                {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                            >
                                {children}
                            </a>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </article>
    );
}
