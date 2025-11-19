import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminEmailService, UserService } from '../services/base44';
import { AdminEmail, PRIMARY_ADMIN_EMAIL } from '../types';
import Layout from '../components/Layout';
import { Card, CardContent, Input, Button } from '../components/ui/Common';
import { Trash2, ShieldAlert, ShieldCheck, PlusCircle } from 'lucide-react';

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminEmail[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const me = await UserService.me();
      
      if (!me || me.email !== PRIMARY_ADMIN_EMAIL) {
         navigate(me ? '/' : '/'); // Redirect if not primary admin
         return;
      }
      
      const list = await AdminEmailService.list();
      setAdmins(list);
      setLoading(false);
    };
    load();
  }, []);

  const handleAdd = async () => {
    if (!newEmail.includes('@')) return;
    if (newEmail === PRIMARY_ADMIN_EMAIL) return;
    if (admins.find(a => a.email === newEmail)) return;

    await AdminEmailService.create({ email: newEmail });
    setNewEmail("");
    const list = await AdminEmailService.list();
    setAdmins(list);
  };

  const handleDelete = async (id: string) => {
    await AdminEmailService.delete(id);
    const list = await AdminEmailService.list();
    setAdmins(list);
  };

  if (loading) return <Layout><div></div></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestión de Administradores</h2>
          <p className="text-slate-500">Añade correos electrónicos que tendrán acceso al panel de control.</p>
        </div>

        <Card>
           <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Añadir Nuevo Administrador</h3>
              <div className="flex gap-4">
                <Input 
                  placeholder="correo@ejemplo.com" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                />
                <Button onClick={handleAdd} disabled={!newEmail}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Añadir
                </Button>
              </div>
           </CardContent>
        </Card>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-medium text-slate-700">
             Administradores Activos
          </div>
          <div className="divide-y divide-slate-100">
             <div className="p-4 flex items-center justify-between bg-blue-50/50">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-blue-600" />
                   <div>
                      <div className="font-medium text-slate-900">{PRIMARY_ADMIN_EMAIL}</div>
                      <div className="text-xs text-slate-500">Admin Principal (Propietario)</div>
                   </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Fijo</span>
             </div>
             {admins.map(admin => (
               <div key={admin.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <ShieldAlert className="w-5 h-5 text-orange-500" />
                     <span className="font-medium text-slate-900">{admin.email}</span>
                  </div>
                  <Button variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(admin.id)}>
                     <Trash2 className="w-4 h-4" />
                  </Button>
               </div>
             ))}
             {admins.length === 0 && (
                <div className="p-8 text-center text-slate-400">No hay administradores secundarios.</div>
             )}
          </div>
        </div>
      </div>
    </Layout>
  );
}