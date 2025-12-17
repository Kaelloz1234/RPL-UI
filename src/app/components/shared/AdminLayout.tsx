import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../ui/sheet';
import { Sparkles, LayoutDashboard, Users, Package, FileText, LogOut, Menu, ClipboardList } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Kelola Pesanan', icon: ClipboardList },
    { path: '/admin/customers', label: 'Data Pelanggan', icon: Users },
    { path: '/admin/packages', label: 'Paket Laundry', icon: Package },
    { path: '/admin/reports', label: 'Laporan', icon: FileText },
  ];

  const MenuLinks = () => (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                <SheetDescription className="sr-only">
                  Menu navigasi untuk panel admin
                </SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <span className="text-blue-600 font-semibold">Admin Panel</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs mt-1">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <MenuLinks />
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4" 
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="text-blue-600 text-sm sm:text-base font-semibold">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline truncate max-w-[150px]">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <MenuLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}