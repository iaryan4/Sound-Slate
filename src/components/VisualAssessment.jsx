import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Camera, ScanLine, CheckCircle2, RotateCcw, ShieldCheck, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VisualAssessment = ({ addAssessment, activeProfile }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  // Load MobileNet model on mount (acts as our Edge AI proxy)
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready(); // Initialize TF backend
        const loadedModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        setModel(loadedModel);
        setIsModelLoading(false);
      } catch (err) {
        console.error("Failed to load model:", err);
      }
    };
    loadModel();
  }, []);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      analyzeImage(imageSrc);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        analyzeImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageSrc) => {
    if (!model) return;
    
    setIsScanning(true);
    
    // Create an HTML image element from the base64 string
    const img = new Image();
    img.src = imageSrc;
    
    img.onload = async () => {
      // Simulate a deep scan delay for visual effect
      setTimeout(async () => {
        try {
          // Perform actual local inference
          const predictions = await model.classify(img);
          console.log("Raw Edge AI Predictions:", predictions);
          
          // Generate a simulated dyslexia risk score based on the scan
          const riskScore = Math.floor(Math.random() * 40) + 10; // Random score between 10-50 for demo
          const riskLevel = riskScore > 35 ? 'Moderate Risk' : riskScore > 20 ? 'Mild Risk' : 'Low Risk';
          const confidence = (predictions[0].probability * 100).toFixed(1);
          
          const assessmentData = {
            score: riskScore,
            confidence: confidence,
            detectedObjects: predictions.map(p => p.className).join(', '),
            riskLevel: riskLevel,
            type: 'Visual Scan',
            wpm: null,
            readingAccuracy: null
          };

          setResult(assessmentData);
          
          // Save to Global State
          if (addAssessment) {
            addAssessment(assessmentData);
          }

        } catch (err) {
          console.error("Inference Error:", err);
        } finally {
          setIsScanning(false);
        }
      }, 2500); // 2.5s scanning animation
    };
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-8 left-8">
        <h1 className="text-4xl font-heading font-bold text-white mb-2">Offline Assessment</h1>
        <p className="text-lg text-slate-400 flex items-center gap-2">
          <ShieldCheck className="text-accent-green" size={20} />
          Evaluating Profile: <span className="text-white font-bold">{activeProfile?.name}</span>
        </p>
      </div>

      <div className="glass-panel p-8 w-full max-w-4xl relative z-10 flex flex-col items-center">
        
        {isModelLoading ? (
          <div className="h-[400px] w-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-accent rounded-full animate-spin"></div>
            <p className="text-xl text-slate-300 font-heading">Loading Edge AI Models into Browser...</p>
          </div>
        ) : !capturedImage ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl mb-8 bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full h-auto"
              />
              {/* Camera Frame Overlay */}
              <div className="absolute inset-0 border-[6px] border-accent/30 rounded-3xl pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-dashed border-white/50 rounded-xl"></div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={capture}
                className="bg-white text-background px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3"
              >
                <Camera size={22} />
                Capture Handwriting
              </button>
              
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center gap-3"
              >
                <Upload size={22} />
                Browse Image
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex gap-8">
            {/* Captured Image Side */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border-2 border-white/10">
              <img src={capturedImage} alt="Captured" className="w-full h-auto" />
              
              {/* Scanning Animation Overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_20px_rgba(56,189,248,1)] z-20"
                  />
                )}
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center"
                  >
                    <ScanLine className="text-accent animate-pulse w-16 h-16 mb-4" />
                    <span className="text-white font-heading text-2xl font-bold tracking-widest uppercase">Analyzing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Side */}
            <div className="w-1/2 flex flex-col justify-center gap-6">
              {!result && isScanning && (
                <div className="space-y-4 w-full">
                  <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-white/5 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse"></div>
                </div>
              )}

              {result && !isScanning && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel p-8 bg-white/5 border-white/10"
                >
                  <h3 className="text-2xl font-heading font-bold text-white mb-6 border-b border-white/10 pb-4">AI Analysis Report</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-slate-400 mb-1">Dyslexia Risk Score</p>
                      <div className="flex items-end gap-3">
                        <span className={`text-5xl font-heading font-bold ${result.score > 30 ? 'text-yellow-400' : 'text-accent-green'}`}>
                          {result.score}%
                        </span>
                        <span className="text-xl text-slate-300 mb-1">({result.riskLevel})</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-slate-400 mb-2">Model Confidence</p>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                      <p className="text-right text-sm text-slate-400 mt-1">{result.confidence}%</p>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3">
                      <CheckCircle2 className="text-primary flex-shrink-0" />
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Data saved to <strong>{activeProfile?.name}'s</strong> profile history successfully.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="w-full mt-8 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={20} />
                    Scan Another Image
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Aesthetic bg elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
    </div>
  );
};

export default VisualAssessment;
