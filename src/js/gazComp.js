var gazComp = gazComp || { REVISION: '1' }

gazComp.Data = function( _id ) {
	this.id = _id;
	this.sample = {}
	console.log( this.id );
}
gazComp.Data.prototype.get = function( _url) {
	$.ajax({
		type: 'get',
		url: _url,
		//timeout: 5000,
		dataType: 'jsonp',
		success: function( _data ) {
			console.log( _data );
		}
}
gazComp.Data.prototype.data = function() {}

gazComp.GeonamesData = function( _id ) {}
gazComp.GeonamesData.prototype.get = function() {}

gazComp.PleiadesData = function( _id ) {
	//reprPoint = coordData
}
gazComp.PleiadesData.prototype.get = function() {}

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
	if ( this.totalComp == 0 ) {
		this.mapInit();
	}
	if ( this.totalComp != 0 ) {
		this.reset();
	}
	//------------------------------------------------------------
	//  Retrieve data from the data source
	//------------------------------------------------------------
	this.start();
	this.totalComp += 1;
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
gazComp.App.prototype.reset = function() {
	
}

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
gazComp.App.prototype.mapPlot = function() {}
