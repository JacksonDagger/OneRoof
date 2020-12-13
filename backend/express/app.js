var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var auth = require("./auth.js");

var indexRouter = require("./routes/index");
var housesRouter = require("./routes/houses");
var roommatesRouter = require("./routes/roommates");
var youowemesRouter = require("./routes/youowemes");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/houses", housesRouter);
app.use("/roommates", roommatesRouter);
app.use("/youowemes", youowemesRouter);

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  console.log(res.locals.error); // eslint-disable-line no-console

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err });
});

module.exports = app;
