
//The scene created here consist of a HTML container, WebGL renderer, CSS Renderer, lights, camera, controller, projectors and raytracers, imported 3d json geometries with materials as various scene elements.


var container, scene, camera, renderer, controls, stats, cameraPosition, cubeCamera, smaterial, material, audio, dirLight, INTERSECTED, renderer2, planeMaterial, reflectionCube, projector, getCamPos, composer, activeRimColor, activeBrakeColor, tex_resolution;
var container_width;
var container_height;
var reducedScaleMarker, increasedScaleMarker;

var angle = 0, speed = .0025, centerY = 200, waveHeight = 200, targetPositionY = 0;

var annotation = false;
var previousTime = 0;
var highlightMarker_flag = false;
var enableMarkerOnHoverEffect = false;
var mouse = { x: 0, y: 0 };
var enabledMarkerClick = true; 
var enabledMarkerHover = true;
var CamMovementTest = false;
var enableBloom = false;
var controlpanel_expanded = true;

// init some global objects
var manager = new THREE.LoadingManager();
var loader = new THREE.JSONLoader(manager);
var tex_loader = new THREE.TextureLoader(manager);
var clock = new THREE.Clock();
var client = new ClientJS();

var isMobileDevice = client.isMobile();
if(isMobileDevice == true){
    tex_resolution = '1K';
    $('#Quality_Ultra').css('display', 'none');
    $('#Quality_High').css('display', 'none');
    $('#Quality_Medium').removeClass('active');
    $('#Quality_Low').addClass('active');
    
    controlpanel_expanded = false;
    $('#controls-btn-panel').addClass('verticle-controlbutton-menu');
    // $('#controls-btn-panel li').css('float', 'right');
    $('.control-buttons').addClass('packed-control-buttons');
    $('#popover-content').removeClass('custom-popover');
    $('#popover-content').addClass('custom-popover-mobile');
    $('#Glossness-card').css('display', 'none');
    $('[data-toggle="tooltip"]').tooltip('destroy');

    reducedScaleMarker = 45;
    increasedScaleMarker = 60;
} else {
    reducedScaleMarker = 30;
    increasedScaleMarker = 45;

    tex_resolution = '1K';
    controlpanel_expanded = true;
}

