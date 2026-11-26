import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MARK_BODY, MARK_TIP, type Point } from '../brand/logoPaths'
import { S } from '../core/sceneState'
import { clamp01, easeInOut, lerp } from '../core/env'

const TAU = Math.PI * 2
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

function markShapes(width: number) {
  const k = width / 234
  const v = ([x, y]: Point) => new THREE.Vector2((x - 117) * k, -(y - 128) * k)
  return [new THREE.Shape(MARK_BODY.map(v)), new THREE.Shape(MARK_TIP.map(v))]
}

type Pose = { p: THREE.Vector3; q: THREE.Quaternion; s: number }
const pose = (): Pose => ({ p: new THREE.Vector3(), q: new THREE.Quaternion(), s: 1 })

type Slice = {
  i: number
  t: number
  kind: 'solid' | 'outline' | 'core'
  root: THREE.Group
  r: number[]
  lag: number
  hover: number
  cur: Pose
}

const PARTICLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uConverge;
  uniform float uPixel;
  uniform float uSize;
  uniform float uFade;
  uniform vec3 uMouse;
  uniform float uMouseForce;
  attribute float aRand;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += cos(uTime * 0.11 + aRand * 31.0) * 0.35;
    p.y += sin(uTime * 0.17 + aRand * 17.0) * 0.35;
    vec3 d = p - uMouse;
    d.z *= 0.4;
    float dist = length(d);
    float push = smoothstep(2.6, 0.0, dist) * uMouseForce;
    p += normalize(d + vec3(1e-4)) * push * 1.25;
    float c = clamp(uConverge * 1.35 - aRand * 0.35, 0.0, 1.0);
    p = mix(p, vec3(0.0), c * c * (3.0 - 2.0 * c));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (0.35 + aRand * 0.9) / -mv.z;
    vAlpha = (0.18 + 0.82 * aRand) * smoothstep(34.0, 5.0, -mv.z) * uFade * (1.0 - c * 0.85);
  }
