var gazComp = gazComp || { REVISION: '1' }
gazComp.Data = function( _id ) {
	this.id = _id;
	this.sample = {
		'coords': [ 1, 2 ],
		'lang': 'en',
		'names': [],
		'addl': [],
		'description' : ''
	};
	this.templateMap = {
		'num': [ 'coords' ],
		'list': [ 'names', 'addl' ],
		'short': [ 'lang' ],
		'full': [ 'description' ]
	}
	this.displayOrder = [ 'coords', 'lang', 'names', '...' ];
	this.src = null;
	this.clean = {};
	this.ready = 'GAZCOMP.DATA-READY';
	this.error = 'GAZCOMP.DATA-ERROR';
	return this;
}


gazComp.GeonamesData = function( _id ) {
	this.data = new gazComp.Data( _id );
}
gazComp.GeonamesData.prototype.get = function() {
	var self = this;
	$.ajax({
		type: 'get',
		url: 'data/lutetia-geonames-pretty.json',
		timeout: 5000,
		dataType: 'json',
		success: function( _data ) { self.convert( _data ) },
		error: function( _data ) {
			//------------------------------------------------------------
			//  Trigger error
			//------------------------------------------------------------
			$( document ).trigger( self.data.error, _data );
		}
	});
}
gazComp.GeonamesData.prototype.convert = function( _data ) {
	var self = this;
	self.data.src = _data;
	//------------------------------------------------------------
	//  Create the clean data... which should resemble the sample
	//------------------------------------------------------------
	self.data.clean.coords = [ _data.reprPoint[0], _data.reprPoint[1] ];
	//------------------------------------------------------------
	//  Trigger that the data is ready.
	//------------------------------------------------------------
	$( document ).trigger( self.data.ready );
}


gazComp.PleiadesData = function( _id ) {
	this.data = new gazComp.Data( _id );
}
gazComp.PleiadesData.prototype.get = function() {
	var self = this;
	$.ajax({
		type: 'get',
		url: 'data/lutetia-pleiades-pretty.json',
		timeout: 5000,
		dataType: 'json',
		success: function( _data ) { self.convert( _data ) },
		error: function( _data ) {
			//------------------------------------------------------------
			//  Trigger error
			//------------------------------------------------------------
			$( document ).trigger( self.data.error, _data );
		}
	});
}
gazComp.PleiadesData.prototype.convert = function( _data ) {
	var self = this;
	self.data.src = _data;
	self.data.clean.coords = [ _data.reprPoint[1], _data.reprPoint[0] ];
	//------------------------------------------------------------
	//  Trigger that the data is ready.
	//------------------------------------------------------------
	$( document ).trigger( self.data.ready );
}


/**
 * Retrieve the mouse position in relation to the view
 *
 * @param { String } _rootId 		The id attribute of the root UI element
 * @param { String } _outputURI		The uri to send choice output 
 */
gazComp.App = function( _rootId, _outputUri ) {
	this.uiRoot = '#'+_rootId;
	this.outputUri = _outputUri;
	this.totalComp = 0;
}
/**
 * Retrieve the mouse position in relation to the view
 *
 * @param { Obj } _domId 		The id attribute of the root UI element
 * @param { Obj } _outputUri	The uri to send choice output 
 */
gazComp.App.prototype.compare = function( _g1, _g2 ) {
	var self = this;
	self.loaded = 0;
	self.g1 = _g1;
	self.g2 = _g2;
	//------------------------------------------------------------
	//  First comparison?  Initialize display.  Otherwise reset it.
	//------------------------------------------------------------
	if ( self.totalComp == 0 ) {
		self.mapInit();
		self.start();
	}
	if ( self.totalComp != 0 ) {
		self.reset();
	}
	//------------------------------------------------------------
	//  Retrieve data from the data source
	//------------------------------------------------------------
	$(document).bind( 'GAZCOMP.DATA-READY', function() {
		self.ready();
	});
	self.g1.get();
	self.g2.get();
}
/**
 * Data sources are loaded... so now you are ready.
 */
gazComp.App.prototype.ready = function() {
	var self = this;
	self.loaded += 1;
	if ( self.loaded > 1 ) {
		self.mapPlot();
	}
}
/**
 * Initialize the google maps API
 */
gazComp.App.prototype.mapInit = function() {
	var mapOptions = {
		center: new google.maps.LatLng( -34.397, 150.644 ),
		zoom: 8
	};
	this.map = new google.maps.Map( document.getElementById("map"), mapOptions );
}
/**
 * Clear the map and list
 */
gazComp.App.prototype.reset = function() {}
/**
 * Start the click listeners
 */
gazComp.App.prototype.start = function() {
	var self = this;
	$( '.choice', this.uiRoot ).on( 'touchstart click', function( _e ) {
		_e.preventDefault();
		self.send( $( this ).attr('id') );
	});
}
/**
 * HTTP Posts choice to this.outputUri
 *
 * @param { String } Choice to send to outputUri
 */
gazComp.App.prototype.send = function( _choice ) {
	// What gets sent?
	// choice, g1_domain:id, g2_domain:id, 
	console.log( _choice );
}
/**
 * Builds comparison lists from gazetteer data objects
 */
gazComp.App.prototype.buildCompList = function() {}
/**
 * Plot the gazetteer places on a map
 */
gazComp.App.prototype.mapPlot = function() {
	var self = this;
	var c1 = new google.maps.LatLng( self.g1.data.clean.coords[0], self.g1.data.clean.coords[1] );
	var c2 = new google.maps.LatLng( self.g2.data.clean.coords[0], self.g2.data.clean.coords[1] );
	var mark1 = new google.maps.Marker({
		position: c1,
		title: 'g1'
	});
	mark1.setMap( self.map );
	
}