import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import logoUrl from '../assets/logo.png';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: '待办清单', to: '/todos' },
  { label: '日历', to: '/calendar' },
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="paper-shell min-h-screen text-stone-950">
      <header className="border-b border-zinc-200 bg-white/90 shadow-[0_1px_10px_rgba(24,24,27,0.04)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="To Do List Logo"
              className="h-9 w-9 shrink-0 rounded-md object-contain"
            />
            <div>
              <p className="text-xs font-medium uppercase text-zinc-500">
                To Do List
              </p>
              <h1 className="text-lg font-semibold tracking-normal text-zinc-950">
                To Do List
              </h1>
            </div>
            <svg
              className="hidden h-9 w-12 opacity-80 lg:block"
              viewBox="0 0 128 88"
              role="img"
              aria-label="To Do List 温暖手账风插画"
            >
              <rect x="7" y="36" width="43" height="33" rx="5" fill="#fff7ed" />
              <path d="M4 39 28 18l25 21H4Z" fill="#b91c1c" />
              <rect x="22" y="50" width="12" height="19" rx="2" fill="#7f1d1d" />
              <circle cx="35" cy="29" r="3" fill="#fff7ed" />
              <ellipse cx="84" cy="56" rx="28" ry="17" fill="#ffffff" />
              <circle cx="61" cy="51" r="14" fill="#ffffff" />
              <path d="M51 44c-4-10 10-14 12-4" fill="#111827" />
              <path d="M69 42c6-8 18 0 9 8" fill="#111827" />
              <circle cx="58" cy="51" r="2" fill="#111827" />
              <circle cx="66" cy="51" r="2" fill="#111827" />
              <path
                d="M61 58c3 2 6 2 9 0"
                stroke="#111827"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M104 57c11-10 18 4 7 11"
                stroke="#111827"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M68 69v8M91 69v8"
                stroke="#111827"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M53 75h54"
                stroke="#111827"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
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
