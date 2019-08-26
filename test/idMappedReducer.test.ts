import createIdMappedReducer from '../src/reducers/idMappedReducer';
import { AnyAction } from 'redux';

describe('idMappedReducer', () => {
  const childReducer = (state = '', action: AnyAction) =>
    state + action.payload.name;
  const reducer = createIdMappedReducer({
    perEntityReducer: childReducer,
  });

  it('returns the default state', () => {
    expect(
      reducer(
        {},
        {
          type: '',
        },
      ),
    ).toEqual({});
  });

  it('runs child reducer for a given ID', () => {
    expect(
      reducer(
        {},
        {
          type: 'anything',
          payload: [
            {
              id: '123',
              name: 'geo',
            },
            {
              id: '345',
              name: 'ale',
            },
          ],
        },
      ),
    ).toEqual({
      '123': 'geo',
      '345': 'ale',
    });
  });
});
