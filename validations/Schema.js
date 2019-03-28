const Joi = require('joi');

const Schema = {
    signup(username, phoneNumber, email, password) {
        const signupSchema = Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
            email: Joi.string().email({minDomainAtoms: 2}),
            // TODO add countries code
            phoneNumber: Joi.string().max(10)
        });

        const {error, value} = Joi.validate({username, phoneNumber, email, password}, signupSchema);

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    login(username, phoneNumber, email, password) {
        this.signup(username, phoneNumber, email, password)
    },

    usernameValidation(username) {
        const {error, value} = Joi.validate(username, Joi.string().alphanum().min(3).max(30).required());

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    coordinateValidation(latitude, longitude, required = true) {
        let coordinateSchema;
        if (required) {
             coordinateSchema = Joi.object().keys({
                latitude: Joi.number().min(-90).max(90).required(),
                longitude: Joi.number().min(-180).max(180).required()
            });
        } else {
             coordinateSchema = Joi.object().keys({
                latitude: Joi.number().min(-90).max(90),
                longitude: Joi.number().min(-180).max(180)
            });
        }

        const {error, value} = Joi.validate({latitude, longitude}, coordinateSchema);

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    titleAndDescriptionValidation(title, description) {
        const titleAndDescriptionSchema = Joi.object().keys({
            title: Joi.string().max(100),
            description: Joi.string().max(1000)
        });

        const {error, value} = Joi.validate({title, description}, titleAndDescriptionSchema);

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    uriValidation(uri) {
        const {error, value} = Joi.validate(uri, Joi.string().uri().required());

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    upsertUserHome(latitude, longitude, address) {
        this.coordinateValidation(latitude, longitude);

        const upsertUserHomeSchema = Joi.object().keys({
            address: Joi.string().max(200),
        });

        const {error, value} = Joi.validate({address}, upsertUserHomeSchema);

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    createMusicMark(latitude, longitude, musics, title, description) {
        this.coordinateValidation(latitude, longitude, true);
        musics.map(music => {
            this.uriValidation(music.uri);
            this.titleAndDescriptionValidation(music.title, music.description)
        });
        this.titleAndDescriptionValidation(title, description)
    },

    updateMusicMark(latitude, longitude, title, description) {
        this.coordinateValidation(latitude, longitude, false);
        this.titleAndDescriptionValidation(title, description)
    },

    addComment(description) {
        this.titleAndDescriptionValidation(undefined, description)
    },

    createMusic(musics) {
        musics.map(music => {
            this.uriValidation(music.uri);
            this.titleAndDescriptionValidation(music.title, music.description)
        });
    },

    updateMusic(uri, title, description) {
        this.uriValidation(uri);
        this.titleAndDescriptionValidation(title, description)
    },
};


module.exports = {
    Schema
};