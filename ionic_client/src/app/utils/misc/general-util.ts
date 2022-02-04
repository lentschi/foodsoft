
const GeneralUtil = {
  notEmpty: <T> (value: T | null | undefined): value is T => value !== null && value !== undefined,
};

export default GeneralUtil;
