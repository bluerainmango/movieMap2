const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const movieRouter = require("./routes/movieRouter");
const userRouter = require("./routes/userRouter");
const reviewRouter = require("./routes/reviewRouter");
// const discoveredRouter = require("./routes/discoveredRouter");

const { globalErrorHandler } = require("./controllers/errorController");
const catchAsync = require("./util/catchAsync");
const ErrorFactory = require("./util/errorFactory");

const app = express();

// Attach Access-Control-Allow-Origin to every req header
const corsOptions = {
  // credentials: true,
  // origin: "http://localhost:3001",
};

app.use(cors(corsOptions));
app.options("*", cors());

app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// Frontend folder location
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
// } else {
//   app.use(express.static(path.join(__dirname, "public")));
// }
//! For test API call from frontend with react
app.use(express.static("client/build"));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Router
app.use("/api/movies", movieRouter);
app.use("/api/users", userRouter);
app.use("/api/reviews", reviewRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

// Error handling for invalid path access
app.all("*", (req, res, next) => {
  next(
    new ErrorFactory(
      404,
      `Cannot find ${req.originalUrl} on the server. Please check the path.`
    )
  );
});

// Global error handling middeware
app.use(globalErrorHandler);

module.exports = app;
