const RangeList = require('./RangeList.js');
const BitStream = require('./BitStream.js');

const Reliability = {
    'UNRELIABLE': 0,
    'UNRELIABLE_SEQUENCED': 1,
    'RELIABLE': 2,
    'RELIABLE_ORDERED': 3,
    'RELIABLE_SEQUENCED': 4,
};

class ReliabilityLayer {
    constructor(server, address) {
        this._server = server;
        this._address = address;

        this.srrt = undefined;
        this.rttVar = undefined;
        this.rto = 1;
        this.last = Date.now();
        this.remoteSystemTime = 0;
        this.resends = []; //i assume to keep track of what messages needed to be resent?
        this.acks = [];
        this.queue = [];
        this.sequencedReadIndex = 0;
        this.orderedReadIndex = 0;
    }

    handle_data(data) {
        if(this.handle_data_header(data)) return;
        return this.parse_packets(data);
    }

    handle_data_header(data) {
        if(data.readBit()) { //if there are acks...
            let yeOldenTime = data.readLong();
            let rtt = (Date.now() - this.last) / 1000 - yeOldenTime/1000;
            this.last = Date.now();
            if(this.srrt === undefined) {
                this.srrt = rtt;
                this.rttVar = rtt/2;
            } else {
                let alpha = 0.125;
                let beta = 0.25;
                this.rttVar = (1 - beta) * this.rttVar + beta * Math.abs(this.srrt - rtt);
                this.srrt = (1 - alpha) * this.srrt + alpha * rtt;1
            }
            this.rto = Math.max(1, this.srrt + 4 * this.rttVar);

            let acks = new RangeList(data);
            for(let i = 0; i < acks.toArray().length; i ++) {

            }
        }
        if(data.allRead()) {
            return true;
        }
        if(data.readBit()) {
            this.remoteSystemTime = data.readLong();
        }
        return false;
    }

    parse_packets(data) {
        let toRet = [];
        while(!data.allRead()) {
            let messageNumber = data.readLong();
            let reliability = data.readBitsReversed(3);
            let orderingChannel;
            let orderingIndex;
            if(reliability === Reliability.UNRELIABLE_SEQUENCED || reliability === Reliability.RELIABLE_ORDERED) {
                orderingChannel = data.readBitsReversed(5);
                orderingIndex = data.readLong();
            }
            let isSplit = data.readBit();
            let splitPacketId;
            let splitPacketIndex;
            let splitPacketCount;
            if(isSplit) { //if the packet is split
                splitPacketId = data.readShort();
                splitPacketIndex = data.readCompressed(32);
                splitPacketCount = data.readCompressed(32);

                if(this.queue[splitPacketId] === undefined) {
                    this.queue[splitPacketId] = [splitPacketCount];
                }
            }
            let length = data.readCompressed(16);
            data.alignRead();
            let packet = data.readBytes(Math.ceil(length/8));

            if(reliability === Reliability.RELIABLE || reliability === Reliability.RELIABLE_ORDERED) {
                this.acks.push(messageNumber);
            }

            if(isSplit) {
                if(splitPacketId !== undefined && splitPacketIndex !== undefined) {
                    this.queue[splitPacketId][splitPacketIndex] = packet;
                    let ready = true;
                    for(let i = 0; i < this.queue[splitPacketId].length; i ++) {
                        if(this.queue[splitPacketId][i] === undefined) {
                            ready = false;
                            break;
                        }
                    }
                    if(ready) {
                        //concatenate all the split packets together
                        packet = new BitStream();
                        packet.concat(this.queue[splitPacketId]);
                    } else {
                        continue;
                    }
                }
            }
            if(reliability === Reliability.UNRELIABLE_SEQUENCED) {
                if(orderingIndex !== undefined) {
                    if(orderingIndex >= this.sequencedReadIndex) {
                        this.sequencedReadIndex = orderingIndex + 1;
                    }
                    else {
                        continue;
                    }
                }
            } else if(reliability === Reliability.RELIABLE_ORDERED) {
                console.log("i dont wanna");
                /*if(orderingIndex !== undefined && orderingChannel !== undefined) {
                    if(orderingIndex === this.orderedReadIndex) {
                        this.orderedReadIndex ++;
                        let ord = orderingIndex + 1;
                        for(let i = 0; i < ord)
                    }
                }*/
            }
            toRet.push(packet);
        }
        return toRet;
    }
}

module.exports = ReliabilityLayer;