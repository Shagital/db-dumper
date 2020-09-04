const MongoDb = require('../src/Databases/MongoDb');
const CannotStartDump = require('../src/Exceptions/CannotStartDump');
const GzipCompressor = require('../src/Compressors/GzipCompressor');


test('it_provides_a_factory_method', () =>
{
    expect(MongoDb.create() instanceof MongoDb).toBe(true)
});

test('it_will_throw_an_exception_when_no_credentials_are_set',  () =>
{
    try{
        MongoDb.create().dumpToFile('test.gz');
    } catch(e) {
        expect(CannotStartDump.emptyParameter('dbName')).toBe(e.toString());
    }
});

test('it_can_generate_a_dump_command', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .getDumpCommand('dbname.gz');

    expect(dumpCommand).toBe('\'mongodump\' --db dbname --archive --host localhost --port 27017 > "dbname.gz"');
});

test('it_can_generate_a_dump_command_with_compression_enabled', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .enableCompression()
        .getDumpCommand('dbname.gz');

    let expected = '((((\'mongodump\' --db dbname --archive --host localhost --port 27017; echo $? >&3) | gzip > "dbname.gz") 3>&1) | (read x; exit $x))';

    expect(dumpCommand).toBe(expected);
});

test('it_can_generate_a_dump_command_with_gzip_compressor_enabled', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .useCompressor(new GzipCompressor)
        .getDumpCommand('dbname.gz');

    let expected = '((((\'mongodump\' --db dbname --archive --host localhost --port 27017; echo $? >&3) | gzip > "dbname.gz") 3>&1) | (read x; exit $x))';

    expect(dumpCommand).toBe(expected);
});

test('it_can_generate_a_dump_command_with_absolute_path_having_space_and_brackets', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .getDumpCommand('/save/to/new (directory)/dbname.gz');

    expect(dumpCommand).toBe('\'mongodump\' --db dbname --archive --host localhost --port 27017 > "/save/to/new (directory)/dbname.gz"');
});

test('it_can_generate_a_dump_command_with_username_and_password', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .getDumpCommand('dbname.gz');

    expect(dumpCommand).toBe('\'mongodump\' --db dbname --archive --username \'username\' --password \'password\' --host localhost --port 27017 > "dbname.gz"');
});

test('it_can_generate_a_command_with_custom_host_and_port', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .setHost('mongodb.test.com')
        .setPort(27018)
        .getDumpCommand('dbname.gz');

    expect(dumpCommand).toBe('\'mongodump\' --db dbname --archive --host mongodb.test.com --port 27018 > "dbname.gz"');
});

test('it_can_generate_a_backup_command_for_a_single_collection', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .setCollection('mycollection')
        .getDumpCommand('dbname.gz');

    expect(dumpCommand).toBe('\'mongodump\' --db dbname --archive --host localhost --port 27017 --collection mycollection > "dbname.gz"');
});

test('it_can_generate_a_dump_command_with_custom_binary_path', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .setDumpBinaryPath('/custom/directory')
        .getDumpCommand('dbname.gz');

    expect(dumpCommand).toBe('\'/custom/directory/mongodump\' --db dbname --archive --host localhost --port 27017 > "dbname.gz"');
});

test('it_can_generate_a_dump_command_with_authentication_database', () =>
{
    let dumpCommand = MongoDb.create()
        .setDbName('dbname')
        .setAuthenticationDatabase('admin')
        .getDumpCommand('dbname.gz');

    expect("'mongodump' --db dbname --archive --host localhost --port 27017 --authenticationDatabase admin > \"dbname.gz\"").toBe(dumpCommand);
});
