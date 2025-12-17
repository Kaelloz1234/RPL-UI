import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '../ui/sheet';
import { Sparkles, Home, ShoppingCart, Package, Receipt, CreditCard, LogOut, Menu } from 'lucide-react';

export function CustomerNavigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { path: '/customer/create-order', label: 'Buat Pesanan', icon: ShoppingCart },
    { path: '/customer/laundry-status', label: 'Status Laundry', icon: Package },
    { path: '/customer/transaction-history', label: 'Riwayat', icon: Receipt },
    { path: '/customer/payment', label: 'Pembayaran', icon: CreditCard },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="md:inline">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/customer/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="text-blue-600 text-sm sm:text-base font-semibold">Laundry Digital</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-2">
            <NavLinks />
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline truncate max-w-[150px]">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            
            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <SheetDescription className="sr-only">
                  Menu navigasi untuk pelanggan Laundry Digital
                </SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <span className="text-blue-600 font-semibold">Laundry Digital</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs mt-1">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    <NavLinks />
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
          </div>
        </div>
      </div>
    </nav>
  );
}