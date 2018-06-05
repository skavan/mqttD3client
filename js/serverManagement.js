$(document).ready(function () {

    serverList = getServerList();
    selectedServer = getSelectedServer(serverList);
    fillServerUIBar(serverList, selectedServer);
    console.log("ready:", selectedServer);


    // load the add/edit server modal component ---------------------------------------------------------------------
    $("<div>").load("newServerModal.html", function () {
        let mdal = $("#newServerModal", this);
        $("#mainContent").append(mdal.prop('outerHTML'));
    });

    // position and format server dropdown
    $("#icoServerDropdown, #inpSelectedServer").click(function () {
        comboPlacement($("#cmbServerDropdown"), $("#inpSelectedServer"));
    });

    // process Server dropdown pick!
    $('#cmbServerDropdown').dropdown({
        onChange: function (value, text, $choice) {
            console.log($choice.data('server'));
            if ($choice.attr("itemType") == "choice") {
                updateServersAndGui(serverList.servers[$choice.text().trim()], true);
                //switchServer(serverList.servers[$choice.data('server')]);
            }
        }
    });

    // handle the add/edit server buttons
    $("#addServer, #editServer").click(function () {
        if (this.innerText.trim().startsWith("Add")) {
            showModal(jQuery.extend(true, {}, defaultServer), "add", addEditServer); // when we add a server, we send a default server object to pre-fill the form.
        } else {
            showModal(jQuery.extend(true, {}, selectedServer), "edit", addEditServer); // use the current selected server
        }
    });

    // position and format topic dropdown ---------------------------------------------------------------------
    $("#icoTopicDropdown, #inpSelectedTopic").click(function () {
        if (selectedServer.topicHistory.length > 0) {
            comboPlacement($("#cmbTopicDropdown"), $("#inpSelectedTopic"));
        }
    });

    // process select Topic from dropdown
    $('#cmbTopicDropdown').dropdown({
        onChange: function (value, text, $choice) {
            processDropdownSelection($choice, "subscriptionTopic", $("#inpSelectedTopic"));
        }
    });

    // process Selected Topic lose focus and add topic to array if unique.
    $("#inpSelectedTopic").blur(function () {
        processInputBlur("subscriptionTopic", "topicHistory", $("#inpSelectedTopic"));
    });


    // position and format publish topic dropup ----------------------------------------------------------------
    $("#icoPubTopicDropdown, #inpPublishTopic").click(function () {
        if (selectedServer.publishTopicHistory.length > 0) {
            comboPlacement($("#cmbPublishTopicDropdown"), $("#inpPublishTopic"));
        }
    });

    // process Publish Topic from dropdown
    $('#cmbPublishTopicDropdown').dropdown({
        direction: 'upward',
        keepOnScreen: true,
        onChange: function (value, text, $choice) {
            processDropdownSelection($choice, "publishTopic", $("#inpPublishTopic"));
        }
    });

    // process Publish Topic lose focus and add topic to array if unique.
    $("#inpPublishTopic").blur(function () {
        processInputBlur("publishTopic", "publishTopicHistory", $("#inpPublishTopic"));
    });

    // position and format publish payload dropup --------------------------------------------------------------
    $("#icoPubPayloadDropdown, #inpPublishPayload").click(function () {
        if (selectedServer.payloadHistory.length > 0) {
            //$("#cmbPublishPayloadDropdown").dropdown('toggle');
            comboPlacement($("#cmbPublishPayloadDropdown"), $("#inpPublishPayload"));

        }
    });

    $('#cmbPublishPayloadDropdown').dropdown({
        onChange: function (value, text, $choice) {
            processDropdownSelection($choice, "publishPayload", $("#inpPublishPayload"));
        }
    });

    $("#inpPublishPayload").blur(function () {
        processInputBlur("publishPayload", "payloadHistory", $("#inpPublishPayload"));
    });

        // handle button clicks
    $("#publishQos #qos0, #publishQos #qos1, #publishQos #qos2").click(function () {
        $("#publishQos #qos0, #publishQos #qos1, #publishQos #qos2").removeClass("primary").addClass(
            "basic");
        $("#publishQos #qos" + this.innerText).addClass("primary").removeClass(
            "basic");
        selectedServer.publishQos = parseInt(this.innerText);
        updateServersAndGui(selectedServer, true);
    });
});

function processDropdownSelection($choice, selectedProperty, inputElement) {
    console.log("process dropdown selection");
    if ($choice.attr("itemType") == "choice") {
        if (selectedProperty == "subscriptionTopic"){mqttUnSubscribe();}
        inputElement.val($choice.text().trim()); 
        selectedServer[selectedProperty] = $choice.text().trim(); 
        updateServersAndGui(selectedServer, true);
    }
}

function processInputBlur(selectedProperty, historyArray, el) {
    let val = el.val().trim();
/*     if (val == "") {
        return;
    } */
    selectedServer[selectedProperty] = val;
    if ((selectedServer[historyArray].indexOf(val) == -1) && (!$.isEmptyObject(serverList.servers))) {
        if (val != ""){
            selectedServer[historyArray].unshift(val); // add it to the top of the array                    
            updateServersAndGui(selectedServer, true);
        }
    }
}

// handle the delete topic button
function deleteServer(item) {
    let val = item.trim(); // get the sellected server name.
    delete serverList.servers[val]; // delete it.
    if (val == $("#inpSelectedServer").val()) { // if the selected server is the same as the delete server
        // disconnect here!
        $("#inpSelectedServer").val(null); // delete that too
        selectedServer = defaultServer; // reset the selected server
    }
    updateServersAndGui(selectedServer, false);
    //updateServerList(serverList);                   // update the master list (write to storage)
    //fillServerUIBar(serverList, jQuery.extend(true, {}, selectedServer));    //update the GUI
}

