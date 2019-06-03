import { AnyAction, Reducer } from 'redux';
import { EntityIdGettersConfig, EntityDataGettersConfig, EntityDataItemsGettersConfig } from '../config/reducerConfig';

export type IdMappedState<TState> = { readonly [id: string]: TState };

export interface IdMappedReducerConfig<TState, TData, TAction extends AnyAction = AnyAction> extends
    EntityIdGettersConfig<TData, TAction>, EntityDataGettersConfig<TData, TAction>, EntityDataItemsGettersConfig<TData, TAction> {
  perEntityReducer: Reducer<TState, TAction>;
}

const defaultState: IdMappedState<any> = {};

export default function createIdMappedReducer<TState, TData, TAction extends AnyAction = AnyAction>(
  config: IdMappedReducerConfig<TState, TData, TAction>,
) {
  return function idMappedReducer(state = defaultState, action: TAction) {
    const dataItems = config.getDataItemsFromAction(action);
    if (dataItems) {
      const ids = dataItems.map(data => config.getIdFromData(data, action)).filter(Boolean) as string[];
      if (!ids.length) {
        return state;
      }
      return {
        ...state,
        ...ids.reduce((prev, id) => ({
          ...prev,
          [id]: config.perEntityReducer(state[id], action),
        }), {}),
      };
    } else {
      const data = config.getDataFromAction(action);
      if (!data) {
        return state;
      }
      const id = config.getIdFromData(data, action);
      if (!id) {
        return state;
      }
      return {
        ...state,
        ...config.perEntityReducer(state[id], action),
      }
    }
  };
}
