import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";

export function initPassport() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL,
  } = process.env;

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
          const tokenKey = {
            uname: profile.displayName,
            uemail: profile.emails?.[0]?.value,
            uid: profile.id,
            role: "user",
            provider: "google",
          };
          done(null, tokenKey);
        }
      )
    );
  }

  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && GITHUB_CALLBACK_URL) {
    passport.use(
      new GithubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL,
        },
        (accessToken, refreshToken, profile, done) => {
          const tokenKey = {
            uname: profile.displayName || profile.username,
            uemail: profile.emails?.[0]?.value,
            uid: profile.id,
            role: "user",
            provider: "github",
          };
          done(null, tokenKey);
        }
      )
    );
  }
}
