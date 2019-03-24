const { Mutation } = require('./Mutation');
const { Query } = require('./Query');
const { User } = require('./User');
const { MusicMark } = require('./MusicMark');
const { Music } = require('./Music');

const resolvers = {
  Mutation,
  Query,
  User,
  MusicMark,
  Music
};

module.exports = {
  resolvers,
};
