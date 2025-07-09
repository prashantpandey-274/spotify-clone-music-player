console.log("Let's write JavaScript");
let currentSong = new Audio();
let songs ;

// Convert seconds to minutes:seconds format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00.00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch the list of songs from the server
async function getSongs(folder) {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
  songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            // Remove unwanted parts and decode URI components
            songs.push(decodeURIComponent(element.href.split("_320_")[0].trim()));
        }

    }
    return songs;
}

// Play music from the given track name
const playMusic = (track, pause = false) => {
    const sanitizedTrack = track.trim();

    // Set the audio source to the corrected URL
    currentSong.src = `/songs/${encodeURIComponent(sanitizedTrack)}`;

    if (!pause) {
        currentSong.play()
            .catch(error => console.error("Error playing audio:", error));
        play.src = "pause.svg";
    }

    document.querySelector(".song_info").innerHTML = sanitizedTrack;
    document.querySelector(".song_time").innerHTML = "00:00 / 00:00";
}

async function main() {
    // Get the list of all songs
     songs = await getSongs();
    playMusic(songs[0].replace("http://127.0.0.1:3000/songs/", " "), true);

    // Populate the song list in the UI
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    for (const song of songs) {
        songUL.innerHTML += `<li><img src="music.svg" alt="music_icon" class="invert">
                                <div class="info">
                                    <div class="song_name">${song.replaceAll("http://127.0.0.1:3000/songs/", " ")}</div>
                                    <div class="song_artist">Prashant</div>
                                </div>
                                <div class="playnow">
                                    <span>playnow</span>
                                    <img src="play.svg" class="invert" alt="">
                                </div>
                            </li>`;
    }

    // Attach an event listener to each song item in the list
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let trackName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            console.log("Playing song:", trackName);
            playMusic(trackName);
        });
    });

    // Attach an event listener to the play button for toggling play/pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Listen for time updates to update the song's progress
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        // document.querySelector(".song_time").innerHTML.style.textAlign ="right";
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100+"%"
    });
    // add an event_listner to seek bar

    document.querySelector(".seekbar").addEventListener("click",e=>{
        var percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
     document.querySelector(".circle").style.left=percent+"%";
     currentSong.currentTime = ((currentSong.duration)*percent)/100
    })

    // Add an event listner for the hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0";

    })
    //Add an event listner for close 
    document.querySelector(".cross_icon").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-100%";


    })

    // Add an event listener for the Previous button
document.getElementById("previous").addEventListener("click", () => {
    console.log("Previous clicked");

    // Step 1: Get the current song name from the src
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop().trim());

    // Step 2: Find the current song's index in the playlist
    let index = songs.findIndex(song => song.includes(currentTrack));
    console.log("Current song index:", index);

    // Step 3: Check if it's the first song. If not, get the previous song
    if (index > 0) {  // If the index is not 0, there is a previous song
        let previousTrack = songs[index - 1].replace("http://127.0.0.1:3000/songs/", "").trim();
        console.log("Playing previous song:", previousTrack);
        playMusic(previousTrack); // Play the previous song
    } else {
        console.log("This is the first song. Can't go back.");
    }
});


   // Add event listener for the Next button
document.getElementById("next").addEventListener("click", () => {
    console.log("Next clicked");
    console.log("Current song src:", currentSong.src);

    // Extract the current track name from the URL
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop().trim());
    console.log("Current track name:", currentTrack);

    // Find the index of the current track in the songs array
    let index = songs.findIndex(song => song.includes(currentTrack));
    console.log("Current song index in array:", index);

    if (index !== -1 && index + 1 < songs.length) {
        // Play the next song in the list (relative path only)
        let nextTrack = songs[index + 1].replace("http://127.0.0.1:3000/songs/", "").trim();
        console.log("Next track to play:", nextTrack);
        playMusic(nextTrack);
    } else {
        console.log("No next song available or end of playlist reached.");
    }
});

  // Add an event to volume
 document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    console.log(e,e.target,e.target.value);
    currentSong.volume= parseInt(e.target.value)/100;
    


 })

}

main();
