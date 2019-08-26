import { AnyAction } from 'redux';
import {
  MultipleKeyedEntityFetchInputReducerConfig,
  KeyedEntityFetchInputReducerConfig,
} from '../types/reducerConfig';
import createEntityFetchReducer, {
  EntityFetchState,
} from './entityFetchReducer';
import createIdMappedReducer, { IdMappedState } from './idMappedReducer';
import {
  queryMultipleKeyedEntityFetchReducerConfigForAction,
  queryKeyedEntityFetchReducerConfigForAction,
} from '../config/normalizeConfig';
import getFirstDefined from '../utils/getFirstDefined';
import FetchStatus from '../models/FetchStatus';

export type EntityCacheState<TData, TError> = IdMappedState<
  EntityFetchState<TData, TError>
>;

export default function createEntityCacheReducer<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: {
  mergeEntitiesWhen?: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
  addEntityWhen?: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
  updateEntityWhen?: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
  invalidateEntityWhen?: KeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
  removeEntityWhen?: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
}) {
  const getMergeEntitiesWhenConfig = queryMultipleKeyedEntityFetchReducerConfigForAction(
    inputConfig.mergeEntitiesWhen,
  );
  const getAddEntityWhenConfig = queryKeyedEntityFetchReducerConfigForAction(
    inputConfig.addEntityWhen,
  );
  const getUpdateEntityConfig = queryKeyedEntityFetchReducerConfigForAction(
    inputConfig.updateEntityWhen,
  );
  const getInvalidateEntityWhenConfig = queryKeyedEntityFetchReducerConfigForAction(
    inputConfig.invalidateEntityWhen,
  );
  const getRemoveEntityWhenConfig = queryKeyedEntityFetchReducerConfigForAction(
    inputConfig.removeEntityWhen,
  );

  const entityFetchReducer = createEntityFetchReducer({
    updateWhen:
      inputConfig.updateEntityWhen && inputConfig.addEntityWhen
        ? {
            // TODO use a function
            ...inputConfig.updateEntityWhen,
            takes: inputConfig.updateEntityWhen.takes.concat(
              inputConfig.addEntityWhen.takes,
            ),
          }
        : inputConfig.updateEntityWhen || inputConfig.addEntityWhen,
    invalidateWhen: inputConfig.invalidateEntityWhen,
  });

  const entityCacheReducerBase = createIdMappedReducer({
    getDataItemsFromAction: (action: TAction) => {
      const relevantConfig = getFirstDefined(
        getMergeEntitiesWhenConfig(action),
      );
      return relevantConfig && relevantConfig.getDataItemsFromAction(action);
    },
    getDataFromAction: (action: TAction) => {
      const relevantConfig = getFirstDefined(
        getAddEntityWhenConfig(action),
        getUpdateEntityConfig(action),
        getInvalidateEntityWhenConfig(action),
      );
      return relevantConfig && relevantConfig.getDataFromAction(action);
    },
    getIdFromData: (data: TData, action: TAction) => {
      const relevantConfig = getFirstDefined(
        getAddEntityWhenConfig(action),
        getUpdateEntityConfig(action),
        getInvalidateEntityWhenConfig(action),
      );
      return relevantConfig && relevantConfig.getIdFromData(data, action);
    },
    perEntityReducer: entityFetchReducer,
  });

  return function entityCacheReducer(
    state: IdMappedState<EntityFetchState<TData, TError>> = {},
    action: TAction,
  ) {
    const addConfig = getAddEntityWhenConfig(action);
    if (addConfig && addConfig.isStartAction(action)) {
      return state;
    }
    const removeConfig = getRemoveEntityWhenConfig(action);
    if (removeConfig) {
      const data = removeConfig.getDataFromAction(action);
      if (!data) {
        return state;
      }
      const id = removeConfig.getIdFromData(data, action);
      if (!id) {
        return state;
      }
      const copy = {
        ...state,
      };
      if (removeConfig.isStartAction(action)) {
        copy[id] = {
          ...copy[id],
          status: new FetchStatus({
            pendingOperation: removeConfig.getCrudFromAction(action),
            needsRefetch: false,
          }),
        };
        return copy;
      }
      if (removeConfig.isSuccessAction(action)) {
        delete copy[id];
        return copy;
      }
      if (removeConfig.isFailureAction(action)) {
        copy[id] = {
          ...copy[id],
          status: new FetchStatus({
            pendingOperation: undefined,
            needsRefetch: false,
            error: removeConfig.getErrorFromAction(action),
          }),
        };
        return copy;
      }
    }
    return entityCacheReducerBase(state, action);
  };
}
