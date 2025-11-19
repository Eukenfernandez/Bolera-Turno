import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayService, TicketService, SendEmail, UserService, AdminEmailService } from '../services/base44';
import { Day, Ticket, PRIMARY_ADMIN_EMAIL } from '../types';
import Layout from '../components/Layout';
import TurnControls from '../components/admin/TurnControls';
import StatsCards from '../components/admin/StatsCards';
import TurnQueue from '../components/admin/TurnQueue';

export default function AdminDashboard() {
  const [currentDay, setCurrentDay] = useState<Day | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await UserService.me();
      if (!user) return; // Layout handles login redirect
      
      const admins = await AdminEmailService.list();
      const isSecondary = admins.some(a => a.email === user.email);
      const isPrimary = user.email === PRIMARY_ADMIN_EMAIL;

      if (!isPrimary && !isSecondary) {
        navigate('/'); // Redirect regular users
        return;
      }
      
      loadData();
    };
    checkAdmin();
  }, [refreshTick]);

  const loadData = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let day = await DayService.getByDate(todayStr);
    
    if (!day) {
      day = await DayService.create({ date: todayStr });
    }
    setCurrentDay(day);

    const allTickets = await TicketService.listAll(day.id);
    setTickets(allTickets);
    setLoading(false);
  };

  // Business Logic: Notifications
  const checkAndNotifyMinus10 = async (newTurn: number, dayId: string) => {
    const targetTurn = newTurn + 10;
    const targets = await TicketService.filter({
      day_id: dayId,
      turn_number: targetTurn,
      status: "PENDING",
      notified_minus_10: false
    });

    for (const t of targets) {
      await SendEmail({
        to: t.user_email,
        subject: "¡Tu turno se acerca!",
        body: `Faltan 10 turnos para el tuyo (#${t.turn_number}).`
      });
      await TicketService.update(t.id, { notified_minus_10: true });
    }
  };

  const handleTurnAction = async (action: 'ADVANCE' | 'PREVIOUS' | 'SET' | 'RESET', value?: number) => {
    if (!currentDay) return;
    let newTurn = currentDay.current_turn;

    if (action === 'ADVANCE') newTurn++;
    if (action === 'PREVIOUS' && newTurn > 0) newTurn--;
    if (action === 'SET' && value !== undefined) newTurn = value;
    if (action === 'RESET') newTurn = 0;

    await DayService.update(currentDay.id, { current_turn: newTurn });
    
    if (action === 'ADVANCE' || action === 'SET') {
       await checkAndNotifyMinus10(newTurn, currentDay.id);
    }
    
    setRefreshTick(t => t + 1);
  };

  const handleTicketAction = async (id: string, action: 'SKIP' | 'SERVE' | 'RECALL') => {
    if (action === 'RECALL') {
       const t = tickets.find(tk => tk.id === id);
       if(t) await TicketService.update(id, { recall_count: (t.recall_count || 0) + 1, status: "CALLED" });
    } else if (action === 'SKIP') {
       await TicketService.update(id, { status: "NO_SHOW" });
    } else if (action === 'SERVE') {
       await TicketService.update(id, { status: "SERVED" });
    }
    setRefreshTick(t => t + 1);
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'PENDING').length,
    served: tickets.filter(t => t.status === 'SERVED').length,
    noShow: tickets.filter(t => t.status === 'NO_SHOW').length,
    currentTurn: currentDay?.current_turn || 0
  };

  if (loading) return <Layout><div></div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Panel de Control</h2>
        <StatsCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <TurnControls currentTurn={currentDay?.current_turn || 0} onAction={handleTurnAction} />
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold mb-4 text-slate-800">Cola de Turnos Activa</h3>
                 <TurnQueue 
                   tickets={tickets} 
                   currentTurn={currentDay?.current_turn || 0} 
                   onTicketAction={handleTicketAction} 
                 />
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2">Guía Rápida</h4>
                <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
                  <li>Usa "Siguiente" para llamar al próximo número.</li>
                  <li>El sistema notifica automáticamente cuando faltan 10 turnos.</li>
                  <li>Marca "Ausente" si no aparecen tras 2 llamadas.</li>
                </ul>
              </div>
           </div>
        </div>
      </div>
    </Layout>
  );
}