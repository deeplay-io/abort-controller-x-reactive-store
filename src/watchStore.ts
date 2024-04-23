import {ReadonlyStore} from './Store';

export async function* watchStore<T>(
  signal: AbortSignal,
  store: ReadonlyStore<T>,
): AsyncIterable<T> {
  let lastValue = store.value;

  yield lastValue;

  while (true) {
    const value = await store.wait(signal, value => value !== lastValue);

    yield value;

    lastValue = value;
  }
}