// This is the main function. It initialize all the basic setups required for the scene.
function init() {

    THREE.Cache.enabled = true;

    //init scene
    scene = new THREE.Scene();
    scene.name = "Scene";

    //init container
    container = document.getElementById("configurator_container");
    var RendererAntialias;
    
    // fit the scene in the HTML container
    fitContainer();

    if(isMobileDevice == true){
        RendererAntialias = false;
    } else {
        RendererAntialias = true;
    }

    // init WebGL Renderer and set up parameters
    renderer = new THREE.WebGLRenderer({
        antialias:RendererAntialias,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.domElement.style.zIndex = 5;
    container.appendChild(renderer.domElement);

    // init a camera and define the parameters
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 10, 100000);
    camera.position.set(-680, 595, -595);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // init controls and controller parameters
    controls = new THREE.OrbitControls(camera, container);
    controls.maxPolarAngle = Math.PI / 2;
    controls.target = new THREE.Vector3(0, 8, 0);
    controls.enablePan = false;
    controls.maxDistance = 2500;
    controls.minDistance = 200;
    controls.autoRotateSpeed = 1;

    // init Background music/audio
    audio = document.createElement('audio');
    var source = document.createElement('source');
    source.src = './custom/sounds/donk.mp3';
    audio.appendChild(source);
    audio.volume = 0.05;
    audio.loop = true;

    // Monitor loading progress in percentage
    manager.onProgress = function(item, loaded, total) {
        var percentage = Math.round((loaded / total * 100));
        $('#loadPercentage, #imageLoadPercentage').html(percentage);
    };

    // excute this when loading is completed
    manager.onLoad = function() {
        $(".loaderPanel").fadeOut( "slow" );
        $('#fullscreen').css('display', 'block');
        $('#soundButton').css('display', 'block');
        $('.control-buttons').css('display', 'block');
        wheel.visible = true;
        audio.play();

        // controll the behaviour of the intro - overlay element
        var intro_overlay = $('.intro-overlay')[0];
        intro_overlay.addEventListener("mousedown", hideIntro);
        
        function hideIntro () { 
            $('.intro-about').fadeOut(3000);
            $('.intro-overlay').addClass('fadeOutoverlay');
            intro_overlay.removeEventListener("mousedown", hideIntro); 
        }
        
        setTimeout(function(){ 
            hideIntro();
        }, 20000);
            
        // decide what should be visible on mobiles
        if (isMobileDevice == false) {
            $('#tool-extender').css('display', 'none');
            $('#controls-btn-panel').css('right', '20px');
        } else{
            if( client.getOS() == "iOS" ){
                $('#fullscreenButton').css('display','none');
            }
            $('[data-toggle="tooltip"]').tooltip('destroy');
        };

        Garage.visible = true;
        controls.autoRotate = true;
    };

    // if loading of the model fails or is iterupted use the following alert
    manager.onError = function() {
        alert('Yikes! Couldnt load 3d model');
    };

    // dicide which folder to use a texture image source.
    getTextureUrls();
    
    // this is where the main 3D element, the wheel, is called
    loadWheel();

    // define the sprite elements in the 3D scene
    var spriteMap = tex_loader.load("./custom/image/icons/SnazzyWhite.png");
    var spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
        color: 0xffffff,
    });
    spriteMaterial.transparent = true;
    spriteMaterial.opacity = 1;

    // this sprite refers to the Rim. However, this element is kept hidden in the scene.
    // simply uncomment 'wheel.add(spriteHub);' to add this to scene
    spriteHub = new THREE.Sprite(spriteMaterial);
    spriteHub.name = "spriteHub";
    spriteHub.scale.set(45, 45, 45);
    if (isMobileDevice == true){
        spriteHub.position.set(0, 0, 94);
    } else {
        spriteHub.position.set(0, 0, 80);
    }
    // wheel.add(spriteHub);

    // this sprite refers to the tyre
    spriteTyre = new THREE.Sprite(spriteMaterial);
    spriteTyre.name = "spriteTyre";
    spriteTyre.scale.set(reducedScaleMarker, reducedScaleMarker, reducedScaleMarker);
    if (isMobileDevice == true){
        spriteTyre.position.set(0, 338, 0)
    } else {
        spriteTyre.position.set(0, 330, 0);
    }
    wheel.add(spriteTyre);

    // this sprite refers to the Discbrake. However, this element is kept hidden in the scene.
    // simply uncomment 'wheel.add(spriteDisc);' to add this to scene
    spriteDisc = new THREE.Sprite(spriteMaterial);
    spriteDisc.name = "spriteDisc";
    spriteDisc.scale.set(reducedScaleMarker, reducedScaleMarker, reducedScaleMarker);
    spriteDisc.position.set(0, 150, 40);
    // wheel.add(spriteDisc);

    projector = new THREE.Projector();

    // Custom geometries created to highlight and indicate various elements in the scene
    var radius = 320,
        segments = 64,
        CircleMaterial = new THREE.LineDashedMaterial({
            color: 0xffffff,
            linewidth: 4,
            scale: 1,
            dashSize: 14,
            gapSize: 7
        }),
    Circlegeometry = new THREE.CircleGeometry(radius, segments);
    Circlegeometry.vertices.shift();
    Circlegeometry.computeLineDistances();
    dashedCircle = new THREE.Line(Circlegeometry, CircleMaterial);
    dashedCircle.visible = false;
    dashedCircle.position.y = 4.2;
    dashedCircle.rotation.z = -Math.PI;
    scene.add(dashedCircle);

    element = document.getElementById('MarkerTyre');
    PopupMenu3(element);
    element = document.getElementById('MarkerRim');
    PopupMenu3(element);
    element = document.getElementById('MarkerDisc');
    PopupMenu3(element);

    //CSS3D Renderer
    renderer2 = new THREE.CSS3DRenderer();
    renderer2.setSize(window.innerWidth, window.innerHeight);
    renderer2.domElement.style.position = 'absolute';
    renderer2.domElement.style.top = 0;
    container.appendChild(renderer2.domElement);

    AddLights();

    // Here current set up is based on the basis of optimal balance between performance and apperence.
    if ( isMobileDevice == true ){
        // bestPerformance();
        bestAppearance(); 
    } else {
        bestAppearance();
    }
    
    // add various event listeners to perform various actions.
    function addListenerMulti(element, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i=0, iLen=events.length; i<iLen; i++) {
            element.addEventListener(events[i], listener, false);
        }
    }
    addListenerMulti(document, 'click touchstart', onMarkerClick);
    document.addEventListener('mousemove', onDocumentMouseMove, false); 
    window.addEventListener('resize', onWindowResize, false); 

    // Element to track various performance parameters
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.right = '0px';
    stats.domElement.style.left = 'auto';
    stats.domElement.style.top = '0px';
    stats.domElement.style.display = 'none';
    document.body.appendChild(stats.dom);
}
// needed when we need to change the quality level from the UI
function loadTextureMaps(){

    $("#configurator_container").css('filter','blur(20px)' );
    $(".HD-SD").css('display', 'block');

    brick_wall.material[0].map.dispose();
    brick_wall.material[0].map = tex_loader.load( alternateBaseUrls + "wall_baked_texture_v4.jpg");
    brick_wall.material[0].needsUpdate = true;

    black_steel.material[0].map.dispose();
    black_steel.material[0].map = tex_loader.load( alternateBaseUrls + "black_steel_tex.jpg");
    black_steel.material[0].needsUpdate = true;

    borders.material[0].map.dispose();
    borders.material[0].map = tex_loader.load( alternateBaseUrls + "borders_tex.jpg");
    borders.material[0].needsUpdate = true;
    
    floor_ceiling.material[0].map.dispose();
    floor_ceiling.material[0].map = tex_loader.load( alternateBaseUrls + "floor_tex_new.jpg");
    floor_ceiling.material[0].needsUpdate = true;
    
    grills.material[0].map.dispose();
    grills.material[0].map = tex_loader.load( alternateBaseUrls + "frames_tex.jpg");
    grills.material[0].needsUpdate = true;
    
    wood.material[0].map.dispose();
    wood.material[0].map = tex_loader.load( alternateBaseUrls + "wood_tex.jpg");
    wood.material[0].needsUpdate = true;
    
    ceiling_lights_back_panel.material[0].map.dispose();
    ceiling_lights_back_panel.material[0].map = tex_loader.load( alternateBaseUrls + "ceilng_lights_back_panel_tex1.jpg");
    ceiling_lights_back_panel.material[0].needsUpdate = true;

    // manager.onProgress = function(item, loaded, total) {
    //     var percentage = Math.round((loaded / total * 100));
    //     $('#loadPercentage').html(percentage);
    // };
    manager.onLoad = function() {
        $("#configurator_container").css('filter','' );
        $(".HD-SD").css('display', 'none');
    };   
}

// Here we have remove the Garage scene to save some memory spaces and increase the frame rate.
// altough, since we have already optimized this application for various different devices we don't need to call this function
function bestPerformance(){
    scene.fog = new THREE.Fog(0x3c3e49, 50, 2500);
    renderer.setClearColor(0x3c3e49, 1);

    var planeGeometry = new THREE.PlaneBufferGeometry(5000, 5000);
    planeMaterial = new THREE.MeshStandardMaterial({
        color: 0x3c3e49,
    });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = "PlaneBase";
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    planeMaterial.roughness = 1;
    planeMaterial.metalness = 0.0;
    scene.add(plane);
    plane.position.set(0, -312, 0);
}

