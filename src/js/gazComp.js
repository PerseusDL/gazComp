var gazComp = gazComp || { REVISION: '1' }
gazComp.Data = function( _collection, _id ) {
	this.collection = _collection;
	this.id = _id;
	this.handle = '\
		<span class="collection">'+ this.collection +'</span>:\
		<span class="id">'+ this.id +'</span>\
	';
	//------------------------------------------------------------
	//  Sample gazComp data object
	//------------------------------------------------------------
	this.sample = {
		'coords': [ 1, 2 ],
		'names': [ '', '...' ],
		'description' : '',
		'citations': [ '', '...' ]
	};
	//------------------------------------------------------------
	//  What order the items are listed
	//------------------------------------------------------------
	this.displayOrder = [ 'coords', 'names', 'description', 'citations', 'raw' ];
	//------------------------------------------------------------
	//  Different types of templates to display items
	//------------------------------------------------------------
	this.templateTypes = [ 'num', 'list', 'string', 'linkList', 'json' ];
	//------------------------------------------------------------
	//  Map an item type to a template type.
	//------------------------------------------------------------
	this.templateMap = {
		'coords': 'list',
		'names': 'list',
		'description': 'string',
		'citations': 'linkList',
		'raw': 'json'
	};
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
	this.data = new gazComp.Data( "Geonames", _id);
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
	//------------------------------------------------------------
	//  Coords
	//------------------------------------------------------------
	self.data.clean.coords = [ _data.reprPoint[0], _data.reprPoint[1] ];
	//------------------------------------------------------------
	//  Names
	//------------------------------------------------------------
	self.data.clean.names = [];
	for ( var i=0, ii=_data.names.length; i<ii; i++ ) {
		self.data.clean.names.push( _data.names[i].name );
	}
	//------------------------------------------------------------
	//  Citations
	//------------------------------------------------------------
	self.data.clean.citations = [];
	for ( var i=0, ii=_data.citations.length; i<ii; i++ ) {
		for ( var key in _data.citations[i] ) {
			self.data.clean.citations.push( _data.citations[i][key] );
		}
	}
	//------------------------------------------------------------
	//  Raw data
	//------------------------------------------------------------
	self.data.clean.raw = self.data.src;
	
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
	this.data = new gazComp.Data( "Pleiades", _id);
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
	//  Raw data
	//------------------------------------------------------------
	self.data.clean.raw = self.data.src;
	//------------------------------------------------------------
	//  Trigger that the data is ready.
	//------------------------------------------------------------
	$( document ).trigger( self.data.ready );
}

/**
 * Retrieve the mouse position in relation to the view
 *
 * @param { String } _outputURI		The uri to send choice output 
 */
gazComp.App = function( _outputUri ) {
	this.id = 'gazComp';
	this.uiRoot = '#'+this.id;
	this.outputUri = _outputUri;
	this.totalComp = 0;
	this.data_sent = 'GAZCOMP.APP.DATA_SENT';
	this.send_error = 'GAZCOMP.APP.SEND_ERROR';
	this.buildUi();
}
/**
 * Build the main structure of the user interface
 */
gazComp.App.prototype.buildUi = function() {
	var ui = '\
		<div id="gazComp">\
			<div id="map"></div>\
			<div id="choices">\
				<a href="" id="yes" class="choice">&#x2713;</a>\
				<a href="" id="no" class="choice">&#x2717;</a>\
				<a href="" id="dunno" class="choice">?</a>\
			</div>\
			<div id="header"></div>\
			<div id="comp"></div>\
		</div>\
	';
	$( 'body' ).append( ui );
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
		self.buildCompList();
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
 * Clear the map markers and list
 */
gazComp.App.prototype.clear = function() {
	var self = this;
	self.mark1.setMap( null );
	self.mark2.setMap( null );
	$( '#header', self.uiRoot ).empty();
	$( '#comp', self.uiRoot ).empty();
}
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
	//------------------------------------------------------------
	//  Window resize triggered redisplays
	//------------------------------------------------------------
	$( window ).resize( function(){
		self.sizeCompList();
		self.mapFit()
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
			$( document ).trigger( self.send_error, [ _error, _opt ] );
		}
	});
}
/**
 * Builds comparison lists from gazetteer data objects
 */
gazComp.App.prototype.buildCompList = function() {
	var self = this;
	var display = self.g1.data.displayOrder;
	var templateMap = self.g1.data.templateMap;
	//------------------------------------------------------------
	//  Build the headers
	//------------------------------------------------------------
	$( '#header', this.uiRoot ).append( self.buildWrap( self.g1.data.handle, self.g2.data.handle ) );
	//------------------------------------------------------------
	//  Make sure keys defined in display order are first shown
	//------------------------------------------------------------
	for ( var i=0, ii=display.length; i<ii; i++ ) {
		var key = display[i];
		var type = templateMap[ key ];
		//------------------------------------------------------------
		//  Call the build type method
		//------------------------------------------------------------
		var markup = self[ 'build'+type.capitalize() ]( key );
		$( '#comp', this.uiRoot ).append( markup );
	}
	//------------------------------------------------------------
	//  Make resize items so they're the same height
	//------------------------------------------------------------
	self.sizeCompList();
}
/**
 * Resize the comparison list
 */
gazComp.App.prototype.sizeCompList = function() {
	$( '#comp .item', this.uiRoot ).each( function() {
		var h1 = $( '.g1', this ).height();
		var h2 = $( '.g2', this ).height();
		var h = ( h1 > h2 ) ? h1 : h2;
		$( '.g1', this ).height( h );
		$( '.g2', this ).height( h );
	});
}
/**
 * Wrap output markup
 *
 * @param { String } _mark1 Gazetteer 1 markup
 * @param { String } _mark2 Gazetteer 2 markup
 * @param { String } _class Item class
 */
