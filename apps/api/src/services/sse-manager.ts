/**
 * NeuralDesk Real-Time Server-Sent Events (SSE) Manager
 * Manages active subscriber connections, Last-Event-ID replay buffering, and typed event broadcasts.
 */

import type { SSEEventType } from "@neuraldesk/shared";

export interface SSEClientStream {
  writeSSE(params: { id?: string; event?: string; data: string; retry?: number }): Promise<void>;
  onAbort(callback: () => void): void;
}

export interface StoredSSEEvent {
  id: string;
  event: SSEEventType;
  data: unknown;
  timestamp: number;
}

export class SSEManager {
  // executionId -> Set of active client stream sinks
  private subscribers: Map<string, Set<SSEClientStream>> = new Map();

  // executionId -> ordered history buffer for Last-Event-ID replay
  private eventBuffers: Map<string, StoredSSEEvent[]> = new Map();

  // executionId -> monotonic event counter
  private counters: Map<string, number> = new Map();

  // executionId -> active heartbeat interval
  private heartbeats: Map<string, NodeJS.Timeout> = new Map();

  // Maximum events to retain in replay buffer per execution
  private readonly maxBufferSize = 500;

  // Terminal lifecycle tracking
  private terminalListeners: Map<string, Set<() => void>> = new Map();
  private terminatedExecutions: Set<string> = new Set();

  /**
   * Broadcasts an event to all subscribers of an execution.
   */
  public broadcast(executionId: string, event: SSEEventType, data: unknown): void {
    const nextCounter = (this.counters.get(executionId) || 0) + 1;
    this.counters.set(executionId, nextCounter);

    const eventId = `msg_${String(nextCounter).padStart(4, "0")}`;
    const storedEvent: StoredSSEEvent = {
      id: eventId,
      event,
      data,
      timestamp: Date.now(),
    };

    // 1. Append to replay buffer
    let buffer = this.eventBuffers.get(executionId);
    if (!buffer) {
      buffer = [];
      this.eventBuffers.set(executionId, buffer);
    }
    buffer.push(storedEvent);
    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }

    // 2. Broadcast to all active connected clients
    const clients = this.subscribers.get(executionId);
    if (clients && clients.size > 0) {
      const payloadString = typeof data === "string" ? data : JSON.stringify(data);
      for (const client of clients) {
        client
          .writeSSE({
            id: eventId,
            event,
            data: payloadString,
          })
          .catch(() => {
            // Drop failed client
            clients.delete(client);
          });
      }
    }

    // 3. Handle terminal events
    if (event === "execution:complete" || event === "execution:error") {
      this.terminatedExecutions.add(executionId);
      const listeners = this.terminalListeners.get(executionId);
      if (listeners && listeners.size > 0) {
        for (const listener of listeners) {
          try {
            listener();
          } catch {
            // Ignore listener errors
          }
        }
      }
    }
  }

  /**
   * Checks whether an execution has already fired a terminal event.
   */
  public isTerminated(executionId: string): boolean {
    return this.terminatedExecutions.has(executionId);
  }

  /**
   * Registers a callback triggered when the execution completes or errors.
   */
  public onTerminal(executionId: string, callback: () => void): () => void {
    let listeners = this.terminalListeners.get(executionId);
    if (!listeners) {
      listeners = new Set();
      this.terminalListeners.set(executionId, listeners);
    }
    listeners.add(callback);
    return () => {
      listeners?.delete(callback);
    };
  }

  /**
   * Registers a new subscriber stream for a specific execution.
   * Immediately replays any missed events (or full buffer if no lastEventId provided).
   */
  public async subscribe(
    executionId: string,
    stream: SSEClientStream,
    lastEventId?: string | null
  ): Promise<() => void> {
    let clients = this.subscribers.get(executionId);
    if (!clients) {
      clients = new Set();
      this.subscribers.set(executionId, clients);
    }
    clients.add(stream);

    // Start heartbeat if not already running for this execution
    this.ensureHeartbeat(executionId);

    // Replay buffer catch-up: if lastEventId is provided, replay from after it;
    // if lastEventId is null/undefined, replay all events in the buffer
    const buffer = this.eventBuffers.get(executionId) || [];
    if (buffer.length > 0) {
      const missedEvents = lastEventId
        ? (() => {
            const lastIndex = buffer.findIndex((e) => e.id === lastEventId);
            return lastIndex !== -1 ? buffer.slice(lastIndex + 1) : buffer;
          })()
        : buffer;

      for (const missed of missedEvents) {
        const payloadString =
          typeof missed.data === "string" ? missed.data : JSON.stringify(missed.data);
        await stream.writeSSE({
          id: missed.id,
          event: missed.event,
          data: payloadString,
        });
      }
    }

    // Cleanup hook
    const unsubscribe = () => {
      const currentClients = this.subscribers.get(executionId);
      if (currentClients) {
        currentClients.delete(stream);
        if (currentClients.size === 0) {
          this.subscribers.delete(executionId);
          this.stopHeartbeat(executionId);
        }
      }
    };

    stream.onAbort(unsubscribe);
    return unsubscribe;
  }

  /**
   * Starts a keep-alive heartbeat interval for an execution.
   */
  private ensureHeartbeat(executionId: string): void {
    if (this.heartbeats.has(executionId)) return;

    const interval = setInterval(() => {
      const clients = this.subscribers.get(executionId);
      if (!clients || clients.size === 0) {
        this.stopHeartbeat(executionId);
        return;
      }

      const pingPayload = JSON.stringify({
        timestamp: new Date().toISOString(),
        active_execution_id: executionId,
      });

      for (const client of clients) {
        client
          .writeSSE({
            event: "heartbeat",
            data: pingPayload,
          })
          .catch(() => {
            clients.delete(client);
          });
      }
    }, 15000);

    interval.unref();
    this.heartbeats.set(executionId, interval);
  }

  /**
   * Stops the keep-alive heartbeat for an execution.
   */
  private stopHeartbeat(executionId: string): void {
    const timer = this.heartbeats.get(executionId);
    if (timer) {
      clearInterval(timer);
      this.heartbeats.delete(executionId);
    }
  }

  /**
   * Closes an execution stream, notifies subscribers, and schedules buffer pruning.
   */
  public closeExecution(executionId: string): void {
    this.stopHeartbeat(executionId);

    // Keep buffer for 5 minutes after completion for reconnecting clients, then purge
    setTimeout(() => {
      this.eventBuffers.delete(executionId);
      this.counters.delete(executionId);
    }, 5 * 60 * 1000).unref();
  }

  /**
   * Returns the count of executions with active subscriber connections.
   */
  public getActiveExecutionCount(): number {
    return this.subscribers.size;
  }

  /**
   * Returns the count of active client connections for a given execution or globally.
   */
  public getActiveSubscriberCount(executionId?: string): number {
    if (executionId) {
      return this.subscribers.get(executionId)?.size || 0;
    }
    let total = 0;
    for (const clients of this.subscribers.values()) {
      total += clients.size;
    }
    return total;
  }

  /**
   * Retrieves the event history buffer for testing or inspection.
   */
  public getExecutionHistory(executionId: string): StoredSSEEvent[] {
    return this.eventBuffers.get(executionId) || [];
  }

  /**
   * Clears all active state (used in test teardown).
   */
  public reset(): void {
    for (const timer of this.heartbeats.values()) {
      clearInterval(timer);
    }
    this.heartbeats.clear();
    this.subscribers.clear();
    this.eventBuffers.clear();
    this.counters.clear();
    this.terminalListeners.clear();
    this.terminatedExecutions.clear();
  }
}

export const sseManager = new SSEManager();
