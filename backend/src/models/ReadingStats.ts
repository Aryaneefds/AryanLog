import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScrollDepthBuckets {
    p25: number;
    p50: number;
    p75: number;
    p100: number;
}

export interface IReadingStats extends Document {
    postId: Types.ObjectId;
    date: Date;
    views: number;
    uniqueVisitors: number;
    totalReadTime: number;
    completionRate: number;
    scrollDepthBuckets: IScrollDepthBuckets;
}

const readingStatsSchema = new Schema<IReadingStats>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        uniqueVisitors: {
            type: Number,
            default: 0,
        },
        totalReadTime: {
            type: Number,
            default: 0,
        },
        completionRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 1,
        },
        scrollDepthBuckets: {
            p25: { type: Number, default: 0 },
            p50: { type: Number, default: 0 },
            p75: { type: Number, default: 0 },
            p100: { type: Number, default: 0 },
        },
    },
    {
        timestamps: false,
    }
);

// Indexes
readingStatsSchema.index({ postId: 1, date: -1 });
readingStatsSchema.index({ date: -1 });
// Optional TTL index for 2 years retention
// readingStatsSchema.index({ date: 1 }, { expireAfterSeconds: 63072000 });

export const ReadingStats = mongoose.model<IReadingStats>('ReadingStats', readingStatsSchema);
