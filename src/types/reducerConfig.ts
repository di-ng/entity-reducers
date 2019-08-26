import { AnyAction } from 'redux';
import { CrudOperation } from './crudOperation';

export interface FetchStatusGettersConfig<TError, TAction extends AnyAction> {
  getCrudFromAction: (action: TAction) => CrudOperation;
  getErrorFromAction: (action: TAction) => TError | undefined;
}

export interface EntityDataGettersConfig<TData, TAction extends AnyAction> {
  getDataFromAction: (action: TAction) => TData | undefined;
}

export interface EntityDataItemsGettersConfig<
  TData,
  TAction extends AnyAction
> {
  getDataItemsFromAction: (action: TAction) => TData[] | undefined;
}

export interface EntityIdGettersConfig<TData, TAction extends AnyAction> {
  getIdFromData: (data: TData, action: TAction) => string | undefined;
}

export interface FetchStatusReducerConfig<TError, TAction extends AnyAction>
  extends FetchStatusGettersConfig<TError, TAction> {
  isStartAction: (action: TAction) => boolean;
  isSuccessAction: (action: TAction) => boolean;
  isFailureAction: (action: TAction) => boolean;
}

export interface EntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
>
  extends FetchStatusReducerConfig<TError, TAction>,
    EntityDataGettersConfig<TData, TAction> {}

export interface KeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
>
  extends EntityFetchReducerConfig<TData, TError, TAction>,
    EntityIdGettersConfig<TData, TAction> {}

export interface MultipleKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
>
  extends KeyedEntityFetchReducerConfig<TData, TError, TAction>,
    EntityDataItemsGettersConfig<TData, TAction> {}

export type PartialFetchStatusReducerConfig<
  TError,
  TAction extends AnyAction
> = Partial<FetchStatusReducerConfig<TError, TAction>>;

export type TakeType = string;

export interface PerActionTypeFetchStatusReducerConfig<
  TError,
  TAction extends AnyAction
> extends PartialFetchStatusReducerConfig<TError, TAction> {
  take: TakeType;
}

export interface FetchStatusInputReducerConfig<
  TError,
  TAction extends AnyAction
> extends PartialFetchStatusReducerConfig<TError, TAction> {
  takes: Array<
    TakeType | PerActionTypeFetchStatusReducerConfig<TError, TAction>
  >;
}

export type PartialEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> = Partial<EntityFetchReducerConfig<TData, TError, TAction>>;

export interface PerActionTypeEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> extends PartialEntityFetchReducerConfig<TData, TError, TAction> {
  take: TakeType;
}

export interface EntityFetchInputReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> extends PartialEntityFetchReducerConfig<TData, TError, TAction> {
  takes: Array<
    string | PerActionTypeEntityFetchReducerConfig<TData, TError, TAction>
  >;
}

export type PartialKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> = Partial<KeyedEntityFetchReducerConfig<TData, TError, TAction>>;

export interface PerActionTypeKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> extends PartialKeyedEntityFetchReducerConfig<TData, TError, TAction> {
  take: TakeType;
}

export interface KeyedEntityFetchInputReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> extends PartialKeyedEntityFetchReducerConfig<TData, TError, TAction> {
  takes: Array<
    | TakeType
    | PerActionTypeKeyedEntityFetchReducerConfig<TData, TError, TAction>
  >;
}

export type PartialMultipleKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> = Partial<MultipleKeyedEntityFetchReducerConfig<TData, TError, TAction>>;

export interface PerActionTypeMultipleKeyedEntityFetchReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> extends PartialMultipleKeyedEntityFetchReducerConfig<TData, TError, TAction> {
  take: TakeType;
}

export interface MultipleKeyedEntityFetchInputReducerConfig<
  TData,
  TError,
  TAction extends AnyAction
> extends PartialMultipleKeyedEntityFetchReducerConfig<TData, TError, TAction> {
  takes: Array<
    | TakeType
    | PerActionTypeMultipleKeyedEntityFetchReducerConfig<TData, TError, TAction>
  >;
}
