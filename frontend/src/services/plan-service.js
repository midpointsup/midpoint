const planService = (function () {
  "use strict";

  const module = {};
  const baseUrl = "http://localhost:3000";

  module.getPlans = async function () {
    return fetch(`${baseUrl}/api/plans`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.getPlansForMember = async function (memberId) {
    return fetch(`${baseUrl}/api/plans/members/${memberId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.getPlan = async function (id) {
    return fetch(`${baseUrl}/api/plans/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.deletePlan = async function (id) {
    return fetch(`${baseUrl}/api/plans/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  module.createPlan = async function (
    name,
    ownerId,
    members,
    category,
    address,
    date
  ) {
    category = category ? category : "";
    address = address ? address : "";
    date = date ? date : Date.now();
    return fetch(`${baseUrl}/api/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ownerId, members, category, address, date }),
    }).then((res) => {
      return res.json();
    });
  };

  module.createTrip = async function (planId, memberId, trip) {
    return fetch(`${baseUrl}/api/plans/${planId}/members/${memberId}/trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trip),
    }).then((res) => {
      return res.json();
    });
  };

  module.updateTrip = async function (planId, memberId, tripId, trip) {
    return fetch(
      `${baseUrl}/api/plans/${planId}/members/${memberId}/trip/${tripId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trip),
      }
    ).then((res) => {
      return res.json();
    });
  };

  module.getTrip = async function (planId, memberId) {
    return fetch(`${baseUrl}/api/plans/${planId}/members/${memberId}/trip`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      return res.json();
    });
  };

  return module;
})();

export default planService;
