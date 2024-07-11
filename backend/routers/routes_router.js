import { Router } from "express";
import { getCenter, isPointWithinRadius } from 'geolib';
import fetch from 'node-fetch';

export const routesRouter = Router();

function getWeightedLocations(locations, radiuses) {
    if (Array.isArray(locations) === false || locations.length === 0) {
        return false;
    }

    if (Array.isArray(radiuses) === false || radiuses.length === 0) {
        return false;
    }

    const modeMultipliers = {
        walking: 3,
        biking: 2,
        bus: 2,
        driving: 1
    };

    let duplicatedLocations = [];

    locations.forEach((location, index) => {
        const modeMultiplier = modeMultipliers[location.mode] || modeMultipliers.driving;
        for (let i = 0; i < modeMultiplier; i++) {
            duplicatedLocations.push({ latitude: location.latitude, longitude: location.longitude });
        }
    });

    console.log('duplicatedLocations:',duplicatedLocations);

    return duplicatedLocations;
}

routesRouter.get("/middle", async (req, res) => {
    const category = req.params.category;
    const locations = req.params.locations;
    // const locations = [
    //     { latitude: 52.516272, longitude: 13.377722, mode: "walking", radius: 10},
    //     { latitude: 71.515, longitude: 127.453619, mode: "driving", radius: 20},
    //     { latitude: 171.503333, longitude: -10.119722, mode: "driving", radius: 30}
    // ];

    console.log('locations', locations);

    const radiuses = locations.map((location) => {
        return location.radius;
    });
    const weightedLocations = getWeightedLocations(locations, radiuses);

    const midpoint = getCenter(weightedLocations);

    // const radiusLocations = checkInRadius(midpoint, locations);
    // updateMidpoint(midpoint, radiusLocations);
    
    const radius = Math.min(...radiuses);

    console.log(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${category}&location=${midpoint.latitude},${midpoint.longitude}&type=${category}&key=${process.env.GOOGLE_MAPS_API}`);
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${category}&location=${midpoint.latitude},${midpoint.longitude}&type=${category}&key=${process.env.GOOGLE_MAPS_API}`);
    const data = await response.json();
    const places = data.results;

    return res.json({ midpoint, places });
});

routesRouter.get("/route", async (req, res) => {
    const startingLocation = req.params.startingLocation;
    const endingLocation = req.params.endingLocation;
    const transportation = req.params.transportation;

    //get response with google api directions
    // const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startingLocation}&destination=${endingLocation}&mode=${transportation}&key=${process.env.GOOGLE_MAPS_API}`);
});