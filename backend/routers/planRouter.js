import { Router } from "express";
import { User } from "../models/users.js";
import { isAuthenticated } from "../middleware/auth.js";
import { Op } from "sequelize";
import { Plan } from "../models/plan.js";
import { Trip } from "../models/trip.js";

export const planRouter = Router();

planRouter.post("/", isAuthenticated, async (req, res) => {
  const name = req.body.name;
  const members = req.body.members;
  const category = req.body.category;
  const date = req.body.date;
  const colour = req.body.colour;

  if (!name || !members || members.length <= 0 || !date) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const users = await Promise.all(
    members.map((member) =>
      User.findOne({ where: { username: member }, attributes: ["id"] })
    )
  );
  if (users.some((member) => !member)) {
    return res.status(404).json({ error: "Member not found" });
  }
  const membersList = users.map((member) => member.id);
  const plan = await Plan.create({
    ownerId: req.user.id,
    memberCount: members.length,
    name: name,
    category: category,
    date: date,
    colour: colour,
  });
  await plan.addMembers(membersList);
  const planResponse = plan.toJSON();
  planResponse.members = membersList;
  membersList.push(req.user.id);
  for (let i = 0; i < membersList.length; i++) {
    await Trip.create({
      startLocation: "",
      startTime: new Date(date).toTimeString().split(" ")[0],
      endLocation: "",
      transportationMethod: "",
      radius: 100,
      PlanId: plan.id,
      UserId: membersList[i],
    });
    req.io.in("user" + membersList[i]).emit("planCreate", planResponse);
  }
  return res.json(planResponse);
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

planRouter.get("/", isAuthenticated, async (req, res) => {
  let plans = await Plan.findAll({
    include: [
      {
        model: User,
        as: "owner",
        attributes: ["username", "id", "picture"],
      },
      {
        model: User,
        as: "members",
        attributes: ["username", "id", "picture"],
      },
    ],
    where: {
      [Op.or]: [{ "$owner.id$": req.user.id }, { "$members.id$": req.user.id }],
    },
  });
  return res.json(plans);
});

planRouter.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const plan = await Plan.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username", "id", "picture"],
          include: [
            {
              model: Trip,
              where: {
                PlanId: req.params.id,
              },
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
              where: {
                PlanId: req.params.id,
              },
            },
          ],
        },
      ],
    });
    if (!plan.members.some((member) => member.id === plan.owner.id)) {
      plan.members.push(plan.owner);
    }
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

    await plan.destroy();

    plan.members.forEach((member) => {
      req.io.in("user" + member.id).emit("planDelete", plan.id);
    });

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
