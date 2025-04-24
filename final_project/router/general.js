const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const doesExist = (username) => {
    // Filter the users array for any user with the same username
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

  const username = req.body.username;
  const password = req.body.password;
  // Checking if both username and password are provided
  if (username && password) {
    // Checking if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get("/books", async (req, res) => {
  try {
    const getBooks = () =>
      new Promise((resolve, reject) => {
        resolve(books);
      });

    const allBooks = await getBooks();
    return res.send(JSON.stringify(allBooks, null, 4));
  } catch (err) {
    return res.status(500).send("Error fetching book list.");
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const getBookByISBN = (isbn) =>
      new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("Book not found.");
        }
      });

    const book = await getBookByISBN(isbn);
    return res.send(JSON.stringify(book, null, 4));
  } catch (err) {
    return res.status(404).send(err);
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    const getBooksByAuthor = (author) =>
      new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
          (book) => book.author === author
        );
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("No books found by this author.");
        }
      });

    const authorBooks = await getBooksByAuthor(author);
    return res.send(JSON.stringify(authorBooks, null, 4));
  } catch (err) {
    return res.status(404).send(err);
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const getBooksByTitle = (title) =>
      new Promise((resolve, reject) => {
        const result = Object.values(books).filter(
          (book) => book.title === title
        );
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("No books found with this title.");
        }
      });

    const titleBooks = await getBooksByTitle(title);
    return res.send(JSON.stringify(titleBooks, null, 4));
  } catch (err) {
    return res.status(404).send(err);
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).send("Book not found.");
  }

  return res.send(JSON.stringify(book.reviews, null, 4));
});

module.exports.general = public_users;
