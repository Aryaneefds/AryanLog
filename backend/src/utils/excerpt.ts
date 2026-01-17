import { CONSTANTS } from '../config/index';

/**
 * Generate an excerpt from markdown content
 */
export function generateExcerpt(content: string, maxLength: number = CONSTANTS.EXCERPT_LENGTH): string {
    // Remove markdown formatting
    let plainText = content
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
        // Remove images
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove lists
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Normalize whitespace
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Truncate to maxLength
    if (plainText.length <= maxLength) {
        return plainText;
    }

    // Find last word boundary
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
}
