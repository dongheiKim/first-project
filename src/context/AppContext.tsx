import { createContext, useContext, useReducer, Dispatch, ReactNode } from 'react';

export type DiaryEntry = {
  id: number;
  date: string;
  content: string;
};

export type AppState = {
  entries: DiaryEntry[];
  // ...다른 상태 타입 추가...
};

export type AppAction =
  | { type: 'ADD_ENTRY'; entry: DiaryEntry }
  | { type: 'REMOVE_ENTRY'; id: number }
  // ...다른 액션 타입 추가...
;

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | undefined>(undefined);

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_ENTRY':
      return { ...state, entries: [...state.entries, action.entry] };
    case 'REMOVE_ENTRY':
      return { ...state, entries: state.entries.filter(e => e.id !== action.id) };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, { entries: [] });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
