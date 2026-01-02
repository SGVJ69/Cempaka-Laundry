import React from 'react';
import { Machine, MachineStatus, MachineType } from '../types';

interface MachineCardProps {
  machine: Machine;
  onBook: (machine: Machine) => void;
  customIcon?: string | null;
  onIconUpload: (machineId: string, base64: string) => void;
}

const MachineCard: React.FC<MachineCardProps> = ({ machine, onBook, customIcon, onIconUpload }) => {
  const isAvailable = machine.status === MachineStatus.AVAILABLE;
  const isMaintenance = machine.status === MachineStatus.MAINTENANCE;

  const getStatusConfig = () => {
    switch (machine.status) {
      case MachineStatus.AVAILABLE: 
        return { text: 'Available', color: 'text-emerald-600 bg-emerald-50' };
      case MachineStatus.BUSY: 
        return { text: 'In Use', color: 'text-rose-600 bg-rose-50' };
      case MachineStatus.RESERVED: 
        return { text: 'Reserved', color: 'text-blue-600 bg-blue-50' };
      case MachineStatus.MAINTENANCE: 
        return { text: 'Maintenance', color: 'text-amber-600 bg-amber-50' };
      default: 
        return { text: 'Unknown', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onIconUpload(machine.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const config = getStatusConfig();
  const iconBgColor = isAvailable ? 'bg-[#10b981]' : 'bg-[#ef4444]';

  return (
    <div className={`group relative bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 ${isMaintenance ? 'opacity-70 grayscale' : ''}`}>
      <div className="flex justify-between items-center mb-8">
        <label className={`w-24 h-24 rounded-[32px] flex items-center justify-center overflow-hidden cursor-pointer relative shadow-lg transition-all active:scale-95 ${iconBgColor} text-white border-4 border-white`}>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          {customIcon ? (
            <img src={customIcon} className="w-full h-full object-cover" alt="machine" />
          ) : machine.type === MachineType.WASHER ? (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8" />
            </svg>
          ) : (
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
             <div className="bg-white/40 backdrop-blur-md p-3 rounded-full border border-white/50">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
             </div>
          </div>
        </label>
        
        <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${config.color} shadow-sm border border-black/5`}>
          {config.text}
        </span>
      </div>

      <div className="space-y-1.5 ml-1">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{machine.name}</h3>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{machine.type}</p>
      </div>

      <button
        disabled={!isAvailable}
        onClick={() => onBook(machine)}
        className={`mt-10 w-full py-6 rounded-[28px] font-black text-[12px] tracking-[0.25em] uppercase transition-all active:scale-[0.97] ${
          isAvailable 
          ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 hover:bg-black hover:translate-y-[-2px]' 
          : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
        }`}
      >
        {isAvailable ? 'Book Machine' : isMaintenance ? 'Maintenance' : 'In Use'}
      </button>
    </div>
  );
};

export default MachineCard;