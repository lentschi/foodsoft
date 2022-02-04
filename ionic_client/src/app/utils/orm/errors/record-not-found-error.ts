export class RecordNotFoundError extends Error {
  public constructor() {
    super();
    Object.setPrototypeOf(this, RecordNotFoundError.prototype);
  }
}
