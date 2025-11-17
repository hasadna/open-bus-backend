import S from 'fluent-json-schema';

export const commonErrorResponse = S.object()
  .id('ErrorResponseModel')
  .prop('error', S.string())
  .prop('message', S.string())
  .prop('details', S.object());

export const commonSuccessResponse = (itemsSchema) =>
  S.object().id('SuccessResponseModel').prop('success', S.boolean().default(true)).prop('data', itemsSchema);

export const dataCodeModel = S.object()
  .id('DataCodeModel')
  .prop('DataCode', S.oneOf([S.string(), S.number()]).required())
  .prop('DataText', S.string().required());

export const toggle = S.string().id('ToggleModel').enum(['1', '2']);

export { S };
