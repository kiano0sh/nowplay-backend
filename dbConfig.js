const { Client } = require("pg");

const client = new Client({
  database: "prisma",
  user: "prisma",
  password: "prisma",
  host: "localhost",
  port: 3001
});

module.exports = {
  client
};
