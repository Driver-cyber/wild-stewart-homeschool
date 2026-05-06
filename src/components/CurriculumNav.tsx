import { NavLink } from 'react-router-dom'

const TABS: { to: string; label: string }[] = [
  { to: '/app/curriculum/reading-spelling', label: 'Reading & Spelling' },
  { to: '/app/curriculum/math',             label: 'Math'               },
]

export default function CurriculumNav() {
  return (
    <div className="flex items-center gap-1 mb-5 -mt-1 overflow-x-auto">
      {TABS.map(t => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-adult-ink text-white'
                : 'text-adult-muted hover:text-adult-ink hover:bg-adult-bg'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  )
}
