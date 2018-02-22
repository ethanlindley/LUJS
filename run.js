const RakServer = require('./RakNet/RakServer.js');

let server = new RakServer(1001, "3.25 ND");

/**
 * Start dynamically adding modules for handling messages
 */
let normalizedPath = require("path").join(__dirname, "./Handles/MessageHandles");
let handles = [];

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    handles.push(require("./Handles/MessageHandles/" + file));
});
server.handles = handles;