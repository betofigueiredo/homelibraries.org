import * as THREE from 'three'
import { makeRng } from './rng'

/**
 * Procedural surface textures painted onto an offscreen canvas — no asset
 * downloads, so the scene stays self-contained. A single base texture is
 * generated once; callers get a lightweight clone with their own tiling.
 */

let brickBase: THREE.CanvasTexture | null = null
let grassBase: THREE.CanvasTexture | null = null
let woodBase: THREE.CanvasTexture | null = null
let stoneBase: THREE.CanvasTexture | null = null

function paintBricks(): THREE.CanvasTexture {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!

  // Mortar bed
  ctx.fillStyle = '#8c7a61'
  ctx.fillRect(0, 0, S, S)

  const rand = makeRng(7)
  const shades = ['#9c4a34', '#a85a3e', '#8f4230', '#b06a4c', '#7f3a2a', '#a4543a']
  const bw = 60
  const bh = 26
  const gap = 5
  let row = 0
  for (let y = -gap; y < S; y += bh + gap) {
    const offset = row % 2 === 0 ? 0 : -(bw + gap) / 2
    for (let x = -bw; x < S + bw; x += bw + gap) {
      ctx.fillStyle = shades[(rand() * shades.length) | 0]
      const bx = x + offset
      ctx.fillRect(bx, y, bw, bh)
      // Soft top highlight + bottom shadow for a bit of relief.
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(bx, y, bw, 3)
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.fillRect(bx, y + bh - 3, bw, 3)
    }
    row++
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

function paintGrass(): THREE.CanvasTexture {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!

  ctx.fillStyle = '#3c5a30'
  ctx.fillRect(0, 0, S, S)

  const rand = makeRng(23)
  // Speckle thousands of short blades in varied greens.
  for (let i = 0; i < 4200; i++) {
    const x = rand() * S
    const y = rand() * S
    const g = 70 + rand() * 70
    ctx.strokeStyle = `rgba(${(g * 0.5) | 0}, ${g | 0}, ${(g * 0.4) | 0}, 0.5)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (rand() - 0.5) * 2, y - 2 - rand() * 3)
    ctx.stroke()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

function paintWood(): THREE.CanvasTexture {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!

  const rand = makeRng(41)
  const shades = ['#8a6a44', '#96744c', '#7e6040', '#a07c52', '#8f6e48']
  const ph = 32 // plank height
  for (let y = 0; y < S; y += ph) {
    // Planks in each row are offset like floorboards.
    const offset = ((y / ph) % 2) * 60
    for (let x = -120; x < S + 120; x += 120) {
      ctx.fillStyle = shades[(rand() * shades.length) | 0]
      ctx.fillRect(x + offset, y, 118, ph - 2)
      // A few grain streaks per plank.
      for (let g = 0; g < 5; g++) {
        const gy = y + 4 + rand() * (ph - 10)
        ctx.strokeStyle = 'rgba(60,40,20,0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + offset + 4, gy)
        ctx.lineTo(x + offset + 40 + rand() * 70, gy + (rand() - 0.5) * 3)
        ctx.stroke()
      }
    }
    // Dark seam between plank rows.
    ctx.fillStyle = 'rgba(30,20,10,0.5)'
    ctx.fillRect(0, y + ph - 2, S, 2)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

function paintStones(): THREE.CanvasTexture {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!

  // Dark mossy joints between the stones
  ctx.fillStyle = '#3f443a'
  ctx.fillRect(0, 0, S, S)

  const rand = makeRng(11)
  const shades = ['#8f8d86', '#a09e96', '#7c7a74', '#96948c', '#88867e', '#a8a69e']
  let y = 0
  while (y < S) {
    const rh = 26 + rand() * 18 // irregular course heights
    let x = -30 * rand()
    while (x < S + 30) {
      const w = 34 + rand() * 42
      ctx.fillStyle = shades[(rand() * shades.length) | 0]
      ctx.beginPath()
      ctx.roundRect(x + 2, y + 2, w - 4, rh - 4, 6 + rand() * 4)
      ctx.fill()
      // Soft top light + bottom shade so each stone reads as a lump.
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.fillRect(x + 5, y + 3, w - 10, 3)
      ctx.fillStyle = 'rgba(0,0,0,0.14)'
      ctx.fillRect(x + 5, y + rh - 7, w - 10, 3)
      x += w
    }
    y += rh
  }
  // Moss specks creeping out of the joints.
  for (let i = 0; i < 260; i++) {
    const mx = rand() * S
    const my = rand() * S
    ctx.fillStyle = `rgba(${60 + rand() * 30}, ${100 + rand() * 45}, ${50 + rand() * 25}, ${0.14 + rand() * 0.2})`
    ctx.beginPath()
    ctx.arc(mx, my, 1 + rand() * 2.4, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

function tiled(base: THREE.CanvasTexture, rx: number, ry: number): THREE.Texture {
  const t = base.clone()
  t.needsUpdate = true
  t.repeat.set(rx, ry)
  return t
}

export function brickTexture(rx = 1, ry = rx): THREE.Texture {
  brickBase ??= paintBricks()
  return tiled(brickBase, rx, ry)
}

export function grassTexture(repeat = 1): THREE.Texture {
  grassBase ??= paintGrass()
  return tiled(grassBase, repeat, repeat)
}

export function woodTexture(rx = 1, ry = rx): THREE.Texture {
  woodBase ??= paintWood()
  return tiled(woodBase, rx, ry)
}

export function stoneTexture(rx = 1, ry = rx): THREE.Texture {
  stoneBase ??= paintStones()
  return tiled(stoneBase, rx, ry)
}
