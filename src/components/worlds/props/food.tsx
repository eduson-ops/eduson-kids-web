// ─── Food ────────────────────────────────────────────────
export function Cake({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const CANDLE_COLORS = ['#ff5464', '#FFD43C', '#9FE8C7']
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size * 0.7, size * 0.7, size * 0.55, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 0.6, 0]}>
        <torusGeometry args={[size * 0.7, size * 0.08, 8, 20]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 0.88, 0]} castShadow>
        <cylinderGeometry args={[size * 0.52, size * 0.52, size * 0.42, 18]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, size * 1.1, 0]}>
        <torusGeometry args={[size * 0.52, size * 0.07, 8, 18]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.3, 0]} castShadow>
        <cylinderGeometry args={[size * 0.34, size * 0.34, size * 0.3, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {CANDLE_COLORS.map((cc, i) => {
        const angle = (i / CANDLE_COLORS.length) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(angle) * size * 0.18, size * 1.55, Math.sin(angle) * size * 0.18]}>
            <mesh>
              <cylinderGeometry args={[size * 0.04, size * 0.04, size * 0.22, 6]} />
              <meshStandardMaterial color={cc} roughness={0.7} />
            </mesh>
            <mesh position={[0, size * 0.18, 0]}>
              <coneGeometry args={[size * 0.04, size * 0.1, 6]} />
              <meshStandardMaterial color="#FF9454" emissive="#FF9454" emissiveIntensity={0.5} roughness={0.3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Donut({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  return (
    <group position={[pos[0], pos[1] + size * 0.28, pos[2]]} rotation={[Math.PI * 0.08, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[size * 0.42, size * 0.22, 14, 28]} />
        <meshStandardMaterial color="#C99E00" roughness={0.7} />
      </mesh>
      <mesh position={[0, size * 0.08, 0]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[size * 0.42, size * 0.24, 14, 28, Math.PI * 1.7]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
    </group>
  )
}

export function IceCream({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const scoop2Color = color === '#9FE8C7' ? '#FFB4C8' : '#9FE8C7'
  return (
    <group position={pos}>
      <mesh position={[0, size * 0.3, 0]} castShadow>
        <coneGeometry args={[size * 0.35, size * 0.8, 10]} />
        <meshStandardMaterial color="#C99E00" roughness={0.8} />
      </mesh>
      {[-0.15, 0, 0.15].map((y, i) => (
        <mesh key={i} position={[0, size * (0.2 + (y + 0.15) * 2.5), 0]}>
          <torusGeometry args={[size * (0.18 - i * 0.04), size * 0.012, 4, 14]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, size * 0.82, 0]} castShadow>
        <sphereGeometry args={[size * 0.42, 16, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, size * 1.26, 0]} castShadow>
        <sphereGeometry args={[size * 0.28, 14, 10]} />
        <meshStandardMaterial color={scoop2Color} roughness={0.5} />
      </mesh>
    </group>
  )
}
