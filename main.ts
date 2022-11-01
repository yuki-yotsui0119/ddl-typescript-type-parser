import * as fs from 'node:fs';
import yargs from 'yargs';
import * as MySQLType from './config/identifyType/mySQL';
import * as PostgreSQLType from './config/identifyType/postgreSQL';


function toCamelcase(str: string, upper: boolean = false) {
    if (typeof str !== 'string') return str;

    let strs = str.split(/[-_ ]+/),
        i = 1,
        len = strs.length;

    if (len <= 1) return str;

    if (upper) {
        i = 0;
        str = '';
    } else {
        str = strs[0].toLowerCase();
    }

    for (; i < len; i++) {
        str += strs[i].toLowerCase().replace(/^[a-z]/, function (value) {
            return value.toUpperCase();
        });
    }

    return str;
}

function readCommand() {
    const args = yargs
        .version().alias('v', 'version')
        .help().alias('h', 'help')
        .options({
            sqlFilePath: {
                type: 'string',
                demandOption: true,
                alias: 'f',
            },
            dbType: {
                type: 'string',
                demandOption: true,
                alias: 'd',
                choices: ['MySQL', 'PostgreSQL'],
                default: 'MySQL'
            },
            outputDir: {
                type: 'string',
                demandOption: true,
                alias: 'o',
                default: './generateSql'
            }
        })
        .parseSync();
    return args;
}

function readFile(filePath: string) {
    const file = fs.readFileSync(filePath, 'utf8');
    return file;
}

function splitSql(sql: string, dbType: string) {
    const splitedTableSqls = splitTable(sql, dbType);
    const tableDatas = splitedTableSqls?.map((splitedTableSql) => {
        let { splittedRow: splittedRows, tableName } = splitRow(splitedTableSql || '', dbType);
        splittedRows = splittedRows.map((splittedRow) => {
            return removeHeadComma(splittedRow);
        });
        const columnInfo: [string, string][] = [];
        splittedRows.forEach((splittedRow) => {
            const columnName = getColumnName(splittedRow);
            if (columnName === 'constraint') {
                return;
            }
            const type = analyzeRow(splittedRow, columnName, dbType);
            columnInfo.push([columnName, type]);
        });

        return {
            tableName,
            columnInfo
        };
    });

    return tableDatas || [];
}

function analyzeRow(row: string, columnName: string, dbType: string) {
    const isNotNull = /not null/i.test(row);
    row = row.replace(/not null/i, '');

    // comment
    row = row.substring(0, row.indexOf('comment') === -1 ? undefined : row.indexOf('comment'));
    row = row.substring(0, row.indexOf('COMMENT') === -1 ? undefined : row.indexOf('COMMENT'));

    // default value
    row = row.substring(0, row.indexOf('default') === -1 ? undefined : row.indexOf('default'));
    row = row.substring(0, row.indexOf('DEFAULT') === -1 ? undefined : row.indexOf('DEFAULT'));

    row = row.replace(`${columnName} `, '');
    row = row.replace(`${columnName} `, '');

    if (dbType === 'MySQL') {
        row = row.replace(`\`${columnName}\``, '');
    } else if ('PostgreSQL') {
        row = row.replace(`${columnName} `, '');
    } else {
        throw Error('DBのタイプが不正です。');
    }

    let type = '';
    // type
    if (dbType === 'MySQL') {
        type = analyzeTypeForMySQL(row);
    } else if ('PostgreSQL') {
        type = analyzeTypeForPotgreSQL(row);
    } else {
        throw Error('DBのタイプが不正です。');
    }

    return isNotNull ? type : type + ' | null';
}

function analyzeTypeForPotgreSQL(type: string) {
    const isString = PostgreSQLType.STRING.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isNumber = PostgreSQLType.NUMBER.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isBoolean = PostgreSQLType.BOOLEAN.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isDate = PostgreSQLType.DATE.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isJson = PostgreSQLType.JSON_TYPE.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isCusomType = PostgreSQLType.CUSTOM_TYPE.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    if (isString) {
        return 'string';
    } else if (isNumber) {
        return 'number';
    } else if (isBoolean) {
        return 'boolean';
    } else if (isDate) {
        return 'Date';
    } else if (isJson) {
        // 後ほど変えてもらう
        return 'json';
    } else if (isCusomType) {
        return type;
    } else {
        throw Error('型が不明です。');
    }
}

