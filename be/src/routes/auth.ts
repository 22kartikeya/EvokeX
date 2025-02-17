import express from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import dotenv from "dotenv";
import {User} from "../models/User";

dotenv.config();

const router = express.Router();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    async (accessToken: string, refreshToken: string | undefined, profile: Profile, done: (error: any, user?: Express.User | false | null) => void) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = new User({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.photos?.[0]?.value || null,
            email: profile.emails?.[0]?.value || null
          });
          await user.save();
        }

        done(null, user); // Save user session
      } catch (err) {
        console.error("GitHub OAuth error: ", err);
        done(err, null);
      }
    }
  )
);

// Serialize user info into session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user info from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

router.get("/github", passport.authenticate("github", 
    {scope: ["user:email"]}) 
);

router.get("/github/callback",
    passport.authenticate("github", {
        failureRedirect: "/"
    }),
    (req, res) => {
        res.redirect(process.env.FRONTEND_URL as string + "/landingpage");
    }
);

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({message: "Logout Failed"});
        res.redirect(process.env.FRONTEND_URL as string + "/landingpage");
    });
});

export default router;
