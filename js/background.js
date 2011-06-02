//Much of this code taken from here: https://code.google.com/p/music-beta-controller/  
//This implementation by Kyle Kamperschroer

//Grabbed from music-beta-controller source
function FindMusicBetaTab(callback) {
chrome.windows.getAll({populate: true}, function(windows) {
    for (var window = 0; window < windows.length; window++) {
      for (var i = 0; i < windows[window].tabs.length; i++) {
        if (windows[window].tabs[i].url.
            indexOf('http://music.google.com/music/listen') == 0) {
          callback(windows[window].tabs[i].id)
          return;
        }
      }
    }
    callback(null);
  });  
}

// Send the given command to a tab showing Music Beta,
// or open one if non exists.
function sendCommand(command) {
    FindMusicBetaTab(function(tab_id) {
        if (tab_id) {
          if (command == "foreground") {
            chrome.tabs.update(tab_id, {selected: true});
          } else {
            chrome.tabs.executeScript(tab_id,
                {
                  code: "location.assign('javascript:SJBpost(\"" + command +
                        "\");void 0');",
                  allFrames: true
                });
          }
        } else {
          chrome.tabs.create({url: 'http://music.google.com/music/listen',
                              selected: true});
        }
    });
    updateInformation();
}

// Update the Browser Action based on the provided Play/Pause/Other state.
function UpdateIcon(state) {
    console.log("Updating icon with state = " + state);
    if (state == "Pause"){
        $("#play_pause").css("background-image", "url(\'../images/pause.png\')");
        //chrome.browserAction.setIcon({path: "pause-19x19.png"});
    }else if (state == "Play"){
        $("#play_pause").css("background-image", "url(\'../images/play.png\')");
        //chrome.browserAction.setIcon({path: "play-19x19.png"});
    }else{
        $("#play_pause").css("background-image", "url(\'../images/pause.png\')");
        //chrome.browserAction.setIcon({path: "logo-19x19.png"});
    }
}

// Get the play state from a MusicBeta tab and call UpdateIcon with it.
function UpdateIconFromPageState() {
FindMusicBetaTab(function(tab_id) {
    if (tab_id){
        console.log("In background.js requesting play state from contentscript...");
        chrome.tabs.sendRequest(tab_id, {gimme: "play_state"}, function(response){
            console.log("Got initial response...");
            UpdateIcon(response.state);    
        });
    }
  });
}

//Following functions are pretty self explanatory.
function playPause(){
    sendCommand("playPause");
    UpdateIconFromPageState();
}

function nextTrack(){
    sendCommand("nextSong");
}

function prevTrack(){
    sendCommand("prevSong");
}

//Updates all track information and art.
function updateInformation(){
    UpdateIconFromPageState();
    console.log("Updating information...");
    FindMusicBetaTab(function(tab_id) {
        if (tab_id){
            chrome.tabs.sendRequest(tab_id, {gimme: "artist"}, function(response){   
                    console.log("Got a response for artist of " + response.artist);  
                    if(response.artist)       
                        $("#artist").text(response.artist);
                });
            chrome.tabs.sendRequest(tab_id, {gimme: "art"}, function(response){            
                    console.log("Got a response for art of " + response.art);
                    if(response.art != "http:undefined" && response.art != "http:default_album_med.png")
                        $("#art").attr("src", response.art);
                    else
                        $("#art").attr("src", "../images/art.jpg");
                });
            chrome.tabs.sendRequest(tab_id, {gimme: "track"}, function(response){            
                    console.log("Got a response for track of " + response.track);
                    if(response.track)
                        $("#track").text(response.track);
                });
            chrome.tabs.sendRequest(tab_id, {gimme: "cur_time"}, function(response){            
                    console.log("Got a response for cur_time of \"" + response.cur_time + "\"");
                    if(response.cur_time.indexOf(":") != -1)
                        $("#cur_time").text(response.cur_time + "/");
                    else
                        $("#cur_time").text("");
                });
            chrome.tabs.sendRequest(tab_id, {gimme: "total_time"}, function(response){            
                    console.log("Got a response for total_time of " + response.total_time);
                    if(response.total_time)
                        $("#total_time").text(response.total_time);
                });
        }else{
            console.log("else....");
            chrome.tabs.create({url: 'http://music.google.com/music/listen',
                              selected: true});
        }
    });
}

//Update our information once every second.
window.setInterval(function() {
    updateInformation();
}, 1000)

$(document).ready(function(){
   updateInformation(); 
});
