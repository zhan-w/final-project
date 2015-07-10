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

function initRenderSphere(imgData) {
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
	image.src = imgData//put dataURL here in string

	var material = new THREE.MeshBasicMaterial( {
		// pass the panorama img returned form streetview api here
		map: texture
	} );

	mesh = new THREE.Mesh( geometry, material );
	mesh.scale.x = -1;
	mesh.scale.y = - 1;
	// mesh.doubleSided = true;

	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
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
	isUserInteracting = true;

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;
}

function onDocumentMouseMove( event ) {
	if ( isUserInteracting === true ) {
		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
	}
}

function onDocumentMouseUp( event ) {
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
	// add an event listener here to toggle distortion. cool effect.
	// camera.position.copy( camera.target ).negate();
	
	renderer.render( scene, camera );
}

