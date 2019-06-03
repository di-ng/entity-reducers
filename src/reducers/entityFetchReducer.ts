import FetchStatus from '../models/FetchStatus';
import { EntityFetchInputReducerConfig } from '../types/reducerConfig';
import { AnyAction } from 'redux';
import createFetchStatusReducer from './fetchStatusReducer';
import { queryEntityFetchReducerConfigForAction } from '../config/normalizeConfig';

export interface EntityFetchState<TData, TError> {
  readonly status: Readonly<FetchStatus<TError>>;
  readonly data: Readonly<TData> | undefined;
}

const defaultState: EntityFetchState<any, any> = {
  status: FetchStatus.NOT_FETCHED,
  data: undefined,
};

export default function createEntityFetchReducer<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: {
  updateWhen: EntityFetchInputReducerConfig<TData, TError, TAction>;
  invalidateWhen: EntityFetchInputReducerConfig<TData, TError, TAction>;
}) {
  const fetchStatusReducer = createFetchStatusReducer(inputConfig);
  const getUpdateWhenConfig = queryEntityFetchReducerConfigForAction(
    inputConfig.updateWhen,
  );
  return function entityFetchReducer(
    state: EntityFetchState<TData, TError> = defaultState,
    action: TAction,
  ) {
    const newFetchStatusState = fetchStatusReducer(state.status, action);
    let newDataState;
    const updateWhenConfig = getUpdateWhenConfig(action);
    if (updateWhenConfig) {
      newDataState = updateWhenConfig.isStartAction(action)
        ? undefined
        : updateWhenConfig.isSuccessAction(action)
        ? updateWhenConfig.getDataFromAction(action)
        : undefined;
    }
    return {
      status: newFetchStatusState,
      data: newDataState,
    };
  };
}
