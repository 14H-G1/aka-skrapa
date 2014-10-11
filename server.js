var express = require('express');
var fs 		= require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/node/:id', function(req, res){

	url = 'http://www.akademika.no/node/' + req.params.id;

	request(url, function(error, response, html) {
		var title;
		var authors = [];
		var isbn;

		var json = { title: "", authors: [], isbn: "" }

		if (!error) {

			/* Scraping book title, author and isbn */
			var $ = cheerio.load(html);

			rawString = $('title').text();
			split = rawString.split(" - ");

			console.log("New request for node: " + req.params.id);
			console.log(split[0]); //Book title

			title = split[0];

			if (split[1].indexOf(", ") == -1) {
				/* If author name doesn't contain ',' */
				authors[0] = split[1];
				console.log(authors[0]);
			}

			for (var i = 0; i < split.length; i++) {

				if (split[i].indexOf(", ") > -1) {
					/* Formats author: Firstname + Lastname */
					var fullname = split[i].split(", ");
					authors.push(fullname[1] + " " + fullname[0]);
					console.log(fullname[1] + " " + fullname[0]);
				}

				if (split[i].indexOf("(") > -1) {
					/* Formats isbn without ()*/
					isbn = split[i].replace('(', '');
					isbn = isbn.replace(')', '');
					console.log(isbn);
				}
			}

			console.log("\n");

			json.title = title;
			json.authors = authors;
			json.isbn = isbn;

		}

        res.send(json)
	});
});

app.listen('80')
console.log('Magic happens on port 80');
exports = module.exports = app;
