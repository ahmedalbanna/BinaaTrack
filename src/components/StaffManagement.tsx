import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Phone, 
  HardHat, 
  MoreVertical,
  Briefcase,
  TrendingDown,
  Clock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { Staff, Project } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddStaff, setShowAddStaff] = useState(false);

  useEffect(() => {
    const unsubStaff = onSnapshot(query(collection(db, 'staff'), orderBy('name')), (snapshot) => {
      setStaffList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff)));
    });

    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    return () => {
      unsubStaff();
      unsubProjects();
    };
  }, []);

  const addStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStaff = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      phone: formData.get('phone') as string,
      dailyRate: parseFloat(formData.get('dailyRate') as string),
      currentProjectId: formData.get('currentProjectId') as string || null
    };

    try {
      await addDoc(collection(db, 'staff'), newStaff);
      setShowAddStaff(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Personnel Command</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Field Staff Management</h2>
        </div>
        <button 
          onClick={() => setShowAddStaff(true)}
          className="flex items-center gap-3 bg-white text-black px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all rounded-sm shadow-xl"
        >
          <Plus size={18} /> Register Personnel
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-white/10">
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Personnel Asset</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Designation</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Operation Vector</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Daily Allotment</th>
                <th className="p-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Communications</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffList.length > 0 ? staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-[10px] font-black uppercase group-hover:border-amber-500 transition-all group-hover:text-amber-500">
                        {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-black text-lg tracking-tight uppercase">{staff.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">{staff.role}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <Briefcase size={14} className="text-zinc-600" />
                      {projects.find(p => p.id === staff.currentProjectId)?.name || 'Unassigned'}
                    </div>
                  </td>
                  <td className="p-6 font-mono text-sm font-black tracking-tighter text-amber-500">{formatCurrency(staff.dailyRate)}</td>
                  <td className="p-6 flex items-center gap-2 text-[10px] font-black text-zinc-600 tracking-widest uppercase">
                    <Phone size={14} /> {staff.phone}
                  </td>
                  <td className="p-6 text-left">
                    <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="opacity-10">
                    <td className="p-8 h-20"></td>
                    <td className="p-8"></td>
                    <td className="p-8"></td>
                    <td className="p-8"></td>
                    <td className="p-8"></td>
                    <td className="p-8"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-zinc-900 border border-white/10 p-12 max-w-2xl w-full rounded-3xl shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Personnel Registration</h3>
              <form onSubmit={addStaff} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Identification</label>
                    <input name="name" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Designation / Role</label>
                    <input name="role" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Communication Terminal (Phone)</label>
                    <input name="phone" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Daily Disbursement (YER)</label>
                    <input name="dailyRate" type="number" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Strategic Implementation Detail (Project)</label>
                  <select name="currentProjectId" className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl">
                    <option value="">Status: Unassigned</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-8">
                   <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all font-black">Authorize Asset</button>
                   <button type="button" onClick={() => setShowAddStaff(false)} className="px-8 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 font-black uppercase">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

