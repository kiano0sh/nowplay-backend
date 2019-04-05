const {rule, and, shield} = require('graphql-shield');
const {getUserId} = require('../utils');

const rules = {
    isAuthenticatedUser: rule()((parent, args, context) => {
        const userId = getUserId(context);
        return Boolean(userId)
    }),
    isMusicMarker: rule()(async (parent, {musicMarkId}, context) => {
        const userId = getUserId(context);
        const user = await context.prisma.musicMark({
            id: musicMarkId
        }).user();
        return userId === user.id
    }),
    isMusicOwner: rule()(async (parent, {musicId}, context) => {
        const userId = getUserId(context);
        const user = await context.prisma.music({
            id: musicId
        }).user();
        return userId === user.id
    }),
    notUserOwner: rule()(async (parent, {username}, context) => {
        const userId = getUserId(context);
        if (userId) {
            const usernameId = await context.prisma.user({username}).id();
            return userId !== usernameId
        } else {
            return false
        }
    }),
};

const permissions = shield({
    Query: {
        me: rules.isAuthenticatedUser,
        userByUsername: rules.isAuthenticatedUser,
        // musicMarks: rules.isAuthenticatedUser,
        // musicMark: rules.isAuthenticatedUser,
        // musicMarksByUser: rules.isAuthenticatedUser,
        // musicByMarkId: rules.isAuthenticatedUser,
        // musics: rules.isAuthenticatedUser,
    },
    Mutation: {
        updateUser: rules.isAuthenticatedUser,
        upsertUserHome: rules.isAuthenticatedUser,
        deleteUserHome: rules.isAuthenticatedUser,
        followingUser: rules.notUserOwner,
        unfollowingUser: rules.notUserOwner,
        addFriend: rules.notUserOwner,
        unFriend: rules.notUserOwner,
        blockUser: rules.notUserOwner,
        unblockUser: rules.notUserOwner,
        createMusicMark: rules.isAuthenticatedUser,
        updateMusicMark: rules.isMusicMarker,
        deleteMusicMark: rules.isMusicMarker,
        addComment: rules.isAuthenticatedUser,
        createMusic: rules.isAuthenticatedUser,
        updateMusic: rules.isMusicOwner,
        deleteMusic: rules.isMusicOwner,
        likeMusicMark: rules.isAuthenticatedUser,
        dislikeMusicMark: rules.isAuthenticatedUser,
        favouriteMusicMark: rules.isAuthenticatedUser,
        unfavoriteMusicMark: rules.isAuthenticatedUser,
    },
});

module.exports = {
    permissions,
};
