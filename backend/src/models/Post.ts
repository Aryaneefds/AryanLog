import mongoose, { Document, Schema, Types } from 'mongoose';
import { CONSTANTS, PostStatus } from '../config/index';

export interface IPostMetadata {
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
}

export interface IPost extends Document {
    slug: string;
    title: string;
    subtitle?: string;
    content: string;
    excerpt?: string;
    status: PostStatus;
    publishedAt?: Date;
    currentVersion: number;
    wordCount: number;
    readingTime: number;
    ideas: Types.ObjectId[];
    metadata: IPostMetadata;
    createdAt: Date;
    updatedAt: Date;
    createVersion(changeNote?: string): Promise<void>;
}

const postSchema = new Schema<IPost>(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: CONSTANTS.SLUG_MAX_LENGTH,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: CONSTANTS.EXCERPT_LENGTH * 2,
        },
        status: {
            type: String,
            enum: Object.values(CONSTANTS.POST_STATUS),
            default: CONSTANTS.POST_STATUS.DRAFT,
        },
        publishedAt: Date,
        currentVersion: {
            type: Number,
            default: 1,
        },
        wordCount: {
            type: Number,
            default: 0,
        },
        readingTime: {
            type: Number,
            default: 0,
        },
        ideas: [{
            type: Schema.Types.ObjectId,
            ref: 'Idea',
        }],
        metadata: {
            seoTitle: String,
            seoDescription: String,
            ogImage: String,
            canonicalUrl: String,
        },
    },
    {
        timestamps: true,
    }
);

// Note: slug index already created by unique:true in schema
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ ideas: 1 });
postSchema.index({ status: 1, updatedAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Pre-save: calculate word count and reading time
postSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        const words = this.content.trim().split(/\s+/).length;
        this.wordCount = words;
        this.readingTime = Math.ceil(words / CONSTANTS.WORDS_PER_MINUTE);
    }
    next();
});

// Method: Create a new version (implemented in service layer)
postSchema.methods.createVersion = async function (changeNote = '') {
    const PostVersion = mongoose.model('PostVersion');
    const version = new PostVersion({
        postId: this._id,
        version: this.currentVersion,
        title: this.title,
        content: this.content,
        changeNote,
    });
    await version.save();
    this.currentVersion += 1;
};

// Static: Find published post by slug
postSchema.statics.findPublishedBySlug = async function (slug: string) {
    return this.findOne({ slug, status: CONSTANTS.POST_STATUS.PUBLISHED })
        .populate('ideas', 'name slug');
};

export const Post = mongoose.model<IPost>('Post', postSchema);
