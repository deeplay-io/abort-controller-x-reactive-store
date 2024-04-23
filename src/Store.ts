import {execute, throwIfAborted} from 'abort-controller-x';

export type Store<T> = {
  value: T;
  wait<S extends T>(
    signal: AbortSignal,
    condition: (value: T) => value is S,
  ): Promise<S>;
  wait(signal: AbortSignal, condition: (value: T) => boolean): Promise<T>;
};

export type ReadonlyStore<T> = Readonly<Store<T>>;

export function Store<T>(initialValue: T): Store<T> {
  let value = initialValue;

  const listeners = new Set<(value: T) => void>();

  return {
    get value() {
      return value;
    },
    set value(nextValue: T) {
      if (value === nextValue) {
        return;
      }

      value = nextValue;

      for (const listener of listeners) {
        listener(value);
      }
    },

    wait<S extends T>(
      signal: AbortSignal,
      condition: (value: T) => value is S,
    ) {
      throwIfAborted(signal);

      if (condition(value)) {
        return Promise.resolve(value);
      }

      return execute<S>(signal, resolve => {
        const listener = (value: T) => {
          if (condition(value)) {
            resolve(value);
            listeners.delete(listener);
          }
        };

        listeners.add(listener);

        return () => {
          listeners.delete(listener);
        };
      });
    },
  };
}
