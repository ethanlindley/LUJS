/**
 *
 * @param {string} ip
 * @returns {Number}
 */
function inet_aton(ip) {
    let bytes = ip.split('.');
    let buffer = Buffer.alloc(4);

    for(let i = 0; i < 4; i ++) {
        buffer.writeUInt8(bytes[i], i);
    }

    return buffer.readUInt32BE(0);
}

module.exports = inet_aton;