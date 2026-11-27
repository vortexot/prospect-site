import type { Membrane } from './membrane'

const VERT = /* glsl */ `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = vec2(p.x, 1.0 - p.y);          // top-left origin, like the DOM
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = /* glsl */ `#version 300 es
precision highp float;
uniform sampler2D uImage;
uniform sampler2D uField;
uniform vec4 uCover;      // texture uv = element uv * xy + zw  (object-fit)
uniform vec2 uAspect;
uniform vec2 uPointer;
uniform float uTime;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  vec4 field = texture(uField, vUv);
  vec2 drag = field.rg;
  float swell = field.b;

  // nothing moves at the very border, so edges never tear or smear
  vec2 e = smoothstep(vec2(0.0), vec2(0.09), vUv) * smoothstep(vec2(0.0), vec2(0.09), 1.0 - vUv);
  float edge = e.x * e.y;

  // slow organic current, only where the surface is disturbed
  float energy = clamp(length(drag) * 20.0 + swell * 0.55, 0.0, 1.0);
  vec2 q = vUv * uAspect * 3.1;
  vec2 current = vec2(noise(q + vec2(uTime * 0.28, 0.0)), noise(q + vec2(7.3, -uTime * 0.23))) - 0.5;

  vec2 offset = drag;
  offset += current * 0.010 * energy;
  offset += (vUv - uPointer) * swell * 0.075;     // gentle lens: depth under the cursor
  vec2 uv = clamp(vUv - offset * edge, 0.0, 1.0);
  vec4 color = texture(uImage, uv * uCover.xy + uCover.zw);

  // soft relief lighting from the slope of the swell and of the drag
  vec2 texel = 1.5 / vec2(textureSize(uField, 0));
  vec3 l = texture(uField, vUv - vec2(texel.x, 0.0)).rgb;
  vec3 r = texture(uField, vUv + vec2(texel.x, 0.0)).rgb;
  vec3 t = texture(uField, vUv - vec2(0.0, texel.y)).rgb;
  vec3 b = texture(uField, vUv + vec2(0.0, texel.y)).rgb;
  float slope = (l.b - r.b) + (t.b - b.b);
  float fold = (l.r - r.r) + (t.g - b.g);
  float light = clamp(slope * 0.4 + fold * 1.6, -0.09, 0.11);
  color.rgb *= 1.0 + light * edge;
  color.rgb += swell * 0.010 * color.a;

  outColor = color;   // premultiplied
}`

/** Computed styles that must match between the image and the canvas covering it. */
const MIRRORED = ['transform', 'transformOrigin', 'opacity', 'filter', 'maskImage', 'webkitMaskImage', 'borderRadius', 'clipPath', 'zIndex'] as const

/** One WebGL canvas that can be laid exactly over any image. */
export class Surface {
  readonly canvas = document.createElement('canvas')
  img: HTMLImageElement | null = null
  membrane: Membrane | null = null
  presence = 0
  usedAt = 0
  lost = false
  private gl: WebGL2RenderingContext
  private uniforms: Record<string, WebGLUniformLocation | null> = {}
  private imageTex: WebGLTexture
  private fieldTex: WebGLTexture
  private styleCache: Record<string, string> = {}
  /** the image's own opacity, and its inline value to restore when we step away */
  private look = '1'
  private inlineOpacity = ''

  constructor() {
    const gl = this.canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true, depth: false, stencil: false })
    if (!gl) throw new Error('WebGL2 unavailable')
    this.gl = gl
    this.canvas.className = 'liquid'
    this.canvas.setAttribute('aria-hidden', 'true')
    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      this.lost = true
      this.release()
    })

    const program = gl.createProgram()!
    for (const [type, source] of [
      [gl.VERTEX_SHADER, VERT],
      [gl.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'shader error')
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link error')
    gl.useProgram(program)
    for (const name of ['uImage', 'uField', 'uCover', 'uAspect', 'uPointer', 'uTime']) this.uniforms[name] = gl.getUniformLocation(program, name)
    gl.uniform1i(this.uniforms.uImage, 0)
    gl.uniform1i(this.uniforms.uField, 1)

    const texture = (unit: number) => {
      const tex = gl.createTexture()!
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      return tex
    }
    this.imageTex = texture(0)
    this.fieldTex = texture(1)
  }

  /** Lay the canvas over `img`. It stays hidden until the first frame is drawn. */
  attach(img: HTMLImageElement, membrane: Membrane) {
    this.release()
    const gl = this.gl
    this.img = img
    this.membrane = membrane
    this.styleCache = {}
    this.look = getComputedStyle(img).opacity
    this.inlineOpacity = img.style.opacity

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.imageTex)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    // upload at the size it is shown (never above 2048) to save memory and avoid shimmer
    const rect = img.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const natural = { w: img.naturalWidth, h: img.naturalHeight }
    const wanted = Math.min(2048, Math.max(256, Math.ceil(Math.max(rect.width, rect.height) * dpr * 1.25)))
    const down = Math.min(1, wanted / Math.max(natural.w, natural.h))
    let source: TexImageSource = img
    if (down < 0.8 || img.src.endsWith('.svg')) {
      const c = document.createElement('canvas')
      c.width = Math.round(natural.w * (img.src.endsWith('.svg') ? Math.max(down, 1) : down))
      c.height = Math.round(natural.h * (img.src.endsWith('.svg') ? Math.max(down, 1) : down))
      const ctx = c.getContext('2d')!
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, c.width, c.height)
      source = c
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)

    this.canvas.style.visibility = 'hidden'
    img.after(this.canvas)
  }

  release() {
    if (this.img) this.img.style.opacity = this.inlineOpacity // the original comes back
    this.canvas.remove()
    this.img = null
    this.membrane = null
    this.presence = 0
  }

  /** Copy geometry and look from the image (which may be moving or restyled). */
  private mirror(img: HTMLImageElement) {
    const cs = getComputedStyle(img)
    const style: Record<string, string> = {
      left: `${img.offsetLeft}px`,
      top: `${img.offsetTop}px`,
      width: `${img.offsetWidth}px`,
      height: `${img.offsetHeight}px`,
    }
    for (const key of MIRRORED) style[key] = (cs as unknown as Record<string, string>)[key] ?? ''
    style.opacity = this.look // not the computed one: the image is hidden while covered
    const target = this.canvas.style as unknown as Record<string, string>
    for (const key in style)
      if (this.styleCache[key] !== style[key]) target[key] = this.styleCache[key] = style[key]
    return cs
  }

  draw(time: number) {
    const { gl, img, membrane } = this
    if (!img || !membrane || this.lost) return
    const cs = this.mirror(img)
    if (cs.visibility === 'hidden') {
      this.release() // its slide or plane left the screen: nothing to cover anymore
      return
    }
    const ew = img.offsetWidth
    const eh = img.offsetHeight
    if (!ew || !eh) return

    // canvas resolution follows the size on screen, not the layout size
    const shown = img.getBoundingClientRect().width || ew
    const scale = Math.min((shown / ew) * Math.min(window.devicePixelRatio || 1, 2), 1600 / Math.max(ew, eh))
    const w = Math.max(2, Math.round(ew * scale))
    const h = Math.max(2, Math.round(eh * scale))
    if (Math.abs(this.canvas.width - w) > 2 || Math.abs(this.canvas.height - h) > 2) {
      this.canvas.width = w
      this.canvas.height = h
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    // reproduce object-fit / object-position
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    let dw = ew
    let dh = eh
    if (cs.objectFit === 'cover' || cs.objectFit === 'contain') {
      const k = cs.objectFit === 'cover' ? Math.max(ew / iw, eh / ih) : Math.min(ew / iw, eh / ih)
      dw = iw * k
      dh = ih * k
    }
    const [posX, posY] = cs.objectPosition.split(' ')
    const offset = (value: string | undefined, free: number) => {
      const n = parseFloat(value ?? '')
      if (Number.isNaN(n)) return free / 2
      return value!.endsWith('%') ? (n / 100) * free : n
    }
    gl.uniform4f(this.uniforms.uCover, ew / dw, eh / dh, -offset(posX, ew - dw) / dw, -offset(posY, eh - dh) / dh)
    const short = Math.min(ew, eh)
    gl.uniform2f(this.uniforms.uAspect, ew / short, eh / short)
    gl.uniform2f(this.uniforms.uPointer, membrane.x, membrane.y)
    gl.uniform1f(this.uniforms.uTime, time)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.fieldTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, membrane.cols, membrane.rows, 0, gl.RGBA, gl.FLOAT, membrane.data)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    // inherit, never force 'visible': that would show through a hidden parent
    this.canvas.style.visibility = ''
    // the canvas now replaces the picture; leaving it visible would show a still copy behind
    // any translucent or masked image. opacity (not visibility) keeps it hoverable.
    if (img.style.opacity !== '0') img.style.opacity = '0'
  }

  destroy() {
    this.release()
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
