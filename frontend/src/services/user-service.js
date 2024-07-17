let userService = (function () {
  "use strict";

  const module = {};
  const baseUrl = "http://localhost:3000";

  module.signup = function (username, email, password) {
    return fetch(`${baseUrl}/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.token) {
          module.storeToken(res.token);
        }
        return res;
      });
  };

  module.signin = function (username, password) {
    return fetch(`${baseUrl}/api/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.token) {
          module.storeToken(res.token);
        }
        return res;
      });
  };

  module.saveGoogleToken = function (token) {
    return fetch(`${baseUrl}/api/oauth`, {
      method: "POST",
      headers: { Authorization: token },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.token) {
          module.storeToken(res.token);
        }
        return res;
      });
  };

  module.storeToken = function (token) {
    localStorage.setItem("token", token);
  };

  module.getToken = function () {
    return localStorage.getItem("token");
  };

  module.getMe = function () {
    return fetch(`${baseUrl}/api/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${module.getToken()}` },
    }).then((res) => res.json());
  };

  module.sendEmail = async function (member) {
    return fetch(`${baseUrl}/api/users/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    }).then((res) => res.json());
  };

  return module;
})();

export default userService;
