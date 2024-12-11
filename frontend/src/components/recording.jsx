import React, { useState } from "react";

const MicrophoneButton = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState("");

  const startRecording = () => {
    if (!navigator.mediaDevices) {
      alert("Your browser does not support audio recording.");
      return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecording(transcript);
      setIsRecording(false);
    };

    recognition.onerror = () => {
      alert("Error occurred while recording.");
      setIsRecording(false);
    };
  };

  return (
    <div className="microphone-button">
      <button onClick={startRecording} className="mic-btn">
        {isRecording ? "Recording..." : <img src="/images/mic-icon.png" alt="Mic" />}
      </button>
      <p>{recording}</p>
    </div>
  );
};

export default MicrophoneButton;
