import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { clearAuth } from '../../service/Auth';
import { Button } from '../ui/Button';
import { Menu, X, LayoutDashboard, Box, Archive, History, ArrowRightLeft } from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { 
    label: 'Master Data', 
    icon: <Box className="w-5 h-5" />, 
    children: [
      { label: 'Customers', path: '/directory/customers' },
      { label: 'Products', path: '/directory/products' },
      { label: 'Batches', path: '/directory/batches' },
      { label: 'Shipping Embalage', path: '/directory/shipping-embalage' },
      { label: 'Product Embalage', path: '/directory/product-embalage' },
    ]
  },
  { 
    label: 'Inventory', 
    icon: <ArrowRightLeft className="w-5 h-5" />, 
    children: [
      { label: 'Receiving', path: '/inventory/receiving' },
      { label: 'Distribution', path: '/inventory/distribution' },
      { label: 'Consignment', path: '/inventory/consignment' },
      { label: 'Shipping Emb', path: '/inventory/shipping-embalage' },
      { label: 'Product Emb', path: '/inventory/product-embalage' },
    ]
  },
  { 
    label: 'History', 
    icon: <History className="w-5 h-5" />, 
    children: [
      { label: 'Product', path: '/history/product' },
      { label: 'Shipping Emb', path: '/history/shipping-embalage' },
      { label: 'Product Emb', path: '/history/product-embalage' },
    ]
  },
  { label: 'Archieve', path: '/archieve', icon: <Archive className="w-5 h-5" /> },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
      {/* Sidebar Desktop */}
      <aside className={`absolute z-20 md:relative md:flex flex-col w-64 h-full bg-slate-900 text-white transition-transform transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">PBF Manage</h1>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {MENU_ITEMS.map((menu, i) => (
            <div key={i} className="px-3">
              {menu.children ? (
                <div className="mb-2">
                  <div className="flex items-center text-slate-400 px-3 py-2 text-sm font-medium tracking-wider uppercase">
                    {menu.icon}
                    <span className="ml-2">{menu.label}</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    {menu.children.map(child => (
                      <Link 
                        key={child.path} 
                        to={child.path}
                        className={`block px-3 py-2 rounded-md text-sm transition-colors ${isActive(child.path) ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={menu.path!}
                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${isActive(menu.path!) ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  {menu.icon}
                  <span className="ml-2">{menu.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Button variant="danger" className="w-full" onClick={handleLogout}>Logout</Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b">
          <h1 className="text-lg font-bold text-slate-800">PBF Manage</h1>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
