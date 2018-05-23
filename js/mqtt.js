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
    "keepAliveInternal": 60,
    "cleanSession": true,
    "useSSL": false,
    "reconnect": true,
    "subscriptionTopic": "",
    "subscribed" : false,
    "topicHistory": [],
    "publishTopic":"",
    "publishPayload":"",
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
    if (result){return JSON.parse(result);}
    return undefined;
}

function setConnectionsToLocalStorage(serverList) {
    localStorage.setItem('connections', JSON.stringify(serverList));
}

function clearLocalStorage(){
    localStorage.clear();
}
