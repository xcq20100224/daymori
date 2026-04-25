import { useMemo, useRef } from 'react';
import { useMori } from '../context/MoriContext';
import { streamChat, type OpenAICompatConfig } from '../services/apiClient';
import { buildEmergencyPlan, detectEmergencyTrigger } from '../utils/emergency';
import { createId } from '../utils/id';
import { crisisGuidanceText, scanContentSafety } from '../utils/safety';
import type { Message } from '../types/mori';

const getConfig = (): OpenAICompatConfig => {
  return {
    apiBaseUrl: import.meta.env.VITE_OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
    model: import.meta.env.VITE_OPENAI_MODEL ?? 'gpt-4o-mini',
    timeoutMs: 25000,
    maxRetries: 2
  };
};

export const useMoriChat = () => {
  const { state, actions } = useMori();
  const abortRef = useRef<AbortController | null>(null);

  const canSend = useMemo(() => state.isLoading === false, [state.isLoading]);

  const sendMessage = async (inputText: string): Promise<void> => {
    const text = inputText.trim();
    if (!text || !canSend) {
      return;
    }

    const inputSafety = scanContentSafety(text);
    const userMessage: Message = {
      id: createId(),
      role: 'user',
      content: text,
      createdAt: Date.now(),
      safetyTags: inputSafety.tags
    };

    actions.dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    if (inputSafety.blocked) {
      actions.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: createId(),
          role: 'assistant',
          content: inputSafety.safeText,
          createdAt: Date.now(),
          safetyTags: ['blocked_reply']
        }
      });
      return;
    }

    if (inputSafety.severeMentalRisk) {
      actions.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: createId(),
          role: 'assistant',
          content: crisisGuidanceText,
          createdAt: Date.now(),
          safetyTags: ['crisis_guidance']
        }
      });
      return;
    }

    const trigger = state.preference.emergencyModeEnabled ? detectEmergencyTrigger(text) : null;
    if (trigger) {
      const plan = buildEmergencyPlan(trigger);
      actions.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: createId(),
          role: 'assistant',
          content: `${plan.calmingTalk}\n\n立刻执行:\n- ${plan.actions.join('\n- ')}`,
          createdAt: Date.now(),
          safetyTags: ['emergency_support']
        }
      });
      return;
    }

    const apiKey = getConfig().apiKey;
    if (!apiKey) {
      actions.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: createId(),
          role: 'assistant',
          content: '尚未配置 API Key。请在 .env.local 配置 VITE_OPENAI_API_KEY。',
          createdAt: Date.now(),
          safetyTags: ['config_required']
        }
      });
      return;
    }

    actions.dispatch({ type: 'SET_LOADING', payload: true });
    actions.dispatch({ type: 'SET_ERROR', payload: '' });
    actions.dispatch({ type: 'SET_STREAMING', payload: '' });

    abortRef.current = new AbortController();
    let builtText = '';

    try {
      const config = getConfig();
      const recentMessages = [...state.messages, userMessage].slice(-12);
      for await (const chunk of streamChat(
        {
          userText: text,
          neededContext: {
            memory: state.memory,
            preference: state.preference,
            recentMessages
          }
        },
        config,
        abortRef.current.signal
      )) {
        builtText += chunk.textDelta;
        actions.dispatch({ type: 'SET_STREAMING', payload: builtText });
      }

      const outputSafety = scanContentSafety(builtText);
      actions.dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: createId(),
          role: 'assistant',
          content: outputSafety.blocked ? outputSafety.safeText : builtText,
          createdAt: Date.now(),
          safetyTags: outputSafety.tags
        }
      });
    } catch (error) {
      if (abortRef.current?.signal.aborted) {
        actions.dispatch({ type: 'SET_ERROR', payload: '' });
      } else {
        const errorText = error instanceof Error ? error.message : '';
        actions.dispatch({ type: 'SET_ERROR', payload: errorText ? `请求失败: ${errorText}` : '请求失败，请稍后重试。' });
      }
    } finally {
      actions.dispatch({ type: 'SET_LOADING', payload: false });
      actions.dispatch({ type: 'SET_STREAMING', payload: '' });
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    actions.dispatch({ type: 'SET_LOADING', payload: false });
  };

  return {
    canSend,
    sendMessage,
    stopStreaming
  };
};
