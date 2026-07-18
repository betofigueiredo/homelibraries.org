import { create } from 'zustand'

export type Lang = 'en' | 'pt'

/**
 * Global game state, kept outside React's render tree so the game loop
 * (useFrame) never triggers component re-renders. Extend this as features
 * grow (nearby interactables, multiplayer peers, etc.).
 */
interface GameState {
  /** True once physics is initialised and the scene is ready to show. */
  ready: boolean
  setReady: () => void
  /** Id of the reading court the cat is currently inside, or null. */
  activeSectionId: string | null
  setActiveSection: (id: string | null) => void
  /** Language for book titles, descriptions, covers and links. */
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useGame = create<GameState>((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
  activeSectionId: null,
  setActiveSection: (activeSectionId) => set({ activeSectionId }),
  lang: 'en',
  setLang: (lang) => set({ lang }),
}))
