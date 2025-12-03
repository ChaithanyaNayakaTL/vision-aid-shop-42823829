import { NavLink } from '@/components/NavLink';
import { useApp } from '@/contexts/AppContext';
import { Home, ShoppingCart, Settings, HelpCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const { cartCount } = useApp();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, shortcut: 'Ctrl+H' },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, shortcut: 'Ctrl+Shift+C' },
    { to: '/settings', label: 'Settings', icon: Settings, shortcut: 'Ctrl+,' },
    { to: '/help', label: 'Help', icon: HelpCircle, shortcut: '?' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-display text-sm font-bold text-primary">Ai</span>
          </div>
          <span className="font-display text-base font-semibold tracking-wide text-foreground">
            SmartShop
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 md:gap-2 px-2 py-1.5 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex items-center gap-2 rounded-full px-4 py-2 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-foreground"
              activeClassName="bg-primary text-primary-foreground shadow-md"
              aria-label={`${item.label}${item.to === '/cart' && cartCount > 0 ? `, ${cartCount} items` : ''}`}
              title={`${item.label} (${item.shortcut})`}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden text-sm font-medium md:inline">{item.label}</span>
              {item.to === '/cart' && cartCount > 0 && (
                <span className="cart-badge" aria-hidden="true">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Download Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Download app"
            title="Download"
            className="ml-1 rounded-full hover:bg-primary/10"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
