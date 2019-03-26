const { Mutation } = require('./Mutation');
const { Query } = require('./Query');
const { User } = require('./User');
const { MusicMark } = require('./MusicMark');
const { Music } = require('./Music');
const { Comment } = require('./Comment');

const resolvers = {
  Mutation,
  Query,
  User,
  MusicMark,
  Music,
  Comment
};

module.exports = {
  resolvers,
};
