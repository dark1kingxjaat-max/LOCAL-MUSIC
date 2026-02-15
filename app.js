/* ============================
   X-MUSIC Premium Mobile App
   One Global Audio Instance
   Audius Real Streaming
============================ */

const API_BASE = "https://api.audius.co";
const APP_NAME = "SoundRoom";

let DISCOVERY = null;

const state = {
  audio: null,
  userInteracted: false,
  currentTrack: null,
  queue: [],
  queueIndex: -1,

  liked: new Set(JSON.parse(localStorage.getItem("xm_liked") || "[]")),
  recent: JSON.parse(localStorage.getItem("xm_recent") || "[]"),

  theme: localStorage.getItem("xm_theme") || "dark",
  volume: parseFloat(localStorage.getItem("xm_volume") || "1"),
  autoplayNext: localStorage.getItem("xm_autonext") !== "false",
  shuffle: localStorage.getItem("xm_shuffle") === "true",
  repeat: localStorage.getItem("xm_repeat") || "off" // off|one|all
};

const $ = (id) => document.getElementById(id);

/* DOM */
const splash = $("splash");
const app = $("app");

const homePage = $("page-home");
const searchPage = $("page-search");
const profilePage = $("page-profile");
const settingsPage = $("page-settings");

const navHome = $("navHome");
const navSearch = $("navSearch");
const navProfile = $("navProfile");
const navSettings = $("navSettings");

const trendingRow = $("trendingRow");
const freshRow = $("freshRow");
const hitsRow = $("hitsRow");

const reloadTrending = $("reloadTrending");
const reloadFresh = $("reloadFresh");
const reloadHits = $("reloadHits");

const searchInput = $("searchInput");
const searchResults = $("searchResults");
const searchClear = $("searchClear");

const miniPlayer = $("miniPlayer");
const miniTitle = $("miniTitle");
const miniArtist = $("miniArtist");
const miniCover = $("miniCover");
const miniPlayBtn = $("miniPlayBtn");
const miniLikeBtn = $("miniLikeBtn");

const bigPlayer = $("bigPlayer");
const bigCover = $("bigCover");
const bigTitle = $("bigTitle");
const bigArtist = $("bigArtist");
const bigPlayBtn = $("bigPlayBtn");
const bigLikeBtn = $("bigLikeBtn");
const bigPrevBtn = $("bigPrevBtn");
const bigNextBtn = $("bigNextBtn");
const bigCloseBtn = $("bigCloseBtn");

const seekBar = $("seekBar");
const seekFill = $("seekFill");
const currentTimeEl = $("currentTime");
const durationEl = $("durationTime");

const likedList = $("likedList");
const recentList = $("recentList");
const clearRecentBtn = $("clearRecentBtn");

const toast = $("toast");

/* Settings DOM */
const themeToggle = $("themeToggle");
const themeToggleBtn = $("themeToggleBtn");
const volumeSlider = $("volumeSlider");
const autoNextBtn = $("autoNextBtn");
const shuffleBtn = $("shuffleBtn");
const repeatBtn = $("repeatBtn");
const clearCacheBtn = $("clearCacheBtn");
const copyAdminBtn = $("copyAdminBtn");

const shuffleToggle = $("shuffleToggle");
const repeatToggle = $("repeatToggle");
const bigMenuBtn = $("bigMenuBtn");

