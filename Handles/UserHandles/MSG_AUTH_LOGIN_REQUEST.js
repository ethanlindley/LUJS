/**
 *
 * @type {{ID_INTERNAL_PING: number, ID_PING: number, ID_PING_OPEN_CONNECTIONS: number, ID_CONNECTED_PONG: number, ID_CONNECTION_REQUEST: number, ID_SECURED_CONNECTION_RESPONSE: number, ID_SECURED_CONNECTION_CONFIRMATION: number, ID_RPC_MAPPING: number, ID_DETECT_LOST_CONNECTIONS: number, ID_OPEN_CONNECTION_REQUEST: number, ID_OPEN_CONNECTION_REPLY: number, ID_RPC: number, ID_RPC_REPLY: number, ID_OUT_OF_BAND_INTERNAL: number, ID_CONNECTION_REQUEST_ACCEPTED: number, ID_CONNECTION_ATTEMPT_FAILED: number, ID_ALREADY_CONNECTED: number, ID_NEW_INCOMING_CONNECTION: number, ID_NO_FREE_INCOMING_CONNECTIONS: number, ID_DISCONNECTION_NOTIFICATION: number, ID_CONNECTION_LOST: number, ID_RSA_PUBLIC_KEY_MISMATCH: number, ID_CONNECTION_BANNED: number, ID_INVALID_PASSWORD: number, ID_MODIFIED_PACKET: number, ID_TIMESTAMP: number, ID_PONG: number, ID_ADVERTISE_SYSTEM: number, ID_REMOTE_DISCONNECTION_NOTIFICATION: number, ID_REMOTE_CONNECTION_LOST: number, ID_REMOTE_NEW_INCOMING_CONNECTION: number, ID_DOWNLOAD_PROGRESS: number, ID_FILE_LIST_TRANSFER_HEADER: number, ID_FILE_LIST_TRANSFER_FILE: number, ID_DDT_DOWNLOAD_REQUEST: number, ID_TRANSPORT_STRING: number, ID_REPLICA_MANAGER_CONSTRUCTION: number, ID_REPLICA_MANAGER_DESTRUCTION: number, ID_REPLICA_MANAGER_SCOPE_CHANGE: number, ID_REPLICA_MANAGER_SERIALIZE: number, ID_REPLICA_MANAGER_DOWNLOAD_STARTED: number, ID_REPLICA_MANAGER_DOWNLOAD_COMPLETE: number, ID_CONNECTION_GRAPH_REQUEST: number, ID_CONNECTION_GRAPH_REPLY: number, ID_CONNECTION_GRAPH_UPDATE: number, ID_CONNECTION_GRAPH_NEW_CONNECTION: number, ID_CONNECTION_GRAPH_CONNECTION_LOST: number, ID_CONNECTION_GRAPH_DISCONNECTION_NOTIFICATION: number, ID_ROUTE_AND_MULTICAST: number, ID_RAKVOICE_OPEN_CHANNEL_REQUEST: number, ID_RAKVOICE_OPEN_CHANNEL_REPLY: number, ID_RAKVOICE_CLOSE_CHANNEL: number, ID_RAKVOICE_DATA: number, ID_AUTOPATCHER_GET_CHANGELIST_SINCE_DATE: number, ID_AUTOPATCHER_CREATION_LIST: number, ID_AUTOPATCHER_DELETION_LIST: number, ID_AUTOPATCHER_GET_PATCH: number, ID_AUTOPATCHER_PATCH_LIST: number, ID_AUTOPATCHER_REPOSITORY_FATAL_ERROR: number, ID_AUTOPATCHER_FINISHED_INTERNAL: number, ID_AUTOPATCHER_FINISHED: number, ID_AUTOPATCHER_RESTART_APPLICATION: number, ID_NAT_PUNCHTHROUGH_REQUEST: number, ID_NAT_TARGET_NOT_CONNECTED: number, ID_NAT_TARGET_CONNECTION_LOST: number, ID_NAT_CONNECT_AT_TIME: number, ID_NAT_SEND_OFFLINE_MESSAGE_AT_TIME: number, ID_NAT_IN_PROGRESS: number, ID_DATABASE_QUERY_REQUEST: number, ID_DATABASE_UPDATE_ROW: number, ID_DATABASE_REMOVE_ROW: number, ID_DATABASE_QUERY_REPLY: number, ID_DATABASE_UNKNOWN_TABLE: number, ID_DATABASE_INCORRECT_PASSWORD: number, ID_READY_EVENT_SET: number, ID_READY_EVENT_UNSET: number, ID_READY_EVENT_ALL_SET: number, ID_READY_EVENT_QUERY: number, ID_LOBBY_GENERAL: number, ID_AUTO_RPC_CALL: number, ID_AUTO_RPC_REMOTE_INDEX: number, ID_AUTO_RPC_UNKNOWN_REMOTE_INDEX: number, ID_RPC_REMOTE_ERROR: number, ID_USER_PACKET_ENUM: number}}
 */
