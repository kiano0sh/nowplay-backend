const { GraphQLServer } = require('graphql-yoga');
const { prisma } = require('./generated/prisma-client');
const { resolvers } = require('./resolvers');
const { permissions } = require('./permissions');
// import cors from 'cors';
const { formatError } = require('apollo-errors')

const server = new GraphQLServer({
    typeDefs: './schema.graphql',
    resolvers,
    middlewares: [permissions],
    formatError,
    context: request => {
        return {
            ...request,
            prisma,
        }
    },
});

// server.use('*', cors({ origin: 'http://localhost:8081' }));

server.start(() => console.log('Server is running on http://localhost:4000'));