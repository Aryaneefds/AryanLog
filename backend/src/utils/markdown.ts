/**
 * Basic markdown to HTML conversion
 * For full rendering, use a proper library like marked or remark on the frontend
 */

export interface MarkdownOptions {
    sanitize?: boolean;
}

/**
 * Extract headings from markdown for table of contents
 */
export function extractHeadings(content: string): Array<{ level: number; text: string; slug: string }> {
    const headings: Array<{ level: number; text: string; slug: string }> = [];
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    let match;

    while ((match = headingPattern.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        headings.push({ level, text, slug });
    }

    return headings;
}

/**
 * Strip all markdown formatting to get plain text
 */
export function stripMarkdown(content: string): string {
    return content
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`[^`]+`/g, '')
        // Remove headers
        .replace(/^#+\s+/gm, '')
        // Remove bold/italic
        .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove wiki links
        .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, slug, text) => text || slug)
        // Remove images
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Normalize whitespace
        .replace(/\n+/g, '\n')
        .trim();
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
