let currentSong = new Audio()
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0){
        return "00:00"
    }
    // Floor the seconds to remove any milliseconds
    const totalSeconds = Math.floor(seconds);

    // Calculate the minutes
    const minutes = Math.floor(totalSeconds / 60);
    
    // Calculate the remaining seconds
    const remainingSeconds = totalSeconds % 60;
    
    // Format minutes and seconds to always have two digits
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    // Return the formatted time in "minutes:seconds" format
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text(); 
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++){
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0] 
    songUL.innerHTML = ""
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML +`<li>
                            <img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>playnow</span>
                                <img  class="invert" src="img/play.svg">
                            </div>
                        </li>` ;
                       
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs

}

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track 
    if(!pause){
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none">
                                <circle cx="12" cy="12" r="10" fill="#3be477" />
                                <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="black" />
                            </svg>
                               
                        </div>
                
                        <img src="/songs/${folder}/cover.jpg" alt="song">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item =>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            
        })          
       })

}

async function main() {
    await getSongs("songs/mysong")
    playMusic(songs[0], true)
    
    // console.log(songs)
    await displayAlbums()

    
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
           
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
           
        }
    })

    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration)*100 + "%";
    })
   
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100 
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)*percent)/100;
        
    })
    document.querySelector(".hamburger").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".close").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    previous.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        
        if ((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })


    next.addEventListener("click", ()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if ((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })
   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
    currentSong.volume = (e.target.value)/100
    console.log(e.target.value)
    if (currentSong.volume >0){
        document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg","volume.svg")
    }
    else if (currentSong.volume == 0){
        document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("volume.svg","mute.svg")

   }
})

   
   document.querySelector(".volume img").addEventListener("click", e=>{
    console.log(e.target.src.includes("volume.svg"))
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
         e.target.src = e.target.src.replace("mute.svg","volume.svg")
         currentSong.volume = 0.1;
         document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
   })
}
main()   