const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./generated/prisma-client");
const { resolvers } = require("./resolvers");
const { permissions } = require("./permissions");
const { client } = require("./dbConfig");

// import cors from 'cors';
const { formatError } = require("apollo-errors");

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
  middlewares: [permissions],
  formatError,
  context: request => {
    return {
      ...request,
      prisma
    };
  }
});

// server.use('*', cors({ origin: 'http://localhost:8081' }));

const startServer = async () => {
  await client.connect();
  server.start(() => console.log("Server is running on http://localhost:4000"));
};

startServer();
