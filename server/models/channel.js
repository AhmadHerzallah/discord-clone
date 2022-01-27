import mongoose from "mongoose";

const channelSchema = mongoose.Schema({
  type: Number,
  name: String,
  topic: String,
  messages: [
    {
      content: String,
      channel_id: String,
      author: {
        id: String,
        username: String,
      },
    },
  ],
});

const channel = mongoose.model("channel", channelSchema);

export default channel;
