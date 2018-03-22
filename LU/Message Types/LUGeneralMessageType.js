const LUGeneralMessageType = {
    'MSG_SERVER_VERSION_CONFIRM': 0,
    'MSG_SERVER_DISCONNECT_NOTIFY': 1,
    'MSG_SERVER_GENERAL_NOTIFY': 2
};

LUGeneralMessageType.key = function(value) {
    for( let prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
            if( this[ prop ] === value )
                return prop;
        }
    }
};

module.exports = LUGeneralMessageType;