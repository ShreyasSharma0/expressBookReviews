const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        username: username,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

const verifyToken = (req, res, next) => {
  if (req.session.authorization) {
    const token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user; // `user` will have the `username` from the token
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
};

// Add a book review
regd_users.put("/review/:isbn", verifyToken, (req, res) => {
  const isbn = req.params.isbn;
  const reviews = req.query.reviews;
  const username = req.user?.username;

  if (!username) {
    return res.status(401).send("User not logged in.");
  }

  if (!reviews) {
    return res.status(400).send("Review text is required.");
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).send("Book not found.");
  }

  book.reviews[username] = reviews;

  return res.send(
    `Review by '${username}' for book with ISBN ${isbn} has been added/updated.`
  );
});

regd_users.delete("/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    res.status(400).json({ message: "invalid ISBN." });
  } else if (!books[isbn].reviews[user]) {
    res
      .status(400)
      .json({ message: `${user} hasn't submitted a review for this book.` });
  } else {
    delete books[isbn].reviews[user];
    res.status(200).json({ message: "Book review deleted." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
