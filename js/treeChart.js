function TreeChart(params) {

    // Exposed variables
    var attrs = {
      id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
      svgWidth: 400,
      svgHeight: 400,
      marginTop: 5,
      marginBottom: 5,
      marginRight: 5,
      marginLeft: 5,
      niceSize: true,
      container: 'body',
      defaultTextFill: '#2C3E50',
      defaultFont: 'Helvetica',
      defaultPayloadWidth: 120,
      data: null
    };
  
  
    //InnerFunctions which will update visuals
    var updateData, addNode, root;
  
    //Main chart object
    var main = function (selection) {
      selection.each(function scope() {
  
        //Calculated properties
        var calc = {}
        calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
        calc.chartLeftMargin = attrs.marginLeft;
        calc.chartTopMargin = attrs.marginTop;
        calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
        calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
        
        var tree = d3.layout.tree().size([calc.chartHeight, calc.chartWidth]);
        var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

        // Define the zoom function for the zoomable tree
        function zoom() {
            chart.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

        //Drawing containers
        var container = d3.select(this);
        //Clear everything
        container.html('');

        //Add svg
        var svg = container.append('svg')
                        .attr('class', 'svg-chart-container')
                        .attr('width', attrs.svgWidth)
                        .attr('height', attrs.svgHeight)
                        .attr('font-family', attrs.defaultFont)
                        .call(zoomListener);
  
        //Add container g element
        var chart = svg.append('g')
                       .attr('class', 'chart')
                       .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')');
        
        var tooltip = d3
            .componentsTooltip()
            .container(svg)
            .content([
                {
                left: "Payload:",
                right: "{p}"
                }
            ]);
        
        if (!root) {
            root = { name: "-", children: [] };
            root.x0 = calc.chartHeight / 2;
            root.y0 = 0;
            update(root);
        }
        else {
            root.children.forEach(d => {
                if (d.children) {
                    d.children.forEach(update);
                }
            });   
        }
        

        function toggleAll(d) {
            if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
            }
        }
        var i = 0;
        function update(source) {
            
            var duration = d3.event && d3.event.altKey ? 5000 : 500;

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse();

            if (attrs.niceSize) {
                var newHeight = Math.max(nodes.length * 10, calc.chartHeight);

                tree.size([newHeight, calc.chartWidth]);

                svg
                //.attr("width", attrs.svgWidth + margin.right + margin.left)
                .attr("height", newHeight + attrs.marginTop + attrs.marginBottom);
            }

            // Normalize for fixed-depth.
            nodes.forEach(function(d) {
                var isCollision = false;
                if (d.depth == 7) {
                    var previousLevelNodes = nodes.filter(n => n.depth == d.depth - 1 && 
                                                               n.data && 
                                                               n.data.length > 20);
                    if (previousLevelNodes.length) {
                        // console.log("isCollision")
                        // console.log(previousLevelNodes[0])
                        isCollision = true;
                    }
                } 
                d.y = d.depth * 120;
                if (isCollision) {
                    d.y += attrs.defaultPayloadWidth;
                }
            });

            // Update the nodes…
            var node = chart.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });
                    
            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", function(d) { toggle(d); update(d); });

            nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
                .on("mouseover", function(d){
                    if (d.data) {
                        var mouse = d3.mouse(svg.node());
                        var direction = "bottom";
                        if (mouse[1] - 80 < 0) {
                            direction = "top";
                        }
                        if (mouse[0] - 100 < 0) {
                            direction = "left";
                        }
                        else if (mouse[0] + 50 > attrs.svgWidth){
                            direction = "right";
                        }
                        tooltip.x(mouse[0])
                                .y(mouse[1])
                                .direction(direction)
                                .show({ p: d.data });
                    }
                })
                .on("mouseout", function(d){
                    tooltip.hide();
                });

            nodeEnter.append("svg:text")
                .attr("x", function(d) {
                    return (d.children || d._children || d.data) ? -10 : 10; 
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return (d.children || d._children || d.data) ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style("fill-opacity", 1e-6);
            
            nodeEnter.append("svg:text")
                .attr("class","data")
                .attr("x", 10)
                .attr("text-anchor", "start")
                //.attr("y", 5)   align good!!!!!
                .attr("dy", ".35em")
                .attr("id",function(d) {return d.id;})
                .text(function(d) { 
                    if (d.data) { 
                        if (d.data.length > 20) {
                            return d.data.substring(0,20) + "..."; 
                        } else { 
                            return d.data; 
                        }
                    } 
                    return ""; 
                })
                .style("fill-opacity", 1)
            
            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);
            
            nodeUpdate.select("text.popup")
                .style("fill-opacity", 1e-6);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = chart.selectAll("path.link")
                .data(tree.links(nodes), function(d) { return d.target.id; });

            // Enter any new links at the parent's previous position.
            link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
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
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
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
        
        addNode = function(topic, body) {
            var parts = topic.split("/");
            if (!root.children){
                newnode = {"name": parts.shift(), "children":[]};
                root.children = [newnode];
                walk(parts,newnode,body);
            } else {
                walk(parts,root,body);
            }
            update(root);
        }
        
        function walk(parts, node, body) {
            if (parts.length != 0) {
                var current = parts.shift();
                if (node.children && node.children.length != 0) {
                    //console.log("walking old");
                    var z=0;
                    for(z=0; z < node.children.length; z++) {
                        //console.log(node.children[z].name + " - " + current);
                        if (node.children[z].name == current) {
                            //console.log("found");
                            walk(parts,node.children[z], body);
                            break;
                        }
                    }
                    //console.log("done loop - " + z + ", " + node.children.length);
                    if (z == node.children.length) {
                        //console.log("adding new");
                        var newnode = {"name": current, "children":[]};
                        node.children.push(newnode);
                        walk(parts,node.children[z],body);
                    }
                } else if (node._children && node._children.length != 0) {
                    //console.log("walking hidden");
                    var z=0;
                    for(z=0; z < node._children.length; z++) {
                        //console.log(node._children[z].name + " - " + current);
                        if (node._children[z].name == current) {
                            //console.log("found");
                            walk(parts,node._children[z], body);
                            break;
                        }
                    }
                    //console.log("done hidden loop - " + z + ", " + node._children.length);
                    if (z == node._children.length) {
                        //console.log("adding new hidden");
                        var newnode = {"name": current, "_children":[]};
                        node._children.push(newnode);
                        walk(parts,node._children[z],body);
                    }
                }else {
                    //console.log("empty");
                    newnode = {"name": current, "children":[]};
                    node.children = [newnode];
                    walk(parts,node.children[0],body);
                }
            } else {
                //console.log("body");
                node.data = body;
                node.dirty = true;
            }
        }

        if (!attrs.niceSize) {
            handleWindowResize();
        }
        else {
            d3.select(window).on('resize.' + attrs.id, null);
        }

        // Smoothly handle data updating
        updateData = function () {
  
        }
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
        if (!arguments.length) { return eval(` attrs['${key}'];`); }
        eval(string);
        return main;
      };
    });
    
    main.addNode = function(topic, body) {
        if (typeof addNode === "function"){
            addNode(topic, body);
        }
    };

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
    }
  
    // Run  visual
    main.run = function () {
      d3.selectAll(attrs.container).call(main);
      return main;
    }
  
    return main;
  }