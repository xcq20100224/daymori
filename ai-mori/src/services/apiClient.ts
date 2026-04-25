import type { ChatChunk, ChatRequest } from '../types/mori';

export interface OpenAICompatConfig {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

const decoder = new TextDecoder();

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const buildSystemPrompt = (): string => {
  return [
    '你是Daymori的AI Mori伙伴。必须遵循：全免费、无广告、无付费引导、无会员体系。',
    '语气温和坚定，共情且不评判。禁止诱导沉迷聊天。',
    '禁止协助作弊；只提供学习方法、知识讲解与行动计划。',
    '遇到严重心理风险时，立即建议联系家人/老师/专业机构。',
    '回答尽量简洁，最终落到现实可执行行动。'
  ].join('\n');
};

const streamChunks = async function* (response: Response): AsyncGenerator<ChatChunk> {
  const reader = response.body?.getReader();
  if (!reader) {
    yield { textDelta: '网络异常，未获取到流式数据。', done: true };
    return;
  }

  let buffer = '';
  while (true) {
    const read = await reader.read();
    if (read.done) {
      break;
    }
    buffer += decoder.decode(read.value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) {
        continue;
      }
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        yield { textDelta: '', done: true };
        return;
      }
      try {
        const json = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
        const delta = json.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          yield { textDelta: delta, done: false };
        }
      } catch {
        continue;
      }
    }
  }

  yield { textDelta: '', done: true };
};

export const streamChat = async function* (
  request: ChatRequest,
  config: OpenAICompatConfig,
  signal: AbortSignal
): AsyncGenerator<ChatChunk> {
  const payload = {
    model: config.model,
    stream: true,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'system',
        content: `用户关键信息:${JSON.stringify(request.neededContext.memory)}; 偏好:${JSON.stringify(request.neededContext.preference)}`
      },
      ...request.neededContext.recentMessages.map((message) => ({ role: message.role, content: message.content })),
      { role: 'user', content: request.userText }
    ]
  };

  for (let retry = 0; retry <= config.maxRetries; retry += 1) {
    try {
      const timeoutController = new AbortController();
      const timeoutId = window.setTimeout(() => timeoutController.abort(), config.timeoutMs);

      const linkedController = new AbortController();
      signal.addEventListener('abort', () => linkedController.abort(), { once: true });
      timeoutController.signal.addEventListener('abort', () => linkedController.abort(), { once: true });

      const response = await fetch(`${config.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: linkedController.signal
      });

      window.clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
      }

      for await (const chunk of streamChunks(response)) {
        yield chunk;
      }
      return;
    } catch (error) {
      if (signal.aborted) {
        yield { textDelta: '已取消当前对话。', done: true };
        return;
      }
      if (retry === config.maxRetries) {
        const text = error instanceof Error ? error.message : 'unknown_error';
        yield { textDelta: `请求失败(${text})，请检查网络后重试。`, done: true };
        return;
      }
      await sleep(600 * (retry + 1));
    }
  }
};
