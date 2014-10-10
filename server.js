var express = require('express');
var fs 		= require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/', function(req, res){

	url = 'http://www.akademika.no/node/7780834';

	request(url, function(error, response, html) {
		var title;
		var authors;
		var isbn;

		var json = { title: "", authors: [], isbn: 0 }

		if (!error) {

			/* Scraping book title, author and isbn */
			var $ = cheerio.load(html);

			title = $('title').text();
			split = title.split(" - ");

			console.log(split[0]); //Book title

			for (var i = 0; i < split.length; i++) {

				if (split[i].indexOf(", ") > -1) {
					/* Formats author: Firstname + Lastname */
					var fullname = split[i].split(", ");
					authors = fullname[1] + " " + fullname[0];
					console.log(authors);
				}

				if (split[i].indexOf("(") > -1) {
					/* Formats isbn without ()*/
					isbn = split[i].replace('(', '');
					isbn = isbn.replace(')', '');
					console.log(isbn);
				}
			}

			json.title = split[0];
			json.authors = authors;
			json.isbn = isbn;

		}

        res.send(json)
	});
});

app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app;
