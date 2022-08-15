//Brake Calliper Color
$("#brakeColor").colorpicker({
    color: '#b00b1e',
    colorSpace: 'rgb',
    displayColor: 'hex',
  })
  .on('newcolor', function (ev, colorpicker) {
    var color = colorpicker.toString('rgb');
   
    var hashprefix ="0x";
    color = hashprefix.concat( color.slice(1));
    color = color.toString()
    calliper.material.color.setHex(color)
    activeBrakeColor = color;
  });

$("#hubColor").colorpicker({
    color: '#b00b1e',
    colorSpace: 'rgb',
    displayColor: 'hex',
  }).on('newcolor', function (ev, colorpicker) {
    var color = colorpicker.toString('rgb');
    
    var hashprefix ="0x";
    color = hashprefix.concat(color.slice(1));
    color = color.toString();
    hub.material.color.setHex(color);
    hub3.material.color.setHex(color);
    activeRimColor = color;
});

// Alloy Rim reflection
$("#cmn-toggle-1").on('click', function () {
  if( $(this).is(":checked") ){
    hub.material.metalness = 0.8;
    hub3.material.metalness  = 0.8;
    hub.material.roughness = 0.2;
    hub3.material.roughness  = 0.2;
  } else{
    hub.material.metalness = 0.2;
    hub3.material.metalness  = 0.2;
    hub.material.roughness = 0.8;
    hub3.material.roughness  = 0.8;

  }
});


$('#exploder').on('change', function () {
	if( $('#exploder').is(':Checked') ){
		explode();
	} else {
		unexplode();
	}
});

$('#Autorotate').on('change', function () {
	if( $('#Autorotate').is(':Checked') ){
		controls.autoRotate = true;
	} else {
		controls.autoRotate = false;
	}
});

$('#RimChoice').on('change', function(){
	var value = this.value;
	if(value == '1'){
		hub.material.color = new THREE.Color( $("#hubColor").val());
		hub.visible = true;
		hub3.visible = false;
		hub_colored_lining.visible = true;
		lugnuts.position.set(0,0,0);
		lugnuts.rotation.z = 0;
		lugnuts.scale.set(25, 25, 25);
	} else {
		hub3.material.color = new THREE.Color( $("#hubColor").val());
		hub.visible = false;
		hub3.visible = true;
		hub_colored_lining.visible = false;
		lugnuts.position.set(0,0,19.86);
		lugnuts.rotation.z = 0.34;
		lugnuts.scale.set(21.5, 21.5, 30.25);
	}
});

$('#closeConfigurator i.fa.fa-times').on('click', function () {
  $('.configurator').css('display', 'none');
  $('#BrakeConfiguratorMenu').css('display', 'none');
  $("#MarkerTyreClone, #MarkerDiscClone, #MarkerRimClone").removeClass('mouseMarkerHoverIn');
  $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass('mouseMarkerHoverIn');
  $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass("mouseMarkerHoverOut");
  $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass("onMarkerClick");
  $("#MarkerRim, #MarkerDisc, #MarkerTyre").removeClass("marker");
  $("#MarkerRim, #MarkerDisc, #MarkerTyre").addClass("marker");

    var tween = new TWEEN.Tween(camera.position )
    .to({ x:-800, y:700, z:-700 }, 500)
    .easing(TWEEN.Easing.Linear.None)
    .start()
    .onComplete(function(){
      dashedCircle.visible = false;
      controls.enabled = true;    
      spriteTyre.visible = true;
      spriteHub.visible = true;
      spriteDisc.visible = true;    

      hub.material.transparent = false;
      hub.material.opacity = 1.0;   
      setTimeout(function(){ 
          hub.material.color.setHex(activeRimColor) ;
          hub3.material.color.setHex(activeRimColor) ;
          calliper.material.color.setHex(activeBrakeColor) ;
      }, 0);
      hub3.material.transparent = false;
      hub3.material.opacity = 1.0; 

      hub_colored_lining.transparent = false;
      hub_colored_lining.material.opacity = 1.0; 
      spriteDisc.position.set(0,150,40);
      if(isMobileDevice == true){
        spriteTyre.position.set(0,338,0);
      } else {
        spriteTyre.position.set(0,330,0);
      }
      annotation = false; 
      controls.autoRotate = true;
      enableMarkerOnHoverEffect = false;

      enabledMarkerClick = true; enabledMarkerHover = true;

    });
  
});

$('#Thumbnail-RimType1').on('click', function () {

  hub3.visible = false;
  hub.visible = true;
  hub_colored_lining.visible = true;
  lugnuts.position.set(0,0,0);
  lugnuts.rotation.z = 0;
  lugnuts.scale.set(25, 25, 25);
  spriteHub.position.set(0,0,80);
  // largeCircleIndicator.position.set(180/2,0,0);
});

$('#Thumbnail-RimType2').on('click', function () {

  hub.visible = false;
  hub3.visible = true;
  hub_colored_lining.visible = false;
  lugnuts.position.set(0,0,19.86);
  lugnuts.rotation.z = 0.34;
  lugnuts.scale.set(21.5, 21.5, 30.25);
  spriteHub.position.set(0,0,120);
  // largeCircleIndicator.position.set(-180/2,0,0);
});

$('#soundButton').on('click touchend', function (e) {
  e.preventDefault();
  if ( $(this)[0].children[0].classList[1] == "fa-volume-up" ){
    $('#sound').removeClass("fa-volume-up");
    $('#sound').addClass("fa-volume-off");
    // if(isMobileDevice == false){
    //   // $('#soundButton').attr('data-original-title', 'Sound Off')
    //   //    .tooltip('fixTitle')
    //   //    .tooltip('show');
    // }
    audio.pause();
  } else if ( $(this)[0].children[0].classList[1] == "fa-volume-off" ){
    $('#sound').removeClass("fa-volume-off");
    $('#sound').addClass("fa-volume-up");
    // if(isMobileDevice == false){
    //   // $('#soundButton').attr('data-original-title', 'Sound On')
    //   // .tooltip('fixTitle')
    //   // .tooltip('show');
    // }
    audio.play();
  }
});

