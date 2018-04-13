class Server {
    /**
     *
     * @param {RakServer} rakserver
     * @param {Number} zoneID
     */
    constructor(rakserver, zoneID) {
        this._rakserver = rakserver;
        this._zoneID = zoneID;
    }

    get rakServer() {
        return this._rakserver;
    }

    get zoneID() {
        return this._zoneID;
    }
}

module.exports = Server;