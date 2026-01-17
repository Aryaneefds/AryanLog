import { CONSTANTS } from '../config/index';

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .substring(0, CONSTANTS.SLUG_MAX_LENGTH);
}

/**
 * Check if a slug is valid
 */
export function isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug) && slug.length <= CONSTANTS.SLUG_MAX_LENGTH;
}

/**
 * Make a slug unique by appending a number
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
    if (!existingSlugs.includes(baseSlug)) {
        return baseSlug;
    }

    let counter = 2;
    while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
        counter++;
    }

    return `${baseSlug}-${counter}`;
}
