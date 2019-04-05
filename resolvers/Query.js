const {getUserId} = require('../utils');

// TODO users id + email + phoneNumber + and other that could violence our user privacy is not something that i like to send for public

const Query = {
    me: async (parent, args, context) => {
        const userId = getUserId(context);
        return await context.prisma.user({id: userId})
    },
    // TODO needs to control returned values
    userByUsername: async (parent, args, context) => {
        const {username} = args;
        return await context.prisma.user({username})
    },
    musicMarks: async (parent, args, context) => {
        return await context.prisma.musicMarks()
    },
    musicMark: async (parent, args, context) => {
        const {musicMarkId} = args;
        return await context.prisma.musicMark({id: musicMarkId})
    },
    musicMarksByUser: async (parent, args, context) => {
        const {username} = args;
        return await context.prisma.user({username}).musicMarks();

    },
    musicByMarkId: async (parent, args, context) => {
        const {musicMarkId} = args;
        return await context.prisma.musicMark({id: musicMarkId}).musics()
    },
    musics: (parent, args, context) => {
        return context.prisma.musics()
    },
};

module.exports = {
    Query,
};
