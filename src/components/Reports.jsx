import React from 'react';
import { FileText, Download, Share2, Filter, FileBarChart, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = ({ activeProfile }) => {
  const history = activeProfile?.history || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 h-full flex flex-col gap-8 overflow-y-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Generated Reports</h1>
          <p className="text-lg text-slate-400">Download and share clinical-style assessment summaries for {activeProfile?.name}.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 text-white transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="w-full md:w-auto bg-gradient-to-r from-primary to-accent text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:scale-105 transition-transform">
            <FileBarChart size={18} /> Generate Custom Report
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center glass-panel">
          <FileText size={48} className="text-slate-600 mb-4" />
          <h2 className="text-2xl text-slate-400 font-heading">No Reports Available</h2>
          <p className="text-slate-500 mt-2">Take an AI Assessment to generate your first offline report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {[...history].reverse().map(assessment => (
            <ReportCard 
              key={assessment.id}
              title={`Offline ${assessment.type}`} 
              date={assessment.date} 
              desc={`Automatically generated report from local inference. Detected risk level: ${assessment.riskLevel} (${assessment.score}%). WPM recorded: ${assessment.wpm}.`}
              tags={['Risk Analysis', assessment.type.includes('Scan') ? 'Vision' : 'Audio']}
              iconColor={assessment.riskLevel === 'Low Risk' ? 'accent-green' : 'yellow-400'}
            />
          ))}
        </div>
      )}

      {/* Sharing Panel */}
      <div className="glass-panel p-6 md:p-8 mt-auto flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <Share2 className="text-accent w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-1">Share with Specialists</h3>
            <p className="text-slate-400 max-w-md">Securely generate a temporary link to share specific reports with clinical psychologists or teachers.</p>
          </div>
        </div>
        <button className="w-full md:w-auto bg-white text-background font-bold px-8 py-3 rounded-xl hover:bg-slate-200 transition-colors">
          Create Secure Link
        </button>
      </div>

    </motion.div>
  );
};

const ReportCard = ({ title, date, desc, tags, iconColor }) => (
  <div className="glass-panel p-6 flex flex-col group hover:border-white/20 transition-all cursor-pointer relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <FileText className={`text-${iconColor === 'yellow-400' ? 'yellow-400' : iconColor}`} size={24} style={{ color: iconColor === 'yellow-400' ? '#facc15' : undefined }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1 leading-tight">{title}</h3>
          <p className="text-sm text-slate-400 flex items-center gap-1">
            <CalendarDays size={14} /> {date}
          </p>
        </div>
      </div>
    </div>
    
    <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1 relative z-10">
      {desc}
    </p>
    
    <div className="flex justify-between items-end relative z-10 border-t border-white/5 pt-4">
      <div className="flex gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5">
            {tag}
          </span>
        ))}
      </div>
      <button className="text-accent hover:text-white transition-colors p-2 bg-accent/10 hover:bg-accent/20 rounded-lg flex items-center gap-2 text-sm font-semibold">
        <Download size={16} /> PDF
      </button>
    </div>
  </div>
);

export default Reports;
