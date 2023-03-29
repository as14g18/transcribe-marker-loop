// Declare global vars
let player;
let playbackRate = 1;
let loopStartTime = 0;
let loopEndTime = 0;
let loopWindowActive = false;

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
  setLoopWindow(0, event.target.getDuration());
  setInterval(updateProgressBar, 100);
  initProgressBar();
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
    setLoopWindow(0, player.getDuration());
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

// This function updates the progress bar to show the current position in the video
function updateProgressBar() {
  if (player) {
    const duration = player.getDuration();
    const currentTime = player.getCurrentTime();
    const progressPercent = (currentTime / duration) * 100;
    const progressBarLine = document.querySelector('.progress-bar-line');
    progressBarLine.style.width = `${progressPercent}%`;
  }
}

// This function sets the loop window to the specified start and end times (in seconds)
function setLoopWindow(startTime, endTime) {
  loopStartTime = startTime;
  loopEndTime = endTime;
  const loopWindow = document.querySelector('.progress-bar-loop-window');
  const duration = player.getDuration();
  const loopWindowStartPercent = (startTime / duration) * 100;
  const loopWindowEndPercent = (endTime / duration) * 100;
  loopWindow.style.left = `${loopWindowStartPercent}%`;
  loopWindow.style.width = `${loopWindowEndPercent - loopWindowStartPercent}%`;
}

// This function handles the progress bar click event
function handleProgressBarClick(event) {
  if (player) {
    const progressBar = document.querySelector('.progress-bar');
    const progressBarRect = progressBar.getBoundingClientRect();
    const mouseX = event.clientX - progressBarRect.left;
    const duration = player.getDuration();
    const newTime = (mouseX / progressBarRect.width) * duration;
    player.seekTo(newTime);
  }
}

// This function handles the loop window drag start event
function handleLoopWindowDragStart(event) {
  event.target.classList.add('dragging');
  loopWindowActive = true;
}

// This function handles the loop window drag end event
function handleLoopWindowDragEnd(event) {
  event.target.classList.remove('dragging');
  loopWindowActive = false;
}

// This function handles the loop window drag event
function handleLoopWindowDrag(event) {
  if (loopWindowActive) {
    const progressBar = document.querySelector('.progress-bar');
    const progressBarRect = progressBar.getBoundingClientRect();
    const mouseX = event.clientX - progressBarRect.left;
    const duration = player.getDuration();
    const newTime = (mouseX / progressBarRect.width) * duration;
    const loopWindow = document.querySelector('.progress-bar-loop-window');
    const loopWindowRect = loopWindow.getBoundingClientRect();
    const loopWindowStartX = loopWindowRect.left - progressBarRect.left;
    const loopWindowEndX = loopWindowStartX + loopWindowRect.width;
    if (event.target.classList.contains('loop-window-start')) {
      loopStartTime = newTime;
      const loopWindowStartPercent = (loopStartTime / duration) * 100;
      loopWindow.style.left = `${loopWindowStartPercent}%`;
      loopWindow.style.width = `${loopWindowEndX - mouseX}px`;
    } else if (event.target.classList.contains('loop-window-end')) {
      loopEndTime = newTime;
      const loopWindowEndPercent = (loopEndTime / duration) * 100;
      loopWindow.style.width = `${mouseX - loopWindowStartX}px`;
    }
  }
}

// This function handles the loop window click event
function handleLoopWindowClick(event) {
  const progressBar = document.querySelector('.progress-bar');
  const progressBarRect = progressBar.getBoundingClientRect();
  const mouseX = event.clientX - progressBarRect.left;
  const duration = player.getDuration();
  const newTime = (mouseX / progressBarRect.width) * duration;
  const loopWindow = document.querySelector('.progress-bar-loop-window');
  const loopWindowRect = loopWindow.getBoundingClientRect();
  const loopWindowStartX = loopWindowRect.left - progressBarRect.left;
  const loopWindowEndX = loopWindowStartX + loopWindowRect.width;

  if (loopWindowActive) {
    if (mouseX < loopWindowStartX || mouseX > loopWindowEndX) {
      handleLoopWindowDragEnd(event);
      return;
    }
  } else {
    if (event.target.classList.contains('progress-bar-loop-window')) {
      handleLoopWindowDragEnd(event);
      return;
    }
  }

  const loopWindowStartPercent = (newTime / duration) * 100;
  const loopWindowEndPercent = ((newTime + loopWindowRect.width / progressBarRect.width * duration) / duration) * 100;
  loopStartTime = newTime;
  loopEndTime = loopStartTime + loopWindowRect.width / progressBarRect.width * duration;
  loopWindow.style.left = `${ loopWindowStartPercent }%`;
  loopWindow.style.width = `${ loopWindowEndPercent - loopWindowStartPercent }%`;
  updateLoopTimeLabel();
}

// This function updates the loop time label to show the current loop window start and end times
function updateLoopTimeLabel() {
  const loopTimeLabel = document.querySelector('.loop-time-label');
  loopTimeLabel.textContent = `${ formatTime(loopStartTime) } - ${ formatTime(loopEndTime) }`;
}

// This function formats a time value (in seconds) to a human-readable string (MM:SS)
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(seconds).padStart(2, '0');
  return `${ minutesString }:${ secondsString }`;
}

// This function initializes the progress bar
function initProgressBar() {
  const progressBar = document.querySelector('.progress-bar');
  progressBar.addEventListener('click', handleProgressBarClick);
  const loopWindow = document.querySelector('.progress-bar-loop-window');
  loopWindow.addEventListener('mousedown', handleLoopWindowDragStart);
  loopWindow.addEventListener('mouseup', handleLoopWindowDragEnd);
  loopWindow.addEventListener('mousemove', handleLoopWindowDrag);
  progressBar.addEventListener('mousedown', handleLoopWindowClick);
  updateProgressBar();
  updateLoopTimeLabel();
}
