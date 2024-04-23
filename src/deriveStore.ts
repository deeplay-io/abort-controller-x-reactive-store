import {ReadonlyStore} from './Store';

export function deriveStore<T, R>(
  parentStore: ReadonlyStore<T>,
  transform: (value: T) => R,
): ReadonlyStore<R> {
  let cache: {parentValue: T; transformedValue: R} | undefined;

  function memoizedTransform(parentValue: T): R {
    if (cache && cache.parentValue === parentValue) {
      return cache.transformedValue;
    }

    const transformedValue = transform(parentValue);

    cache = {parentValue, transformedValue};

    return transformedValue;
  }

  return {
    get value() {
      return memoizedTransform(parentStore.value);
    },

    async wait<S extends R>(
      signal: AbortSignal,
      condition: (value: R) => value is S,
    ): Promise<S> {
      const parentValue = await parentStore.wait(signal, parentValue =>
        condition(memoizedTransform(parentValue)),
      );

      return memoizedTransform(parentValue) as S;
    },
  };
}
