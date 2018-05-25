/*
 * Based on the Tree example from d3 here:
 * http://mbostock.github.io/d3/talk/20111018/tree.html
 * 
 * Copyright (c) 2013, Michael Bostock
 * All rights reserved.
 */

var m = [20, 40, 20, 100], i = 0, textTrunc = 10;
var tree, root;

var container, svg, vis;
var targetSize, zoom;

var waitControl, tooltip, ddlSearch;

var diagonal = d3.linkHorizontal().x(function (d) { return d.y; }).y(function (d) { return d.x; });

function setup(tagID, searchBox) {
    searchBox.select2();
    ddlSearch = searchBox;

    tree = d3.tree().nodeSize([20, 130]);

    container = d3.select("#" + tagID);
    targetSize = container.node().getBoundingClientRect();

    svg = container.append("svg:svg")
        .attr("width", targetSize.width)
        .attr("height", targetSize.height);

    vis = svg.append("svg:g");

    root = { "name": "-", "children": [] };
    root.x = 0;
    root.y = 0;

    tooltip = container.append("div").attr("class", "tooltip").style("opacity", 0);

    //function toggleAll(d) {
    //    if (d.children) {
    //        d.children.forEach(toggleAll);
    //        toggle(d);
    //    }
    //}

    zoom = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(m[1], targetSize.height / 2).scale(1));

    ddlSearch.on('select2:select', function (e) {
        var nodes = d3.hierarchy(root).descendants();
        var node = nodes.filter(function (d) { return d.data.id == (e.params && e.params.data ? e.params.data.id : ddlSearch.val()); });

        if (node.length > 0) {
            vis.selectAll(".active").classed("active", false);

            var ids = node[0].ancestors().map(function (d) { return d.data.id; });

            vis.selectAll(".link")
                .filter(function (d) {
                    return ids.indexOf(d.source.data.id) >= 0 && ids.indexOf(d.target.data.id) >= 0;
                })
                .classed("active", true);

            vis.selectAll(".node")
                .filter(function (d) { return ids.indexOf(d.data.id) >= 0; })
                .classed("active", true);
        }
    });

    if (waitControl) clearTimeout(waitControl);
    waitControl = setTimeout(function () { update(root); }, 500);
}


function zoomed() {
    vis.attr("transform", d3.event.transform);
}


