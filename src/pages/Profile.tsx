import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AvatarModel from '../components/AvatarModel'
import PlayerCharacter, { type PlayerVisualHandle } from '../components/PlayerCharacter'
import Sun from '../components/Sun'
import GradientSky from '../components/GradientSky'
import {
  COLOR_PALETTE,
  PRESET_AVATARS,
  loadAvatar,
  saveAvatar,
  type Avatar,
  type CharacterModel,
  type EarStyle,
  type HatStyle,
  type TailStyle,
  type BodyShape,
} from '../lib/avatars'
import { NikselMini } from '../design/mascot/Niksel'

export default function Profile() {
  const navigate = useNavigate()
  const [avatar, setAvatar] = useState<Avatar>(() => loadAvatar())

  const patch = (p: Partial<Avatar>) => setAvatar((a) => ({ ...a, ...p }))

  const saveAndBack = async () => {
    saveAvatar(avatar)
    const { apiPutAvatar } = await import('../lib/api')
    void apiPutAvatar(avatar) // fire-and-forget sync to backend if online
    navigate('/')
  }

  return (
    <div className="profile-root">
      <aside className="profile-side">
        <header className="profile-side-top">
          <Link to="/" className="studio-brand-lockup" aria-label="Эдусон Kids — главная" style={{ color: 'var(--ink)', fontSize: 14 }}>
            <NikselMini size={28} />
            <span>Эдусон</span>
            <span className="kb-shell-brand-kids">Kids</span>
          </Link>
          <h1 style={{ marginTop: 12 }}>Мой аватар</h1>
        </header>

        <label className="profile-row">
          <span>Имя</span>
          <input
            value={avatar.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="text-input"
          />
        </label>

        <section>
          <h3>Пресеты</h3>
          <div className="preset-grid">
            {PRESET_AVATARS.map((p) => (
              <button
                key={p.name}
                className="preset-card"
                onClick={() => setAvatar({ ...p })}
                title={p.name}
              >
                <div
                  className="preset-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${p.bodyColor}, ${p.accentColor})`,
                  }}
                >
                  {p.character !== 'custom' && <span className="preset-tag">3D</span>}
                </div>
                <small>{p.name}</small>
              </button>
            ))}
          </div>
        </section>

        <Section title="Персонаж">
          <PillGroup<CharacterModel>
            value={avatar.character}
            options={[
              ['custom', 'Свой котик'],
              ['bunny', 'Кролик'],
              ['cactoro', 'Кактус'],
              ['alien', 'Алиен'],
              ['birb', 'Птичка'],
              ['blueDemon', 'Демон'],
            ]}
            onChange={(v) => patch({ character: v })}
          />
          <p className="help-small">
            {avatar.character === 'custom'
              ? 'Собери сам: форма, уши, шляпа, хвост, цвета — ниже.'
              : '3D-модель с анимациями: ходьба, бег, прыжок.'}
          </p>
        </Section>

        <Section title="Форма тела (только для своего котика)">
          <PillGroup<BodyShape>
            value={avatar.bodyShape}
            options={[
              ['standard', 'Обычная'],
              ['chubby', 'Толстенькая'],
              ['thin', 'Худенькая'],
            ]}
            onChange={(v) => patch({ bodyShape: v })}
          />
        </Section>

        <Section title="Цвет тела">
          <ColorPicker value={avatar.bodyColor} onChange={(c) => patch({ bodyColor: c })} />
        </Section>
        <Section title="Цвет головы">
          <ColorPicker value={avatar.headColor} onChange={(c) => patch({ headColor: c })} />
        </Section>
        <Section title="Акцент (уши / хвост / шляпа)">
          <ColorPicker value={avatar.accentColor} onChange={(c) => patch({ accentColor: c })} />
        </Section>

        <Section title="Уши">
          <PillGroup<EarStyle>
            value={avatar.earStyle}
            options={[
              ['cat', 'Кошачьи'],
              ['bear', 'Медвежьи'],
              ['bunny', 'Заячьи'],
              ['none', 'Без ушей'],
            ]}
            onChange={(v) => patch({ earStyle: v })}
          />
        </Section>

        <Section title="Шляпа">
          <PillGroup<HatStyle>
            value={avatar.hatStyle}
            options={[
              ['none', 'Без'],
              ['cap', 'Кепка'],
              ['crown', 'Корона'],
              ['helmet', 'Шлем'],
              ['wizard', 'Колпак'],
            ]}
            onChange={(v) => patch({ hatStyle: v })}
          />
        </Section>

        <Section title="Хвост">
          <PillGroup<TailStyle>
            value={avatar.tailStyle}
            options={[
              ['none', 'Без'],
              ['cat', 'Кошачий'],
              ['fluffy', 'Пушистый'],
              ['dragon', 'Дракона'],
            ]}
            onChange={(v) => patch({ tailStyle: v })}
          />
        </Section>

        <div className="profile-actions">
          <button onClick={saveAndBack}>Сохранить</button>
          <button className="ghost" onClick={() => navigate('/')}>
            Отмена
          </button>
        </div>
      </aside>

      <div className="profile-preview">
        <Canvas shadows="soft" camera={{ position: [0, 1.8, 5], fov: 40, far: 600 }}>
          <GradientSky top="#3d88ff" bottom="#b8e1ff" />
          <Sun position={[50, 30, 20]} />
          <ambientLight intensity={0.9} />
          <hemisphereLight args={['#bfe4ff', '#5bc87d', 0.55]} />
          <directionalLight
            position={[50, 30, 20]}
            intensity={1.3}
            color="#fff3d8"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-20, 15, -15]} intensity={0.4} color="#b0d8ff" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[4, 32]} />
            <meshStandardMaterial color="#48c774" />
          </mesh>
          <PreviewAvatar avatar={avatar} />
          <OrbitControls
            target={[0, 1.1, 0]}
            enablePan={false}
            minDistance={3}
            maxDistance={7}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
        <div className="preview-hint">Крути мышью — посмотри со всех сторон</div>
      </div>
    </div>
  )
}

function PreviewAvatar({ avatar }: { avatar: Avatar }) {
  const handle = useRef<PlayerVisualHandle>(null!)
  const phase = useRef(0)
  const idle = useRef(0)
  useFrame((_, dt) => {
    phase.current += dt * 3
    idle.current += dt * 2
    handle.current?.update({
      speed: 0,
      phase: phase.current,
      airborne: false,
      idlePhase: idle.current,
    })
  })
  return (
    <group position={[0, 0, 0]}>
      {avatar.character && avatar.character !== 'custom' ? (
        <PlayerCharacter ref={handle} which={avatar.character} />
      ) : (
        <AvatarModel ref={handle} avatar={avatar} />
      )}
    </group>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="profile-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function PillGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}) {
  return (
    <div className="pill-group">
      {options.map(([v, label]) => (
        <button
          key={v}
          className={`pill ${v === value ? 'active' : ''}`}
          onClick={() => onChange(v)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="color-grid">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          className={`color-dot ${c === value ? 'active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          type="button"
          aria-label={c}
        />
      ))}
      <label className="color-custom">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  )
}