// handle the delete topic button
function deleteTopic(item, prop) {
    console.log("deleteTopic");
    let val = item.trim();
    let i = selectedServer[prop].indexOf(val);
    if (i > -1) {
        let el = $("#inpSelectedTopic");
        let selectedTopic = "subscriptionTopic";
        if (prop=="publishTopicHistory"){
            el = $("#inpPublishTopic");
            selectedTopic = "publishTopic";
        }
        if (val == el.val()) {
            el.val(null);
            selectedServer[selectedTopic] = ""; //remove "History"
        }
        selectedServer[prop].splice(i, 1); // remove the element
        updateServersAndGui(selectedServer, true);
    }
}

// handle the delete topic button
function deletePayload(item) {
    console.log("deletePayload");
    let val = item.nextSibling.textContent.trim();
    let i = selectedServer.payloadHistory.indexOf(val);
    if (i > -1) {
        if (val == $("#inpPublishPayload").val()) {
            selectedServer.publishPayload = "";
            $("#inpPublishPayload").val(null);

        }
        selectedServer.payloadHistory.splice(i, 1); // remove the element
        updateServersAndGui(selectedServer, true);
    }
}

//utility function to position drop down
function comboPlacement(combo, parent) {
    combo.dropdown('toggle');
    var offset = parent.offset();
    if (parent.attr('id').includes("PublishTopic")) {
        combo.offset({
            top: offset.top - combo.outerHeight() + parent.outerHeight(),
            left: offset.left
        });
    } else if (parent.attr('id').includes("PublishPayload")) {
        combo.offset({
            //top: offset.top - combo.outerHeight() + parent.outerHeight(),
            left: offset.left // + $("#mnuPublishPayloadPicker").outerWidth() //+ combo.prop("offsetLeft")
        });
    } else {
        combo.offset({
            top: offset.top, // + $("#inpSelectedServer").outerHeight()
            left: offset.left
        });
    }

}

function myDeny() {
    window.alert('Wait not yet!');
    return false;
}

function addEditServer(newServer, mode) {
    serverList.servers[newServer.name] = newServer;
    updateServersAndGui(newServer, true);
    //switchServer(newServer);

    //console.log(newServer);
}



function fillServerUIBar(serverList, displayServer) {
    // fill the selected server input box
    $("#inpSelectedServer").val(displayServer.name || null);
    // fill the selected topic input box
    $("#inpSelectedTopic").val(displayServer.subscriptionTopic || null);


    // delete existing server list
    $("#mnuServerPicker > div").each(function () {
        if ($(this).attr('itemType') == "choice") {
            $(this).remove();
        }
    });

    // delete the existing topic list
    $("#mnuTopicPicker > div, #mnuPublishTopicPicker > div, #mnuPublishPayloadPicker > div").each(function () {
        if ($(this).attr('itemType') == "choice") {
            $(this).remove();
        }
    });

    // if no items, then hide edit server buttons, else show them
    if (!$.isEmptyObject(serverList.servers)) {
        $("#editServer").show();
    } else {
        $("#editServer").hide();
    }

    //color connect button
    let icoColor = "";
    if (displayServer.connected) {
        icoColor = "green";
    } else {
        icoColor = "red";
    }
    $("#btnConnect").removeClass("primary red green").addClass(icoColor);
    if (displayServer.subscribed) {
        icoColor = "green";
    } else {
        icoColor = "red";
    }
    $("#btnSubscribe").removeClass("primary red green").addClass(icoColor);

    // create new list of servers
    for (let item of Object.keys(serverList.servers)) {
        //if (serverList.servers[item].connected){icoColor = "green";} else {icoColor = "red";}
        let template = `<div class="item" itemType="choice" data-server="${serverList.servers[item].name}">
                            <i onclick="deleteServer('${item}')" class="delete icon right floated"></i>
                            ${serverList.servers[item].name}
                        </div>`;
        $("#mnuServerPicker").prepend(template);
    }
    // create list of topic history
    for (let item of displayServer.topicHistory) {
        let template = `<div class="item" itemType="choice">
                            <i onclick="deleteTopic('${item}', 'topicHistory')" class="delete icon right floated"></i>
                                ${item}
                        </div>`;
        $("#mnuTopicPicker").prepend(template);
        

    }
    // create list of topic history
    //displayServer.publishTopicHistory = displayServer.publishTopicHistory || [];
    for (let item of displayServer.publishTopicHistory) {
        let template = `<div class="item" itemType="choice">
                            <i onclick="deleteTopic('${item}', 'publishTopicHistory')" class="delete icon right floated"></i>
                                ${item}
                        </div>`;
        
        $("#mnuPublishTopicPicker").prepend(template);

    }
    // create list of payload history
    for (let item of displayServer.payloadHistory) {
        let template = `<div class="item" itemType="choice">
                            <i onclick="deletePayload(this)" class="delete icon right floated"></i>
                                ${item}
                        </div>`;
        $("#mnuPublishPayloadPicker").prepend(template);

    }

    $("#publishQos #qos0, #publishQos #qos1, #publishQos #qos2").removeClass("primary").addClass(
        "basic");
    $("#publishQos #qos" + displayServer.publishQos.toString()).addClass("primary").removeClass("basic");
    $("#publishRetain").prop("checked", displayServer.publishRetain);
    $("#inpPublishTopic").val(displayServer.publishTopic || null);
    $("#inpPublishPayload").val(displayServer.publishPayload || null);

}