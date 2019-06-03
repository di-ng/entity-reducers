import { Reducer } from 'redux';

export default function composeReducers<TState>(
  ...reducers: Array<Reducer<TState>>
): Reducer<TState> {
  return function composedReducer(state, action) {
    const finalState = reducers.reduce(
      (updatedState, reducer) => reducer(updatedState, action),
      state,
    );
    if (finalState === undefined) {
      throw new Error('Composed reducers yielded a final state of undefined');
    }
    return finalState;
  };
}