const RakMessages = require('node-raknet/RakMessages.js');
const UserMessageHandler = require('../UserMessageHandler');
const LURemoteConnectionType = require('../../LU/Message Types/LURemoteConnectionType');
const LUAuthenticationMessageType = require('../../LU/Message Types/LUAuthenticationMessageType');
const LUClientMessageType = require('../../LU/Message Types/LUClientMessageType');
const BitStream = require('node-raknet/BitStream');
const {ReliabilityLayer, Reliability} = require('node-raknet/ReliabilityLayer.js');
const {LoginInfo, LoginCodes} = require('../../LU/Messages/LoginInfo');

function rand(size) {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let ret = "";
    for(let i = 0; i < size; i ++) {
        ret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return ret;
}

class MSG_AUTH_LOGIN_REQUEST extends UserMessageHandler {
    constructor() {
        super();
        this.remoteConnectionType = LURemoteConnectionType.authentication;
        this.messageType = LUAuthenticationMessageType.MSG_AUTH_LOGIN_REQUEST;

        /**
         *
         * @param server
         * @param {BitStream}packet
         * @param user
         */
        this.handle = function(server, packet, user) {
            let client = server.getClient(user.address);

            let username = packet.readWString();
            let password = packet.readWString(41);
            let language = packet.readShort();
            let unknown = packet.readByte();
            let processInformation = packet.readWString(256);
            let graphicsInformation = packet.readWString(128);
            let numberOfProcessors = packet.readLong();
            let processorType = packet.readShort();
            let processorLevel = packet.readShort();
            let unknown2 = packet.readLong();

            if(!packet.allRead()) {
                let osMajorVersion = packet.readLong();
                let osMinorVersion = packet.readLong();
                let osBuildNumber = packet.readLong();
                let osPlatformID = packet.readLong();
            }

            let response = new LoginInfo();
            User.findOne({
                where: {username: username},
            }).then(user => {
                if(user === null) {
                    // The user was not found
                } else {

                }
            });

            HardwareSurvey.create({
                process_information: processInformation,
                graphics_information: graphicsInformation,
                number_of_processors: numberOfProcessors,
                processor_type: processorType,
                processor_level: processorLevel,
            });

            response.code = LoginCodes.badPassword;
            response.clientVersionMajor = 1;
            response.clientVersionCurrent = 10;
            response.clientVersionMinor = 64;
            response.redirectIP = server.ip;
            response.redirectPort = server.port;
            response.chatIP = server.ip;
            response.chatPort = server.port;
            response.altIP = server.ip;
            response.localization = 'US';
            response.firstSubscription = false;
            response.freeToPlay = false;
            response.session = rand(32);

            let send = new BitStream();
            send.writeByte(RakMessages.ID_USER_PACKET_ENUM);
            send.writeShort(LURemoteConnectionType.client);
            send.writeLong(LUClientMessageType.LOGIN_RESPONSE);
            send.writeByte(0);
            response.serialize(send);

            console.log(send.toBinaryString());
            client.send(send, Reliability.RELIABLE_ORDERED);
        };
    }
}

module.exports = MSG_AUTH_LOGIN_REQUEST;