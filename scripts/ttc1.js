(function() {

    // Matter aliases
     var Engine = Matter.Engine,
        World = Matter.World,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        Constraint = Matter.Constraint,
        Events = Matter.Events,
        Bounds = Matter.Bounds,
        Vector = Matter.Vector,
        Vertices = Matter.Vertices,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Query = Matter.Query,
        Svg = Matter.Svg;

	var gauge3 = new Gauge({
		renderTo   : 'gauge3',
		width      : 250,
		height     : 250,
		maxValue   : 140,
		majorTicks : ['0','10','20','30','40','50','60','70','80','90','100','110','120','130','140'],
		glow       : true,
		units      : 'mph',
		title      : 'Speed',
		highlights : false,
		glow : false,
		valueFormat : { int : 3, dec : 0 },
		highlights : [{
						from  : 0,
						to    : 20,
						color : 'Khaki'
					}, {
						from  : 130,
						to    : 140,
						color : 'LightSalmon'
					}],
		colors : {
			needle : { start : 'lightgreen', end : 'navy' },
			plate : 'lightyellow',
			title : 'green',
			units : 'lightgreen',
			majorTicks : 'darkgreen',
			minorTicks : 'lightgreen',
			numbers : 'darkgreen'
		},
		animation : {
			delay : 25,
			duration: 500,
			fn : 'elastic'
		}
	});
	
	function updateSpeedo(value){
		gauge3.setValue(value);
		gauge3.draw();
	}
	
    var Render = {};

    Render.create = function(options) {
        var defaults = {
                controller: Render,
                element: null,
                canvas: null,
                options: {               
                }
            };

        var render = Common.extend(defaults, options);
        return render;
    };
    
    /**
     * Renders the given `engine`'s `Matter.World` object.
     * This is the entry point for all rendering and should be called every time the scene changes.
     * @method world
     * @param {engine} engine
     */
    Render.world = function(engine) {
        var render = Render,
            world = engine.world,
            canvas = render.canvas,
            context = render.context,
            options = render.options,
            allBodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world),            
            bodies = [],
            constraints = [],
            i;
        Render.bodies(engine, allBodies, context);
    };
    
    Render.clear = function (){
    };
    
    Render.bodies = function(engine, bodies, context) {
        var c = context,
            render = engine.render,
            options = render.options,
            body,
            part,
            i;

        for (i = 0; i < bodies.length; i++) {
            body = bodies[i];
            //document.getElementById('speed').textContent = Math.round(body.speed);
			updateSpeedo(Math.round(body.speed));
        };
    };

    var Demo = {};

    var _engine,
        _gui,
        _inspector,
        _sceneName,
        _mouseConstraint,
        _sceneEvents = [],
        _useInspector = window.location.hash.indexOf('-inspect') !== -1,
        _isMobile = /(ipad|iphone|ipod|android)/gi.test(navigator.userAgent);

     Demo.init = function() {
        var container = document.getElementById('canvas-container');

        // some example engine options
        var options = {
            positionIterations: 6,
            velocityIterations: 4,
            enableSleeping: false,
            metrics: { extended: true },
            render: Render.create()
        
        };

        // create a Matter engine
        // NOTE: this is actually Matter.Engine.create(), see the aliases at top of this file
        _engine = Engine.create(options);
        
        _engine.world.gravity.y = 0;
        _engine.world.gravity.x = 0;
          _engine.world.bounds = { 
                min: { x: -Infinity, y: -Infinity }, 
                max: { x: Infinity, y: Infinity } 
            }
          
            Events.on(_engine, 'tick', function(event) {
                var bodies = Composite.allBodies(_engine.world);
                 for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];

                    if (body.isStatic || body.isSleeping)
                        continue;
                    var throttle = document.getElementById('throttle').value;                     
                    var brake = document.getElementById('brake').value;                     
                    if(body.velocity.y<=0)
                    {
                        brake=0;
                    }
                    Body.applyForce(body,{x:body.position.x, y:body.position.y}, {x:0,y:(throttle-brake)});                
                }
            });
         
         // run the engine
        Engine.run(_engine);

        // default scene function name
        _sceneName = 'train';

        // set up a scene with bodies
        Demo[_sceneName]();

        // set up demo interface (see end of this file)
        //Demo.initControls();
    };

    Demo.train = function() {
            var _world = _engine.world;
            var train = { 
            label: 'Train',
                position: { x: 0, y: 0 },
                vertices: Vertices.fromPath('L 0 0 L ' + 110 + ' 0 L ' + 50 + ' ' + 110 + ' L 0 ' + 50)
            };

            var _train =  Body.create(Common.extend({}, train,{ isStatic: false,
                                                                frictionAir: 0.002,
                                                                density: 15
                                                              }));
            
            World.add(_world, _train);

        };
    
    
    // call init when the page has loaded fully
    if (window.addEventListener) {
        window.addEventListener('load', Demo.init);
    } else if (window.attachEvent) {
        window.attachEvent('load', Demo.init);
    }
    
    var container = $("#flot-moving-line-chart");

    // Determine how many data points to keep based on the placeholder's initial size;
    // this gives us a nice high-res plot while avoiding more than one point per pixel.

    var maximum = container.outerWidth() / 2 || 300;

    //

    var data_speed = [];

    function addSpeedPointData() {

        if (data_speed.length) {
            data_speed = data_speed.slice(1);
        }

        while (data_speed.length < maximum) {
            data_speed.push(0);
        }
        
        data_speed.push(gauge3.getValue());

        // zip the generated y values with the x values

        var res = [];
        for (var i = 0; i < data_speed.length; ++i) {
            res.push([i, data_speed[i]])
        }

        return res;
    }
    
    var data_throttle = [];

    function addThrottlePointData(v) {

        if (data_throttle.length) {
            data_throttle = data_throttle.slice(1);
        }

        while (data_throttle.length < maximum) {            
            data_throttle.push(0);
        }
        
        data_throttle.push(document.getElementById('throttle').value);

        // zip the generated y values with the x values

        var res = [];
        for (var i = 0; i < data_throttle.length; ++i) {
            res.push([i, data_throttle[i]])
        }

        return res;
    }
    
    var data_brake = [];

    function addBrakePointData() {

        if (data_brake.length) {
            data_brake = data_brake.slice(1);
        }

        while (data_brake.length < maximum) {
            data_brake.push(0);
        }
        
        data_brake.push(document.getElementById('brake').value);

        // zip the generated y values with the x values

        var res = [];
        for (var i = 0; i < data_brake.length; ++i) {
            res.push([i, data_brake[i]])
        }

        return res;
    }
    
    var data_fuel = [];

    function addFuelPointData() {

        if (data_fuel.length) {
            data_fuel = data_fuel.slice(1);
        }

        while (data_fuel.length < maximum) {
            data_fuel.push(0);
        }
        
        data_fuel.push(document.getElementById('fuel').textContent);

        // zip the generated y values with the x values

        var res = [];
        for (var i = 0; i < data_fuel.length; ++i) {
            res.push([i, data_fuel[i]])
        }

        return res;
    }

    //
    var getSeriesObj = function() {
                           return [
                            {
                              data: addSpeedPointData(),
                              lines: { show: true, fill: true }
                            }, {
                              data: addThrottlePointData(),
                              lines: { show: true, fill: false }
                            }, {
                              data: addBrakePointData(),
                              lines: { show: true, fill: false }
                            }, {
                              data: addFuelPointData(),
                              lines: { show: true, fill: false }
                            }
                          ];
                        };
    

    var plot = $.plot(container, getSeriesObj(), {
        grid: {
            borderWidth: 1,
            minBorderMargin: 20,
            labelMargin: 10,
            backgroundColor: {
                colors: ["#fff", "#e4f4f4"]
            },
            margin: {
                top: 8,
                bottom: 20,
                left: 20
            },
            markings: function(axes) {
                var markings = [];
                var xaxis = axes.xaxis;
                for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
                    markings.push({
                        xaxis: {
                            from: x,
                            to: x + xaxis.tickSize
                        },
                        color: "rgba(232, 232, 255, 0.2)"
                    });
                }
                return markings;
            }
        },
        xaxis: {
            tickFormatter: function() {
                return "";
            }
        },
        yaxis: {
            min: 0,
            max: 125
        },
        legend: {
            show: true
        }
    });
    
    var updateInterval = 30;    
    
    function updateTrainHistory() {

			plot.setData(getSeriesObj());

			// Since the axes don't change, we don't need to call plot.setupGrid()

			plot.draw();
            setTimeout(updateTrainHistory, updateInterval);
    }
    updateTrainHistory();
    
    function manageFuel(){
        var fuel = $('#fuel').attr('actual');
        fuel = fuel - (document.getElementById('throttle').value/10000);
        if(fuel<=0)
        {
            document.getElementById('throttle').value=0;   
        }
        if(fuel<10)
        {
            $('#fuel').parent().parent().parent().parent().removeClass('panel-green');
            $('#fuel').parent().parent().parent().parent().removeClass('panel-yellow');
            $('#fuel').parent().parent().parent().parent().addClass('panel-red');
            
        }else if(fuel<30)
        {
            $('#fuel').parent().parent().parent().parent().removeClass('panel-green');
            $('#fuel').parent().parent().parent().parent().addClass('panel-yellow');
            $('#fuel').parent().parent().parent().parent().removeClass('panel-red');
        }else{
            $('#fuel').parent().parent().parent().parent().addClass('panel-green');
            $('#fuel').parent().parent().parent().parent().removeClass('panel-yellow');
            $('#fuel').parent().parent().parent().parent().removeClass('panel-red');
        }
        $('#fuel').attr('actual',fuel);
        $('#fuel').text(Math.round(fuel));
        setTimeout(manageFuel, updateInterval);
    }
    manageFuel();
    
    $(document).on('mouseup','#brake', function(){
        document.getElementById('brake').value=0;      
    });
                   
})();
