const express = require("express");
const app = express();
// order of middleware matters!!
// need to reference the route in movie.js - line 4 ->
const movieRoute = require("./routes/movies");
const path = require("path");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

// next is a reference to the next function in the pipeline
app.use((req, res, next) => {
  // log date and time and the GET parameters
  console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body);
  next();
});

// register this movieRoute variable - line 6
app.use(movieRoute);
app.use(express.static("public"));

// handler for 404 error
app.use((req, res, next) => {
  res.status(404).send("You must be lost friend");
});

// handler for 500 error
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send("Internal server errorz");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () =>
console.log(`Server up @ ${PORT}`));
