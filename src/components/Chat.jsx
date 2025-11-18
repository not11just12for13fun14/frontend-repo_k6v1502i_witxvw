import { useEffect, useRef, useState } from 'react'

export default function Chat({ backendUrl, conversation, onTitleUpdate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (!conversation) return
    ;(async () => {
      try {
        const res = await fetch(`${backendUrl}/api/conversations/${conversation.id}/messages`)
        const data = await res.json()
        setMessages(data)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [conversation, backendUrl])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const send = async () => {
    if (!input.trim() || !conversation) return
    setLoading(true)
    const userContent = input
    setInput('')

    // optimistic user message
    const optimisticId = `tmp-${Date.now()}`
    setMessages((m) => [...m, { id: optimisticId, role: 'user', content: userContent }])

    try {
      const res = await fetch(`${backendUrl}/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: userContent })
      })
      const data = await res.json()

      // replace optimistic with server responses
      setMessages((m) => [...m.filter((x) => x.id !== optimisticId), ...data])

      // Auto title from first user message
      if (messages.length === 0) {
        const title = userContent.slice(0, 40)
        onTitleUpdate?.(title)
      }
    } catch (e) {
      console.error(e)
      setMessages((m) => m.filter((x) => x.id !== optimisticId))
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div ref={listRef} className="flex-1 overflow-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm">Comece a conversa com uma pergunta.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`max-w-3xl ${m.role === 'user' ? 'ml-auto' : ''}`}>
              <div className={`rounded-2xl px-4 py-3 shadow ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/70 border border-slate-700/40 text-slate-100'
              }`}>
                <pre className="whitespace-pre-wrap break-words font-sans text-sm">{m.content}</pre>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-700/40 bg-slate-900/60">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Digite sua mensagem..."
            rows={1}
            className="flex-1 resize-none rounded-lg bg-slate-800 text-slate-100 placeholder-slate-500 border border-slate-700/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={send}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
