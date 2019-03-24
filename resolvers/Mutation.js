const {hash, compare} = require('bcrypt');
const {sign} = require('jsonwebtoken');
const {APP_SECRET, getUserId} = require('../utils');

const Mutation = {
    signup: async (parent, {username, phoneNumber, email, password}, context) => {
        if (phoneNumber || email) {
            const hashedPassword = await hash(password, 10);
            let user;
            // In case that user just provides phoneNumber
            if (phoneNumber) {
                user = await context.prisma.createUser({
                    username,
                    phoneNumber,
                    password: hashedPassword,
                });
            }
            // In case that user just provides email
            else if (email) {
                console.log(username, email, password)
                user = await context.prisma.createUser({
                    username,
                    email,
                    password: hashedPassword,
                })
            }
            // In case that user provides them both
            else {
                user = await context.prisma.createUser({
                    username,
                    email,
                    phoneNumber,
                    password: hashedPassword,
                })
            }
            return {
                token: sign({userId: user.id}, APP_SECRET),
                user,
            }
        } else {
            throw new Error('Please provide "phoneNumber" or "email"')
        }
    },
    login: async (parent, {username, phoneNumber, email, password}, context) => {
        let user;
        if (phoneNumber || email || username) {
            // In case that user just provides phoneNumber
            if (phoneNumber) {
                user = await context.prisma.user({phoneNumber});
                if (!user) {
                    throw new Error(`No user found for phone number: ${phoneNumber}`)
                }
            }
            // In case that user just provides email
            else if (email) {
                user = await context.prisma.user({email});
                if (!user) {
                    throw new Error(`No user found for email: ${email}`)
                }
            }
            // In case that user provides username
            else {
                user = await context.prisma.user({username});
                if (!user) {
                    throw new Error(`No user found for username: ${username}`)
                }
            }
        } else {
            throw new Error('Please provide "phoneNumber" or "email" or "username"')
        }
        const passwordValid = compare(password, user.password);
        if (!passwordValid) {
            throw new Error('Invalid password')
        }
        return {
            token: sign({userId: user.id}, APP_SECRET),
            user,
        }
    },
    createMusicMark: async (parent, args, context) => {
        const {latitude, longitude, musics} = args;
        // TODO Validation
        const userId = getUserId(context);
        // Adding user for each music object (later we need to track em to find which user added music for the same mark)
        let musicsWithUser = [];
        musics.map(music => {
            musicsWithUser.push(Object.assign({}, {...music, user: {connect: {id: userId}}}))
        });
        // Creating a mark on map
        return await context.prisma.createMusicMark({
            latitude,
            longitude,
            musics: {
                create: [
                    ...musicsWithUser
                ],
            },
            user: {
                connect: {id: userId}
            }
        })
    },
    // Only owner could update the mark place on map(if there's no extra music added by others)
    updateMusicMark: async (parent, args, context) => {
        const {musicMarkId, latitude, longitude} = args;
        const spoiled = await context.prisma.musicMark({id: musicMarkId}).spoiled();
        // Check if other people added new music in here
        if (!spoiled) {
            return await context.prisma.updateMusicMark({
                where: {
                    id: musicMarkId
                },
                data: {
                    longitude,
                    latitude
                }
            })
        } else {
            throw new Error("Changing place ability is locked because others added music in here!")
        }
    },
    // Only owner could delete the mark place on map (if there's no extra music added by others)
    deleteMusicMark: async (parent, args, context) => {
        const {musicMarkId} = args;
        const spoiled = await context.prisma.musicMark({id: musicMarkId}).spoiled();
        if (!spoiled) {
            return await context.prisma.deleteMusicMark({
                id: musicMarkId
            })
        } else {
            throw new Error("Removing mark is not possible because others added music in here!")
        }
    },


};

module.exports = {
    Mutation,
};
