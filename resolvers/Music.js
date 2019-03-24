const Music = {
    user: ({ id }, args, context) => {
        return context.prisma.music({ id }).user()
    },
};

module.exports = {
    Music,
};
