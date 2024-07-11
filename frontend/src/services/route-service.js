const routeService = (function () {
  "use strict";

  const module = {};
  const baseUrl = "http://localhost:3000";

  module.middle = async function (locations, category, keyword) {
    console.log("locations in middle service: ", locations);
    const encodedLocations = encodeURIComponent(JSON.stringify(locations));
    console.log("encodedLocations in middle service: ", encodedLocations);

    return fetch(
      `
      ${baseUrl}/api/routes/middle?locations=${encodedLocations}&category=${category}&keyword=${keyword}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    ).then((res) => {
      console.log("res in middle service: ", res);
      return res.json();
    });
  };

  return module;
})();

export default routeService;
