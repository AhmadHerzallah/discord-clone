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
    type: Int!,
    name: String!,
    topic: String,
    messages: [Message]
  }
  type Message {
    type: Int!,
    content: String!,
    channel_id: String!,
    author: Author!
  }
  type Author {
    id: ID!,
    username: String!
  }
  type Mutation {
    createChannel(type: Int!, name: String!, topic: String): Channel!,
    deleteChannel(id: ID!): String
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
    createChannel: async (_, { type, name, topic }) => {
      const newChannel = new channel({
        type,
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
