import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser {
  email: string;
  password: string;
}

interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = mongoose.Model<IUser, {}, UserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, UserMethods>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);