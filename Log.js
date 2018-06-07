/**
 * Class that logs to the console depending on what the log level is set to
 * 0 - almost no logging
 * 10 - all logging
 */
class Log {
    /**
     * This will always be logged
     * @param message
     */
    static always(message) {
        console.log(message);
    }

    /**
     *
     * @param message
     */
    static debug(message) {
        if(logLevel >= 5) {
            console.log(message);
        }
    }

    /**
     *
     * @param message
     */
    static warn(message) {
        if(logLevel >= 1) {
            console.log(message);
        }
    }

    /**
     *
     * @param message
     */
    static info(message) {
        if(logLevel >= 2) {
            console.log(message);
        }
    }
}

module.exports = Log;