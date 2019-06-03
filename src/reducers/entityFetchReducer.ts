import FetchStatus from '../models/FetchStatus';
import { EntityFetchInputReducerConfig, EntityFetchReducerConfig, defaultGetCrudFromAction, defaultGetErrorFromAction, defaultIsStartAction, defaultIsSuccessAction, defaultIsFailureAction, defaultGetDataFromAction } from '../config/reducerConfig';
import { AnyAction } from 'redux';
import createFetchStatusReducer from './fetchStatusReducer';

export interface EntityFetchState<TData, TError> {
  readonly status: Readonly<FetchStatus<TError>>;
  readonly data: Readonly<TData> | undefined;
}

function normalizeEntityFetchReducerConfig<TData, TError, TAction extends AnyAction = AnyAction>(
  inputConfig: EntityFetchInputReducerConfig<TData, TError, TAction>,
): EntityFetchReducerConfig<TData, TError, TAction> {
  const {
    types,
    getDataFromAction = defaultGetDataFromAction,
    getCrudFromAction = defaultGetCrudFromAction,
    getErrorFromAction = defaultGetErrorFromAction,
    isStartAction = defaultIsStartAction,
    isSuccessAction = defaultIsSuccessAction,
    isFailureAction = defaultIsFailureAction,
  } = inputConfig;
  const inputConfigWithDefaults = { getDataFromAction, getCrudFromAction, getErrorFromAction, isStartAction, isSuccessAction, isFailureAction };
  const typesMap: { [type: string]: EntityFetchReducerConfig<TData, TError, TAction> } = {};
  types.forEach(typeData => {
    const type = typeof typeData === 'string' ? typeData : typeData.type;
    const config = typeof typeData === 'string' ? inputConfigWithDefaults : {
      ...inputConfigWithDefaults,
      ...typeData,
    };
    typesMap[type] = config;
  });
  return {
    getDataFromAction: action => typesMap[action.type] ? typesMap[action.type].getDataFromAction(action) : undefined,
    getCrudFromAction: action => typesMap[action.type] ? typesMap[action.type].getCrudFromAction(action) : defaultGetCrudFromAction(action),
    getErrorFromAction: action => typesMap[action.type] ? typesMap[action.type].getErrorFromAction(action) : undefined,
    isStartAction: action => typesMap[action.type] ? typesMap[action.type].isStartAction(action) : false,
    isSuccessAction: action => typesMap[action.type] ? typesMap[action.type].isSuccessAction(action) : false,
    isFailureAction: action => typesMap[action.type] ? typesMap[action.type].isFailureAction(action) : false,
  };
}

const defaultState: EntityFetchState<any, any> = {
  status: FetchStatus.NOT_FETCHED,
  data: undefined,
};

export default function createEntityFetchReducer<TData, TError, TAction extends AnyAction = AnyAction>(
  inputConfig: {
    updateWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
    invalidateWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
  },
) {
  const fetchStatusReducer = createFetchStatusReducer(inputConfig);
  const updateWhenConfig = normalizeEntityFetchReducerConfig(inputConfig.updateWhen);
  return function entityFetchReducer(state: EntityFetchState<TData, TError> = defaultState, action: TAction) {
    const newFetchStatusState = fetchStatusReducer(state.status, action);
    const newFetchDataState = updateWhenConfig.isStartAction(action) ?
      undefined :
      updateWhenConfig.isSuccessAction(action) ?
      updateWhenConfig.getDataFromAction(action) :
      undefined;
    return {
      status: newFetchStatusState,
      data: newFetchDataState,
    };
  }
}
