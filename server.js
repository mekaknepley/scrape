/* Showing Mongoose's "Populated" Method
 * =============================================== */

// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/note.js");
var ArticleTypes = require("./models/article.js");
var Article = ArticleTypes.article;
var SavedArticle = ArticleTypes.savedArticle;
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
//mongoose.connect("mongodb://localhost/scrape");
mongoose.connect("mongodb://heroku_37d6flj3:5742v17f606k180rd3pe7tu3o7@ds155644.mlab.com:55644/heroku_37d6flj3");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
// ======
var router = express.Router();

router.get("/", function (req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
        res.render("articles", {articles: doc});
    });
});

router.get("/saved", function (req, res) {
    SavedArticle.find({}, function(error, doc) {
        res.render("savedarticles", {articles: doc});
    });
});

// A GET request to scrape the echojs website
router.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    request("http://www.huffingtonpost.com/section/us-news", function(error, response, html) {

        var results = [];

        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h2 within an article tag, and do the following:
        $('.card__content').each(function(i, element) {

            // Save an empty result object
            var result = {};

            if ($(this).children("a").attr("href") != undefined) {
                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).find("a").text();
                var linkStart = "http://www.huffingtonpost.com";
                result.link = linkStart + $(this).children("a").attr("href").toString();

                results.push(result);

                request(result.link, function(error, response, html) {

                    //console.log(html);

                    // Then, we load that into cheerio and save it to $ for a shorthand selector
                    var $ = cheerio.load(html);
                    result.summary = $(".headline__subtitle").text();

                    //console.log(result.summary);

                    // Using our Article model, create a new entry
                    // This effectively passes the result object to the entry (and the title and link)
                    var entry = new Article(result);

                    // Now, save that entry to the db
                    entry.save(function (err, doc) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                        }
                        // Or log the doc
                        else {
                            //console.log(doc);
                        }
                    });
                });
            }
        });

        // Tell the browser that we finished scraping the text
        //res.send("Scrape Complete!!!");
        res.json(results);
    });
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

router.get("/save/:id", function(req, res) {
    Article.findOne({ "_id": req.params.id })
        .exec(function(error, doc) {
            var result = {};
            result.title = doc.title;
            result.link = doc.link;
            result.summary = doc.summary;
            var entry = new SavedArticle(result);

            // Now, save that entry to the db
            entry.save(function (err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                // Or log the doc
                else {
                    //console.log(doc);
                    res.json(doc);
                }
            });
        });
});

router.get("/delete/:id", function(req, res) {
   SavedArticle.remove({ "_id": req.params.id })
       .exec(function(error, doc) {
           console.log("deleted " + req.params.id);
           res.json(doc);
       });
});

// Grab an article by it's ObjectId
router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({ "_id": req.params.id })
    // ..and populate all of the notes associated with it
        .populate("note")
        // now, execute our query
        .exec(function(error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});


// Create a new note or replace an existing note
router.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);

    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise
        else {
            // Use the article id to find and update it's note
            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
            // Execute the above query
                .exec(function(err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    else {
                        // Or send the document to the browser
                        res.send(doc);
                    }
                });
        }
    });
});

app.use("/", router);

// Listen on port 3005
app.listen(process.env.PORT || 3005, function() {
    console.log("App running on port 3005!");
});
