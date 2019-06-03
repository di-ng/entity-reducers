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

export type EntityCacheState<TData, TError> = IdMappedState<
  EntityFetchState<TData, TError>
>;

export default function createEntityCacheReducer<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: {
  mergeEntitiesWhen: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
  removeEntitiesWhen: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
  addEntityWhen: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
  updateEntityWhen: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
  invalidateEntityWhen: KeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >;
  removeEntityWhen: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>;
}) {
  const getMergeEntitiesWhenConfig = queryMultipleKeyedEntityFetchReducerConfigForAction(
    inputConfig.mergeEntitiesWhen,
  );
  const getRemoveEntitiesWhenConfig = queryMultipleKeyedEntityFetchReducerConfigForAction(
    inputConfig.removeEntitiesWhen,
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

  const entityCacheReducer = createIdMappedReducer({
    getDataItemsFromAction: (action: TAction) => {
      const relevantConfig = getFirstDefined(
        getMergeEntitiesWhenConfig(action),
        getRemoveEntitiesWhenConfig(action),
      );
      return relevantConfig && relevantConfig.getDataItemsFromAction(action);
    },
    getDataFromAction: (action: TAction) => {
      const relevantConfig = getFirstDefined(
        getAddEntityWhenConfig(action),
        getUpdateEntityConfig(action),
        getInvalidateEntityWhenConfig(action),
        getRemoveEntityWhenConfig(action),
      );
      return relevantConfig && relevantConfig.getDataFromAction(action);
    },
    getIdFromData: (data: TData, action: TAction) => {
      const relevantConfig = getFirstDefined(
        getMergeEntitiesWhenConfig(action),
        getAddEntityWhenConfig(action),
        getUpdateEntityConfig(action),
        getInvalidateEntityWhenConfig(action),
        getRemoveEntityWhenConfig(action),
        getRemoveEntitiesWhenConfig(action),
      );
      return relevantConfig && relevantConfig.getIdFromData(data, action);
    },
    perEntityReducer: createEntityFetchReducer({
      updateWhen: inputConfig.updateEntityWhen,
      invalidateWhen: inputConfig.invalidateEntityWhen,
    }),
  });

  return entityCacheReducer;
}
