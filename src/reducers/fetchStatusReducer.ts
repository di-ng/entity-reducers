import FetchStatus from '../models/FetchStatus';
import { AnyAction } from 'redux';
import { FetchStatusInputReducerConfig } from '../types/reducerConfig';
import { queryFetchStatusReducerConfigForAction } from '../config/normalizeConfig';

export default function createFetchStatusReducer<
  TError,
  TAction extends AnyAction = AnyAction
>(inputConfig: {
  updateWhen: FetchStatusInputReducerConfig<TError, TAction>;
  invalidateWhen?: FetchStatusInputReducerConfig<TError, TAction>;
}) {
  const getUpdateWhenConfig = queryFetchStatusReducerConfigForAction(
    inputConfig.updateWhen,
  );
  const getInvalidateWhenConfig = queryFetchStatusReducerConfigForAction(
    inputConfig.invalidateWhen,
  );
  return function fetchStatusReducer(
    state: FetchStatus = FetchStatus.NOT_FETCHED,
    action: TAction,
  ): FetchStatus {
    const updateWhenConfig = getUpdateWhenConfig(action);
    if (updateWhenConfig) {
      if (updateWhenConfig.isStartAction(action)) {
        return new FetchStatus({
          needsRefetch: false,
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
    }

    const invalidateWhenConfig = getInvalidateWhenConfig(action);
    if (invalidateWhenConfig && invalidateWhenConfig.isSuccessAction(action)) {
      return new FetchStatus({
        ...state,
        needsRefetch: true,
      });
    }

    return state;
  };
}
