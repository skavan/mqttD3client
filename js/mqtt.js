var defaultServer2 = {
    "name": "rpi @80",
    "clientId": "ABCDEFG123456",
    "host": "192.168.1.80",
    "port": 1884,
    "userId": "donald@duck.com",
    "password": "admin",
    "protocol": "tcp",
    "qos": 0,
    "timeout": 30,
    "keepAliveInternal": 60,
    "cleanSession": true,
    "useSSL": false,
    "reconnect": true,
    "subscriptions": [
        "/dragonfly/#",
        "/dragonfly/Basement/Receiver/Status"
    ],
    "lastSubscription": 1
};
var defaultServer = {
    "name": "",
    "clientId": "",
    "host": "",
    "port": 1884,
    "userId": "",
    "password": "",
    "protocol": "tcp",
    "qos": 0,
    "timeout": 30,
    "keepAliveInternal": 60,
    "cleanSession": true,
    "useSSL": false,
    "reconnect": true,
    "topics": [
    ],
    "lastTopic": 0
};
var serverList = {
    "lastServer": 0,
    "servers": []
};

var selectedServer = {};

function getServerList(){
    return getConnectionsFromLocalStorage() || serverList;
}

function getSelectedServer(serverList){
    return serverList.servers.length > 0 ? serverList.servers[serverList.lastServer] : defaultServer;
}

function getConnectionsFromLocalStorage() {
    return localStorage.getItem('connections');
}