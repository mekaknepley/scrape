// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//         // Display the apropos information on the page
//         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />"+ data[i].link + "</p>");
//     }
// });

// whenever someone clicks the new articles button it will populate the site

$("#scrapeButton").on("click", function () {
    $.getJSON("/scrape", function(data) {
        // For each one
        for (var i = 0; i < data.length; i++) {
            // Display the apropos information on the page
            $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].summary + "<br />"+ data[i].link + "<button data-id='" + data[i]._id + "' class=\"saveArticle\">Save This Article</button></p>");
        }
    });
})

$(document).on("click", ".saveArticle", function() {
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log("Saving article " + thisId);
    $.ajax({
        method: "GET",
        url: "/save/" + thisId
    })
    .done(function(data) {
        console.log(data);
        // Show modal that says saved
    });
});


$(document).on("click", ".deleteArticle", function() {
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
    console.log("Deleting article " + thisId);
    $.ajax({
        method: "GET",
        url: "/delete/" + thisId
    })
    .done(function(data) {
        console.log(data);
        // Show modal that says saved
    });
});

// Whenever someone clicks a p tag
// $(document).on("click", "p", function() {
//     // Empty the notes from the note section
//     $("#notes").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");
//
//     // Now make an ajax call for the Article
//     $.ajax({
//         method: "GET",
//         url: "/articles/" + thisId
//     })
//     // With that done, add the note information to the page
//         .done(function(data) {
//             console.log(data);
//             // The title of the article
//             $("#notes").append("<h2>" + data.title + "</h2>");
//             // An input to enter a new title
//             $("#notes").append("<input id='titleinput' name='title' >");
//             // A textarea to add a new note body
//             $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
//             // A button to submit a new note, with the id of the article saved to it
//             $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
//
//             // If there's a note in the article
//             if (data.note) {
//                 // Place the title of the note in the title input
//                 $("#titleinput").val(data.note.title);
//                 // Place the body of the note in the body textarea
//                 $("#bodyinput").val(data.note.body);
//             }
//         });
// });

// When you click the savenote button
$(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
    // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});
