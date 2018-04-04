// TODO: Add something that automatically updates files from the repo

// Run the LU server...
const RakServer = require('node-raknet/RakServer.js');
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



// Setting up ORM
const Sequelize = require('sequelize');
global.rebuildDB = false;

// Set up connection information
global.sequelize = new Sequelize('lujs', null, null, {
    dialect: 'sqlite',
    operatorsAliases: false,
    storage: './lujs.sqlite',
    logging: false,
});

// Test connection
sequelize.authenticate().then(function(err) {
    console.log('Connection has been established successfully.');
}, function (err) {
    console.log('Unable to connect to the database:', err);
});

// Load up models
let modelsPath = require("path").join(__dirname, "./DB/Models");
require("fs").readdirSync(modelsPath).forEach(function(file) {
    global[file.split('.')[0]] = (require("./DB/Models/" + file));
});