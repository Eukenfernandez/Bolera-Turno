import React from 'react';
import { Ticket } from '../../types';
import { Card, CardContent, Button, Badge } from '../ui/Common';
import { Bell, UserX, CheckCircle, Check } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  currentTurn: number;
  onTicketAction: (id: string, action: 'SKIP' | 'SERVE' | 'RECALL') => void;
}

export default function TurnQueue({ tickets, currentTurn, onTicketAction }: Props) {
  // Filter and sort: Only pending and future turns (or exactly next)
  const filtered = tickets.filter(t => 
    t.status === 'PENDING' && t.turn_number > currentTurn
  ).sort((a, b) => a.turn_number - b.turn_number);

  if (filtered.length === 0) {
    return (
      <Card className="h-full bg-slate-50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Bell className="w-10 h-10 mb-4 opacity-20" />
          <p>La cola está vacía</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-900 mb-4">Próximos en la cola</h3>
      {filtered.map((ticket) => {
        const isNext = ticket.turn_number === currentTurn + 1;
        const isPriority = ticket.turn_number <= currentTurn + 5;

        return (
          <Card 
            key={ticket.id} 
            className={`transition-all ${
              isNext ? 'border-yellow-400 bg-yellow-50 shadow-md scale-[1.02]' : 
              isPriority ? 'border-blue-200 bg-blue-50' : 'border-slate-200'
            }`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${isNext ? 'text-yellow-700' : 'text-slate-700'}`}>
                  #{ticket.turn_number}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{ticket.user_name || 'Usuario'}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    {ticket.user_email}
                    {ticket.notified_minus_10 && (
                      <span className="flex items-center text-green-600" title="Notificado -10">
                        <Check className="w-3 h-3 mr-0.5" /> Notificado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="icon" variant="ghost" 
                  onClick={() => onTicketAction(ticket.id, 'RECALL')}
                  className="relative"
                  title="Llamar de nuevo"
                >
                  <Bell className="w-4 h-4 text-blue-600" />
                  {ticket.recall_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {ticket.recall_count}
                    </span>
                  )}
                </Button>
                <Button 
                  size="icon" variant="ghost" 
                  className="hover:bg-red-100 text-red-500"
                  onClick={() => onTicketAction(ticket.id, 'SKIP')}
                  title="Marcar Ausente"
                >
                  <UserX className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" variant="ghost" 
                  className="hover:bg-green-100 text-green-600"
                  onClick={() => onTicketAction(ticket.id, 'SERVE')}
                  title="Marcar Atendido"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}