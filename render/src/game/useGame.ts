import { create } from 'zustand'

/**
 * Global game state, kept outside React's render tree so the game loop
 * (useFrame) never triggers component re-renders. Extend this as features
 * grow (nearby interactables, multiplayer peers, etc.).
 */
interface GameState {
  /** True once physics is initialised and the scene is ready to show. */
  ready: boolean
  setReady: () => void
}

export const useGame = create<GameState>((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
}))
