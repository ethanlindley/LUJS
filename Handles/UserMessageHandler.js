class UserMessageHandler {
    constructor() {
        this.remoteConnectionType = undefined;
        this.messageType = undefined;
        /**
         *
         * @param {RakServer} server
         * @param {BitStream} packet
         * @param user
         */
        this.handle = function(server, packet, user){};

    }

    static create() {
        return new this();
    }
}

module.exports = UserMessageHandler;