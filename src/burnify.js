/*
 * bunify Prototype 
 */
Burnify = function(selector, project, width, height) {

	/*
	 * Meta information for the rendering
	 */
	this.burnifyProject = project;

	/*
	 * Meta information for the chart
	 */
	this.chartTargetSelector = selector;
	this.chartMargins = { top: 40, right: 30, bottom: 20, left: 30 }
	this.setDimensions(width, height);
	
	// Chart rendering
	return this;

};

/*
 * API methods
 */
Burnify.prototype.getDimensions = function() {
	return {
        width: this.chartMargins.width,
        height: this.chartMargins.height,
        margin: {
        	top: this.chartMargins.top,
        	left: this.chartMargins.left,
        	right: this.chartMargins.right,
        	bottom: this.chartMargins.bottom
        }
    }
}

Burnify.prototype.setDimensions = function(width, height, margins) {
	if (margins) {
		this.chartMarginss.top = margins.top || this.chartMarginss.top;
		this.chartMarginss.left = margins.left || this.chartMarginss.left;
		this.chartMarginss.right = margins.right || this.chartMarginss.right;
		this.chartMarginss.bottom = margins.bottom || this.chartMarginss.bottom;
	}

	this.chartDimensions = {
        width: width - this.chartMargins.left - this.chartMargins.right,
        height: height - this.chartMargins.top - this.chartMargins.bottom,
        margin: this.chartMargins
    }
}

Burnify.prototype.draw = function() {
	this.burnify(this);
}

Burnify.prototype.onSprintBarClick = function(sprintNumber, sprint) { }
Burnify.prototype.onFullScopeAreaClick = function(burnifyProject) { console.log('Full scope area clicked'); console.log(burnifyProject) }
Burnify.prototype.onDoneScopeAreaClick = function(burnifyProject) { console.log('Done scope area clicked'); }
Burnify.prototype.onOutScopeAreaClick = function(burnifyProject) { console.log('Out scope area clicked'); }

/*
 * Functional structure
 */
