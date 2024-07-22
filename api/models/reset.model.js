import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  expires: { type: Date, required: true },
});

const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

export default ResetToken;
