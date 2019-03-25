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
    upsertUserHome: async (parent, args, context) => {
        const userId = getUserId(context);
        const {latitude, longitude, address} = args;
        return await context.prisma.updateUser({
            where: {
                id: userId
            },
            data: {
                homeLocation: {
                    upsert: {
                        create: {
                            latitude,
                            longitude,
                            address
                        },
                        update: {
                            latitude,
                            longitude,
                            address
                        },
                    }
                }
            }
        }).homeLocation()
    },
    deleteUserHome: async (parent, args, context) => {
        const userId = getUserId(context);
        return await context.prisma.updateUser({
            where: {
                id: userId
            },
            data: {
                homeLocation: {
                    delete: true
                }
            },
        })
    },
    followingUser: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        const isFollowed = await context.prisma.$exists.user({followings_every: {username}});
        console.log(isFollowed);
        if (!isFollowed) {
            await context.prisma.updateUser({
                where: {
                    id: userId
                },
                data: {
                    followings: {
                        connect: {
                            username
                        }
                    }
                }
            });
            return await context.prisma.updateUser({
                where: {
                    username
                },
                data: {
                    followers: {
                        connect: {
                            id: userId
                        }
                    }
                }
            })

        } else {
            throw new Error(`You have already followed ${username}!`)
        }
    },
    unfollowingUser: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        const isUnfollowed = await context.prisma.$exists.user({followers_every: {username}});
        if (!isUnfollowed) {
            await context.prisma.updateUser({
                where: {
                    id: userId
                },
                data: {
                    followings: {
                        disconnect: {
                            username
                        }
                    }
                }
            });
            return await context.prisma.updateUser({
                where: {
                    username
                },
                data: {
                    followers: {
                        disconnect: {
                            id: userId
                        }
                    }
                }
            })
        } else {
            throw new Error(`You have already unfollowed ${username}!`)
        }
    },
    addFriend: async (parent, args, context) => {
        const userId = getUserId(context);

    },
    unFriend: async (parent, args, context) => {
        const userId = getUserId(context);

    },
    blockUser: async (parent, args, context) => {
        const userId = getUserId(context);

    },
    unblockUser: async (parent, args, context) => {
        const userId = getUserId(context);

    },
    likeMusicMark: async (parent, args, context) => {
        const userId = getUserId(context);

    },
    favouriteMusicMark: async (parent, args, context) => {

    },
    createMusicMark: async (parent, args, context) => {
        const {latitude, longitude, musics, title, description} = args;
        // TODO Validation
        const userId = getUserId(context);
        // Adding user for each music object (later we need to track em to find which user added music for the same mark)
        let musicsWithUser = [];
        musics.map(music => {
            musicsWithUser.push(Object.assign({}, {...music, user: {connect: {id: userId}}}))
        });
        console.log(musicsWithUser)
        // Creating a mark on map
        return await context.prisma.createMusicMark({
            latitude,
            longitude,
            title,
            description,
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
        const {musicMarkId, latitude, longitude, title, description} = args;
        const spoiled = await context.prisma.musicMark({id: musicMarkId}).spoiled();
        // Check if other people added new music in here
        if (!spoiled) {
            return await context.prisma.updateMusicMark({
                where: {
                    id: musicMarkId
                },
                data: {
                    longitude,
                    latitude,
                    title,
                    description
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
    // Adding music to places by place owner or others
    createMusic: async (parent, args, context) => {
        const {musicMarkId, musics} = args;
        const userId = getUserId(context);
        const user = await context.prisma.musicMark({id: musicMarkId}).user();
        // Adding user for each music object (later we need to track em to find which user added music for the same mark)
        let musicsWithUser = [];
        musics.map(music => {
            musicsWithUser.push(Object.assign({}, {...music, user: {connect: {id: userId}}}))
        });
        console.log(musicsWithUser);
        if (userId === user) {
            return await context.prisma.updateMusicMark({
                where: {
                    id: musicMarkId
                },
                data: {
                    musics: {
                        create: [
                            ...musicsWithUser
                        ]
                    }
                }
            })
        } else {
            return await context.prisma.updateMusicMark({
                where: {
                    id: musicMarkId
                },
                data: {
                    musics: {
                        create: [
                            ...musicsWithUser
                        ]
                    },
                    spoiled: true
                }
            })

        }
    },
    updateMusic: async (parent, args, context) => {
        const {musicId, uri, title, description} = args;
        return await context.prisma.updateMusic({
            where: {
                id: musicId
            },
            data: {
                uri,
                title,
                description
            }
        })
    },
    deleteMusic: async (parent, args, context) => {
        const {musicId} = args;
        return await context.prisma.deleteMusic({
            id: musicId
        })
    }
};

module.exports = {
    Mutation,
};
