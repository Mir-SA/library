"use strict";
const Book = require("../db/model");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const data = await Book.find();
        res.status(200).send(data);
      } catch (error) {
        console.log("Error: ", error);
      }
    })

    .post(async function (req, res) {
      let title = req.body.title;
      const book = new Book({
        ...req.body,
      });
      //response will contain new book object including atleast _id and title
      try {
        if (title) {
          await book.save();
          res.status(200).send({ _id: book.id, title });
        } else {
          res.send("missing required field title");
        }
      } catch (error) {
        res.status(500).send("Error: ", error);
      }
    })

    .delete(async function (req, res) {
      //if successful response will be 'complete delete successful'
      try {
        await Book.deleteMany();
        res.send("complete delete successful");
      } catch (error) {
        console.log("Error: ", error);
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const data = await Book.findById(bookid);
        if (data != undefined) {
          res.status(200).send(data);
        } else {
          res.send("no book exists");
        }
      } catch (error) {
        res.status(500).send("Error: ", error);
      }
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      let update = {
        $push: { comments: comment }, // Add to the array
        $inc: { commentcount: 1 }, // Increment the count
      };
      //json res format same as .get
      try {
        if (comment == undefined || typeof comment != "string") {
          res.send("missing required field comment");
        } else {
          let data = await Book.findByIdAndUpdate(bookid, update, {
            new: true,
          });
          if (data == null) {
            res.send("no book exists");
          } else {
            res.send(data);
          }
        }
      } catch (error) {
        res.status(500).send("Error: ", error);
      }
    })

    .delete(async function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const result = await Book.findByIdAndDelete(bookid);
        if (result != null) {
          res.status(200).send("delete successful");
        } else {
          res.send("no book exists");
        }
      } catch (error) {
        res.status(500).send("Error: ", error);
      }
    });
};
