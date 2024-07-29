let emailService = (function () {
  "use strict";

  const module = {};
  const baseUrl = "http://localhost:3000/api/emails";

  module.sendEmail = async function (userId) {
    return fetch(`${baseUrl}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ userId }),
    }).then((res) => res.json());
  };

  return module;
})();

export default emailService;