function update(source) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    var hierarchy = d3.hierarchy(root);
    tree(hierarchy);

    // Compute the new tree layout.
    var nodes = hierarchy.descendants();
    //if (nodes.length > 20) return;


    // Update the nodes…
    var node = vis.selectAll("g.node")
        .data(nodes, function (d) {
            return d.data.id || (d.data.id = ++i);
        });


    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter()
        .append("svg:g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .on("click",
            function (d) {
                toggle(d);
                update(d);
                ddlSearch.trigger("select2:select");
            });

    nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .style("fill", function (d) { return d.data._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("svg:text")
        //.attr("x", function(d) { return d.height > 0 || d.depth == 0 ? -10 : 10; })
		.attr("x", -10)
        .attr("dy", ".35em")
        //.attr("text-anchor", function(d) { return d.height > 0 || d.depth == 0 ? "end" : "start"; })
		.attr("text-anchor", "end")
        .text(function(d) { return d.data.name; })
        .style("fill-opacity", 1e-6);

    nodeEnter.filter(function(d) { return d.data.data != undefined; })
        .append("svg:text")
        //.attr("x", function(d) { return d.height > 0 || d.depth == 0 ? 10 : -10; })
		.attr("x", 10)
        .attr("dy", ".35em")
        //.attr("text-anchor", function(d) { return d.height > 0 || d.depth == 0 ? "start" : "end"; })
		.attr("text-anchor", "start")
        .text(function (d) { return d.data.data.length <= textTrunc ? d.data.data : (d.data.data.substr(0, textTrunc) + "..."); })
        .style("fill-opacity", 1e-6)
        .on("mouseover",
            function(d) {
                if (d.data.data) {
                    var pos = d3.mouse(container.node());
                    tooltip.html(d.data.data).style("top", (pos[1] - 5) + "px").style("left", (pos[0] + 20) + "px").style("opacity", 1);
                }
            })
        .on("mouseout",
            function(d) {
                tooltip.style("opacity", 0);
            });


    // Transition nodes to their new position.
    var nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition().duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function (d) { return d.data._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.selectAll("text")
        .style("fill-opacity", 1);


    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.selectAll("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = vis.selectAll("path.link")
        .data(hierarchy.links(), function (d) { return d.target.data.id; });

    // Enter any new links at the parent's previous position.
    link.enter()
        .insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit()
        .transition()
        .duration(duration)
        .attr("d", function (d) {
            var o = { x: source.x, y: source.y };
            return diagonal({ source: o, target: o });
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.data.x = d.x;
        d.data.y = d.y;

        if (!d.data.search) {
            d.data.search = true;
            ddlSearch.append(new Option(d.ancestors().reverse().map(function (a) { return a.data.name; }).join(" > "), d.data.id, false, false));
        }
    });
}

// Toggle children.
function toggle(d) {
    if (d.children) {
        d.data._children = d.data.children;
        d.data.children = null;
    } else {
        d.data.children = d.data._children;
        d.data._children = null;
    }
}


function addNode(topic, body) {
    var parts = topic.split("/");
    if (root.children[0] === undefined) {
        var newnode = { "name": parts.shift(), "children": [] };
        root.children = [newnode];
        walk(parts, newnode, body);
    } else {
        walk(parts, root, body);
    }

    if (waitControl) clearTimeout(waitControl);
    waitControl = setTimeout(function () { update(root); }, 500);
}

function walk(parts, node, body) {
    if (parts.length != 0) {
        var current = parts.shift();
        if (node.children && node.children.length != 0) {
            //console.log("walking old");
            var z = 0;
            for (z = 0; z < node.children.length; z++) {
                //console.log(node.children[z].name + " - " + current);
                if (node.children[z].name == current) {
                    //console.log("found");
                    walk(parts, node.children[z], body);
                    break;
                }
            }
            //console.log("done loop - " + z + ", " + node.children.length);
            if (z == node.children.length) {
                //console.log("adding new");
                var newnode = { "name": current, "children": [] };
                node.children.push(newnode);
                walk(parts, node.children[z], body);
            }
        } else if (node._children && node._children.length != 0) {
            //console.log("walking hidden");
            var z = 0;
            for (z = 0; z < node._children.length; z++) {
                //console.log(node._children[z].name + " - " + current);
                if (node._children[z].name == current) {
                    //console.log("found");
                    walk(parts, node._children[z], body);
                    break;
                }
            }
            //console.log("done hidden loop - " + z + ", " + node._children.length);
            if (z == node._children.length) {
                //console.log("adding new hidden");
                var newnode = { "name": current, "_children": [] };
                node._children.push(newnode);
                walk(parts, node._children[z], body);
            }
        } else {
            //console.log("empty");
            var newnode = { "name": current, "children": [] };
            node.children = [newnode];
            walk(parts, node.children[0], body);
        }
    } else {
        //console.log("body");
        node.data = body;
        node.dirty = true;

    }
}


function fit(mode) {
    var nodes = d3.hierarchy(root).descendants(),
        sizeRange = { x: d3.extent(nodes, function (d) { return d.data.y; }), y: d3.extent(nodes, function (d) { return d.data.x; }) },
        size = { w: sizeRange.x[1] - sizeRange.x[0], h: sizeRange.y[1] - sizeRange.y[0] };

    var scale = null, translate = null;

    if (mode == "in") {
        scale = Math.min(targetSize.width / (size.w + m[1] + m[3]), targetSize.height / (size.h + m[0] + m[2]));
        translate = { x: m[1], y: (-sizeRange.y[0] + m[0]) * scale };
    }

    if (mode == "w") {
        scale = targetSize.width / (size.w + m[1] + m[3]);
        translate = { x: m[1], y: targetSize.height / 2 };
    }

    if (mode == "h") {
        scale = targetSize.height / (size.h + m[0] + m[2]);
        translate = { x: m[1], y: (-sizeRange.y[0] + m[0]) * scale };
    }

    if (mode == "o") {
        scale = 1;
        translate = { x: m[1], y: targetSize.height / 2 };
    }

    if (scale && translate) {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(translate.x, translate.y).scale(scale));
    }
}
