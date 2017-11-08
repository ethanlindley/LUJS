class BitStream {
    constructor(data = undefined) {
        if(data !== undefined) {
            this._data = data;
        }
        else {
            this._data = Buffer.alloc(0);
        }
        this._byteCount = this._data.toString().length;
        //for reading data
        this._rBytePos = 0;
        this._rBitPos = 7;
        //for writing data
        this._wBytePos = 0;
        this._wBitPos = 7;
        this._mask = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

        this._byte = this._byteCount ? this._data.readUInt8(0) : undefined;
    }

    //returns the length of this BitStream
    length() {
        return this._byteCount;
    }
    //returns true if we are at the end of the stream
    allRead() {
        return this._rBytePos * 8 + this._rBitPos >= this._byteCount * 8 - 1;
    }
    //Reads a single bit from the Buffer
    readBit() {
        if (this._byte === undefined) return undefined;

        let bit = (this._byte & this._mask[this._rBitPos]) >> this._rBitPos;
        if (--this._rBitPos === -1) {
            this._rBitPos = 7;
            this._rBytePos++;
            this._byte = this._rBytePos < this._byteCount ? ord(this._data.readUInt8(this._rBytePos)) : undefined;
        }
        return bit;
    }
    //writes a single bit to the buffer
    writeBit(b) {
        if(typeof(b) !== "boolean") {
            throw new Error("BitStream writeBit was not passed a boolean");
        }
        //if the wBitPos is in the first bit position, we have rolled over
        if(this._wBitPos === 7) {

            //increase the buffer size...
            let old = this._data;
            this._data = Buffer.alloc(this._wBytePos + 1);
            this._byteCount = this._wBytePos + 1;

            for(let i = 0; i < this._wBytePos; i ++) {
                this._data.writeUInt8(old.readUInt8(i), i); //copy over into new Buffer
            }

            this._data.writeUInt8(0, this._wBytePos);

        }
        //now we need to get the current byte...
        let byte = this._data.readUInt8(this._wBytePos);

        //set the bit
        byte |= b << this._wBitPos;

        //write the byte
        this._data.writeUInt8(byte, this._wBytePos);

        //move to next bit
        this._wBitPos --;

        //if we are done writing this byte, move to the next one
        if(this._wBitPos < 0) {
            this._wBitPos = 7;
            this._wBytePos ++;
        }
    }
    //reads multiple bits from the buffer
    readBits(n) {
        let val = 0;
        while (n--) {
            let bit = this.readBit();
            if(bit === undefined) {
                return undefined;
            }
            val = (val << 1) | bit;
        }
        return val;
    }
    //reads bits in reverse
    readBitsReversed(n) {
        let val = 0;
        for (let i = 0; i < n; i ++) {
            let bit = this.readBit();
            if(bit === undefined) {
                return undefined;
            }
            val |= (bit << i);
        }
        return val;
    }
    //dont ask
    readBitsStream(ret, n, b = true) {
        if(n <= 0) return undefined;
        if(this._rBytePos + Math.floor(n/8) > this._byteCount) return undefined;

        let c = 0;
        while(n > 0) {
            if(n >= 8) {
                ret.writeByteOffset(this.readByte(), c);
                n -= 8;
                c++;
            } else {
                let neg = n - 8;
                if(neg < 0) {
                    if(b) {
                        ret.writeByteOffset(ret.readByteOffset(c) >> -neg, c);
                        this._rBytePos += 8 + neg;
                    } else {
                        this._rBytePos += 8;
                    }
                }
                n = 0;
            }
        }
        return ret;
    }
    //reads a byte from the buffer
    readByte() {
        return this.readBits(8);
    }
    //reads byte at offset
    readByteOffset(o) {
        return this._data.readUInt8(o);
    }
    //read n number of bytes to new stream
    readBytes(n) {
        let val = new BitStream();
        while(n--) {
            val.writeByte(this.readByte());
        }
        return val;
    }
    //writes a byte to the buffer
    writeByte(n) {
        //we have to build an array of true and false... or we can just left shift it and do it that way
        for(let i = 0; i < 8; i++) {
            let t = (n & 0x80) >>> 7; //get the leftmost bit and put it on the right

            if(t === 1) // we have a true...
                this.writeBit(true);
            else
                this.writeBit(false);
            n <<= 1; //move to next bit...
            n &= 0xFF; //ensure we are only looking at a byte...
        }
    }
    //writes a byte with a given offset
    writeByteOffset(n, o) {
        if(o + 1> this.length()) { //we are trying to write outside the current size... resizing to fix...
            this._data = Buffer.alloc(o + 1, 0);
            this._byteCount = this._wBytePos + 1;

            for(let i = 0; i < this._wBytePos; i ++) {
                this._data.writeUInt8(old.readUInt8(i), i); //copy over into new Buffer
            }
            this._byteCount = o + 1;
        }
        this._data.writeUInt8(n, o);
    }
    //reads a single char from the buffer
    readChar() {
        return this.readBits(8);
    }
    //writes a char to the buffer
    writeChar(n) {
        this.writeByte(n);
    }
    //reads a signed char from the buffer
    readSignedChar() {
        if(this.readBit()) {
            return -this.readBits(7)
        }
        return this.readBits(7);
    }
    //reads a short form the buffer
    readShort() {
        return this.readByte() & (this.readByte() << 8);
    }
    //writes a char to the buffer
    writeShort(n) {
        this.writeByte(n & 0xff); //write the bottom byte
        this.writeByte((n & 0xff00) >>> 8); //write the top byte
    }
    //reads a signed short from the buffer
    readSignedShort() {
        let firstByte = this.readByte();
        if(this.readBit()) {
            return -(firstByte & (this.readBits(7) << 7));
        }
        return firstByte & (this.readBits(7) << 7);
    }
    //reads a long from the buffer
    readLong() {
        return this.readShort() + (this.readShort() << 16)
    }
    //writes a long to the buffer
    writeLong(n) {
        this.writeShort(n & 0xffff); //write the lower two bytes...
        this.writeShort((n & 0xffff0000) >>> 16); //write the top two bytes
    }
    //reads a signed long from the buffers
    readSignedLong() {
        //lol no
    }
    //reads a long long from the buffer
    readLongLong() {
        return this.readByte() +
            (this.readByte() << 8) +
            (this.readByte() << 16) +
            (this.readByte() << 24) +
            (this.readByte() << 32) +
            (this.readByte() << 40) +
            (this.readByte() << 48) +
            (this.readByte() << 56);
    }
    //writes a long long to the buffer
    writeLongLong(n) {
        this.writeLong(n & 0xffffffff);
        this.writeLong((n & 0xffffffff00000000) >>> 32);
    }
    //reads compressed data from the buffer
    readCompressed(size) {
        let ret = new BitStream();
        let currentByte = (size >> 3) - 1;
        let byteMatch = 0xFF, halfByteMatch = 0xF0;

        while(currentByte > 0) {
            let b = this.readBit();
            if(b === undefined) return undefined;

            if(b) {
                ret.writeByteOffset(byteMatch, currentByte);
                currentByte --;
            } else {
                ret = this.readBitsStream(ret, (currentByte + 1) << 3);
                if(ret === undefined) return undefined;
                else return ret;
            }
        }

        let b = this.readBit();
        if(b === undefined) return undefined;

        if(b) {
            let nibble = 0;
            nibble |= (this.readBit() & 0x1);
            nibble |= (this.readBit() & 0x1) << 1;
            nibble |= (this.readBit() & 0x1) << 2;
            nibble |= (this.readBit() & 0x1) << 3;
            nibble |= halfByteMatch;
            ret.writeByteOffset(nibble, currentByte);
        } else {
            ret.writeByteOffset(this.readByte(), currentByte);
        }
        return ret;
    }
    //aligns to byte
    alignRead() {
        if(this._rBitPos !== 0) {
            this._rBitPos = 0;
            this._rBytePos ++;
        }
    }
    //concatenate an array of BitStreams together
    concat(bs) {
        for(let i = 0; i < bs.length; i ++) {
            for(let j = 0; j < bs[i].length(); j ++) {
                this.writeByte(bs[i].readByte());
            }
        }
    }
}

function ord (string) {
    //  discuss at: http://locutus.io/php/ord/
    // original by: Kevin van Zonneveld (http://kvz.io)
    // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
    // improved by: Brett Zamir (http://brett-zamir.me)
    //    input by: incidence
    //   example 1: ord('K')
    //   returns 1: 75
    //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
    //   returns 2: 65536
    var str = string + ''
    var code = str.charCodeAt(0)
    if (code >= 0xD800 && code <= 0xDBFF) {
        // High surrogate (could change last hex to 0xDB7F to treat
        // high private surrogates as single characters)
        var hi = code
        if (str.length === 1) {
            // This is just a high surrogate with no following low surrogate,
            // so we return its value;
            return code
            // we could also throw an error as it is not a complete character,
            // but someone may want to know
        }
        var low = str.charCodeAt(1)
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
    }
    if (code >= 0xDC00 && code <= 0xDFFF) {
        // Low surrogate
        // This is just a low surrogate with no preceding high surrogate,
        // so we return its value;
        return code
        // we could also throw an error as it is not a complete character,
        // but someone may want to know
    }
    return code
}

module.exports = BitStream;