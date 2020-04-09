const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const catchAsync = require("../util/catchAsync");
const ErrorFactory = require("../util/errorFactory");
const Email = require("../util/email");

//! begin of: mongodb initialization
const mongojs = require("mongojs");
const databaseUrl = encodeURI(
  "mongodb+srv://user_moviemap2:mIqinYfAq5BCCWu3@cluster0-kstvt.mongodb.net/moviemap2?retryWrites=true&w=majority"
);
const collections = ["user", "movie", "review"];
const db = mongojs(databaseUrl, collections);
db.on("error", (error) => {
  console.log("mongoDb::userController::error:", error);
});
db.on("connect", function () {
  console.log("mongoDb::userController::connected");
  console.log("userController::" + databaseUrl + "::" + collections);
});
db.runCommand({ ping: 1 }, function (err, res) {
  console.log("mongoDb::userController::ping");
  if (!err && res.ok) console.log("movieController::up&running");
});
//! end of: mongodb initialization

//! JWT CREATOR : Create JSON Web Token with a user id for authentication with stateless server
const createToken = (userId) => {
  const token = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return token;
};

//! ROUTE: SIGN UP
exports.signup = catchAsync(async (req, res, next) => {
  // 1. Get user's input
  const { firstName, lastName, username, password, email } = req.body;

  // 2. Validate for no input
  if (!username || !password || !firstName || !lastName || !email) {
    return next(new ErrorFactory(400, "Please provide all required info."));
  }

  // 3. Encrypt the password
  const encryptedPwd = await bcrypt.hash(password, 12);

  const newUserToSave = {
    username,
    password: encryptedPwd,
    email,
    firstName,
    lastName,
  };

  //-------------mySQL----------------
  // 4. Store a new user into DB
  // const result = await db.user.create({
  //   username,
  //   password: encryptedPwd,
  //   firstName,
  //   lastName,
  //   email,
  // });
  //-------------mySQL----------------

  //! MongoDB create
  db.user.insert(newUserToSave, async (error, data) => {
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      // 5. Create a JWT token
      // const token = createToken(result.dataValues.id);
      const token = createToken(data.id);

      // ! Send a welcome email
      const url = `${req.protocol}://${req.get("host")}`;
      // await new Email(data, url).sendWelcome();

      // 6. Send a respond with cookie: Prevents from accessing/modifying the cookie from anywhere except http browser. Expires after 1 hour.
      res
        .cookie("jwt", token, {
          maxAge: 3600000,
          httpOnly: true,
        })
        .status(200)
        .json({
          status: "success",
          message: "New user has been successfully created!",
          token,
          data: {
            username,
          },
        });
    }
  });
});

//! ROUTE: LOGIN
exports.login = catchAsync(async (req, res, next) => {
  // 1. Get login info from request
  const { username, password } = req.body;

  // 2. Validation(a): Check if username and password exist
  if (!username || !password) {
    return next(new ErrorFactory(400, "Please provide email and password."));
  }

  // 3. Bring user data matching to the username from DB
  //-------------SQL Sequelize----------------
  // const result = await db.user.findOne({ where: { username } });
  //-------------SQL Sequelize----------------

  db.user.findOne({ username: username }, async (error, data) => {
    if (error) res.send(error);
    else {
      console.log("🥑data", data);

      // 4. Validation(b): Check if there is a matching user and user's input password is same as that of DB(return Boolean)
      if (!(await bcrypt.compare(password, data.password))) {
        return next(
          new ErrorFactory(
            401,
            "There is no such a user or you typed the password wrong!"
          )
        );
      }

      // 5. Create JWT token with user's id
      const token = createToken(data.id);

      // 6. Send a response
      res
        .cookie("jwt", token, {
          maxAge: 3600000,
          httpOnly: true,
        })
        .status(200)
        .json({
          status: "success",
          message: "You are logged in successfully!",
          token,
        });
    }
  });
});

//! ROUTE: LOGOUT - Clear cookie having a JWT token
exports.logout = catchAsync(async (req, res, next) => {
  // Check if a user is logged out
  if (!req.cookies.jwt) {
    return next(new ErrorFactory(400, "You are already logged out!"));
  }

  // Clear cookie and token so the user can logout
  res.clearCookie("jwt").status(200).json({
    status: "success",
    message: "You are successfully loged out!",
  });
});

//! PROTECT Middleware
//Protects other middlewares coming after this middleware(Not allow to access to next middlewares if a request fails to be verified here for its authentication)
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Check if a user is logged in(via JWT)
  const token = req.cookies.jwt;

  if (!token) {
    return next(
      new ErrorFactory(401, "You are not logged in! Please log in first.")
    );
  }

  // 2. Verify the token and get user's id from it
  const decodedJwt = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log("✨ decoded JWT: ", decodedJwt); // format: { userId: 123, iat: 1582066423, exp: 1582070023 }

  // 3. Check if there is a user matching to that id from DB
  //-------------SQL Sequelize----------------
  // const result = await db.user.findByPk(decodedJwt.userId);
  //-------------SQL Sequelize----------------

  db.user.findOne({ _id: mongojs.ObjectId(req.params.id) }, (error, data) => {
    // If error occured
    if (error)
      return next(
        new ErrorFactory(
          "500",
          "Error occured during finding logged in user for PROTECT."
        )
      );
    else {
      // Got back the data but if there is no user
      if (!data) {
        return next(
          new ErrorFactory(
            401,
            "The user belonging to this token doesn't exist any longer."
          )
        );
      }

      // 4. Save user info to request in order to use it in next controllers.
      req.user = data;
      console.log("🤡 user: ", req.user);

      next();
    }
  });
});

