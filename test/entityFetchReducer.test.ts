import createEntityFetchReducer from '../src/reducers/entityFetchReducer';
import FetchStatus from '../src/models/FetchStatus';

describe('entityFetchReducer', () => {
  const reducer = createEntityFetchReducer({
    updateWhen: { types: ['FETCH_ITEM'] },
  });

  it('returns the default state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({
      status: FetchStatus.NOT_FETCHED,
      data: undefined,
    });
  });

  it('sets state to pending', () => {
    expect(
      reducer(
        {
          status: FetchStatus.NOT_FETCHED,
          data: undefined,
        },
        {
          type: 'FETCH_ITEM',
          sequence: 'start',
        },
      ),
    ).toEqual({
      status: FetchStatus.PENDING_READ,
      data: undefined,
    });
  });

  it('sets state to pending with crud', () => {
    expect(
      reducer(
        {
          status: FetchStatus.COMPLETED,
          data: 'data',
        },
        {
          type: 'FETCH_ITEM',
          sequence: 'start',
          meta: { crud: 'update' },
        },
      ),
    ).toEqual({
      status: new FetchStatus({
        pendingOperation: 'update',
        needsRefetch: false,
      }),
      data: undefined,
    });
  });

  it('sets state to complete', () => {
    expect(
      reducer(
        {
          status: FetchStatus.PENDING_READ,
          data: undefined,
        },
        {
          type: 'FETCH_ITEM',
          sequence: 'done',
          payload: 'done fetching',
        },
      ),
    ).toEqual({
      status: FetchStatus.COMPLETED,
      data: 'done fetching',
    });
  });

  it('sets state to failed', () => {
    expect(
      reducer(
        {
          status: FetchStatus.PENDING_READ,
          data: undefined,
        },
        {
          type: 'FETCH_ITEM',
          sequence: 'done',
          payload: 'failed!',
          error: true,
        },
      ),
    ).toEqual({
      status: new FetchStatus({ error: 'failed!', needsRefetch: false }),
      data: undefined,
    });
  });
});
