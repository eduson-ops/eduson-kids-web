interface Props {
  code: string
}

export default function PythonPanel({ code }: Props) {
  return (
    <div className="python-panel">
      <header className="python-panel-header">
        <span className="py-icon" aria-hidden>🐍</span>
        <strong>Python</strong>
        <small>живой код</small>
      </header>
      <pre className="python-code">{code || '# здесь появится Python'}</pre>
    </div>
  )
}
