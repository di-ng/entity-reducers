import { AnyAction, Reducer } from 'redux';
import {
  EntityIdGettersConfig,
  EntityDataGettersConfig,
  EntityDataItemsGettersConfig,
} from '../types/reducerConfig';

export type IdMappedState<TState> = { readonly [id: string]: TState };

export interface IdMappedReducerConfig<
  TState,
  TData,
  TAction extends AnyAction = AnyAction
>
  extends Partial<EntityIdGettersConfig<TData, TAction>>,
    Partial<EntityDataGettersConfig<TData, TAction>>,
    Partial<EntityDataItemsGettersConfig<TData, TAction>> {
  perEntityReducer: Reducer<TState, TAction>;
}

const defaultState: IdMappedState<any> = {};

export default function createIdMappedReducer<
  TState,
  TData,
  TAction extends AnyAction = AnyAction
>({
  getDataItemsFromAction = action => action.payload,
  getIdFromData = data => (data as any).id,
  getDataFromAction = action => action.payload,
  perEntityReducer,
}: IdMappedReducerConfig<TState, TData, TAction>) {
  return function idMappedReducer(state = defaultState, action: TAction) {
    const dataItems = getDataItemsFromAction(action);
    if (dataItems) {
      const ids = dataItems.map(data => getIdFromData(data, action));
      if (!ids.length) {
        return state;
      }
      return {
        ...state,
        ...ids.reduce(
          (prev, id, i) =>
            id
              ? {
                  ...prev,
                  [id]: perEntityReducer(state[id], {
                    ...action,
                    payload: dataItems[i],
                  }),
                }
              : prev,
          {},
        ),
      };
    } else {
      const data = getDataFromAction(action);
      if (!data) {
        return state;
      }
      const id = getIdFromData(data, action);
      if (!id) {
        return state;
      }
      return {
        ...state,
        [id]: perEntityReducer(state[id], action),
      };
    }
  };
}
