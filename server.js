var express = require('express');
var fs 		= require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

function formatBook(rawString, thisPrice) {
	var title;
	var authors = [];
	var isbn;

	var json = { title: "", authors: [], price: "", isbn: "" }

	split = rawString.split(" - ");

	if (split[0].indexOf(" | ") == -1) {
		/* Only run if page is book */

		title = split[0];

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

		/* Remove duplicate authors */
		for (var i = 1; i < authors.length; i++) {
			if (authors[i-1] == authors[i]) {
				authors.splice(i, 1);
				break;
			}
		}

		json.title = title;
		json.authors = authors;
		json.price = thisPrice;
		json.isbn = isbn;

		return json;

	}
}

/* Scrape and parse single node */
app.get('/node/:id', function(req, res) {
	url = 'http://www.akademika.no/node/' + req.params.id;
	request(url, function(error, response, html) {

		if (!error) {
			var rawString;
			var price;
			var jsonRes;
			var $ = cheerio.load(html);

			/* Price from .tilbud */
			price = $('.info .price-full .sell-price .tilbud').text();
			price = price.replace('Nettpris: ', '');
			price = price.replace(',-', '');
			console.log(price);

			/* Title, authors and isbn from <title> */
			rawString = $('title').text();
			jsonRes = formatBook(rawString, price);

			/* Send and log */
			res.set('Content-Type', 'application/json');
			res.send(jsonRes);
			console.log(jsonRes);
		}

		fs.writeFile('book.json', JSON.stringify(jsonRes, null, 4), function(err){
        	console.log('> File successfully written!');
        });

	});
});

/* Scrape and parse multiple nodes */
app.get('/node/:from/:to', function(req, res) {
	var urls = [];
	var from = req.params.from;
	var to = req.params.to;

	console.log("From " + from + " to " + to + ".");

	to++;
	while (from < to) {
		urls.push('http://www.akademika.no/node/' + from);
		from++;
	}

	res.send("Started parsing of " + (urls.length - 1) + " pages...");
	console.log("> Started parsing of " + (urls.length - 1) + " pages...");

	var books = { books: [] };
	var completedRequests = 0;
	var booksFound = 0;
	var booksTotal = urls.length - 1;

	urls.forEach(function(url) {
		request(url, function(error, response, html) {

			if (!error) {
				var rawString;
				var price;
				var jsonRes;
				var $ = cheerio.load(html);

				/* Price from .tilbud */
				price = $('.info .price-full .sell-price .tilbud').text();
				if (price == '') {
					price = $('.info .uc-price-vanlig').text();
					price = price.replace(',-', '');
				} else {
					price = price.replace('Nettpris: ', '');
					price = price.replace(',-', '');
				}

				/* Title, authors and isbn from <title> */
				rawString = $('title').text();

				/* Send info for json formatting */
				jsonRes = formatBook(rawString, price);

				if (jsonRes != undefined) {
					booksFound++;
					books.books.push(jsonRes)
				}

				process.stdout.write("> Found " + booksFound + " books on " + completedRequests + " pages, " +
									(booksTotal - completedRequests) + " pages left. \r");

			    completedRequests++;

			    if (completedRequests == urls.length) {
					fs.writeFile('books.json', JSON.stringify(books, null, 4), function(err) {
						console.log('\n> File successfully written!');
					});
			    }

			}

		});
	});

});

app.listen('80')
console.log('> 80 is the magic number.');
exports = module.exports = app;
