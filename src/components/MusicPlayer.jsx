'use client';

import React, { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

const initialSongs = [
  { title: '路小雨', artist: '周杰伦', file: '/music/周杰伦-路小雨-《不能说的秘密》电影插曲.flac' },
  { title: '瞬', artist: '郑润泽', file: '/music/郑润泽-瞬.flac' }
];

function MusicPlayer() {
  const [songs, setSongs] = useState(initialSongs);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch('/api/music')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setSongs(data);
        }
      })
      .catch(err => console.error('Failed to load music list:', err));
  }, []);

  const currentSong = songs[currentSongIndex] || songs[0] || {};

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress((audio.currentTime / audio.duration) * 100);
      } else {
        setProgress(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentSongIndex]);

  // Handle Play/Pause logic with AbortError safety
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        // Ignore AbortError (interrupted by pause)
        if (err.name !== 'AbortError') {
          console.error('Playback failed:', err);
        }
      }
    };

    if (isPlaying) {
      playAudio();
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSongIndex]); // Re-run when playing state or song changes

  const togglePlay = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const playNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const playPrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  };

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const newProgress = parseFloat(e.target.value);
      audio.currentTime = (newProgress / 100) * audio.duration;
      setProgress(newProgress);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong.file}
        onEnded={playNext}
      />

      {!isExpanded ? (
        <div className="music-player-minimized glass-panel" onClick={toggleExpand}>
          <div className={`music-icon disk ${isPlaying ? 'spinning' : ''}`} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }}>
            {/* Use the same vinyl record SVG but scaled to fit */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%', color: 'var(--color-primary)' }}>
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-5a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
            {/* Add a central dot to make it look more like a record */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20%', height: '20%', backgroundColor: '#1a1a1a', borderRadius: '50%' }}></div>
          </div>
        </div>
      ) : (
        <div className="music-player glass-panel">
          <button className="minimize-btn" onClick={toggleExpand}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="song-info">
            <div className="disk-wrapper">
              <div className={`disk ${isPlaying ? 'spinning' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-5a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
            </div>
            <div className="text-info">
              <span className="song-title">{currentSong.title}</span>
              <span className="song-artist">{currentSong.artist}</span>
            </div>
          </div>

          <div className="controls">
            <button className="control-btn" onClick={playPrev} title="Previous">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                <path d="M9.195 18.44c1.25.713 2.805-.19 2.805-1.629v-2.873h8.175c.966 0 1.75-.784 1.75-1.75V5.812C21.925 4.846 21.141 4.062 20.175 4.062H12V1.189c0-1.44-1.555-2.341-2.805-1.628L.892 4.062a1.875 1.875 0 000 3.251l8.303 4.501z" opacity="0" /> {/* Ghost path removal */}
                <path d="M4.5 12a.75.75 0 00-.75.75v.006c0 .414.336.75.75.75H4.534c.414 0 .75-.336.75-.75V12.75a.75.75 0 00-.75-.75zm-2.25.75a2.25 2.25 0 012.25-2.25h.006a2.25 2.25 0 012.25 2.25v.006a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V12.75z" opacity="0" />

                {/* Real Prev Icon */}
                <path fillRule="evenodd" d="M4.75 6a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0v-10.5A.75.75 0 004.75 6z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M7.75 16.25a.75.75 0 001.114.63l9.25-5.5a.75.75 0 000-1.288l-9.25-5.5A.75.75 0 007.75 5.142v11.108z" clipRule="evenodd" />
              </svg>
              {/* Simpler Path for Prev */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', display: 'none' }}> {/* Backup */}
                <path d="M7.5 7.5h-1.5v9h1.5v-9zM18 7.5l-9 4.5 9 4.5v-9z" />
              </svg>
              {/* ACTUAL CLEAN SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', position: 'absolute' }}>
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button className="control-btn play-btn" onClick={togglePlay}>
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button className="control-btn" onClick={playNext} title="Next">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px' }}>
                <path d="M18 18h-2V6h2v12zm-3.5-6l-8.5-6v12l8.5-6z" />
              </svg>
            </button>
          </div>

          <div className="progress-container">
            <input
              type="range"
              className="progress-bar"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleProgressChange}
              style={{
                background: `linear-gradient(to right, var(--color-primary) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default MusicPlayer;
