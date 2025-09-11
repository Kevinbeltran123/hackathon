
import { create } from 'zustand'

export const usePrefs = create(set => ({
  prefs: { time: 180, pace: 'normal', budget: 2, tags: ['cultura','gastro'], mode:'walk', radius: 1200 },
  setPrefs: (p) => set({ prefs: { ...p }}),
}))

export const useRoute = create(set => ({
  items: [],
  addItem: (it) => set(s => ({ items: [...s.items, it] })),
  removeAt: (i) => set(s => ({ items: s.items.filter((_,idx)=>idx!==i) })),
  clear: ()=> set({ items: [] })
}))

export const useAuth = create(set => ({
  token: null, me: null,
  setAuth: (token, me) => set({token, me}),
  logout: () => set({token:null, me:null})
}))
