function search() {

    var query = $('#query').val();
    var title;

    $.ajax({
        url: 'books.json',
        dataType: "json",

        success: function(data) {

            $(".result").html('');

            data.books.forEach(function(book) {
                /* Loops through each element in file */

                title = book.title.toLowerCase();

                if (title.indexOf(query) > -1) {
                    $(".result").append("<p>" + book.title + " (" + book.isbn + ")" + "</p>");
                }

            });

        }
    });
}
