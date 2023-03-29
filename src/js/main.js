// Declare global vars
let player;
let playbackRate = 1;

// Initialise iframe api
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates a new YouTube player object
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player-container', {
    height: '315',
    width: '560',
    playerVars: {
      // Optional parameters
      autoplay: 1,
      controls: 0,
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// This function is called when the player is ready to play
function onPlayerReady(event) {
  event.target.setPlaybackRate(playbackRate);
  updateSpeedLabel(playbackRate);
}

// This function is called when the player's state changes
function onPlayerStateChange(event) {
  // Do something when the player's state changes
}

// This function gets the video ID from the input field
function getVideoId() {
  const input = document.getElementById('video-url-input');
  const value = input.value.trim();
  
  // If the input value is a YouTube video URL, extract the video ID
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})/;
  const urlMatch = value.match(urlRegex);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // Otherwise, assume the input value is a video ID
  return value;
}

// This function handles the "Load Video" button click event
function loadVideo() {
  if (player) {
    // If a player object already exists, load a new video into it
    const videoId = getVideoId();
    player.loadVideoById(videoId);
    player.setPlaybackRate(playbackRate);
    updateSpeedLabel(playbackRate);
  } else {
    // Otherwise, create a new player object and load the video into it
    onYouTubeIframeAPIReady();
  }
}

// This function handles the speed slider change event
function changeSpeed() {
  const speedSlider = document.getElementById('speed-slider');
  const newPlaybackRate = parseFloat(speedSlider.value);
  playbackRate = newPlaybackRate;
  if (player) {
    player.setPlaybackRate(newPlaybackRate);
    updateSpeedLabel(newPlaybackRate);
  }
}

// This function updates the speed label to show the current playback rate
function updateSpeedLabel(playbackRate) {
  const speedLabel = document.getElementById('speed-label');
  speedLabel.textContent = `${playbackRate}x`;
}