/*!
	Timeline
	Designed and built by Zach Wise at VéritéCo

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    http://www.gnu.org/licenses/

*/  

/* 	CodeKit Import
	http://incident57.com/codekit/
================================================== */

// @codekit-prepend "VMM.Timeline.License.js";

// @codekit-prepend "VMM.js";
// @codekit-prepend "VMM.Library.js";
// @codekit-prepend "VMM.Browser.js";
// @codekit-prepend "VMM.MediaElement.js";
// @codekit-prepend "VMM.MediaType.js";
// @codekit-prepend "VMM.Media.js";
// @codekit-prepend "VMM.FileExtention.js";
// @codekit-prepend "VMM.ExternalAPI.js";
// @codekit-prepend "VMM.TouchSlider.js";
// @codekit-prepend "VMM.DragSlider.js";
// @codekit-prepend "VMM.Slider.js";
// @codekit-prepend "VMM.Slider.Slide.js";
// @codekit-prepend "VMM.Util.js";
// @codekit-prepend "VMM.LoadLib.js";
// @codekit-prepend "VMM.Language.js";

// @codekit-append "VMM.Timeline.TimeNav.js";
// @codekit-append "VMM.Timeline.DataObj.js";

// @codekit-prepend "lib/AES.js";
// @codekit-prepend "lib/bootstrap-tooltip.js";

/* Timeline
================================================== */