//! ROUTE: forgot password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //?-------------SQL Sequelize----------------
  // const user = await db.user.findOne({ where: { email: req.body.email } });
  //?-------------SQL Sequelize----------------

  //* Get user info
  // mongojs doens't return user's info after update?? So manually find one
  db.user.findOne({ email: req.body.email }, async (error, user) => {
    // If error occured
    if (error) {
      return next(
        new ErrorFactory(
          "500",
          "Error occured during finding user for FORGOTPASSWORD."
        )
      );
    }

    if (!user) {
      return next(
        new ErrorFactory("No user founded with that email address.", 404)
      );
    }

    //* Create reset token and add it to user doc
    const randomToken = crypto.randomBytes(32).toString("hex");
    const encrypedToken = crypto
      .createHash("sha256")
      .update(randomToken)
      .digest("hex");

    console.log("🐯 randomToken/encrypedToken: ", randomToken, encrypedToken);

    // Time limit: 15 min
    // const tokenExpiresIn = Date.now() + 20 * 60 * 1000;

    //! not saving expire date at this moment(maybe later)
    //?-------------SQL Sequelize----------------
    // await db.user.update(
    //   {
    //     passwordResetToken: encrypedToken,
    //     // passwordResetTokenExpiresIn: tokenExpiresIn
    //   },
    //   { where: { email: req.body.email } }
    // );
    //?-------------SQL Sequelize----------------

    db.user.update(
      { email: req.body.email },
      { $set: { passwordResetToken: encrypedToken } },
      async (error, data) => {
        if (error) {
          return next(
            new ErrorFactory(
              "500",
              "Error occured during updating password for FORGOTPASSWORD."
            )
          );
        }

        try {
          //* send email with API link having a token
          const resetPwdURL = `${req.protocol}://${req.get(
            "host"
          )}/api/users/resetPassword/${randomToken}`;

          console.log("🍍 user:", user);
          await new Email(user, resetPwdURL).sendResetPwd();

          res.status(200).json({
            status: "success",
            message: "Password Token is sent to email.",
          });
        } catch (err) {
          //?-------------SQL Sequelize----------------
          // await db.user.update(
          //   {
          //     passwordResetToken: undefined,
          //     // passwordResetTokenExpiresIn: undefined
          //   },
          //   { where: { email: req.body.email } }
          // );
          //?-------------SQL Sequelize----------------

          db.user.update(
            { email: req.body.email },
            { $set: { passwordResetToken: undefined } },
            async (error, data) => {
              if (error) {
                return next(
                  new ErrorFactory(
                    "500",
                    "Error occured during updating password to undefined for FORGOTPASSWORD."
                  )
                );
              }

              console.log(
                "🦊 passwordResetToken is set to undefined. *data: ",
                data
              );
            }
          );

          return next(
            new ErrorFactory(
              500,
              "Error occurred while sending an email. Try again later!"
            )
          );
        }
      }
    );
  });
});

//! ROUTE: reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //* Encrypt the reseted password
  const encryptedDefaultPwd = await bcrypt.hash(
    process.env.DEFAULT_PASSWORD,
    12
  );

  //* Find a user who has a same hashed(encrypted) token
  //?-------------SQL Sequelize----------------
  // const user = await db.user.update(
  //   {
  //     password: encryptedDefaultPwd,
  //     passwordResetToken: "undefined",
  //     // passwordResetTokenExpiresIn: undefined
  //   },
  //   {
  //     where: { passwordResetToken: hashedToken },
  //   }
  // );
  //?-------------SQL Sequelize----------------

  db.user.update(
    { passwordResetToken: hashedToken },
    {
      $set: {
        password: encryptedDefaultPwd,
        passwordResetToken: "undefined",
      },
    },
    async (error, data) => {
      if (error) {
        return next(
          new ErrorFactory(
            "500",
            "Error occured during updating password to default password for RESETPASSWORD."
          )
        );
      }

      console.log("📌 data", data);
      if (!data.nModified) {
        return next(new ErrorFactory("Token is invalid.", 400));
      }

      res.status(200).json({
        status: "success",
        message: "Successfully reseted password!",
      });
    }
  );
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await db.user.findByPk(req.user.id);

  console.log(
    "🍓 tried to update pwd. user's info: ",
    user.dataValues,
    "🥝req.body:",
    req.body
  );

  if (!user.dataValues) {
    return next(
      new ErrorFactory("You are not logged in. Login first please!", 400)
    );
  }

  //* Check if entered pwd is correct
  const pwdIsCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  );

  if (!pwdIsCorrect) {
    return next(
      new ErrorFactory("Your current password is wrong. Type again!", 401)
    );
  }

  //* Encrypt the new pwd and save it to DB
  const encryptedPwd = await bcrypt.hash(req.body.newPassword, 12);
  await db.user.update({ password: encryptedPwd }, { where: { id: user.id } });

  //* Create new jwt token
  const newToken = createToken(user.id);

  res
    .cookie("jwt", newToken, {
      maxAge: 3600000,
      httpOnly: true,
    })
    .status(200)
    .json({
      status: "success",
      message: "Successfully updated password!",
      newToken,
      data: {
        username: user.username,
      },
    });
});
