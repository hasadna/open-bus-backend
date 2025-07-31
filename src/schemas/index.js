import S from 'fluent-json-schema';

export const commonErrorResponse = S.object().prop('error', S.string()).prop('message', S.string()).prop('details', S.object());

export const commonSuccessResponse = (itemsSchema = S.object()) => S.object().prop('success', S.boolean().default(true)).prop('data', itemsSchema);

export { S };
