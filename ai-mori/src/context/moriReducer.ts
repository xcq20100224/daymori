import type { Goal, Message, MoriState, UserMemory, UserPreference } from '../types/mori';

export type MoriAction =
  | {
      type: 'BOOTSTRAP';
      payload: { messages: Message[]; goals: Goal[]; memory: UserMemory; preference: UserPreference };
    }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_STREAMING'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPSERT_GOAL'; payload: Goal }
  | { type: 'SET_MEMORY'; payload: UserMemory }
  | { type: 'SET_PREFERENCE'; payload: UserPreference }
  | { type: 'CLEAR_ALL' };

export const defaultMemory: UserMemory = {
  nickname: '同学',
  coreGoals: [],
  studyOrWorkField: '',
  emotionPreference: '温和支持',
  keyEvents: [],
  habits: []
};

export const defaultPreference: UserPreference = {
  companionName: 'Mori',
  style: 'warm_firm',
  reminderFrequency: 'medium',
  doNotDisturbRange: '23:00-07:00',
  focusAreas: ['study'],
  memoryEnabled: true,
  emergencyModeEnabled: true,
  checkinReminderEnabled: true
};

export const initialMoriState: MoriState = {
  messages: [],
  goals: [],
  memory: defaultMemory,
  preference: defaultPreference,
  streamingText: '',
  isLoading: false,
  errorText: ''
};

export const moriReducer = (state: MoriState, action: MoriAction): MoriState => {
  switch (action.type) {
    case 'BOOTSTRAP':
      return {
        ...state,
        messages: action.payload.messages,
        goals: action.payload.goals,
        memory: action.payload.memory,
        preference: action.payload.preference
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        streamingText: ''
      };
    case 'SET_STREAMING':
      return {
        ...state,
        streamingText: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        errorText: action.payload
      };
    case 'UPSERT_GOAL': {
      const found = state.goals.find((goal) => goal.id === action.payload.id);
      if (found) {
        return {
          ...state,
          goals: state.goals.map((goal) => (goal.id === action.payload.id ? action.payload : goal))
        };
      }
      return {
        ...state,
        goals: [...state.goals, action.payload]
      };
    }
    case 'SET_MEMORY':
      return {
        ...state,
        memory: action.payload
      };
    case 'SET_PREFERENCE':
      return {
        ...state,
        preference: action.payload
      };
    case 'CLEAR_ALL':
      return {
        ...initialMoriState
      };
    default:
      return state;
  }
};
