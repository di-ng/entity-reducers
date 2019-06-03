import FetchStatus from '../models/FetchStatus';
import { AnyAction } from 'redux';
import {
  MultipleKeyedEntityFetchInputReducerConfig,
  KeyedEntityFetchInputReducerConfig,
  FetchStatusInputReducerConfig,
} from '../types/reducerConfig';
import { queryMultipleKeyedEntityFetchReducerConfigForAction } from '../config/normalizeConfig';
import createQueryResultsReducer, {
  QueryResultsState,
} from './queryResultsReducer';

export interface PaginatedQueryResultsState extends QueryResultsState {
  readonly pageNum: number;
  readonly offset: number;
}

const defaultState: PaginatedQueryResultsState = {
  ids: [],
  status: FetchStatus.NOT_FETCHED,
  pageNum: 0,
  offset: 0,
};

export default function createPaginatedQueryResultsReducer<
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
  const queryResultsReducer = createQueryResultsReducer(inputConfig);
  const getUpdateIdsWhenConfig = queryMultipleKeyedEntityFetchReducerConfigForAction(
    inputConfig.updateIdsWhen,
  );
  return function paginatedQueryResultsReducer(
    state: PaginatedQueryResultsState = defaultState,
    action: TAction,
  ) {
    const { ids: newIds, status } = queryResultsReducer(state, action);
    let finalIds = newIds;
    let pageNum = state.pageNum;
    let offset = state.offset;

    const updateIdsWhenConfig = getUpdateIdsWhenConfig(action);
    if (updateIdsWhenConfig && updateIdsWhenConfig.isSuccessAction(action)) {
      // TODO make this "loadMore" configurable: Allow append vs replace behavior. Allow next page cursor instead/in addition to offset.
      if (action.meta.loadMore) {
        finalIds = state.ids.concat(newIds);
        pageNum++;
        offset += newIds.length;
      }
    }

    return {
      ids: finalIds,
      status,
      pageNum,
      offset,
    };
  };
}
