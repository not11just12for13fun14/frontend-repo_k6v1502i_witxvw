import { useEffect, useState } from 'react'

export default function Sidebar({ backendUrl, conversations, onSelect, onCreate, activeId }) {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // No-op; parent loads
  }, [])

  return (
    <aside className="w-full sm:w-72 bg-slate-900/60 border-r border-slate-700/40 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700/40">
        <button
          onClick={async () => {
            if (loading) return
            setLoading(true)
            await onCreate()
            setLoading(false)
          }}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 transition-colors"
        >
          {loading ? 'Criando...' : 'Nova conversa'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {conversations.length === 0 && (
          <p className="text-slate-400 text-sm px-2 pt-2">Sem conversas. Crie a primeira acima.</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeId === c.id ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-200'
            }`}
            title={c.title}
          >
            <div className="line-clamp-2">{c.title}</div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">{c.model}</div>
          </button>
        ))}
      </div>
      <div className="p-3 text-[11px] text-slate-400 border-t border-slate-700/40">
        Backend: <span className="font-mono">{backendUrl}</span>
      </div>
    </aside>
  )
}
