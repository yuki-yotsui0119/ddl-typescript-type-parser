// すべて大文字

const STRING: string[] = ['CHARACTER', 'VARCHAR', 'TEXT'];

const NUMBER: string[] = [
    'BIGINT',
    'BIGSERIAL',
    'BIT',
    'DOUBLE',
    'INTEGER',
    'DECIMAL',
    'SMALLINT',
    'SERIAL'
];

const BOOLEAN: string[] = ['BOOL', 'BOOLEAN'];

const DATE: string[] = ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME'];

const JSON_TYPE: string[] = ['JSON'];

// ユーザー独自の型定義
const CUSTOM_TYPE: string[] = [];

export { STRING, NUMBER, BOOLEAN, DATE, JSON_TYPE, CUSTOM_TYPE };
