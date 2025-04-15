import express from "express";
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import dotenv from "dotenv";
import { User } from "../models/User";

dotenv.config();
const router = express.Router();

// Passport GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string | undefined,
      profile: Profile,
      done: (error: any, user?: Express.User | false | null) => void
    ) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          user = new User({
            githubId: profile.id,
            username: profile.username,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value || null,
            email: profile.emails?.[0]?.value || null,
          });

          await user.save();
        }

        done(null, user); // Save user in session
      } catch (err) {
        console.error("GitHub OAuth error: ", err);
        done(err, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Route: GitHub login
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// Route: GitHub callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}`);
  }
);

// Route: Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout Failed" });
    res.clearCookie("token"); // or however you're handling session
    return res.status(200).json({ message: "Logged out" });
  });
});

// Route: Get logged-in user
router.get("/user", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export default router;