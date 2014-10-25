var fs 		= require('fs');
var format 	= require('util').format;
var request = require('request');
var cheerio = require('cheerio');

var urls = [],
	fromRUL = 0,
	range = 0,
	jsonFile = { books: [] },
	completedReq = 0,
	booksFound = 0;

// Get fromURL + range values from terminal
fromURL = parseInt(process.argv[2]);
range = parseInt(process.argv[3]);

for (var i = 0; i < range; i++)
	urls.push(fromURL+i);

console.log("> Started parsing of " + urls.length + " pages...");

urls.forEach(function(nodeURL) {
	var url = format('http://www.akademika.no/node/%s', nodeURL);

	request(url, function (err, response, html) {

		if (!err && response.statusCode == 200) {

			var $ = cheerio.load(html),
				pageTitle = $('title').text(),
				splitTitle = pageTitle.split(" - ");
			// Goes from "Title - Author - Bla - Bla" to ["Title", "Author"...]

			if (splitTitle[0] != undefined && pageTitle.indexOf("Bøker | Akademika.no") > -1) {
				// Only run this part if we are certain the page contains a book
				var title = "",
					authors = [],
					price = "",
					isbn = "",
					jsonBook = { title: "", authors: [], price: "", isbn: "" };

				// Title from <title>
				title = splitTitle[0];

				// Authors from .author-full
				$('.author-full a').each(function(i, elem) {
					authors.push($(this).text());
				});

				// Formats authors name 'Surname, Firstname' -> 'Firstname Surname'
				for (var i = 0; i < authors.length; i++) {
					if (authors[i].indexOf(", ") > -1) {
						var fullname = authors[i].split(", ");
						authors[i] = fullname[1] + " " + fullname[0];
					}
				}

				// Checks for duplicate authors
				for (var i = 1; i < authors.length; i++) {
					if (authors[i-1] == authors[i]) {
						authors.splice(i, 1);
						break;
					}
				}

				// Price from .tilbud
				price = $('.info .price-full .sell-price .tilbud').text();
				if (price == '') {
					// Hvis det er vanlig pris
					price = $('.info .uc-price-vanlig').text();
					price = price.replace(',-', '');
				} else {
					// Hvis det er nettpris
					price = price.replace('Nettpris: ', '');
					price = price.replace(',-', '');
				}

				// ISBN from <span itemprop="gtin13">
				isbn = $('li span').attr('itemprop', 'gtin13').text();

				// Fill info to jsonBook
				jsonBook.title = title;
				jsonBook.authors = authors;
				jsonBook.price = price;
				jsonBook.isbn = isbn;

				console.log("> " + title);
				jsonFile.books.push(jsonBook);

				booksFound++;

			}

		}

		completedReq++;

		if (completedReq == range) {
			fs.writeFile('books.json', JSON.stringify(jsonFile, null, 4), function(err) {
				if(err)
					console.log(err);
				else
					console.log("> JSON file saved.");
			});
		}

	});

});
