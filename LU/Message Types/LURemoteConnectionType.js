const LURemoteConnectionType = {
    'general': 0,
    'authentication': 1,
    'chat': 2,
    'internal': 3,
    'server': 4,
    'client': 5
};

LURemoteConnectionType.key = function(value) {
    for( let prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
            if( this[ prop ] === value )
                return prop;
        }
    }
};

module.exports = LURemoteConnectionType;