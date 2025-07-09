
let currentSong = new Audio();
let songs ;
let currFolder;
let card_container= document.querySelector(".card_container");


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
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5501/${currFolder}/`);
    let response = await a.text();
   let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
  songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            // Remove unwanted parts and decode URI components
            songs.push(decodeURIComponent(element.href.split("/").pop().trim()));

        }

    }
     // Populate the song list in the UI
     let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
     songUL.innerHTML= " "
     for (const song of songs) {
         songUL.innerHTML += `<li><img src="music.svg" alt="music_icon" class="invert">
                                 <div class="info">
                                     <div class="song_name">${song.replaceAll(`http://127.0.0.1:5501/${currFolder}/`, " ")}</div>
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
 
    
}

// Play music from the given track name
const playMusic = (track, pause = false) => {
    const sanitizedTrack = track.trim();

    // Set the audio source to the corrected URL
    currentSong.src = `${currFolder}/${encodeURIComponent(sanitizedTrack)}`;

    if (!pause) {
        currentSong.play()
            .catch(error => console.error("Error playing audio:", error));
        play.src = "pause.svg";
    }

    document.querySelector(".song_info").innerHTML = sanitizedTrack;
    document.querySelector(".song_time").innerHTML = "00:00 / 00:00";
}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await a.text();
    
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div)
    let anchors = div.getElementsByTagName("a");
    console.log(anchors)
   let array = Array.from(anchors)
        for(let index =0;index<array.length;index++){
            const e = array[index];
        if(e.href.includes("/songs")){
            // part.length removes the empty string from split result 
            let folder = new URL(e.href).pathname.replace("/songs/", "").replaceAll("/", "");

            console.log(folder)
           // Get the metadata of the folder
         let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`)
    let response = await a.json();
    

    card_container.innerHTML = card_container.innerHTML+ ` <div data-folder=${folder} class="card">
     
    <div class="play-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                class="play-icon">
                <path
                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
        </div>
        <img id="song-cover" src="/songs/${folder}/cover.jpeg" alt="img1" onerror="this.onerror=null; this.src='/songs/${folder}/cover.jpg';">

        <h2>${response.title}</h2>
        <p>${response.description}</p>
        
    </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
           songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
       
        })
    })

    
}

async function main() {
    // Get the list of all songs
     await getSongs("songs/LikedSongs");
    playMusic(songs[0].replace(`http://127.0.0.1:5501/${currFolder}/`, " "), true);

    // Display all the albums on the page
    displayAlbums()
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
    

    // Step 1: Get the current song name from the src
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop().trim());

    // Step 2: Find the current song's index in the playlist
    let index = songs.findIndex(song => song.includes(currentTrack));
    

    // Step 3: Check if it's the first song. If not, get the previous song
    if (index > 0) {  // If the index is not 0, there is a previous song
        let previousTrack = songs[index - 1].replace("http://127.0.0.1:5501/songs/", "").trim();
        
        playMusic(previousTrack); // Play the previous song
    } else {
        
    }
});


   // Add event listener for the Next button
document.getElementById("next").addEventListener("click", () => {
    
    // Extract the current track name from the URL
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop().trim());
    

    // Find the index of the current track in the songs array
    let index = songs.findIndex(song => song.includes(currentTrack));
    
    if (index !== -1 && index + 1 < songs.length) {
        // Play the next song in the list (relative path only)
        let nextTrack = songs[index + 1].replace("http://127.0.0.1:5501/songs/", "").trim();
     
        playMusic(nextTrack);
    } else {
        console.log("No next song available or end of playlist reached.");
    }
});

  // Add an event to volume
 document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    
    currentSong.volume= parseInt(e.target.value)/100;
    


 })

 // Load the playlist when a particular card is clicked
 
 // here the propetry item.current starget will only written the elemetn selected on get element by class function
 // that if we click anywhere on the card even on the images and h2s it will only written card

 // javascript code to mute the sound by clicking on the sound icon
 document.querySelector(".sound_icon>img").addEventListener("click",e=>{
    
    if(e.target.src.includes("sound.svg")){
        e.target.src = e.target.src.replace("sound.svg","mute.svg");
        e.target.style.filter = "invert(1)";
        currentSong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].value =0;
    }
    else{
       e.target.src=  e.target.src.replace("mute.svg","sound.svg");
       e.target.style.filter = "invert(0)";
        currentSong.volume= .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value =10;

    }
 })
}

main();
