import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Truck, 
  Phone, 
  CreditCard, 
  History,
  AlertTriangle,
  Search,
  Filter,
  TrendingUp
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { Supplier } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function SupplierTracker() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'suppliers'), orderBy('name')), (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
    return unsub;
  }, []);

  const addSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSupplier = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      contact: formData.get('contact') as string,
      paymentTerms: formData.get('paymentTerms') as string,
      totalBalance: parseFloat(formData.get('totalBalance') as string || '0')
    };

    try {
      await addDoc(collection(db, 'suppliers'), newSupplier);
      setShowAddSupplier(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Supply Chain Command</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Regional Supplier Link</h2>
        </div>
        <button 
          onClick={() => setShowAddSupplier(true)}
          className="flex items-center gap-3 bg-white text-black px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all rounded-sm shadow-xl"
        >
          <Plus size={18} /> Integrate Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-zinc-900 border border-white/10 p-8 rounded-3xl flex flex-col justify-between group hover:border-amber-500/50 transition-all shadow-lg">
            <div className="space-y-6">
               <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-zinc-800 border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">
                     <Truck size={24} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-zinc-800 text-zinc-500 rounded-sm">
                    {supplier.category}
                  </span>
               </div>
               <div>
                  <h3 className="font-black text-2xl tracking-tighter uppercase group-hover:text-amber-500 transition-colors leading-tight">{supplier.name}</h3>
                  <div className="flex items-center gap-2 mt-2 opacity-40">
                    <Phone size={12} />
                    <p className="text-[10px] font-bold uppercase tracking-widest font-mono">
                      {supplier.contact}
                    </p>
                  </div>
               </div>
               <div className="bg-black/50 border border-white/5 p-5 rounded-2xl">
                  <span className="text-zinc-600 font-black uppercase tracking-widest text-[8px] block mb-2">Settlement Protocol</span>
                  <p className="text-xs text-zinc-400 leading-relaxed italic">
                    {supplier.paymentTerms}
                  </p>
               </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5">
               <div className="flex justify-between items-end mb-8">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Absorption Balance</span>
                    <p className="text-2xl font-black font-mono tracking-tighter text-amber-500">
                      {formatCurrency(supplier.totalBalance).split(' ')[0]}
                    </p>
                  </div>
                  <TrendingUp className="text-amber-500 opacity-20" size={24} />
               </div>
               <div className="flex gap-4">
                  <button className="flex-1 text-[9px] font-black uppercase tracking-widest py-4 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                    Register Ledger
                  </button>
                  <button className="flex-1 text-[9px] font-black uppercase tracking-widest py-4 bg-white text-black rounded-xl hover:bg-amber-500 transition-all font-black">
                    Disburse YER
                  </button>
               </div>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-32 text-center border border-white/5 bg-zinc-900/20 rounded-3xl">
             <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] italic">Supply nodes offline: No regional archives found</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-zinc-900 border border-white/10 p-12 max-w-2xl w-full rounded-3xl shadow-2xl"
            >
              <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Supplier Accreditation</h3>
              <form onSubmit={addSupplier} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entity Identification</label>
                    <input name="name" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" placeholder="Company Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resource Category</label>
                    <input name="category" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" placeholder="e.g. Infrastructure Materials" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Communications Terminal</label>
                    <input name="contact" required className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl font-mono" placeholder="+967 ..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Initial Allocation (YER)</label>
                    <input name="totalBalance" type="number" defaultValue="0" className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Settlement Protocols / Terms</label>
                  <textarea name="paymentTerms" required rows={3} className="w-full bg-black border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500 rounded-xl" placeholder="Describe financial engagement rules..." />
                </div>
                <div className="flex gap-4 pt-8">
                   <button type="submit" className="flex-1 bg-white text-black py-4 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all font-black uppercase tracking-widest">Authorize Node</button>
                   <button type="button" onClick={() => setShowAddSupplier(false)} className="px-8 py-4 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 font-black uppercase tracking-widest">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

