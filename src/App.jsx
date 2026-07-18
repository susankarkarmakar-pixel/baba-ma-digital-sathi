import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, RefreshCw } from 'lucide-react';
import { handleUserQuery } from './services/aiService';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('नमस्ते! मैं आपका डिजिटल साथी हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?');
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      // Set properties
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN'; // Default to Hindi, we can also use 'en-IN'

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript);
          processUserSpeech(finalTranscript);
        } else if (interimTranscript) {
          setTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.error("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const speakText = useCallback((text) => {
    if (synthRef.current) {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Try to use Hindi voice

      // Try to find a good Hindi voice
      const voices = synthRef.current.getVoices();
      const hindiVoice = voices.find(voice => voice.lang.includes('hi') || voice.lang.includes('hi-IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.rate = 0.9; // Slightly slower for better comprehension by seniors
      utterance.pitch = 1.0;

      synthRef.current.speak(utterance);
    }
  }, []);

  // Speak initial greeting on load (might require user interaction first depending on browser policy)
  // We'll leave it out of initial load for now to avoid auto-play blocking

  const processUserSpeech = async (text) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    // Simulate API call to LLM
    try {
      const aiResponse = await handleUserQuery(text);
      setResponse(aiResponse);
      speakText(aiResponse);
    } catch (error) {
      const errorMsg = "माफ़ करना, मैं अभी समझ नहीं पाया। कृपया फिर से बोलें। (Sorry, I couldn't understand. Please speak again.)";
      setResponse(errorMsg);
      speakText(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Stop any ongoing speech when starting to listen
      synthRef.current?.cancel();
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
      }
    }
  };

  const replayResponse = () => {
    speakText(response);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col h-[90vh] max-h-[850px]">

        {/* Header */}
        <header className="bg-blue-600 text-white p-6 text-center shadow-md">
          <h1 className="text-4xl font-bold">डिजिटल साथी</h1>
          <p className="text-xl opacity-90 mt-2">Digital Sathi</p>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50 flex flex-col">

          {/* AI Response Area */}
          <div className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm border border-blue-100 relative">
            <button
              onClick={replayResponse}
              className="bg-blue-100 p-4 rounded-full text-blue-600 shrink-0 hover:bg-blue-200 transition-colors"
              aria-label="Replay response"
            >
              <Volume2 size={32} />
            </button>
            <div className="flex-1">
              <p className="text-3xl font-medium text-gray-800 leading-relaxed">
                {response}
              </p>
            </div>
          </div>

          {/* User Transcript Area */}
          {transcript && (
            <div className="flex items-end justify-end gap-4 mt-auto">
              <div className="bg-blue-600 text-white p-6 rounded-2xl rounded-br-sm shadow-md max-w-[85%]">
                <p className="text-2xl font-medium leading-relaxed">
                  {transcript}
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-center mt-4">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          )}
        </div>

        {/* Controls Area */}
        <div className="p-8 bg-white border-t border-gray-200 flex flex-col items-center justify-center gap-6">
          <p className="text-2xl text-gray-600 font-medium text-center">
            {isListening ? "सुन रहा हूँ... बोलिए" : "बोलने के लिए माइक बटन दबाएं"}
          </p>

          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`
              w-40 h-40 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-4 border-white
              ${isProcessing ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}
              ${isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-8 ring-red-200'
                : 'bg-green-500 hover:bg-green-600 ring-8 ring-green-100'
              }
            `}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <MicOff size={64} className="text-white" />
            ) : (
              <Mic size={64} className="text-white" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
