const User = {
    comments: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).comments()
    },
    musicMarks: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).musicMarks()
    },
    followers: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).followers()
    },
    followings: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).followings()
    },
    friends: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).friends()
    },
    blockList: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).blockList()
    },
};

module.exports = {
    User,
};
