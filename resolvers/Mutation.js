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
};

module.exports = {
    Mutation,
};
