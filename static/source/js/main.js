(function(){

/*globals requestAnimationFrame:true, AudioContext:true, Kit:true*/
  'use strict';

//////// INITIALIZE ////////
  function init(){
    $(document).foundation();
    createAudioContext();
    initDrums();
    initSynths();
    initDrums();
    initCanvas();
    requestAnimationFrame(draw);

    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas;

    $('#play').click(play);
    $('#play').text('PLAY');
    $('#setTempo').click(setTempo);
    $('#clear').click(clear);

    $('.kick').click(clickKick);
    $('.snare').click(clickSnare);
    $('.hat').click(clickHat);
    $('.tom').click(clickTom);
    $('.ohat').click(clickOhat);
    $('select#synth').change(changeSynth);

    $('select#kit').change(changeKit);
    $('#kitVolume').change(changeKitVolume);
    $('#synthVolume').change(changeSynthVolume);

    $('#kick').click(playKick);
    $('#snare').click(playSnare);
    $('#hat').click(playHat);
    $('#tom').click(playTom);
    $('#ohat').click(playOhat);

    $('.a').click(clickA);
    $('.b').click(clickB);
    $('.c').click(clickC);
    $('.d').click(clickD);
    $('.e').click(clickE);
    $('.f').click(clickF);
    $('.g').click(clickG);

    $('#a').click(playA);
    $('#b').click(playB);
    $('#c').click(playC);
    $('#d').click(playD);
    $('#e').click(playE);
    $('#f').click(playF);
    $('#g').click(playG);
    $('.seqStep').click(clickSeqStep);
    // $('#save').click(saveBeat);
    // $('#load').click(getBeat);
  }

  var context;

  function createAudioContext(){
    context = new AudioContext();
  }

//////// INITIALIZE INSTRUMENTS ////////
  var kit = [];
  var kNumInstruments = 11;
  var kitNames = [
    'Plasticid-MkII',
    'T09',
    'TR606',
    'hiphop',
    'dr.groove',
    'ace',
    'akai-xe-8',
    'nord-rack-2',
    'groovebox',
    'Jomox-xbase-09',
    'sonor-mini-mammut'
  ];

  var synth = [];
  var sNumInstruments = 4;
  var synthNames = [
    'MiniSquare',
    'FattySaw',
    'TriSaw',
    'SweetChords'
  ];

  function initSynths(){
    var numSynths = synthNames.length;
    for (var i = 0; i < numSynths; i++) {
      synth.push(new Synth(context, synthNames[i], sNumInstruments));
    }
    changeSynth();
  }

  function initDrums(){
    var numKits = kitNames.length;
    for (var i = 0; i < numKits; i++) {
      kit.push(new Kit(context, kitNames[i], kNumInstruments));
    }
    changeKit();
  }


//////// CONTROLS ////////
  var currentKit;
  var currentSynth;
  var tempo = 120.0;
  var gainKitVolume = 1.0;
  var gainSynthVolume = 1.0;

  function setTempo(){
    tempo = $('#tempo').val();
  }

  function changeKit(){
    currentKit = $('select#kit').val();
    if(currentKit === 'Plasticid-MkII'){
      currentKit = kit[0];
    }
    if(currentKit === 'T09'){
      currentKit = kit[1];
    }
    if(currentKit === 'TR606'){
      currentKit = kit[2];
    }
    if(currentKit === 'hiphop'){
      currentKit = kit[3];
    }
    if(currentKit === 'dr.groove'){
      currentKit = kit[4];
    }
    if(currentKit === 'ace'){
      currentKit = kit[5];
    }
    if(currentKit === 'akai-xe-8'){
      currentKit = kit[6];
    }
    if(currentKit === 'nord-rack-2'){
      currentKit = kit[7];
    }
    if(currentKit === 'groovebox'){
      currentKit = kit[8];
    }
    if(currentKit === 'Jomox-xbase-09'){
      currentKit = kit[9];
    }
    if(currentKit === 'sonor-mini-mammut'){
      currentKit = kit[10];
    }
  }

  function changeSynth(){
    currentSynth = $('select#synth').val();
    if(currentSynth === 'MiniSquare'){
      currentSynth = synth[0];
    }
    if(currentSynth === 'FattySaw'){
      currentSynth = synth[1];
    }
    if(currentSynth === 'TriSaw'){
      currentSynth = synth[2];
    }
    if(currentSynth === 'SweetChords'){
      currentSynth = synth[3];
    }
  }

  function toggleStop(){
    if($('#play').text() === 'STOP') {
      $('#play').text('PLAY');
    }else{
      $('#play').text('STOP');
    }
  }

  function changeKitVolume(){
    var volume = $('#kitVolume').attr('data-slider');
    gainKitVolume = volume/50;
    console.log($('#kitVolume').attr('data-slider'));
  }

  function changeSynthVolume(){
    var volume = $('#synthVolume').attr('data-slider');
    gainSynthVolume = volume/50;
  }

  function clickSeqStep(){
    if(!$(this).hasClass('selected')){
      $(this).addClass('selected');
    }else{
      $(this).removeClass('selected');
    }
  }

  function clear(){
    $('.seqStep').removeClass('selected');
    kickQueue = [];
    snareQueue = [];
    hatQueue = [];
    tomQueue = [];
    ohatQueue= [];
    aQueue= [];
    bQueue= [];
    cQueue= [];
    dQueue= [];
    eQueue= [];
    fQueue= [];
    gQueue= [];
  }


//////// PLAY ////////
  var current16thNote;
  var nextNoteTime = 0.0;
  var lap = 10.0;
  var lookAhead = 0.1;
  var isPlaying = false;
  var timerID = 0;
  var source;

  function play(){
    context.resume();
    isPlaying = !isPlaying;
    if(isPlaying){
      current16thNote = 0;
      nextNoteTime = context.currentTime;
      scheduler();
      toggleStop();
    }else{
      window.clearTimeout(timerID);
      toggleStop();
    }
  }

  function scheduler(){
    while(nextNoteTime < context.currentTime + lookAhead){
      scheduleNote(current16thNote, nextNoteTime);
      nextNote();
    }
    timerID = window.setTimeout(scheduler, lap);
  }

  function scheduleNote(beatNumber, time){
    notesInQueue.push({note:beatNumber, time:time});
    if(_.contains(kickQueue, beatNumber)){
      playNote(currentKit.kickBuffer);
    }
    if(_.contains(snareQueue, beatNumber)){
      playNote(currentKit.snareBuffer);
    }
    if(_.contains(hatQueue, beatNumber)){
      playNote(currentKit.hatBuffer);
    }
    if(_.contains(tomQueue, beatNumber)){
      playNote(currentKit.tomBuffer);
    }
    if(_.contains(ohatQueue, beatNumber)){
      playNote(currentKit.ohatBuffer);
    }
    if(_.contains(aQueue, beatNumber)){
      playNote(currentSynth.aBuffer);
    }
    if(_.contains(bQueue, beatNumber)){
      playNote(currentSynth.bBuffer);
    }
    if(_.contains(cQueue, beatNumber)){
      playNote(currentSynth.cBuffer);
    }
    if(_.contains(dQueue, beatNumber)){
      playNote(currentSynth.dBuffer);
    }
    if(_.contains(eQueue, beatNumber)){
      playNote(currentSynth.eBuffer);
    }
    if(_.contains(fQueue, beatNumber)){
      playNote(currentSynth.fBuffer);
    }
    if(_.contains(gQueue, beatNumber)){
      playNote(currentSynth.gBuffer);
    }
  }

  function randomColor(buffer){
    if(buffer === currentKit.kickBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      $('#kick').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentKit.snareBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#snare').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentKit.hatBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#hat').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentKit.tomBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#tom').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentKit.ohatBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#ohat').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.aBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#a').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.bBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#b').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.cBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#c').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.dBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#d').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.eBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#e').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.fBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#f').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
    else if(buffer === currentSynth.gBuffer){
      var red = Math.floor(Math.random() * 256);
      var grn = Math.floor(Math.random() * 256);
      var blu = Math.floor(Math.random() * 256);
      var alp = Math.random();
      $('#g').css('background-color', 'rgb('+red+', '+grn+', '+blu+')');
    }
  }

  function playNote(buffer){
    randomColor(buffer);
    if(buffer === currentKit.kickBuffer || buffer === currentKit.snareBuffer || buffer === currentKit.hatBuffer || buffer === currentKit.tomBuffer || buffer == currentKit.ohatBuffer){
      var gainNode = context.createGain();
      gainNode.gain.value = gainKitVolume;
    }else{
      var gainNode = context.createGain();
      gainNode.gain.value = gainSynthVolume;
    }
    source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);
    source.start(0);
  }

  function nextNote(){
    var secondsPerBeat = 60.0/tempo;
    nextNoteTime += 0.25 * secondsPerBeat;
    current16thNote++;
    if(current16thNote === 16){
      current16thNote = 0;
    }
  }


//////// CANVAS ////////
  var canvas = document.getElementById('animation');
  var canvas2 = document.getElementById('animation2');

  var canvasContext;
  var canvas2Context;
  var navy = '#000080';
  var black = '#000000';
  var yellow = '#FFFF00'
  var notesInQueue = [];
  var last16thNoteDrawn = -1;

  function initCanvas(){
    canvasContext = canvas.getContext( '2d' );
    canvas2Context = canvas2.getContext( '2d' );
    canvas.width = 967;
    canvas.height = 20;
    canvas2.width = 967;
    canvas2.height = 20;
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    canvas2Context.clearRect(0,0,canvas.width, canvas.height);
    for (var i=0; i<16; i++){
      if(i === 0){
        canvasContext.fillStyle = yellow;
        canvasContext.fillRect(69, 1, 30, 15);
        canvas2Context.fillStyle = yellow;
        canvas2Context.fillRect(69, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(68, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(68, 0, 32, 17);
      }else if(i === 1){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(121, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(121, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(120, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(120, 0, 32, 17);
      }else if(i === 2){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(173, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(173, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(172, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(172, 0, 32, 17);
      }else if(i === 3){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(225, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(225, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(224, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(224, 0, 32, 17);
      }else if(i === 4){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(302, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(302, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(301, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(301, 0, 32, 17);
      }else if(i === 5){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(354, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(354, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(353, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(353, 0, 32, 17);
      }else if(i === 6){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(406, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(406, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(405, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(405, 0, 32, 17);
      }else if(i === 7){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(458, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(458, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(457, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(457, 0, 32, 17);
      }else if(i === 8){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(535, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(535, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(534, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(534, 0, 32, 17);
      }else if(i === 9){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(587, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(587, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(586, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(586, 0, 32, 17);
      }else if(i === 10){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(639, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(639, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(638, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(638, 0, 32, 17);
      }else if(i === 11){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(691, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(691, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(690, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(690, 0, 32, 17);
      }else if(i === 12){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(768, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(768, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(767, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(767, 0, 32, 17);
      }else if(i === 13){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(820, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(820, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(819, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(819, 0, 32, 17);
      }else if(i === 14){
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(872, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(872, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(871, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(871, 0, 32, 17);
      }else{
        canvasContext.fillStyle = navy;
        canvasContext.fillRect(924, 1, 30, 15);
        canvas2Context.fillStyle = navy;
        canvas2Context.fillRect(924, 1, 30, 15);
        canvasContext.strokeStyle = black;
        canvasContext.strokeRect(923, 0, 32, 17);
        canvas2Context.strokeStyle = black;
        canvas2Context.strokeRect(923, 0, 32, 17);
      }
    }
  }

  function draw() {
    // this.context = context;
    var currentNote = last16thNoteDrawn;
    var currentTime = context.currentTime;
    while (notesInQueue.length && notesInQueue[0].time < currentTime) {
      currentNote = notesInQueue[0].note;
      notesInQueue.splice(0,1);
    }
    if(last16thNoteDrawn !== currentNote) {
      canvasContext.clearRect(0,0,canvas.width, canvas.height);
      canvas2Context.clearRect(0,0,canvas.width, canvas.height);
      for (var i=0; i<16; i++){
        if(i === 0){
          canvasContext.fillStyle = (currentNote === i+15) ? yellow : navy;
          canvasContext.fillRect(69, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i+15) ? yellow : navy;
          canvas2Context.fillRect(69, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(68, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(68, 0, 32, 17);
        }else if(i === 1){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(121, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(121, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(120, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(120, 0, 32, 17);
        }else if(i === 2){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(173, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(173, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(172, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(172, 0, 32, 17);
        }else if(i === 3){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(225, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(225, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(224, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(224, 0, 32, 17);
        }else if(i === 4){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(302, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(302, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(301, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(301, 0, 32, 17);
        }else if(i === 5){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(354, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(354, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(353, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(353, 0, 32, 17);
        }else if(i === 6){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(406, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(406, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(405, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(405, 0, 32, 17);
        }else if(i === 7){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(458, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(458, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(457, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(457, 0, 32, 17);
        }else if(i === 8){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(535, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(535, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(534, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(534, 0, 32, 17);
        }else if(i === 9){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(587, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(587, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(586, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(586, 0, 32, 17);
        }else if(i === 10){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(639, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(639, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(638, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(638, 0, 32, 17);
        }else if(i === 11){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(691, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(691, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(690, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(690, 0, 32, 17);
        }else if(i === 12){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(768, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(768, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(767, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(767, 0, 32, 17);
        }else if(i === 13){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(820, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(820, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(819, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(819, 0, 32, 17);
        }else if(i === 14){
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(872, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(872, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(871, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(871, 0, 32, 17);
        }else{
          canvasContext.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvasContext.fillRect(924, 1, 30, 15);
          canvas2Context.fillStyle = (currentNote === i-1) ? yellow : navy;
          canvas2Context.fillRect(924, 1, 30, 15);
          canvasContext.strokeStyle = black;
          canvasContext.strokeRect(923, 0, 32, 17);
          canvas2Context.strokeStyle = black;
          canvas2Context.strokeRect(923, 0, 32, 17);
        }
      }
      last16thNoteDrawn = currentNote;
    }
    requestAnimationFrame(draw);
  }

  function resetCanvas(e){
    canvas.width = window.innerWidth;
    canvas.height = 100;
    //wrapper.width = window.innerWidth;
    $('#sequenceWrapper').width($(window).width());
    //wrapper.height = window.innerHeight;
    window.scrollTo(0,0);
  }


//////// PADS ////////
  function playKick(){
    playNote(currentKit.kickBuffer);
  }

  function playSnare(){
    playNote(currentKit.snareBuffer);
  }

  function playHat(){
    playNote(currentKit.hatBuffer);
  }

  function playTom(){
    playNote(currentKit.tomBuffer);
  }

  function playOhat(){
    playNote(currentKit.ohatBuffer);
  }

  function playA(){
    playNote(currentSynth.aBuffer);
  }

  function playB(){
    playNote(currentSynth.bBuffer);
  }

  function playC(){
    playNote(currentSynth.cBuffer);
  }

  function playD(){
    playNote(currentSynth.dBuffer);
  }

  function playE(){
    playNote(currentSynth.eBuffer);
  }

  function playF(){
    playNote(currentSynth.fBuffer);
  }

  function playG(){
    playNote(currentSynth.gBuffer);
  }


//////// KIT ////////
  var kitCount = 0;
  var errorCount = 0;
  var successCount = 0;
  var kits = 11;

  //------ Kit Constructor ------//
  function Kit(context, name, kNum) {
    this.context = context;
    this.name = name;
    this.pathName = '../../audio/' + this.name + '/';
    var kickPath = this.pathName + 'kick.wav';
    var snarePath = this.pathName + 'snare.wav';
    var hatPath = this.pathName + 'hat.wav';
    var tomPath = this.pathName + 'tom.wav';
    var ohatPath = this.pathName + 'ohat.wav';

    this.kickBuffer = 0;
    this.snareBuffer = 0;
    this.hatBuffer = 0;
    this.tomBuffer = 0;
    this.ohatBuffer = 0;

    this.instrumentCount = kNum;
    this.instrumentLoadCount = 0;

    this.loadSample(0, kickPath, false);
    this.loadSample(1, snarePath, false);
    this.loadSample(2, hatPath, false);
    this.loadSample(3, tomPath, false);
    this.loadSample(4, ohatPath, false);

  }
  //------ Loads Drum Samples ------//
  Kit.prototype.loadSample = function(sampleID, url, mixToMono) {
    // Load asynchronously

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    var self = this;

    request.onload = function(){
      self.context.decodeAudioData(
        request.response, function(buffer){
          switch (sampleID) {
            case 0:
              self.kickBuffer = buffer;
              break;
            case 1:
              self.snareBuffer = buffer;
              break;
            case 2:
              self.hatBuffer = buffer;
              break;
            case 3:
              self.tomBuffer = buffer;
              break;
            case 4:
              self.ohatBuffer = buffer;
          }
          successCount++;
          self.instrumentLoadCount++;
          if (self.instrumentLoadCount === self.instrumentCount){
            kitCount++;
            if (kitCount < kits){return;}
          }
        },
        function(){
          errorCount++;
        }
      );
    };
    request.send();
  };


//////// KIT SEQUENCER ////////
  var hatQueue=[];
  var tomQueue=[];
  var ohatQueue=[];
  var kickQueue=[];
  var snareQueue=[];

  function clickKick(){
    if(!$(this).hasClass('selected')){
      kickQueue.push(parseInt($(this).attr('kick-sequence-position')));
    }else{
      kickQueue = _.without(kickQueue, parseInt($(this).attr('kick-sequence-position')));
    }
  }

  function clickSnare(){
    if(!$(this).hasClass('selected')){
      snareQueue.push(parseInt($(this).attr('snare-sequence-position')));
    }else{
      snareQueue = _.without(snareQueue, parseInt($(this).attr('snare-sequence-position')));
    }
  }

  function clickHat(){
    if(!$(this).hasClass('selected')){
      hatQueue.push(parseInt($(this).attr('hat-sequence-position')));
    }else{
      hatQueue = _.without(hatQueue, parseInt($(this).attr('hat-sequence-position')));
    }
  }

  function clickTom(){
    if(!$(this).hasClass('selected')){
      tomQueue.push(parseInt($(this).attr('tom-sequence-position')));
    }else{
      tomQueue = _.without(tomQueue, parseInt($(this).attr('tom-sequence-position')));
    }
  }

  function clickOhat(){
    if(!$(this).hasClass('selected')){
      ohatQueue.push(parseInt($(this).attr('ohat-sequence-position')));
    }else{
      ohatQueue = _.without(ohatQueue, parseInt($(this).attr('ohat-sequence-position')));
    }
  }


//////// SYNTH ////////
  var synthCount = 0;
  var errorCount = 0;
  var successCount = 0;
  var synths = 4;

  //------ Synth Constructor ------//
  function Synth(context, name, sNum) {
    this.context = context;
    this.name = name;
    this.pathName = '../../audio/' + this.name + '/';
    //var pathName = this.pathName();
    var aPath = this.pathName + 'a.wav';
    var bPath = this.pathName + 'b.wav';
    var cPath = this.pathName + 'c.wav';
    var dPath = this.pathName + 'd.wav';
    var ePath = this.pathName + 'e.wav';
    var fPath = this.pathName + 'f.wav';
    var gPath = this.pathName + 'g.wav';

    this.aBuffer = 0;
    this.bBuffer = 0;
    this.cbuffer = 0;
    this.dBuffer = 0;
    this.eBuffer = 0;
    this.fbuffer = 0;
    this.gBuffer = 0;

    this.instrumentCount = sNum;
    this.instrumentLoadCount = 0;

    this.loadSample(0, aPath, false);
    this.loadSample(1, bPath, false);
    this.loadSample(2, cPath, false);
    this.loadSample(3, dPath, false);
    this.loadSample(4, ePath, false);
    this.loadSample(5, fPath, false);
    this.loadSample(6, gPath, false);

  }
  //------ Loads Synth Samples ------//
  Synth.prototype.loadSample = function(sampleID, url, mixToMono) {
    // Load asynchronously

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    var self = this;

    request.onload = function(){
      self.context.decodeAudioData(
        request.response, function(buffer){
        //  var buffer = context.createBuffer(request.response, mixToMono);
          switch (sampleID) {
            case 0:
              self.aBuffer = buffer;
              break;
            case 1:
              self.bBuffer = buffer;
              break;
            case 2:
              self.cBuffer = buffer;
              break;
            case 3:
              self.dBuffer = buffer;
              break;
            case 4:
              self.eBuffer = buffer;
              break;
            case 5:
              self.fBuffer = buffer;
              break;
            case 6:
              self.gBuffer = buffer;
          }
          successCount++;
          self.instrumentLoadCount++;
          if (self.instrumentLoadCount === self.instrumentCount){
            synthCount++;
            if (synthCount < synths){return;}
          }
        },
        function(){
          errorCount++;
        }
      );
    };
    request.send();
  };


//////// SYNTH SEQUENCER ////////
  var aQueue=[];
  var bQueue=[];
  var cQueue=[];
  var dQueue=[];
  var eQueue=[];
  var fQueue=[];
  var gQueue=[];

  function clickA(){
    if(!$(this).hasClass('selected')){
      aQueue.push(parseInt($(this).attr('a-sequence-position')));
    }else{
      aQueue = _.without(aQueue, parseInt($(this).attr('a-sequence-position')));
    }
  }

  function clickB(){
    if(!$(this).hasClass('selected')){
      bQueue.push(parseInt($(this).attr('b-sequence-position')));
    }else{
      bQueue = _.without(bQueue, parseInt($(this).attr('b-sequence-position')));
    }
  }

  function clickC(){
    if(!$(this).hasClass('selected')){
      cQueue.push(parseInt($(this).attr('c-sequence-position')));
    }else{
      cQueue = _.without(cQueue, parseInt($(this).attr('c-sequence-position')));
    }
  }

  function clickD(){
    if(!$(this).hasClass('selected')){
      dQueue.push(parseInt($(this).attr('d-sequence-position')));
    }else{
      dQueue = _.without(dQueue, parseInt($(this).attr('d-sequence-position')));
    }
  }

  function clickE(){
    if(!$(this).hasClass('selected')){
      eQueue.push(parseInt($(this).attr('e-sequence-position')));
    }else{
      eQueue = _.without(eQueue, parseInt($(this).attr('e-sequence-position')));
    }
  }

  function clickF(){
    if(!$(this).hasClass('selected')){
      fQueue.push(parseInt($(this).attr('f-sequence-position')));
    }else{
      fQueue = _.without(fQueue, parseInt($(this).attr('f-sequence-position')));
    }
  }

  function clickG(){
    if(!$(this).hasClass('selected')){
      gQueue.push(parseInt($(this).attr('g-sequence-position')));
    }else{
      gQueue = _.without(gQueue, parseInt($(this).attr('g-sequence-position')));
    }
  }

  $(document).ready(init);

})();
