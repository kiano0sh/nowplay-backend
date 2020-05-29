"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "User",
    embedded: false
  },
  {
    name: "Home",
    embedded: false
  },
  {
    name: "trackServices",
    embedded: false
  },
  {
    name: "Music",
    embedded: false
  },
  {
    name: "MusicMark",
    embedded: false
  },
  {
    name: "Comment",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://localhost:4465`
});
exports.prisma = new exports.Prisma();
