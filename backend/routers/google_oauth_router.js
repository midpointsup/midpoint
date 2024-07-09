import { Router } from "express";
import cors from "cors";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { GoogleToken } from "../models/googleTokens.js";
import { AccessToken } from "../models/accessTokens.js";
import { User } from "../models/users.js";
import crypto from "crypto";

export const googleOAuthRouter = Router();

googleOAuthRouter.post("/", async (req, res) => {
  try {
    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    );

    const tokens = await oAuth2Client.getToken(req.headers.authorization);
    oAuth2Client.setCredentials(tokens);

    // Fetch user details using the access token
    const userResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.tokens.access_token}`,
        },
      }
    );

    let user = await findUser(userResponse.data.email, userResponse.data.name);
    if (!user) {
      user = await createUser(
        userResponse.data.email,
        userResponse.data.name,
        userResponse.data.picture
      );
      if (!user) {
        return res.status(422).json({ error: user.error });
      }
    } else {
      user = await updateUserProfilePic(
        userResponse.data.email,
        userResponse.data.picture
      );
      if (!user) {
        console.log("Unable to update profile picture");
      }
    }
    const token = await storeGoogleToken(
      user,
      tokens.tokens.access_token,
      tokens.tokens.refresh_token
    );
    if (!token) {
      return res.status(500).json({ error: "Unable to store token" });
    }
    const accessToken = await generateAccessToken(user);
    if (!accessToken) {
      return res.status(500).json({ error: "Unable to generate access token" });
    }

    return res.status(200).json({
      username: userResponse.data.name,
      email: userResponse.data.email,
      picture: userResponse.data.picture,
      token: accessToken.access_token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save code" });
  }
});

const updateUserProfilePic = async (email, picture) => {
  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return { error: "User not found" };
    }
    user.picture = picture;
    await user.save();
    return user;
  } catch (error) {
    return { error: "Failed to update profile picture" };
  }
};

const findUser = async (email, name) => {
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  return user;
};

const createUser = async (email, name, picture) => {
  try {
    const user = await User.create({
      email: email,
      username: name,
      picture: picture,
    });
    return user;
  } catch (error) {
    return null;
  }
};

const storeGoogleToken = async (user, access_token, refresh_token) => {
  //GET USER ID and store token in database
  try {
    const token = await GoogleToken.create({
      access_token: access_token,
      refresh_token: refresh_token,
      UserId: user.id,
    });
    return token;
  } catch (error) {
    return { error: "Failed to store google token" };
  }
};

const generateAccessToken = async (user) => {
  const randomToken = crypto.randomBytes(16).toString("hex");
  let today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  try {
    let accessToken = await AccessToken.create({
      access_token: randomToken,
      UserId: user.id,
      expires_in: tomorrow.toISOString(),
    });
    return accessToken;
  } catch (error) {
    console.log("Failed to generate access token");
    return null;
  }
};
