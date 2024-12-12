import { useState, useRef, useEffect } from 'react'
import { Mic, Loader, Play, Pause } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import './index.css'

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [story, setStory] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const waveformRef = useRef(null)
  const previewWaveformRef = useRef(null)
  const wavesurferRef = useRef(null)
  const previewWavesurferRef = useRef(null)
  const websocketRef = useRef(null)

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1)
      }, 1000)
    } else {
      clearInterval(recordingIntervalRef.current)
    }
    return () => clearInterval(recordingIntervalRef.current)
  }, [isRecording])

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ddd',
        progressColor: '#4a90e2',
        height: 80,
      })
      wavesurferRef.current.load(audioUrl)
      wavesurferRef.current.on('finish', () => setIsPlaying(false))
    }
  }, [audioUrl])

  useEffect(() => {
    if (recordedAudioUrl && previewWaveformRef.current) {
      previewWavesurferRef.current = WaveSurfer.create({
        container: previewWaveformRef.current,
        waveColor: '#ddd',
        progressColor: '#4a90e2',
        height: 80,
      })
      previewWavesurferRef.current.load(recordedAudioUrl)
      previewWavesurferRef.current.on('finish', () => setIsPreviewPlaying(false))
    }
  }, [recordedAudioUrl])

  const handleRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
    }
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      setRecordedAudioUrl(audioUrl)
    }
    mediaRecorderRef.current.start()
    setIsRecording(true)
    setRecordingDuration(0)
  }

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  const handleSendAudio = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
    const audioArrayBuffer = await audioBlob.arrayBuffer()
    const audioBytes = new Uint8Array(audioArrayBuffer)

    setIsLoading(true)
    websocketRef.current = new WebSocket('ws://localhost:8000/ws')
    websocketRef.current.binaryType = 'arraybuffer' // Ensure binary type is set
    websocketRef.current.onopen = () => {
      websocketRef.current.send(audioBytes)
      console.log('Audio sent total bytes:', audioBytes.length)
    }
    websocketRef.current.onmessage = (event) => {
      const response = JSON.parse(event.data)
      console.log('WebSocket message:', response)
      if (response.status === 'success' && response.story) {
        setStory(response.story)
        setAudioUrl(`http://localhost:8000/get-audio/${response.file_id}`)
        setIsLoading(false)
        websocketRef.current.close()
      }
    }
    websocketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsLoading(false)
      websocketRef.current.close()
    }
  }

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause()
      } else {
        wavesurferRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handlePreviewPlayPause = () => {
    if (previewWavesurferRef.current) {
      if (isPreviewPlaying) {
        previewWavesurferRef.current.pause()
      } else {
        previewWavesurferRef.current.play()
      }
      setIsPreviewPlaying(!isPreviewPlaying)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white font-sans">
      <h1 className="text-4xl font-bold mb-2">StoryWave</h1>
      <p className="text-xl mb-8">Where stories come to life</p>
      {!isLoading && !story && (
        <div className="flex flex-col items-center">
          <button
            className={`${isRecording ? 'bg-red-500' : 'bg-blue-700'} p-6 rounded-full hover:bg-blue-800 transition`}
            onClick={isRecording ? handleStopRecording : handleRecord}
          >
            <Mic className="w-12 h-12" />
          </button>
          {isRecording && (
            <div className="recording-duration mt-4 text-lg text-white">
              Recording...{' '}
              {Math.floor(recordingDuration / 60)}:
              {recordingDuration % 60 < 10 ? '0' : ''}
              {recordingDuration % 60}
            </div>
          )}
          {recordedAudioUrl && !isRecording && (
            <div className="mt-4">
              <div ref={previewWaveformRef} className="waveform mb-4"></div>
              <div className="flex justify-between items-center">
                <button
                  className="btn btn-primary"
                  onClick={handlePreviewPlayPause}
                >
                  {isPreviewPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  className="btn btn-primary mr-2"
                  onClick={handleSendAudio}
                >
                  Send Audio
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setRecordedAudioUrl(null)
                    audioChunksRef.current = []
                    if (previewWavesurferRef.current) {
                      previewWavesurferRef.current.destroy()
                    }
                  }}
                >
                  Re-record
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin" />
        </div>
      )}
      {story && audioUrl && (
        <div className="story-container mt-8 w-full max-w-4xl p-6 bg-white text-gray-800 rounded-lg shadow-lg">
          <div className="story-text-container max-h-96 overflow-y-auto mb-4">
            <p className="story-text text-justify">{story}</p>
          </div>
          <div ref={waveformRef} className="waveform mb-4"></div>
          <div className="flex justify-between items-center">
            <button
              className="btn btn-primary"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <a
              href={audioUrl}
              download
              className="btn btn-primary"
              onClick={(e) => e.stopPropagation()}
            >
              Download Audio
            </a>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStory(null)
                setAudioUrl(null)
                if (wavesurferRef.current) {
                  wavesurferRef.current.destroy()
                }
              }}
            >
              Generate New Story
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App