if(typeof VMM != 'undefined' && typeof VMM.Timeline == 'undefined') {
	
	VMM.Timeline = function(w, h, conf, _timeline_id) {
		
		var $timeline, $feedback, $messege, slider, timenav, version, timeline_id;
		var events = {}, data = {}, _dates = [], config = {};
		var has_width = false, has_height = false, ie7 = false, is_moving = false;
		
		if (type.of(_timeline_id) == "string") {
			timeline_id = 			_timeline_id;
		} else if (type.of(_timeline_id) == "html") {
			$timeline = _timeline_id;
		} else {
			timeline_id = 			"#timeline";
		}
		
		version = 					"1.10";
		
		trace("TIMELINE VERSION " + version);
		
		/* CONFIG
		================================================== */
		config = {
			id: 					timeline_id,
			type: 					"timeline",
			maptype: 				"toner",
			preload:				4,
			current_slide:			0,
			hash_bookmark:			false,
			start_at_end: 			false,
			start_page: 			false,
			api_keys: {
				google:				"",
				flickr:				"",
				twitter:			""
			},
			interval: 				10,
			something: 				0,
			width: 					960,
			height: 				540,
			spacing: 				15,
			loaded: {
				slider: 			false, 
				timenav: 			false, 
				percentloaded: 		0
			},
			nav: {
				start_page: 		false,
				interval_width: 	200,
				density: 			4,
				minor_width: 		0,
				multiplier: {
					current: 		6,
					min: 			.1,
					max: 			50
				},
				rows: 				[1, 1, 1],
				width: 				960,
				height: 			200,
				marker: {
					width: 			150,
					height: 		48
				}
			},
			feature: {
				width: 				960,
				height: 			540
			},
			slider: {
				width: 				720,
				height: 			400,
				content: {
					width: 			720,
					height: 		400,
					padding: 		130,
				},
				nav: {
					width: 			100,
					height: 		200
				}
			},
			ease: 					"easeInOutExpo",
			duration: 				1000,
			language: 				VMM.Language
		};
		
		if ( w != null && w != "") {
			config.width = w;
			has_width = true;
		} 

		if ( h != null && h != "") {
			config.height = h;
			has_height = true;
		}
		
		if(window.location.hash) {
			 var hash					=	window.location.hash.substring(1);
			 if (!isNaN(hash)) {
			 	 config.current_slide		=	parseInt(hash);
			 }
		}
		
		window.onhashchange = function () {
			if (config.hash_bookmark) {
				if (is_moving) {
					var hash					=	window.location.hash.substring(1);
					goToEvent(parseInt(hash));
				} else {
					is_moving = false;
				}
			}
		}
		
		/* CREATE CONFIG
		================================================== */
		var createConfig = function(conf) {
			
			// APPLY SUPPLIED CONFIG TO TIMELINE CONFIG
			if (typeof timeline_config == 'object') {
				trace("HAS TIMELINE CONFIG");
			    var x;
				for (x in timeline_config) {
					if (Object.prototype.hasOwnProperty.call(timeline_config, x)) {
						config[x] = timeline_config[x];
					}
				}
			} else if (typeof conf == 'object') {
				var x;
				for (x in conf) {
					if (Object.prototype.hasOwnProperty.call(conf, x)) {
						config[x] = conf[x];
					}
				}
			}
			
			config.nav.width			=	config.width;
			config.nav.height			=	200;
			config.feature.width		=	config.width;
			config.feature.height		=	config.height - config.nav.height;
			VMM.Timeline.Config			=	config;
			VMM.master_config.Timeline	=	VMM.Timeline.Config;
		}
		
		/* CREATE TIMELINE STRUCTURE
		================================================== */
		var createStructure = function(w, h) {
			VMM.Lib.addClass($timeline, "vmm-timeline");
			
			$feedback = 			VMM.appendAndGetElement($timeline, "<div>", "feedback", "");
			$messege = 				VMM.appendAndGetElement($feedback, "<div>", "messege", "Timeline");
			
			if (!has_width) {
				config.width = VMM.Lib.width($timeline);
			} else {
				VMM.Lib.width($timeline, config.width);
			}

			if (!has_height) {
				config.height = VMM.Lib.height($timeline);
			} else {
				VMM.Lib.height($timeline, config.height);
			}
			
		}
		
		/* ON EVENT
		================================================== */

		function onDataReady(e, d) {
			
			data = d.timeline;
			
			if (type.of(data.era) == "array") {
				
			} else {
				data.era = [];
			}
			
			buildDates();
			
		};
		
		function onDatesProcessed() {
			build();
		}
		
		function reSize() {
			updateSize();
			slider.setSize(config.feature.width, config.feature.height);
			timenav.setSize(config.width, config.height);
		};
		
		function onSliderLoaded(e) {
			config.loaded.slider = true;
			onComponentLoaded();
		};
		
		function onComponentLoaded(e) {
			config.loaded.percentloaded = config.loaded.percentloaded + 25;
			
			if (config.loaded.slider && config.loaded.timenav) {
				hideMessege();
			}
		}
		
		function onTimeNavLoaded(e) {
			config.loaded.timenav = true;
			onComponentLoaded();
		}
		
		function onSlideUpdate(e) {
			is_moving = true;
			config.current_slide = slider.getCurrentNumber();
			setHash(config.current_slide);
			timenav.setMarker(config.current_slide, config.ease,config.duration);
		};
		
		function onMarkerUpdate(e) {
			is_moving = true;
			config.current_slide = timenav.getCurrentNumber();
			setHash(config.current_slide);
			slider.setSlide(config.current_slide);
		};
		
		var goToEvent = function(n) {
			if (n <= _dates.length - 1 && n >= 0) {
				config.current_slide = n;
				slider.setSlide(config.current_slide);
				timenav.setMarker(config.current_slide, config.ease,config.duration);
			} 
		}
		
		function setHash(n) {
			if (config.hash_bookmark) {
				window.location.hash = "#" + n.toString();
			}
		}
		
		/* PUBLIC FUNCTIONS
		================================================== */
		this.init = function(_data, _timeline_id, conf) {
			
			if (type.of(_timeline_id) == "string") {
				if (_timeline_id.match("#")) {
					timeline_id = _timeline_id;
				} else {
					timeline_id = "#" + _timeline_id;
				}
				$timeline = VMM.getElement(timeline_id);
			} else if (type.of(_timeline_id) == "html") {
				$timeline = _timeline_id;
			}
			
			createConfig(conf);
			createStructure(w,h);
			
			trace('TIMELINE INIT');
			VMM.Util.date.setLanguage(VMM.Timeline.Config.language);
			
			$feedback = VMM.appendAndGetElement($timeline, "<div>", "feedback", "");
			$messege = VMM.appendAndGetElement($feedback, "<div>", "messege", VMM.Timeline.Config.language.messages.loading_timeline);
			
			VMM.bindEvent(global, onDataReady, "DATAREADY");
			VMM.bindEvent(global, showMessege, "MESSEGE");
			
			/* GET DATA
			================================================== */
			
			if (VMM.Browser.browser == "MSIE" && parseInt(VMM.Browser.version, 10) == 7) {
				ie7 = true;
				VMM.fireEvent(global, "MESSEGE", "Internet Explorer 7 is not supported by #Timeline.");
			} else {
				if (type.of(_data) == "string" || type.of(_data) == "object") {
					trace("GET DATA 1")
					VMM.Timeline.DataObj.getData(_data);
				} else {
					VMM.Timeline.DataObj.getData($timeline);
				}
			}
			
		};
		
		this.iframeLoaded = function() {
			trace("iframeLoaded");
		};
		
		/* DATA 
		================================================== */
		var getData = function(url) {
			VMM.getJSON(url, function(d) {
				data = VMM.Timeline.DataObj.getData(d);
				VMM.fireEvent(global, "DATAREADY");
			});
		};
		
		/* MESSEGES 
		================================================== */
		
		var showMessege = function(e, msg) {
			trace("showMessege " + msg);
			VMM.attachElement($messege, msg);
		};
		
		var hideMessege = function() {
			VMM.Lib.animate($feedback, config.duration, config.ease*4, {"opacity": 0}, detachMessege);
		};
		
		var detachMessege = function() {
			VMM.Lib.detach($feedback);
		}
		
		/* BUILD DISPLAY
		================================================== */
		var build = function() {
			
			// START AT END?
			if (config.start_at_end) {
				config.current_slide = _dates.length - 1;
			}
			// CREATE DOM STRUCTURE
			VMM.attachElement($timeline, "");
			VMM.appendElement($timeline, "<div class='container main'><div class='feature'><div class='slider'></div></div><div class='navigation'></div></div>");
			slider = 				  new VMM.Slider(jQuery("div.slider", $timeline), config);
			timenav = 				new VMM.Timeline.TimeNav(jQuery("div.navigation", $timeline));
			
			reSize();
			
			VMM.bindEvent(jQuery("div.slider", $timeline), onSliderLoaded, "LOADED");
			VMM.bindEvent(jQuery("div.navigation", $timeline), onTimeNavLoaded, "LOADED");
			VMM.bindEvent(jQuery("div.slider", $timeline), onSlideUpdate, "UPDATE");
			VMM.bindEvent(jQuery("div.navigation", $timeline), onMarkerUpdate, "UPDATE");
			
			slider.init(_dates);
			timenav.init(_dates, data.era);
			
			// RESIZE EVENT LISTENERS
			VMM.bindEvent(global, reSize, "resize");
			//VMM.bindEvent(global, function(e) {e.preventDefault()}, "touchmove");
			
		};
		
		var updateSize = function() {
			trace("UPDATE SIZE");
			config.width = VMM.Lib.width($timeline);
			config.height = VMM.Lib.height($timeline);
			
			config.nav.width = config.width;
			config.feature.width = config.width;
			
			if (VMM.Browser.device == "mobile") {
				//config.feature.height = config.height;
			} else {
				//config.feature.height = config.height - config.nav.height - 3;
			}
			config.feature.height = config.height - config.nav.height - 3;
		};
		
		// BUILD DATE OBJECTS
		var buildDates = function() {
			
			updateSize();
			
			VMM.fireEvent(global, "MESSEGE", "Building Dates");
			
			for(var i = 0; i < data.date.length; i++) {
				
				if (data.date[i].startDate != null && data.date[i].startDate != "") {
					
					var _date = {};
					
					// START DATE
					if (data.date[i].type == "tweets") {
						_date.startdate = VMM.ExternalAPI.twitter.parseTwitterDate(data.date[i].startDate);
					} else {
						_date.startdate = VMM.Util.date.parse(data.date[i].startDate);
					}
					
					_date.uniqueid = (data.date[i].startDate).toString() + "-" + i.toString();
					
					// END DATE
					if (data.date[i].endDate != null && data.date[i].endDate != "") {
						if (data.date[i].type == "tweets") {
							_date.enddate = VMM.ExternalAPI.twitter.parseTwitterDate(data.date[i].endDate);
						} else {
							_date.enddate = VMM.Util.date.parse(data.date[i].endDate);
						}
					} else {
						_date.enddate = _date.startdate;
					}
					
					_date.title				=	data.date[i].headline;
					_date.headline			=	data.date[i].headline;
					_date.type				=	data.date[i].type;
					_date.date				=	VMM.Util.date.prettyDate(_date.startdate);
					_date.startdate_str		=	VMM.Util.date.prettyDate(_date.startdate);
					_date.enddate_str		=	VMM.Util.date.prettyDate(_date.enddate);
					_date.asset				=	data.date[i].asset;
					_date.fulldate			=	_date.startdate.getTime();
					_date.text				=	data.date[i].text;
					_date.content			=	"";
					
					_dates.push(_date);
					
				}
				
			};
			
			/* CUSTOM SORT
			================================================== */
			_dates.sort(function(a, b){
				return a.fulldate - b.fulldate
			});
			
			/* CREATE START PAGE IF AVAILABLE
			================================================== */
			if (data.headline != null && data.headline != "" && data.text != null && data.text != "") {
				trace("HAS STARTPAGE");
				var _date		=	{};
				var td_num		=	0;
				var td			=	_dates[0].startdate;
				_date.startdate =	_dates[0].startdate;
				trace(_dates[0].startdate);
				trace(_date.startdate);
				
				if (td.getMonth() === 0 && td.getDate() == 1 && td.getHours() === 0 && td.getMinutes() === 0 ) {
					// trace("YEAR ONLY");
					_date.startdate.setFullYear(td.getFullYear() - 1);
				} else if (td.getDate() <= 1 && td.getHours() === 0 && td.getMinutes() === 0) {
					// trace("YEAR MONTH");
					_date.startdate.setMonth(td.getMonth() - 1);
				} else if (td.getHours() === 0 && td.getMinutes() === 0) {
					// trace("YEAR MONTH DAY");
					_date.startdate.setDate(td.getDate() - 1);
				} else  if (td.getMinutes() === 0) {
					// trace("YEAR MONTH DAY HOUR");
					_date.startdate.setHours(td.getHours() - 1);
				} else {
					// trace("YEAR MONTH DAY HOUR MINUTE");
					_date.startdate.setMinutes(td.getMinutes() - 1);
				}
				
				_date.uniqueid	=	VMM.Util.unique_ID(5);
				_date.enddate	=	_date.startdate;
				_date.title		=	data.headline;
				_date.headline	=	data.headline;
				_date.text		=	data.text;
				_date.type		=	"start";
				_date.date		=	VMM.Util.date.prettyDate(data.startDate);
				_date.asset		=	data.asset;
				_date.fulldate	=	_date.startdate.getTime();
				
				_dates.push(_date);
			}
			
			/* CUSTOM SORT
			================================================== */
			_dates.sort(function(a, b){
				return a.fulldate - b.fulldate
			});
			
			onDatesProcessed();
		}
		
	};

	VMM.Timeline.Config = {};
	
};
