// frontend/src/lib/assistant/EventBus.ts
import { AssistantEventMap } from "./types";

type EventCallback<T> = (payload: T) => void;

class AssistantEventBus {
  private listeners: {
    [K in keyof AssistantEventMap]?: EventCallback<AssistantEventMap[K]>[];
  } = {};

  // Suscribir a un evento (Lo usarán tus páginas actuales)
  on<K extends keyof AssistantEventMap>(
    event: K,
    callback: EventCallback<AssistantEventMap[K]>,
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  // Desuscribir
  off<K extends keyof AssistantEventMap>(
    event: K,
    callback: EventCallback<AssistantEventMap[K]>,
  ) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event]!.filter(
      (cb) => cb !== callback,
    );
  }

  // Emitir evento (Lo usará el Asistente)
  emit<K extends keyof AssistantEventMap>(
    event: K,
    payload: AssistantEventMap[K],
  ) {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach((callback) => callback(payload));
  }
}

export const chatEventBus = new AssistantEventBus();
