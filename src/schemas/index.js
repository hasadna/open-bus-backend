import S from 'fluent-json-schema';

/** Common error response schema */
export const commonErrorResponse = S.object().prop('error', S.string()).prop('message', S.string()).prop('details', S.object());

/** Common success response schema */
export const commonSuccessResponse = S.object().prop('success', S.boolean()).prop('data', S.object());

/** Reusable field helpers */
export const idField = () => S.number().description('ID');
export const nameField = () => S.string().minLength(1).maxLength(100).description('Name');
export const descriptionField = () => S.string().maxLength(500).description('Description');
export const emailField = () => S.string().format('email').description('Email address');
export const dateTimeField = () => S.string().format('date-time').description('ISO date-time string');

// Export S for convenience
export { S };

export const exampleSchema = {
  body: S.object().prop('id', idField()).prop('email', emailField()),
  response: {
    200: commonSuccessResponse,
    400: commonErrorResponse,
  },
};
