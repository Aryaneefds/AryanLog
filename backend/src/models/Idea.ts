import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IIdea extends Document {
    name: string;
    slug: string;
    description?: string;
    createdAt: Date;
    postCount: number;
    relatedIdeas: Types.ObjectId[];
}

const ideaSchema = new Schema<IIdea>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
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
        postCount: {
            type: Number,
            default: 0,
        },
        relatedIdeas: [{
            type: Schema.Types.ObjectId,
            ref: 'Idea',
        }],
    },
    {
        timestamps: true,
    }
);

// Note: slug and name indexes already created by unique:true in schema
ideaSchema.index({ postCount: -1 });

export const Idea = mongoose.model<IIdea>('Idea', ideaSchema);
