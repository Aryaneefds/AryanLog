import mongoose, { Document, Schema, Types } from 'mongoose';
import { CONSTANTS, AnnotationType } from '../config/index';

export interface IAnnotationSelector {
    startOffset: number;
    endOffset: number;
    selectedText: string;
}

export interface IAnnotation extends Document {
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    type: AnnotationType;
    selector: IAnnotationSelector;
    content?: string;
    isPublic: boolean;
    createdAt: Date;
}

const annotationSchema = new Schema<IAnnotation>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(CONSTANTS.ANNOTATION_TYPE),
            required: true,
        },
        selector: {
            startOffset: { type: Number, required: true },
            endOffset: { type: Number, required: true },
            selectedText: { type: String, required: true },
        },
        content: {
            type: String,
            trim: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
annotationSchema.index({ postId: 1, isPublic: 1 });
annotationSchema.index({ userId: 1 });

export const Annotation = mongoose.model<IAnnotation>('Annotation', annotationSchema);
