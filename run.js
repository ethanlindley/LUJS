// TODO: Add something that automatically updates files from the repo

// Run the LU server...
const RakServer = require('./RakNet/RakServer.js');
let server = new RakServer("127.0.0.1", 1001, "3.25 ND");

/**
 * Start dynamically adding modules for handling messages
 */
let normalizedPath = require("path").join(__dirname, "./Handles/MessageHandles");
let handles = [];

require("fs").readdirSync(normalizedPath).forEach(function(file) {
    handles.push(require("./Handles/MessageHandles/" + file));
});
server.handles = handles;

// TODO: At some point I want an API server running...

// TODO: I also want Discord Rich Presence Integration?