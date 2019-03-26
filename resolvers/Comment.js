const Comment = {
    author: ({id}, args, context) => {
        return context.prisma.comment({id}).author()
    },
    musicMark: ({id}, args, context) => {
        return context.prisma.comment({id}).musicMark()
    },
};

module.exports = {
    Comment,
};
