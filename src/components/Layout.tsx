import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import logoUrl from '../assets/logo.png';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: '清单', to: '/todos' },
  { label: '日历', to: '/calendar' },
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="paper-shell min-h-screen text-stone-950">
      <header className="border-b border-zinc-200 bg-white/90 shadow-[0_1px_10px_rgba(24,24,27,0.04)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center">
            <img
              src={logoUrl}
              alt="To Do List Logo"
              className="h-28 w-auto shrink-0 bg-transparent object-contain sm:h-32 lg:h-36"
            />
          </div>
          <nav className="flex items-center gap-2" aria-label="主导航">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
