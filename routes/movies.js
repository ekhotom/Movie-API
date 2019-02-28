const express = require("express");
const router = express.Router();
// supposed to do all the db stuff in the models but need this for new mongoose @ POST route
const mongoose = require("mongoose");

const MovieModel = require("../models/moviemodel");

// npm run start-watch to start nodemon


// querystring => query property on the request object
// localhost:8081/movies?title=jurassic park
/*router.get("/movies", (req, res) => {
  if (req.query.title) {
    res.send(`It's working!, ${req.query.title}`);
  } else {
      res.send("You have requested a movie");
    }
});*/

// Define the home page route
router.get("/movies", function(req, res) {
  res.send("You need to use POST, PUT, DELETE AND GET requests");
});

// gets all (limited to 1000)
// localhost:8081/movies/getall
router.get("/movies/getall", (req, res) => {
  MovieModel
    .find()
    .limit(1000)
    .select("_id title year cast genres")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        movies: docs.map(doc => {
          return {
            _id: doc._id,
            title: doc.title,
            year: doc.year,
            cast: doc.cast,
            genres: doc.genres
            }
          })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// params property on the request object
// localhost:8081/movies/jurassic park
/*router.get("/movies/:movietitle", (req, res) => {
  res.send(`It's working!, ${req.params.movietitle}`);
});*/

// dynamic path parameter, matching route
router.get("/movies/:id", (req, res, next) => {
  const id = req.params.id;
// object/model imported at the top
MovieModel.findById(id, function(err, movie) {
  if (movie) {
    res.status(200).json({
      movie: movie,
      request: {
        type: "GET",
        url: "http://localhost:8081/movies"
      }
    });
  } else {
    res.status(404).json({ message: "Sorry no matches for that id" })
  }
});
  /*.select("movie title year cast genres _id")
  .then(doc => {
    console.log("From db", doc);
    if (doc) {
      res.status(200).json({
        movie: doc,
        request: {
          type: "GET",
          url: "http://localhost:8081/movies"
        }
      });
    } else {
      // 404 status for not found
      res.status(404).json({ message: "Sorry, no matches for that Id"});
    }
    res.status(200).json(doc);
  })
  .catch(err => {
    // 500 internal server error
    res.status(500).json({ error: err });
  });*/
});

router.get("/error", (req, res) => {
  throw new Error("This is a forced error");
});

// add a new movie
// POST localhost:8081/movies/
router.post("/movies", (req, res) => {
  /*// req.body needs to be present
  if (!req.body) {
    // 400 = bad request
    return res.status(400).send("Request body is missing's");
  }
  // mongoose model is doing the validation so it's not needed but could be added
  const model = new MovieModel(req.body);
  model.save()
    .then(doc => {
      if (!doc || doc.length === 0) {
        return res.status(500).send(doc);
      }
      // 201 = resource was created
      res.status(201).json(doc);
    })
    .catch(err => {
      res.status(500).json({
        err
      });
    });*/

    const model = new MovieModel({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      year: req.body.year,
      cast: req.body.cast,
      genres: req.body.genres
    });
    model
      .save()
      .then(result => {
        console.log(result);
        res.status(201).json({
          message: "Added a movie succesfully",
          addedMovie: {
            _id: result._id,
            title: result.title,
            year: result.year,
            cast: result.cast,
            genres: result.genres,
            request: {
              type: "GET",
              url: "http://localhost:8081/movies/" + result._id
            }
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
});

// by year route
/*router.get("/movies/year", (req, res) => {
  if (!req.query.year) {
    // error
    return res.status(400).send("Missing URL parameters: year");
  }
  MovieModel.findOne({
    _id: req.query.year
  })
    .then (doc => {
      res.json(doc);
    })
    .catch (err => {
      res.status(500).json(err);
    });
});*/

// PUT/UPDATE/PATCH route localhost:8081/movies/ by _id
// http://localhost:8081/movies?_id=5c1a6cba7eae1a07b017f00a (with req.query.id)
router.put("/movies/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    // error
    return res.status(400).send("Missing URL parameters: _id");
  }
  // dunno why error msg, not using findandmodify
  MovieModel.findOneAndUpdate({
    _id: id
  }, req.body, {
    new: true
  })
    .then (doc => {
      res.status(200).json({
        message: "Movie updated",
        request: {
          type: "GET",
          url: "http://localhost:8081/movies/" + id
        }
      });
    })
    .catch (err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// DELETE route localhost:8081/movies/delete
//http://localhost:8081/movies/delete?_id=5c1a6cba7eae1a07b017f00a
router.delete("/movies/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    // 400 bad request
    return res.status(400).send("Missing URL parameters: _id");
  }
  // findOneAndDelete??
  MovieModel.findOneAndDelete({
    _id: id
  })
    .then (doc => {
      res.status(200).json({
        message: "Movie deleted",
        request: {
          type: "POST",
          url: "http://localhost:8081/movies/",
          body: { title: "String", year: "Number", cast: "Array", genres: "Array" }
        }
      });
    })
    .catch (err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});


// allows to import to index.js
module.exports = router;
