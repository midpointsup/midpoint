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

    console.log('duplicatedLocations:', duplicatedLocations);

    return duplicatedLocations;
}

routesRouter.get("/middle", async (req, res) => {
    console.log('req.query:', req.query);
    const category = req.query.category;
    const keyword = req.query.keyword;
    const locations = JSON.parse(req.query.locations);

    let geoResponse;
    const geoLocations = await Promise.all(locations.map(async (location) => {
        geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location.address}&key=${process.env.GOOGLE_MAPS_API}`);
        const data = await geoResponse.json();
        return { latitude: data.results[0].geometry.location.lat, longitude: data.results[0].geometry.location.lng, ...location };
    }));

    console.log('locations', geoLocations);

    const radiuses = geoLocations.map((location) => {
        return location.radius;
    });
    const weightedLocations = getWeightedLocations(geoLocations, radiuses);

    const midpoint = getCenter(weightedLocations);
    console.log('midpoint:', midpoint);

    // const radiusLocations = checkInRadius(midpoint, locations);
    // updateMidpoint(midpoint, radiusLocations);

    const radius = Math.min(...radiuses);

    // const encodedMidpoint = encodeURIComponent(JSON.stringify(midpoint.latitude + ',' + midpoint.longitude));
    // console.log('encodedMidpoint:', encodedMidpoint, midpoint.latitude, midpoint.longitude);

    // console.log(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${category}&location=${midpoint.latitude}%2c${midpoint.longitude}&type=${category}&radius=${radius}&key=${process.env.GOOGLE_MAPS_API}`);
    // const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=cruise&location=-33.8670522%2C151.1957362&radius=1500&type=restaurant&key=${process.env.GOOGLE_MAPS_API}`);
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=${keyword}&location=${midpoint.latitude}%2c${midpoint.longitude}&radius=${radius}&type=${category}&key=${process.env.GOOGLE_MAPS_API}`);
    const data = await response.json();
    const places = data.results;

    return res.json({ midpoint: midpoint, places: places });
});

routesRouter.get("/route", async (req, res) => {
    // const startingLocation = req.query.startingLocation;
    // const endingLocation = req.query.endingLocation;
    // const transportation = req.query.transportation;

    const startLoc = {
        "location": {
            "latLng": {
                "latitude": 37.419734,
                "longitude": -122.0827784
            }
        }
    }

    const endLoc = {
        "location": {
            "latLng": {
                "latitude": 37.417670,
                "longitude": -122.079595
            }
        }
    }

    const travelMode = "DRIVE"


    //get response with google api directions
    // const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startingLocation}&destination=${endingLocation}&mode=${transportation}&key=${process.env.GOOGLE_MAPS_API}`);
    // const data = await response.json();
    // const route = data.routes[0].legs[0].steps;

    //post https://routes.googleapis.com/directions/v2:computeRoutes
    const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        },
        body: JSON.stringify({
            origin: startLoc,
            destination: endLoc,
            travelMode: travelMode,
        }),
    });

    const data = await response.json();
    const route = data;

    return res.json({ route: route });
});