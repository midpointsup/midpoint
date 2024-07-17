const routeService = (function () {
  "use strict";

  const module = {};
  module.middle = async function (locations, category) {
    return fetch(
      `/api/routes/middle&locations=${locations}&category=${category}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    ).then((res) => {
      return res.json;
    });
  };

  return module;
})();

export { routeService };
