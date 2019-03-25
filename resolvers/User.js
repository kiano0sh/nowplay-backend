const User = {
    musicMarks: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).musicMarks()
    },
    followers: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).followers()
    },
    followings: async ({ id }, args, context) => {
        return await context.prisma.user({ id }).followings()
    },

};

module.exports = {
    User,
};
