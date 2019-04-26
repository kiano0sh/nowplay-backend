const Joi = require('joi');
const myCustomJoi = Joi.extend(require('joi-phone-number'));

const Schema = {
    register(username, phoneNumber, email, password) {
        const signupSchema = Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
            email: Joi.string().email({minDomainAtoms: 2}),
            phoneNumber: myCustomJoi.string().phoneNumber()
        });

        const {error, value} = Joi.validate({username, phoneNumber, email, password}, signupSchema);

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    login(username, password) {
        const loginSchema = Joi.object().keys({
            username: Joi.string().alphanum().min(3).max(30).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        });

        const {error, value} = Joi.validate({username, password}, loginSchema);

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    // TODO
    forgetPassword() {

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

    trackIdValidation(trackId) {
        const {error, value} = Joi.validate(trackId, Joi.number().integer().required());

        if (error) {
            throw new Error(error.details[0].message)
        }
    },

    trackServiceValidation(trackService) {
        const {error, value} = Joi.validate(trackService, Joi.string().required());

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
            this.trackIdValidation(music.trackId);
            this.trackServiceValidation(music.trackService);
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
            this.trackIdValidation(music.trackId);
            this.trackServiceValidation(music.trackService);
            this.titleAndDescriptionValidation(music.title, music.description)
        });
    },

    updateMusic(trackId, trackService, title, description) {
        this.trackIdValidation(trackId);
        this.trackServiceValidation(trackService);
        this.titleAndDescriptionValidation(title, description)
    },
};


module.exports = {
    Schema
};