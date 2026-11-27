/**
 * Tool-agnostic event hook. Nothing is sent anywhere and no third-party script is
 * loaded: events are queued on `window.dataLayer` and re-emitted as a DOM event,
 * ready for whichever analytics tool is chosen.
 */
type Data = Record<string, string>

export function track(event: 'whatsapp_click', data: Data) {
  const w = window as Window & { dataLayer?: unknown[] }
  ;(w.dataLayer ??= []).push({ event, ...data })
  window.dispatchEvent(new CustomEvent(`prospect:${event}`, { detail: data }))
}
