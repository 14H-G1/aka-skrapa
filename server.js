var express = require('express');
var fs 		= require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();


function formatBook(rawString) {
	var title;
	var authors = [];
	var isbn;

	var json = { title: "", authors: [], isbn: "" }

	split = rawString.split(" - ");
	title = split[0];

	if (split[0].indexOf(" | ") == -1) {
		/* Only run if page is book */

		if (split[1].indexOf(", ") == -1) {
			/* If author name doesn't contain ',' */
			authors[0] = split[1];
		}

		for (var i = 0; i < split.length; i++) {

			if (split[i].indexOf(", ") > -1) {
				/* Formats author: Firstname + Lastname */
				var fullname = split[i].split(", ");
				authors.push(fullname[1] + " " + fullname[0]);
			}

			if (split[i].indexOf("(") > -1) {
				/* Formats isbn without ()*/
				isbn = split[i].replace('(', '');
				isbn = isbn.replace(')', '');
			}
		}

		json.title = title;
		json.authors = authors;
		json.isbn = isbn;
		return json;

	}
}

/* Scrape and parse single node */
app.get('/node/:id', function(req, res) {
	url = 'http://www.akademika.no/node/' + req.params.id;
	request(url, function(error, response, html) {

		if (!error) {
			/* Scraping book title, author and isbn */
			var $ = cheerio.load(html);
			rawString = $('title').text();
			var jsonRes = formatBook(rawString)
			res.send(jsonRes);
		}

		fs.writeFile('book.json', JSON.stringify(jsonRes, null, 4), function(err){
        	console.log('File successfully written!');
        });

	});
});

/* Scrape and parse multiple nodes */
app.get('/node/:from/:to', function(req, res) {
	var urls = [];
	var from = req.params.from;
	var to = req.params.to;

	console.log(from);
	console.log(to);

	while (from < to) {
		urls.push('http://www.akademika.no/node/' + from);
		from++;
	}

	res.send("Started parsing " + urls.length + " pages...");

	console.log(urls);
	console.log(urls.length);

	var books = [];
	var completedRequests = 0;

	urls.forEach(function(url) {
		request(url, function(error, response, html) {

			if (!error) {
				/* Scraping book title, author and isbn */
				var $ = cheerio.load(html);
				rawString = $('title').text();
				var jsonRes = formatBook(rawString);
				if (jsonRes != undefined) {
					console.log(jsonRes);
					books.push(jsonRes)
				}

			    completedRequests++;
			    if (completedRequests == urls.length) {
			        console.log(books);
					fs.writeFile('books.json', JSON.stringify(books, null, 4), function(err){
						console.log('File successfully written!');
					});
			    }

			}

		});
	});

});

app.listen('80')
console.log('Magic happens on port 80');
exports = module.exports = app;
