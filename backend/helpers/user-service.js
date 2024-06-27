const userService = (function() {
    "user strict";

    const module = {};
    module.signup = function (username, email, password) {
        return fetch(`/api/users/signup`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email, password})
        }).then((res) => res.json);
    };

    module.signin = function (username, password) {
        return fetch(`/api/users/signin`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        }).then((res) => res.json);
    };

    return module;
})();