export function Roll({ text }: { text: string }) {
  return (
    <span className="roll" data-text={text}>
      <span>{text}</span>
    </span>
  )
}
