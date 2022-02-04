import { AppModel } from 'src/app/utils/orm';

export class ServerValidationError<ModelType extends AppModel> extends Error {
  public readonly name = 'ServerValidationError';

  public constructor(public validationErrors: Map<keyof ModelType, string>) {
    super();
    Object.setPrototypeOf(this, ServerValidationError.prototype);
  }

  public get message(): string {
    return `Validation errors returned by server:\n${Array.from(this.validationErrors.entries()).map(([key, value]) => `- ${key}: '${value}'`)
      .join('\n')}`;
  }
}
