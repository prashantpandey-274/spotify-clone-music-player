let currentSong = new Audio();
let songs;
let currFolder;
let card_container = document.querySelector(".card_container");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00.00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let element of as) {
        if (element.href.endsWith("mp3")) {
            songs.push(decodeURIComponent(element.href.split("/").pop().trim()));
        }
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
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

    Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
        e.addEventListener("click", () => {
            let trackName = e.querySelector(".info .song_name").innerHTML.trim();
            playMusic(trackName);
        });
    });

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

const playMusic = (track, pause = false) => {
    const sanitizedTrack = track.trim();
    currentSong.src = `${currFolder}/${encodeURIComponent(sanitizedTrack)}`;
    if (!pause) {
        currentSong.play().catch(err => console.error("Error playing:", err));
        play.src = "pause.svg";
    }
    document.querySelector(".song_info").innerHTML = sanitizedTrack;
    document.querySelector(".song_time").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        let pathParts = new URL(e.href).pathname.split("/").filter(part => part.length > 0);

        if (pathParts[0] === "songs" && pathParts.length > 1) {
            let folder = pathParts[1];
            try {
                let metaRes = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`);
                let meta = await metaRes.json();

                card_container.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play-button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="play-icon">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                   <img id="song-cover" src="songs/${folder}/cover.jpeg" alt="img1" onerror="this.onerror=null; this.src='songs/${folder}/cover.jpg';">

                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
            } catch (err) {
                console.error(`Error loading info.json for folder: ${folder}`, err);
            }
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}

async function main() {
    await getSongs("songs/LikedSongs");
    playMusic(songs[0].replace(`http://127.0.0.1:5501/${currFolder}/`, " "), true);
    displayAlbums();

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song_time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".cross_icon").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    document.getElementById("previous").addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").pop().trim());
        let index = songs.findIndex(song => song.includes(currentTrack));
        if (index > 0) {
            let previousTrack = songs[index - 1].replace("http://127.0.0.1:5501/songs/", "").trim();
            playMusic(previousTrack);
        }
    });

    document.getElementById("next").addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentSong.src.split("/").pop().trim());
        let index = songs.findIndex(song => song.includes(currentTrack));
        if (index !== -1 && index + 1 < songs.length) {
            let nextTrack = songs[index + 1].replace("http://127.0.0.1:5501/songs/", "").trim();
            playMusic(nextTrack);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".sound_icon>img").addEventListener("click", e => {
        if (e.target.src.includes("sound.svg")) {
            e.target.src = e.target.src.replace("sound.svg", "mute.svg");
            e.target.style.filter = "invert(1)";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "sound.svg");
            e.target.style.filter = "invert(0)";
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