// Here we have the complete scene with garage as the background and similar stuffs
function bestAppearance(){
    
    // the 3D geometry here is for the world outside the garage
    var sphere = new THREE.SphereBufferGeometry(10000, 60, 40);
    var spherematerial = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('./custom/image/Environment/Britannia-Junction-4.jpg'),
        side: THREE.BackSide,
    });
    sphereMesh = new THREE.Mesh(sphere, spherematerial);
    sphereMesh.position.set(0, 0, 0);
    sphereMesh.rotation.y = 1.84;
    sphereMesh.name = 'WorldEnvornment';
    sphereMesh.visible = true;
    scene.add(sphereMesh);

    // for implementing relection from various 3d elements in the scene
    var path = "custom/image/Environment/garage/";
    var format = ".png";
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    reflectionCube = new THREE.CubeTextureLoader().load(urls);
    reflectionCube.format = THREE.RGBFormat;

    // load garage elements
    load_new_Garage(loader, tex_loader);
    
    // This make the brighter elements in the scene like the light sources to glow. It process is one of the part of Post processing
    // IMPORTANT: the element within the function are dependent on variour UnrealBloom.js based libraries. Make sure to call those libraries in the head of the HTML
    if(enableBloom == true){
        renderer.autoClear = false;
        composer = new THREE.EffectComposer(renderer);

        initPostprocessing();
    }   
}

