import { hasWebGL } from './env'

/**
 * Imported first by main.tsx so the three.js chunk downloads and parses in parallel
 * with React's first render, instead of after every section has mounted.
 */
export const glSupported = hasWebGL()
export const universeModule = glSupported ? import('../webgl/Universe') : null
