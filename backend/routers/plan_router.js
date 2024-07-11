import { Router } from "express";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { GoogleToken } from "../models/googleTokens.js";
import { AccessToken } from "../models/accessTokens.js";
import { User } from "../models/users.js";
import crypto from "crypto";
import { Plan } from "../models/plan.js";
import { Trip } from "../models/trip.js";

export const planRouter = Router();

planRouter.post("/", async (req, res) => {
  const { name, owner, members } = req.body;

  if (!name || !owner || !members || members.length <= 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const ownerUser = await User.findOne({
      where: {
        email: owner,
      },
    });
    if (!ownerUser) {
      return res.status(404).json({ error: "Owner not found" });
    }

    let membersList = [];
    for (const member of members) {
      const user = await User.findOne({
        where: {
          email: member,
        },
      });
      if (!user) {
        return res.status(404).json({ error: "Member not found" });
      }
      membersList.push(user.id);
    }

    const plan = await Plan.create({
      ownerId: ownerUser.id,
      memberCount: members.length,
      name: name,
    });

    membersList.forEach(async (member) => {
      await plan.addUser(member);
    });

    return res.json({
      name: plan.name,
      memberCount: plan.memberCount,
      owner: ownerUser.email,
    });
  } catch {
    return res.status(422).json({ error: "Failed to create plan" });
  }
});

planRouter.get("/", async (req, res) => {
  try {
    const plans = await Plan.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"],
        },
      ],
    });
    return res.json(plans);
  } catch {
    return res.status(500).json({ error: "Failed to fetch plans" });
  }
});

planRouter.get("/:id", async (req, res) => {
  try {
    const plan = await Plan.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username"],
        },
      ],
    });
    return res.json(plan);
  } catch {
    return res.status(500).json({ error: "Failed to fetch plan" });
  }
});

planRouter.post("/:id/members/:memberId/trip", async (req, res) => {
  const {
    startLocation,
    startTime,
    endLocation,
    transportationMethod,
    radius,
  } = req.body;

  if (
    !startLocation ||
    !startTime ||
    !endLocation ||
    !transportationMethod ||
    !radius
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log(
      startLocation,
      startTime,
      endLocation,
      transportationMethod,
      radius,
      req.params.id
    );
    const trip = await Trip.create({
      startLocation: startLocation,
      startTime: startTime,
      endLocation: endLocation,
      transportationMethod: transportationMethod,
      radius: radius,
      PlanId: req.params.id,
      UserId: req.params.memberId,
    });

    req.io.emit("trip", trip);

    return res.json(trip);
  } catch (e) {
    return res.status(422).json({ error: e });
  }
});

planRouter.patch("/:id//members/:memberId/trip/:tripId", async (req, res) => {
  const {
    startLocation,
    startTime,
    endLocation,
    transportationMethod,
    radius,
  } = req.body;

  if (
    !startLocation ||
    !startTime ||
    !endLocation ||
    !transportationMethod ||
    !radius
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const trip = await Trip.findOne({
      where: {
        id: req.params.tripId,
        PlanId: req.params.id,
        UserId: req.params.memberId,
      },
    });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    trip.startLocation = startLocation;
    trip.startTime = startTime;
    trip.endLocation = endLocation;
    trip.transportationMethod = transportationMethod;
    trip.radius = radius;

    await trip.save();

    req.io.emit("trip", trip);
    return res.json(trip);
  } catch {
    return res.status(422).json({ error: "Failed to update trip" });
  }
});

planRouter.get("/:id/trip", async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: {
        PlanId: req.params.id,
      },
    });
    return res.json(trips);
  } catch {
    return res.status(500).json({ error: "Failed to fetch trips" });
  }
});

planRouter.get("/:id/trip/:tripId", async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: {
        id: req.params.tripId,
        PlanId: req.params.id,
      },
    });
    return res.json(trip);
  } catch {
    return res.status(500).json({ error: "Failed to fetch trip" });
  }
});
