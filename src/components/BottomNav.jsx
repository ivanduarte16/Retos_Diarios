import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, Plus, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Hoy', Icon: Home },
  { to: '/historial', label: 'Album', Icon: BookOpen },
  { to: '/anadir', label: 'Anadir', Icon: Plus },
  { to: '/perfil', label: 'Perfil', Icon: User },
]

export default function BottomNav({ isSidebar = false }) {
  if (isSidebar) {
    return (
      <nav className="space-y-2">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-2xl px-4 py-3 font-body font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary/12 text-primary shadow-paper'
                  : 'text-ink/55 hover:bg-cream-dark hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {to === '/anadir' ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-cream-dark text-ink/40'}`}>
                    <Icon size={16} />
                  </div>
                ) : (
                  <Icon size={20} className={isActive ? 'text-primary' : ''} />
                )}
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full border-t border-primary/12 bg-surface/92 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex h-16 max-w-2xl items-stretch px-1">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                isActive ? 'text-primary' : 'text-ink/35 hover:text-ink/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {to === '/anadir' ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-paper transition-all ${isActive ? 'bg-primary' : 'bg-cream-dark'}`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-ink/40'} />
                    </div>
                  ) : (
                    <Icon size={22} />
                  )}
                </motion.div>
                {to !== '/anadir' && <span className="font-body text-[10px] font-medium">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
