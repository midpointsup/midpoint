const routeService = (function () {
  "use strict";

  const module = {};
  const baseUrl = "http://localhost:3000";

  module.middle = async function (locations, category, keyword) {
    const encodedLocations = encodeURIComponent(JSON.stringify(locations));

    return fetch(
      `
      ${baseUrl}/api/routes/middle?locations=${encodedLocations}&category=${category}&keyword=${keyword}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    ).then((res) => {
      return res.json();
    });
  };

  return module;
})();

export default routeService;
