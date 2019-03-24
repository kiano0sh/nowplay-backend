const User = {
    musicMarks: ({ id }, args, context) => {
        return context.prisma.user({ id }).musicMarks()
    },
};

module.exports = {
    User,
};
