const routeService = (function () {
    "use strict";
  
    const module = {};
    module.middle = async function (locations, category) {
        console.log('locations in middle service: ',locations);
      return fetch(`/api/routes/middle&locations=${locations}&category=${category}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then((res) => 
      {
          console.log('res in middle service: ',res);
          return res.json;
        });
    };
  
    return module;
  })();
  
export { routeService };