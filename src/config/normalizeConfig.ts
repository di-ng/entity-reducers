import { AnyAction } from 'redux';
import omit from 'lodash.omit';
import {
  FetchStatusInputReducerConfig,
  FetchStatusReducerConfig,
  EntityFetchInputReducerConfig,
  EntityFetchReducerConfig,
  MultipleKeyedEntityFetchInputReducerConfig,
  MultipleKeyedEntityFetchReducerConfig,
  KeyedEntityFetchInputReducerConfig,
  KeyedEntityFetchReducerConfig,
} from '../types/reducerConfig';
import { CrudOperation } from '../types/crudOperation';

export const defaultIsStartAction = (action: AnyAction) =>
  action.sequence === 'start';
export const defaultIsSuccessAction = (action: AnyAction) =>
  !action.sequence ? true : !action.error && action.sequence === 'done';
export const defaultIsFailureAction = (action: AnyAction) =>
  action.error && action.sequence === 'done';
export const defaultGetCrudFromAction = (action: AnyAction) =>
  ((action.meta && action.meta.crud) || 'read') as CrudOperation;
export const defaultGetErrorFromAction = <TError extends any>(
  action: AnyAction,
) => action.payload as TError;
export const defaultGetDataFromAction = (action: AnyAction) => action.payload;
export const defaultGetDataItemsFromAction = (action: AnyAction) =>
  action.payload;
export const defaultGetIdFromData = (data: any, _action: AnyAction) =>
  data && data.id ? data.id : data;

type ConfigForAction<TConfig> = (action: AnyAction) => TConfig | undefined;
type ActionTypeToConfigMap<TConfig> = { [actionType: string]: TConfig };

function normalizeFetchStatusReducerConfig<
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: FetchStatusInputReducerConfig<TError, TAction>) {
  const {
    types,
    getCrudFromAction = defaultGetCrudFromAction,
    getErrorFromAction = defaultGetErrorFromAction,
    isStartAction = defaultIsStartAction,
    isSuccessAction = defaultIsSuccessAction,
    isFailureAction = defaultIsFailureAction,
  } = inputConfig;
  return {
    types,
    getCrudFromAction,
    getErrorFromAction,
    isStartAction,
    isSuccessAction,
    isFailureAction,
  };
}

function normalizeEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: EntityFetchInputReducerConfig<TData, TError, TAction>) {
  const { getDataFromAction = defaultGetDataFromAction } = inputConfig;
  return {
    ...normalizeFetchStatusReducerConfig(inputConfig),
    getDataFromAction,
  };
}

function normalizeKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(
  inputConfig: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >,
) {
  const { getIdFromData = defaultGetIdFromData } = inputConfig;
  return {
    ...normalizeEntityFetchReducerConfig(inputConfig),
    getIdFromData,
  };
}

function normalizeMultipleKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(
  inputConfig: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >,
) {
  const {
    getDataItemsFromAction = defaultGetDataItemsFromAction,
  } = inputConfig;
  return {
    ...normalizeKeyedEntityFetchReducerConfig(inputConfig),
    getDataItemsFromAction,
  };
}

function createActionTypeToConfigMap<TCommonConfig extends {}>(
  normalizedConfig: TCommonConfig & {
    types: Array<string | Partial<TCommonConfig> & { type: string }>;
  },
): ActionTypeToConfigMap<TCommonConfig & { type: string }> {
  const { types } = normalizedConfig;
  const typesMap: ActionTypeToConfigMap<TCommonConfig & { type: string }> = {};
  types.forEach(typeData => {
    let type: string;
    let config: TCommonConfig & { type: string };
    if (typeof typeData === 'string') {
      type = typeData as string;
      config = {
        ...(omit(normalizedConfig, 'types') as any),
        type,
      };
    } else {
      type = typeData.type;
      config = {
        ...normalizedConfig,
        ...typeData,
      };
    }
    typesMap[type] = config;
  });
  return typesMap;
}

export function queryFetchStatusReducerConfigForAction<
  TError,
  TAction extends AnyAction = AnyAction
>(
  inputConfig?: FetchStatusInputReducerConfig<TError, TAction>,
): ConfigForAction<FetchStatusReducerConfig<TError, TAction>> {
  if (!inputConfig) {
    return () => undefined;
  }
  const normalizedConfig = normalizeFetchStatusReducerConfig<TError, TAction>(
    inputConfig,
  );
  const configMap = createActionTypeToConfigMap<
    FetchStatusReducerConfig<TError, TAction>
  >(normalizedConfig);
  return ({ type }) => configMap[type];
}

export function queryEntityFetchReducerConfigForAction<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(
  inputConfig?: EntityFetchInputReducerConfig<TData, TError, TAction>,
): ConfigForAction<EntityFetchReducerConfig<TData, TError, TAction>> {
  if (!inputConfig) {
    return () => undefined;
  }
  const normalizedConfig = normalizeEntityFetchReducerConfig<
    TData,
    TError,
    TAction
  >(inputConfig);
  const configMap = createActionTypeToConfigMap<
    EntityFetchReducerConfig<TData, TError, TAction>
  >(normalizedConfig);
  return ({ type }) => configMap[type];
}

export function queryKeyedEntityFetchReducerConfigForAction<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(
  inputConfig?: KeyedEntityFetchInputReducerConfig<TData, TError, TAction>,
): ConfigForAction<KeyedEntityFetchReducerConfig<TData, TError, TAction>> {
  if (!inputConfig) {
    return () => undefined;
  }
  const normalizedConfig = normalizeKeyedEntityFetchReducerConfig<
    TData,
    TError,
    TAction
  >(inputConfig);
  const configMap = createActionTypeToConfigMap<
    KeyedEntityFetchReducerConfig<TData, TError, TAction>
  >(normalizedConfig);
  return ({ type }) => configMap[type];
}

export function queryMultipleKeyedEntityFetchReducerConfigForAction<
  TData,
  TError,
  TAction extends AnyAction = AnyAction
>(
  inputConfig?: MultipleKeyedEntityFetchInputReducerConfig<
    TData,
    TError,
    TAction
  >,
): ConfigForAction<
  MultipleKeyedEntityFetchReducerConfig<TData, TError, TAction>
> {
  if (!inputConfig) {
    return () => undefined;
  }
  const normalizedConfig = normalizeMultipleKeyedEntityFetchReducerConfig<
    TData,
    TError,
    TAction
  >(inputConfig);
  const configMap = createActionTypeToConfigMap<
    MultipleKeyedEntityFetchReducerConfig<TData, TError, TAction>
  >(normalizedConfig);
  return ({ type }) => configMap[type];
}
