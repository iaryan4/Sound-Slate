import React, { useState } from 'react';
import { Home, Activity, Camera, Settings, Bell, FileText, UserPlus, ChevronDown, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab, profiles, activeProfileId, setActiveProfileId, addProfile }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'visual-assessment', icon: Camera, label: 'Visual Scan' },
    { id: 'voice-assessment', icon: Mic, label: 'Voice Test' },
    { id: 'progress', icon: Activity, label: 'Progress' },
    { id: 'reports', icon: FileText, label: 'Reports' },
  ];

  const handleAddChild = () => {
    const name = prompt("Enter child's name:");
    if (name) {
      const age = prompt("Enter child's age:");
      addProfile(name, age || 8);
      setShowProfileMenu(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 md:static md:w-64 md:h-full bg-background md:bg-white/5 border-t md:border-t-0 md:border-r border-white/10 flex flex-row md:flex-col relative z-50 md:z-20 overflow-visible">
      {/* Top Logo Area (Hidden on Mobile) */}
      <div className="hidden md:flex p-6 border-b border-white/10 flex-col items-start justify-center">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-heading font-bold text-xl text-white shadow-lg shadow-primary/30">
            S
          </div>
          <span className="font-heading font-bold text-2xl tracking-wide text-white">SOUNDSLATE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-row md:flex-col gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-8 overflow-x-auto md:overflow-visible no-scrollbar justify-around md:justify-start">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 px-2 md:px-4 py-2 md:py-4 rounded-xl transition-all duration-300 min-w-[64px] md:min-w-0 flex-shrink-0 ${
                isActive
                  ? 'md:bg-gradient-to-r md:from-primary/20 md:to-accent/10 border-transparent md:border-primary/30 text-accent md:text-white md:shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 md:hover:bg-white/5'
              }`}
            >
              <Icon className={isActive ? 'text-accent md:text-accent text-xl md:text-xl' : 'text-xl'} />
              <span className={`text-[10px] md:text-lg font-medium ${isActive ? 'font-bold md:font-medium' : ''}`}>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex flex-col space-y-3 px-4 pb-4">
        <button 
          onClick={() => alert("Notifications module is synced via backend. Locked for Phase 1 offline demo.")}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all font-medium border border-transparent"
        >
          <Bell className="text-xl" />
          Notifications
        </button>
        <button 
          onClick={() => alert("Settings module locked for Phase 1 demo.")}
          className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all font-medium border border-transparent"
        >
          <Settings className="text-xl" />
          Settings
        </button>
      </div>
      
      {/* Bottom Profile Selector (Hidden on mobile for now, to save bottom nav space) */}
      <div className="hidden md:block relative pt-4 border-t border-white/10 px-4 pb-6">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent to-accent-purple p-0.5">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-lg font-bold text-white">
                {activeProfile?.name.charAt(0)}
              </div>
            </div>
            <div className="text-left">
              <p className="text-white font-medium">{activeProfile?.name}</p>
              <p className="text-sm text-slate-400">{activeProfile?.age} Years Old</p>
            </div>
          </div>
          <ChevronDown className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} size={20} />
        </button>

        {/* Profile Dropdown */}
        <AnimatePresence>
          {showProfileMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-4 right-4 mb-2 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              {profiles.map(p => (
                <button 
                  key={p.id}
                  onClick={() => { setActiveProfileId(p.id); setShowProfileMenu(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-white/10 transition-colors ${p.id === activeProfileId ? 'bg-primary/20 text-white' : 'text-slate-300'}`}
                >
                  {p.name}
                </button>
              ))}
              <div className="border-t border-white/10">
                <button 
                  onClick={handleAddChild}
                  className="w-full text-left px-4 py-3 text-accent hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <UserPlus size={18} /> Add Child Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Sidebar;
