const { rule, and, shield } = require('graphql-shield');
const { getUserId } = require('../utils');

const rules = {
  isAuthenticatedUser: rule()((parent, args, context) => {
    const userId = getUserId(context);
    return Boolean(userId)
  }),
  isMusicMarker: rule()(async (parent, { musicMarkId }, context) => {
    const userId = getUserId(context);
    const user = await context.prisma.musicMark({
        id: musicMarkId,
      }).user();
    return userId === user.id
  }),
};

const permissions = shield({
  Query: {
    me: rules.isAuthenticatedUser,
    userByUsername: rules.isAuthenticatedUser,
    musicMarks: rules.isAuthenticatedUser,
    musicMark: rules.isAuthenticatedUser,
    musicMarksByUser: rules.isAuthenticatedUser,
    musicByMarkId: rules.isAuthenticatedUser,
    musics: rules.isAuthenticatedUser,
  },
  Mutation: {
    updateUser: rules.isAuthenticatedUser,
    addUserHome: rules.isAuthenticatedUser,
    followingUser: rules.isAuthenticatedUser,
    addFriend: rules.isAuthenticatedUser,
    blockUser: rules.isAuthenticatedUser,
    createMusicMark: rules.isAuthenticatedUser,
    updateMusicMark: rules.isMusicMarker,
    deleteMusicMark: rules.isMusicMarker,
    likeMusicMark: rules.isAuthenticatedUser,
    favouriteMusicMark: rules.isAuthenticatedUser,
  },
});

module.exports = {
  permissions,
};
