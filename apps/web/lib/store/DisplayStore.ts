import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type DisplayStore = {
  displayLists: boolean
  ChangeDisplay: (displayLists: boolean) => void
}

export const useDisplayStore = create<DisplayStore>()(
  persist(
    (set) => ({
      displayLists: false,
      ChangeDisplay: (displayLists) => {
        set((state) =>
          state.displayLists === displayLists ? state : { displayLists }
        )
      },
    }),
    {
      name: 'display-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
