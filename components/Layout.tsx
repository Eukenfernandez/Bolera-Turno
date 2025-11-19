import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Clock, UserPlus, LogOut, Menu, X, LayoutDashboard, User as UserIcon, AlertCircle } from 'lucide-react';
import { UserService, AdminEmailService } from '../services/base44';
import { User, PRIMARY_ADMIN_EMAIL } from '../types';
import { cn, Button, Input, Card, CardContent, CardHeader } from './ui/Common';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth Form States
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await UserService.me();
      setUser(currentUser);

      if (currentUser) {
        const admins = await AdminEmailService.list();
        const adminList = admins.map(a => a.email);
        const userIsAdmin = currentUser.email === PRIMARY_ADMIN_EMAIL || adminList.includes(currentUser.email);
        
        setIsAdmin(userIsAdmin);
        setIsPrimaryAdmin(currentUser.email === PRIMARY_ADMIN_EMAIL);
      }
      setLoading(false);
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = async () => {
    await UserService.logout();
    window.location.reload();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);

    try {
      let authenticatedUser: User;

      if (authMode === 'register') {
        authenticatedUser = await UserService.register(email, name, password);
      } else {
        authenticatedUser = await UserService.login(email, password);
      }

      setUser(authenticatedUser);
      
      // Redirection Logic based on User Role
      if (authenticatedUser.email === PRIMARY_ADMIN_EMAIL) {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err: any) {
      setAuthError(err.message || "Error de autenticación");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Clock className="w-10 h-10 text-blue-600 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="pb-4 text-center border-b border-slate-100">
             <h2 className="text-3xl font-bold text-blue-600 mb-1">Bolera Manager</h2>
             <p className="text-slate-500 text-sm">Gestiona tus turnos fácilmente</p>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
              <button 
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all", 
                  authMode === 'login' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md transition-all", 
                  authMode === 'register' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Nombre Completo</label>
                  <Input 
                    required 
                    placeholder="Tu nombre" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
              )}
              
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Correo Electrónico</label>
                <Input 
                  required 
                  type="email" 
                  placeholder="nombre@ejemplo.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Contraseña</label>
                <Input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>

              {authError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {authError}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700 mt-2"
                disabled={isAuthSubmitting}
              >
                {isAuthSubmitting ? 'Procesando...' : authMode === 'login' ? 'Entrar' : 'Crear Cuenta'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-slate-400 text-xs mt-6">
          © 2024 Bolera System. All rights reserved.
        </p>
      </div>
    );
  }

  const navItems = [
    ...(isAdmin
      ? [
          { title: "Panel Admin", url: "/admin", icon: LayoutDashboard },
          { title: "Gestión Turnos", url: "/turn-management", icon: Clock },
        ]
      : [
          { title: "Mi Turno", url: "/", icon: Clock },
        ]),
  ];

  if (isPrimaryAdmin) {
    navItems.push({
      title: "Administradores",
      url: "/admin-management",
      icon: UserPlus,
    });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
          Bolera
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-blue-50 text-blue-700 font-medium shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="w-full justify-start gap-2 text-slate-600">
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <h1 className="text-xl font-bold text-blue-600">Bolera</h1>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-30 md:hidden bg-white pt-16"
          >
            <NavContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}