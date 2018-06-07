// TODO: Add something that automatically updates files from the repo

// Run the LU server...
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));
const Loader = require('./Loader');

Loader.setup(config);




// TODO: At some point I want an API server running...

// TODO: I also want Discord Rich Presence Integration?
