# abort-controller-x-reactive-store [![npm version][npm-image]][npm-url]

Reactive store primitive and helpers.

This is a companion package of
[`abort-controller-x`](https://github.com/deeplay-io/abort-controller-x).

- [Installation](#installation)
- [API](#api)
  - [`Store`](#store)
  - [`deriveStore`](#derivestore)
  - [`watchStore`](#watchstore)
- [Usage with React](#usage-with-react)

## Installation

```
yarn add abort-controller-x-reactive-store
```

## API

### `Store`

```ts
type Store<T> = {
  value: T;
  wait(signal: AbortSignal, condition: (value: T) => boolean): Promise<T>;
};

type ReadonlyStore<T> = Readonly<Store<T>>;
```

A reactive store (a.k.a. reactive variable) holds a value that can be read and
updated, and can also be observed by means of waiting for a condition to be met.

The `wait` method returns a promise that resolves when the condition is met, or
rejects with an `AbortError` if the signal is aborted.

### `deriveStore`

```ts
function deriveStore<T, R>(
  parentStore: ReadonlyStore<T>,
  transform: (value: T) => R,
): Store<R>;
```

Derives a new store from a parent store by applying a transformation function to
its value.

### `watchStore`

```ts
async function watchStore<T>(
  signal: AbortSignal,
  store: ReadonlyStore<T>,
): AsyncIterable<T>;
```

Allows to react on changes of a store value using async iteration, e.g.:

```ts
for await (const value of watchStore(signal, store)) {
  console.log(value);
}
```

Note that it is not guaranteed that every assignment to the store value will be
logged. For example, in case of multiple synchronous assignments, some of them
may be skipped due to the async nature of promises. However, it is always
guaranteed that the last value will be logged.

## Usage with React

You can use the following hook to bind to a store in a React component:

```ts
import {run} from 'abort-controller-x';
import {ReadonlyStore, watchStore} from 'abort-controller-x-reactive-store';
import {useEffect, useState} from 'react';

function useStoreValue<T>(store: ReadonlyStore<T>): T {
  const [value, setValue] = useState(store.value);

  useEffect(() => {
    const stop = run(async signal => {
      for await (const value of watchStore(signal, store)) {
        setState(value);
      }
    });

    return () => {
      stop();
    };
  }, [store]);

  return value;
}
```

[npm-image]: https://badge.fury.io/js/abort-controller-x-reactive-store.svg
[npm-url]: https://badge.fury.io/js/abort-controller-x-reactive-store
