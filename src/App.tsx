/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Wallet, 
  Target, 
  ListTodo, 
  TrendingUp,
  X,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
}

type Tab = 'dashboard' | 'tasks' | 'expenses' | 'goals';

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State with LocalStorage initialization
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('vie_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('vie_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('vie_goals');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to LocalStorage
  useEffect(() => localStorage.setItem('vie_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('vie_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('vie_goals', JSON.stringify(goals)), [goals]);

  // Calculations
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const completedTasks = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);
  const averageGoalProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, g) => sum + (g.current / g.target), 0);
    return (totalProgress / goals.length) * 100;
  }, [goals]);

  // --- Handlers ---

  const addTask = (text: string) => {
    if (!text.trim()) return;
    setTasks([{ id: crypto.randomUUID(), text, completed: false }, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addExpense = (description: string, amount: number) => {
    if (!description.trim() || isNaN(amount)) return;
    setExpenses([{ id: crypto.randomUUID(), description, amount, date: new Date().toISOString() }, ...expenses]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addGoal = (title: string, target: number) => {
    if (!title.trim() || isNaN(target) || target <= 0) return;
    setGoals([{ id: crypto.randomUUID(), title, current: 0, target }, ...goals]);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const next = Math.min(g.target, Math.max(0, g.current + amount));
        return { ...g, current: next };
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pl-64">
      {/* Sidebar / Desktop Nav */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col p-6 z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vie+</h1>
        </div>
        
        <div className="space-y-2">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Tableau de bord" />
          <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ListTodo size={20} />} label="Tâches" />
          <NavButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Wallet size={20} />} label="Dépenses" />
          <NavButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<Target size={20} />} label="Objectifs" />
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <TrendingUp size={18} />
          </div>
          <span className="font-bold text-xl">Vie+</span>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Bonjour !</h2>
                <p className="text-slate-500">Voici un aperçu de votre journée.</p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                  title="Tâches" 
                  value={`${completedTasks}/${tasks.length}`} 
                  subtitle="complétées"
                  icon={<ListTodo className="text-blue-600" />}
                  color="bg-blue-50"
                  onClick={() => setActiveTab('tasks')}
                />
                <StatCard 
                  title="Dépenses" 
                  value={`${totalExpenses.toLocaleString('fr-FR')} €`} 
                  subtitle="total ce mois"
                  icon={<Wallet className="text-emerald-600" />}
                  color="bg-emerald-50"
                  onClick={() => setActiveTab('expenses')}
                />
                <StatCard 
                  title="Objectifs" 
                  value={`${Math.round(averageGoalProgress)}%`} 
                  subtitle="progression moyenne"
                  icon={<Target className="text-purple-600" />}
                  color="bg-purple-50"
                  onClick={() => setActiveTab('goals')}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Tâches récentes</h3>
                    <button onClick={() => setActiveTab('tasks')} className="text-indigo-600 text-sm font-medium flex items-center gap-1">
                      Voir tout <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        {task.completed ? <CheckCircle2 size={18} className="text-indigo-600" /> : <Circle size={18} className="text-slate-300" />}
                        <span className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{task.text}</span>
                      </div>
                    ))}
                    {tasks.length === 0 && <p className="text-slate-400 text-sm italic">Aucune tâche pour le moment.</p>}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Dernières dépenses</h3>
                    <button onClick={() => setActiveTab('expenses')} className="text-indigo-600 text-sm font-medium flex items-center gap-1">
                      Voir tout <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {expenses.slice(0, 3).map(expense => (
                      <div key={expense.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-sm text-slate-700">{expense.description}</span>
                        <span className="text-sm font-bold text-slate-900">{expense.amount} €</span>
                      </div>
                    ))}
                    {expenses.length === 0 && <p className="text-slate-400 text-sm italic">Aucune dépense enregistrée.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <TasksView tasks={tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView expenses={expenses} onAdd={addExpense} onDelete={deleteExpense} total={totalExpenses} />
          )}

          {activeTab === 'goals' && (
            <GoalsView goals={goals} onAdd={addGoal} onUpdate={updateGoalProgress} onDelete={deleteGoal} />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} />
        <MobileNavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<ListTodo size={20} />} />
        <MobileNavButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Wallet size={20} />} />
        <MobileNavButton active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} icon={<Target size={20} />} />
      </nav>
    </div>
  );
}