// all the relenvent 3d model for the wheel along with its textures and various mapping are being called here.
function loadWheel(){
    
    // create one single parant for the wheel as object.
    wheel = new THREE.Object3D();
    wheel.rotation.y = Math.PI;
    wheel.position.y = 4.2;
    wheel.visible = false;
    wheel.name = "Wheel";
    scene.add(wheel);

    // Load all the textures and maps here for various components
    var tex_loader =  new THREE.TextureLoader(manager);

    var C_tyremap = tex_loader.load(alternateBaseUrls + 'tire_side-logo.png');
    var C_tire_side_logo_normalMap = tex_loader.load(alternateBaseUrls + 'tire_side-logo_normalMap.jpg');
    var C_tyrelightMap = tex_loader.load(alternateBaseUrls + 'tyreLightMap.jpg');
    var C_tyreAOMap = tex_loader.load(alternateBaseUrls + 'tyre_AO.jpg');

    var C_discAOMap = tex_loader.load(alternateBaseUrls + 'disk_brake_AO.jpg');
    var C_discLightMap = tex_loader.load(alternateBaseUrls + 'disc_lighting_map.jpg');

    var C_calliperAOMap = tex_loader.load(alternateBaseUrls + 'calliper_AO.jpg');
    var C_calliperLightMap = tex_loader.load(alternateBaseUrls + 'calliper_lighting_map.jpg');

    var C_calliper_capAOMap = tex_loader.load(alternateBaseUrls + 'calliper_cap_AO.jpg');
    var C_calliper_capLightMap = tex_loader.load(alternateBaseUrls + 'calliper_cap_lighting_map.jpg');

    var C_calliper_rodAOMap = tex_loader.load(alternateBaseUrls + 'Calliper_rod_AO.jpg');
    var C_calliper_rodLightMap = tex_loader.load(alternateBaseUrls + 'Calliper_rod_lightmap.jpg');

    var C_discBrakePadAOMap = tex_loader.load(alternateBaseUrls + 'Diskbrake pad_AO.jpg');
    var C_discBrakePadLightMap = tex_loader.load(alternateBaseUrls + 'Diskbrake_ pad_lighting_map.jpg');

    var C_tnutsAOMap = tex_loader.load(alternateBaseUrls + 'Tnuts_AO.jpg');
    var C_tnutsLightMap = tex_loader.load(alternateBaseUrls + 'Tnuts_lighting_map.jpg');

    var C_lugnutsAOMap = tex_loader.load(alternateBaseUrls + 'Lugnuts_AO.jpg');
    var C_lugnutsLightMap = tex_loader.load(alternateBaseUrls + 'LugnutsLightMap.jpg');

    var C_rimAOMap = tex_loader.load(alternateBaseUrls + 'rim_AO.jpg');
    var C_rimLightMap = tex_loader.load(alternateBaseUrls + 'Rim_lighting_map.jpg');

    var C_disc_supportPlateAOMap = tex_loader.load(alternateBaseUrls + 'Disk_support_plate_AO.jpg');
    var C_disc_supportPlateLightMap = tex_loader.load(alternateBaseUrls + 'Disk_supportplate_lighting_map.jpg')

    // load the 3d model .js files here.
    loader.load('custom/js/Wheel/Tyre1.js',function(geometry) {

        // create a bufferstock of the 3d data
        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        // create second set of its UV coordinates where AOmaps or lightmaps can be applied
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );

        // custom materials here by setting its parameters.
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
        });
        material.aoMap = C_tyreAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_tyrelightMap;
        material.lightMapIntensity = 1.0;
        material.metalness = 0.0;
        material.roughness = 1;
        material.color = new THREE.Color(0x080808);

        // create 3d mesh out of the geometry and the materials
        Tyre = new THREE.Mesh(geometry, material);
        Tyre.scale.set(25, 25, 25);
        Tyre.rotation.z = 1.71;
        Tyre.name = "Tyre";
        wheel.add(Tyre);
    });

    // similarly repeat the similar process as done for the previous element
    loader.load('custom/js/Wheel/tyrelogo.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
        });

        material.map = C_tyremap;
        material.normalMap = C_tire_side_logo_normalMap;
        material.transparent = true;

        tyrelogo = new THREE.Mesh(geometry, material);
        tyrelogo.rotation.z = 1.71;
        tyrelogo.scale.set(0.99, 0.99, 0.99);
        tyrelogo.name = "tyrelogo";
        wheel.add(tyrelogo);
    });

    loader.load('custom/js/Wheel/hub_colored_lining.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
        });
        // material.envMap = reflectionCube;

        material.metalness = 0.0;
        material.roughness = 1;
        material.transparent = true;
        material.color = new THREE.Color(0xffff00);

        hub_colored_lining = new THREE.Mesh(geometry, material);
        hub_colored_lining.scale.set(10,10,10);
        hub_colored_lining.name = "hub_colored_lining";
        wheel.add(hub_colored_lining);
    });

    loader.load('custom/js/Wheel/disc1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );

        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
        });

        material.envMap = reflectionCube;

        material.aoMap = C_discAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_discLightMap;
        material.lightMapIntensity = 1.0;

        material.metalness = 0.8;
        material.roughness = 0.2;
        material.color = new THREE.Color(0x808080);

        disc = new THREE.Mesh(geometry, material);
        disc.scale.set(25, 25, 25);
        disc.name = "disc";
        wheel.add(disc);
    });

    discbrake = new THREE.Object3D();
    discbrake.name = "discbrake";
    wheel.add(discbrake);

    loader.load('custom/js/Wheel/calliper1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );

        var material = new THREE.MeshStandardMaterial({
            shading: THREE.SmoothShading,
        });
        // material.envMap = reflectionCube;

        material.aoMap = C_calliperAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_calliperLightMap;
        material.lightMapIntensity = 1.0;

        material.metalness = 0.8;
        material.roughness = 0.2;

        material.color = new THREE.Color(0xff0000);
        activeBrakeColor = '0xff0000';

        calliper = new THREE.Mesh(geometry, material);
        calliper.scale.set(25, 25, 25);
        calliper.name = "calliper";
        discbrake.add(calliper);
    });

    loader.load('custom/js/Wheel/calliper_cap1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.SmoothShading,
        });
        // material.envMap = reflectionCube;
        
        material.aoMap = C_calliper_capAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_calliper_capLightMap;
        material.lightMapIntensity = 1;
        
        material.metalness = 0.8;
        material.roughness = 0.2;
        material.color = new THREE.Color(0x404040);

        calliper_cap = new THREE.Mesh(geometry, material);
        calliper_cap.scale.set(25, 25, 25);
        calliper_cap.name = "calliper_cap";
        discbrake.add(calliper_cap);
    });

    loader.load('custom/js/Wheel/calliper_rod1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.SmoothShading,
        });
        // material.envMap = reflectionCube;
        
        material.aoMap = C_calliper_rodAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_calliper_rodLightMap;
        material.lightMapIntensity = 1;

        material.metalness = 0.8;
        material.roughness = 0.2;
        material.color = new THREE.Color(0x808080);

        calliper_rod = new THREE.Mesh(geometry, material);
        calliper_rod.scale.set(25,25,25);
        calliper_rod.name = "calliper_rod";
        discbrake.add(calliper_rod);
    });

    discbrake_pad = new THREE.Object3D();
    discbrake_pad.name = "discbrake_pad";
    wheel.add(discbrake_pad);

    loader.load('custom/js/Wheel/discbrake_padholder.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
        });
        
        material.aoMap = C_discBrakePadAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_discBrakePadLightMap;
        material.lightMapIntensity = 1;
        
        material.metalness = 0.8;
        material.roughness = 0.2;
        material.color = new THREE.Color(0x404040);

        discbrake_padholder = new THREE.Mesh(geometry, material);
        discbrake_padholder.scale.set(25, 25, 25);
        discbrake_padholder.name = "discbrake_padholder";
        discbrake_pad.add(discbrake_padholder);
    });

    loader.load('custom/js/Wheel/tnuts1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading,
        });
        // material.envMap = reflectionCube;
        
        material.aoMap = C_tnutsAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_tnutsLightMap;
        material.lightMapIntensity = 1;
        
        material.metalness = 0.7;
        material.roughness = 0.3;
        material.shininess = 0.5;
        material.color = new THREE.Color(0x7c7c7c);

        tnuts = new THREE.Mesh(geometry, material);
        tnuts.scale.set(25, 25, 25);
        tnuts.name = "tnuts";
        wheel.add(tnuts);
    });

    loader.load('custom/js/Wheel/lugnuts1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading
        });
        // material.envMap = reflectionCube;
        
        material.aoMap = C_lugnutsAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_lugnutsLightMap;
        material.lightMapIntensity = 1;
        
        material.metalness = 0.7;
        material.roughness = 0.3;
        material.color = new THREE.Color(0x7c7c7c);

        lugnuts = new THREE.Mesh(geometry, material);
        lugnuts.scale.set(25, 25, 25);
        lugnuts.name = "lugnuts";
        wheel.add(lugnuts);
    });

    //this the Rim Model 1
    loader.load('custom/js/Wheel/hub1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.SmoothShading,
        });
        // material.envMap = reflectionCube;

        material.lightMap = C_rimAOMap;
        material.lightMapIntensity = 1;
        material.aoMap = C_rimLightMap;
        material.lightMapIntensity = 1;

        material.metalness = 0.8;
        material.roughness = 0.2;
        
        material.color = new THREE.Color(0x282828);
        activeRimColor = '0x282828';

        hub = new THREE.Mesh(geometry, material);
        hub.name = "hub";
        wheel.add(hub);
    });
    // this the Rim Model 2
    loader.load('custom/js/Wheel/hub3.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        var material = new THREE.MeshStandardMaterial({
            shading: THREE.SmoothShading,
        });
        // material.envMap = reflectionCube;

        material.metalness = 0.8;
        material.roughness = 0.6;
        material.color = new THREE.Color(0x282828);
        activeRimColor = '0x282828';

        hub3 = new THREE.Mesh(geometry, material);
        hub3.position.z = 140;
        hub3.rotation.z = Math.PI / 2;
        hub3.rotation.y = Math.PI / 2;
        hub3.scale.set(27.76, 29.04, 27.76);
        hub3.visible = false;
        hub3.name = "hub3";
        wheel.add(hub3);
    });

    loader.load('custom/js/Wheel/disc_supportplate1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );
        var material = new THREE.MeshStandardMaterial({
            shading: THREE.FlatShading
        });
        // material.envMap = reflectionCube;
        
        material.aoMap = C_disc_supportPlateAOMap;
        material.aoMapIntensity = 1;
        material.lightMap = C_disc_supportPlateLightMap;
        material.lightMapIntensity = 1;
        
        material.metalness = 0.7;
        material.roughness = 0.3;
        material.color = new THREE.Color(0x7c7c7c);

        disc_supportplate = new THREE.Mesh(geometry, material);
        disc_supportplate.scale.set(25, 25, 25);
        disc_supportplate.name = "disc_supportplate";
        wheel.add(disc_supportplate);
    });
}

