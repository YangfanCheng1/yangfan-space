/** <Figure src="…" alt="…" caption="…" /> — an image with a caption. `alt` is required. */
export function Figure({ src, alt, caption, width, height }: { src: string; alt: string; caption?: string; width?: number; height?: number }) {
  return (
    <figure className="not-prose my-8">
      <img src={src} alt={alt} width={width} height={height} loading="lazy" className="ink-border shadow-pop w-full bg-paper" />
      {caption && <figcaption className="mt-3 text-center font-mono text-xs text-ink/75">{caption}</figcaption>}
    </figure>
  )
}
