class RangeList {
    constructor(data = undefined) {
        this.ranges = [];

        if(data !== undefined) {
            let count = data.readCompressed(16);
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

class Range {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    toArray() {
        let ret = [];
        for(let i = this.min; i < max; i++) {
            ret.push(i);
        }
        return ret;
    }
}

module.exports = RangeList;