// load the garage, add the textures and maps, define the materials and create the mesh out of these datas.
function load_new_Garage () {

    var wheel_stack_map = tex_loader.load(alternateBaseUrls + 'Wheel_Diffuse-min.jpg');
    var wheel_stack_Normalmap = tex_loader.load(alternateBaseUrls + 'Wheel_NormalMap-min.jpg');
    var wheel_stack_AOmap = tex_loader.load(alternateBaseUrls + 'Wheel_AO-min.jpg');

    wheel.position.y = 4.2;

    Garage = new THREE.Object3D();
    Garage.name = "Garage";
    Garage.rotation.y = Math.PI;
    Garage.scale.set(5, 5, 5);
    Garage.visible = false;

    Garage.position.set(-2300, -75, 2300);
    scene.add(Garage);
    scene.fog = null;

    loader.load('custom/js/Garage/brick_wall.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        brick_wall = new THREE.Mesh(geometry, materials);
        brick_wall.name = "brick_wall";
        Garage.add(brick_wall);
    });
    loader.load('custom/js/Garage/garageTools1.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        tools = new THREE.Mesh(geometry, materials);
        tools.name = "tools";
        Garage.add(tools);
    });

    // this snippet here is a replacement of the heavier 3d model. Uncommenting this wil bring up drill machine visible on one of the shelf in the garage scene

    // loader.load('custom/js/Garage/tool_drill.js', function(geometry, materials) {
    //     geometry = new THREE.BufferGeometry().fromGeometry( geometry );
    //     var materials = new THREE.MeshStandardMaterial({
    //         color: 0x004600,
    //         roughness: 1,
    //     });
    //     drill = new THREE.Mesh(geometry, materials);
    //     drill.name = "drill";
    //     Garage.add(drill);
    // });


    // the idea here is to import only one instance of the 3d model, create several clones of the same model, reposition each model into diffent positions and orientations and add all the into the scene 
    loader.load('custom/js/Garage/Wheel_Stack1.js',function(geometry) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        
        var uvs = geometry.attributes.uv.array;
        geometry.addAttribute( 'uv2', new THREE.BufferAttribute( uvs, 2 ) );

        var materials = new THREE.MeshStandardMaterial({
            map: wheel_stack_map,
            normalMap: wheel_stack_Normalmap,
            aoMap: wheel_stack_AOmap,
        });
        materials.normalScale.set(5, 5);
        materials.metalness = 0.2;
        materials.roughtness = 0.5;

        tyrestacks = new THREE.Mesh(geometry, materials);
        tyrestacks.name = "tyrestacks";
        Garage.add(tyrestacks);

        tyrestacks1 = tyrestacks.clone();
        tyrestacks1.name = "tyrestacks1";
        tyrestacks1.position.z = -80;
        Garage.add(tyrestacks1);

        tyrestacks2 = tyrestacks.clone();
        tyrestacks2.name = "tyrestacks2";
        tyrestacks2.position.set(-40, -118, -20);
        tyrestacks2.rotation.x = -Math.PI/2;
        Garage.add(tyrestacks2);

        tyrestacks3 = tyrestacks.clone();
        tyrestacks3.name = "tyrestacks3";
        tyrestacks3.position.z = -250;
        Garage.add(tyrestacks3);

        tyrestacks4 = tyrestacks.clone();
        tyrestacks4.name = "tyrestacks4";
        tyrestacks4.position.z = -250;
        Garage.add(tyrestacks2);

        tyrestacks5 = tyrestacks.clone();
        tyrestacks5.name = "tyrestacks5";
        tyrestacks5.rotation.set(-1.57, -0.62, 0);
        tyrestacks5.position.set(-40, -167, -20);
        Garage.add(tyrestacks5);
    });

    loader.load('custom/js/Garage/black_steel.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        black_steel = new THREE.Mesh(geometry, materials);
        black_steel.name = "black_steel";
        Garage.add(black_steel);
    });
    loader.load('custom/js/Garage/door.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        door = new THREE.Mesh(geometry, materials);
        door.name = "door";
        Garage.add(door);
    });
    loader.load('custom/js/Garage/borders.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        borders = new THREE.Mesh(geometry, materials);
        borders.name = "borders";
        Garage.add(borders);
    });
    loader.load('custom/js/Garage/floor_ceiling.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        floor_ceiling = new THREE.Mesh(geometry, materials);
        floor_ceiling.receiveShadow = true;
        floor_ceiling.name = "floor_ceiling";
        Garage.add(floor_ceiling);
    });
    loader.load('custom/js/Garage/grills.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        materials[0].side = THREE.DoubleSide;
        grills = new THREE.Mesh(geometry, materials);
        grills.name = "grills";
        Garage.add(grills);
    });
    loader.load('custom/js/Garage/wood.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        wood = new THREE.Mesh(geometry, materials);
        wood.name = "wood";
        Garage.add(wood);
    });
    loader.load('custom/js/Garage/ceiling_lights_back_panel.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        ceiling_lights_back_panel = new THREE.Mesh(geometry, materials);
        ceiling_lights_back_panel.name = "ceiling_lights_back_panel";
        ceiling_lights_back_panel.scale.set(1.005,1,1);
        Garage.add(ceiling_lights_back_panel);
    });
    loader.load('custom/js/Garage/ceiling_lights.js', function(geometry, materials) {

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        ceiling_lights = new THREE.Mesh(geometry, materials);
        ceiling_lights.name = "ceiling_lights";
        Garage.add(ceiling_lights);
    });
}


