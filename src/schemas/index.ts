import { type TProperties, type TSchema, type TSchemaOptions, Type } from 'typebox';

export const optionalObject = <T extends TProperties>(properties: T, options: TSchemaOptions = {}) => Type.Partial(Type.Object(properties), options);

export const commonErrorResponse = optionalObject(
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

export const commonSuccessResponse = <T extends TSchema>(itemsSchema: T) =>
  optionalObject({ success: Type.Boolean({ default: true }), data: itemsSchema }, { $id: 'SuccessResponseModel' });

export const dataCodeModel = Type.Object(
  {
    dataText: Type.String({ minLength: 1 }),
    dataCode: Type.Union([Type.String({ minLength: 1 }), Type.Number()]),
  },
  { $id: 'DataCodeModel' },
);

export const toggle = Type.String({ $id: 'ToggleModel', enum: ['1', '2'] });

export { Type };
