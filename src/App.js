import React, { useState, useEffect, useRef } from 'react';

const AudioPlayer = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef();

  useEffect(() => {
    const savedAudioFiles = JSON.parse(localStorage.getItem('audioFiles'));
    if (savedAudioFiles) {
      setAudioFiles(savedAudioFiles);
    }

    const savedCurrentTrackId = localStorage.getItem('currentTrackId');
    const savedCurrentTime = parseFloat(localStorage.getItem('currentTime'));
    if (savedCurrentTrackId) {
      const track = audioFiles.find(track => track.id === parseInt(savedCurrentTrackId));
      if (track) {
        setCurrentTrack(track);
        setCurrentTime(savedCurrentTime);
        setIsPlaying(true);
      }
    }
  }, []);

  useEffect(() => {
    const saveCurrentTime = () => {
      if (audioRef.current) {
        localStorage.setItem('currentTime', audioRef.current.currentTime);
      }
    };

    window.addEventListener('beforeunload', saveCurrentTime);

    return () => {
      window.removeEventListener('beforeunload', saveCurrentTime);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const audioDataUrl = event.target.result;
      const newAudioFile = {
        id: Date.now(),
        name: file.name,
        dataUrl: audioDataUrl,
      };
      setAudioFiles([...audioFiles, newAudioFile]);
      localStorage.setItem('audioFiles', JSON.stringify([...audioFiles, newAudioFile]));
    };
    reader.readAsDataURL(file);
  };

  const handlePlay = (track) => {
    setCurrentTrack(track);
    const savedTime = parseFloat(localStorage.getItem('currentTime'));
    if (savedTime && currentTrack && currentTrack.id === track.id) {
      audioRef.current.currentTime = savedTime;
    }
    setIsPlaying(true);
    localStorage.setItem('currentTrackId', track.id);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleTrackEnd = () => {
    const currentIndex = audioFiles.findIndex(track => track.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < audioFiles.length - 1) {
      setCurrentTrack(audioFiles[currentIndex + 1]);
      localStorage.setItem('currentTrackId', audioFiles[currentIndex + 1].id);
      audioRef.current.currentTime = 0;
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Audio Player</h1>
        <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-4" />
        <div className="playlist-container bg-gray-100 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-bold mb-2">Playlist</h2>
          <ul>
            {audioFiles.map(track => (
              <li key={track.id} className="mb-2">
                <button
                  onClick={() => handlePlay(track)}
                  className="block w-full py-2 px-4 text-left bg-gray-200 hover:bg-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {track.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {currentTrack && (
          <div className="now-playing-container bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Now Playing</h2>
            <audio
              controls
              ref={audioRef}
              src={currentTrack.dataUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleTrackEnd}
              autoPlay={isPlaying}
              currentTime={currentTime}
              className="w-full"
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;
