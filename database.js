const bcrypt = require('bcryptjs');

/** DATABASE */
const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = {
  user1: {
    id: "user1",
    email: "user@example.com",
    password: bcrypt.hashSync("123")
  },
  user2: {
    id: "user2",
    email: "user2@example.com",
    password: bcrypt.hashSync("321")
  },

};
module.exports = { users, urlDatabase };
