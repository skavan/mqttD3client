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
    "subscribePending": false,
    "topicHistory": [],
    "publishTopic":"",
    "publishTopicHistory":[],
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

function toggleConnect(selectedServer, client){
    if (selectedServer.connected) {
        if ($.isEmptyObject(client)) {
            selectedServer.connected = false;
        } else {
            if (client.isConnected()) {
                mqttDisconnect();
            }
        }
    } else {
        mqttConnect();
    }
}

function mqttDisconnect() {
    client.disconnect();
    selectedServer.connected = false;
    selectedServer.subscribed = false;
    console.log("Disconnected: (isConnected:" + client.isConnected() + ")");
    //updateServersAndGui(selectedServer, true);
}

function mqttConnect() {
    if (!checkServerObject(selectedServer)) return;
    if (selectedServer.connected) return;
    if (!$.isEmptyObject(client)) {
        if (client.connected) {
            mqttDisconnect();
        }
    }

    client = new Paho.MQTT.Client(selectedServer.host, parseInt(selectedServer.port),
        selectedServer.clientId);

    client.onMessageArrived = onMessage;
    client.onConnectionLost = onDisconnect;

    let opts = {
        keepAliveInterval: parseInt(selectedServer.keepAliveInterval),
        timeout: selectedServer.timeout,
        cleanSession: selectedServer.cleanSession,
        onSuccess: onConnect,
        onFailure: onFailure
    };

    if (selectedServer.protocol != "tcp") {
        opts.userName = selectedServer.userName;
        opts.password = selectedServer.password;
        opts.useSSL = true;
    }

    client.connect(opts);
}

function mqttSubscribe() {
    if ((selectedServer.subscriptionTopic) && (client.isConnected())) {
        if (!selectedServer.subscribed) {
            //if (!client.isConnected()){mqttConnect()}
            resetData();
            myTimer = new Date();
            client.subscribe(selectedServer.subscriptionTopic, {
                qos: selectedServer.qos,
                onSuccess: onSubscribeSuccess,
                onFailure: onSubscribeFailed,
                invocationContext: {
                    topic: selectedServer.subscriptionTopic
                }
            });
            selectedServer.subscribePending=false;
            messageGap = new Date().getTime();
        } else {
            client.unsubscribe(selectedServer.subscriptionTopic, {
                onSuccess: onUnSubscribeSuccess,
                onFailure: onUnSubscribeFailed,
                invocationContext: {
                    topic: selectedServer.subscriptionTopic
                }
            });

        }
    } else {
        if (selectedServer.subscriptionTopic){
            selectedServer.subscribePending=true;
            toggleConnect(selectedServer, client);
        }
    }

}

function mqttPublish() {
    if ((selectedServer.publishTopic) && (client.isConnected())) {
        let payload = selectedServer.publishPayload || "";
        client.publish(selectedServer.publishTopic, selectedServer.publishPayload, selectedServer.publishQos, selectedServer.publishRetain);
    }
}

function mqttUnSubscribe() {
    if ($.isEmptyObject(client)) {
        return;
    }
    if ((selectedServer.subscriptionTopic) && (client.isConnected())) {
        if (selectedServer.subscribed) {
            client.unsubscribe(selectedServer.subscriptionTopic, {
                onSuccess: onUnSubscribeSuccess,
                onFailure: onUnSubscribeFailed,
                invocationContext: {
                    topic: selectedServer.subscriptionTopic
                }
            });
            selectedServer.subscribed = false;
        }
    }
}

function reconnect() {
    setTimeout(function () {
        reportStatus("Reconnecting to " + selectedServer.host);
        mqttConnect();
    }, 3000);
}

// connected to MQTT server
function onConnect() {
    //document.getElementById('status').innerHTML = "connected.";
    reportStatus("Connected to " + selectedServer.host);
    selectedServer.connected = true;
    updateServersAndGui(selectedServer, false);
    console.log("mqtt connected");
    if (selectedServer.subscribePending){
        selectedServer.subscribePending = false;
        mqttSubscribe();
    }
}

// failed to connect to MQTT Server
function onFailure() {
    console.log("failure");
    reportStatus("Failed to connect to " + selectedServer.host);
    
    reconnect();
}

// disconnected from MQTT Server
function onDisconnect(reason) {
    console.log("disconnected - " + reason.errorMessage);
    //alert("disconnected - " + reason);
    reportStatus("Disconnected from " + selectedServer.host + " reason: " + reason);
    selectedServer.connected = false;
    selectedServer.subscribed = false;
    updateServersAndGui(selectedServer, true);
    //reconnect();
}

function onSubscribeSuccess(response) {
    endTime = new Date();
    let timeDiff = myTimer - new Date(); //in ms
    // strip the ms
    //console.log("time taken:" + (timeDiff /= 1000));
    console.log("subscribed to " + response.invocationContext.topic);
    reportStatus("Subscribed to " + response.invocationContext.topic + " | initial load: " + (timeDiff /= 1000));
    
    selectedServer.subscribed = true;
    updateServersAndGui(selectedServer, true);
}

function onSubscribeFailed(response) {
    console.log("failed to subscribe" + response.errorMessage);
}

function onUnSubscribeSuccess(response) {
    console.log("unsubscribed to " + response.invocationContext.topic);
    reportStatus("unsubscribed to " + response.invocationContext.topic);
    selectedServer.subscribed = false;
    updateServersAndGui(selectedServer, true);
}

function onUnSubscribeFailed(response) {
    console.log("failed to unsubscribe" + response.errorMessage);
}

function onMessage(message) {
    console.log(message.topic + "- " + message.payloadString);


    
    let msg = {
        topic: message.topic,
        payload: message.payloadString,
        level: message.topic.split("/").length,
        qos: message.qos,
        retain: message.retained,
        date: Date.now()
    };
    processNewMessage(msg);
    
    //addNode(message.destinationName, message.payloadString);
}
