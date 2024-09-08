const planService = (function () {
  "use strict";

  const module = {};
  const baseUrl = "http://localhost:3000/api/plans";

  module.getPlans = function () {
    return fetch(`${baseUrl}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      return res.json();
    });
  };

  module.getPlansForMember = async function (memberId) {
    return fetch(`${baseUrl}/members/${memberId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.getPlan = async function (id) {
    return fetch(`${baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      return res.json();
    });
  };

  module.deletePlan = async function (id) {
    return fetch(`${baseUrl}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.createPlan = function (name, members, category, date, colour, activities) {
    return fetch(`${baseUrl}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ name, members, category, date, colour, activities }),
    }).then((res) => {
      return res.json();
    });
  };

  module.updatePlan = async function (id, plan) {
    return fetch(`${baseUrl}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    }).then((res) => {
      return res.json();
    });
  };

  module.createTrip = async function (planId, memberId, trip) {
    return fetch(`${baseUrl}/${planId}/members/${memberId}/trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    }).then((res) => {
      return res.json();
    });
  };

  module.updateTrip = function (planId, memberId, tripId, trip) {
    return fetch(`${baseUrl}/${planId}/members/${memberId}/trip/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    }).then((res) => {
      return res.json();
    });
  };

  module.getTrip = async function (planId, memberId) {
    return fetch(`${baseUrl}/${planId}/members/${memberId}/trip`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.getTrips = async function (planId) {
    return fetch(`${baseUrl}/${planId}/members/trip`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  return module;
})();

export default planService;
