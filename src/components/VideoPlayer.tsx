import { useRef, useEffect, useState, useCallback } from 'react'

export type VideoSource =
  | { kind: 'mp4'; url: string }
  | { kind: 'vk'; videoId: string; oid?: string } // vk.com/video<oid>_<videoId>
  | { kind: 'hls'; url: string } // .m3u8
  | { kind: 'youtube'; id: string } // youtube.com/watch?v=<id>

interface VideoPlayerProps {
  src: VideoSource
  /** 0-100, defaults to 85 */
  completeThreshold?: number
  onComplete?: () => void
  /** Optional poster/thumbnail URL for native video */
  poster?: string
  className?: string
  style?: React.CSSProperties
}

function supportsNativeHls(): boolean {
  try {
    return document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== ''
  } catch {
    return false
  }
}

function buildVkEmbedUrl(videoId: string, oid?: string): string {
  return `https://vk.com/video_ext.php?oid=${oid ?? '-1'}&id=${videoId}&hd=2&js_api=1`
}

export default function VideoPlayer({
  src,
  completeThreshold = 85,
  onComplete,
  poster,
  className,
  style,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const completedRef = useRef(false)
  const [iframeError, setIframeError] = useState(false)
  const [hlsUnsupported, setHlsUnsupported] = useState(false)

  const handleTimeUpdate = useCallback(() => {
    if (completedRef.current || !videoRef.current || !onComplete) return
    const { currentTime, duration } = videoRef.current
    if (duration > 0 && (currentTime / duration) * 100 >= completeThreshold) {
      completedRef.current = true
      onComplete()
    }
  }, [completeThreshold, onComplete])

  useEffect(() => {
    completedRef.current = false
  }, [src])

  // HLS setup
  useEffect(() => {
    if (src.kind !== 'hls') return
    const video = videoRef.current
    if (!video) return

    if (supportsNativeHls()) {
      video.src = src.url
      return
    }

    // Attempt dynamic hls.js import (only works if installed)
    let hlsInstance: { loadSource(u: string): void; attachMedia(v: HTMLVideoElement): void; destroy(): void } | null = null
    import('hls.js')
      .then((mod) => {
        const Hls = mod.default
        if (!Hls.isSupported()) {
          setHlsUnsupported(true)
          return
        }
        hlsInstance = new Hls()
        hlsInstance.attachMedia(video)
        hlsInstance.loadSource(src.url)
      })
      .catch(() => {
        // hls.js not installed — try native anyway
        video.src = src.url
        video.onerror = () => setHlsUnsupported(true)
      })

    return () => {
      hlsInstance?.destroy()
    }
  }, [src])

  const baseVideoStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 12,
    background: '#000',
    display: 'block',
    ...style,
  }

  if (src.kind === 'youtube') {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${src.id}?rel=0&modestbranding=1`
    return (
      <div className={className} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000', ...style }}>
        <iframe
          src={embedUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Video Player"
        />
      </div>
    )
  }

  if (src.kind === 'vk') {
    if (iframeError) {
      return (
        <div className={className} style={{ ...baseVideoStyle, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
          Не удалось загрузить VK видео
        </div>
      )
    }
    const embedUrl = buildVkEmbedUrl(src.videoId, src.oid)
    return (
      <div className={className} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', background: '#000', ...style }}>
        <iframe
          src={embedUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          onError={() => setIframeError(true)}
          title="VK Video Player"
        />
      </div>
    )
  }

  if (src.kind === 'hls' && hlsUnsupported) {
    return (
      <div className={className} style={{ ...baseVideoStyle, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#fff', fontSize: 14, padding: 24 }}>
        <span style={{ fontSize: 32 }}>⚠</span>
        <p style={{ margin: 0, textAlign: 'center' }}>
          Ваш браузер не поддерживает HLS-потоки.<br/>Попробуйте Safari или установите расширение.
        </p>
        <a href={src.url} download style={{ color: '#a78bfa', textDecoration: 'underline' }}>
          Скачать видео
        </a>
      </div>
    )
  }

  // MP4 / WebM / native HLS
  const videoSrc = src.kind === 'mp4' ? src.url : src.kind === 'hls' ? src.url : undefined
  return (
    <video
      ref={videoRef}
      src={videoSrc}
      poster={poster}
      controls
      className={className}
      style={baseVideoStyle}
      onTimeUpdate={handleTimeUpdate}
      preload="metadata"
    />
  )
}
