const BitStream = require('../RakNet/BitStream');

/**
 *
 * @param {string} ip
 * @returns {BitStream}
 */
function inet_aton(ip) {
    let bytes = ip.split('.');
    let bs = new BitStream();

    for(let i = 0; i < 4; i ++) {
        bs.writeByte(parseInt(bytes[i]));
    }

    return bs;
}

module.exports = inet_aton;