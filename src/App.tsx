import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Truck, 
  Calendar, 
  LogOut, 
  Plus,
  ChevronRight,
  HardHat,
  Wallet,
  Settings,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectList from './components/ProjectList';
import StaffManagement from './components/StaffManagement';
import SupplierTracker from './components/SupplierTracker';
import AttendanceLogs from './components/AttendanceLogs';

const navItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'projects', label: 'المشاريع والعقود', icon: Briefcase },
  { id: 'staff', label: 'القوى العاملة', icon: Users },
  { id: 'attendance', label: 'سجلات التحضير', icon: Calendar },
  { id: 'suppliers', label: 'الموردين المحليين', icon: Truck },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-sm flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-black rotate-45"></div>
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500">System Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-zinc-900 border border-white/10 p-10 rounded-2xl shadow-2xl"
        >
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-amber-500 rounded-lg flex items-center justify-center rotate-3">
              <Briefcase size={32} className="text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-center mb-2 tracking-tighter uppercase">Contract.OS</h1>
          <p className="text-center text-zinc-500 mb-8 font-bold text-[10px] uppercase tracking-[0.2em]">Binaa Infrastructure Management</p>
          
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 hover:bg-zinc-200 transition-colors uppercase font-black text-xs tracking-widest"
          >
            Authenticate with Google
          </button>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest leading-relaxed font-bold">
              Institutional Grade Infrastructure Management <br />
              Precision • Scalability • Verification
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <ProjectDashboard />;
      case 'projects': return <ProjectList />;
      case 'staff': return <StaffManagement />;
      case 'attendance': return <AttendanceLogs />;
      case 'suppliers': return <SupplierTracker />;
      default: return <ProjectDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col font-sans selection:bg-amber-500 selection:text-black" dir="rtl">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? 'w-64' : 'w-20'
          } bg-zinc-900/50 border-l border-white/10 flex flex-col transition-all duration-300 z-50`}
        >
          <div className="p-6 flex items-center gap-4 border-b border-white/10 bg-zinc-900/20">
            <div className="min-w-[40px] w-10 h-10 bg-amber-500 rounded-sm flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-black rotate-45"></div>
            </div>
            {isSidebarOpen && <span className="font-black tracking-tighter text-xl uppercase">Contract.OS</span>}
          </div>

          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
                      activeTab === item.id 
                      ? 'bg-amber-500 text-black rounded-lg shadow-lg shadow-amber-500/20' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} />
                    {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} />
              {isSidebarOpen && <span>خروج</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-20 bg-zinc-900/20 border-b border-white/10 flex items-center justify-between px-8 z-40 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="relative group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text" 
                  placeholder="البحث عن مشاريع أو عمال..."
                  className="bg-zinc-900/50 border border-white/5 py-2 pl-10 pr-4 text-xs w-64 focus:outline-none focus:border-amber-500/50 transition-all text-white placeholder:text-zinc-600 rounded-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none mb-1">Project Lead</span>
                <span className="text-sm font-bold">{user.displayName}</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 bg-zinc-800 overflow-hidden shadow-inner">
                 <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="h-14 bg-amber-500 text-black flex items-center px-8 justify-between border-t border-black/10">
        <div className="flex items-center gap-8 font-black text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-900 animate-pulse"></div>
            System Status: Operational
          </span>
          <span>Terminal: ADEN-01</span>
          <span className="hidden md:inline opacity-50">v4.0.2-Stable</span>
        </div>
        <div className="text-[10px] font-black tracking-[0.2em] uppercase italic flex items-center gap-2">
          <span>Precision in every structure</span>
          <div className="w-1px h-3 bg-black/20 mx-2"></div>
          <span>{new Date().getFullYear()} © Binaa.OS</span>
        </div>
      </footer>
    </div>
  );
}

