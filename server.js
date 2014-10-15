var express = require('express');
var fs 		= require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

function formatBook(title, authors, price, isbn) {
	var json = { title: "", authors: [], price: "", isbn: "" }

	json.title = title;
	json.authors = authors;
	json.price = price;
	json.isbn = isbn;

	return json;

}

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

	var booksFile = { books: [] };
	var completedRequests = 0;
	var booksFound = 0;
	var booksTotal = urls.length - 1;

	urls.forEach(function(url) {

		request(url, function(error, response, html) {
			var $ = cheerio.load(html);
			var rawTitle = $('title').text();
			var splitTitle = rawTitle.split(" - ");

			if (!error && response.statusCode == 200 && splitTitle[3] == "Bøker | Akademika.no") {

				var title;
				var authors = [];
				var price;
				var isbn;
				var jsonRes;

				/* Title from <title> */
				title = splitTitle[0];

				/* Authors from .author-full */
				$('.author-full a').each(function(i, elem) {
					authors[i] = $(this).text();
				});

				/* Formats authors name 'Surname, Firstname' -> 'Firstname Surname' */
				for (var i = 0; i < authors.length; i++) {
					if (authors[i].indexOf(", ") > -1) {
						var fullname = authors[i].split(", ");
						authors[i] = fullname[1] + " " + fullname[0];
					}
				}

				/* Checks for duplicate authors */
				for (var i = 1; i < authors.length; i++) {
					if (authors[i-1] == authors[i]) {
						authors.splice(i, 1);
						break;
					}
				}

				/* Price from .tilbud */
				price = $('.info .price-full .sell-price .tilbud').text();
				if (price == '') {
					/* Hvis det er vanlig pris */
					price = $('.info .uc-price-vanlig').text();
					price = price.replace(',-', '');
				} else {
					/* Hvis det er nettpris */
					price = price.replace('Nettpris: ', '');
					price = price.replace(',-', '');
				}

				/* ISBN from <span itemprop="gtin13"> */
				isbn = $('li span').attr('itemprop', 'gtin13').text();

				/* Send info for json formatting */
				jsonRes = formatBook(title, authors, price, isbn);
				console.log(jsonRes);
				console.log();
				booksFile.books.push(jsonRes)
				booksFound++;

			}

			process.stdout.write("> Found " + booksFound + " books on " + completedRequests + " pages, " +
								(booksTotal - completedRequests) + " pages left. \r");

			if (completedRequests == urls.length - 1) {
				fs.writeFile('books.json', JSON.stringify(booksFile, null, 4), function(err) {
					console.log('\n> File successfully written!');
				});
			}

			completedRequests++;

		});

	});

});

app.listen('80')
console.log('> 80 is the magic number.');
exports = module.exports = app;
