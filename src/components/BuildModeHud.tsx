import { useEffect, useState } from 'react'
import {
  BUILD_PIECES,
  getBuildState,
  setSelectedKind,
  subscribeBuild,
  toggleBuild,
  type BuildModeState,
  type BuildPieceKind,
} from '../lib/buildModeState'
import { SFX } from '../lib/audio'

/**
 * BuildModeHud — DOM-оверлей режима стройки:
 *   • Кнопка-тумблер режима (B) в правом верху
 *   • Горизонтальный хотбар с 4 кнопками-деталями + цифра-хоткей
 *   • Инвентарь счётчиков пикапа (ПКМ забранных деталей)
 *
 * Живёт поверх Canvas вьюпорта Test/Play-режима.
 */
export default function BuildModeHud() {
  const [bs, setBs] = useState<BuildModeState>(getBuildState())
  useEffect(() => subscribeBuild(setBs), [])

  const select = (kind: BuildPieceKind) => {
    setSelectedKind(kind)
    SFX.click()
  }

  return (
    <>
      {/* Toggle-кнопка — всегда видна */}
      <button
        className={`build-toggle ${bs.active ? 'on' : ''}`}
        onClick={() => {
          toggleBuild()
          SFX.click()
        }}
        title={bs.active ? 'Выключить режим стройки (B)' : 'Включить режим стройки (B)'}
      >
        <span className="build-toggle-icon">🔨</span>
        <span className="build-toggle-label">{bs.active ? 'СТРОЙКА: ВКЛ' : 'Стройка'}</span>
        <span className="build-toggle-kbd">B</span>
      </button>

      {/* Хотбар — только когда build mode активен */}
      {bs.active && (
        <div className="build-hotbar">
          {BUILD_PIECES.map((p) => {
            const isActive = bs.selectedKind === p.kind
            const count = bs.inventory[p.kind]
            return (
              <button
                key={p.kind}
                className={`build-slot ${isActive ? 'active' : ''}`}
                onClick={() => select(p.kind)}
                title={`${p.label} (${p.hotkey})`}
              >
                <span className="build-slot-emoji">{p.emoji}</span>
                <span className="build-slot-label">{p.label}</span>
                <span className="build-slot-kbd">{p.hotkey}</span>
                {count > 0 && <span className="build-slot-count">×{count}</span>}
              </button>
            )
          })}
          <div className="build-hint-block">
            <div><b>ЛКМ</b> — поставить</div>
            <div><b>ПКМ</b> — забрать</div>
            <div><b>B</b> — выйти</div>
          </div>
        </div>
      )}
    </>
  )
}
