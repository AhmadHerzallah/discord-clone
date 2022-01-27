import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { GraphQLServer } from "graphql-yoga";
// Routes
import channelsRoute from "./routes/channels.js";

// models
import channel from "./models/channel.js";
dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));
app.use(cors());

const uri = process.env.MONGODB;

const typeDefs = `type Query {
    getChannel(id: ID!): Channel
    getChannels: [Channel]
  }
  type Channel {
    id: ID
    name: String!,
    topic: String,
    messages: [Message]
  }
  type Message {
    content: String!,
    channel_id: String!,
    author: Author!
  }
  type Author {
    id: ID!,
    username: String!
  }
  input AuthorInput {
    id: ID!,
    username: String!
  }

  type Mutation {
    createChannel(name: String!, topic: String): Channel!,
    deleteChannel(id: ID!): String
    sendMessage(content: String!, channel_id: String!, author: AuthorInput!): Message
  }`;
const resolvers = {
  Query: {
    getChannels: () => channel.find(),
    getChannel: async (_, { id }) => {
      var result = await channel.findById(id);
      return result;
    },
  },
  Mutation: {
    createChannel: async (_, { name, topic }) => {
      const newChannel = new channel({
        name,
        topic,
      });
      await newChannel.save();
      return newChannel;
    },
    deleteChannel: async (_, { id }) => {
      await channel.findByIdAndRemove(id);
      return "Channel deleted";
    },
    sendMessage: async (_, { content, channel_id, author }) => {
      channel.findOne({ channel_id: channel_id }, (err, channel) => {
        if (err) throw new Error(err);
        if (!channel) return "Empty";
        const newMessage = {
          content: content,
          channel_id: channel_id,
          author: {
            id: author.id,
            username: author.username,
          },
        };
        channel.messages.push(newMessage);
        channel.save();
        return newMessage;
      });
    },
  },
};
const server = new GraphQLServer({ typeDefs, resolvers });

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.start(() => console.log("Server is running on localhost:4000"));
  })
  .catch((err) => console.log(err.message));
