import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Briefcase,
  Users,
  Wallet
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { Project, Milestone } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalBudget: 0,
    completionRate: 0,
    pendingMilestones: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'projects'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
      
      setStats({
        activeProjects: projs.filter(p => p.status === 'active').length || 4,
        totalBudget: projs.reduce((acc, p) => acc + (p.budget || 0), 0) || 12500000,
        completionRate: 84,
        pendingMilestones: 12
      });
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-8 flex flex-col">
          <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em] mb-4">Operational Status : Critical Path</span>
          <h2 className="text-6xl md:text-8xl font-black leading-none tracking-tighter uppercase mb-8">
            قيد الإنجاز<br/>المشاريع الحالية
          </h2>
          <div className="flex items-baseline gap-4 mt-4">
            <span className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-white">{stats.completionRate}</span>
            <span className="text-4xl md:text-6xl font-light text-amber-500">%</span>
          </div>
          <p className="text-zinc-500 uppercase font-black tracking-[0.4em] text-xs md:text-sm mt-4">Overall Completion Rate / Phase 04</p>
          <div className="w-full h-3 bg-zinc-800 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${stats.completionRate}%` }}></div>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
           <StatCard 
            label="Active Projects" 
            value={stats.activeProjects.toString()} 
            icon={Activity} 
          />
          <StatCard 
            label="Total Allocation" 
            value={formatCurrency(stats.totalBudget).split(' ')[0]} 
            suffix="YER"
            icon={Wallet} 
          />
        </div>
      </div>

      {/* Secondary Stats & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12 border-t border-white/10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Live Infrastructure Feed</h3>
            <div className="h-[1px] flex-1 mx-8 bg-white/5"></div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Project Identification</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Location Vector</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Budgetary Allotment</th>
                  <th className="pb-4 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Deployment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.length > 0 ? projects.map((p) => (
                  <tr key={p.id} className="group hover:bg-white/[0.02] transition-all cursor-pointer">
                    <td className="py-6 font-black text-lg tracking-tight group-hover:text-amber-500 transition-colors uppercase">
                      {p.name}
                    </td>
                    <td className="py-6 text-xs font-bold text-zinc-400 opacity-70 uppercase tracking-widest">
                      {p.location}
                    </td>
                    <td className="py-6 text-sm font-black font-mono tracking-tighter">
                      {formatCurrency(p.budget)}
                    </td>
                    <td className="py-6">
                      <span className={cn(
                        "px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm",
                        p.status === 'active' ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-zinc-500"
                      )}>
                        {p.status === 'active' ? 'Active' : 'Planning'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  [1,2,3].map(i => (
                    <tr key={i} className="opacity-10">
                       <td className="py-6 h-16 bg-white/5 animate-pulse rounded-md"></td>
                       <td className="py-6 h-16"></td>
                       <td className="py-6 h-16"></td>
                       <td className="py-6 h-16"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8 text-right" dir="rtl">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Personnel On-Site</h3>
            <div className="space-y-6">
              <TeamMember name="أحمد صالح" role="كهربائي رئيسي" project="عمارة النخبة" status="Active" />
              <TeamMember name="محمد عبده" role="مشرف موقع" project="مجمع الرشيد" status="On-Leave" inactive />
              <TeamMember name="خالد علي" role="فني صب" project="جسر السلام" status="Active" />
            </div>
          </div>

          <div className="p-8 bg-zinc-900 border border-white/10 rounded-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Internal Protocol</p>
             <h4 className="text-xl font-black mb-4">Milestone Verification</h4>
             <p className="text-xs text-zinc-400 leading-relaxed mb-6 italic opacity-70">
               Confirm all deliverables for Phase 04 before authorizing regional allowances.
             </p>
             <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all rounded-lg">
                System Registry
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, suffix }: any) {
  return (
    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl group hover:border-amber-500/50 transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
        {suffix && <span className="text-xs font-bold text-amber-500">{suffix}</span>}
      </div>
      <div className="mt-6 flex items-center justify-between opacity-20 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Icon size={16} />
        </div>
        <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
        <TrendingUp size={16} className="text-amber-500" />
      </div>
    </div>
  );
}

function TeamMember({ name, role, project, status, inactive }: any) {
  return (
    <div className={cn("flex items-center gap-4 group", inactive && "opacity-30")}>
      <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-xs font-black group-hover:border-amber-500/50 transition-colors">
         {name.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div className="flex-1">
        <h5 className="text-sm font-black uppercase tracking-tight">{name}</h5>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{role} • {project}</p>
      </div>
      <span className={cn(
        "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded",
        inactive ? "bg-zinc-800 text-zinc-500" : "bg-amber-500/10 text-amber-500"
      )}>
        {status}
      </span>
    </div>
  );
}

