import { CONSTANTS } from '../config/index';

/**
 * Calculate reading time from word count
 */
export function calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / CONSTANTS.WORDS_PER_MINUTE);
}

/**
 * Calculate word count from text content
 */
export function calculateWordCount(content: string): number {
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
    if (minutes < 1) return 'less than 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} min`;
}
