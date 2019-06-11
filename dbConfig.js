const { Client } = require("pg");

const client = new Client({
  database: "prisma",
  user: "prisma",
  password: "prisma",
  host: "localhost",
  port: 3002
});

module.exports = {
  client
};
