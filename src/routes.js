const { Router } = require("express");
const ZoweController = require('./controllers/ZoweController');

const routes = Router();

routes.post("/zowe",ZoweController.dispatch );


module.exports = routes;