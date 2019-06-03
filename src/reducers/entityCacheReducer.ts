import { MultipleKeyedEntityFetchReducerConfig, MultipleKeyedEntityFetchInputReducerConfig, defaultGetDataFromAction, defaultGetCrudFromAction, defaultGetErrorFromAction, defaultIsStartAction, defaultIsSuccessAction, defaultIsFailureAction, EntityFetchReducerConfig, defaultGetIdFromData, defaultGetDataItemsFromAction, EntityFetchInputReducerConfig } from '../config/reducerConfig';
import { AnyAction } from 'redux';
import createEntityFetchReducer, { EntityFetchState } from './entityFetchReducer';
import createIdMappedReducer, { IdMappedState } from './idMappedReducer';

export type EntityCacheState<TData, TError> = IdMappedState<EntityFetchState<TData, TError>>;

function normalizeMultipleKeyedEntityFetchReducerConfig<TData, TError, TAction extends AnyAction = AnyAction>(
  inputConfig: MultipleKeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
): { [type: string]: MultipleKeyedEntityFetchReducerConfig<TData, TError, TAction> } {
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
  return typesMap;
}

function getFirstDefined<T>(...items: T[]): T | undefined {
  return items.find(item => !!item);
}

export default function createEntityCacheReducer<TData, TError, TAction extends AnyAction = AnyAction>(
  inputConfig: {
    mergeEntitiesWhen: MultipleKeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
    removeEntitiesWhen: MultipleKeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
    addEntityWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
    updateEntityWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
    invalidateEntityWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
    removeEntityWhen: EntityFetchInputReducerConfig<TData, TError, TAction>,
  },
) {
  const mergeEntitiesWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.mergeEntitiesWhen);
  const addEntityWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.addEntityWhen);
  const updateEntityConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.updateEntityWhen);
  const invalidateEntityWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.invalidateEntityWhen);
  const removeEntityWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.removeEntityWhen);
  const removeEntitiesWhenConfig = normalizeMultipleKeyedEntityFetchReducerConfig(inputConfig.removeEntitiesWhen);

  const entityCacheReducer = createIdMappedReducer({
    getDataItemsFromAction: (action: TAction) => {
      const relevantConfig = getFirstDefined(mergeEntitiesWhenConfig[action.type], removeEntitiesWhenConfig[action.type]);
      return relevantConfig && relevantConfig.getDataItemsFromAction(action);
    },
    getDataFromAction: (action: TAction) => {
      const relevantConfig = getFirstDefined(
        addEntityWhenConfig[action.type],
        updateEntityConfig[action.type],
        invalidateEntityWhenConfig[action.type],
        removeEntityWhenConfig[action.type],
      );
      return relevantConfig && relevantConfig.getDataFromAction(action);
    },
    getIdFromData: (data: TData, action: TAction) => {
      const relevantConfig = getFirstDefined(
        mergeEntitiesWhenConfig[action.type],
        addEntityWhenConfig[action.type],
        updateEntityConfig[action.type],
        invalidateEntityWhenConfig[action.type],
        removeEntityWhenConfig[action.type],
        removeEntitiesWhenConfig[action.type],
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
