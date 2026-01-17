import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    bio?: string;
    avatar?: string;
    socials?: {
        twitter?: string;
        github?: string;
    };
    createdAt: Date;
    lastLogin?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        socials: {
            twitter: String,
            github: String,
        },
        lastLogin: Date,
    },
    {
        timestamps: true,
    }
);

// Note: email index is already created by unique:true in schema

export const User = mongoose.model<IUser>('User', userSchema);
