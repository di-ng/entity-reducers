import FetchStatus from '../models/FetchStatus';
import { AnyAction } from 'redux';
import {
  FetchStatusInputReducerConfig,
  FetchStatusReducerConfig,
  defaultGetCrudFromAction,
  defaultGetErrorFromAction,
  defaultIsStartAction,
  defaultIsSuccessAction,
  defaultIsFailureAction,
} from '../config/reducerConfig';

function normalizeFetchStatusReducerConfig<TError, TAction extends AnyAction = AnyAction>(
  inputConfig: FetchStatusInputReducerConfig<TError, TAction>,
): FetchStatusReducerConfig<TError, TAction> {
  const {
    types,
    getCrudFromAction = defaultGetCrudFromAction,
    getErrorFromAction = defaultGetErrorFromAction,
    isStartAction = defaultIsStartAction,
    isSuccessAction = defaultIsSuccessAction,
    isFailureAction = defaultIsFailureAction,
  } = inputConfig;
  const inputConfigWithDefaults = { getCrudFromAction, getErrorFromAction, isStartAction, isSuccessAction, isFailureAction };
  const typesMap: { [type: string]: FetchStatusReducerConfig<TError, TAction> } = {};
  types.forEach(typeData => {
    const type = typeof typeData === 'string' ? typeData : typeData.type;
    const config = typeof typeData === 'string' ? inputConfigWithDefaults : {
      ...inputConfigWithDefaults,
      ...typeData,
    };
    typesMap[type] = config;
  });
  return {
    getCrudFromAction: action => typesMap[action.type] ? typesMap[action.type].getCrudFromAction(action) : defaultGetCrudFromAction(action),
    getErrorFromAction: action => typesMap[action.type] ? typesMap[action.type].getErrorFromAction(action) : undefined,
    isStartAction: action => typesMap[action.type] ? typesMap[action.type].isStartAction(action) : false,
    isSuccessAction: action => typesMap[action.type] ? typesMap[action.type].isSuccessAction(action) : false,
    isFailureAction: action => typesMap[action.type] ? typesMap[action.type].isFailureAction(action) : false,
  };
}

export default function createFetchStatusReducer<TError, TAction extends AnyAction = AnyAction>(
  inputConfig: {
    updateWhen: FetchStatusInputReducerConfig<TError, TAction>,
    invalidateWhen: FetchStatusInputReducerConfig<TError, TAction>,
  },
) {
  const updateWhenConfig = normalizeFetchStatusReducerConfig(inputConfig.updateWhen);
  const invalidateWhenConfig = normalizeFetchStatusReducerConfig(inputConfig.invalidateWhen);
  return function fetchStatusReducer(
    state: FetchStatus = FetchStatus.NOT_FETCHED,
    action: TAction,
  ): FetchStatus {
    if (updateWhenConfig.isStartAction(action)) {
      return new FetchStatus({
        pendingOperation: updateWhenConfig.getCrudFromAction(action),
      });
    }
    if (updateWhenConfig.isFailureAction(action)) {
      return new FetchStatus({
        needsRefetch: false,
        error: updateWhenConfig.getErrorFromAction(action),
      });
    }
    if (updateWhenConfig.isSuccessAction(action)) {
      return FetchStatus.COMPLETED;
    }
    if (invalidateWhenConfig.isSuccessAction(action)) {
      return new FetchStatus({
        ...state,
        needsRefetch: true,
      });
    }
    return state;
  };
}