function getTextureUrls(){

    // we have created 4 different quality levels for the textures of various 3d models in the scene
    // 1. Uncompressed 4K resolution
    // 2. Compressed 4K resolution
    // 3. Compressed 2K resolution
    // 4. Ccompressed 1K resolution

    // based on the analysis on what suits best in terms of performance and appearence, it better to make the default resolutions to Compressed 2k resolution.
    // If the quality setting button is set active in the HTML page, switching different quality level would change it for different resolutions

    if(isMobileDevice == true){

        if(tex_resolution == '2K'){

            loader.setTexturePath("./custom/image/Compressed2K/");
            alternateBaseUrls = "./custom/image/Compressed2K/";

        } else if(tex_resolution == '1K'){

            loader.setTexturePath("./custom/image/Compressed1K/");
            alternateBaseUrls = "./custom/image/Compressed1K/";

        }

    } else if(tex_resolution == 'ultra4K'){

        this.loader.setTexturePath("./custom/image/Uncompressed4K/");
        alternateBaseUrls = "./custom/image/Uncompressed4K/";

    }  else if(tex_resolution == '4K'){

        loader.setTexturePath("./custom/image/Compressed4K/");
        alternateBaseUrls = "./custom/image/Compressed4K/";

    } else if(tex_resolution == '2K'){

        loader.setTexturePath("./custom/image/Compressed2K/");
        alternateBaseUrls = "./custom/image/Compressed2K/";

    } else if(tex_resolution == '1K'){

        loader.setTexturePath("./custom/image/Compressed1K/");
        alternateBaseUrls = "./custom/image/Compressed1K/";

    }
}

// executes only if the enableBloom is turned on
function initPostprocessing() {
    renderScene = new THREE.RenderPass(scene, camera);
    // renderScene.clear = true;
    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );
    var copyShader = new THREE.ShaderPass(THREE.CopyShader);
    copyShader.renderToScreen = true;
    bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.1, 0.85);   //( resolution, strenght, radius, threshold));
    composer = new THREE.EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(renderScene);
    composer.addPass(effectFXAA);
    composer.addPass(bloomPass);
    composer.addPass(copyShader);
}

// for click sound effect on hovering over markers
function PlayMouseOverSound() {
    var thissound=document.getElementById('mouseSoundFx');
    thissound.play();
    thissound.volume = 0.02;
}

// Light are important component of the scene here. Must be applied. Note: enabling light shadows is not required here, we have already used may AOmaps and lightMaps 
function AddLights(){
    // light without any specific source
    ambientLight = new THREE.AmbientLight( 0xffffff, 1)
    ambientLight.name = "ambientLight";
    scene.add(ambientLight);

    // natural light to mimic light coming out from the window
    dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.rotation.z = THREE.Math.degToRad(45);
    dirLight.position.set(0, 5000, -5000);
    dirLight.name = "Directional Light";
    scene.add(dirLight);
}

