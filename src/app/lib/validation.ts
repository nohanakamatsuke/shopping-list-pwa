export const VALIDATION_RULES = {
  item: {
    name: {
      reqired: true,
      minlength: 1,
      maxlength: 50,
      pattern:  /^[^<>{}[\]]*$/,
    }
  }
}