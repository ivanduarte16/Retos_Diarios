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
              `flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-body font-medium ${isActive ? 'bg-coral/10 text-coral' : 'text-ink/50 hover:bg-cream-dark hover:text-ink/80'}`
            }
          >
            {({ isActive }) => (
              <>
                {to === '/anadir' ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-coral text-white' : 'bg-cream-dark text-ink/40'}`}>
                    <Icon size={16} />
                  </div>
                ) : (
                  <Icon size={20} className={isActive ? 'text-coral' : ''} />
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
    <nav className="fixed bottom-0 left-0 right-0 w-full glass shadow-paper-lg z-50 safe-bottom">
      <div className="flex items-stretch h-16">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative ${isActive ? 'text-coral' : 'text-ink/30 hover:text-ink/60'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-coral rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {to === '/anadir' ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-paper transition-all ${isActive ? 'bg-coral' : 'bg-cream-dark'}`}>
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
