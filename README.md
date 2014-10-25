aka-skrapa
==========
[![Build Status](https://travis-ci.org/14H-G1/aka-skrapa.svg?branch=master)](https://travis-ci.org/14H-G1/aka-skrapa)

Scrape akademika.no/node/* urls returning title, authors, price and isbn number as json.

##Installing
First clone the git repository
```
$ git clone https://github.com/14H-G1/aka-skrapa.git
```
Then install dependencies
```
$ cd aka-skrapa
$ sudo npm update
```

##Getting started
You can define a starting point and range for the scraper in the cli
```
$ sudo node get <starting point> <range>
```
For example
```
$ sudo node get 7780834 5
```
This will start at akademika.no/node/**7780834** and scrape all the pages through akademika.no/node/**7780838**
> Note that the range will count the starting point as a url

The json file will be saved in the same directory as the app was ran.
