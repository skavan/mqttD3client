var defaultServer = {
    "name": "",
    "clientId": "",
    "host": "",
    "port": 1884,
    "userId": "",
    "password": "",
    "protocol": "tls",
    "qos": 1,
    "timeout": 30,
    "keepAliveInterval": 60,
    "cleanSession": true,
    "useSSL": false,
    "reconnect": true,
    "subscriptionTopic": "",
    "subscribed" : false,
    "topicHistory": [],
    "publishTopic":"",
    "publishPayload":"",
    "publishQos":0,
    "publishRetain": true,
    "payloadHistory":[],
    "connected" : false
    
};
var serverList = {
    "lastServer": "",
    "servers": {}
};



function getServerList(){
    return getConnectionsFromLocalStorage() || serverList;
}

function updateServerList(serverList){
    setConnectionsToLocalStorage(serverList);
}

function getSelectedServer(serverList){
    return $.isEmptyObject(serverList.servers) ? defaultServer : serverList.servers[serverList.lastServer] || defaultServer;
}

function getConnectionsFromLocalStorage() {
    let result =  localStorage.getItem('connections');
    if (result){
        result = JSON.parse(result);
        if (result.lastServer){
            result.servers[result.lastServer].connected = false;
            result.servers[result.lastServer].subscribed = false;
        }
        return result;
    }
    return undefined;
}

function setConnectionsToLocalStorage(serverList) {
    localStorage.setItem('connections', JSON.stringify(serverList));
}

function clearLocalStorage(){
    localStorage.clear();
}

function checkServerObject(server){
    if (server.host && server.port && server.clientId) {return true;} else {return false;}
}
