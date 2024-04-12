///////////// USER ///////////////
  var beats = [];
  var name;
  function saveBeat(){
    var url = window.location.origin;
    name = $('#name').val();
    var data = {name:name,
                kickQueue:kickQueue,
                snareQueue:snareQueue,
                hatQueue:hatQueue,
                tomQueue:tomQueue,
                ohatQueue:ohatQueue,
                aQueue:aQueue,
                bQueue:bQueue,
                cQueue:cQueue,
                dQueue:dQueue,
                eQueue:eQueue,
                fQueue:fQueue,
                gQueue:gQueue};
    var type = 'POST';
    var success = updateBeats;

    $.ajax({data:data, url:url, type:type, success:success});

    event.preventDefault();
  }

  function updateBeats(){
    var $option;
    beats.push({name:name,
                kickQueue:kickQueue,
                snareQueue:snareQueue,
                hatQueue:hatQueue,
                tomQueue:tomQueue,
                ohatQueue:ohatQueue,
                aQueue:aQueue,
                bQueue:bQueue,
                cQueue:cQueue,
                dQueue:dQueue,
                eQueue:eQueue,
                fQueue:fQueue,
                gQueue:gQueue});
    console.log(beats[beats.length-1].name);

    $option = $('<option value="'+beats[beats.length-1].name+'">'+beats[beats.length-1].name+'</option>');
    $('#beats').prepend($option);

  }

  function getBeat(){
    snareQueue = [];
    kickQueue = [];
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

    console.log(kickQueue);
    $('.seqStep').removeClass('selected');
    console.log($('#beats').val());
    var url = window.location.origin+'/user/'+$('#beats').val();
    $.getJSON(url, loadBeat);
  }

  function loadBeat(data){
    console.log(data);
    kickQueue  = data.beat.kickQueue;
    snareQueue = data.beat.snareQueue;
    hatQueue   = data.beat.hatQueue;
    tomQueue   = data.beat.tomQueue;
    ohatQueue  = data.beat.ohatQueue;

    aQueue = data.beat.aQueue;
    bQueue = data.beat.bQueue;
    cQueue = data.beat.cQueue;
    dQueue = data.beat.dQueue;
    eQueue = data.beat.eQueue;
    fQueue = data.beat.fQueue;
    gQueue = data.beat.gQueue;

    console.log(kickQueue);
    //////////NEEEEEEEDS WORK////////////
    for(var i = 0; i < 16; i++){
      if(_.contains(kickQueue, i)){
        $('ul.kickUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(snareQueue, i)){
        $('ul.snare li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(hatQueue, i)){
        $('ul.hatUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(tomQueue, i)){
        $('ul.tomUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(ohatQueue, i)){
        $('ul.ohatUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(aQueue, i)){
        $('ul.aUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(bQueue, i)){
        $('ul.bUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(cQueue, i)){
        $('ul.cUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(dQueue, i)){
        $('ul.dUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(eQueue, i)){
        $('ul.eUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(fQueue, i)){
        $('ul.fUL li:eq('+(i+1)+')').addClass('selected');
      }
      if(_.contains(gQueue, i)){
        $('ul.gUL li:eq('+(i+1)+')').addClass('selected');
      }
    }
  }
