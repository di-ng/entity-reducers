import composeReducers from '../src/reducers/composeReducers';
import { AnyAction } from 'redux';

describe('composeReducers', () => {
  it('executes reducers in order', () => {
    const reducer1 = (state = '', action: AnyAction) => state + action.payload.toUpperCase();
    const reducer2 = (state = '', action: AnyAction) => state + action.payload.toLowerCase();
    const composed = composeReducers(reducer1, reducer2);
    expect(composed('orig', {
      type: 'fakeAction',
      payload: 'Data',
    })).toEqual('origdataDATA');
  });
});
