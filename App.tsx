
import React, { useState, useEffect } from 'react';
import { Machine, MachineStatus, MachineType } from './types';
import { INITIAL_MACHINES } from './constants';
import MachineCard from './components/MachineCard';

type Page = 'HOME' | 'AVAILABILITY' | 'CONFIRM_BOOKING' | 'USER_GUIDE' | 'SUCCESS' | 'TIMER_VIEW' | 'THANK_YOU';

interface ActiveBooking {
  machineId: string;
  machineName: string;
  type: MachineType;
  startTime: number;
  durationMinutes: number;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('HOME');
  const [activeType, setActiveType] = useState<MachineType>(MachineType.WASHER);
  const [machines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(() => {
    const saved = localStorage.getItem('activeBooking');
    return saved ? JSON.parse(saved) : null;
  });
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Persistence
  const [machineIcons, setMachineIcons] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('machineIconsMap');
    return saved ? JSON.parse(saved) : {};
  });
  const [washerAvailIcon, setWasherAvailIcon] = useState<string | null>(localStorage.getItem('washerAvailIcon'));
  const [washerUnavailIcon, setWasherUnavailIcon] = useState<string | null>(localStorage.getItem('washerUnavailIcon'));
  const [dryerAvailIcon, setDryerAvailIcon] = useState<string | null>(localStorage.getItem('dryerAvailIcon'));
  const [dryerUnavailIcon, setDryerUnavailIcon] = useState<string | null>(localStorage.getItem('dryerUnavailIcon'));
  const [appLogo, setAppLogo] = useState<string | null>(localStorage.getItem('appLogo'));
  const [washerImg, setWasherImg] = useState<string | null>(localStorage.getItem('washerImg'));
  const [dryerImg, setDryerImg] = useState<string | null>(localStorage.getItem('dryerImg'));
  const [guideImg, setGuideImg] = useState<string | null>(localStorage.getItem('guideImg'));

  // Guide Images
  const [tokenImages, setTokenImages] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem('tokenImages');
    return saved ? JSON.parse(saved) : [null, null];
  });
  const [washerGuideImages, setWasherGuideImages] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem('washerGuideImages');
    return saved ? JSON.parse(saved) : [null, null, null, null];
  });
  const [dryerGuideImages, setDryerGuideImages] = useState<(string | null)[]>(() => {
    const saved = localStorage.getItem('dryerGuideImages');
    return saved ? JSON.parse(saved) : [null, null, null];
  });

  // Timer logic
  useEffect(() => {
    let interval: number | null = null;
    if (activeBooking) {
      const updateTimer = () => {
        const now = Date.now();
        const endTime = activeBooking.startTime + (activeBooking.durationMinutes * 60 * 1000);
        const diffMs = endTime - now;
        
        if (diffMs <= 0) {
          setTimeLeft(0);
          setActiveBooking(null);
          localStorage.removeItem('activeBooking');
          setCurrentPage('THANK_YOU');
          if (interval) clearInterval(interval);
        } else {
          setTimeLeft(Math.floor(diffMs / 1000));
        }
      };
      
      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [activeBooking]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void, storageKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setter(base64);
        localStorage.setItem(storageKey, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMachineIconUpload = (machineId: string, base64: string) => {
    const updated = { ...machineIcons, [machineId]: base64 };
    setMachineIcons(updated);
    localStorage.setItem('machineIconsMap', JSON.stringify(updated));
  };

  const handleGuideImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number, type: 'token' | 'washer' | 'dryer') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'token') {
          const newList = [...tokenImages]; newList[index] = base64;
          setTokenImages(newList); localStorage.setItem('tokenImages', JSON.stringify(newList));
        } else if (type === 'washer') {
          const newList = [...washerGuideImages]; newList[index] = base64;
          setWasherGuideImages(newList); localStorage.setItem('washerGuideImages', JSON.stringify(newList));
        } else if (type === 'dryer') {
          const newList = [...dryerGuideImages]; newList[index] = base64;
          setDryerGuideImages(newList); localStorage.setItem('dryerGuideImages', JSON.stringify(newList));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmBooking = () => {
    if (!selectedMachine) return;
    const duration = selectedMachine.type === MachineType.WASHER ? 35 : 45;
    const newBooking = {
      machineId: selectedMachine.id,
      machineName: selectedMachine.name,
      type: selectedMachine.type,
      startTime: Date.now(),
      durationMinutes: duration
    };
    setActiveBooking(newBooking);
    localStorage.setItem('activeBooking', JSON.stringify(newBooking));
    setCurrentPage('SUCCESS');
  };

  // Fixed Navigation Header (Inside the app container)
  const NavigationHeader = ({ onBack }: { onBack?: () => void }) => (
    <div className="absolute top-0 left-0 right-0 h-24 flex items-center justify-between px-6 z-[200] pointer-events-none">
      <div className="flex items-center pointer-events-auto">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full border border-blue-100 shadow-lg flex items-center justify-center hover:bg-white active:scale-90 transition-all text-blue-500 duration-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      <button 
        onClick={() => setCurrentPage('HOME')}
        className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full border border-blue-100 shadow-lg flex items-center justify-center hover:bg-white active:scale-90 transition-all text-blue-500 pointer-events-auto duration-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col h-full relative overflow-hidden bg-[#F8FAFF]">
      <div className="flex-1 overflow-y-auto px-8 py-16 animate-in fade-in slide-in-from-bottom-6 duration-700 scrollbar-hide">
        <div className="flex flex-col items-center mb-16 space-y-8">
          <label className="cursor-pointer relative group">
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setAppLogo, 'appLogo')} />
            {appLogo ? (
              <div className="relative">
                <img src={appLogo} alt="Logo" className="w-28 h-28 object-contain rounded-[40px] shadow-2xl border-4 border-white transition group-hover:scale-105" />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 bg-white/70 backdrop-blur-md border-2 border-dashed border-blue-200 rounded-[40px] flex flex-col items-center justify-center text-blue-300 group-hover:border-blue-400 group-hover:text-blue-400 transition-all">
                <svg className="w-7 h-7 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Logo</span>
              </div>
            )}
          </label>
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Cempaka Laundry</h1>
            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-[0.4em]">Dormitory Elite</p>
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          {[
            { label: 'WASHER', sub: 'HYGIENIC CLEAN', type: MachineType.WASHER, img: washerImg, setter: setWasherImg, key: 'washerImg' },
            { label: 'DRYER', sub: 'RAPID DRY', type: MachineType.DRYER, img: dryerImg, setter: setDryerImg, key: 'dryerImg' },
            { label: 'GUIDE', sub: 'STEP BY STEP', page: 'USER_GUIDE' as Page, img: guideImg, setter: setGuideImg, key: 'guideImg' }
          ].map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="bg-white rounded-[38px] p-7 shadow-xl shadow-blue-900/5 border border-white/80 flex items-center justify-between min-h-[150px] transition-all duration-300 group-hover:bg-blue-50/20 group-hover:border-blue-100">
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-blue-500 uppercase">{item.label}</h2>
                    <p className="text-[9px] font-bold text-blue-300 tracking-[0.2em] uppercase mt-0.5">{item.sub}</p>
                  </div>
                  <button 
                    onClick={() => { if (item.type) { setActiveType(item.type); setCurrentPage('AVAILABILITY'); } else if (item.page) setCurrentPage(item.page); }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-2xl text-[10px] font-black tracking-[0.15em] shadow-lg shadow-blue-200/50 uppercase active:scale-95 transition-all"
                  >
                    SELECT {item.label}
                  </button>
                </div>
                <label className="cursor-pointer relative z-10 w-24 h-24 ml-4 shrink-0">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, item.setter, item.key)} />
                  {item.img ? (
                    <img src={item.img} className="w-full h-full object-cover rounded-[28px] shadow-sm border-2 border-white transition group-hover:scale-105" alt={item.label} />
                  ) : (
                    <div className="w-full h-full bg-blue-50 rounded-[28px] flex flex-col items-center justify-center text-blue-200 border-2 border-dashed border-blue-100">
                      <span className="text-[8px] font-bold uppercase tracking-widest">PHOTO</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          ))}
        </div>

        {activeBooking && (
          <button 
            onClick={() => setCurrentPage('TIMER_VIEW')}
            className="mt-10 w-full p-7 bg-blue-500 text-white rounded-[35px] shadow-2xl shadow-blue-200 flex justify-between items-center transition-all active:scale-95 animate-pulse"
          >
            <div className="space-y-0.5 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-200">IN PROGRESS</p>
              <p className="text-lg font-black tracking-tight">{activeBooking.machineName}</p>
            </div>
            <div className="bg-white/20 px-5 py-2.5 rounded-xl text-lg font-black backdrop-blur-xl border border-white/20">
              {formatTime(timeLeft)}
            </div>
          </button>
        )}

        <footer className="mt-20 text-center pb-8 opacity-20">
          <p className="text-blue-500 font-black text-[8px] uppercase tracking-[0.6em]">CEMPAKA TECH v1.7</p>
        </footer>
      </div>
    </div>
  );

  const renderAvailability = () => {
    const statusAvail = activeType === MachineType.WASHER ? washerAvailIcon : dryerAvailIcon;
    const statusUnavail = activeType === MachineType.WASHER ? washerUnavailIcon : dryerUnavailIcon;

    return (
      <div className="flex flex-col h-full bg-[#FBFDFF] relative overflow-hidden">
        <NavigationHeader onBack={() => setCurrentPage('HOME')} />
        
        <div className="flex-1 overflow-y-auto px-6 pt-24 pb-32 scrollbar-hide animate-in fade-in duration-500">
          <div className="flex flex-col space-y-6 mb-8 mt-2">
            <h1 className="text-3xl font-black text-slate-800 leading-tight">
              Pick your <br/>
              <span className="text-blue-500">{activeType}</span>
            </h1>
            
            <div className="flex items-center space-x-4">
              {[
                { label: 'READY', color: 'emerald', icon: statusAvail, key: activeType === MachineType.WASHER ? 'washerAvailIcon' : 'dryerAvailIcon', setter: activeType === MachineType.WASHER ? setWasherAvailIcon : setDryerAvailIcon },
                { label: 'BUSY', color: 'rose', icon: statusUnavail, key: activeType === MachineType.WASHER ? 'washerUnavailIcon' : 'dryerUnavailIcon', setter: activeType === MachineType.WASHER ? setWasherUnavailIcon : setDryerUnavailIcon }
              ].map((btn, i) => (
                <div key={i} className="flex flex-col items-center space-y-1.5">
                  <label className="cursor-pointer group relative w-14 h-14">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, btn.setter, btn.key)} />
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-blue-100 shadow-sm group-hover:border-blue-300 transition-all">
                      {btn.icon ? (
                        <img src={btn.icon} className="w-full h-full object-cover" alt="icon" />
                      ) : (
                        <div className={`w-2.5 h-2.5 rounded-full bg-${btn.color}-500`}></div>
                      )}
                    </div>
                  </label>
                  <span className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em]">{btn.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {machines.filter(m => m.type === activeType).map(machine => {
              const machinePhoto = machineIcons[machine.id] || (machine.status === MachineStatus.AVAILABLE ? statusAvail : statusUnavail);
              return (
                <MachineCard 
                  key={machine.id} 
                  machine={machine} 
                  customIcon={machinePhoto}
                  onIconUpload={handleMachineIconUpload}
                  onBook={(m) => { setSelectedMachine(m); setCurrentPage('CONFIRM_BOOKING'); }} 
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderConfirm = () => (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <NavigationHeader onBack={() => setCurrentPage('AVAILABILITY')} />
      
      <div className="flex-1 overflow-y-auto px-8 pt-24 pb-20 flex flex-col justify-center animate-in zoom-in-95 duration-500">
        <div className="bg-blue-50/30 rounded-[45px] p-10 border border-blue-50/50 space-y-8 text-center">
            <div className={`mx-auto w-28 h-28 rounded-[32px] flex items-center justify-center shadow-lg overflow-hidden border-4 border-white bg-white text-blue-500`}>
              {(machineIcons[selectedMachine?.id || ''] || (selectedMachine?.status === MachineStatus.AVAILABLE ? (selectedMachine?.type === MachineType.WASHER ? washerAvailIcon : dryerAvailIcon) : (selectedMachine?.type === MachineType.WASHER ? washerUnavailIcon : dryerUnavailIcon))) ? (
                <img src={machineIcons[selectedMachine?.id || ''] || (selectedMachine?.status === MachineStatus.AVAILABLE ? (selectedMachine?.type === MachineType.WASHER ? washerAvailIcon : dryerAvailIcon) : (selectedMachine?.type === MachineType.WASHER ? washerUnavailIcon : dryerUnavailIcon))!} className="w-full h-full object-cover" alt="selected" />
              ) : (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800">Confirm Cycle</h2>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em]">Cempaka Premium Service</p>
            </div>

          <div className="space-y-5 px-2">
            {[
              { label: 'DEVICE', val: selectedMachine?.name },
              { label: 'EST. TIME', val: `${selectedMachine?.type === MachineType.WASHER ? '35' : '45'} MIN`, color: 'text-blue-500' }
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center border-b border-blue-100/50 pb-3.5">
                <span className="text-blue-300 font-black uppercase text-[8px] tracking-widest">{row.label}</span>
                <span className={`text-base font-black text-slate-700 ${row.color || ''}`}>{row.val}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={confirmBooking}
            className="w-full py-6 bg-blue-500 text-white rounded-[28px] font-black text-base tracking-widest shadow-xl shadow-blue-200/50 active:scale-95 transition-all"
          >
            START NOW
          </button>
        </div>
      </div>
    </div>
  );

  const renderTimerView = () => (
    <div className="flex flex-col h-full bg-[#FBFDFF] relative overflow-hidden">
      <NavigationHeader onBack={() => setCurrentPage('HOME')} />
      
      <div className="flex-1 overflow-y-auto px-8 pt-24 pb-20 flex flex-col items-center justify-center space-y-16 animate-in fade-in duration-700">
        
        {/* Simplified Digital Timer Display */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="relative">
             {/* Soft background pulse */}
             <div className="absolute inset-0 bg-blue-100/30 blur-3xl rounded-full scale-150 animate-pulse"></div>
             <div className="relative flex flex-col items-center justify-center bg-white w-56 h-56 rounded-full shadow-2xl border-4 border-white shadow-blue-100">
                <span className="text-6xl font-black tracking-tighter text-slate-800 tabular-nums leading-none">
                  {formatTime(timeLeft)}
                </span>
                <p className="text-blue-400 font-black tracking-[0.5em] text-[10px] mt-4 uppercase opacity-80">MIN REMAINING</p>
             </div>
          </div>
        </div>
        
        <div className="text-center space-y-6 w-full max-w-[280px]">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em]">ACTIVE SESSION</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{activeBooking?.machineName}</h3>
          </div>
          
          <div className="flex items-center justify-center space-x-3 px-6 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/30">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <p className="text-blue-500 font-black tracking-[0.3em] text-[9px] uppercase">OPERATING NORMALLY</p>
          </div>
        </div>

        <button 
          onClick={() => setCurrentPage('HOME')}
          className="w-full py-5 bg-white rounded-[28px] border border-blue-100 text-blue-500 font-black text-[10px] tracking-widest uppercase shadow-sm hover:bg-blue-50/50 transition-all active:scale-95 duration-200"
        >
          GO BACK
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col h-full bg-white relative overflow-hidden items-center justify-center p-10 text-center">
      <div className="w-28 h-28 bg-emerald-50 rounded-full flex items-center justify-center mb-10 shadow-inner border-4 border-white">
        <svg className="w-14 h-14 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-3xl font-black text-slate-800 mb-3">Cycle Locked!</h2>
      <p className="text-blue-400 font-black text-[10px] mb-12 uppercase tracking-[0.25em] leading-relaxed">Everything is set.<br/>We'll keep track of the time.</p>
      <button 
        onClick={() => setCurrentPage('TIMER_VIEW')} 
        className="w-full py-6 bg-blue-500 text-white rounded-[28px] font-black tracking-widest text-sm shadow-xl shadow-blue-200/50 active:scale-95"
      >
        TRACK LIVE
      </button>
    </div>
  );

  const renderThankYou = () => (
    <div className="flex flex-col h-full bg-blue-500 items-center justify-center p-12 text-center text-white">
      <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-md">
        <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-4xl font-black mb-5 tracking-tight">Complete!</h2>
      <p className="text-blue-100 font-black text-[10px] mb-14 uppercase tracking-[0.4em] leading-loose">Your laundry is fresh & ready.<br/>Collect within 15 mins.</p>
      <button 
        onClick={() => setCurrentPage('HOME')} 
        className="w-full py-6 bg-white text-blue-500 rounded-[30px] font-black text-base tracking-widest shadow-2xl active:scale-95 transition-all"
      >
        DASHBOARD
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-full bg-white shadow-2xl overflow-hidden relative border-x border-slate-100 flex flex-col scrollbar-hide">
      {currentPage === 'HOME' && renderHome()}
      {currentPage === 'AVAILABILITY' && renderAvailability()}
      {currentPage === 'CONFIRM_BOOKING' && renderConfirm()}
      {currentPage === 'SUCCESS' && renderSuccess()}
      {currentPage === 'TIMER_VIEW' && renderTimerView()}
      {currentPage === 'THANK_YOU' && renderThankYou()}
      {currentPage === 'USER_GUIDE' && (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
          <NavigationHeader onBack={() => setCurrentPage('HOME')} />
          <div className="flex-1 overflow-y-auto px-6 pt-24 pb-24 scrollbar-hide animate-in slide-in-from-right duration-700">
            <h1 className="text-3xl font-black text-slate-800 mb-12 mt-4 leading-tight">Step-by-Step<br/>Manual</h1>
            
            <div className="space-y-16">
              {[
                { title: 'Tokens & Payment', images: tokenImages, type: 'token' },
                { title: 'Washer Operations', images: washerGuideImages, type: 'washer' },
                { title: 'Dryer Operations', images: dryerGuideImages, type: 'dryer' }
              ].map((sec, idx) => (
                <section key={idx} className="space-y-10">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-black text-blue-500 tracking-tight shrink-0">{sec.title}</h3>
                    <div className="h-0.5 flex-1 bg-blue-50 rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-12">
                    {sec.images.map((src, i) => (
                      <div key={i} className="flex flex-col space-y-6">
                        <label className="cursor-pointer group relative block w-full overflow-hidden rounded-[40px] shadow-2xl border-4 border-white transition-all hover:translate-y-[-4px]">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleGuideImageUpload(e, i, sec.type as any)} />
                          {src ? (
                            <img src={src} className="w-full h-auto block object-contain bg-slate-50" alt="Manual Step" />
                          ) : (
                            <div className="w-full aspect-video bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[32px] flex flex-col items-center justify-center text-blue-200 p-10 text-center">
                              <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upload Guide Image</span>
                              <p className="text-[8px] font-bold mt-2 opacity-60">Large high-quality photos recommended</p>
                            </div>
                          )}
                        </label>
                        
                        <div className="flex flex-col items-center space-y-2">
                           <div className="w-10 h-1 bg-blue-500/10 rounded-full"></div>
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] text-center">STEP {i+1} OF {sec.images.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
