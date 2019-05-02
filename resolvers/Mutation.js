const {hash, compare} = require('bcrypt');
const {sign} = require('jsonwebtoken');
const {APP_SECRET, getUserId} = require('../utils');
const { Schema } = require('../validations/Schema');


const Mutation = {
    register: async (parent, {username, phoneNumber, email, password}, context) => {
        Schema.register(username, phoneNumber, email, password);
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
            await context.prisma.updateUser({
                where: {
                    id: user.id
                },
                data: {
                    lastLogin: new Date().toJSON()
                }
            });
            return {
                token: sign({userId: user.id}, APP_SECRET),
                user,
            }
        } else {
            throw new Error('Please provide "phoneNumber" or "email"')
        }
    },
    // TODO login with email or phone number should be added
    login: async (parent, {username, password}, context) => {
        let user;
        Schema.login(username, password);
        user = await context.prisma.user({username});
        if (!user) {
            throw new Error('{"username": "Invalid username"}')
        }
        const passwordValid = await compare(password, user.password);
        if (!passwordValid) {
            throw new Error('{"password": "Invalid password"}')
        }
        await context.prisma.updateUser({
            where: {
                id: user.id
            },
            data: {
                lastLogin: new Date().toJSON()
            }
        });
        return {
            token: sign({userId: user.id}, APP_SECRET),
            user,
        }
    },
    upsertUserHome: async (parent, args, context) => {
        const userId = getUserId(context);
        const {latitude, longitude, address} = args;
        Schema.upsertUserHome(latitude, longitude, address);
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
        Schema.usernameValidation(username);
        const isFollowed = await context.prisma.$exists.user({
            AND: [
                {id: userId, followings_some: {username}}
            ]
        });
        if (!isFollowed) {
            return await context.prisma.updateUser({
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
            })
        } else {
            throw new Error(`You have already followed ${username}!`)
        }
    },
    unfollowingUser: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        Schema.usernameValidation(username);
        const isFollowed = await context.prisma.$exists.user({
            AND: [
                {id: userId, followings_some: {username}}
            ]
        });
        if (isFollowed) {
            return await context.prisma.updateUser({
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
        } else {
            throw new Error(`You can't unfollow someone who didn't followed him/her before!!`)
        }
    },
    addFriend: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        Schema.usernameValidation(username);
        const isFriend = await context.prisma.$exists.user({
            AND: [
                {id: userId, friends_some: {username}}
            ]
        });
        if (!isFriend) {
            return await context.prisma.updateUser({
                where: {
                    id: userId
                },
                data: {
                    friends: {
                        connect: {
                            username
                        }
                    }
                }
            })
        } else {
            throw new Error(`You have already added ${username} to your friends!`)
        }

    },
    unFriend: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        Schema.usernameValidation(username);
        const isFriend = await context.prisma.$exists.user({
            AND: [
                {id: userId, friends_some: {username}}
            ]
        });
        if (isFriend) {
            return await context.prisma.updateUser({
                where: {
                    id: userId
                },
                data: {
                    friends: {
                        disconnect: {
                            username
                        }
                    }
                }
            })
        } else {
            throw new Error(`${username} is not in your friends list!`)
        }

    },
    blockUser: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        Schema.usernameValidation(username);
        const isBlocked = await context.prisma.$exists.user({
            AND: [
                {id: userId, blockList_some: {username}}
            ]
        });
        if (!isBlocked) {
            return await context.prisma.updateUser({
                where: {
                    id: userId
                },
                data: {
                    blockList: {
                        connect: {
                            username
                        }
                    }
                }
            })
        } else {
            throw new Error(`You have already blocked ${username}!`)
        }

    },
    unblockUser: async (parent, args, context) => {
        const userId = getUserId(context);
        const {username} = args;
        Schema.usernameValidation(username);
        const isBlocked = await context.prisma.$exists.user({
            AND: [
                {id: userId, blockList_some: {username}}
            ]
        });
        if (isBlocked) {
            return await context.prisma.updateUser({
                where: {
                    id: userId
                },
                data: {
                    blockList: {
                        disconnect: {
                            username
                        }
                    }
                }
            })
        } else {
            throw new Error(`${username} is not in your block list!`)
        }

    },
    likeMusicMark: async (parent, args, context) => {
        const userId = getUserId(context);
        const {musicMarkId} = args;
        return await context.prisma.updateMusicMark({
            where: {
                id: musicMarkId
            },
            data: {
                likedBy: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
    },
    dislikeMusicMark: async (parent, args, context) => {
        const userId = getUserId(context);
        const {musicMarkId} = args;
        const isLiked = await context.prisma.$exists.musicMark({
            AND: [{
                id: musicMarkId,
                likedBy_some: {id: userId}
            }]
        });
        if (isLiked) {
            return await context.prisma.updateMusicMark({
                where: {
                    id: musicMarkId
                },
                data: {
                    likedBy: {
                        disconnect: {
                            id: userId
                        }
                    }
                }
            })
        } else {
            throw new Error("You need to like it first!")
        }
    },
    favouriteMusicMark: async (parent, args, context) => {
        const userId = getUserId(context);
        const {musicMarkId} = args;
        return await context.prisma.updateMusicMark({
            where: {
                id: musicMarkId
            },
            data: {
                favouriteFor: {
                    connect: {
                        id: userId
                    }
                }
            }
        })

    },
    unfavoriteMusicMark: async (parent, args, context) => {
        const userId = getUserId(context);
        const {musicMarkId} = args;
        const isFavourite = await context.prisma.$exists.musicMark({
            AND: [{
                id: musicMarkId,
                favouriteFor_some: {id: userId}
            }]
        });
        if (isFavourite) {
            return await context.prisma.updateMusicMark({
                where: {
                    id: musicMarkId
                },
                data: {
                    favouriteFor: {
                        disconnect: {
                            id: userId
                        }
                    }
                }
            })
        } else {
            throw new Error("This mark is not in your favourite list!")
        }
    },
    // TODO are we gonna check for duplicate locations ?!
    createMusicMark: async (parent, args, context) => {
        const {latitude, longitude, musics, title, description} = args;
        await Schema.createMusicMark(latitude, longitude, musics, title, description);
        // TODO Validation
        const userId = getUserId(context);
        let musicsWithUser = [];
        console.log(args)
        isMarkExists = await context.prisma.$exists.musicMark({
            latitude,
            longitude
        })
        if (isMarkExists) {
            throw new Error("This place has already taken, You can add songs to it if you want!")
        }
        await Promise.all(musics.map(async (music) => {
            // Check for duplicate songs
            let isMusicExists = await context.prisma.$exists.musicMark({
                AND: [
                    {
                        latitude,
                        longitude,
                        musics_some: {
                            trackId: music.trackId,
                            trackService: music.trackService
                        }
                    }
                ]
            });
            console.log(isMusicExists)
            if (isMusicExists) {
                throw new Error('You can\'t add duplicate songs!')
            }
            // Adding user for each music object (later we need to track em to find which user added music for the same mark)
            musicsWithUser.push(Object.assign({}, {...music, user: {connect: {id: userId}}}))

        }));
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
        Schema.updateMusicMark(latitude, longitude, title, description)
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
    addComment: async (parent, args, context) => {
        const userId = getUserId(context);
        const {musicMarkId, description} = args;
        Schema.addComment(description);
        const isMusicMarkExists = await context.prisma.$exists.musicMark({id: musicMarkId});
        if (isMusicMarkExists) {
            return await context.prisma.createComment({
                author: {
                    connect: {
                        id: userId
                    }
                },
                musicMark: {
                    connect: {
                        id: musicMarkId
                    }
                },
                description
            })
        } else {
            throw new Error("There's not such a mark!")
        }
    },
    // Adding music to places by place owner or others
    createMusic: async (parent, args, context) => {
        const {musicMarkId, musics} = args;
        await Schema.createMusic(musics, musicMarkId, context);
        let musicsWithUser = [];
        const userId = getUserId(context);
        const user = await context.prisma.musicMark({id: musicMarkId}).user();
        await Promise.all(musics.map(async (music) => {
            let isMusicExists = await context.prisma.$exists.musicMark({
                AND: [
                    {
                        id: musicMarkId,
                        musics_some: {
                            trackId: music.trackId,
                            trackService: music.trackService
                        }
                    }
                ]
            });
            if (isMusicExists){
                throw new Error('You can\'t add duplicate songs!')
            }
            // Adding user for each music object (later we need to track em to find which user added music for the same mark)
            musicsWithUser.push(Object.assign({}, {...music, user: {connect: {id: userId}}}))

        }));
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
        Schema.updateMusic(uri, title, description);
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
