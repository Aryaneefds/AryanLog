import mongoose, { Document, Schema, Types } from 'mongoose';
import { CONSTANTS, ThreadStatus, NodeStatus } from '../config/index';

export interface IThreadNode {
    postId: Types.ObjectId;
    order: number;
    status: NodeStatus;
    annotation: string;
    branchFrom: number | null;
}

export interface IThoughtThread extends Document {
    title: string;
    slug: string;
    description?: string;
    status: ThreadStatus;
    visibility: 'public' | 'private';
    createdAt: Date;
    updatedAt: Date;
    nodes: IThreadNode[];
}

const threadNodeSchema = new Schema<IThreadNode>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        order: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(CONSTANTS.NODE_STATUS),
            required: true,
        },
        annotation: {
            type: String,
            required: true,
            trim: true,
        },
        branchFrom: {
            type: Number,
            default: null,
        },
    },
    { _id: false }
);

const thoughtThreadSchema = new Schema<IThoughtThread>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(CONSTANTS.THREAD_STATUS),
            default: CONSTANTS.THREAD_STATUS.ACTIVE,
        },
        visibility: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },
        nodes: [threadNodeSchema],
    },
    {
        timestamps: true,
    }
);

// Note: slug index already created by unique:true in schema
thoughtThreadSchema.index({ visibility: 1, updatedAt: -1 });
thoughtThreadSchema.index({ 'nodes.postId': 1 });

export const ThoughtThread = mongoose.model<IThoughtThread>('ThoughtThread', thoughtThreadSchema);