gazComp.App.prototype.buildWrap = function( _mark1, _mark2, _class ) {
	_class = ( _class == undefined ) ? '' : _class;
	var markup = '\
		<div class="item '+ _class +'">\
			<div class="gaz g1">\
				'+ _mark1 +'\
			</div>\
			<div class="gaz g2">\
				'+ _mark2 +'\
			</div>\
			<div class="clear"></div>\
		</div>\
	';
	return markup;
}
/**
 * Build a display for a list of links
 */
gazComp.App.prototype.buildLinkList = function( _key ) {
	var mark1 = this.buildLinkListSide( this.g1, _key );
	var mark2 = this.buildLinkListSide( this.g2, _key );
	return this.buildWrap( mark1, mark2, 'linkList' );
}
gazComp.App.prototype.buildLinkListSide = function( _g, _key ) {
	var g = _g.data.clean[ _key ];
	g = ( g == undefined ) ? [] : g;
	for ( var i=0, ii=g.length; i<ii; i++ ) {
		g[i] = '<a href="'+ g[i] +'">'+ g[i] +'</a>';
	}
	var markup = '\
		<div class="key">'+ _key +'</div>\
		<div class="val">'+ g.join("\n") +'</div>\
	';
	return markup;
}
/**
 * Build a display for raw json data
 */
gazComp.App.prototype.buildJson = function( _key ) {
	var mark1 = this.buildJsonSide( this.g1, _key );
	var mark2 = this.buildJsonSide( this.g2, _key );
	return this.buildWrap( mark1, mark2, 'json' );
}
gazComp.App.prototype.buildJsonSide = function( _g, _key ) {
	var g = _g.data.clean[ _key ];
	g = ( g == undefined ) ? [] : g;
	var markup = '\
		<div class="key">'+ _key +'</div>\
		<div class="val"><pre>'+ JSON.stringify( g, null, " " ) +'</pre></div>\
	';
	return markup;
}

/**
 * Build a list display item
 */
gazComp.App.prototype.buildList = function( _key ) {
	var mark1 = this.buildListSide( this.g1, _key );
	var mark2 = this.buildListSide( this.g2, _key );
	return this.buildWrap( mark1, mark2, 'list' );
}
gazComp.App.prototype.buildListSide = function( _g, _key ) {
	var g = _g.data.clean[ _key ];
	g = ( g == undefined ) ? [] : g;
	var markup = '\
		<div class="key">'+ _key +'</div>\
		<div class="val">'+ g.join(', ') +'</div>\
	';
	return markup;
}

/**
 * Build a short text item.
 */
gazComp.App.prototype.buildString = function( _key ) {
	var mark1 = this.buildStringSide( this.g1, _key );
	var mark2 = this.buildStringSide( this.g2, _key );
	return this.buildWrap( mark1, mark2, 'short' );
}
gazComp.App.prototype.buildStringSide = function( _g, _key ) {
	var g = _g.data.clean[ _key ];
	g = ( g == undefined ) ? '' : g;
	var markup = '\
		<div class="key">'+ _key +'</div>\
		<div class="val">'+ g +'</div>\
	';
	return markup;
}
/**
 * Build a google map info window
 *
 * @param { Object } _g One of the two gazetteer objects.
 * @param { String } _class The info window class to mark which gazetteer.
 */
gazComp.App.prototype.buildInfoWindow = function( _g, _class ) {
	//------------------------------------------------------------
	//  Build the info window markup.
	//------------------------------------------------------------
	var markup = '\
		<div class="info_window '+ _class +'">\
			<div class="data_src">\
				'+ _g.data.handle +'\
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
	//  Marker and info-box one
	//------------------------------------------------------------
	self.mark1 = new google.maps.Marker({
		position: c1,
		title: 'g1'
	});
	self.mark1.setMap( self.map );
	self.info1 = new google.maps.InfoWindow({
		content: self.buildInfoWindow( self.g1, 'g1' )
	});
	self.info1.open( self.map, self.mark1 );
	//------------------------------------------------------------
	//  Marker and info-box two
	//------------------------------------------------------------
	self.mark2 = new google.maps.Marker({
		position: c2,
		title: 'g2'
	});
	self.mark2.setMap( self.map );
	self.info2 = new google.maps.InfoWindow({
		content: self.buildInfoWindow( self.g2, 'g2' )
	});
	self.info2.open( self.map, self.mark2 );
	//------------------------------------------------------------
	//  Set the map's viewport so marker bounding box is visible
	//------------------------------------------------------------
	self.mapFit()
}
/**
 * Set the map's viewport so marker bounding box is visible
 */
gazComp.App.prototype.mapFit = function() {
	var self = this;
	//------------------------------------------------------------
	//  Get the coordinates and mark them
	//------------------------------------------------------------
	var c1 = new google.maps.LatLng( self.g1.data.clean.coords[0], self.g1.data.clean.coords[1] );
	var c2 = new google.maps.LatLng( self.g2.data.clean.coords[0], self.g2.data.clean.coords[1] );
	var cBounds = new Array ( c1, c2 );
	var bBox = new google.maps.LatLngBounds();
	for ( var i = 0, len = cBounds.length; i < len; i++ ) {
		bBox.extend ( cBounds[i] );
	}
	self.map.fitBounds( bBox );
}
/**
 * Capitalize a string
 */
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}