// To dismantle each component. It used tween library to translate/animate the motion of the component from one point to another
function explode() {

    spriteHub.visible = false;
    spriteTyre.visible = false;
    spriteDisc.visible = false;

    var tween = new TWEEN.Tween(Tyre.position)
        .to({
            x: 0,
            y: 0,
            z: -800
        }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(tyrelogo.position)
        .to({
            x: 0,
            y: 0,
            z: -800
        }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(lugnuts.position)
        .to({
            x: 0,
            y: 0,
            z: 1000
        }, 2000)
        .delay(1000)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(function() {
        })
        .start();
    var tween = new TWEEN.Tween(hub.position)
        .to({
            x: 0,
            y: 0,
            z: 800
        }, 2000)
        .delay(2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(hub_colored_lining.position)
        .to({
            x: 0,
            y: 0,
            z: 800
        }, 2000)
        .delay(2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(hub3.position)
        .to({
            x: 0,
            y: 0,
            z: 800
        }, 2000)
        .delay(2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(tnuts.position)
        .to({
            x: 0,
            y: 0,
            z: 500
        }, 2000)
        .delay(3000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(disc_supportplate.position)
        .to({
            x: 0,
            y: 0,
            z: 300
        }, 2000)
        .delay(4000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(discbrake.position)
        .to({
            x: 400,
            y: 120,
            z: 0
        }, 2000)
        .delay(5000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(discbrake_pad.position)
        .to({
            x: 150,
            y: 30,
            z: 0
        }, 2000)
        .delay(6000)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(function() {
            $('#ExplodeButton').removeAttr('disabled');
            $('#ExplodeButton').css("pointer-events", "auto");
        })
        .start();
    var tween = new TWEEN.Tween(camera.position)
        .to({
            x: -1330,
            y: 700,
            z: -1200
        }, 1000)
        .easing(TWEEN.Easing.Quadratic.In)
        .start();
}

// To assemble each component. It used tween library to translate/animate the motion of the component from one point to another
function unexplode() {
    
    var tween = new TWEEN.Tween(Tyre.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .delay(6000)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(function() {

            spriteHub.visible = true;
            spriteTyre.visible = true;
            spriteDisc.visible = true;
            $('#ExplodeButton').removeAttr('disabled');
            $('#ExplodeButton').css("pointer-events", "auto");
        })
        .start();
    var tween = new TWEEN.Tween(tyrelogo.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .delay(6000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(lugnuts.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .delay(5000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
        var tween = new TWEEN.Tween(hub.position)
            .to({
                x: 0,
                y: 0,
                z: 0
            }, 2000)
            .delay(4000)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        var tween = new TWEEN.Tween(hub_colored_lining.position)
            .to({
                x: 0,
                y: 0,
                z: 0
            }, 2000)
            .delay(4000)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        var tween = new TWEEN.Tween(hub3.position)
            .to({
                x: 0,
                y: 0,
                z: 140
            }, 2000)
            .delay(4000)
            .easing(TWEEN.Easing.Linear.None)
            .start();
    var tween = new TWEEN.Tween(tnuts.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .delay(3000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(disc_supportplate.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .delay(2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(discbrake.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .delay(1000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(discbrake_pad.position)
        .to({
            x: 0,
            y: 0,
            z: 0
        }, 2000)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    var tween = new TWEEN.Tween(camera.position)
        .to({
            x: -800,
            y: 700,
            z: -700
        }, 1000)
        .easing(TWEEN.Easing.Quadratic.In)
        .start();
}

// adjust the scene element accoring the screen dimension
function onWindowResize() {
    fitContainer();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// update controls, stats and activity monitoring custom created functions
function update(dt) {

    camera.updateProjectionMatrix();
    campos = {x : Math.round(camera.position.x), y: Math.round(camera.position.y), z: Math.round(camera.position.z)};

    // test if the camera is still/static when Tyre Marker is active. If not the the click and drag from the mouse should move back to the default original place and exit from the Tyre Marker Menu
    if ( CamMovementTest == true ){
        if( getCamPos.x != campos.x && getCamPos.y != campos.y && getCamPos.z != campos.z  ){
            if(isMobileDevice == true){
                var a = 338;
                spriteTyre.position.set(-a * Math.cos(THREE.Math.degToRad(90)), a * Math.sin(THREE.Math.degToRad(90)), 1); 
            }
            else {
                var a = 330 ;
                spriteTyre.position.set(-a * Math.cos(THREE.Math.degToRad(90)), a * Math.sin(THREE.Math.degToRad(90)), 1); 
            };
            $("#MarkerRimClone, #MarkerDiscClone, #MarkerTyreClone").removeClass("mouseMarkerHoverOut");
            $("#MarkerRimClone, #MarkerDiscClone, #MarkerTyreClone").removeClass("mouseMarkerHoverIn");
            $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass('mouseMarkerHoverIn');
            $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass("mouseMarkerHoverOut");
            $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass("onMarkerClick");
            $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass("marker");
            $("#MarkerRim, #MarkerDisc, #MarkerTyre").addClass("marker");

            var tween = new TWEEN.Tween(camera.position )
            .to({ x:-800, y:700, z:-700 }, 500)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(function(){
                // annotation = false;
                CamMovementTest = false;
                // spriteTyre.visible = true;
                // spriteHub.visible = true;
                // spriteDisc.visible = true;   
                // dashedCircle.visible = false;
                // controls.autoRotate = true;
                // enabledMarkerClick = true; enabledMarkerHover = false;
            
                $("#AutoRotateButton").css('display', 'block');

                vector = new THREE.Vector3(0, 0, 1); 
                INTERSECTED = null;

                dashedCircle.visible = false;
                controls.enabled = true;    
                spriteTyre.visible = true;
                spriteHub.visible = true;
                spriteDisc.visible = true;   
                annotation = false; 
                controls.autoRotate = true;
                enableMarkerOnHoverEffect = false;

                 enabledMarkerClick = true; enabledMarkerHover = true;
            })
            .start();
            
        } 
    };

    controls.update(dt);
    stats.update();
}

// animate the various changes that happens on the screen 3d scene.
function animate(t) {
    requestAnimationFrame(animate);
    TWEEN.update();
    if(enableBloom == true){
        renderer.clear();
        composer.render(clock.getDelta());
    } else {
        update(clock.getDelta());
        render(clock.getDelta());
    }
}


// start the render loop
function render(dt) {
    
    renderer.render(scene, camera);
    if (annotation == true) {
        renderer2.render(scene2, camera);
    }
    if (highlightMarker_flag == true) {
        highlightMarker(spriteMarker);
    }
}

function runMyCustomCameraControls() {
    //quick and dirty way to spin the camera around the world center
    // camera.position.set(0, camera.position.y, 0); //move to world center
    camera.rotation.y += 0.01; //rotate camera around world center
    // camera.translateZ(100); //move backwards


    angle += speed;
    targetPositionY = centerY + (Math.sin(angle) * waveHeight);
    //simple tween to prevent camera from suddenly jumping once you transfer control back to sinewave animation.
    camera.position.y += (targetPositionY - camera.position.y) / 10;
}

// starts a periodic scale up / down effect when the mouse hovers over it.
function highlightMarker(spriteMarker) {
    var currentTime = Math.floor(clock.getElapsedTime());
    if (currentTime % 2 == 0 && currentTime != previousTime) {
        var tween = new TWEEN.Tween(spriteMarker.scale)
            .to({
                x: reducedScaleMarker,
                y: reducedScaleMarker,
                z: reducedScaleMarker
            }, 500)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        previousTime = currentTime;

    } else if (currentTime != previousTime) {
        var tween = new TWEEN.Tween(spriteMarker.scale)
            .to({
                x: increasedScaleMarker,
                y: increasedScaleMarker,
                z: increasedScaleMarker
            }, 500)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        previousTime = currentTime;
    }
}

// execute fullscreen when get a command. This, however, does not work for the iOS. So have been hidden for that device.
function fullscreen() {
    var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.documentElement;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// get the container's dimension and make a best fit of the scene in the container
function fitContainer() {

    container_width = window.innerWidth + "px";
    container_height = window.innerHeight + "px";

    // Make it visually fill the positioned parent
    container.style.width = container_width;
    container.style.height = container_height;
    // ...then set the internal size to match
    container.width = container.offsetWidth;
    container.height = container.offsetHeight;
}

// take action when mouse is moving in the scene
function onDocumentMouseMove(event) {
    event.preventDefault();

    // keep checking mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    vector.unproject(camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    
    // test if mouse intersects with any oject which is an component of the wheel
    var intersects = ray.intersectObjects(wheel.children);
    if (intersects.length > 0) {
        if (intersects[0].object != INTERSECTED) {
            if (INTERSECTED)
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;

            if (INTERSECTED.name == "Tyre" || INTERSECTED.name == "spriteTyre") {
                spriteTyre.scale.set(reducedScaleMarker, reducedScaleMarker, reducedScaleMarker);
                if(INTERSECTED.name == "spriteTyre"){
                   $('#configurator_container').css('cursor', 'pointer');
                   PlayMouseOverSound();
                } else{
                   $('#configurator_container').css('cursor', 'default');
                }
            } else {
                spriteTyre.scale.set(increasedScaleMarker, increasedScaleMarker, increasedScaleMarker);
            };
            if (INTERSECTED.name == "hub" || INTERSECTED.name == "spriteHub") {
                spriteHub.scale.set(45, 45, 45);
                if(INTERSECTED.name == "spriteHub"){
                   $('#configurator_container').css('cursor', 'pointer');
                   PlayMouseOverSound();           
                } else{
                    $('#configurator_container').css('cursor', 'default');
                }
            } else {
                spriteHub.scale.set(increasedScaleMarker, increasedScaleMarker, increasedScaleMarker);
            };

            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

        }
    } else {
        if (INTERSECTED)
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
        spriteTyre.scale.set(reducedScaleMarker, reducedScaleMarker, reducedScaleMarker);
        spriteHub.scale.set(reducedScaleMarker, reducedScaleMarker, reducedScaleMarker);
        spriteDisc.scale.set(reducedScaleMarker, reducedScaleMarker, reducedScaleMarker);

        INTERSECTED = null;
    }
}

// add different CSS scene elements in the main scene
function PopupMenu3(element) {

        scene2 = new THREE.Scene();
        if ( element == document.getElementById('MarkerTyre') ){
            //CSS Object
            div1 = new THREE.CSS3DObject(element);
            div1.position.x = 0;
            div1.position.y = 0;
            div1.position.z = -185;
            div1.rotation.y = Math.PI;

            scene2.add(div1);
        } else if ( element == document.getElementById('MarkerRim') ){
            //CSS Object
            div2 = new THREE.CSS3DObject(element);
            div2.position.x = 0;
            div2.position.y = 0;
            div2.position.z = -185;
            div2.rotation.y = Math.PI;

            scene2.add(div2);
        }else if ( element == document.getElementById('MarkerDisc') ){
            //CSS Object
            div3 = new THREE.CSS3DObject(element);
            div3.position.x = 0;
            div3.position.y = 0;
            div3.position.z = -185;
            div3.rotation.y = Math.PI;

            scene2.add(div3);
        };;
}

// take action when clicked on a marker
function onMarkerClick() {
    // event.preventDefault();
    if ( enabledMarkerClick == true ) {

        if (INTERSECTED != null) {
            if (INTERSECTED.parent.name == "Wheel" && INTERSECTED.name == "spriteTyre") {
                openTyreCustomizer();
            } else if (INTERSECTED.parent.name == "Wheel" && INTERSECTED.name == "spriteHub") {
                openRimCustomizer();
            } 
        };
    };
}

// This opens the discription div for Tyre,  reorient and animate the camera position to perfect location
function openTyreCustomizer(){
    annotation = true;
    element = document.getElementById('MarkerTyre');
    PopupMenu3(element);
    dashedCircle.visible = true;
    controls.autoRotate = false;
    var tween = new TWEEN.Tween(camera.position)
        .to({
            x: 468,
            y: 344,
            z: -250
        }, 500)
        .easing(TWEEN.Easing.Linear.None)
        .start()
        .onComplete(function() {
            if(isMobileDevice == true){
                $("#MarkerTyreClone").removeClass('mouseMarkerHoverOut');
                $("#MarkerTyreClone").addClass('mouseMarkerHoverIn');
            } else {
                $("#MarkerTyre").removeClass('mouseMarkerHoverIn');
                $("#MarkerTyre").removeClass("mouseMarkerHoverOut");
                $("#MarkerTyre").addClass("onMarkerClick"); 
            }

            div1.position.set(0, 0, 0);
            div1.scale.set(0.8, 0.8, 0.8);
            div1.lookAt(camera.position);
            div1.position.set(50,250,275);

            getCamPos = {
                x: 468,
                y: 344,
                z: -250
            };
            
            $("#AutoRotateButton").css('display', 'none'); 

            enabledMarkerClick = false; enabledMarkerHover = false;
            CamMovementTest = true;

        });
        
    // var x = cx + r * Math.cos( i * gap );
    // var y = cy + r * Math.sin( i * gap );
    $('.intro-overlay, #intro-intructions').fadeOut(200);
    spriteMarker = spriteTyre;
    highlightMarker_flag = true;
    if (isMobileDevice == true){
        var a = 338;
        spriteTyre.position.set(-a * Math.cos(THREE.Math.degToRad(60)), a * Math.sin(THREE.Math.degToRad(60)), 1); 
    } else {
        var a = 330;
        spriteTyre.position.set(-a * Math.cos(THREE.Math.degToRad(60)), a * Math.sin(THREE.Math.degToRad(60)), 1); 
    }
    spriteHub.visible = false;
    spriteDisc.visible = false;    
}

// This opens the sidebar for Rim customizer, reorient and animate the camera position to perfect location
function openRimCustomizer () {
    annotation = false;
    element = document.getElementById('MarkerRim');
    PopupMenu3(element);  
    controls.autoRotate = false;
    var tween = new TWEEN.Tween(camera.position)
        .to({
            x: 0,
            y: 0,
            z: -900
        }, 500)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(function() {

            div2.position.set(0, 0, 0);
            div2.scale.set(1, 1, 1);
            div2.lookAt(camera.position);
            div2.position.set(0,-350,-150);
            spriteMarker.visible = false;
            enableMarkerOnHoverEffect = false;

            enabledMarkerClick = false; enabledMarkerHover = false;

        })
        .start();

    spriteMarker = spriteHub;
    highlightMarker_flag = true;
    controls.enabled = false;
    spriteTyre.visible = false;
    spriteDisc.visible = false;
    hub.material.transparent = false;
    hub.material.opacity = 1.0;
    hub3.material.transparent = false;
    hub3.material.opacity = 1.0;
    $('.intro-overlay, #intro-intructions').fadeOut(200);
    $('.configurator').show("slide", { direction: "left" }, 500);
    $('#BrakeConfiguratorMenu').css('display', 'none');
    $('#RimConfiguratorMenu').css('display', 'block'); 
}

// get the color from the div and change the color of components if needed
function changeColor(ele, col){
    var element = ele;
    var color = col;
    if( element == "brake"){
        calliper.material.color = new THREE.Color(color); 
        activeBrakeColor = color;
    } else if( element == "rim" ){
        hub.material.color = new THREE.Color(color);
        hub3.material.color = new THREE.Color(color);
        activeRimColor = color;
    } else if (element == "tyre"){
        Tyre.material.color = new THREE.Color(color);
    }
}

init();
animate(); 