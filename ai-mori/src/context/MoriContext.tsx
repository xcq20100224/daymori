import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import {
  clearAllMoriData,
  loadGoals,
  loadMemory,
  loadMessages,
  loadPreference,
  saveGoals,
  saveMemory,
  saveMessages,
  savePreference
} from '../services/storage';
import { defaultMemory, defaultPreference, initialMoriState, moriReducer } from './moriReducer';

interface MoriContextValue {
  state: ReturnType<typeof useMoriInternal>['state'];
  actions: ReturnType<typeof useMoriInternal>['actions'];
}

const MoriContext = createContext<MoriContextValue | null>(null);

const useMoriInternal = () => {
  const [state, dispatch] = useReducer(moriReducer, initialMoriState);

  useEffect(() => {
    const bootstrap = async () => {
      const [messages, goals, memory, preference] = await Promise.all([
        loadMessages(),
        loadGoals(),
        loadMemory(),
        loadPreference()
      ]);
      dispatch({
        type: 'BOOTSTRAP',
        payload: {
          messages,
          goals,
          memory: memory ?? defaultMemory,
          preference: preference ?? defaultPreference
        }
      });
    };
    bootstrap().catch(() => dispatch({ type: 'SET_ERROR', payload: '初始化失败，请刷新重试。' }));
  }, []);

  useEffect(() => {
    saveMessages(state.messages).catch(() => dispatch({ type: 'SET_ERROR', payload: '消息保存失败。' }));
  }, [state.messages]);

  useEffect(() => {
    saveMemory(state.memory).catch(() => dispatch({ type: 'SET_ERROR', payload: '记忆保存失败。' }));
  }, [state.memory]);

  useEffect(() => {
    savePreference(state.preference).catch(() => dispatch({ type: 'SET_ERROR', payload: '偏好保存失败。' }));
  }, [state.preference]);

  useEffect(() => {
    saveGoals(state.goals).catch(() => dispatch({ type: 'SET_ERROR', payload: '目标保存失败。' }));
  }, [state.goals]);

  const actions = useMemo(
    () => ({
      dispatch,
      clearData: async () => {
        await clearAllMoriData();
        dispatch({ type: 'CLEAR_ALL' });
      }
    }),
    []
  );

  return { state, actions };
};

export const MoriProvider = ({ children }: { children: ReactNode }) => {
  const value = useMoriInternal();
  return <MoriContext.Provider value={value}>{children}</MoriContext.Provider>;
};

export const useMori = (): MoriContextValue => {
  const value = useContext(MoriContext);
  if (!value) {
    throw new Error('useMori must be used within MoriProvider');
  }
  return value;
};