`
const PARTICLE_FRAG = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.0), a * a * vAlpha);
  }
`

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.18, 'rgba(255,255,255,0.45)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export class Universe {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80)
  private group = new THREE.Group()
  private slices: Slice[] = []
  private beams: THREE.Mesh[] = []
  private frames: THREE.LineLoop[] = []
  private particles: THREE.Points
  private pMat: THREE.ShaderMaterial
  private light = new THREE.PointLight(0xffffff, 24, 14, 2)
  private coreMat: THREE.MeshStandardMaterial
  private edgeSolid: THREE.LineBasicMaterial
  private edgeOutline: THREE.LineBasicMaterial
  private frameMats: THREE.LineBasicMaterial[] = []
  private coreGlow: THREE.Sprite
  private singularity: THREE.Sprite
  private raycaster = new THREE.Raycaster()
  private pickables: THREE.Object3D[] = []
  private mouseWorld = new THREE.Vector3()
  private mouseTarget = new THREE.Vector3()
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  private ndc = new THREE.Vector2()
  private pointerMoved = false
  private clock = new THREE.Clock()
  private time = 0
  private running = false
  private dpr: number
  private maxDpr: number
  private frameTimes: number[] = []
  private frameNo = 0
  private idleRendered = false
  private downgraded = false
  private disposables: { dispose(): void }[] = []
  private n: number
  private height: number
  private tmp = { a: pose(), b: pose(), c: pose(), d: pose(), e: new THREE.Euler(), v: new THREE.Vector3() }
  private camPos = new THREE.Vector3(0, -0.3, 11)
  private camLook = new THREE.Vector3()
  private groupX = 0
  private opts: { lowPower: boolean; reduced: boolean; pointer: boolean }

  constructor(private canvas: HTMLCanvasElement, opts: { lowPower: boolean; reduced: boolean; pointer: boolean }) {
    this.opts = opts
    this.n = opts.lowPower ? 13 : 18
    this.height = opts.lowPower ? 4.9 : 5.5
    this.dpr = Math.min(window.devicePixelRatio || 1, opts.lowPower ? 1.5 : 1.75)
    this.maxDpr = this.dpr

    // MSAA everywhere: thin chrome edges and lines alias badly without it
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    const room = new RoomEnvironment()
    // 128px is plenty for soft studio reflections on near-black metal, and builds ~4x faster
    const env = pmrem.fromScene(room, 0.035, 0.1, 100, { size: 128 }).texture
    room.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      }
    })
    pmrem.dispose()
    this.disposables.push(env)
    this.scene.environment = env
    this.scene.background = new THREE.Color(0x050505)
    this.scene.fog = new THREE.Fog(0x050505, 10, 26)

    this.scene.add(this.light)
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(-2, 7, 3)
    this.scene.add(key)

    // ---------- the tower: Prospect star as floor plates ----------
    const shapes = markShapes(3.3)
    const solidGeo = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.016,
      bevelSegments: 2,
      curveSegments: 1,
    })
    solidGeo.translate(0, 0, -0.05)
    const flat = new THREE.ShapeGeometry(shapes)
    const outlineGeo = new THREE.EdgesGeometry(flat)
    flat.dispose()
    this.disposables.push(solidGeo, outlineGeo)

    // black chrome. MeshStandard, not Physical: clearcoat was invisible on near-black
    // metal but doubled shader compile time and added a specular pass every frame.
    const chrome = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 1, roughness: 0.17, envMapIntensity: 1.7 })
    // keep the white outlines in front of the faces they sit on (no flicker)
    chrome.polygonOffset = true
    chrome.polygonOffsetFactor = 1
    chrome.polygonOffsetUnits = 1
    this.coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0 })
    this.edgeSolid = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false })
    this.edgeOutline = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false })
    this.disposables.push(chrome, this.coreMat, this.edgeSolid, this.edgeOutline)

    const rand = rng(7)
    const coreIndex = Math.round(this.n * 0.62)
    for (let i = 0; i < this.n; i++) {
      const kind: Slice['kind'] = i === coreIndex ? 'core' : i % 3 === 1 ? 'outline' : 'solid'
      const root = new THREE.Group()
      if (kind !== 'outline') {
        const mesh = new THREE.Mesh(solidGeo, kind === 'core' ? this.coreMat : chrome)
        mesh.userData.index = i
        root.add(mesh)
        this.pickables.push(mesh)
        const edges = new THREE.LineSegments(outlineGeo, this.edgeSolid)
        edges.position.z = 0.072
        root.add(edges)
      } else {
        root.add(new THREE.LineSegments(outlineGeo, this.edgeOutline))
      }
      this.group.add(root)
      const t = i / (this.n - 1)
      this.slices.push({
        i,
        t,
        kind,
        root,
        r: Array.from({ length: 8 }, rand),
        lag: 0.05 + (1 - Math.abs(t - 0.5) * 2) * 0.05 + rand() * 0.02,
        hover: 0,
        cur: { p: new THREE.Vector3(0, (t - 0.5) * this.height, 0), q: new THREE.Quaternion(), s: 0.0001 },
      })
    }

    // architectural columns piercing the plates
    const beamGeo = new THREE.BoxGeometry(0.022, 1, 0.022)
    const beamMat = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 0.7, roughness: 0.3 })
    this.disposables.push(beamGeo, beamMat)
    const beamAngles = [0.3, 1.5, 2.6, 3.9, 5.1]
    beamAngles.forEach((a, k) => {
      const b = new THREE.Mesh(beamGeo, beamMat)
      const rad = 0.55 + (k % 2) * 0.55
      b.position.set(Math.cos(a) * rad, (k % 3) * 0.25 - 0.2, Math.sin(a) * rad)
      b.userData.h = this.height * (0.85 + (k % 3) * 0.18)
      this.group.add(b)
      this.beams.push(b)
    })
    this.scene.add(this.group)

    // ---------- floating frames: the largest becomes the showcase frame ----------
    const rectGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.8, -0.5, 0),
      new THREE.Vector3(0.8, -0.5, 0),
      new THREE.Vector3(0.8, 0.5, 0),
      new THREE.Vector3(-0.8, 0.5, 0),
    ])
    this.disposables.push(rectGeo)
    for (let k = 0; k < 3; k++) {
      const m = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false })
      const f = new THREE.LineLoop(rectGeo, m)
      this.frameMats.push(m)
      this.disposables.push(m)
      this.frames.push(f)
      this.scene.add(f)
    }

    // ---------- glow sprites ----------
    const glow = glowTexture()
    this.disposables.push(glow)
    const glowMat = new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.3 })
    const singMat = glowMat.clone()
    this.disposables.push(glowMat, singMat)
    this.coreGlow = new THREE.Sprite(glowMat)
    this.scene.add(this.coreGlow)
    this.singularity = new THREE.Sprite(singMat)
    this.singularity.scale.setScalar(0.001)
    this.scene.add(this.singularity)

    // ---------- particles ----------
    const count = opts.lowPower ? 550 : 1700
    const pos = new Float32Array(count * 3)
    const rnd = new Float32Array(count)
    const pr = rng(11)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (pr() - 0.5) * 30
      pos[i * 3 + 1] = (pr() - 0.5) * 17
      pos[i * 3 + 2] = -13 + pr() * 17
      rnd[i] = pr()
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pGeo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1))
    this.pMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uConverge: { value: 0 },
        uPixel: { value: this.dpr },
        uSize: { value: opts.lowPower ? 26 : 30 },
        uFade: { value: 1 },
        uMouse: { value: this.mouseWorld },
        uMouseForce: { value: opts.pointer && !opts.reduced ? 1 : 0 },
      },
    })
    this.particles = new THREE.Points(pGeo, this.pMat)
    this.particles.frustumCulled = false
    this.scene.add(this.particles)
    this.disposables.push(pGeo, this.pMat)

    window.addEventListener('resize', this.resize)
    window.addEventListener('pointermove', this.onPointer, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)
    this.resize()
  }

  /** Compile shaders up front so the first visible frame does not stutter. */
  async warmup() {
    try {
      await this.renderer.compileAsync(this.scene, this.camera)
    } catch {
      this.renderer.compile(this.scene, this.camera)
    }
    this.renderer.render(this.scene, this.camera)
  }

  start() {
    if (this.running) return
    this.running = true
    this.clock.getDelta()
    this.renderer.setAnimationLoop(this.tick)
  }

  stop() {
    this.running = false
    this.renderer.setAnimationLoop(null)
  }

  dispose() {
    this.stop()
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointermove', this.onPointer)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
  }

  private onVisibility = () => (document.hidden ? this.stop() : this.start())

  private onPointer = (e: PointerEvent) => {
    if (!this.opts.pointer || this.opts.reduced) return
    S.px = (e.clientX / window.innerWidth) * 2 - 1
    S.py = -(e.clientY / window.innerHeight) * 2 + 1
    this.pointerMoved = true
  }

  private resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  // ---------------- poses ----------------
  private taper(t: number) {
    return 0.5 + 0.6 * Math.pow(Math.sin(Math.PI * (0.08 + t * 0.84)), 0.75)
  }

  private heroPose(sl: Slice, out: Pose, follow: number) {
    const { e } = this.tmp
    const shear = (sl.t - 0.5) * 2
    const side = sl.i % 2 ? 1 : -1
    const spin = sl.t * 2.7 + this.time * 0.07 * (sl.i % 2 ? 1 : -0.55) + sl.hover * 0.95
    out.p.set(S.px * 0.5 * shear * follow + sl.hover * 0.55 * side, (sl.t - 0.5) * this.height + S.py * 0.12 * shear * follow, -S.px * 0.3 * shear * follow)
    e.set(-Math.PI / 2 + S.py * 0.1 * follow, 0, spin)
    out.q.setFromEuler(e)
    out.s = this.taper(sl.t) * (1 + sl.hover * 0.06)
  }

  private debrisPose(sl: Slice, out: Pose) {
    const { e } = this.tmp
    const [r0, r1, r2, r3, r4, r5, r6] = sl.r
    const a = r0 * TAU + this.time * 0.012 * (r1 - 0.5)
    const R = 4.6 + r1 * 4.4
    out.p.set(Math.cos(a) * R * 1.45, Math.sin(a) * R * 0.78, -4.5 + r2 * 8 - S.dim * 4)
    e.set(r3 * TAU + this.time * 0.05, r4 * TAU, r5 * TAU + this.time * 0.035)
    out.q.setFromEuler(e)
    out.s = 0.5 + r6 * 0.55
  }

  private stagePose(k: number, sl: Slice, out: Pose) {
    const { e } = this.tmp
    const [r0, r1, r2, r3, r4, r5, r6] = sl.r
    if (k === 0) {
      out.p.set((r0 - 0.5) * 4.6, (r1 - 0.5) * 3.8, (r2 - 0.5) * 3.2)
      e.set(r3 * TAU, r4 * TAU, r5 * TAU)
      out.s = 0.38 + r6 * 0.35
    } else if (k === 1) {
      const cols = this.opts.lowPower ? 4 : 6
      const rows = Math.ceil(this.n / cols)
      const c = sl.i % cols
      const row = Math.floor(sl.i / cols)
      out.p.set((c - (cols - 1) / 2) * 1.02, ((rows - 1) / 2 - row) * 1.12, 0)
      e.set(0, 0, 0)
      out.s = 0.29
    } else if (k === 2) {
      out.p.set(0, (sl.t - 0.5) * this.height * 1.4, 0)
      e.set(-Math.PI / 2 + 0.05, 0, 0.4)
      out.s = this.taper(sl.t)
    } else {
      out.p.set(0, (sl.t - 0.5) * this.height, 0)
      e.set(-Math.PI / 2, 0, sl.t * 2.7 + this.time * 0.05 * (sl.i % 2 ? 1 : -0.5))
      out.s = this.taper(sl.t)
    }
    out.q.setFromEuler(e)
  }

  private mix(a: Pose, b: Pose, t: number) {
    a.p.lerp(b.p, t)
    a.q.slerp(b.q, t)
    a.s = lerp(a.s, b.s, t)
  }

  // ---------------- frame loop ----------------
  private tick = () => {
    this.frameNo++
    const halfRate = S.dim > 0.6
    // reading sections only show slow debris: 30 fps is enough there
    if (halfRate && this.frameNo % 2) return
    // after the final collapse there is nothing left to draw
    if (this.idleRendered && S.converge >= 0.999) {
      this.clock.getDelta()
      return
    }
    const raw = this.clock.getDelta()
    const dt = Math.min(raw, 0.05)
    const reduced = this.opts.reduced
    if (!reduced) this.time += dt
    if (halfRate) this.frameTimes.length = 0
    else this.adapt(raw)

    const { a, b, c, d } = this.tmp
    const explode = easeInOut(clamp01(Math.max(S.explode, 1 - S.assemble)))
    const pm = easeInOut(clamp01(S.processMix))
    const stage = Math.min(Math.max(S.stage, 0), 3)
    const k = Math.min(Math.floor(stage), 2)
    const kf = easeInOut(stage - k)
    const conv = clamp01(S.converge)
    const follow = (1 - explode) * (1 - pm)
    const heroLive = explode < 0.04 && pm < 0.04 && conv === 0
    const wide = this.camera.aspect > 1.1

    // hover picking (hero only)
    if (this.pointerMoved && heroLive) {
      this.pointerMoved = false
      this.ndc.set(S.px, S.py)
      this.raycaster.setFromCamera(this.ndc, this.camera)
      const hit = this.raycaster.intersectObjects(this.pickables, false)[0]
      S.hovered = hit ? (hit.object.userData.index as number) : -1
    } else if (!heroLive) S.hovered = -1

    const easeK = (lag: number) => (reduced ? 0.25 : 1 - Math.pow(1 - lag, dt * 60))

    for (const sl of this.slices) {
      sl.hover += ((S.hovered === sl.i ? 1 : 0) - sl.hover) * easeK(0.09)
      this.heroPose(sl, a, follow)
      if (explode > 0) {
        this.debrisPose(sl, b)
        this.mix(a, b, explode)
      }
      if (pm > 0) {
        this.stagePose(k, sl, c)
        if (kf > 0) {
          this.stagePose(k + 1, sl, d)
          this.mix(c, d, kf)
        }
        this.mix(a, c, pm)
      }
      if (conv > 0) {
        const ci = easeInOut(clamp01(conv * 1.5 - sl.t * 0.5))
        a.p.multiplyScalar(1 - ci)
        a.s *= 1 - ci
      }
      const f = easeK(sl.lag)
      sl.cur.p.lerp(a.p, f)
      sl.cur.q.slerp(a.q, f)
      sl.cur.s = lerp(sl.cur.s, a.s, f)
      sl.root.position.copy(sl.cur.p)
      sl.root.quaternion.copy(sl.cur.q)
      sl.root.scale.setScalar(Math.max(sl.cur.s, 0.0001))
      sl.root.visible = sl.cur.s > 0.002
    }

    // group placement
    const heroX = wide ? 1.25 : 0
    const processX = wide ? 2.35 : 0
    const gx = lerp(lerp(heroX, heroX * 0.4, explode), processX, pm) * (1 - conv)
    this.groupX = lerp(this.groupX, gx, easeK(0.05))
    this.group.position.x = this.groupX
    const rotHero = 0.35 + S.spin + S.px * 0.4 * follow
    const rotProcess = S.px * 0.12 + (stage > 2 ? (stage - 2) * 0.9 : 0)
    this.group.rotation.y = lerp(this.group.rotation.y, lerp(rotHero, rotProcess, pm), easeK(0.045))
    // lean the tower toward the camera so the star floor plates read from above
    const lean = lerp(0.4 - S.py * 0.08 * follow, pm * smooth(1.6, 2.4, stage) * 0.28, pm)
    this.group.rotation.x = lerp(this.group.rotation.x, lean, easeK(0.045))

    // beams: scaffolding in hero and during construction
    const beamVis = (1 - explode) * (1 - pm) + pm * smooth(1.45, 2.25, stage)
    const bv = beamVis * (1 - conv)
    for (const bm of this.beams) {
      bm.scale.y = Math.max(0.0001, bm.userData.h * bv)
      bm.visible = bv > 0.01
    }

    // light & materials
    const lit = pm * smooth(2.2, 3, stage)
    this.coreMat.emissiveIntensity = 0.42 + lit * 2.2
    this.edgeSolid.opacity = 0.2 + pm * smooth(1.5, 2.3, stage) * 0.45 + lit * 0.25
    this.edgeOutline.opacity = 0.7 + lit * 0.3
    this.scene.environmentIntensity = (0.95 + lit * 0.4) * (1 - S.dim * 0.55) * (1 - conv * 0.8)
    this.light.position.lerp(this.tmp.v.set(S.px * 4.2 + this.groupX, S.py * 3, 3.4), easeK(0.06))
    this.light.intensity = 26 * (1 - conv)

    // core glow follows the core slice
    const core = this.slices.find((s) => s.kind === 'core')!
    core.root.getWorldPosition(this.coreGlow.position)
    this.coreGlow.scale.setScalar(2.4 * core.cur.s + lit * 2)
    ;(this.coreGlow.material as THREE.SpriteMaterial).opacity = (0.22 + lit * 0.55) * (1 - conv)

    // singularity at the end
    const sPeak = Math.sin(Math.PI * clamp01((conv - 0.55) / 0.45))
    this.singularity.position.set(this.groupX, 0, 0.5)
    this.singularity.scale.setScalar(0.001 + sPeak * 1.6)
    ;(this.singularity.material as THREE.SpriteMaterial).opacity = sPeak

    this.updateFrames(explode, pm, conv)
    this.updateCamera(explode, pm, conv, easeK)

    // particles
    if (this.opts.pointer && !reduced) {
      this.ndc.set(S.px, S.py)
      this.raycaster.setFromCamera(this.ndc, this.camera)
      if (this.raycaster.ray.intersectPlane(this.plane, this.mouseTarget)) this.mouseWorld.lerp(this.mouseTarget, easeK(0.12))
    }
    const u = this.pMat.uniforms
    u.uTime.value = this.time
    u.uConverge.value = conv
    u.uFade.value = 1 - S.dim * 0.45
    u.uPixel.value = this.renderer.getPixelRatio()

    this.renderer.render(this.scene, this.camera)
    this.idleRendered = conv >= 0.999 && this.slices.every((s) => s.cur.s < 0.004)
  }

  private updateFrames(explode: number, pm: number, conv: number) {
    const hide = (1 - pm) * (1 - conv)
    const camZ = this.camPos.z
    const visH = 2 * camZ * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const visW = visH * this.camera.aspect
    let fitH = visH * 0.7
    if (fitH * 1.6 > visW * 0.86) fitH = (visW * 0.86) / 1.6
    const { e, a } = this.tmp

    this.frames.forEach((f, k) => {
      const m = this.frameMats[k]
      if (k === 0) {
        const heroQ = a.q.setFromEuler(e.set(0.08, 0.8 + this.time * 0.035, 0))
        f.position.set(lerp(this.groupX - 0.6, 0, explode), lerp(0.35, 0, explode), lerp(-2.4, 0, explode))
        f.quaternion.copy(heroQ).slerp(new THREE.Quaternion(), explode)
        f.scale.setScalar(lerp(3.7, fitH, explode))
        m.opacity = (0.3 + 0.6 * explode) * (1 - smooth(0.86, 1, S.explode)) * hide
      } else {
        const dir = k === 1 ? 1 : -1
        f.position.set(this.groupX + dir * 0.2, k === 1 ? -0.4 : 0.6, k === 1 ? 0.6 : -1)
        f.rotation.set(0.15 * dir, -this.time * 0.05 * dir + k * 1.7, 0.08 * dir)
        f.scale.setScalar((k === 1 ? 2.3 : 5.2) * (1 + explode * 2.5))
        m.opacity = (k === 1 ? 0.22 : 0.14) * (1 - explode) * hide
      }
      f.visible = m.opacity > 0.005
    })
  }

  private updateCamera(explode: number, pm: number, conv: number, easeK: (l: number) => number) {
    const aspect = this.camera.aspect
    const zMul = aspect < 1 ? 1 + (1 - aspect) * 0.95 : 1
    const follow = this.opts.reduced ? 0 : 1
    const z = lerp(lerp(lerp(11, 7.4, explode), 11.2, pm), 8.6, conv) * zMul
    const target = this.tmp.v.set(S.px * 0.6 * follow * (1 - pm * 0.6), -0.3 + S.py * 0.32 * follow, z)
    this.camPos.lerp(target, easeK(0.035))
    this.camera.position.copy(this.camPos)
    this.camLook.set(this.groupX * lerp(0.35, 0.55, pm) * (1 - explode * 0.6), 0.1, 0)
    this.camera.lookAt(this.camLook)
  }

  /**
   * Adaptive resolution. Uses the median of ~2 s of visible frames, so a hidden tab,
   * a background pane or a single hitch never lowers quality. Steps down on slow
   * machines (never below 0.85) and back up once there is headroom again.
   */
  private adapt(raw: number) {
    if (document.hidden || raw > 0.2) {
      this.frameTimes.length = 0
      return
    }
    this.frameTimes.push(raw)
    if (this.frameTimes.length < 120) return
    const sorted = [...this.frameTimes].sort((a, b) => a - b)
    const median = sorted[sorted.length >> 1]
    this.frameTimes.length = 0
    const pr = this.renderer.getPixelRatio()
    let next = pr
    if (median > 0.026 && pr > 0.85) {
      next = Math.max(0.85, pr - 0.25)
      this.downgraded = true
    } else if (median < 0.0175 && pr < this.maxDpr && !this.downgraded) next = Math.min(this.maxDpr, pr + 0.25)
    if (next !== pr) {
      this.renderer.setPixelRatio(next)
      this.resize()
    }
  }
}
