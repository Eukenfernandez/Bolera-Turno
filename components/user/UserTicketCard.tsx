import React, { useState } from 'react';
import { Ticket } from '../../types';
import { Card, CardContent, Badge, Button, Dialog } from '../ui/Common';
import { Clock, Bell, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  ticket: Ticket;
  turnsAhead: number;
  onCancel: () => void;
}

export default function UserTicketCard({ ticket, turnsAhead, onCancel }: Props) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING": return { color: "default", icon: Clock, text: "En Espera" };
      case "CALLED": return { color: "warning", icon: Bell, text: "¡Es tu turno!" };
      case "SERVED": return { color: "success", icon: CheckCircle2, text: "Atendido" };
      case "NO_SHOW": return { color: "destructive", icon: XCircle, text: "Ausente" };
      default: return { color: "secondary", icon: XCircle, text: status };
    }
  };

  const config = getStatusConfig(ticket.status);
  const StatusIcon = config.icon;

  return (
    <>
      <Card className="overflow-hidden border-blue-100 shadow-md">
        <div className={`h-2 w-full ${ticket.status === 'CALLED' ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm text-slate-500 font-medium uppercase">Tu Turno</span>
              <div className="text-6xl font-bold text-slate-900 mt-1">#{ticket.turn_number}</div>
            </div>
            <Badge variant={config.color as any} className="px-3 py-1 text-sm gap-1">
              <StatusIcon className="w-3 h-3" /> {config.text}
            </Badge>
          </div>

          <div className="space-y-4">
            {ticket.status === 'PENDING' && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Turnos delante</span>
                  <span className="font-bold text-slate-900">{turnsAhead}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.max(5, 100 - (turnsAhead * 5))}%` }}
                  ></div>
                </div>
              </div>
            )}

            {ticket.status === 'CALLED' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex gap-3 items-start animate-pulse">
                <Bell className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-bold">¡Acércate al mostrador!</p>
                  <p className="text-sm">Te estamos esperando.</p>
                </div>
              </div>
            )}

            {ticket.status === 'PENDING' && (
              <Button 
                variant="ghost" 
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 mt-2"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancelar Turno
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCancelConfirm}>
         <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¿Cancelar turno?</h3>
            <p className="text-slate-500 mt-2 mb-6">
              Perderás tu posición en la cola. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCancelConfirm(false)}>Volver</Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                onCancel();
                setShowCancelConfirm(false);
              }}>Sí, cancelar</Button>
            </div>
         </div>
      </Dialog>
    </>
  );
}