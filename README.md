# Dump the contents of a database
![npm](https://img.shields.io/npm/dt/@shagital/db-dumper?style=plastic)
![npm (scoped)](https://img.shields.io/npm/v/@shagital/db-dumper)
![NPM](https://img.shields.io/npm/l/@shagital/db-dumper)

This repo contains an easy to use class to dump a database using Nodejs. Currently MySQL, PostgreSQL, SQLite and MongoDB are supported. Behind
the scenes, `mysqldump`, `pg_dump`, `sqlite3` and `mongodump` are used.

Here are simple examples of how to create a database dump with different drivers:

**MySQL**

```js
const { MySql } = require('@shagital/db-dumper');
MySql.create()
.setDbName('dbName')
.setUserName('userName')
.setPassword('password')
.dumpToFile('./dump.sql');
```

**PostgreSQL**

```js
const { PostgreSql } = require('@shagital/db-dumper');
PostgreSql.create()
.setDbName('dbName')
.setUserName('userName')
.setPassword('password')
.dumpToFile('./dump.sql');
```

**SQLite**

```js
const { Sqlite } = require('@shagital/db-dumper');
Sqlite.create()
.setDbName('path_to_sqlite.sqlite')
.dumpToFile('dump.sql');
```

**MongoDB**

```js
const { MongoDb } = require('@shagital/db-dumper');
MongoDb.create()
.setDbName('dbName')
.setCollection('collectionName')
.dumpToFile('./dump.gz');
```

## Requirements
For dumping MySQL-db's `mysqldump` should be installed.

For dumping PostgreSQL-db's `pg_dump` should be installed.

For dumping SQLite-db's `sqlite3` should be installed.

For dumping MongoDB-db's `mongodump` should be installed.

## Installation

You can install the package via composer:
``` bash
npm install @shagital/db-dumper
```
Or with yarn
``` bash
yarn add @shagital/db-dumper
```

### Dump specific tables

Using an array:

```js
const { MySql } = require('@shagital/db-dumper');
MySql.create()
    .setDbName(databaseName)
    .setUserName(userName)
    .setPassword(password)
    .setIncludedTables(['table1', 'table2', 'table3'])
    .dumpToFile('dump.sql');
```
Using a string:

```js
const { MySql } = require('@shagital/db-dumper');
MySql.create()
    .setDbName(databaseName)
    .setUserName(userName)
    .setPassword(password)
    .setIncludedTables('table1,table2,table3')
    .dumpToFile('dump.sql');
```

### Excluding tables from the dump

Using an array:

```js
const { MySql } = require('@shagital/db-dumper');
MySql.create()
    .setDbName(databaseName)
    .setUserName(userName)
    .setPassword(password)
    .setExcludedTables(['table1', 'table2', 'table3'])
    .dumpToFile('dump.sql');
```
Using a string:

```js
const { MySql } = require('@shagital/db-dumper');
MySql.create()
    .setDbName(databaseName)
    .setUserName(userName)
    .setPassword(password)
    .setExcludedTables('table1','table2','table3')
    .dumpToFile('dump.sql');
```

### Do not write CREATE TABLE statements that create each dumped table.
```js
const { MySql } = require('@shagital/db-dumper');
let dumpCommand = MySql.create()
    .setDbName('dbname')
    .setUserName('username')
    .setPassword('password')
    .doNotCreateTables()
    .getDumpCommand('dump.sql', 'credentials.txt');
```

### Adding extra options
If you want to add an arbitrary option to the dump command you can use `addExtraOption`

```js
const { MySql } = require('@shagital/db-dumper');
let dumpCommand = MySql.create()
    .setDbName('dbname')
    .setUserName('username')
    .setPassword('password')
    .addExtraOption('--xml')
    .getDumpCommand('dump.sql', 'credentials.txt');
```

If you're working with MySql you can set the database name using `--databases` as an extra option. This is particularly useful when used in conjunction with the `--add-drop-database` `mysqldump` option (see the [mysqldump docs](https://dev.mysql.com/doc/refman/5.7/en/mysqldump.html#option_mysqldump_add-drop-database)).

```js
const { MySql } = require('@shagital/db-dumper');
let dumpCommand = MySql.create()
    .setUserName('username')
    .setPassword('password')
    .addExtraOption('--databases dbname')
    .addExtraOption('--add-drop-database')
    .getDumpCommand('dump.sql', 'credentials.txt');
```

With MySql, you also have the option to use the `--all-databases` extra option. This is useful when you want to run a full backup of all the databases in the specified MySQL connection.

```js
const { MySql } = require('@shagital/db-dumper');
let dumpCommand = MySql.create()
    .setUserName('username')
    .setPassword('password')
    .addExtraOption('--all-databases')
    .getDumpCommand('dump.sql', 'credentials.txt');
```

Please note that using the `.addExtraOption('--databases dbname')` or `.addExtraOption('--all-databases')` will override the database name set on a previous `.setDbName()` call.

### Using compression
If you want to compress the outputted file, you can use one of the compressors and the resulted dump file will be compressed.

There is one compressor that comes out of the box: `GzipCompressor`. It will compress your db dump with `gzip`. Make sure `gzip` is installed on your system before using this.

```js
const { MySql, GzipCompressor } = require('@shagital/db-dumper');

let dumpCommand = MySql.create()
    .setDbName('dbname')
    .setUserName('username')
    .setPassword('password')
    .useCompressor(new GzipCompressor())
    .dumpToFile('dump.sql.gz');
```

### Creating your own compressor

You can create you own compressor implementing the `Compressor` class. Here's how that class looks like:

```js

class Compressor
{
    useCommand() {};

    useExtension() {};
}
```

The `useCommand` should simply return the compression command the db dump will get pumped to. Here's the implementation of `GzipCompression`.

```js
const { Compressor } = require('@shagital/db-dumper');

class GzipCompressor extends Compressor
{
    useCommand()
    {
        return 'gzip';
    }

    useExtension()
    {
        return 'gz';
    }
}
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Testing

``` bash
npm run test

// or with yarn
yarn test
```

## Contributing

If you have a feature you'd like to add, kindly send a Pull Request (PR)

## Security

If you discover any security related issues, please email [zacchaeus@shagital.com](mailto:zacchaeus@shagital.com) instead of using the issue tracker.

## Credits
This Nodejs was heavily influenced by [Spatie `db-dumper` PHP package](https://github.com/spatie/db-dumper)
- [Zacchaeus Bolaji](https://github.com/djunehor)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
