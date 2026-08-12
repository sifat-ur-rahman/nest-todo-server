import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  // select: false -> excluded from queries by default (find(), findById()),
  // so a password hash never leaks unless explicitly requested with
  // .select('+password'). Same intent as your Express `select: false` habit.
  @Prop({ required: true, select: false })
  password: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Strip password/version key whenever a user doc is serialized to JSON
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret.password;
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});
