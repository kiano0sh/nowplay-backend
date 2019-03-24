const MusicMark = {
    user: ({ id }, args, context) => {
        return context.prisma.musicMark({ id }).user()
    },
    musics: ({ id }, args, context) => {
        return context.prisma.musicMark({ id }).musics()
    },
};

module.exports = {
    MusicMark,
};
