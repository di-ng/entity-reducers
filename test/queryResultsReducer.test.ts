import createQueryResultsReducer from '../src/reducers/queryResultsReducer';
import FetchStatus from '../src/models/FetchStatus';

describe('queryResultsReducer', () => {
  const items = [{ id: '1', name: 'one' }, { id: '2', name: 'two' }];

  const reducer = createQueryResultsReducer({
    updateIdsWhen: { types: ['FETCH_ITEMS'] },
  });

  it('returns the default state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({
      status: FetchStatus.NOT_FETCHED,
      ids: [],
    });
  });

  it('sets state to pending', () => {
    expect(
      reducer(
        {
          status: FetchStatus.NOT_FETCHED,
          ids: [],
        },
        {
          type: 'FETCH_ITEMS',
          sequence: 'start',
        },
      ),
    ).toEqual({
      status: FetchStatus.PENDING_READ,
      ids: [],
    });
  });

  it('sets state to pending with crud', () => {
    expect(
      reducer(
        {
          status: FetchStatus.COMPLETED,
          ids: ['2', '1'],
        },
        {
          type: 'FETCH_ITEMS',
          sequence: 'start',
          meta: { crud: 'update' },
        },
      ),
    ).toEqual({
      status: new FetchStatus({
        pendingOperation: 'update',
        needsRefetch: false,
      }),
      ids: [],
    });
  });

  it('sets state to complete', () => {
    expect(
      reducer(
        {
          status: FetchStatus.PENDING_READ,
          ids: [],
        },
        {
          type: 'FETCH_ITEMS',
          sequence: 'done',
          payload: items,
        },
      ),
    ).toEqual({
      status: FetchStatus.COMPLETED,
      ids: items.map(item => item.id),
    });
  });

  it('sets state to failed', () => {
    expect(
      reducer(
        {
          status: FetchStatus.PENDING_READ,
          ids: [],
        },
        {
          type: 'FETCH_ITEMS',
          sequence: 'done',
          payload: 'failed!',
          error: true,
        },
      ),
    ).toEqual({
      status: new FetchStatus({ error: 'failed!', needsRefetch: false }),
      ids: [],
    });
  });
});
