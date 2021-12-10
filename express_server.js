const { request } = require("express");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 4040;

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
    password: "123",
  },
  user2: {
    id: "user2",
    email: "user2@example.com",
    password: "321",
  },

};


const userIdUrls = (id, urlDatabase) => {
  
  const urlsToDisplay = {};
  for(const shortURL in urlDatabase) {
   
    if(urlDatabase[shortURL].userID === id ) {
     
      urlsToDisplay[shortURL] = urlDatabase[shortURL];
     
    }
  }
  
  return urlsToDisplay;
};

// const urlBelongToUser = function(id, shortURL, urlDatabase) {
//   if (urlDatabase[shortURL].userID === id) {
//     return true;
//   } 
//   return false;
  
// }








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
  
  const user = req.cookies["user_id"];
//   console.log("This is the user in /urls", user)
// console.log("This is the userUrlsId", userIdUrls(user, urlDatabase))
  
  if (!user) {
    res.send("<h2><a href='/login'>Please login</a></h2>");
  }
  const templateVars = {
    user ,
    urls: userIdUrls(user, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

/*****login*****/
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    users,
    userID: user ? user.email : undefined,
    urls: urlDatabase,
  };
  res.render('login', templateVars);
});


//refactor this
// when a user makes a login only the user should be able to view 
//write a function called urlsFolder(id)
//reutrns filtered urlDatabase == only containers urls for that id
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

/*** Register POST ****/
app.post("/register/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();

  if (!email || !password)
    return res.status(400).send("email and password should not be blank!");

  const user = findUserByEmail(email);
  if (user)
    return res.status(400).send("You've already registered. Please log in.");

  
  users[userID] = {
    id: userID,
    email: email,
    password: password,
  };
  res.cookie("user_id", userID);
  
  res.redirect("/urls");
});



/*****ADD new URL****/
app.get("/urls/new", (req, res) => {

  const userID = req.cookies["user_id"];
  const user = users[req.cookies["user_id"]];
  if (!userID) return res.redirect("/login");

  const templateVars = {
    user,
    urls: urlDatabase, 
    
  };
  res.render("urls_new", templateVars);
});

/****short URL****/
// app.get("/urls/:shortURL", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const user = users[req.cookies["user_id"]];
//   const templateVars = {
//     shortURL: shortURL,
//     longURL: urlDatabase[shortURL].longURL,
//     users,
//     userID: user ? user.email : undefined,
//   };
//   res.render("urls_show", templateVars);
// });

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = users[req.cookies["user_id"]];
  const userUrls = userIdUrls(req.cookies["user_id"], urlDatabase);

  if (!userUrls[shortURL]) {
    return res.status(403).send("link doesn't exist")
  }
  
  const templateVars = {
    shortURL: shortURL,
    longURL: userUrls[shortURL].longURL,
    user: user
  };
  res.render("urls_show", templateVars);
});
// app.get("/urls/:shortURL", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const user = users[req.cookies["user_id"]];
//   const templateVars = {
//     shortURL: shortURL,
//     longURL: urlDatabase[shortURL].longURL,
//     users,
//     userID: user ? user.email : undefined,
//   };
//   res.render("urls_show", templateVars);
// });














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
  
  res.redirect(`/urls/${shortURL}`);
});





/*****delete URL POST*****/
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userUrls= userIdUrls(req.cookies["user_id"], urlDatabase);
if (!userUrls[shortURL]){
  return res.status(403).send("Failed to delete")
}
  
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});



/****redirecting the server to longURL****/

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!findDataByShortURL(shortURL)) {
     return res.status(400).send("Invalid URL");}

  const longURL = urlDatabase[req.params.shortURL].longURL; 
  res.redirect(`${longURL}`);
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


