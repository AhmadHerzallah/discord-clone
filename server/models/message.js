import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  content: String,
  channel_id: String,
  author: {
    _id: String,
    username: String,
  },
});

const message = mongoose.model("message", messageSchema);

export default message;
