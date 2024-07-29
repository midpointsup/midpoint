import { Router } from "express";
import { User } from "../models/users.js";
import { isAuthenticated } from "../middleware/auth.js";
import crypto from "crypto";
import { Op } from "sequelize";
import { Plan } from "../models/plan.js";
import { Trip } from "../models/trip.js";

export const planRouter = Router();

planRouter.post("/", async (req, res) => {
  const name = req.body.name;
  const members = req.body.members;
  const owner = req.body.ownerId;
  const category = req.body.category;
  const address = req.body.address;
  const date = req.body.date;

  if (!name || !owner || !members || members.length <= 0 || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const ownerUser = await User.findOne({
      where: {
        id: owner,
      },
    });
    if (!ownerUser) {
      return res.status(404).json({ error: "Owner not found" });
    }

    let membersList = [];
    for (const member of members) {
      const user = await User.findOne({
        where: {
          username: member,
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
      category: category ? category : "",
      address: address ? address : "",
      date: date,
    });

    await plan.addMembers(membersList);

    let planWithMembers = await Plan.findByPk(plan.id, {
      include: [
        {
          model: User,
          as: "members",
          attributes: ["username", "id", "picture"],
        },
      ],
    });

    membersList.forEach((member) => {
      req.io.in("user" + member).emit("planCreate", planWithMembers);
    });

    return res.json(planWithMembers);
  } catch {
    return res.status(422).json({ error: "Failed to create plan" });
  }
});

//get all plans for the member
planRouter.get("/members/:memberId", async (req, res) => {
  try {
    let plans = await Plan.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username", "id", "picture"],
          include: [
            {
              model: Trip,
            },
          ],
        },
        {
          model: User,
          as: "members",
          attributes: ["username", "id", "picture"],
          include: [
            {
              model: Trip,
            },
          ],
        },
      ],
      where: {
        [Op.or]: [
          { "$owner.id$": req.params.memberId },
          { "$members.id$": req.params.memberId },
        ],
      },
    });

    plans = plans.map((plan) => plan.toJSON());
    plans.forEach((plan) => {
      if (!plan.members.some((member) => member.id === plan.owner.id)) {
        plan.members.push(plan.owner);
      }
    });

    plans.forEach((plan, index) => {
      plan.members.forEach((member, memberIndex) => {
        if (member.Trips) {
          plans[index].members[memberIndex].Trips = member.Trips.filter(
            (trip) => trip.PlanId === plan.id
          );
        }
      });
    });

    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch plans", error });
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

planRouter.delete("/:id", async (req, res) => {
  try {
    const plan = await Plan.findOne({
      include: [
        {
          model: User,
          as: "members",
          attributes: ["id"],
          include: [
            {
              model: Trip,
            },
          ],
        },
      ],
      where: {
        id: req.params.id,
      },
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // TODO: Uncomment this code after implementing authentication
    // if (plan.ownerId !== req.user.id) {
    //   // User trying to delete the plan is not the owner
    //   return res
    //     .status(403)
    //     .json({ error: "Not authorized to delete this plan" });
    // }

    plan.members.forEach((member) => {
      req.io.in("user" + member.id).emit("planDelete", plan.id);
    });

    await plan.destroy();

    return res.json({ message: "Plan deleted" });
  } catch {
    return res.status(500).json({ error: "Failed to delete plan" });
  }
});

planRouter.post("/:id/members/:memberId/trip", async (req, res) => {
  const startLocation = req.body.startLocation ?? "";
  const startTime =
    req.body.startTime ?? new Date().toTimeString().split(" ")[0];
  const endLocation = req.body.endLocation ?? "";
  const transportationMethod = req.body.transportationMethod ?? "";
  const radius = req.body.radius ?? 100;

  try {
    const trip = await Trip.create({
      startLocation: startLocation,
      startTime: startTime,
      endLocation: endLocation,
      transportationMethod: transportationMethod,
      radius: radius,
      PlanId: req.params.id,
      UserId: req.params.memberId,
    });

    return res.json(trip);
  } catch (e) {
    return res.status(422).json({ error: e });
  }
});

planRouter.patch("/:id", async (req, res) => {
  const name = req.body.name;
  const category = req.body.category;
  const address = req.body.address;
  const date = req.body.date;

  try {
    const plan = await Plan.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    plan.name = name;
    plan.category = category;
    plan.address = address;
    plan.date = date;

    await plan.save();

    req.io.in("room" + req.params.id).emit("planUpdate", plan);

    return res.json(plan);
  } catch {
    return res.status(422).json({ error: "Failed to update plan" });
  }
});

planRouter.patch("/:id/members/:memberId/trip/:tripId", async (req, res) => {
  const startLocation = req.body.startLocation ?? "";
  const startTime =
    req.body.startTime ?? new Date().toTimeString().split(" ")[0];
  const endLocation = req.body.endLocation ?? "";
  const transportationMethod = req.body.transportationMethod ?? "";
  const radius = req.body.radius ?? 100;
  const waypoints = req.body.waypoints ?? [];

  try {
    const trip = await Trip.findOne({
      where: {
        id: req.params.tripId,
        PlanId: req.params.id,
        UserId: req.params.memberId,
      },
      include: {
        model: User,
        attributes: ["username", "id", "picture", "email"],
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
    trip.waypoints = waypoints;

    await trip.save();

    const roomId = req.params.id.toString();
    req.io.in("room" + roomId).emit("trip", trip);
    return res.json({ trip: trip });
  } catch {
    return res.status(422).json({ error: "Failed to update trip" });
  }
});

planRouter.get("/:id/members/:memberId/trip", async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: {
        PlanId: req.params.id,
        UserId: req.params.memberId,
      },
      include: {
        model: User,
        attributes: ["username", "id", "picture", "email"],
      },
    });
    return res.json({ trip: trip });
  } catch {
    return res.status(500).json({ error: "Failed to fetch trip" });
  }
});

planRouter.get("/:id/members/trip", async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: {
        PlanId: req.params.id,
      },
      include: {
        model: User,
        attributes: ["username", "id", "picture", "email"],
      },
    });
    return res.json({ trips: trips });
  } catch {
    return res.status(500).json({ error: "Failed to fetch trips" });
  }
});
