import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { TicketService, DayService, UserService, AdminEmailService } from '../services/base44';
import { Ticket, PRIMARY_ADMIN_EMAIL } from '../types';
import { Card, CardContent, Input, Button, Badge } from '../components/ui/Common';
import { Search, Download, Filter } from 'lucide-react';

export default function TurnManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const navigate = useNavigate();
  
  useEffect(() => {
    const load = async () => {
       const user = await UserService.me();
       if (!user) return;

       const admins = await AdminEmailService.list();
       const isSecondary = admins.some(a => a.email === user.email);
       const isPrimary = user.email === PRIMARY_ADMIN_EMAIL;
       
       if (!isPrimary && !isSecondary) {
         navigate('/');
         return;
       }

       const todayStr = new Date().toISOString().split('T')[0];
       const day = await DayService.getByDate(todayStr);
       if(day) {
         const t = await TicketService.listAll(day.id);
         setTickets(t);
       }
    };
    load();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.turn_number.toString().includes(searchTerm) ||
        t.user_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const exportCSV = () => {
    const headers = ["Turno", "Email", "Nombre", "Estado", "Creado"];
    const rows = filteredTickets.map(t => [
      t.turn_number,
      t.user_email,
      t.user_name,
      t.status,
      t.created_date
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'turnos.csv';
    a.click();
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Gestión de Tickets (Día Actual)</h2>
            <Button variant="outline" onClick={exportCSV}>
               <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
         </div>

         <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar por email, nombre o número..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               <select 
                 className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                 value={statusFilter}
                 onChange={e => setStatusFilter(e.target.value)}
               >
                 <option value="ALL">Todos los estados</option>
                 <option value="PENDING">Pendientes</option>
                 <option value="CALLED">Llamados</option>
                 <option value="SERVED">Atendidos</option>
                 <option value="NO_SHOW">Ausentes</option>
                 <option value="CANCELLED">Cancelados</option>
               </select>
            </CardContent>
         </Card>

         <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-medium">
               <tr>
                 <th className="px-4 py-3">Turno</th>
                 <th className="px-4 py-3">Usuario</th>
                 <th className="px-4 py-3">Estado</th>
                 <th className="px-4 py-3">Hora Registro</th>
                 <th className="px-4 py-3">Re-llamadas</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredTickets.map(t => (
                 <tr key={t.id} className="hover:bg-slate-50">
                   <td className="px-4 py-3 font-bold">#{t.turn_number}</td>
                   <td className="px-4 py-3">
                      <div className="font-medium">{t.user_name}</div>
                      <div className="text-xs text-slate-500">{t.user_email}</div>
                   </td>
                   <td className="px-4 py-3">
                      <Badge variant={
                        t.status === 'SERVED' ? 'success' : 
                        t.status === 'PENDING' ? 'default' : 
                        t.status === 'CALLED' ? 'warning' : 'secondary'
                      }>{t.status}</Badge>
                   </td>
                   <td className="px-4 py-3 text-slate-500">
                     {new Date(t.created_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </td>
                   <td className="px-4 py-3">{t.recall_count}</td>
                 </tr>
               ))}
               {filteredTickets.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No se encontraron tickets</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </Layout>
  );
}