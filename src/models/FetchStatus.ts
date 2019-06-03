import { CrudOperation } from '../types/crudOperation';

export interface FetchStatusFields<TError> {
  readonly pendingOperation: CrudOperation | undefined;
  readonly needsRefetch: boolean;
  readonly error: TError | undefined;
}

export default class FetchStatus<TError = any> implements FetchStatusFields<TError> {
  public static NOT_FETCHED: FetchStatus = new FetchStatus();
  public static COMPLETED: FetchStatus = new FetchStatus({ needsRefetch: false });
  public static PENDING_READ: FetchStatus = new FetchStatus({ pendingOperation: 'read' });

  public readonly pendingOperation: CrudOperation | undefined;
  public readonly needsRefetch: boolean = true;
  public readonly error: TError | undefined;

  public constructor(data: Partial<FetchStatusFields<TError>> = {}) {
    this.pendingOperation = data.pendingOperation;
    this.needsRefetch = typeof data.needsRefetch === 'boolean' ? data.needsRefetch : true;
    this.error = data.error;
  }

  public isFetching(): boolean {
    return this.pendingOperation === 'read';
  }

  public isPending(): boolean {
    return !!this.pendingOperation;
  }

  public isDoneFetching(): boolean {
    return !this.needsRefetch && !this.pendingOperation;
  }
}
