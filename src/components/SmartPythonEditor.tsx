import { Suspense, lazy } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

/**
 * SmartPythonEditor — auto-selector between Monaco (desktop) and
 * CodeMirror 6 (mobile). Both are lazy-loaded so Monaco never ships to phones
 * and CodeMirror never ships to desktops that don't need it.
 *
 * Drop-in replacement for PurePythonEditor: same props, same behavior.
 */

const PurePythonEditor = lazy(() => import('./PurePythonEditor'))
const CodeMirrorPythonEditor = lazy(() => import('./CodeMirrorPythonEditor'))

interface Props {
  code: string
  onChange: (code: string) => void
  onRun?: () => void
  isRunning?: boolean
  error?: string | null
  readOnly?: boolean
}

export default function SmartPythonEditor(props: Props) {
  const isMobile = useIsMobile()

  return (
    <Suspense fallback={<div className="py-editor-loading" role="status">Загружаем редактор…</div>}>
      {isMobile ? <CodeMirrorPythonEditor {...props} /> : <PurePythonEditor {...props} />}
    </Suspense>
  )
}
