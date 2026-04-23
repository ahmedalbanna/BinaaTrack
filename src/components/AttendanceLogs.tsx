import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  ChevronLeft
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { Attendance, Staff, Project } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AttendanceLogs() {
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);

  useEffect(() => {
    const unsubLogs = onSnapshot(query(collection(db, 'attendance'), orderBy('date', 'desc'), limit(50)), (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)));
    });

    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
    });

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    return () => {
      unsubLogs();
      unsubStaff();
      unsubProjects();
    };
  }, []);

  const submitLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newLog = {
      staffId: formData.get('staffId') as string,
      projectId: formData.get('projectId') as string,
      date: formData.get('date') as string,
      hoursWorked: parseFloat(formData.get('hoursWorked') as string),
      overtime: parseFloat(formData.get('overtime') as string || '0'),
      allowance: parseFloat(formData.get('allowance') as string || '0'),
      status: 'approved'
    };

    try {
      await addDoc(collection(db, 'attendance'), newLog);
      setShowLogForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Personnel Deployment</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Attendance & Logs</h2>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-3 border border-white/10 px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all rounded-sm">
             <Filter size={18} /> Protocol Filter
           </button>
           <button 
             onClick={() => setShowLogForm(true)}
             className="flex items-center gap-3 bg-white text-black px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all rounded-sm shadow-xl"
           >
             <Plus size={18} /> Initiate Entry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <StatsBox 
           label="Total Operational Hours (Weekly)" 
           value="1,240" 
           unit="HRS"
           icon={Clock} 
         />
         <StatsBox 
           label="Regional Allowances" 
           value={formatCurrency(450000).split(' ')[0]} 
           unit="YER"
           icon={TrendingUp} 
           accent 
         />
         <StatsBox 
           label="Pending Verifications" 
           value="08" 
           unit="PTS"
           icon={AlertCircle} 
         />
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-white/10">
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Deployment Date</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Asset Identification</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Location Vector</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] text-center">Base</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] text-center">OT</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] text-center">Allowance</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => {
                const staff = staffList.find(s => s.id === log.staffId);
                const project = projects.find(p => p.id === log.projectId);
                return (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-6 font-mono text-[10px] font-black uppercase text-zinc-400 italic">{log.date}</td>
                    <td className="p-6 font-black text-lg tracking-tight uppercase group-hover:text-amber-500 transition-colors">
                        {staff?.name || 'ERR: IDENTNULL'}
                    </td>
                    <td className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest italic">{project?.name || 'REGIONAL_FIELD'}</td>
                    <td className="p-6 text-sm font-black font-mono tracking-tighter text-center">{log.hoursWorked}</td>
                    <td className="p-6 text-sm font-black font-mono tracking-tighter text-center text-amber-500">+{log.overtime}</td>
                    <td className="p-6 text-sm font-black font-mono tracking-tighter text-center">{formatCurrency(log.allowance).split(' ')[0]}</td>
                    <td className="p-6">
                       <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-sm">Verified</span>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-24 text-center">
                       <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Telemetry stream optimized: no records found</span>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showLogForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-zinc-900 border border-white/10 p-12 max-w-2xl w-full rounded-3xl shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Field Log Entry</h3>
              <form onSubmit={submitLog} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operational Date</label>
                    <input name="date" type="date" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operation Locus</label>
                    <select name="projectId" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl">
                      <option value="">Select Vector</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Personnel Identification</label>
                  <select name="staffId" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl">
                    <option value="">Identify Asset</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Base Hours</label>
                    <input name="hoursWorked" type="number" step="0.5" defaultValue="8" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">OT Increment</label>
                    <input name="overtime" type="number" step="0.5" defaultValue="0" className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Allowance Allotment</label>
                    <input name="allowance" type="number" defaultValue="0" className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                   <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all font-black">Commit Entry</button>
                   <button type="button" onClick={() => setShowLogForm(false)} className="px-8 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 font-black">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsBox({ label, value, unit, icon: Icon, accent }: any) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl relative group overflow-hidden">
       {accent && <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>}
       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">{label}</p>
       <div className="flex items-baseline gap-2">
          <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
          <span className="text-xs font-black text-amber-500">{unit}</span>
       </div>
       <div className="mt-8 flex items-center justify-between opacity-10 group-hover:opacity-40 transition-opacity">
          <Icon size={20} />
          <div className="h-[1px] flex-1 mx-6 bg-white"></div>
          <CheckCircle size={16} />
       </div>
    </div>
  );
}

