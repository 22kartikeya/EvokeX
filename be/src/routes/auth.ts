import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import { User } from "./models/User";

dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists in database
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          // Create a new user if not exists
          user = new User({
            githubId: profile.id,
            username: profile.username,
            displayName: profile.displayName,
            avatar: profile.photos[0].value,
            email: profile.emails ? profile.emails[0].value : null,
          });

          await user.save();
        }

        done(null, user); // Save user session
      } catch (err) {
        console.error("Error in GitHub Strategy:", err);
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