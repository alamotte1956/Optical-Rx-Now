import NetInfo from '@react-native-community/netinfo';

type QueuedOperation = {
  id: string;
  operation: () => Promise<any>;
  retryCount: number;
  maxRetries: number;
};

class NetworkStateManager {
  private isOnline: boolean = true;
  private queue: QueuedOperation[] = [];
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? true;

      // Notify listeners
      this.listeners.forEach(listener => listener(this.isOnline));

      // Process queue when coming back online
      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });
  }

  async executeOrQueue<T>(
    operation: () => Promise<T>,
    options: { requiresNetwork?: boolean; maxRetries?: number } = {}
  ): Promise<T> {
    const { requiresNetwork = true, maxRetries = 3 } = options;

    // If operation doesn't require network or we're online, execute immediately
    if (!requiresNetwork || this.isOnline) {
      try {
        return await operation();
      } catch (error) {
        if (requiresNetwork && !this.isOnline) {
          // Network failed during operation, queue it
          return this.queueOperation(operation, maxRetries);
        }
        throw error;
      }
    }

    // We're offline and operation requires network, queue it
    return this.queueOperation(operation, maxRetries);
  }

  private async queueOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedOp: QueuedOperation = {
        id: Date.now().toString(),
        operation: async () => {
          try {
            const result = await operation();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        },
        retryCount: 0,
        maxRetries,
      };

      this.queue.push(queuedOp);
    });
  }

  private async processQueue() {
    if (!this.isOnline || this.queue.length === 0) return;

    const currentQueue = [...this.queue];
    this.queue = [];

    for (const queuedOp of currentQueue) {
      try {
        await queuedOp.operation();
      } catch (error) {
        console.error('Failed to process queued operation:', error);
        
        // Retry if under max retries
        if (queuedOp.retryCount < queuedOp.maxRetries) {
          queuedOp.retryCount++;
          this.queue.push(queuedOp);
        }
      }
    }
  }

  addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }
}

export const networkStateManager = new NetworkStateManager();
