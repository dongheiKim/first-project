import { createContext, useContext, useReducer, useState, useCallback, Dispatch, ReactNode } from 'react';

export type DiaryEntry = {
  id: number;
  date: string;
  content: string;
};

export type AppState = {
  entries: DiaryEntry[];
};

export type AppAction =
  | { type: 'ADD_ENTRY'; entry: DiaryEntry }
  | { type: 'REMOVE_ENTRY'; id: number };

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newValue));
      document.documentElement.classList.toggle('dark', newValue);
      return newValue;
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, isDarkMode, toggleDarkMode }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}

export function useApp() {
  return useAppContext();
}
