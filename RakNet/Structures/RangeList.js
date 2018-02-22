/**
 * A DataStructure used for keeping track of acks
 */
class RangeList {
    /**
     * Constructs a new RangeList and set the default values
     * @param {BitStream} data
     */
    constructor(data = undefined) {
        this.ranges = [];

        if(data !== undefined) {
            let count = data.readCompressed(2);
            let maxEqualToMin = false;
            for (let i = 0; i < count; i ++) {
                maxEqualToMin = data.readBit();
                let min = data.readLong();
                let max = min;
                if(!maxEqualToMin) {
                    max = data.readLong();
                }
                this.ranges.push(new Range(min, max));
            }
        }
    }

    /**
     * Converts this object into an Array
     * @returns {Array<Number>}
     */
    toArray() {
        let ret = [];
        for(let i = 0; i < this.ranges.length; i ++) {
            ret.concat(this.ranges[i].toArray()).sort(function(a,b) {
                return a - b;
            });
        }
        return ret;
    }
}

/**
 * The internal class RangeList uses to hold its ranges
 */
class Range {
    /**
     * Constructs a new Range from the values
     * @param {Number} min
     * @param {Number} max
     */
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    /**
     * Returns an array
     * @returns {Array<Number>}
     */
    toArray() {
        let ret = [];
        for(let i = this.min; i < max; i++) {
            ret.push(i);
        }
        return ret;
    }
}

module.exports = RangeList;