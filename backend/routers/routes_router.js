import { Router } from "express";
import { getCenter } from 'geolib';
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

    return duplicatedLocations;
}

routesRouter.get("/middle", async (req, res) => {
    const category = req.query.category;
    const keyword = req.query.keyword;
    const locations = JSON.parse(req.query.locations);

    let geoResponse;
    const geoLocations = await Promise.all(locations.map(async (location) => {
        geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location.address}&key=${process.env.GOOGLE_MAPS_API}`);
        const data = await geoResponse.json();
        return { latitude: data.results[0].geometry.location.lat, longitude: data.results[0].geometry.location.lng, ...location };
    }));

    const radiuses = geoLocations.map((location) => {
        return location.radius;
    });
    const weightedLocations = getWeightedLocations(geoLocations, radiuses);

    const midpoint = getCenter(weightedLocations);
    
    const radius = Math.min(...radiuses);
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyword}&location=${midpoint.latitude}%2c${midpoint.longitude}&radius=${radius}&type=${category}&key=${process.env.GOOGLE_MAPS_API}`);
    const data = await response.json();
    const places = data.results;

    return res.json({ midpoint: midpoint, places: places });
});

routesRouter.get("/route", async (req, res) => {
    
});