import { Type } from 'typebox';

export const optionalObject = (properties, options = {}) => Type.Partial(Type.Object(properties), options);

export const commonErrorResponse = optionalObject(
  { error: Type.String(), message: Type.String(), details: Type.Object({}) },
  { $id: 'ErrorResponse' },
);

export const commonSuccessResponse = (itemsSchema) =>
  optionalObject({ success: Type.Boolean({ default: true }), data: itemsSchema }, { $id: 'SuccessResponseModel' });

export const DataCode = optionalObject(
  {
    dataText: Type.Union([Type.String(), Type.Null()]),
    dataCode: Type.Union([Type.String(), Type.Number(), Type.Null()]),
  },
  { $id: 'DataCode' },
);

export { Type };
