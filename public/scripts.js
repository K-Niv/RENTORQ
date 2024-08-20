// public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('background-video');
    const videoSources = ['/vid01.mp4', '/vid02.mp4'];
    let currentVideoIndex = 0;
  
    videoElement.src = videoSources[currentVideoIndex];
  
    videoElement.addEventListener('ended', () => {
      currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
      videoElement.src = videoSources[currentVideoIndex];
      videoElement.play();
    });
  });