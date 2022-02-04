import { FormGroup } from '@angular/forms';
import { ServerValidationError } from 'src/app/services/api/errors/server-validation-error';

const ValidationUtil = {
  setFormErrors: (formGroup: FormGroup, e: Error): void => {
    if (e instanceof ServerValidationError) {
      for (const [fieldName, errorMessage] of e.validationErrors) {
        formGroup.controls[<string> fieldName].setErrors({ serverValidation: errorMessage });
      }
    } else {
      throw e;
    }
  },
};

export default ValidationUtil;
