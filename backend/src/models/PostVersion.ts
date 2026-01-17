import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPostVersion extends Document {
    postId: Types.ObjectId;
    version: number;
    title: string;
    content: string;
    createdAt: Date;
    changeNote?: string;
}

const postVersionSchema = new Schema<IPostVersion>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        version: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        changeNote: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
postVersionSchema.index({ postId: 1, version: 1 }, { unique: true });
postVersionSchema.index({ postId: 1, createdAt: -1 });

export const PostVersion = mongoose.model<IPostVersion>('PostVersion', postVersionSchema);
