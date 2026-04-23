import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Wallet, 
  Clock, 
  ChevronLeft,
  CheckCircle2,
  Circle,
  MoreVertical,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { Project, Milestone, ProjectStatus, MilestoneStatus } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });
    return unsubscribe;
  }, []);

  const addProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      budget: parseFloat(formData.get('budget') as string),
      status: 'planning' as ProjectStatus,
      startDate: new Date().toISOString(),
      currency: 'YER'
    };
    
    try {
      await addDoc(collection(db, 'projects'), newProject);
      setShowAddProject(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedProjectId) {
    return <ProjectDetail id={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Central Registry</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Contract Portfolio</h2>
        </div>
        <button 
          onClick={() => setShowAddProject(true)}
          className="flex items-center gap-3 bg-white text-black px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all rounded-sm shadow-xl"
        >
          <Plus size={18} /> Initiate Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onClick={() => setSelectedProjectId(project.id)} />
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center border border-white/5 bg-zinc-900/20 rounded-3xl">
            <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">No active deployments found</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-zinc-900 border border-white/10 p-12 max-w-xl w-full rounded-3xl shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Project Initiation</h3>
              <form onSubmit={addProject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contract Identification</label>
                  <input name="name" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl transition-all" placeholder="Project Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Operation Locus</label>
                  <input name="location" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl transition-all" placeholder="Geographic Vector" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Budgetary Allocation (YER)</label>
                  <input name="budget" type="number" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl transition-all" />
                </div>
                <div className="flex gap-4 pt-8">
                   <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all">Execute Integration</button>
                   <button type="button" onClick={() => setShowAddProject(false)} className="px-8 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project, onClick: () => void, [key: string]: any }) {
  return (
    <motion.div 
      whileHover={{ y: -8, borderColor: 'rgba(245, 158, 11, 0.5)' }}
      onClick={onClick}
      className="bg-zinc-900 border border-white/10 p-8 rounded-3xl cursor-pointer group flex flex-col h-full shadow-lg"
    >
      <div className="flex justify-between items-start mb-10">
        <div className="flex flex-col">
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2">Ref: P-{project.id.slice(0,4).toUpperCase()}</span>
          <h3 className="font-black text-2xl tracking-tighter uppercase group-hover:text-amber-500 transition-colors leading-tight">{project.name}</h3>
        </div>
        <div className={cn(
          "w-3 h-3 rounded-full animate-pulse",
          project.status === 'active' ? "bg-amber-500" : "bg-zinc-700"
        )}></div>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-6 mb-10">
        <div className="flex items-center gap-3">
          <MapPin size={14} className="text-zinc-600" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{project.location}</p>
        </div>
        <div className="flex items-center gap-3">
          <Wallet size={14} className="text-zinc-600" />
          <p className="text-sm font-black font-mono tracking-tighter">{formatCurrency(project.budget || 0)}</p>
        </div>
      </div>
      
      <div className="pt-6 border-t border-white/5 flex justify-between items-center transition-all">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-amber-500">Review Telemetry</span>
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
          <ChevronLeft size={16} />
        </div>
      </div>
    </motion.div>
  );
}

function ProjectDetail({ id, onBack }: { id: string, onBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  useEffect(() => {
    const unsubProject = onSnapshot(doc(db, 'projects', id), (doc) => {
      if (doc.exists()) setProject({ id: doc.id, ...doc.data() } as Project);
    });

    const unsubMilestones = onSnapshot(collection(db, 'projects', id, 'milestones'), (snapshot) => {
      setMilestones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
    });

    return () => {
      unsubProject();
      unsubMilestones();
    };
  }, [id]);

  const addMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMilestone = {
      title: formData.get('title') as string,
      amount: parseFloat(formData.get('amount') as string),
      status: 'pending' as MilestoneStatus,
      dueDate: formData.get('dueDate') as string,
      projectId: id
    };
    
    try {
      await addDoc(collection(db, 'projects', id, 'milestones'), newMilestone);
      setShowAddMilestone(false);
    } catch (err) {
      console.error(err);
    }
  };

  const updateMilestoneStatus = async (mid: string, status: MilestoneStatus) => {
    await updateDoc(doc(db, 'projects', id, 'milestones', mid), { status });
  };

  if (!project) return null;

  const totalPaid = milestones.filter(m => m.status === 'paid').reduce((acc, m) => acc + m.amount, 0);
  const progressPercent = project.budget ? Math.round((totalPaid / project.budget) * 100) : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-white/10">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="w-16 h-16 rounded-2xl border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center">
            <ChevronLeft size={24} className="rotate-180" />
          </button>
          <div>
             <span className="text-amber-500 text-xs font-black uppercase tracking-[0.4em] mb-4 block">Operation Vector : Alpha</span>
             <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none">{project.name}</h2>
             <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.3em] mt-4">{project.location}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="flex items-baseline gap-2">
              <span className="text-[80px] font-black tracking-tighter leading-none text-white">{progressPercent}</span>
              <span className="text-2xl font-light text-amber-500">%</span>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Financial Absorption</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Milestones */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 italic">Financial Milestones / Billing Protocol</h3>
            <button 
              onClick={() => setShowAddMilestone(true)}
              className="text-[10px] font-black uppercase tracking-widest px-4 py-3 bg-zinc-800 hover:bg-white hover:text-black transition-all rounded-sm"
            >
              Execute Add Milestone
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {milestones.length > 0 ? milestones.map((m, idx) => (
               <div key={m.id} className="bg-zinc-900 border border-white/10 p-8 rounded-3xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-10">
                     <span className="text-4xl font-black text-white/5 group-hover:text-amber-500/20 transition-colors">{(idx+1).toString().padStart(2, '0')}</span>
                     <div className="space-y-1">
                        <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-white transition-colors">{m.title}</h4>
                        <div className="flex items-center gap-3 text-zinc-500">
                           <Calendar size={12} />
                           <p className="text-[10px] font-black uppercase tracking-widest">{formatDate(m.dueDate)}</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-10">
                     <div className="text-right">
                        <p className="text-xl font-black font-mono tracking-tighter text-white">{formatCurrency(m.amount).split(' ')[0]}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 italic">Allocation (YER)</p>
                     </div>
                     <select 
                       value={m.status}
                       onChange={(e) => updateMilestoneStatus(m.id, e.target.value as MilestoneStatus)}
                       className={cn(
                         "text-[10px] font-black uppercase tracking-widest px-3 py-2 bg-black border rounded-lg focus:outline-none transition-all",
                         m.status === 'paid' ? "border-amber-500 text-amber-500" : "border-zinc-800 text-zinc-500"
                       )}
                     >
                        <option value="pending">Pending</option>
                        <option value="in-progress">Review</option>
                        <option value="completed">Verified</option>
                        <option value="paid">Settled</option>
                     </select>
                  </div>
               </div>
             )) : (
               <div className="py-24 text-center border border-dashed border-white/5 rounded-3xl">
                  <span className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em] italic">No financial protocols defined</span>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Summaries */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-zinc-900 border border-white/10 p-10 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-10 italic">Absorption Telemetry</h4>
             <div className="space-y-8">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Total Contract Value</p>
                   <p className="text-4xl font-black font-mono tracking-tighter">{formatCurrency(project.budget || 0).split(' ')[0]}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">Actual Expenditure</p>
                   <p className="text-4xl font-black font-mono tracking-tighter text-amber-500">{formatCurrency(totalPaid).split(' ')[0]}</p>
                </div>
                <div className="pt-6">
                   <div className="w-full h-[1px] bg-white/5 mb-8"></div>
                   <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all flex items-center justify-center gap-3">
                      Generate Settlement PDF <FileText size={16} />
                   </button>
                </div>
             </div>
          </div>

          <div className="p-10 bg-zinc-900/50 border border-white/10 rounded-3xl border-dashed">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6 italic">Configuration</h4>
             <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl hover:border-amber-500/50 transition-all group">
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Contract Settings</span>
                   <Settings size={16} className="text-zinc-600 group-hover:text-amber-500" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl hover:border-amber-500/50 transition-all group text-red-500/50 hover:text-red-500">
                   <span className="text-[10px] font-black uppercase tracking-widest">Terminate Protocol</span>
                   <X size={16} />
                </button>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-zinc-900 border border-white/10 p-12 max-w-xl w-full rounded-3xl shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Define Milestone</h3>
              <form onSubmit={addMilestone} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Milestone Title</label>
                  <input name="title" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" placeholder="Phase Identification" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Payment Value (YER)</label>
                  <input name="amount" type="number" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Target Date</label>
                  <input name="dueDate" type="date" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" />
                </div>
                <div className="flex gap-4 pt-8">
                   <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500">Register Phase</button>
                   <button type="button" onClick={() => setShowAddMilestone(false)} className="px-8 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


function Briefcase(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}
