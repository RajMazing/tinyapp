const { request } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 4040;

/** DATABASE */
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2",
  },
};

const users = {
  user1: {
    id: "user1",
    email: "user@example.com",
    password: "",
  },
  user2: {
    id: "user2",
    email: "user2@example.com",
    password: "",
  },
};

/** MIDDLEWARE */
//use bodyParser to handle post request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

/******index ******/
app.get("/", (req, res) => {
  const userID = req.cookies["user_id"];
  return userID ? res.redirect("/urls") : res.redirect("/login");
});

/*****urls*****/
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    users,
    userID: user ? user.email : undefined,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

/*****login*****/
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    return res.status(400).send("Error, email/or password is blank!");

  const user = findUserByEmail(email);

  if (!user) return res.status(403).send("Error, user not found!");
  if (user.password !== password) {
    return res.status(403).send("Error, password doesn't match our records");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

/****logout****/
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

/****register - access****/
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    users,
    userID: user ? user.email : undefined,
  };
  res.render("register", templateVars);
});

app.post("/register/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    return res.status(400).send("email and password should not be blank!");

  const user = findUserByEmail(email);
  if (user)
    return res.status(400).send("You've already registered. Please log in.");

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password,
  };
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

/*****delete URL POST*****/
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

/*****edit URL POST ****/
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) return res.status(403).send("Blocked: not authorized.");

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userID };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

/*****ADD new URL****/
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[req.cookies["user_id"]];
  if (!userID) return res.redirect("/login");

  const templateVars = {
    users,
    userID: user ? user.email : undefined,
  };
  res.render("urls_new", templateVars);
});

/****redirecting the server to longURL****/

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!findDataByShortURL(shortURL)) return res.status(400).send("Invalid URL");

  const longURL = urlDatabase[req.params.shortURL].longURL; /////////
  res.redirect(`${longURL}`);
});

/****short URL****/
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    users,
    userID: user ? user.email : undefined,
  };
  res.render("urls_show", templateVars);
});

/****** Port server*****/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

/****Function generateRandomString****/
function generateRandomString() {
  let randomString = [];
  const letters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString.push(letters[Math.floor(Math.random() * letters.length)]);
  }
  return randomString.join("");
}

function findUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) return users[user];
  }
  return null;
}

function findDataByShortURL(shortURL) {
  for (const key in urlDatabase) {
    if (key === shortURL) return shortURL;
  }
  return null;
}
