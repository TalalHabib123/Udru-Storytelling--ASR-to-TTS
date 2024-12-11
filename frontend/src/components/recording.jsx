import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faStop } from "@fortawesome/free-solid-svg-icons";
import WaveSurfer from "wavesurfer.js";

const Recording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [inactivityTimeout, setInactivityTimeout] = useState(null);
  const [lastTranscript, setLastTranscript] = useState("");

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const wavesurfer = useRef(null);
  const waveformRef = useRef(null);

  useEffect(() => {
    if (!wavesurfer.current && waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#ddd",
        progressColor: "#007bff",
        cursorColor: "#007bff",
        responsive: true,
        height: 100,
      });
    }
  }, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert("Your browser does not support audio recording.");
      return;
    }

    // Clear the previous waveform
    if (wavesurfer.current) {
      wavesurfer.current.empty();
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Audio URL:", audioUrl);
      wavesurfer.current.load(audioUrl); // Load the new waveform
      audioChunks.current = [];
    };

    mediaRecorder.current.start();

    const newRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    newRecognition.lang = "en-US";
    newRecognition.start();
    setIsRecording(true);
    setRecognition(newRecognition);

    const resetInactivityTimeout = () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      const timeout = setTimeout(() => {
        stopRecording();
      }, 10000); // Stop recording after 5 seconds of inactivity
      setInactivityTimeout(timeout);
    };

    resetInactivityTimeout();

    newRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript !== lastTranscript) {
        setRecording(transcript);
        setLastTranscript(transcript);
        resetInactivityTimeout();
      }
    };

    newRecognition.onerror = () => {
      alert("Error occurred while recording.");
      setIsRecording(false);
      clearTimeout(inactivityTimeout);
    };
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      clearTimeout(inactivityTimeout);
    }
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  };

  const clearRecording = () => {
    setRecording("");
    if (wavesurfer.current) {
      wavesurfer.current.empty(); // Clear the waveform
    }
  };

  return (
    <div className="recording-container">
      <div className="microphone-button">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="mic-btn"
        >
          <FontAwesomeIcon
            icon={isRecording ? faStop : faMicrophone}
            size="3x"
            color="white"
          />
        </button>
        <div
          ref={waveformRef}
          className={`waveform ${isRecording ? "visible" : "hidden"}`}
        ></div>
      </div>
      <div className="buttin">
        <button onClick={clearRecording} className="clear-btn">
          Clear Rec
        </button>
        {/* <div className="transcript">{recording}</div> */}
      </div>
    </div>
  );
};

export default Recording;