Burnify.prototype.burnify = function(meta) {
	
    function productChart(selector, project, dim) {
        var svg = createChartSVG(selector, dim);
        renderChart(dim, svg, project, prepareData(project));
    }

    function renderChart(dim, svg, project, data) {
        function render() {
            var x = createX();
            var y0 = createY0();
            var y1 = createY1();

            renderScopeArea(x, y0);
            renderDoneBars(x, y1);
            renderProjectLimit(x, y0);
            renderProjectMVP(x, y0);
            renderProductBurnLines(x, y0);
        }

        function createX() {
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, dim.width], 0.3)
                .domain(data.map(function (d) {
                    return d.sprint;
                }));

            var xAxis = d3.svg.axis()
                .tickSize(4)
                .outerTickSize(0)
                .scale(x)
                .orient("bottom");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + (dim.height + 1) + ")")
                .call(xAxis);

            return x;
        }

        function createY0() {
            var min = 0;
            var max = d3.max(data, function (d) {
                return d.points;
            });

            var y0 = d3.scale.linear().domain([min, max]).range([dim.height, 0]);

            var yAxisLeft = d3.svg.axis()
                .scale(y0)
                .ticks(8)
                .outerTickSize(0)
                .orient("left");

            svg.append("g")
                .attr("class", "y axis axisLeft")
                .attr("transform", "translate(0,0)")
                .call(yAxisLeft);

            return y0;
        }

        function createY1() {
            var min = 0;
            var max = d3.max(data, function (d) {
                return d.done;
            }) * 1.5;

            var y1 = d3.scale.linear().domain([min, max]).range([dim.height, 0]);

            function dontcall() {
                var yAxisRight = d3.svg.axis()
                    .scale(y1)
                    .ticks(8)
                    .outerTickSize(0)
                    .orient("right");

                svg.append("g")
                    .attr("class", "y axis axisRight")
                    .attr("transform", "translate(" + (dim.width) + ",0)")
                    .call(yAxisRight);
            }

            return y1;
        }

        function renderProductBurnLines(x, y0) {
            var dotOffset = 4;

            var lines = svg.selectAll(".line").data(data).enter();

            function x1(d) {
                if (d.index == 0) {
                    return 0;
                }
                return x(data[d.index - 1].sprint) + x.rangeBand() / 2;
            }

            function y1(d) {
                if (d.index == 0) {
                    return y0(project.points);
                }

                return y0(data[d.index - 1].remaining);
            }

            function x2(d) {
                return x(d.sprint) + x.rangeBand() / 2;

            }

            function y2(d) {
                return y0(d.remaining);
            }

            lines.append("line")
                .attr("class", function (d) {
                    if (d.projection) {
                        return "line projection";
                    }
                    return "line";
                })
                .attr("x1", function (d) {
                    return x1(d) + dotOffset;
                })
                .attr("x2", function (d) {
                    return x2(d) - dotOffset;
                })
                .attr("y1", 0)
                .attr("y2", 0)
                .transition()
                .ease("sin")
                .delay(function (d, i) {
                    return i * 100;
                })
                .attr("y1", function (d) {
                    var slope = (y2(d) - y1(d)) / (x2(d) - x1(d));
                    var x1_ = x1(d) + dotOffset;
                    var y1_ = y2(d) - slope * (x2(d) - x1_);
                    return y1_;
                })
                .attr("y2", function (d) {
                    var slope = (y2(d) - y1(d)) / (x2(d) - x1(d));
                    var x2_ = x2(d) - dotOffset;
                    var y2_ = slope * (x2_ - x1(d)) + y1(d);
                    return y2_;
                });


            var data_ = data.map(function (d) {
                return d;
            });

            data_.unshift({
                remaining: project.points
            });

            var dots = svg.selectAll(".dot").data(data_).enter();

            dots.append("circle")
                .attr("class", function (d) {
                    if (d.projection) {
                        return "circle projection";
                    }
                    return "circle";
                })
                .attr("r", 3)
                .attr("cx", function (d) {
                    if (!d.sprint) {
                        return 0;
                    }
                    return x(d.sprint) + x.rangeBand() / 2;
                })
                .attr("cy", 0)
                .transition()
                .ease("sin")
                .delay(function (d, i) {
                    return i * 60;
                })
                .attr("cy", function (d) {
                    return y0(d.remaining);
                });


            return lines;
        }

        function renderDoneBars(x, y1) {
            var bars = svg.selectAll(".bar").data(data).enter();

            bars.append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.sprint);
                })
                .attr("width", x.rangeBand())
                .attr("y", dim.height)
                .attr("height", 0)
                .on("click", function(d) {
                	meta.onSprintBarClick(d.index, d);
                })  
                .transition()
                .ease("linear")
                .delay(function (d, i) {
                    return i * 100;
                })
                .duration(500)
                .attr("y", function (d) {
                    return y1(d.done);
                })
                .attr("height", function (d, i, j) {
                    return dim.height - y1(d.done);
                });

            return bars;
        }

        function renderScopeArea(x, y0) {
            function createArea() {
                return d3.svg.area()
                    .x(function (d) {
                        return d.x;
                    }).y0(function (d) {
                        return y0(d.y0);
                    })
                    .y1(function (d) {
                        return y0(d.y0 + d.y);
                    });
            }

            function createStack() {
                return d3.layout.stack()
                    .offset("zero")
                    .values(function (d) {
                        return d.values;
                    });
            }

            function scopeStack(stack, scopeData, initX, initY, yAccessor) {
                var itemWidth = (dim.width - initX) / scopeData.length;

                var index = 1;

                var values = scopeData.map(function (d) {
                    var v = {
                        index: index,
                        sprint: d.sprint,
                        x: initX + itemWidth * index,
                        y: yAccessor(d)
                    };

                    index++;
                    return v;
                });

                values.unshift({
                    index: 0,
                    sprint: 'chart init',
                    y: initY,
                    x: initX
                });

                return stack([{
                    values: values
                }]);
            }

            function renderScopeStack(emptyStack, stack, clazz) {
                var scope = svg.selectAll("." + clazz).data(data).enter();

                scope.append("path")
                    .data(emptyStack)
                    .attr("class", clazz)
                    .attr("d", function (d) {
                        return area(d.values);
                    })
                    .on("click", function(d) {
                    	if (clazz == "scopeDone") {
                    		meta.onDoneScopeAreaClick(meta.burnifyProject);
                    	} else if (clazz == "scopeOut") {
                    		meta.onOutScopeAreaClick(meta.burnifyProject);
                    	} else {
                    		meta.onFullScopeAreaClick(meta.burnifyProject);
                    	}
                    });


                svg.selectAll("." + clazz)
                    .data(stack)
                    .transition()
                    .duration(2000)
                    .attr("d", function (d) {
                        return area(d.values);
                    });
            }

            function filterOut(data) {
                return data.filter(function (d) {
                    return d.totalOut != undefined;
                });
            }

            var area = createArea();
            var stack = createStack();

            var emptyStack = scopeStack(stack, data, 0, 0, function (d) {
                return 0;
            });

            var pointsStack = scopeStack(stack, data, 0, data[0].points, function (d) {
                return d.points;
            });

            var doneStack = scopeStack(stack, data, 0, 0, function (d) {
                return d.totalDone;
            });

            var outData = filterOut(data);
            var outEmptyStack, outStack;

            if (outData.length > 0) {
                var x_ = limitX(x) + 2;

                var outEmptyStack = scopeStack(stack, outData, x_, 0, function (d) {
                    return 0;
                });

                var outStack = scopeStack(stack, outData, x_, outData[0].totalOut, function (d) {
                    return d.totalOut;
                });
            }

            renderScopeStack(emptyStack, pointsStack, "scopePoints");
            renderScopeStack(emptyStack, doneStack, "scopeDone");

            if (outData.length > 0) {
                renderScopeStack(outEmptyStack, outStack, "scopeOut");
            }
        }

        function isMvpOverLimit() {
            return project.mvpSprint == project.lastSprint && project.lastSprint != data.length;
        }

        function limitX(x) {
            var lastSprint = data[project.lastSprint - 1].sprint;
            var x_ = x(lastSprint) + x.rangeBand() * 1.2;
            return x_;
        }

        function renderProjectLimit(x, y0) {
            if (project.lastSprint == data.length) {
                return;
            }

            var x_ = limitX(x);
            var textY = -5;

            if (isMvpOverLimit()) {
                textY = -15;
            }

            svg.append("line")
                .attr("class", "limit")
                .attr("x1", x_)
                .attr("y1", y0(0))
                .attr("x2", x_)
                .attr("y2", y0(0))
                .transition()
                .ease("sin")
                .duration(2000)
                .attr("y2", 0);

            svg.append("text")
                .attr("x", x_)
                .attr("y", textY)
                .text("LIMIT")
                .attr("class", "limit");
        }

        function renderProjectMVP(x, y0) {
            var mvpSprint = data[project.mvpSprint - 1].sprint;
            var x_ = x(mvpSprint) + x.rangeBand() * 1.2;
            var textY = -5;

            if (isMvpOverLimit()) {
                x_ -= 4;
            }

            svg.append("line")
                .attr("class", "mvp")
                .attr("x1", x_)
                .attr("y1", y0(0))
                .attr("x2", x_)
                .attr("y2", y0(0))
                .transition()
                .ease("sin")
                .duration(2000)
                .attr("y2", 0);

            svg.append("text")
                .attr("x", x_)
                .attr("y", -5)
                .text("MVP")
                .attr("class", "mvp");
        }

        render();
    }



    function prepareData(project) {
        var remaining = project.points;
        var points = project.points;
        var totalDone = 0;
        var totalOut = 0;

        var data = project.sprints.map(function (sprint, i) {
            var added = sprint.added ? sprint.added : 0;
            var removed = sprint.removed ? sprint.removed : 0;

            remaining = remaining - sprint.done + added - removed;
            points = points + added - removed;
            totalDone += sprint.done;

            return {
                index: i,
                sprint: '' + (i + 1),
                done: sprint.done,
                remaining: remaining,
                points: points,
                totalDone: totalDone,
                totalOut: undefined
            };
        });

        var mean = d3.mean(data, function (d) {
            return d.done;
        });

        do {
            if (data.length > (project.lastSprint - 1) && totalOut == 0) {
                totalOut = remaining;
            }


            remaining -= mean;
            if (remaining < 0) {
                remaining = 0;
            }

            if (data.length < project.lastSprint) {
                totalDone += mean;
            }

            data.push({
                index: data.length,
                sprint: '' + (data.length + 1),
                done: 0,
                remaining: remaining,
                points: points,
                projection: true,
                totalDone: totalDone,
                totalOut: (data.length > project.lastSprint - 1) ? totalOut : undefined
            });

        } while (remaining != 0);

        return data;
    }

    function defineChartDimentions(width, height) {
        var margin = {
            top: 40,
            right: 30,
            bottom: 20,
            left: 30
        };

        return {
            width: width - margin.left - margin.right,
            height: height - margin.top - margin.bottom,
            margin: margin
        }
    }

    function createChartSVG(selector, dim) {
        return d3.select(selector)
            .classed("burnify", true)
            .append("svg")
            .attr("width", dim.width + dim.margin.left + dim.margin.right)
            .attr("class", "chart")
            .attr("height", dim.height + dim.margin.top + dim.margin.bottom)
            .append("g")
            .attr("class", "graph")
            .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");
    }


    productChart(meta.chartTargetSelector, meta.burnifyProject, meta.chartDimensions);
}