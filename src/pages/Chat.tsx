/**
 * Chat hub — Класс / Учитель / Родитель-Учитель.
 * Wrapped in PlatformShell with activeKey="chat".
 */

import { useState } from 'react'
import PlatformShell from '../components/PlatformShell'
import ChatRoom from '../components/chat/ChatRoom'
import { loadSession } from '../lib/auth'
import { getClassrooms } from '../lib/classRoster'
import { getChatSocket } from '../lib/chatClient'

type TabKey = 'class' | 'dm-teacher' | 'parent-teacher'

interface Tab {
  key: TabKey
  label: string
  emoji: string
  roles: string[]
}

const TABS: Tab[] = [
  { key: 'class',         label: 'Класс',             emoji: '📚', roles: ['child', 'teacher', 'parent'] },
  { key: 'dm-teacher',    label: 'Учитель',            emoji: '👤', roles: ['child'] },
  { key: 'parent-teacher',label: 'Родитель → Учитель', emoji: '👨‍👩‍👦', roles: ['parent', 'teacher'] },
]

/** Sort two strings alphabetically and join with '-' for deterministic DM room names */
function dmRoom(a: string, b: string): string {
  return [a, b].sort().join('-')
}

export default function Chat() {
  const session = loadSession()
  const role = session?.role ?? 'child'
  const login = session?.login ?? localStorage.getItem('ek_child_name') ?? 'guest'
  const name = session?.name ?? login
  const senderRole = role

  const classrooms = getClassrooms()
  const classroomId = classrooms[0]?.id ?? null

  const roomClass = `class:${classroomId ?? 'demo'}`
  const roomDmTeacher = `dm:${dmRoom(login, 'teacher')}`
  const roomParentTeacher = `parent:${classroomId ?? 'demo'}`

  const visibleTabs = TABS.filter((t) => t.roles.includes(role))
  const [activeTab, setActiveTab] = useState<TabKey>(visibleTabs[0]?.key ?? 'class')

  const activeRoom =
    activeTab === 'class' ? roomClass :
    activeTab === 'dm-teacher' ? roomDmTeacher :
    roomParentTeacher

  // Check if socket is connected for the warning banner
  let socketConnected = false
  try {
    socketConnected = getChatSocket().connected
  } catch {
    socketConnected = false
  }

  return (
    <PlatformShell activeKey="chat">
      {/* Cover header */}
      <div
        className="kb-cover kb-cover--violet"
        style={{ paddingBottom: 32 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 36 }} aria-hidden>💬</span>
          <div>
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Коммуникация</div>
            <h1 className="h1" style={{ margin: 0, color: '#fff' }}>Чат</h1>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, maxWidth: 480 }}>
          Общайся с учителем и одноклассниками в реальном времени.
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {/* Backend warning */}
        {!socketConnected && (
          <div
            className="kb-state kb-state--info"
            style={{ marginBottom: 20, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start', background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
          >
            <span style={{ fontSize: 20 }}>ℹ️</span>
            <span>
              Чат работает в реальном времени через сервер. Убедитесь что бэкенд запущен.
            </span>
          </div>
        )}

        {/* Tab switcher */}
        {visibleTabs.length > 1 && (
          <div
            role="tablist"
            aria-label="Каналы чата"
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
              background: 'var(--bg-soft, #f5f3ff)',
              padding: 4,
              borderRadius: 12,
            }}
          >
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.key ? 700 : 400,
                  background: activeTab === tab.key ? 'var(--violet, #6b5ce7)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'var(--ink-soft, #6b7280)',
                  fontSize: 14,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span aria-hidden>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Room info */}
        <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--ink-soft, #6b7280)' }}>
          Комната: <code style={{ background: '#f3f0ff', padding: '1px 6px', borderRadius: 4 }}>{activeRoom}</code>
        </div>

        {/* Chat component */}
        <ChatRoom
          key={activeRoom}
          room={activeRoom}
          senderLogin={login}
          senderName={name}
          senderRole={senderRole}
          height={500}
        />
      </div>
    </PlatformShell>
  )
}
