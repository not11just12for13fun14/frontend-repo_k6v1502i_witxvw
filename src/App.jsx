import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadConversations = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/conversations`)
      const data = await res.json()
      setConversations(data)
      if (!active && data.length > 0) setActive(data[0])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createConversation = async () => {
    const title = 'Nova conversa'
    const res = await fetch(`${backendUrl}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    const data = await res.json()
    setConversations((c) => [data, ...c])
    setActive(data)
  }

  const setActiveTitle = (title) => {
    if (!active) return
    const updated = { ...active, title }
    setActive(updated)
    setConversations((all) => all.map((c) => (c.id === updated.id ? updated : c)))
  }

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_45%)] pointer-events-none" />

      <div className="relative h-full grid grid-rows-[auto,1fr]">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">AI</div>
            <div className="font-semibold">Kiwi-like Chat</div>
          </div>
          <div className="text-xs text-slate-400">Beta</div>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-[18rem,1fr] h-[calc(100vh-56px)]">
          <Sidebar
            backendUrl={backendUrl}
            conversations={conversations}
            onSelect={setActive}
            onCreate={createConversation}
            activeId={active?.id}
          />

          <div className="hidden sm:block border-r border-slate-800/60" />

          <section className="min-h-0 flex flex-col">
            {loading ? (
              <div className="flex-1 grid place-items-center text-slate-400">Carregando...</div>
            ) : active ? (
              <Chat backendUrl={backendUrl} conversation={active} onTitleUpdate={setActiveTitle} />)
            : (
              <div className="flex-1 grid place-items-center text-slate-400 p-6 text-center">
                <div>
                  <div className="mb-2 text-xl font-semibold">Crie uma conversa</div>
                  <p className="text-slate-400 max-w-md">Clique em "Nova conversa" para começar a falar com a IA. Ela gera respostas úteis e sugestões a cada mensagem.</p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
