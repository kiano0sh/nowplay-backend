const MusicMark = {
    user: ({ id }, args, context) => {
        return context.prisma.musicMark({ id }).user()
    },
    musics: ({ id }, args, context) => {
        return context.prisma.musicMark({ id }).musics()
    },
    comments: async ({ id }, args, context) => {
        return await context.prisma.musicMark({ id }).comments()
    },
};

module.exports = {
    MusicMark,
};
