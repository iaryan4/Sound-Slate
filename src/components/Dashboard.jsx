import React from 'react';
import { Activity, Target, BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = ({ setActiveTab, activeProfile }) => {
  const history = activeProfile?.history || [];
  
  // Filter history by type
  const voiceHistory = history.filter(h => h.type === 'Voice Fluency');
  const visualHistory = history.filter(h => h.type === 'Visual Scan');

  // Calculate dynamic stats
  const latestVoice = voiceHistory[voiceHistory.length - 1];
  const prevVoice = voiceHistory.length > 1 ? voiceHistory[voiceHistory.length - 2] : null;
  const latestVisual = visualHistory[visualHistory.length - 1];

  const currentWpm = latestVoice?.wpm || null;
  const prevWpm = prevVoice?.wpm || null;
  const wpmTrend = (currentWpm && prevWpm) ? Math.round(((currentWpm - prevWpm) / prevWpm) * 100) : 0;
  
  const currentRisk = latestVisual?.score || null;
  const riskLabel = latestVisual?.riskLevel || 'No Data';

  // Format chart data (last 7 voice assessments max)
  const voiceChartData = voiceHistory.slice(-7).map(a => a.wpm);
  const voiceChartDates = voiceHistory.slice(-7).map(a => {
    const d = new Date(a.date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });

  // Format chart data (last 7 visual assessments max)
  const visualChartData = visualHistory.slice(-7).map(a => a.score);
  const visualChartDates = visualHistory.slice(-7).map(a => {
    const d = new Date(a.date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 h-full flex flex-col gap-8 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-lg text-slate-400">Here's {activeProfile?.name}'s weekly progress overview.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('visual-assessment')}
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            Visual Scan
          </button>
          <button 
            onClick={() => setActiveTab('voice-assessment')}
            className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center gap-2 transform hover:-translate-y-1"
          >
            Voice Test
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Reading Speed" 
          value={currentWpm ? `${currentWpm} WPM` : '--'} 
          icon={Activity} 
          trend={wpmTrend ? `${wpmTrend > 0 ? '+' : ''}${wpmTrend}%` : 'Baseline'} 
          color="accent" 
        />
        <StatCard 
          title="Reading Accuracy" 
          value={latestVoice ? `${latestVoice.readingAccuracy}%` : "--"} 
          icon={Target} 
          trend={latestVoice?.riskLevel || "No Voice Data"} 
          color="accent-green" 
        />
        <StatCard 
          title="Total Assessments" 
          value={history.length.toString()} 
          icon={BrainCircuit} 
          trend="All Types" 
          color="accent-purple" 
        />
        <StatCard 
          title="Visual Risk Level" 
          value={riskLabel} 
          icon={TrendingUp} 
          trend={currentRisk ? `${currentRisk}% Risk` : '--'} 
          color={currentRisk && currentRisk > 35 ? 'yellow-400' : 'primary'} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Chart 1: Reading Speed */}
          <div className="glass-panel p-6 flex flex-col flex-1 min-h-[250px]">
            <h2 className="text-xl font-heading font-semibold text-white mb-4">Reading Fluency (WPM)</h2>
            <div className="flex-1 rounded-2xl border border-white/5 bg-white/5 flex items-end justify-around p-6 gap-4 relative">
              {voiceHistory.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <p className="font-heading text-lg mb-1">No Voice Data</p>
                </div>
              ) : (
                voiceChartData.map((h, i) => (
                  <div key={i} className="w-full relative group flex flex-col justify-end items-center h-full">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500 group-hover:opacity-80 max-w-[40px]" 
                      style={{ height: `${(h / 150) * 100}%` }}
                    ></div>
                    <div className="text-center mt-2 text-slate-400 text-xs w-full">
                      {voiceChartDates[i]}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-white/10 px-2 py-1 rounded text-xs text-white transition-opacity">
                      {h} WPM
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chart 2: Dyslexia Risk */}
          <div className="glass-panel p-6 flex flex-col flex-1 min-h-[250px]">
            <h2 className="text-xl font-heading font-semibold text-white mb-4">Dyslexia Risk Level (%)</h2>
            <div className="flex-1 rounded-2xl border border-white/5 bg-white/5 flex items-end justify-around p-6 gap-4 relative">
              {visualHistory.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <p className="font-heading text-lg mb-1">No Visual Scan Data</p>
                </div>
              ) : (
                visualChartData.map((h, i) => (
                  <div key={i} className="w-full relative group flex flex-col justify-end items-center h-full">
                    <div 
                      className={`w-full bg-gradient-to-t ${h > 35 ? 'from-yellow-500 to-yellow-300' : 'from-accent-green to-emerald-400'} rounded-t-lg transition-all duration-500 group-hover:opacity-80 max-w-[40px]`}
                      style={{ height: `${Math.max(h, 5)}%` }}
                    ></div>
                    <div className="text-center mt-2 text-slate-400 text-xs w-full">
                      {visualChartDates[i]}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-white/10 px-2 py-1 rounded text-xs text-white transition-opacity">
                      {h}% Risk
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* AI Insights Panel */}
        <div className="glass-panel p-6 flex flex-col">
          <h2 className="text-2xl font-heading font-semibold text-white mb-6 flex items-center gap-3">
            <BrainCircuit className="text-accent" />
            AI Insights
          </h2>
          <div className="flex-1 space-y-4">
            {history.length === 0 ? (
              <p className="text-slate-500 text-center mt-10">Take an assessment to unlock insights.</p>
            ) : (
              <>
                {latestVoice && (
                  <InsightItem 
                    icon={TrendingUp} 
                    title="Reading Accuracy" 
                    desc={`${activeProfile.name} scored ${latestVoice.readingAccuracy}% accuracy on the latest reading test.`}
                    color={latestVoice.readingAccuracy > 80 ? "text-accent-green" : "text-yellow-400"}
                    bg={latestVoice.readingAccuracy > 80 ? "bg-accent-green/10" : "bg-yellow-400/10"}
                  />
                )}
                {latestVisual && (
                  <InsightItem 
                    icon={AlertTriangle} 
                    title="Visual Scan Risk" 
                    desc={`The latest offline handwriting scan indicates a ${riskLabel.toLowerCase()}.`}
                    color={currentRisk > 35 ? "text-yellow-400" : "text-primary"}
                    bg={currentRisk > 35 ? "bg-yellow-400/10" : "bg-primary/10"}
                  />
                )}
                {wpmTrend !== 0 && (
                  <InsightItem 
                    icon={Activity} 
                    title="Speed Trend" 
                    desc={wpmTrend > 0 ? `WPM has improved by ${wpmTrend}% since last reading!` : `WPM dropped by ${Math.abs(wpmTrend)}%. More reading practice recommended.`}
                    color={wpmTrend > 0 ? "text-accent" : "text-slate-400"}
                    bg={wpmTrend > 0 ? "bg-accent/10" : "bg-white/5"}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  const isYellow = color === 'yellow-400';
  return (
    <div className="glass-panel p-6 relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all ${isYellow ? 'bg-yellow-400/10 group-hover:bg-yellow-400/20' : `bg-${color}/10 group-hover:bg-${color}/20`}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${isYellow ? 'bg-yellow-400/10 border-yellow-400/20' : `bg-${color}/10 border-${color}/20`}`}>
          <Icon className={`text-xl ${isYellow ? 'text-yellow-400' : `text-${color}`}`} />
        </div>
        <span className={`text-sm font-semibold ${trend.includes('+') || trend === 'Low Risk' || trend === 'Fluent' ? 'text-accent-green' : trend.includes('-') || trend === 'Moderate Risk' || trend === 'Needs Practice' ? 'text-yellow-400' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-slate-400 text-lg mb-1">{title}</h3>
      <p className="text-3xl font-heading font-bold text-white">{value}</p>
    </div>
  );
};

const InsightItem = ({ icon: Icon, title, desc, color, bg }) => (
  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`${color} text-sm`} />
      </div>
      <h4 className="text-white font-medium">{title}</h4>
    </div>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default Dashboard;
