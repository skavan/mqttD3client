$(document).ready(function () {
    var jsonData = [];
    //setupData(); // dummy data.

    $(window).resize(processResize) // do resize cleanup
        .trigger('resize');

    table = setupDataTable();

    // add buttons to top of table.
    // actually, I think I should make them tiny icon buttons
    // and shrink the search button to an icon too.

    table.buttons().container().addClass('small');
    table.buttons().container()
        .appendTo($('div.eight.column:eq(0)', table.table().container()));


    //build the table and its options and columns
    function setupDataTable() {
        return $('#example').DataTable({
            //data: mqData,
            columns: [

                {
                    data: "topic",
                    "title": "topic"
                },
                {
                    data: "payload",
                    "title": "payload",
                    "width": "300px",
                    "render": function (data) {
                        return '<div style="max-width:300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + data + '</div>';
                    }
                },
                {
                    data: "level",
                    "title": "level"
                },
                {
                    data: "qos",
                    "title": "qos"
                },
                {
                    data: "retain",
                    "title": "retain"
                },
                {
                    data: "date",
                    "title": "timestamp",
                    // format the date field.
                    "render": function (data) {
                        let d = new Date(data);
                        if (d3.version.toString().startsWith("3")){
                            let iso = d3.time.format.utc("%m/%d - %H:%M:%S.%L");
                            return iso(d);
                        } else {
                            let formatMonth = d3.timeFormat("%m/%d - %H:%M:%S.%L");
                            return formatMonth(d);
                        }
                        

                        

                        //return d.toLocaleString();
                    }
                }
            ],
            "order": [[ 5, "desc" ]],
            lengthChange: true,
            scrollResize: true,
            scrollCollapse: true,
            searching: true,
            scrollX: true,
            scrollY: true,
            paging: false,
            "info": false,
            buttons: ['copy', 'excel', 'pdf', 'colvis'],
            fnFooterCallback: function (row, data, start, end, display) {
                console.log("footer");
                row.innerHTML = '<th rowspan="1" colspan="1" style="width: 100%;">' + data.length +
                    ' records.</th>';
            },
            "initComplete": function () {
                //var api = this.api();
                //api.$('td').click( function () {
                //api.search( this.innerHTML ).draw();
                cleanupTable();
                console.log("inited");
                processResize();
            },
            "preDrawCallback": function (settings) {
                console.log("predraw");
            }
        });
    }

    // this to fix some wierd datatable/semantic ui issue where the header doesn't fill the width properly.
    function processResize() {
        var hw = $('#example>thead>tr:eq(0)>th').eq(0).width(); // get width of first header element
        var dw = $('#example>tbody>tr:eq(0)>td').eq(0).width();
        if (hw) {
            //console.log(hw, dw);
            if (hw != dw) {
                $('#example>thead>tr:eq(0)>th:eq(0)').width(dw);
            }
        }
    }
    // swap out the datatable search button with a semantic UI search button
    function cleanupTable() {
        let label = $('div.dataTables_filter label');
        label.addClass("ui labeled input small");
        label.contents().filter(function() {
            return this.nodeType===3;
        }).remove();
        label.prepend('<div class="ui label">Search</div>');
        $('div.dataTables_filter label input').css('margin-left','0');
        /*  $('div.dataTables_filter label').replaceWith(
            `
	            <label class="ui labeled input small">
		            <div class="ui label">
			            search
		            </div>
		            <input type="text" class="" placeholder="enter search term..." aria-controls="example" style="margin-left: 0;">
	            </label>
            `
        ); */ 
    }

    // create random data
    function setupData() {
        var date1 = new Date(2018, 01, 01);
        var date2 = new Date(2018, 05, 11);
        for (i = 0; i < 30; i++) {
            jElement = {
                date: randomDate(date1, date2),
                qos: Math.floor(Math.random() * 3) + 1,
                retain: Math.random() >= 0.5,
                topic: "/dragonfly/Basement/" + i,
                payload: i
            };
            jsonData.push(jElement);
        }
    }

    function randomDate(start, end) {
        var date = new Date(+start + Math.random() * (end - start));
        return date;
    }
});