function analyzeTypeForMySQL(type: string) {
    const isString = MySQLType.STRING.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isNumber = MySQLType.NUMBER.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isBoolean = MySQLType.BOOLEAN.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isDate = MySQLType.DATE.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isJson = MySQLType.JSON_TYPE.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    const isCusomType = MySQLType.CUSTOM_TYPE.find((str) => {
        const regexp = new RegExp(`${str}`, 'i');
        return regexp.test(type);
    });

    if (isString) {
        return 'string';
    } else if (isNumber) {
        return 'number';
    } else if (isBoolean) {
        return 'boolean';
    } else if (isDate) {
        return 'Date';
    } else if (isJson) {
        // 後ほど変えてもらう
        return 'json';
    } else if (isCusomType) {
        return type;
    } else {
        throw Error('型が不明です。');
    }
}

function getTableName(sql: string, dbType: string) {
    let tableName = sql;
    if (dbType === 'MySQL') {
        tableName = tableName.replace('create table `', '');
        tableName = tableName.replace('` (', '');
    } else if ('PostgreSQL') {
        tableName = tableName.replace('create table ', '');
        tableName = tableName.replace(' (', '');
    }

    if (!tableName) {
        throw Error('dbの種類が不正です。');
    }

    return tableName;
}

function removeHeadComma(sql: string) {
    return sql.replace('  , ', '');
}

function splitRow(sql: string, dbType: string) {
    const splittedRow = sql.split('\n');
    const headRow = splittedRow.shift();
    if (!headRow) {
        throw Error('Create Table文がありません。');
    }
    const tableName = getTableName(headRow, dbType);
    splittedRow.pop();
    // 先頭だけ余分な空白が入っている
    splittedRow[0] = splittedRow[0].replace(/^ +/g, '');

    return {
        tableName,
        splittedRow
    };
}

function getColumnName(row: string) {
    let columnName = row.split(' ')[0];
    if (columnName) {
        columnName = columnName.replace(/`/g, '');
        columnName = columnName.replace(/'/g, '');
        columnName = columnName.replace(/"/g, '');
    }

    return columnName;
}

function splitTable(sql: string, dbType: string) {
    let regex;
    if (dbType === 'MySQL') {
        regex = /create table `.*` \([\s\S]*?\) .*;/g;
    } else if ('PostgreSQL') {
        regex = /create table .* \([\s\S]*?\) .*;/g;
    }

    if (!regex) {
        throw Error('dbの種類が不正です。');
    }

    const splitedSql = sql.match(regex);
    return splitedSql;
}

function removeInFolder(outputDir: string) {
    const files = fs.readdirSync(outputDir);
    files.forEach(function (file) {
        fs.unlink(`${outputDir}/${file}`, function (err) {
            if (err) {
                throw err;
            }
        });
    });
}

async function writeFile(
    tableDatas: {
        tableName: string;
        columnInfo: [string, string][];
    }[],
    outputDir: string,
) {
    const results = [];

    for (const tableData of tableDatas) {
        let fileContents = `export interface ${toCamelcase(tableData.tableName, true)} {\n`;
        tableData.columnInfo.forEach((column) => {
            fileContents += `	${toCamelcase(column[0])}: ${column[1]};\n`;
        });
        fileContents += '}';

        results.push(
            fs.writeFileSync(`${outputDir}/${toCamelcase(tableData.tableName)}.ts`, fileContents)
        );
    }
    await Promise.all(results);
}

async function main() {
    const commandArgs = readCommand();
    
    removeInFolder(commandArgs.outputDir);
    const tableDatas = splitSql(readFile(commandArgs.sqlFilePath), commandArgs.dbType);

    await writeFile(tableDatas, commandArgs.outputDir);
    console.log('finished!!');
}

main();
