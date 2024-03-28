const Hapi = require("@hapi/hapi");
const kibsbot = require("./index");
const routes = require("./routes");

const init = async () => {
  const server = Hapi.server({
    port: 8080,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  server.route(routes);

  await server.start();
  console.log(
    `Server berjalan pada ${server.info.uri} in ${process.env.NODE_ENV} mode host ${server.info.host}`
  );
};

init();
