const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();

let users = [{
	username: "jimba",
	password: "abc123"
}];

const isValidUser = (userName, passWord) => !!users.filter(({username, password}) => username === userName && password === passWord).length;

regd_users.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (!username || !password) return res.status(404).json({message: "Error loggin in"});

	if (isValidUser(username, password)) {
		const accessToken = jwt.sign({
			data: password
		}, 'access', {expiresIn: 60 * 60});

		req.session.authorization = { accessToken, username };
		return res.status(200).send("User logged in successfully");
	} else {
		return res.status(208).json({message: "Invalid username or password"});
	}
})

regd_users.post('/auth/review/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	const review = req.body.review;
	const username = req.session.authorization.username;
	if(books[isbn]) {
		books[isbn].reviews[username] = review;
		return res.status(200).send("Review posted successfully");
	} else {
		return res.status(404).send({message: `ISBN ${isbn} not found`});
	}
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
	const isbn = req.params.isbn;
	const username = req.session.authorization.username;
	if (books[isbn]) {
		books?.[isbn]?.reviews?.[username] && delete books[isbn].reviews[username];
		return res.status(200).send("Review deleted successfully");
	} else {
		return res.status(404).json({message: `ISBN ${isbn} not found`});
	}
})

module.exports.authenticated = regd_users;
module.exports.users = users;
