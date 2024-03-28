const {
  addUserHandler,
  getAllUsersHandler,
  getTemperatureRoomHandler,
  addTemperatureRoomHandler,
} = require("./handler");

const routes = [
  {
    method: "POST",
    path: "/users",
    handler: addUserHandler,
  },
  {
    method: "GET",
    path: "/users",
    handler: getAllUsersHandler,
  },
  {
    method: "POST",
    path: "/temps",
    handler: addTemperatureRoomHandler,
  },
  {
    method: "GET",
    path: "/temps",
    handler: getTemperatureRoomHandler,
  },
];

module.exports = routes;
