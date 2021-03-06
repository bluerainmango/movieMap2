import React, { useState } from "react";
// import { Redirect } from "react-router-dom";
import axios from "axios";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
// import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn(props) {
  const classes = useStyles();

  const [forgotPwdEmail, setforgotPwdEmail] = useState("");

  const handleChange = (e) => {
    const email = e.target.value;

    console.log("🥞 email:", email);

    setforgotPwdEmail(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🧄submit form with email:", forgotPwdEmail);

    try {
      const res = await axios.post(
        "/api/users/forgotPassword",
        {
          email: forgotPwdEmail,
        },
        { withCredentials: true }
      );

      console.log("🍕 result of forgotpwd api call: ", res);

      // Redirect to homepage
      props.history.push("/");
    } catch (err) {
      console.log("🚨", err.response.data.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {/* {console.log("🥬", user)}
      {console.log("🐻", props, setCurrentUser)} */}
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="email"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
          />
          <Button
            type="submit"
            // onClick={() => {props.history.push("/") }}
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Forgot Password
          </Button>
        </form>
      </div>
    </Container>
  );
}
