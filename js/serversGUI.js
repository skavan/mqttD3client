
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
    $("#mnuTopicPicker > div").each(function () {
        if ($(this).attr('itemType') == "choice") {
            $(this).remove();
        }
    });

    //color connect button
    let icoColor="";
    if (displayServer.connected){icoColor="green";} else {icoColor="red";}
    $("#connect").removeClass("primary red green").addClass(icoColor);
    if (displayServer.subscribed){icoColor="green";} else {icoColor="red";}
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
    for (let item of displayServer.topicHistory){
        let template = `<div class="item" itemType="choice">
                            <i onclick="deleteTopic('${item}')" class="delete icon right floated"></i>
                                ${item}
                        </div>`;
        $("#mnuTopicPicker").prepend(template);
    }
    // if no items, then hide edit server buttons, else show them
    if (!$.isEmptyObject(serverList.servers)) {$("#editServer").show();} else {$("#editServer").hide();}
}



$(document).ready(function () {
    
});