$('#fullscreenButton').on('click touchend', function (e) {
  e.preventDefault();
  if ( $(this)[0].children[0].classList[1] == "fa-expand" ){
    $('#fullscreen').removeClass("fa-expand");
    $('#fullscreen').addClass("fa-compress");
    // if(isMobileDevice == false){
    //   $('#fullscreenButton').attr('data-original-title', 'Fullscreen On')
    //       .tooltip('fixTitle')
    //       .tooltip('show');
    // }
    fullscreen();
  } else if ( $(this)[0].children[0].classList[1] == "fa-compress" ){
    $('#fullscreen').removeClass("fa-compress");
    $('#fullscreen').addClass("fa-expand");
    // if(isMobileDevice == false){
    //   $('#fullscreenButton').attr('data-original-title', 'Fullscreen Off')
    //       .tooltip('fixTitle')
    //       .tooltip('show');
    // }
    fullscreen();
  }
});

$('#Quality_Ultra').on('click touchend', function (e) {
  e.preventDefault();
  $('#Quality_High, #Quality_Medium, #Quality_Low').removeClass('active');
  $('#Quality_Ultra').addClass('active');
  if ( tex_resolution != "ultra4K" ){
    tex_resolution = "ultra4K";
    getTextureUrls();
    loadTextureMaps();
  } 
});
$('#Quality_High').on('click touchend', function (e) {
  e.preventDefault();
  $('#Quality_Ultra, #Quality_Medium, #Quality_Low').removeClass('active');
  $('#Quality_High').addClass('active');
  if ( tex_resolution != "4K" ){
    tex_resolution = "4K";
    getTextureUrls();
    loadTextureMaps();
  } 
});
$('#Quality_Medium').on('click touchend', function (e) {
  e.preventDefault();
  $('#Quality_Ultra, #Quality_High, #Quality_Low').removeClass('active');
  $('#Quality_Medium').addClass('active');
  if ( tex_resolution != "2K" ){
    tex_resolution = "2K";
    getTextureUrls();
    loadTextureMaps();
  } 
});
$('#Quality_Low').on('click touchend', function (e) {
  e.preventDefault();
  $('#Quality_Ultra, #Quality_High, #Quality_Medium').removeClass('active');
  $('#Quality_Low').addClass('active');
  if ( tex_resolution != "1K" ){
    tex_resolution = "1K";
    getTextureUrls();
    loadTextureMaps();
  } 
});

$('#HDButton').on('click touchend', function (e) {
  e.preventDefault();
  if ( $('#popover-content').css('display') == "none" ){
    $('#popover-content').css('display', 'block');
  } else {
    $('#popover-content').css('display', 'none');
  }
});

$('#AutoRotateButton').on('click touchend', function (e) {
  e.preventDefault();
  if ( controls.autoRotate == true ){
      controls.autoRotate = false;
      // if(isMobileDevice == false){
      //   $('#AutoRotateButton').attr('data-original-title', 'Auto-rotate Off')
      //     .tooltip('fixTitle')
      //     .tooltip('show');
      // }
    
  } else {
    controls.autoRotate = true;
    // if(isMobileDevice == false){
    //   $('#AutoRotateButton').attr('data-original-title', 'Auto-rotate On')
    //       .tooltip('fixTitle')
    //       .tooltip('show');
    // }
    
  }
});

$('#ExplodeButton').on('click touchend', function (e) {
  e.preventDefault();
  $(this).css("pointer-events", 'none');
  if ( $('#ExplodeButton')[0].getAttribute('explode') == "true" ){
    $('#ExplodeButton').attr('disabled', 'disabled');
    explode();
    $('#ExplodeButton')[0].setAttribute('explode', 'false');
    // if(isMobileDevice == false){
    //   $('#ExplodeButton').attr('data-original-title', 'Dismantled')
    //       .tooltip('fixTitle')
    //       .tooltip('show');
    // }
  } else if ( $('#ExplodeButton')[0].getAttribute('explode') == "false" ){
    $('#ExplodeButton').attr('disabled', 'disabled');
    unexplode();
    $('#ExplodeButton')[0].setAttribute('explode', 'true');
    // if(isMobileDevice == false){
    //   $('#ExplodeButton').attr('data-original-title', 'Assembled ')
    //       .tooltip('fixTitle')
    //       .tooltip('show');
    // }
    // return false;
  }
});
$('#tool-extender').on('click touchend', function (e) {
  e.preventDefault();
  if ( controlpanel_expanded == false ){
    // $('.controls-btn-panel').removeClass('horizontal-controlbutton-menu');
    $('.controls-btn-panel').addClass('verticle-controlbutton-menu');
    $('.control-buttons').removeClass('packed-control-buttons');
    $('.control-buttons').addClass('unpacked-control-buttons');
    
    controlpanel_expanded = true;

  } else {
    $('.controls-btn-panel').removeClass('verticle-controlbutton-menu');
    // $('.controls-btn-panel').addClass('horizontal-controlbutton-menu');
    $('.control-buttons').removeClass('unpacked-control-buttons');
    $('.control-buttons').addClass('packed-control-buttons');

    controlpanel_expanded = false;
  }
});
$('#ColorCustomizer_shortcut').on('click touchend', function (e) {
  e.preventDefault();
  openRimCustomizer();
});