/* SVG ICONS */
const ICONS = {
  home: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3z"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 2a8 8 0 105.3 14l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg>`,
  user: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5 0-9 3-9 6v2h18v-2c0-3-4-6-9-6z"/></svg>`,
  gear: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.4 13a7.8 7.8 0 000-2l2-1.5-2-3.5-2.3 1a8.4 8.4 0 00-1.7-1l-.3-2.5H9.9l-.3 2.5a8.4 8.4 0 00-1.7 1l-2.3-1-2 3.5 2 1.5a7.8 7.8 0 000 2l-2 1.5 2 3.5 2.3-1a8.4 8.4 0 001.7 1l.3 2.5h4.2l.3-2.5a8.4 8.4 0 001.7-1l2.3 1 2-3.5-2-1.5zM12 16a4 4 0 110-8 4 4 0 010 8z"/></svg>`,
  play: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>`,
  next: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6 18V6l8.5 6L6 18zm10-12h2v12h-2V6z"/></svg>`,
  prev: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 6v12l-8.5-6L18 6zM6 6h2v12H6V6z"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21s-7-4.4-9.3-8.6C.6 8.8 2.6 5.5 6.2 5.2c1.7-.2 3.3.6 4.3 1.8c1-1.2 2.6-2 4.3-1.8c3.6.3 5.6 3.6 3.5 7.2C19 16.6 12 21 12 21z"/></svg>`,
  moon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 14.5A8.5 8.5 0 119.5 3a7 7 0 0011.5 11.5z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 18a6 6 0 110-12 6 6 0 010 12zm0-16h0zm0 20h0zM4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`,
  shuffle: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 3h5v5h-2V6.4l-3.6 3.6-1.4-1.4L17.6 5H16V3zM3 6h4l3.5 4.5-1.5 1.2L6 8H3V6zm0 12v-2h3l3-4 1.5 1.2L7 18H3zm18-2v-1.6l-3.6-3.6 1.4-1.4L21 12.6V11h2v5h-5v-2h3z"/></svg>`,
  repeat: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 7h11v3l4-4-4-4v3H6a4 4 0 00-4 4v3h2V9a2 2 0 012-2zm10 10H6v-3l-4 4 4 4v-3h12a4 4 0 004-4v-3h-2v3a2 2 0 01-2 2z"/></svg>`,
  dots: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 10a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4z"/></svg>`
};

/* Toast */
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2000);
}

