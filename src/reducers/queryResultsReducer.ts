import FetchStatus from '../models/FetchStatus';
import { AnyAction } from 'redux';
import { MultipleKeyedEntityFetchInputReducerConfig, EntityFetchInputReducerConfig, FetchStatusInputReducerConfig, EntityFetchReducerConfig, defaultGetDataFromAction, defaultGetCrudFromAction, defaultGetErrorFromAction, defaultIsStartAction, defaultIsSuccessAction, defaultIsFailureAction, MultipleKeyedEntityFetchReducerConfig, defaultGetDataItemsFromAction, defaultGetIdFromData } from '../config/reducerConfig';
import createFetchStatusReducer from './fetchStatusReducer';

export interface QueryResultsState {
  readonly ids: Readonly<string[]>,
  readonly status: Readonly<FetchStatus>;
}

function normalizeMultipleKeyedEntityFetchReducerConfig<TData, TError, TAction extends AnyAction = AnyAction>(
  inputConfig: MultipleKeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
): MultipleKeyedEntityFetchReducerConfig<TData, TError, TAction> {
  const {
    types,
    getDataFromAction = defaultGetDataFromAction,
    getDataItemsFromAction = defaultGetDataItemsFromAction,
    getIdFromData = defaultGetIdFromData,
    getCrudFromAction = defaultGetCrudFromAction,
    getErrorFromAction = defaultGetErrorFromAction,
    isStartAction = defaultIsStartAction,
    isSuccessAction = defaultIsSuccessAction,
    isFailureAction = defaultIsFailureAction,
  } = inputConfig;
  const inputConfigWithDefaults = { getDataFromAction, getDataItemsFromAction, getIdFromData, getCrudFromAction, getErrorFromAction, isStartAction, isSuccessAction, isFailureAction };
  const typesMap: { [type: string]: MultipleKeyedEntityFetchReducerConfig<TData, TError, TAction> } = {};
  types.forEach(typeData => {
    const type = typeof typeData === 'string' ? typeData : typeData.type;
    const config = typeof typeData === 'string' ? inputConfigWithDefaults : {
      ...inputConfigWithDefaults,
      ...typeData,
    };
    typesMap[type] = config;
  });
  return {
    getDataItemsFromAction: action => typesMap[action.type] ? typesMap[action.type].getDataItemsFromAction(action) : undefined,
    getIdFromData: (data, action) => typesMap[action.type] ? typesMap[action.type].getIdFromData(data, action) : undefined,
    getDataFromAction: action => typesMap[action.type] ? typesMap[action.type].getDataFromAction(action) : undefined,
    getCrudFromAction: action => typesMap[action.type] ? typesMap[action.type].getCrudFromAction(action) : defaultGetCrudFromAction(action),
    getErrorFromAction: action => typesMap[action.type] ? typesMap[action.type].getErrorFromAction(action) : undefined,
    isStartAction: action => typesMap[action.type] ? typesMap[action.type].isStartAction(action) : false,
    isSuccessAction: action => typesMap[action.type] ? typesMap[action.type].isSuccessAction(action) : false,
    isFailureAction: action => typesMap[action.type] ? typesMap[action.type].isFailureAction(action) : false,
  }
}

const defaultState: QueryResultsState = {
  ids: [],
  status: FetchStatus.NOT_FETCHED,
}

export default function createQueryResultsReducer<TData, TError, TAction extends AnyAction = AnyAction>(
  inputConfig: {
    updateIdsWhen: MultipleKeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
    invalidateWhen: FetchStatusInputReducerConfig<TError, TAction>,
    removeIdWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
    removeIdsWhen: MultipleKeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
  },
) {
  const fetchStatusReducer = createFetchStatusReducer({
    updateWhen: inputConfig.updateIdsWhen,
    invalidateWhen: inputConfig.invalidateWhen,
  });
  const updateIdsWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.updateIdsWhen);
  const removeIdsWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.removeIdsWhen);
  const removeIdWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.removeIdWhen);
  return function queryResultsReducer(state: QueryResultsState = defaultState, action: TAction) {
    const newFetchStatusState = fetchStatusReducer(state.status, action);
    let newIds = state.ids;
    if (updateIdsWhenConfig.isSuccessAction(action)) {
      newIds = (updateIdsWhenConfig.getDataItemsFromAction(action) || [])
        .map(data => updateIdsWhenConfig.getIdFromData(data, action))
        .filter(Boolean) as string[];
    } else if (updateIdsWhenConfig.isStartAction(action)) {
      newIds = [];
    } else {
      if (removeIdsWhenConfig.isSuccessAction(action)) {
        const idsToRemove = new Set((removeIdsWhenConfig.getDataItemsFromAction(action) || [])
          .map(data => removeIdsWhenConfig.getIdFromData(data, action))
          .filter(Boolean) as string[]);
        newIds = newIds.filter(id => !idsToRemove.has(id));
      } else if (removeIdsWhenConfig.isSuccessAction(action)) {
        const data = removeIdWhenConfig.getDataFromAction(action);
        if (data) {
          const idToRemove = removeIdWhenConfig.getIdFromData(data, action);
          newIds = newIds.filter(id => id !== idToRemove);
        }
      }
    }
    return {
      ids: newIds,
      status: newFetchStatusState,
    }
  };
}
