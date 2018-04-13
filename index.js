// TODO: Add something that automatically updates files from the repo

// Run the LU server...
const RakServer = require('node-raknet/RakServer.js');
const Server = require('./Server');
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync('config.json'));

global.servers = [];
config.servers.forEach(function(server) {
    global.servers.push(new Server(new RakServer(server.ip, server.port, server.password), server.zone));
});

global.servers.findZone = function(zoneID) {
    let ret = [];
    this.forEach(function(server) {
        if(server.zoneID === zoneID) {
            ret.push(server);
        }
    });
    return ret;
};
/**
 * Start dynamically adding modules for handling messages
 */
let normalizedPath = path.join(__dirname, "./Handles/MessageHandles");
let handles = [];

fs.readdirSync(normalizedPath).forEach(function(file) {
    handles.push(require("./Handles/MessageHandles/" + file));
});

global.servers.forEach(function(server) {
    server.rakServer.handles = handles;
});



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
let modelsPath = path.join(__dirname, "./DB/Models");
fs.readdirSync(modelsPath).forEach(function(file) {
    global[file.split('.')[0]] = (require("./DB/Models/" + file));
});