/* Time */
function formatTime(sec){
  if(!sec || isNaN(sec)) return "0:00";
  let m = Math.floor(sec/60);
  let s = Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

/* Discovery */
async function getDiscoveryHost(){
  if(DISCOVERY) return DISCOVERY;
  const res = await fetch("https://api.audius.co");
  const data = await res.json();
  DISCOVERY = data.data[0];
  return DISCOVERY;
}

/* Artwork */
function getArtwork(track,size="480x480"){
  if(track?.artwork?.[size]) return track.artwork[size];
  if(track?.artwork?.["150x150"]) return track.artwork["150x150"];
  return "https://via.placeholder.com/512/0b0c10/ffffff?text=X-MUSIC";
}

/* Stream URL */
function getStreamUrl(id){
  return `${API_BASE}/v1/tracks/${id}/stream?app_name=${APP_NAME}`;
}

/* Global Audio Init */
function initAudioOnce(){
  if(state.audio) return;

  state.audio = new Audio();
  state.audio.preload = "auto";
  state.audio.volume = state.volume;

  state.audio.addEventListener("timeupdate", updateSeekUI);
  state.audio.addEventListener("loadedmetadata", updateSeekUI);
  state.audio.addEventListener("ended", onTrackEnd);
}

/* Seek UI */
function updateSeekUI(){
  if(!state.audio) return;

  const cur = state.audio.currentTime || 0;
  const dur = state.audio.duration || 0;

  currentTimeEl.textContent = formatTime(cur);
  durationEl.textContent = formatTime(dur);

  if(dur>0){
    seekFill.style.width = `${(cur/dur)*100}%`;
  } else {
    seekFill.style.width = "0%";
  }
}

/* Player UI */
function updatePlayerUI(track){
  miniTitle.textContent = track.title;
  miniArtist.textContent = track.user?.name || "Unknown";
  miniCover.src = getArtwork(track);

  bigTitle.textContent = track.title;
  bigArtist.textContent = track.user?.name || "Unknown";
  bigCover.src = getArtwork(track,"1000x1000");

  updateLikeUI();
}

/* Like */
function isLiked(id){ return state.liked.has(id); }

function toggleLike(){
  if(!state.currentTrack) return;

  const id = state.currentTrack.id;
  if(state.liked.has(id)){
    state.liked.delete(id);
    showToast("Removed from Liked");
  } else {
    state.liked.add(id);
    showToast("Added to Liked ❤️");
  }
  localStorage.setItem("xm_liked", JSON.stringify([...state.liked]));
  updateLikeUI();
  renderLiked();
}

function updateLikeUI(){
  if(!state.currentTrack) return;
  const liked = isLiked(state.currentTrack.id);

  miniLikeBtn.innerHTML = ICONS.heart;
  bigLikeBtn.innerHTML = ICONS.heart;

  miniLikeBtn.style.color = liked ? "#ff4d6d" : "white";
  bigLikeBtn.style.color = liked ? "#ff4d6d" : "white";
}

/* Play Track */
async function playTrack(track, queueTracks=[]){
  if(!state.userInteracted){
    showToast("Tap any song to enable audio");
    return;
  }

  initAudioOnce();

  state.currentTrack = track;

  if(queueTracks.length){
    state.queue = queueTracks;
    state.queueIndex = queueTracks.findIndex(t=>t.id===track.id);
  }

  // Save recent
  state.recent = state.recent.filter(t=>t.id !== track.id);
  state.recent.unshift(track);
  state.recent = state.recent.slice(0,25);
  localStorage.setItem("xm_recent", JSON.stringify(state.recent));
  renderRecent();

  updatePlayerUI(track);

  // FAST playback
  const url = getStreamUrl(track.id);
  state.audio.src = url;

  try{
    await state.audio.play();

    miniPlayer.classList.remove("hidden");
    miniPlayBtn.innerHTML = ICONS.pause;
    bigPlayBtn.innerHTML = ICONS.pause;

  }catch(e){
    console.log("Play failed",e);
    showToast("Playback failed. Try again.");
  }
}

/* Pause/Resume */
function togglePlay(){
  if(!state.audio) return;
  if(state.audio.paused){
    state.audio.play();
    miniPlayBtn.innerHTML = ICONS.pause;
    bigPlayBtn.innerHTML = ICONS.pause;
  } else {
    state.audio.pause();
    miniPlayBtn.innerHTML = ICONS.play;
    bigPlayBtn.innerHTML = ICONS.play;
  }
}

/* Next / Prev */
function playNext(){
  if(!state.queue.length) return;

  if(state.shuffle){
    state.queueIndex = Math.floor(Math.random()*state.queue.length);
  } else {
    state.queueIndex++;
    if(state.queueIndex >= state.queue.length){
      state.queueIndex = 0;
    }
  }

  playTrack(state.queue[state.queueIndex], state.queue);
}

function playPrev(){
  if(!state.queue.length) return;

  state.queueIndex--;
  if(state.queueIndex < 0){
    state.queueIndex = state.queue.length - 1;
  }
  playTrack(state.queue[state.queueIndex], state.queue);
}

/* Track End */
function onTrackEnd(){
  if(state.repeat === "one"){
    state.audio.currentTime = 0;
    state.audio.play();
    return;
  }

  if(!state.autoplayNext) return;

  if(state.repeat === "all" || state.queue.length){
    playNext();
  }
}

/* Seek Click */
seekBar.addEventListener("click",(e)=>{
  if(!state.audio) return;
  const rect = seekBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  state.audio.currentTime = pct * state.audio.duration;
});

/* Render Cards */
function createCard(track, list){
  const div = document.createElement("div");
  div.className = "cardSong";
  div.innerHTML = `
    <img src="${getArtwork(track)}" loading="lazy"/>
    <div class="playBadge"><span>${ICONS.play}</span></div>
    <div class="cardInfo">
      <div class="t">${track.title}</div>
      <div class="a">${track.user?.name || "Unknown"}</div>
    </div>
  `;
  div.addEventListener("click", ()=>{
    state.userInteracted = true;
    playTrack(track, list);
  });
  return div;
}

/* Render List Item */
function createListItem(track, list){
  const row = document.createElement("div");
  row.className = "listItem";
  row.innerHTML = `
    <img src="${getArtwork(track)}"/>
    <div class="info">
      <div class="t">${track.title}</div>
      <div class="a">${track.user?.name || "Unknown"}</div>
    </div>
    <button>${ICONS.play}</button>
  `;

  row.addEventListener("click", ()=>{
    state.userInteracted = true;
    playTrack(track, list);
  });

  return row;
}

/* Fetch Trending */
async function fetchTrending(limit=20, offset=0){
  const host = await getDiscoveryHost();
  const url = `${host}/v1/tracks/trending?limit=${limit}&offset=${offset}&app_name=${APP_NAME}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

/* Fetch Search */
async function searchTracks(q){
  const host = await getDiscoveryHost();
  const url = `${host}/v1/tracks/search?query=${encodeURIComponent(q)}&limit=20&app_name=${APP_NAME}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data || [];
}

/* Load Home Sections */
async function loadHome(){
  trendingRow.innerHTML = "";
  freshRow.innerHTML = "";
  hitsRow.innerHTML = "";

  const trending = await fetchTrending(20,0);
  const fresh = await fetchTrending(20,30);
  const hits = await fetchTrending(20,60);

  trending.forEach(t=>trendingRow.appendChild(createCard(t,trending)));
  fresh.forEach(t=>freshRow.appendChild(createCard(t,fresh)));
  hits.forEach(t=>hitsRow.appendChild(createCard(t,hits)));
}

/* Search UI */
let searchTimer = null;
searchInput.addEventListener("input", ()=>{
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();

  searchTimer = setTimeout(async ()=>{
    if(!q){
      searchResults.innerHTML = "";
      return;
    }

    searchResults.innerHTML = `<div class="listItem">Searching...</div>`;

    try{
      const results = await searchTracks(q);
      searchResults.innerHTML = "";
      if(!results.length){
        searchResults.innerHTML = `<div class="listItem">No results found</div>`;
        return;
      }

      results.forEach(t=>{
        searchResults.appendChild(createListItem(t,results));
      });

    }catch(e){
      console.log(e);
      searchResults.innerHTML = `<div class="listItem">Search error</div>`;
    }

  }, 450);
});

searchClear.addEventListener("click", ()=>{
  searchInput.value = "";
  searchResults.innerHTML = "";
});

/* Recent */
function renderRecent(){
  recentList.innerHTML = "";
  if(!state.recent.length){
    recentList.innerHTML = `<div class="listItem">No recently played</div>`;
    return;
  }
  state.recent.forEach(t=>{
    recentList.appendChild(createListItem(t,state.recent));
  });
}

clearRecentBtn.addEventListener("click", ()=>{
  state.recent = [];
  localStorage.setItem("xm_recent","[]");
  renderRecent();
  showToast("Recent cleared");
});

/* Liked */
function renderLiked(){
  likedList.innerHTML = "";
  const likedTracks = state.recent.filter(t=>state.liked.has(t.id));

  if(!likedTracks.length){
    likedList.innerHTML = `<div class="listItem">No liked songs yet</div>`;
    return;
  }
  likedTracks.forEach(t=>{
    likedList.appendChild(createListItem(t,likedTracks));
  });
}

/* Theme */
function applyTheme(){
  if(state.theme === "light"){
    document.body.classList.add("light");
    themeToggle.textContent = "Light";
    themeToggleBtn.innerHTML = ICONS.sun;
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "Dark";
    themeToggleBtn.innerHTML = ICONS.moon;
  }
  localStorage.setItem("xm_theme", state.theme);
}

themeToggle.addEventListener("click", ()=>{
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
});

themeToggleBtn.addEventListener("click", ()=>{
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
});

/* Settings */
volumeSlider.value = state.volume;
volumeSlider.addEventListener("input", ()=>{
  state.volume = parseFloat(volumeSlider.value);
  if(state.audio) state.audio.volume = state.volume;
  localStorage.setItem("xm_volume", state.volume.toString());
});

autoNextBtn.addEventListener("click", ()=>{
  state.autoplayNext = !state.autoplayNext;
  localStorage.setItem("xm_autonext", state.autoplayNext.toString());
  autoNextBtn.textContent = state.autoplayNext ? "ON" : "OFF";
});

shuffleBtn.addEventListener("click", ()=>{
  state.shuffle = !state.shuffle;
  localStorage.setItem("xm_shuffle", state.shuffle.toString());
  shuffleBtn.textContent = state.shuffle ? "ON" : "OFF";
});

repeatBtn.addEventListener("click", ()=>{
  if(state.repeat === "off") state.repeat = "all";
  else if(state.repeat === "all") state.repeat = "one";
  else state.repeat = "off";

  localStorage.setItem("xm_repeat", state.repeat);
  repeatBtn.textContent = state.repeat.toUpperCase();
});

clearCacheBtn.addEventListener("click", ()=>{
  localStorage.clear();
  showToast("Cache cleared, reload page");
});

copyAdminBtn.addEventListener("click", ()=>{
  navigator.clipboard.writeText("IIG_DARK_YT");
  showToast("Copied: IIG_DARK_YT");
});

/* Big player toggles */
shuffleToggle.innerHTML = ICONS.shuffle;
repeatToggle.innerHTML = ICONS.repeat;

shuffleToggle.addEventListener("click", ()=>{
  state.shuffle = !state.shuffle;
  localStorage.setItem("xm_shuffle", state.shuffle.toString());
  showToast(state.shuffle ? "Shuffle ON" : "Shuffle OFF");
});

repeatToggle.addEventListener("click", ()=>{
  if(state.repeat === "off") state.repeat = "all";
  else if(state.repeat === "all") state.repeat = "one";
  else state.repeat = "off";

  localStorage.setItem("xm_repeat", state.repeat);
  showToast("Repeat: " + state.repeat.toUpperCase());
});

/* Mini/Big Player open close */
miniPlayer.addEventListener("click", ()=>{
  bigPlayer.classList.remove("hidden");
});

bigCloseBtn.addEventListener("click", ()=>{
  bigPlayer.classList.add("hidden");
});

/* Player Buttons */
miniPlayBtn.addEventListener("click",(e)=>{
  e.stopPropagation();
  togglePlay();
});

bigPlayBtn.addEventListener("click", togglePlay);
bigPrevBtn.addEventListener("click", playPrev);
bigNextBtn.addEventListener("click", playNext);

miniLikeBtn.addEventListener("click",(e)=>{
  e.stopPropagation();
  toggleLike();
});
bigLikeBtn.addEventListener("click", toggleLike);

/* Menu btn */
bigMenuBtn.innerHTML = ICONS.dots;

/* Nav */
function showPage(page){
  homePage.classList.remove("active");
  searchPage.classList.remove("active");
  profilePage.classList.remove("active");
  settingsPage.classList.remove("active");

  page.classList.add("active");

  navHome.classList.remove("active");
  navSearch.classList.remove("active");
  navProfile.classList.remove("active");
  navSettings.classList.remove("active");
}

navHome.innerHTML = ICONS.home;
navSearch.innerHTML = ICONS.search;
navProfile.innerHTML = ICONS.user;
navSettings.innerHTML = ICONS.gear;

navHome.addEventListener("click", ()=>{
  showPage(homePage);
  navHome.classList.add("active");
});
navSearch.addEventListener("click", ()=>{
  showPage(searchPage);
  navSearch.classList.add("active");
});
navProfile.addEventListener("click", ()=>{
  showPage(profilePage);
  navProfile.classList.add("active");
  renderLiked();
});
navSettings.addEventListener("click", ()=>{
  showPage(settingsPage);
  navSettings.classList.add("active");
});

/* Reload Buttons */
reloadTrending.addEventListener("click", loadHome);
reloadFresh.addEventListener("click", loadHome);
reloadHits.addEventListener("click", loadHome);

/* Init */
function init(){
  applyTheme();

  autoNextBtn.textContent = state.autoplayNext ? "ON" : "OFF";
  shuffleBtn.textContent = state.shuffle ? "ON" : "OFF";
  repeatBtn.textContent = state.repeat.toUpperCase();

  miniPlayBtn.innerHTML = ICONS.play;
  bigPlayBtn.innerHTML = ICONS.play;

  miniLikeBtn.innerHTML = ICONS.heart;
  bigLikeBtn.innerHTML = ICONS.heart;

  bigCloseBtn.innerHTML = ICONS.close;

  // hide splash after 2 sec
  setTimeout(()=>{
    splash.classList.add("hidden");
    app.classList.remove("hidden");
  },2000);

  renderRecent();
  loadHome();
}

init();