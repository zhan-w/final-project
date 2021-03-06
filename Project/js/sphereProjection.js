var camera, scene, renderer;

var isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0;

$(function(){
if ($('#container').length > 0) {
	initRenderSphere();
	animate();
	}
});

function initRenderSphere(imgData, depthData, gDepthMap) {
	var container, mesh;

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
	camera.target = new THREE.Vector3( 0, 0, 0 );

	scene = new THREE.Scene();

	var geometry = new THREE.SphereGeometry( 500, 60, 40 );
	geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

	var image =  document.createElement( 'img' );
	var texture = new THREE.Texture(image);
	image.addEventListener('load', function(event){
		texture.flipY = false;
		texture.needsUpdate = true;					
	});
	image.src = imgData;

	texture.minFilter = THREE.NearestFilter;

	var material = new THREE.MeshBasicMaterial( {
		// pass the panorama img returned form streetview api here
		map: texture
	} );

	mesh = new THREE.Mesh( geometry, material );
	mesh.scale.x = -1;
	mesh.scale.y = - 1;

	scene.add( mesh );

	// calling the weather data
	 weather();

	// load 3d models in the scene
	loadArtefact();


	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	$("#container").on( 'mousedown', onDocumentMouseDown);
	$("#container").on( 'mouseover', mouseOver);
	$("#container").on('mouseleave', mouseLeave);
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

	// 
	document.addEventListener( 'dragover', function ( event ) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	}, false );

	document.addEventListener( 'dragenter', function ( event ) {
		document.body.style.opacity = 0.5;
	}, false );

	document.addEventListener( 'dragleave', function ( event ) {
		document.body.style.opacity = 1;
	}, false );

	document.addEventListener( 'drop', function ( event ) {
		event.preventDefault();

		var reader = new FileReader();
		reader.addEventListener( 'load', function ( event ) {
			material.map.image.src = event.target.result;
			material.map.needsUpdate = true;
		}, false );
		reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

		document.body.style.opacity = 1;

	}, false );

	//
	window.addEventListener( 'resize', onWindowResize, false );
}//end of function init()


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown( event ) {
 	event.preventDefault();
 	$("#map-canvas").toggle();
	isUserInteracting = true;

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;

	// normalized device coordinates
	var mouse = new THREE.Vector3();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function mouseOver(event) {
	console.log("mouseover");
	var mouse = new THREE.Vector3();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	var raycaster = new THREE.Raycaster();

	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( scene.children );

	// var intersects = raycaster.intersectObjects( object, true );
	// debugger;
	intersects[0].object.material.emissive.set("black")
	console.log(intersects[0]);
}

function mouseLeave(event){
	
}

function onDocumentMouseMove( event ) {
	if ( isUserInteracting === true ) {
		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
	}
}

function onDocumentMouseUp( event ) {
	if ($("#map-canvas").css('display') === "none") {
	 $("#map-canvas").toggle();
	}
	isUserInteracting = false;
}

function onDocumentMouseWheel( event ) {
	// WebKit
	if ( event.wheelDeltaY ) {
		camera.fov -= event.wheelDeltaY * 0.05;
	// Opera / Explorer 9
	} else if ( event.wheelDelta ) {
		camera.fov -= event.wheelDelta * 0.05;
	// Firefox
	} else if ( event.detail ) {
		camera.fov += event.detail * 1.0;
	}
	camera.updateProjectionMatrix();
}

function animate() {
	requestAnimationFrame( animate );
	update();
}

function update() {

	if ($("canvas").length > 1) {
		$("canvas")[0].remove()
	}
	if ( isUserInteracting === false ) {
		lon += 0.1;
	}
	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );

	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = 500 * Math.cos( phi );
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( camera.target );

	// distortion
	camera.position.copy(camera.target).negate()
	
	renderer.render( scene, camera );

}

