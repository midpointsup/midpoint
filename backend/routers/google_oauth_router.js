import { Router } from "express";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { GoogleToken } from "../models/googleTokens.js";
import { User } from "../models/users.js";
import { generateAccessToken } from "../helpers/auth.js";

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

    const user = await findUser(userResponse.data.email, userResponse.data.name);

    // If user not found, want to ask user to sign up with a username
    if (!user) {
      return res.status(200).json({
        username: userResponse.data.name,
        email: userResponse.data.email,
        picture: userResponse.data.picture,
        token: null,
        userId: null,
      });
    }

    await updateUserProfilePic(
      userResponse.data.email,
      userResponse.data.picture
    );
    await GoogleToken.create({
      access_token: tokens.tokens.access_token,
      refresh_token: tokens.tokens.refresh_token,
      UserId: user.id,
    });
    const accessToken = await generateAccessToken(user.id);
    return res.status(200).json({
      username: userResponse.data.name,
      email: userResponse.data.email,
      picture: userResponse.data.picture,
      token: accessToken,
      userId: user.id,
    });
  } catch (error) {
    return res.status(500).json({ message: error });
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
