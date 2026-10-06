import { Type } from 'typebox';

export const optionalObject = (properties, options = {}) => Type.Partial(Type.Object(properties), options);

export const commonErrorResponse = optionalObject(
  { error: Type.String(), message: Type.String(), details: Type.Object({}) },
  { $id: 'ErrorResponseModel' },
);

export const commonSuccessResponse = (itemsSchema) =>
  optionalObject({ success: Type.Boolean({ default: true }), data: itemsSchema }, { $id: 'SuccessResponseModel' });

export const dataCodeModel = optionalObject(
  {
    dataText: Type.Union([Type.String(), Type.Null()]),
    dataCode: Type.Union([Type.String(), Type.Number(), Type.Null()]),
  },
  { $id: 'DataCodeModel' },
);

export const toggle = Type.String({ $id: 'ToggleModel', enum: ['1', '2'] });

export { Type };
