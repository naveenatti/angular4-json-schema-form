/**
 * 'convertJsonSchemaToDraft6' function
 *
 * Converts JSON Schema version 3 or 4 to JSON Schema version 6
 *
 * Partially based on geraintluff's JSON Schema 3 to 4 compatibility function
 * https://github.com/geraintluff/json-schema-compatibility
 * Also uses suggestions from AJV's JSON Schema 4 to 6 migration guide
 * https://github.com/epoberezkin/ajv/releases/tag/5.0.0
 *
 * @param {object} originalSchema - JSON schema (version 3 or 4)
 * @return {object} - JSON schema (version 6)
 */
export declare function convertJsonSchemaToDraft6(schema: any): any;
