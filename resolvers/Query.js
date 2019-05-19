const { getUserId } = require("../utils");
const { client } = require("../dbConfig");

// TODO users id + email + phoneNumber + and other that could violence our user privacy is not something that i like to send for public

const Query = {
  me: async (parent, args, context) => {
    const userId = getUserId(context);
    return await context.prisma.user({ id: userId });
  },
  // TODO needs to control returned values
  userByUsername: async (parent, args, context) => {
    const { username } = args;
    return await context.prisma.user({ username });
  },
  musicMarks: async (parent, args, context) => {
    return await context.prisma.musicMarks();
  },
  musicMark: async (parent, args, context) => {
    const { musicMarkId } = args;
    return await context.prisma.musicMark({ id: musicMarkId });
  },
  musicMarksByUsername: async (parent, args, context) => {
    const { username } = args;
    return await context.prisma.user({ username }).musicMarks();
  },
  myMusicMarks: async (parent, args, context) => {
    const userId = getUserId(context);
    let { first, skip } = args;
    if (!first || !skip) {
      skip = 0;
      first = 10;
    }
    return await context.prisma
      .user({ id: userId })
      .musicMarks({ orderBy: "createdAt_DESC", first, skip });
  },
  musicByMarkId: async (parent, args, context) => {
    const { musicMarkId } = args;
    return await context.prisma.musicMark({ id: musicMarkId }).musics();
  },
  musics: async (parent, args, context) => {
    return await context.prisma.musics();
  },
  marksAround: async (parent, args, context) => {
    const { latitude, longitude, maxradiuskm } = args;

    console.log(args);

    const response = await client.query(
      `SELECT *
        FROM
          (SELECT *,
                  (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))) AS distance
           FROM default$default."MusicMark") al
        WHERE distance < ${maxradiuskm}
        ORDER BY distance`
    );

    return response.rows;
  }
};

module.exports = {
  Query
};
