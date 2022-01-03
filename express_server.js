const { request } = require("express");
const cookieSession = require("cookie-session");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");





// functions in my helpers.js
const { generateRandomString } = require("./helpers");
const { userIdUrls } = require("./helpers");
const { getUserByEmail } = require("./helpers");
const { urlDatabase } = require("./database");
const { users } = require("./database");

/**** MIDDLEWARE ****/
//use bodyParser to handle post request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["major key"]
  })
);

app.set("view engine", "ejs");

/******index ******/
app.get("/", (req, res) => {
  const user = users[req.session.user_id];
  return user ? res.redirect("/urls") : res.redirect("/login");
});



/*****login*****/
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
 
  const templateVars = {
    users
  };
  res.render("login", templateVars);


});



// login issue fixed, doesn't show when logged in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    return res.status(400).send("Error, email/or password is blank!");

  const user = getUserByEmail(email, users);

  if (!user) return res.status(403).send("Error, user not found!");

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Error, password doesn't match our records");
  }

  const matchMe = bcrypt.compareSync(password, user.password);
  if (!matchMe) {
    return res.status(403).send("Incorrect Password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});


/****logout****/
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



/****register - access****/
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];

    const templateVars = {
    user
  };

  res.render("register", templateVars);
});


/*** Register POST ****/
app.post("/register/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
  const verifiedUser = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password)
    return res.status(400).send("email and password should not be blank!");

  
  if (verifiedUser)
    return res.status(400).send("You've already registered. Please log in.");

  users[userID] = {
    id: userID,
    email: email,
    password: hashedPassword,
  };
  req.session['user_id'] = userID;
  res.redirect("/urls");
  
});

/*****urls*****/
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
   return res.send("<h2><a href='/login'>Please login</a></h2>");
  }
  const templateVars = {
    user,
    urls: userIdUrls(user.id, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.status(403).send("Blocked: not authorized.");

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };

  res.redirect(`/urls/${shortURL}`);
});

/*****ADD new URL****/
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.redirect("/login");

  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

/****short URL****/
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.session.user_id];
  const userUrls = userIdUrls(req.session.user_id, urlDatabase);

  if (!userUrls[shortURL]) {
    return res.status(403).send("Access denied!");
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: userUrls[shortURL].longURL,
    user: user,
  };
  res.render("urls_show", templateVars);
});

/*****edit URL POST ****/
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.id;

  if (!userUrls[shortURL]) {
    return res.status(403).send("Cannot edit");
   }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});



/*****delete URL POST*****/
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrls = userIdUrls(req.session.user_id, urlDatabase);
  if (!userUrls[shortURL]) {
    return res.status(403).send("Failed to delete link");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

/****redirecting the server to longURL****/
app.get("/u/:shortURL", (req, res) => {
  // if (!urlDatabase[req.params.shortURL]) {
  //   return res.status(403).send("ShortUrl doesn't exist")
  // }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`);
});

/****** Port server*****/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});