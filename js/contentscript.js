//Listen for messages and respond accordingly.
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    console.log("contentscript Received a request!");
    if (request.gimme == "play_state"){
        console.log("in content script. Play state requested.");
        var return_state = get_play_state();
        sendResponse({state: "" + return_state});
    }else if (request.gimme == "artist"){
        console.log("Artist requested...");
        sendResponse({artist: get_artist()});
    }else if (request.gimme == "art"){
        console.log("Art requested...");
        sendResponse({art: get_album_art()});
    }else if (request.gimme == "track"){
        console.log("Track requeste...");
        sendResponse({track: get_track()});
    }else if (request.gimme == "cur_time"){
        console.log("Current time requested...");
        sendResponse({cur_time: get_cur_time()});
    }else if (request.gimme == "total_time"){
        console.log("Total time requested...");
        sendResponse({total_time: get_total_time()});
    }
    else{
        console.log("not sure what exactly was requested. Returning empty response.");
        sendResponse({}); // snub them.
    }
});


function get_play_state(){
    console.log("in contentscript. get_play_state()");
    if(($("#playPause").attr("title") == "Pause")){
        console.log("current state is pause.");
        return "Pause";
    }else{
        console.log("current state is play.");
        return "Play";
    }
}

function get_album_art(){
    return ("http:" + $("#playingAlbumArt").attr("src"));
}

function get_artist(){
    return $("#playerArtist div").text();
}

function get_track(){
    return $("#playerSongTitle div").text();
}

function get_cur_time(){
    return $("#currentTime").text();
}

function get_total_time(){
    return $("#duration").text();
}

console.log("contentscript_new is up and running!");
