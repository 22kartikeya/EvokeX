import express from 'express';
import session from 'express-session';
import passport from 'passport';   
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

mongoose.connect(process.env.MONGO_URI as string)
.then(() => console.log('connected to db'))
.catch(err => console.log(err));

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Github Auth Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', passport.authenticate("github", {failureRedirect: "/"}),
(req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
}
);

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err) {
            return res.status(500).json({message: "Logout failed"});
        }
        res.redirect(process.env.FRONTEND_URL as string);
    })
})

app.get("/user", (req, res) => {
    res.json(req.user);
})

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
})