import { Type } from 'typebox';

export const optionalObject = (properties, options = {}) => Type.Partial(Type.Object(properties), options);

export const commonErrorResponseModel = optionalObject(
  {
    error: Type.String(),
    message: Type.String(),
    details: Type.Union([
      Type.Object({}, { additionalProperties: true }),
      Type.Array(Type.Object({ field: Type.String(), message: Type.String() }, { additionalProperties: true })),
    ]),
  },
  { $id: 'ErrorResponseModel' },
);

export const commonSuccessResponse = (itemsSchema) =>
  optionalObject({ success: Type.Boolean({ default: true }), data: itemsSchema }, { $id: 'SuccessResponseModel' });

export const dataCodeModel = Type.Object(
  {
    dataText: Type.String({ minLength: 1 }),
    dataCode: Type.Union([Type.String({ minLength: 1 }), Type.Number()]),
  },
  { $id: 'DataCodeModel' },
);

export { Type };
