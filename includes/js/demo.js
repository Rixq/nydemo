// doc ready
$(document).ready(function () {
    getNYTBooksJSON();

    function getNYTBooksJSON() {
        var _url = "https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=53pBrKqajJZCDWBWx35qYU6a53UNUQ4u";

        $.ajax({
            url: _url,
            dataType: "json",
            error: function (xhr, text, err) { console.log(xhr, text, err); }
        })
        .done(function(data) {
            parseBooksJSON(data);
        })
        .fail(function (data) {
            console.log(data);
        });
    }
});

// callback function for NYT feed
function parseBooksJSON(data) {
    var _loadingBox = $("[data-hook='loading']");
    var _successBox = $("[data-hook='success']");
    var _lastSellerDate = $("[data-hook='last-date']");
    var _bookGenres = $("[data-hook='book-genres']");
    var _listGenres = $("[data-hook='list-genres']");
    var _genreHeader = $("[data-hook='genre-header']");
    var _bookLists = $("[data-hook='book-lists']");

    var _listItemTemplate = $("[data-hook='list-item-template']");
    var _listBookTemplate = $("[data-hook='list-book-template']");
    var _bookItemTemplate = $("[data-hook='book-item-template']");
    
    if (data && data["status"] === "OK") {
        // setting up as of date
        var _pubDate = new Date(data["results"]["published_date"]);
        _lastSellerDate.removeClass("hidden").removeClass("invis").text("As of "
            + getMonthName(_pubDate.getMonth()) + " " + _pubDate.getDay()
            + getDaySuffix(_pubDate.getDay()) + ", " + _pubDate.getFullYear()
        );

        // show/hide loading elements
        _loadingBox.addClass("hidden");
        _successBox.removeClass("invis");

        // Hide the success prompt after a couple seconds, then change display to completely hide
        setTimeout(function () {
            _successBox.addClass("invis");

            setTimeout(function () {
                _successBox.addClass("hidden");
            }, 777);
        }, 2000);

        // flush out genres and book lists if, for whatever reason, we want to reload the feed
        _listGenres.empty();
        _listGenres.append(document.createElement("ul"));
        _bookLists.empty();

        console.log(data["results"]);

        $.each(data["results"].lists, function (key, value) {
            _listGenres.find("ul").append(_listItemTemplate.clone().text(value["display_name"]).attr("data-id", value["list_id"]));

            // Create genres and their lists of books. These will be hidden until called upon, with the exception of the first we show by default
            $(function () {
                var _bookList = _listBookTemplate.clone().removeClass("template").attr("data-hook", "list-books-" + value["list_id"]);

                // If this is our first list, we'll want to show it by default.
                if (key === 0)
                    _bookList.removeClass("hidden").removeClass("invis");

                // Create books for this list
                $.each(value["books"], function (bKey, bValue) {
                    var _bookItem = _bookItemTemplate.clone().removeClass("template");

                    _bookItem.find("[data-hook='image']").attr("src", bValue["book_image"]);
                    _bookItem.find("[data-hook='title']").text(bValue["title"]);
                    _bookItem.find("[data-hook='author']").text("By " + bValue["author"]);
                    _bookItem.find("[data-hook='description']").text(bValue["description"]);

                    // checking for all shopping links we know of.
                    $.each(bValue["buy_links"], function (buyKey, buyValue) {
                        if (buyValue) {
                            if (buyValue["name"] === "Amazon") {
                                _bookItem.find("[data-hook='amazon']").on("click", function () {
                                    window.location = buyValue["url"];
                                });
                            }
                            else if (buyValue["name"] === "Local Booksellers") {
                                _bookItem.find("[data-hook='local-booksellers']").on("click", function () {
                                    window.location = buyValue["url"];
                                });
                            }
                            else if (buyValue["name"] === "Barnes and Noble") {
                                _bookItem.find("[data-hook='barnes-and-noble']").on("click", function () {
                                    window.location = buyValue["url"];
                                });
                            }
                        }
                    });

                    _bookList.append(_bookItem);
                });

                _bookLists.append(_bookList);
            });
        });

        _listGenres.find("li:first-child").addClass("selected");
        _genreHeader.text(getSelectedGenre());

        // Setting up genre button click events
        _listGenres.find("li").on("click", function () {
            // remove selected styling from buttons and hide all current lists
            _listGenres.find("li.selected").removeClass("selected");
            _bookLists.find("div.list-books").addClass("invis").addClass("hidden");

            // set selected style to genre button, edit header list text, and show genre's books
            $(this).addClass("selected");
            _genreHeader.text(getSelectedGenre());
            showListById($(this).attr("data-id"));
        });

        _bookGenres.removeClass("hidden");
    }
}

// HELPER FUNCTIONS

// quickly get selected genre title
function getSelectedGenre() {
    return $("[data-hook='list-genres']").find("li.selected").text();
}

// gets a book list by id and shows it
function showListById(id) {
    $("[data-hook='list-books-" + id + "']").removeClass("hidden").removeClass("invis");
}

// get 'st' 'nd' etc of a given day
function getDaySuffix(day) {
    var _num = day.toString().split("").pop();
    var _suffix = "th";

    if (_num === "1")
        _suffix = "st";
    else if (_num === "2")
        _suffix = "nd";
    else if (_num === "3")
        _suffix = "rd";
    
    return _suffix;
}

// get name of month by index 
function getMonthName(month) {
    var _months = ["January", "February", "March", "April", "May", "June", "July", "August",
        "September", "October", "November", "December" ];

    return _months[month];
}