import createEntityCacheReducer from '../src/reducers/entityCacheReducer';
import FetchStatus from '../src/models/FetchStatus';

describe('entityCacheReducer', () => {
  const reducer = createEntityCacheReducer({
    mergeEntitiesWhen: { types: ['MERGE_ACTION'] },
    addEntityWhen: { types: ['CREATE_ACTION'] },
    updateEntityWhen: { types: ['GET_ACTION'] },
    removeEntityWhen: { types: ['DELETE_ACTION'] },
  });

  it('returns the default state', () => {
    expect(reducer(undefined, { type: '' })).toEqual({});
  });

  it('sets state to pending for an entity', () => {
    expect(
      reducer(
        {},
        {
          type: 'GET_ACTION',
          sequence: 'start',
          payload: '123',
        },
      ),
    ).toEqual({
      '123': { status: FetchStatus.PENDING_READ, data: undefined },
    });
  });

  it('sets state to pending with crud', () => {
    expect(
      reducer(
        {},
        {
          type: 'GET_ACTION',
          sequence: 'start',
          payload: '123',
          meta: { crud: 'update' },
        },
      ),
    ).toEqual({
      '123': {
        status: new FetchStatus({
          pendingOperation: 'update',
          needsRefetch: false,
        }),
        data: undefined,
      },
    });
  });

  it('sets state to complete', () => {
    expect(
      reducer(
        {
          '123': {
            status: FetchStatus.PENDING_READ,
            data: undefined,
          },
        },
        {
          type: 'GET_ACTION',
          sequence: 'done',
          payload: {
            id: '123',
            text: 'done fetching',
          },
        },
      ),
    ).toEqual({
      '123': {
        status: FetchStatus.COMPLETED,
        data: {
          id: '123',
          text: 'done fetching',
        },
      },
    });
  });

  it('removes item', () => {
    expect(
      reducer(
        {
          '123': {
            status: new FetchStatus({ pendingOperation: 'delete' }),
            data: undefined,
          },
        },
        {
          type: 'DELETE_ACTION',
          sequence: 'done',
          payload: '123',
        },
      ),
    ).toEqual({});
  });

  it('does nothing to begin of create action', () => {
    expect(
      reducer(
        {},
        {
          type: 'CREATE_ACTION',
          sequence: 'start',
        },
      ),
    ).toEqual({});
  });

  it('saves result of create action', () => {
    expect(
      reducer(
        {},
        {
          type: 'CREATE_ACTION',
          sequence: 'done',
          payload: {
            id: '123',
            text: 'done fetching',
          },
        },
      ),
    ).toEqual({
      '123': {
        status: FetchStatus.COMPLETED,
        data: {
          id: '123',
          text: 'done fetching',
        },
      },
    });
  });
});
