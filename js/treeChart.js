function TreeChart(params) {
    // Exposed variables
    var attrs = {
        id: "ID" + Math.floor(Math.random() * 1000000), // Id for event handlings
        svgWidth: 400,
        svgHeight: 400,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
        scaleExtent: [0.1, 3], // scale maximum to 3 and minimum to 0.1
        scaleDuration: 300,
        scalePadding: 0, // change this in order to have some padding when controlling scale from the buttons
        spacingBetweenRows: 16,
        container: 'body',
        defaultTextFill: '#2C3E50',
        defaultFont: 'Helvetica',
        defaultPayloadWidth: 300,
        data: null // holds hierarchy data
    };

    var updateData, // smoothly update chart.
        addNode, // add new node object
        fitToParent,
        fitToWidth,
        fitToHeight,
        niceSize,
        scrollBarWidth = 10,
        i = 0;

        $('text.data')
        .popup({
          inline: true
        })
      ;

    var chartRedrawTimer;

/*     $("#treeChartContainer").on('mouseenter', '.data', function () {
        console.log("hello");
    });

    $("#treeChartContainer").on('mouseleave', '.data', function () {
        console.log("goodbye");
    }); */
    //Main chart object
    var main = function (selection) {
        selection.each(function scope() {

            //Calculated properties
            var calc = {};
            calc.id = "ID" + Math.floor(Math.random() * 1000000); // id for event handlings
            calc.chartLeftMargin = attrs.marginLeft;
            calc.chartTopMargin = attrs.marginTop;
            calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
            calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;

            var tree = d3.layout.tree().size([calc.chartHeight, calc.chartWidth]);
            var diagonal = d3.svg.diagonal().projection(function (d) {
                return [d.y, d.x];
            });

            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            var zoomListener = d3.behavior.zoom().scaleExtent(attrs.scaleExtent).on("zoom", zoom);

            //Drawing containers
            var container = d3.select(this);
            //Clear everything
            container.html('');

            //Add svg
            var svg = container.append('svg')
                .attr('class', 'svg-chart-container')
                .attr('width', attrs.svgWidth - 12)
                .attr('height', attrs.svgHeight - 12)
                .attr('font-family', attrs.defaultFont)
                .call(zoomListener);

            //Add container g element
            var chart = svg.append('g')
                .attr('class', 'chart')
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');

            var tooltip = d3
                .componentsTooltip()
                .container(svg)
                .content([{
                    left: "Payload:",
                    right: "{p}"
                }]);

            if (!attrs.data) {
                attrs.data = {
                    name: "-",
                    children: []
                };
                attrs.data.x0 = calc.chartHeight / 2;
                attrs.data.y0 = 0;
                update(attrs.data);
            } else {
                attrs.data.children.forEach(d => {
                    if (d.children) {
                        d.children.forEach(update);
                    }
                });
            }

            // Define the zoom function for the zoomable tree
            function zoom() {
                resetScrollable();
                chart.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
                makeScrollable();
            }

            niceSize = function () {
                resetScrollable();
                scaleChart([calc.chartLeftMargin, calc.chartTopMargin], 1);
                setTimeout(makeScrollable, attrs.scaleDuration);
            }

            fitToParent = function () {
                resetScrollable();
                var bounds = chart.node().getBBox();
                var width = bounds.width,
                    height = bounds.height;
                if (width == 0 || height == 0) return; // nothing to fit
                var viewportWidth = (attrs.svgWidth - attrs.scalePadding * 2);
                var viewportHeight = (attrs.svgHeight - attrs.scalePadding * 2);
                if (width > height) {
                    viewportWidth -= scrollBarWidth;
                }
                if (height > width) {
                    viewportHeight -= scrollBarWidth;
                }
                var scale = Math.min(viewportWidth / width,
                    viewportHeight / height);
                var translate = [attrs.scalePadding - scale * bounds.x, attrs.scalePadding - scale * bounds.y];
                scaleChart(translate, scale);
                setTimeout(makeScrollable, attrs.scaleDuration);
            }

            fitToWidth = function () {
                resetScrollable();
                var bounds = chart.node().getBBox();
                var width = bounds.width,
                    height = bounds.height;
                if (width == 0) return; // nothing to fit
                var viewportWidth = (attrs.svgWidth - attrs.scalePadding * 2);
                if (width > height) {
                    viewportWidth -= scrollBarWidth;
                }
                var scale = viewportWidth / width;
                var translate = [attrs.scalePadding - scale * bounds.x, attrs.scalePadding - scale * bounds.y];
                scaleChart(translate, scale);
                setTimeout(makeScrollable, attrs.scaleDuration);
            }

            fitToHeight = function () {
                resetScrollable();
                var bounds = chart.node().getBBox();
                var width = bounds.width,
                    height = bounds.height;
                if (height == 0) return; // nothing to fit
                var viewportHeight = (attrs.svgHeight - attrs.scalePadding * 2);
                if (height > width) {
                    viewportHeight -= scrollBarWidth;
                }
                var scale = viewportHeight / height;
                var translate = [attrs.scalePadding - scale * bounds.x, attrs.scalePadding - scale * bounds.y];
                scaleChart(translate, scale);
                setTimeout(makeScrollable, attrs.scaleDuration);
            }

            function makeScrollable() {
                var bounds = chart.node().getBoundingClientRect();
                var width = bounds.width,
                    height = bounds.height;
                svg.attr("width", Math.max(width, attrs.svgWidth - 12))
                    .attr("height", Math.max(height, attrs.svgHeight - 12));

                container.style("width", attrs.svgWidth + 'px')
                    .style("height", attrs.svgHeight + 'px');
            }

            function resetScrollable() {
                svg.attr("width", attrs.svgWidth - 12)
                    .attr("height", attrs.svgHeight - 12);

                container.style("width", 'auto')
                    .style("height", 'auto');
            }

            function scaleChart(translate, scale) {
                chart
                    .transition()
                    .duration(attrs.scaleDuration) // milliseconds
                    .call(zoomListener.translate(translate).scale(scale).event);
            }

            function toggleAll(d) {
                if (d.children) {
                    d.children.forEach(toggleAll);
                    toggle(d);
                }
            }

            function update(source) {
                
                var duration = d3.event && d3.event.altKey ? 5000 : 500;
                // Compute the new tree layout.
                var nodes = tree.nodes(attrs.data).reverse();
                var newHeight = Math.max(nodes.length * attrs.spacingBetweenRows, calc.chartHeight);
                var newWidth = calc.chartWidth;
                tree.size([newHeight, newWidth]);
                // Normalize for fixed-depth.
                nodes.forEach(function (d) {
                    var isCollision = false;
                    var previousLevelNodes = nodes.filter(n => n.depth == d.depth - 1 &&
                        n.data &&
                        n.data.length > 20);
                    if (previousLevelNodes.length) {
                        isCollision = true;
                    }
                    d.y = d.depth * 120;
                    if (isCollision) {
                        d.y += attrs.defaultPayloadWidth;
                    }
                    newWidth = Math.max(newWidth, d.y);
                });

                svg.attr("height", Math.max(attrs.svgHeight, newHeight));

                if (newWidth > +svg.attr("width")) {
                    svg.attr("width", newWidth);
                }

                container.style("width", attrs.svgWidth + 'px')
                    .style("height", attrs.svgHeight + 'px');

                // Update the nodes…
                var node = chart.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", "node")
                    .attr("transform", function (d) {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .on("click", function (d) {
                        toggle(d);
                        update(d);
                    });

                nodeEnter.append("svg:circle")
                    .attr("r", 1e-6)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    })
                    .on("mouseover", function (d) {
                        if (d.data) {
                            var mouse = d3.mouse(svg.node());
                            var direction = "bottom";
                            if (mouse[1] - 80 < 0) {
                                direction = "top";
                            }
                            if (mouse[0] - 100 < 0) {
                                direction = "left";
                            } else if (mouse[0] + 50 > attrs.svgWidth) {
                                direction = "right";
                            }
                            tooltip.x(mouse[0])
                                .y(mouse[1])
                                .direction(direction)
                                .show({
                                    p: d.data
                                });
                        }
                    })
                    .on("mouseout", function (d) {
                        tooltip.hide();
                    });

                nodeEnter.append("svg:text")
                    .attr("x", function (d) {
                        return (d.children || d._children || d.data) ? -10 : 10;
                    })
                    .attr("dy", ".35em")
                    .attr("text-anchor", function (d) {
                        return (d.children || d._children || d.data) ? "end" : "start";
                    })
                    .text(function (d) {
                        return d.name;
                    })
                    .style("fill-opacity", 1e-6);

                    $('text.data')
                    .popup({
                      inline: true
                    })


                let el = nodeEnter.append("svg:text")
                    .attr("class", "data")
                    .attr("title", "myTitle")
                    .attr("data-content", "test stuff")
                    .attr("x", 10)
                    .attr("text-anchor", "start")
                    //.attr("y", 5)   align good!!!!!
                    .attr("dy", ".35em")
                    .attr("id", function (d) {
                        return d.id;
                    })
                    .text(function (d) {
                        if (d.data) {
                            if (d.data.length > 20) {
                                return d.data.substring(0, 20) + "...";
                            } else {
                                return d.data;
                            }
                        }
                        return "";
                    })
                    .style("fill-opacity", 1);
                
                    //$(el).hover(function() {$popup()})
                    $.fn.popup(el);
                    //$(el).popup({inline: true});
                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", 3)
                    .style("fill", function (d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                nodeUpdate.select("text.popup")
                    .style("fill-opacity", 1e-6);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = chart.selectAll("path.link")
                    .data(tree.links(nodes), function (d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = {
                            x: source.x0,
                            y: source.y0
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = {
                            x: source.x,
                            y: source.y
                        };
                        return diagonal({
                            source: o,
                            target: o
                        });
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            // Toggle children.
            function toggle(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
            }
            
            addNode = function (topic, body) {
                if (chartRedrawTimer) {
                    clearInterval(chartRedrawTimer);
                }
                var parts = topic.split("/");
                if (!attrs.data.children) {
                    newnode = {
                        "name": parts.shift(),
                        "children": []
                    };
                    attrs.data.children = [newnode];
                    //setInterval( function() { funca(10,3); }, 500 );
                    //chartRedrawTimer = setInterval(function() {preWalk(parts, newnode, body);}, 5000);
                    walk(parts, newnode, body);
                } else {
                    //chartRedrawTimer = setInterval(function(){preWalk(parts, attrs.data, body);}, 5000);
                    walk(parts, attrs.data, body);
                }
                chartRedrawTimer = setInterval(function(){preUpdate(attrs.data);}, 200);
                //update(attrs.data);
            };

            function preUpdate(data){
                clearInterval(chartRedrawTimer);
                console.log("doing an update!");
                update(data);
                setTimeout(function(){update(data);}, 400);         // need this for final cleanup! means there is always one extra update.
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
                            var newnode = {
                                "name": current,
                                "children": []
                            };
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
                            var newnode = {
                                "name": current,
                                "_children": []
                            };
                            node._children.push(newnode);
                            walk(parts, node._children[z], body);
                        }
                    } else {
                        //console.log("empty");
                        newnode = {
                            "name": current,
                            "children": []
                        };
                        node.children = [newnode];
                        walk(parts, node.children[0], body);
                    }
                } else {
                    //console.log("body");
                    node.data = body;
                    node.dirty = true;
                }
            }

            // Smoothly handle data updating
            updateData = function () {

            };
            //#########################################  UTIL FUNCS ##################################

            function handleWindowResize() {
                d3.select(window).on('resize.' + attrs.id, function () {
                    setDimensions();
                });
            }

            function setDimensions() {
                setSvgWidthAndHeight();
                container.call(main);
            }

            function setSvgWidthAndHeight() {
                var containerRect = container.node().getBoundingClientRect();
                if (containerRect.width > 0)
                    attrs.svgWidth = containerRect.width;
                if (containerRect.height > 0)
                    attrs.svgHeight = containerRect.height;
            }
        });
    };

    //Dynamic keys functions
    Object.keys(attrs).forEach(key => {
        // Attach variables to main function
        return main[key] = function (_) {
            var string = `attrs['${key}'] = _`;
            if (!arguments.length) {
                return eval(` attrs['${key}'];`);
            }
            eval(string);
            return main;
        };
    });

    main.clear = function () {
        d3.select(attrs.container).html('');
    }

    main.addNode = function (topic, body) {
        if (typeof addNode === "function") {
            addNode(topic, body);
        }
    };

    main.fitToParent = function () {
        if (typeof fitToParent === "function") {
            fitToParent();
        }
    }

    main.fitToWidth = function () {
        if (typeof fitToWidth === "function") {
            fitToWidth();
        }
    }

    main.fitToHeight = function () {
        if (typeof fitToHeight === "function") {
            fitToHeight();
        }
    }

    main.niceSize = function () {
        if (typeof niceSize === "function") {
            niceSize();
        }
    }

    //Set attrs as property
    main.attrs = attrs;

    //Exposed update functions
    main.data = function (value) {
        if (!arguments.length) return attrs.data;
        attrs.data = value;
        if (typeof updateData === 'function') {
            updateData();
        }
        return main;
    };

    // Run  visual
    main.run = function () {
        d3.selectAll(attrs.container).call(main);
        return main;
    };

    return main;
}