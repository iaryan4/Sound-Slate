import React from 'react';
import { Activity, TrendingUp, Calendar, ArrowRight, BrainCircuit, Camera, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const Progress = ({ activeProfile }) => {
  const history = activeProfile?.history || [];
  
  // Filter history by type
  const voiceHistory = history.filter(h => h.type === 'Voice Fluency');
  
  // Format chart data (Voice Only for WPM chart)
  const chartData = voiceHistory.map(a => a.wpm);
  const chartDates = voiceHistory.map(a => {
    const d = new Date(a.date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });

  // Calculate simulated micro-skills based on history
  const latestVoice = voiceHistory[voiceHistory.length - 1];
  const visualHistory = history.filter(h => h.type === 'Visual Scan');
  const latestVisual = visualHistory[visualHistory.length - 1];

  const phonemeScore = latestVoice ? latestVoice.readingAccuracy : 0;
  const spatialScore = latestVisual ? (100 - latestVisual.score) : 0; // Invert risk for "skill" score

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 h-full flex flex-col gap-8 overflow-y-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Progress Tracking</h1>
          <p className="text-lg text-slate-400">Detailed historical data for {activeProfile?.name}.</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
          <Calendar className="text-accent" size={20} />
          <span className="text-white font-medium">All Time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Historical Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-2xl font-heading font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="text-accent-green" />
            Reading Fluency Timeline (WPM)
          </h2>
          <div className="h-64 rounded-xl border border-white/5 bg-white/5 flex items-end justify-around p-6 gap-2 relative">
            {voiceHistory.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-heading">
                <p className="text-xl mb-2">No Voice Data Available.</p>
                <p className="text-sm">Complete a Voice Assessment to generate reading fluency timeline.</p>
              </div>
            ) : (
              chartData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                  <div 
                    className="w-full max-w-[20px] bg-gradient-to-t from-accent to-accent-purple rounded-full transition-all duration-500 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                    style={{ height: `${(val / 150) * 100}%` }}
                  ></div>
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-white/10 px-2 py-1 rounded text-xs text-white transition-opacity whitespace-nowrap z-10">
                    {val} wpm
                  </div>
                </div>
              ))
            )}
          </div>
          {voiceHistory.length > 0 && (
            <div className="flex justify-around mt-4 text-sm text-slate-400 px-2">
              {chartDates.map((date, i) => <span key={i}>{date}</span>)}
            </div>
          )}
        </div>

        {/* Micro-skills breakdown */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-heading font-semibold text-white flex items-center gap-2">
            <BrainCircuit className="text-accent" />
            Micro-Skills
          </h2>
          
          {history.length === 0 ? (
            <p className="text-slate-500 mt-4">Awaiting data...</p>
          ) : (
            <>
              {latestVoice ? (
                <>
                  <SkillBar title="Phoneme Accuracy" value={phonemeScore} color={phonemeScore > 80 ? 'accent-green' : 'yellow-400'} />
                  <SkillBar title="Word Recognition" value={Math.min(phonemeScore + 5, 100)} color="accent-purple" />
                </>
              ) : (
                <p className="text-slate-500 text-sm italic mb-2">Complete voice test for reading skills.</p>
              )}
              
              {latestVisual ? (
                <SkillBar title="Visual Spatial (Handwriting)" value={spatialScore} color={spatialScore > 65 ? 'primary' : 'yellow-400'} />
              ) : (
                <p className="text-slate-500 text-sm italic mt-2">Complete visual scan for spatial skills.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recent History List */}
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-heading font-semibold text-white mb-6">Recent Assessments</h2>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No assessment history found.</p>
          ) : (
            // Reverse array to show newest first
            [...history].reverse().map(assessment => {
              const isVoice = assessment.type === 'Voice Fluency';
              const isLowRisk = assessment.riskLevel === 'Low Risk' || assessment.riskLevel === 'Fluent';
              const scoreDisplay = isVoice 
                ? `${assessment.wpm} WPM (${assessment.readingAccuracy}% Acc)`
                : `${assessment.riskLevel} (${assessment.score}% Risk)`;
                
              return (
                <HistoryItem 
                  key={assessment.id}
                  date={assessment.date} 
                  type={assessment.type} 
                  score={scoreDisplay} 
                  trend={isLowRisk ? 'positive' : 'negative'} 
                  isVoice={isVoice}
                />
              )
            })
          )}
        </div>
      </div>

    </motion.div>
  );
};

const SkillBar = ({ title, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="text-slate-300 font-medium">{title}</span>
      <span className={`text-${color === 'yellow-400' ? 'yellow-400' : color} font-bold`}>{value}%</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`h-full ${color === 'yellow-400' ? 'bg-yellow-400' : `bg-${color}`}`}
      >
        <div className={`h-full w-full bg-gradient-to-r from-transparent to-white/30`}></div>
      </motion.div>
    </div>
  </div>
);

const HistoryItem = ({ date, type, score, trend, isVoice }) => {
  const isPos = trend === 'positive';
  const isNeg = trend === 'negative';
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${isVoice ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
          {isVoice ? <Mic size={20} /> : <Camera size={20} />}
        </div>
        <div>
          <h4 className="text-white font-medium">{type}</h4>
          <p className="text-sm text-slate-400">{date}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`font-semibold ${isPos ? 'text-accent-green' : isNeg ? 'text-yellow-400' : 'text-slate-300'}`}>
          {score}
        </span>
        <ArrowRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
      </div>
    </div>
  );
};

export default Progress;
