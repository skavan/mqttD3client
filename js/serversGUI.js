
function fillServerUIBar(serverList, displayServer) {
    $("#inpSelectedServer").val(displayServer.name || null);
    // delete existing list
    $("#mnuServerPicker > div").each(function () {
        if ($(this).attr('itemType') == "choice") {
            $(this).remove();
        }
    });
    //color connect button
    let icoColor="";
    if (displayServer.connected){icoColor="green";} else {icoColor="red";}
    $("#connect").removeClass("primary red green").addClass(icoColor);

    $("#inpSelectedServer").val(displayServer.name || null);
    // create new list
    for (let item of Object.keys(serverList.servers)) {
        if (serverList.servers[item].connected){
            icoColor = "green";
        } else {
            icoColor = "red";
        }
        let template =
            `<div class="item" itemType="choice" data-server="${serverList.servers[item].name}">
                                    <i class="${icoColor} globe icon"></i>
                                    ${serverList.servers[item].name}
                                </div>`;
        $("#mnuServerPicker").prepend(template)
    }

    // if no items, then hide edit/delete server buttons, else show them
    if (!$.isEmptyObject(serverList.servers)) {
        $("#editServer").show();
        $("#deleteServer").show();
    } else {
        $("#editServer").hide();
        $("#deleteServer").hide();
        
    }
    // show last topic
    $("#iSubTopic").val(displayServer.topics[displayServer.lastTopic] || null);
}



$(document).ready(function () {
    
});
