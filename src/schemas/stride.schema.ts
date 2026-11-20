import { Type } from './index.js';

export const strideValidationModels = [
  Type.Object(
    { detail: Type.Optional(Type.Array(Type.Ref('ValidationError'), { title: 'Detail' })) },
    { title: 'HTTPValidationError', $id: 'HTTPValidationError' },
  ),
  Type.Object(
    {
      loc: Type.Array(Type.Union([Type.String(), Type.Integer()]), { title: 'Location' }),
      msg: Type.String({ title: 'Message' }),
      type: Type.String({ title: 'Error Type' }),
    },
    { title: 'ValidationError', $id: 'ValidationError' },
  ),
];

export const strideValidationResponse = Type.Ref('HTTPValidationError', { description: 'Validation Error' });
