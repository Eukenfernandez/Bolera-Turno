import React, { useState, useEffect, useCallback } from 'react';
import { UserService, DayService, TicketService } from '../services/base44';
import { User, Day, Ticket } from '../types';
import { Button, Card, CardContent } from '../components/ui/Common';
import CurrentTurnDisplay from '../components/user/CurrentTurnDisplay';
import UserTicketCard from '../components/user/UserTicketCard';
import TurnEstimation from '../components/user/TurnEstimation';
import TurnInputModal from '../components/user/TurnInputModal';
import Layout from '../components/Layout';

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [currentDay, setCurrentDay] = useState<Day | null>(null);
  const [userTicket, setUserTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInputModal, setShowInputModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh

  const loadData = useCallback(async () => {
    try {
      const currentUser = await UserService.me();
      if (!currentUser) return; // Layout handles redirect usually
      setUser(currentUser);

      const todayStr = new Date().toISOString().split('T')[0];
      let day = await DayService.getByDate(todayStr);
      
      if (!day) {
        day = await DayService.create({ date: todayStr });
      }
      setCurrentDay(day);

      // Find Active Ticket
      const tickets = await TicketService.filter({
        day_id: day.id,
        user_email: currentUser.email,
        status: 'PENDING' // Or called
      });
      
      // Also check for CALLED status
      const calledTickets = await TicketService.filter({
        day_id: day.id,
        user_email: currentUser.email,
        status: 'CALLED'
      });

      const activeTicket = calledTickets[0] || tickets[0];
      setUserTicket(activeTicket || null);
      
    } catch (e) {
      console.error("Error loading dashboard", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [loadData, refreshKey]);

  // Auto-open modal logic
  useEffect(() => {
    const hasShown = sessionStorage.getItem('hasShownInputModal');
    if (user && currentDay && !userTicket && !hasShown && !loading) {
      setShowInputModal(true);
      sessionStorage.setItem('hasShownInputModal', 'true');
    }
  }, [user, currentDay, userTicket, loading]);

  const handleTurnConfirm = async (turnNumber: number) => {
    if (!user || !currentDay) return;
    
    // Check duplication
    const existing = await TicketService.filter({ 
      day_id: currentDay.id, 
      turn_number: turnNumber,
      status: "PENDING" 
    });

    if (existing.length > 0) {
      alert("Este número de turno ya está registrado por otro usuario.");
      return;
    }

    await TicketService.create({
      day_id: currentDay.id,
      user_email: user.email,
      user_name: user.full_name,
      turn_number: turnNumber,
      status: 'PENDING'
    });

    setShowInputModal(false);
    setLoading(true);
    setTimeout(() => setRefreshKey(k => k + 1), 1000); // Trigger reload
  };

  const handleCancelTicket = async () => {
    if (!userTicket) return;
    await TicketService.update(userTicket.id, { status: "CANCELLED" });
    setUserTicket(null);
    setRefreshKey(k => k + 1);
  };

  if (loading && !currentDay) return <Layout>Loading...</Layout>;

  const turnsAhead = userTicket && currentDay 
    ? Math.max(0, userTicket.turn_number - currentDay.current_turn - 1)
    : 0;

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h2 className="text-2xl font-bold text-slate-900">Hola, {user?.full_name.split(' ')[0]}</h2>
             <p className="text-slate-500">Bienvenido a la gestión de turnos</p>
          </div>
          {!userTicket && (
            <Button onClick={() => setShowInputModal(true)} className="shadow-blue-200 shadow-lg">
              Registrar Turno
            </Button>
          )}
        </div>

        {currentDay && <CurrentTurnDisplay currentTurn={currentDay.current_turn} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userTicket ? (
            <>
              <UserTicketCard 
                ticket={userTicket} 
                turnsAhead={turnsAhead} 
                onCancel={handleCancelTicket} 
              />
              {userTicket.status === 'PENDING' && (
                 <TurnEstimation turnsAhead={turnsAhead} />
              )}
            </>
          ) : (
            <Card className="bg-slate-50 border-dashed border-2 col-span-1 lg:col-span-2">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-slate-500 mb-4">No tienes un turno activo actualmente.</p>
                <Button variant="outline" onClick={() => setShowInputModal(true)}>
                  Introducir número de ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {currentDay && (
          <TurnInputModal 
            open={showInputModal} 
            onOpenChange={setShowInputModal} // Simplified for mock
            currentTurn={currentDay.current_turn} 
            onConfirm={handleTurnConfirm} 
          />
        )}
      </div>
    </Layout>
  );
}