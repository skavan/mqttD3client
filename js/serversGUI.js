
function fillServerUIBar(selectedServer) {
    $("#inpSelectedServer").val(selectedServer.name || null);
    // delete existing list
    $("#mnuServerPicker > div").each(function () {
        if ($(this).attr('itemType') == "choice") {
            $(this).remove();
        }
    });
    // create new list
    for (let item of serverList.servers) {
        let template =
            `<div class="item" itemType="choice" data-server="${item.name}">
                                    <i class="red globe icon"></i>
                                    ${item.name}
                                </div>`
        $("#mnuServerPicker").prepend(template)
    }

    // if no items, then hide edit/delete server buttons, else show them
    if (serverList.servers.length == 0) {
        $("#editServer").hide();
        $("#deleteServer").hide();
    } else {
        $("#editServer").show();
        $("#deleteServer").show();
    }
    // show last topic
    $("#iSubTopic").val(selectedServer.topics[selectedServer.lastTopic] || null);
}



$(document).ready(function () {
    
});
