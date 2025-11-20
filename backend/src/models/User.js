const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      validate: {
        validator: (val) => !val || /^\S+@\S+\.\S+$/.test(val),
        message: 'Invalid email address'
      }
    },
    role: {
      type: String,
      enum: ['Student', 'Mentor', 'Admin', 'Guest'],
      default: 'Student'
    },
    bio: {
      type: String,
      default: ''
    },
    profileUrl: {
      type: String,
      default: ''
    },
    passwordHash: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

module.exports = mongoose.model("User", userSchema);
