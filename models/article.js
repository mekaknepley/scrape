// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
    // title is a required string
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    // link is a required string
    link: {
        type: String,
        required: true,
        unique: true
    },
    // This only saves one note's ObjectId, ref refers to the Note model
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);
var SavedArticle = mongoose.model("SavedArticle", ArticleSchema);

// Export the model
module.exports = {article: Article, savedArticle: SavedArticle};
