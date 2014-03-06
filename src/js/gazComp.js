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
	//------------------------------------------------------------
	//  Events
	//------------------------------------------------------------
	this.ready = 'GAZCOMP.DATA-READY';
	this.error = 'GAZCOMP.DATA-ERROR';
	return this;
}

/**
 * Geonames data retrieval and conversion
 *
 * @param { String } _id 		Geonames place id
 */
gazComp.GeonamesData = function( _id ) {
	this.data = new gazComp.Data( _id );
	this.collection = "Geonames";
	this.id = _id;
}
gazComp.GeonamesData.prototype.get = function() {
	var self = this;
	$.ajax({
		type: 'GET',
		url: 'data/lutetia-geonames-pretty.json',
		timeout: 5000,
		dataType: 'json',
		success: function( _data ) { self.convert( _data ) },
		error: function( _data, _error, _opt ) {
			$( document ).trigger( self.data.error, [ _error, _opt ] );
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

/**
 * Pleiades data retrieval and conversion
 *
 * @param { String } _id 		Pleiades place id
 */
gazComp.PleiadesData = function( _id ) {
	this.data = new gazComp.Data( _id );
	this.collection = "Pleiades";
	this.id = _id;
}
gazComp.PleiadesData.prototype.get = function() {
	var self = this;
	$.ajax({
		type: 'GET',
		url: 'data/lutetia-pleiades-pretty.json',
		timeout: 5000,
		dataType: 'json',
		success: function( _data ) { self.convert( _data ) },
		error: function( _data, _error, _opt ) {
			$( document ).trigger( self.data.error, [ _error, _opt ] );
		}
	});
}
gazComp.PleiadesData.prototype.convert = function( _data ) {
	var self = this;
	self.data.src = _data;
	//------------------------------------------------------------
	//  Convert the data into a standard gazComp.Data object
	//------------------------------------------------------------
	self.data.clean.coords = [ _data.reprPoint[1], _data.reprPoint[0] ];
	self.data.clean.names = _data.names;
	self.data.clean.description = _data.description;
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
	this.data_sent = 'GAZCOMP.APP.DATA_SENT';
	this.send_error = 'GAZCOMP.APP.SEND_ERROR';
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
	$(document).on( 'GAZCOMP.DATA-READY', function() {
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
		center: new google.maps.LatLng( 42.4068441, -71.1186684 ),
		zoom: 17
	};
	this.map = new google.maps.Map( document.getElementById("map"), mapOptions );
}
/**
 * Clear the map and list
 */
gazComp.App.prototype.reset = function() {}
/**
 * Start the click and error listeners
 */
gazComp.App.prototype.start = function() {
	var self = this;
	$( '.choice', this.uiRoot ).on( 'touchstart click', function( _e ) {
		_e.preventDefault();
		self.send( $( this ).attr('id') );
	});
	//------------------------------------------------------------
	//  Data retrieval errors
	//------------------------------------------------------------
	$( document ).on( 'GAZCOMP.DATA-ERROR', function( _e, _error, _opt ) {
		self.errorDisplay( _e, _error, _opt );
	});
	//------------------------------------------------------------
	//  Data send errors
	//------------------------------------------------------------
	$( document ).on( self.send_error, function( _e, _error, _opt ) {
		self.errorDisplay( _e, _error, _opt );
	});
}
/**
 * Error display handler
 *
 * @param { Object } _e Event object
 * @param { String } _error Error string
 * @param { Object } _opt Error object
 */
gazComp.App.prototype.errorDisplay = function( _e, _error, _opt ) {
	console.log( 'Error: ' + _opt['message'] );
}
/**
 * HTTP Posts choice to this.outputUri
 *
 * @param { String } Choice to send to outputUri
 */
gazComp.App.prototype.send = function( _choice ) {
	var self = this;
	var data = {
		'g1': self.g1.collection + ":" + self.g1.id,
		'g2': self.g2.collection + ":" + self.g2.id,
		'choice': _choice
	}
	$.ajax({
		type: 'POST',
		url: self.outputUri,
		data: data,
		success: function( _data ) { 
			$( document ).trigger( self.data_sent )
		},
		error: function( _data, _error, _opt ) {
			//------------------------------------------------------------
			//  Trigger error
			//------------------------------------------------------------
			$( document ).trigger( self.send_error, [ _error, _opt ] );
		}
	});
}
/**
 * Builds comparison lists from gazetteer data objects
 */
gazComp.App.prototype.buildCompList = function() {}
gazComp.App.prototype.buildInfoWindow = function( _g, _class ) {
	//------------------------------------------------------------
	//  Get the gazetteer place names.
	//------------------------------------------------------------
	var names = ''
	if ( _g.data.clean.names != undefined ) {
		names = _g.data.clean.names.join(', ');
	}
	//------------------------------------------------------------
	//  Build the info window markup.
	//------------------------------------------------------------
	var markup = '\
		<div class="info_window '+ _class +'">\
			<div class="data_src">\
				<span class="collection">'+ _g.collection +'</span>:\
				<span class="id">'+ _g.id +'</span>\
			</div>\
			<div class="names">\
				'+ names +'\
			</div>\
		</div>\
	';
	return markup
}
/**
 * Plot the gazetteer places on a map
 */
gazComp.App.prototype.mapPlot = function() {
	var self = this;
	//------------------------------------------------------------
	//  Get the coordinates and mark them
	//------------------------------------------------------------
	var c1 = new google.maps.LatLng( self.g1.data.clean.coords[0], self.g1.data.clean.coords[1] );
	var c2 = new google.maps.LatLng( self.g2.data.clean.coords[0], self.g2.data.clean.coords[1] );
	//------------------------------------------------------------
	//  Marker one
	//------------------------------------------------------------
	var mark1 = new google.maps.Marker({
		position: c1,
		title: 'g1'
	});
	mark1.setMap( self.map );
	var info1 = new google.maps.InfoWindow({
		content: self.buildInfoWindow( self.g1, 'g1' )
	});
	info1.open( self.map, mark1 );
	//------------------------------------------------------------
	//  Marker two
	//------------------------------------------------------------
	var mark2 = new google.maps.Marker({
		position: c2,
		title: 'g2'
	});
	mark2.setMap( self.map );
	var info2 = new google.maps.InfoWindow({
		content: self.buildInfoWindow( self.g2, 'g2' )
	});
	info2.open( self.map, mark2 );
	//------------------------------------------------------------
	//  Set the map's viewport so marker bounding box is visible
	//------------------------------------------------------------
	var cBounds = new Array ( c1, c2 );
	var bBox = new google.maps.LatLngBounds();
	for ( var i = 0, len = cBounds.length; i < len; i++ ) {
		bBox.extend ( cBounds[i] );
	}
	self.map.fitBounds( bBox );
}