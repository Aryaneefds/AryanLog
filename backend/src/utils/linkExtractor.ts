export interface InternalLink {
    slug: string;
    text?: string;
    context?: string;
}

/**
 * Extract internal links from markdown content
 * Supports:
 * - Wiki-style: [[slug]] or [[slug|display text]]
 * - Markdown: [text](/posts/slug)
 */
export function extractInternalLinks(content: string): InternalLink[] {
    const links: InternalLink[] = [];
    const seenSlugs = new Set<string>();

    // Wiki-style links: [[slug]] or [[slug|text]]
    const wikiPattern = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;
    let match;

    while ((match = wikiPattern.exec(content)) !== null) {
        const slug = match[1];
        const text = match[2];

        if (!seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            links.push({
                slug,
                text,
                context: extractContext(content, match.index, match[0].length),
            });
        }
    }

    // Markdown links to /posts/slug
    const markdownPattern = /\[([^\]]+)\]\(\/posts\/([a-z0-9-]+)\)/g;

    while ((match = markdownPattern.exec(content)) !== null) {
        const text = match[1];
        const slug = match[2];

        if (!seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            links.push({
                slug,
                text,
                context: extractContext(content, match.index, match[0].length),
            });
        }
    }

    return links;
}

/**
 * Extract surrounding text for context
 */
function extractContext(content: string, matchIndex: number, matchLength: number): string {
    const contextRadius = 50;
    const start = Math.max(0, matchIndex - contextRadius);
    const end = Math.min(content.length, matchIndex + matchLength + contextRadius);

    let context = content.substring(start, end);

    // Clean up context
    context = context
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Add ellipsis
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';

    return context;
}

/**
 * Replace wiki-style links with markdown links
 */
export function convertWikiToMarkdown(content: string, baseUrl: string = '/posts'): string {
    return content.replace(
        /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g,
        (_, slug, text) => `[${text || slug}](${baseUrl}/${slug})`
    );
}
