import { ReadingStats, Post } from '../models/index';

export interface TrackingData {
    postSlug: string;
    sessionId: string;
    scrollDepth: number;
    timeOnPage: number;
}

// In-memory buffer for batching stats updates
const statsBuffer: Map<string, {
    views: number;
    sessions: Set<string>;
    totalTime: number;
    maxScrollDepth: number;
    scrollCounts: { p25: number; p50: number; p75: number; p100: number };
}> = new Map();

/**
 * Track reading progress (called from beacon)
 */
export async function trackProgress(data: TrackingData): Promise<void> {
    const key = `${data.postSlug}:${getDateKey()}`;

    if (!statsBuffer.has(key)) {
        statsBuffer.set(key, {
            views: 0,
            sessions: new Set(),
            totalTime: 0,
            maxScrollDepth: 0,
            scrollCounts: { p25: 0, p50: 0, p75: 0, p100: 0 },
        });
    }

    const stats = statsBuffer.get(key)!;

    // Count as new view if new session
    if (!stats.sessions.has(data.sessionId)) {
        stats.views++;
        stats.sessions.add(data.sessionId);
    }

    // Update time and scroll depth
    stats.totalTime += data.timeOnPage;

    // Update scroll buckets
    if (data.scrollDepth >= 0.25) stats.scrollCounts.p25++;
    if (data.scrollDepth >= 0.50) stats.scrollCounts.p50++;
    if (data.scrollDepth >= 0.75) stats.scrollCounts.p75++;
    if (data.scrollDepth >= 1.00) stats.scrollCounts.p100++;

    if (data.scrollDepth > stats.maxScrollDepth) {
        stats.maxScrollDepth = data.scrollDepth;
    }
}

/**
 * Flush buffer to database (call periodically)
 */
export async function flushStatsBuffer(): Promise<number> {
    let flushed = 0;

    for (const [key, stats] of statsBuffer) {
        const [slug, dateKey] = key.split(':');
        const date = new Date(dateKey);

        // Find post by slug
        const post = await Post.findOne({ slug }).select('_id');
        if (!post) continue;

        // Upsert stats for this post/date
        await ReadingStats.findOneAndUpdate(
            { postId: post._id, date },
            {
                $inc: {
                    views: stats.views,
                    uniqueVisitors: stats.sessions.size,
                    totalReadTime: stats.totalTime,
                    'scrollDepthBuckets.p25': stats.scrollCounts.p25,
                    'scrollDepthBuckets.p50': stats.scrollCounts.p50,
                    'scrollDepthBuckets.p75': stats.scrollCounts.p75,
                    'scrollDepthBuckets.p100': stats.scrollCounts.p100,
                },
                $max: {
                    completionRate: stats.maxScrollDepth,
                },
            },
            { upsert: true }
        );

        flushed++;
    }

    statsBuffer.clear();
    return flushed;
}

/**
 * Get stats for a post
 */
export async function getPostStats(postId: string, days: number = 30): Promise<{
    totalViews: number;
    totalUniqueVisitors: number;
    avgReadTime: number;
    avgCompletionRate: number;
    dailyStats: Array<{
        date: Date;
        views: number;
        uniqueVisitors: number;
    }>;
}> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const stats = await ReadingStats.find({
        postId,
        date: { $gte: startDate },
    }).sort({ date: -1 });

    const totalViews = stats.reduce((sum, s) => sum + s.views, 0);
    const totalUniqueVisitors = stats.reduce((sum, s) => sum + s.uniqueVisitors, 0);
    const totalTime = stats.reduce((sum, s) => sum + s.totalReadTime, 0);
    const avgCompletion = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.completionRate, 0) / stats.length
        : 0;

    return {
        totalViews,
        totalUniqueVisitors,
        avgReadTime: totalViews > 0 ? Math.round(totalTime / totalViews) : 0,
        avgCompletionRate: avgCompletion,
        dailyStats: stats.map(s => ({
            date: s.date,
            views: s.views,
            uniqueVisitors: s.uniqueVisitors,
        })),
    };
}

/**
 * Get overall site stats
 */
export async function getSiteStats(days: number = 30): Promise<{
    totalViews: number;
    totalUniqueVisitors: number;
    topPosts: Array<{
        postId: string;
        views: number;
    }>;
}> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const aggregation = await ReadingStats.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: '$views' },
                totalUniqueVisitors: { $sum: '$uniqueVisitors' },
            },
        },
    ]);

    const topPosts = await ReadingStats.aggregate([
        { $match: { date: { $gte: startDate } } },
        {
            $group: {
                _id: '$postId',
                totalViews: { $sum: '$views' },
            },
        },
        { $sort: { totalViews: -1 } },
        { $limit: 10 },
    ]);

    return {
        totalViews: aggregation[0]?.totalViews || 0,
        totalUniqueVisitors: aggregation[0]?.totalUniqueVisitors || 0,
        topPosts: topPosts.map(p => ({
            postId: p._id.toString(),
            views: p.totalViews,
        })),
    };
}

/**
 * Get date key for buffering (YYYY-MM-DD)
 */
function getDateKey(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

// Flush buffer every 10 seconds
setInterval(() => {
    flushStatsBuffer().catch(console.error);
}, 10000);