// --- Sub-components ---

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileNavButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all duration-200 ${
        active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400'
      }`}
    >
      {icon}
    </button>
  );
}

function StatCard({ title, value, subtitle, icon, color, onClick }: { title: string, value: string, subtitle: string, icon: React.ReactNode, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start text-left hover:border-indigo-200 hover:shadow-md transition-all group"
    >
      <div className={`p-3 rounded-xl ${color} mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
      <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      <p className="text-slate-400 text-xs mt-1">{subtitle}</p>
    </button>
  );
}

// --- Views ---

function TasksView({ tasks, onAdd, onToggle, onDelete }: { tasks: Task[], onAdd: (t: string) => void, onToggle: (id: string) => void, onDelete: (id: string) => void }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(input);
    setInput('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Mes Tâches</h2>
        <p className="text-slate-500">Organisez votre journée efficacement.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ajouter une nouvelle tâche..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {tasks.map(task => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group overflow-hidden"
            >
              <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => onToggle(task.id)}>
                {task.completed ? (
                  <CheckCircle2 size={22} className="text-indigo-600 shrink-0" />
                ) : (
                  <Circle size={22} className="text-slate-300 shrink-0" />
                )}
                <span className={`text-slate-700 transition-all ${task.completed ? 'line-through text-slate-400' : ''}`}>
                  {task.text}
                </span>
              </div>
              <button 
                onClick={() => onDelete(task.id)}
                className="text-slate-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <ListTodo size={48} className="mx-auto mb-4 opacity-20" />
            <p>Tout est fait ! Profitez de votre temps libre.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ExpensesView({ expenses, onAdd, onDelete, total }: { expenses: Expense[], onAdd: (d: string, a: number) => void, onDelete: (id: string) => void, total: number }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(desc, parseFloat(amount));
    setDesc('');
    setAmount('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mes Dépenses</h2>
          <p className="text-slate-500">Gardez un œil sur votre budget.</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <div className="text-3xl font-black text-indigo-600">{total.toLocaleString('fr-FR')} €</div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
            <input 
              type="text" 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Courses, Loyer..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Montant (€)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
          <Plus size={20} /> Ajouter la dépense
        </button>
      </form>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {expenses.map(expense => (
            <motion.div 
              key={expense.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <Wallet size={18} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{expense.description}</div>
                  <div className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-bold text-slate-900">{expense.amount.toLocaleString('fr-FR')} €</div>
                <button 
                  onClick={() => onDelete(expense.id)}
                  className="text-slate-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {expenses.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Wallet size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aucune dépense enregistrée. Économisez bien !</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function GoalsView({ goals, onAdd, onUpdate, onDelete }: { goals: Goal[], onAdd: (t: string, tar: number) => void, onUpdate: (id: string, amt: number) => void, onDelete: (id: string) => void }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(title, parseFloat(target));
    setTitle('');
    setTarget('');
    setShowAdd(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mes Objectifs</h2>
          <p className="text-slate-500">Visualisez votre succès.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className={`p-3 rounded-full transition-all ${showAdd ? 'bg-slate-200 text-slate-600 rotate-45' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}
        >
          <Plus size={24} />
        </button>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit} 
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Objectif</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Épargne Voyage, Marathon..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cible (Valeur)</label>
                <input 
                  type="number" 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all">
              Créer l'objectif
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence initial={false}>
          {goals.map(goal => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 group relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{goal.title}</h3>
                    <p className="text-sm text-slate-400">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-600">{Math.round(progress)}%</span>
                    <button 
                      onClick={() => onDelete(goal.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => onUpdate(goal.id, goal.target * 0.1)}
                    className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 py-2 rounded-lg text-sm font-bold transition-all border border-slate-100"
                  >
                    +10%
                  </button>
                  <button 
                    onClick={() => onUpdate(goal.id, goal.target * 0.25)}
                    className="flex-1 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 py-2 rounded-lg text-sm font-bold transition-all border border-slate-100"
                  >
                    +25%
                  </button>
                  <button 
                    onClick={() => onUpdate(goal.id, goal.target)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-indigo-100"
                  >
                    Terminer
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {goals.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p>Pas d'objectifs ? Il est temps de rêver grand !</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
