import createFetchStatusReducer from '../src/reducers/fetchStatusReducer';
import FetchStatus from '../src/models/FetchStatus';

describe('fetchStatusReducer', () => {
  const reducer = createFetchStatusReducer({
    updateWhen: { types: ['FETCH_ITEM'] },
  });

  it('returns the default state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(FetchStatus.NOT_FETCHED);
  });

  it('sets state to pending', () => {
    expect(
      reducer(FetchStatus.NOT_FETCHED, {
        type: 'FETCH_ITEM',
        sequence: 'start',
      }),
    ).toEqual(FetchStatus.PENDING_READ);
  });

  it('sets state to pending with crud', () => {
    expect(
      reducer(FetchStatus.NOT_FETCHED, {
        type: 'FETCH_ITEM',
        sequence: 'start',
        meta: { crud: 'update' },
      }),
    ).toEqual(
      new FetchStatus({ pendingOperation: 'update', needsRefetch: false }),
    );
  });

  it('sets state to complete', () => {
    expect(
      reducer(FetchStatus.PENDING_READ, {
        type: 'FETCH_ITEM',
        sequence: 'done',
      }),
    ).toEqual(FetchStatus.COMPLETED);
  });

  it('sets state to failed', () => {
    expect(
      reducer(FetchStatus.PENDING_READ, {
        type: 'FETCH_ITEM',
        sequence: 'done',
        error: true,
        payload: 'oops',
      }),
    ).toEqual(new FetchStatus({ error: 'oops', needsRefetch: false }));
  });
});
