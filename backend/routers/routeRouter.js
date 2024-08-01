import { Router } from "express";
import { getCenter } from "geolib";
import fetch from "node-fetch";

export const routesRouter = Router();

function getWeightedLocations(locations, radiuses) {
  if (Array.isArray(locations) === false || locations.length === 0) {
    return false;
  }

  if (Array.isArray(radiuses) === false || radiuses.length === 0) {
    return false;
  }

  const modeMultipliers = {
    WALK: 3,
    BIKE: 2,
    TRANSIT: 2,
    DRIVE: 1,
  };

  let duplicatedLocations = [];

  locations.forEach((location) => {
    const modeMultiplier =
      modeMultipliers[location.transportationMethod] || modeMultipliers.DRIVE;
    for (let i = 0; i < modeMultiplier; i++) {
      duplicatedLocations.push({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  });

  return duplicatedLocations;
}

routesRouter.get("/middle", async (req, res) => {
  let category = req.query.category;
  category = category.replace(" ", "_");
  category = category.toLowerCase();
  const locations = JSON.parse(req.query.locations);

  let geoResponse;
  const geoLocations = await Promise.all(
    locations.map(async (location) => {
      geoResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location.startLocation}&key=${process.env.GOOGLE_MAPS_API}`
      );
      const data = await geoResponse.json();
      if (!data.results) {
        return res.status(400).json({ error: "No location found" });
      }
      return {
        latitude: data.results[0].geometry.location.lat,
        longitude: data.results[0].geometry.location.lng,
        ...location,
      };
    })
  );

  const radiuses = geoLocations.map((location) => {
    return location.radius;
  });
  const weightedLocations = getWeightedLocations(geoLocations, radiuses);

  let midpoint = getCenter(weightedLocations);
  const midpointAddressResponse = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${midpoint.latitude},${midpoint.longitude}&result_type=street_address&key=${process.env.GOOGLE_MAPS_API}`
  );
  const midpointAddress = await midpointAddressResponse.json();
  if (!midpointAddress.results[0]) {
    return res.status(400).json({ error: "No midpoint address" });
  }
  const formattedMidpointAddress = midpointAddress.results[0].formatted_address;

  midpoint = { ...midpoint, address: formattedMidpointAddress };

  const radius = Math.min(...radiuses);
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${midpoint.latitude}%2c${midpoint.longitude}&radius=${radius}&type=${category}&key=${process.env.GOOGLE_MAPS_API}`
  );
  const data = await response.json();
  let places = data.results;
  places.unshift({
    name: "Midpoint",
    vicinity: formattedMidpointAddress,
    geometry: { location: { lat: midpoint.latitude, lng: midpoint.longitude } },
  });

  return res.json({ midpoint: midpoint, places: places });
});
