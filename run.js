const data = require('dgram');
const server = data.createSocket('udp4');
const rMsgs = require('./rak-messages.js');
const BitStream = require('./BitStream.js');
const ReliabilityLayer = require('./ReliabilityLayer.js');

const connections = [];

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
server.close();
});

server.on('message', (msg, rinfo) => {
    let data = new BitStream(msg);

    if(data.length() === 2) { //meaning there isnt an open connection yet...

        let messageId = data.readByte();
        console.log(rMsgs[messageId] + ': 0x' + messageId.toString(16) + ' (' + messageId + ')');

        if(rMsgs[messageId] === 'ID_OPEN_CONNECTION_REQUEST') {
            connections[rinfo.address] = (new ReliabilityLayer());
            let ret = Buffer.alloc(1);
            ret.writeInt8(rMsgs.indexOf('ID_OPEN_CONNECTION_REPLY'), 0);
            server.send(ret, rinfo.port, rinfo.address);
        }

    } else {
        if(connections[rinfo.address] !== undefined) { //we have an existing connection
            console.log(connections[rinfo.address].handle_data(data));
        }
    }
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(1001);