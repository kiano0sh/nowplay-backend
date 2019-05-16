const Joi = require("joi");
const myCustomJoi = Joi.extend(require("joi-phone-number"));
const { createError } = require("apollo-errors");

// process.on('unhandledRejection', (reason, promise) => {
//     console.log('Unhandled Rejection at:', promise, 'reason:', reason);
//     Schema.kk()
//     // Application specific logging, throwing an error, or other logic here
// });

const FooError = createError("FooError", {
  message: "A foo error has occurred"
});

const Schema = {
  register(username, phoneNumber, email, password) {
    const signupSchema = Joi.object().keys({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required(),
      email: Joi.string().email({ minDomainAtoms: 2 }),
      phoneNumber: myCustomJoi.string().phoneNumber()
    });

    const { error, value } = Joi.validate(
      { username, phoneNumber, email, password },
      signupSchema
    );

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  login(username, password) {
    const loginSchema = Joi.object().keys({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      password: Joi.string()
        .regex(/^[a-zA-Z0-9]{3,30}$/)
        .required()
    });

    const { error, value } = Joi.validate({ username, password }, loginSchema);

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  // TODO
  forgetPassword() {},

  usernameValidation(username) {
    const { error, value } = Joi.validate(
      username,
      Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
    );

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  coordinateValidation(latitude, longitude, required = true) {
    let coordinateSchema;
    if (required) {
      coordinateSchema = Joi.object().keys({
        latitude: Joi.number()
          .min(-90)
          .max(90)
          .precision(5)
          .strict()
          .required(),
        longitude: Joi.number()
          .min(-180)
          .max(180)
          .precision(5)
          .strict()
          .required()
      });
    } else {
      coordinateSchema = Joi.object().keys({
        latitude: Joi.number()
          .min(-90)
          .max(90)
          .precision(5)
          .strict(),
        longitude: Joi.number()
          .min(-180)
          .max(180)
          .precision(5)
          .strict()
      });
    }

    const { error, value } = Joi.validate(
      { latitude, longitude },
      coordinateSchema
    );

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  titleAndDescriptionValidation(title, description) {
    const titleAndDescriptionSchema = Joi.object().keys({
      title: Joi.string().max(500),
      description: Joi.string().max(1000)
    });

    const { error, value } = Joi.validate(
      { title, description },
      titleAndDescriptionSchema
    );

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  trackIdValidation(trackId) {
    const { error, value } = Joi.validate(
      trackId,
      Joi.number()
        .integer()
        .required()
    );

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  trackServiceValidation(trackService) {
    const { error, value } = Joi.validate(
      trackService,
      Joi.string().required()
    );

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  upsertUserHome(latitude, longitude, address) {
    this.coordinateValidation(latitude, longitude);

    const upsertUserHomeSchema = Joi.object().keys({
      address: Joi.string().max(200)
    });

    const { error, value } = Joi.validate({ address }, upsertUserHomeSchema);

    if (error) {
      throw new Error(error.details[0].message);
    }
  },

  createMusicMark(latitude, longitude, musics, title, description) {
    this.coordinateValidation(latitude, longitude, true);
    musics.map(async music => {
      this.trackIdValidation(music.trackId);
      this.trackServiceValidation(music.trackService);
      this.titleAndDescriptionValidation(music.title, undefined);
    });
    this.titleAndDescriptionValidation(title, description);
  },

  updateMusicMark(latitude, longitude, title, description) {
    this.coordinateValidation(latitude, longitude, false);
    this.titleAndDescriptionValidation(title, description);
  },

  addComment(description) {
    this.titleAndDescriptionValidation(undefined, description);
  },

  addMusic(musics) {
    musics.map(music => {
      this.trackIdValidation(music.trackId);
      this.trackServiceValidation(music.trackService);
      this.titleAndDescriptionValidation(music.title, undefined);
    });
  },

  updateMusic(trackId, trackService, title) {
    this.trackIdValidation(trackId);
    this.trackServiceValidation(trackService);
    this.titleAndDescriptionValidation(title, undefined);
  }
};

// TODO add validation for artwork, artist, genre, duration, description, trackCreatedAt in Music

module.exports = {
  Schema
};
