# 3D Models

Сюда клади `.glb` / `.gltf` модели. Имена — понятные (npc-vendor.glb, coin.glb).

**Подключение в коде:**
```ts
import { useGLTF } from '@react-three/drei'

export function VendorNPC() {
  const { scene } = useGLTF('/models/npc-vendor.glb')
  return <primitive object={scene} />
}
```

**Бесплатные источники (CC0):**
- https://kenney.nl/assets
- https://quaternius.com
- https://poly.pizza
- https://sketchfab.com (фильтр Downloadable + CC0)

**Размеры:** до 5 МБ/файл. Больше — плохо для бандла и загрузки.

**Формат:** GLB предпочтительнее GLTF (один файл с embedded текстурами).
