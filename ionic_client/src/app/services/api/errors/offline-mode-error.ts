export class OfflineModeError extends Error {
  public readonly name = 'ServerValidationError';

  public constructor() {
    super();
    Object.setPrototypeOf(this, OfflineModeError.prototype);
  }
}
