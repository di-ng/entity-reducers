import FetchStatus from '../models/FetchStatus';
import { AnyAction } from 'redux';
import {
  MultipleKeyedEntityFetchInputReducerConfig,
  KeyedEntityFetchInputReducerConfig,
  FetchStatusInputReducerConfig,
} from '../types/reducerConfig';
import createFetchStatusReducer from './fetchStatusReducer';
import {
  queryMultipleKeyedEntityFetchReducerConfigForAction,
  queryKeyedEntityFetchReducerConfigForAction,
} from '../config/normalizeConfig';

export interface QueryResultsState {
  readonly ids: Readonly<string[]>;
  readonly status: Readonly<FetchStatus>;
}

const defaultState: QueryResultsState = {
  ids: [],
  status: FetchStatus.NOT_FETCHED,
};

export default function createQueryResultsReducer<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: {
  updateIdsWhen: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
  invalidateWhen: FetchStatusInputReducerConfig<TError, TAction>;
  removeIdWhen: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
  removeIdsWhen: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
}) {
  const fetchStatusReducer = createFetchStatusReducer({
    updateWhen: inputConfig.updateIdsWhen,
    invalidateWhen: inputConfig.invalidateWhen,
  });
  const getUpdateIdsWhenConfig = queryMultipleKeyedEntityFetchReducerConfigForAction(
    inputConfig.updateIdsWhen,
  );
  const getRemoveIdsWhenConfig = queryMultipleKeyedEntityFetchReducerConfigForAction(
    inputConfig.removeIdsWhen,
  );
  const getRemoveIdWhenConfig = queryKeyedEntityFetchReducerConfigForAction(
    inputConfig.removeIdWhen,
  );
  return function queryResultsReducer(
    state: QueryResultsState = defaultState,
    action: TAction,
  ) {
    const newFetchStatusState = fetchStatusReducer(state.status, action);
    let newIds = state.ids;

    const updateIdsWhenConfig = getUpdateIdsWhenConfig(action);
    if (updateIdsWhenConfig) {
      if (updateIdsWhenConfig.isSuccessAction(action)) {
        newIds = (updateIdsWhenConfig.getDataItemsFromAction(action) || [])
          .map(data => updateIdsWhenConfig.getIdFromData(data, action))
          .filter(Boolean) as string[];
      } else if (updateIdsWhenConfig.isStartAction(action)) {
        newIds = [];
      }
    }

    const removeIdsWhenConfig = getRemoveIdsWhenConfig(action);
    const removeIdWhenConfig = getRemoveIdWhenConfig(action);
    if (removeIdsWhenConfig && removeIdsWhenConfig.isSuccessAction(action)) {
      const idsToRemove = new Set((
        removeIdsWhenConfig.getDataItemsFromAction(action) || []
      )
        .map(data => removeIdsWhenConfig.getIdFromData(data, action))
        .filter(Boolean) as string[]);
      newIds = newIds.filter(id => !idsToRemove.has(id));
    } else if (
      removeIdWhenConfig &&
      removeIdWhenConfig.isSuccessAction(action)
    ) {
      const data = removeIdWhenConfig.getDataFromAction(action);
      if (data) {
        const idToRemove = removeIdWhenConfig.getIdFromData(data, action);
        newIds = newIds.filter(id => id !== idToRemove);
      }
    }

    return {
      ids: newIds,
      status: newFetchStatusState,
    };
  };
}
