import mongoose, { Document, Schema, Types } from 'mongoose';
import { CONSTANTS, ReferenceType } from '../config/index';

export interface IReference extends Document {
    sourcePostId: Types.ObjectId;
    targetPostId: Types.ObjectId;
    type: ReferenceType;
    context?: string;
    createdAt: Date;
}

const referenceSchema = new Schema<IReference>(
    {
        sourcePostId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        targetPostId: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(CONSTANTS.REFERENCE_TYPE),
            default: CONSTANTS.REFERENCE_TYPE.EXPLICIT,
        },
        context: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes
referenceSchema.index({ sourcePostId: 1 });
referenceSchema.index({ targetPostId: 1 });
referenceSchema.index({ sourcePostId: 1, targetPostId: 1 }, { unique: true });

export const Reference = mongoose.model<IReference>('Reference', referenceSchema);
