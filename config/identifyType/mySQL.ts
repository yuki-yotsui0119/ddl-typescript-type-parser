// すべて大文字

const STRING: string[] = ['CHAR', 'VARCHAR', 'TEXT'];

const NUMBER: string[] = [
    'TINYINT',
    'SMALLINT',
    'MEDIUMINT',
    'INT',
    'INTEGER',
    'BIGINT',
    'SERIAL',
    'DECIMAL',
    'DEC',
    'NUMERIC',
    'FLOAT',
    'DOUBLE',
    'REAL'
];

const BOOLEAN: string[] = ['BOOL', 'BOOLEAN'];

const DATE: string[] = ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME'];

const JSON_TYPE: string[] = ['JSON'];

// ユーザー独自の型定義
const CUSTOM_TYPE: string[] = [];

export { STRING, NUMBER, BOOLEAN, DATE, JSON_TYPE, CUSTOM_TYPE };
