const expressWs = require('express-ws');
const { app } = require('./controller/router');

const { app: appWithWebSocket, getWss } = expressWs(app);

module.exports = { app: appWithWebSocket, getWss };
