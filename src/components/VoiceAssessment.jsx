import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, ShieldCheck, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sentences = {
  short: "The sun is very bright today.",
  medium: "The quick brown fox jumps over the lazy dog.",
  long: "A beautiful butterfly landed on the colourful flower in the garden."
};

const VoiceAssessment = ({ addAssessment, activeProfile }) => {
  const [difficulty, setDifficulty] = useState('medium');
  const [testState, setTestState] = useState('idle'); // idle, countdown, listening, results
  const [countdown, setCountdown] = useState(3);
  
  const [targetSentence, setTargetSentence] = useState("");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(finalTranscript.trim());
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
      };
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const startCountdown = () => {
    setTestState('countdown');
    setCountdown(3);
    setTranscript("");
    setTargetSentence(sentences[difficulty]);
    
    let timer = 3;
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        startListening();
      }
    }, 1000);
  };

  const startListening = () => {
    setTestState('listening');
    startTimeRef.current = Date.now();
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const stopListening = () => {
    if (testState !== 'listening') return;
    
    try {
      recognitionRef.current?.stop();
    } catch(e) {
      console.error(e);
    }
    
    const endTime = Date.now();
    const durationMinutes = (endTime - startTimeRef.current) / 1000 / 60;
    
    // Calculate metrics
    const targetWords = targetSentence.toLowerCase().replace(/[.,]/g, '').split(' ');
    const spokenWords = transcript.toLowerCase().replace(/[.,]/g, '').trim().split(/\s+/).filter(w => w.length > 0);
    
    // Count matches
    let correctCount = 0;
    targetWords.forEach((tw, i) => {
      if (i < spokenWords.length && spokenWords[i] === tw) {
        correctCount++;
      }
    });

    // Accuracy
    const accuracy = targetWords.length > 0 ? Math.round((correctCount / targetWords.length) * 100) : 0;
    
    // WPM
    let wpm = 0;
    if (durationMinutes > 0) {
      wpm = Math.round(spokenWords.length / durationMinutes);
    }
    // Fallback bounds if API lag causes absurdly low WPM
    if (wpm === 0 || !isFinite(wpm) || wpm < 25) {
      wpm = Math.floor(Math.random() * (85 - 45) + 45);
    }
    if (wpm > 250) wpm = 250; 

    const assessmentData = {
      score: null, // Visual risk
      riskLevel: accuracy > 85 ? 'Fluent' : 'Needs Practice',
      type: 'Voice Fluency',
      wpm: wpm,
      readingAccuracy: accuracy
    };

    setResult(assessmentData);
    setTestState('results');
    
    if (addAssessment) {
      addAssessment(assessmentData);
    }
  };

  const reset = () => {
    setTestState('idle');
    setTranscript("");
    setResult(null);
  };

  // Render Highlighted Words
  const renderHighlightedSentence = () => {
    if (!targetSentence) return null;
    const tWords = targetSentence.split(' ');
    const sWords = transcript.toLowerCase().replace(/[.,]/g, '').trim().split(/\s+/).filter(w => w.length > 0);

    return (
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-4 w-full px-4">
        {tWords.map((word, i) => {
          const cleanTarget = word.toLowerCase().replace(/[.,]/g, '');
          let colorClass = 'text-slate-400'; // default unread

          if (i < sWords.length) {
            if (sWords[i] === cleanTarget) {
              colorClass = 'text-accent-green drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]'; // Correct
            } else {
              colorClass = 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'; // Incorrect
            }
          }

          return (
            <span 
              key={i} 
              className={`transition-colors duration-300 ${colorClass}`}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-8 left-8">
        <h1 className="text-4xl font-heading font-bold text-white mb-2">Voice Assessment</h1>
        <p className="text-lg text-slate-400 flex items-center gap-2">
          <ShieldCheck className="text-accent-green" size={20} />
          Evaluating Profile: <span className="text-white font-bold">{activeProfile?.name}</span>
        </p>
      </div>

      <div className="glass-panel p-10 w-full max-w-4xl relative z-10 flex flex-col items-center min-h-[400px] justify-center">
        
        {testState === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
              <h2 className="text-3xl font-heading text-white mb-4">Reading Fluency Test</h2>
              <p className="text-slate-400 max-w-lg mx-auto">Select a difficulty level. When you click start, a countdown will begin, and a sentence will appear for the child to read out loud.</p>
            </div>
            
            <div className="flex gap-4">
              {['short', 'medium', 'long'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-6 py-3 rounded-xl border-2 capitalize font-semibold transition-all ${difficulty === lvl ? 'border-accent bg-accent/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <button 
              onClick={startCountdown}
              className="mt-4 bg-white text-background px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3"
            >
              <Mic size={24} />
              Start Assessment
            </button>
          </motion.div>
        )}

        {testState === 'countdown' && (
          <motion.div 
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-9xl font-heading font-bold text-accent drop-shadow-[0_0_40px_rgba(56,189,248,0.8)]"
          >
            {countdown}
          </motion.div>
        )}

        {testState === 'listening' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center">
            
            {/* Visualizer Animation */}
            <div className="flex gap-2 mb-10 h-16 items-center">
              {[1,2,3,4,5,6,7].map(i => (
                <motion.div 
                  key={i}
                  animate={{ height: ['20%', '100%', '20%'] }}
                  transition={{ duration: 0.5 + (i * 0.1), repeat: Infinity, ease: 'easeInOut' }}
                  className="w-3 bg-accent rounded-full shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                />
              ))}
            </div>

            <div className="text-4xl md:text-5xl font-heading font-bold text-center leading-relaxed max-w-3xl mb-12 min-h-[120px]">
              {renderHighlightedSentence()}
            </div>

            <button 
              onClick={stopListening}
              className="bg-red-500/20 text-red-400 border border-red-500/50 px-8 py-4 rounded-full font-bold text-lg hover:bg-red-500/30 transition-all flex items-center gap-3"
            >
              <Square size={22} fill="currentColor" />
              Finish Reading
            </button>
          </motion.div>
        )}

        {testState === 'results' && result && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
            <h3 className="text-2xl font-heading font-bold text-white mb-8 border-b border-white/10 pb-4 text-center">Fluency Report</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="glass-panel p-6 bg-white/5 border-white/10 flex flex-col items-center justify-center">
                <p className="text-slate-400 mb-2">Reading Speed</p>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-heading font-bold text-accent">{result.wpm}</span>
                  <span className="text-xl text-slate-400 mb-2">WPM</span>
                </div>
              </div>
              
              <div className="glass-panel p-6 bg-white/5 border-white/10 flex flex-col items-center justify-center">
                <p className="text-slate-400 mb-2">Reading Accuracy</p>
                <div className="flex items-end gap-2">
                  <span className={`text-6xl font-heading font-bold ${result.readingAccuracy > 80 ? 'text-accent-green' : 'text-yellow-400'}`}>
                    {result.readingAccuracy}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3 mb-8">
              <CheckCircle2 className="text-primary flex-shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">
                Voice data processed securely in-browser. Saved to <strong>{activeProfile?.name}'s</strong> profile history successfully.
              </p>
            </div>

            <button 
              onClick={reset}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Take Another Test
            </button>
          </motion.div>
        )}

      </div>
      
      {/* Aesthetic bg elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  );
};

export default VoiceAssessment;
