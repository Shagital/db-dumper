const PgSql = require('../src/Databases/PostgreSql');
const CannotStartDump = require('../src/Exceptions/CannotStartDump');
const CannotSetParameter = require('../src/Exceptions/CannotSetParameter');
const GzipCompressor = require('../src/Compressors/GzipCompressor');


test('it_provides_a_factory_method', () =>
{
    expect(PgSql.create() instanceof PgSql).toBe(true);
});

test('it_will_throw_an_exception_when_no_credentials_are_set', () =>
{
    PgSql.create().dumpToFile('test.sql').catch((e) => {
        expect(CannotStartDump.emptyParameter('userName')).toBe(e.toString());
    });
});

test('function it_can_generate_a_dump_command', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_compression_enabled', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .enableCompression()
        .getDumpCommand('dump.sql');

    let expected = '((((export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432; echo $? >&3) | gzip > "dump.sql") 3>&1) | (read x; exit $x))';

    expect(dumpCommand).toBe(expected);
});

test('it_can_generate_a_dump_command_with_gzip_compressor_enabled', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .useCompressor(new GzipCompressor)
        .getDumpCommand('dump.sql');

    let expected = '((((export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432; echo $? >&3) | gzip > "dump.sql") 3>&1) | (read x; exit $x))';

    expect(dumpCommand).toBe(expected);
});

test('it_can_generate_a_dump_command_with_absolute_path_having_space_and_brackets', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .getDumpCommand('/save/to/new (directory)/dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 > "/save/to/new (directory)/dump.sql"');
});

test('it_can_generate_a_dump_command_with_using_inserts', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setUseInserts()
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 --inserts > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_a_custom_port', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setPort(1234)
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 1234 > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_custom_binary_path', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setDumpBinaryPath('/custom/directory')
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'/custom/directory/pg_dump\' -U username -h localhost -p 5432 > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_a_custom_socket', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setSocket('/var/socket.1234')
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h /var/socket.1234 -p 5432 > "dump.sql"');
});

test('it_can_generate_a_dump_command_for_specific_tables_as_array', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setIncludedTables(['tb1', 'tb2', 'tb3'])
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 -t tb1 -t tb2 -t tb3 > "dump.sql"');
});

test('it_can_generate_a_dump_command_for_specific_tables_as_string', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setIncludedTables('tb1, tb2, tb3')
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 -t tb1 -t tb2 -t tb3 > "dump.sql"');
});

test('it_will_throw_an_exception_when_setting_exclude_tables_after_setting_tables', () =>
{

    try {
        PgSql.create()
            .setDbName('dbname')
            .setUserName('username')
            .setPassword('password')
            .setIncludedTables('tb1, tb2, tb3')
            .setExcludedTables('tb4, tb5, tb6');
    } catch (e) {
        expect(e).toBe(CannotSetParameter.conflictingParameters('excludeTables', 'includeTables'))
    }
});

 test('it_can_generate_a_dump_command_excluding_tables_as_array', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setExcludedTables(['tb1', 'tb2', 'tb3'])
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 -T tb1 -T tb2 -T tb3 > "dump.sql"');
});

test('it_can_generate_a_dump_command_excluding_tables_as_string', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setExcludedTables('tb1, tb2, tb3')
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 -T tb1 -T tb2 -T tb3 > "dump.sql"');
});

test('it_will_throw_an_exception_when_setting_tables_after_setting_exclude_tables', () =>
{
    try {
        PgSql.create()
            .setDbName('dbname')
            . setUserName('username')
            . setPassword('password')
            .setExcludedTables('tb1, tb2, tb3')
            .setIncludedTables('tb4, tb5, tb6');
    } catch (e) {
        expect(e).toBe(CannotSetParameter.conflictingParameters('includeTables', 'excludeTables'))
    }
});

test('it_can_generate_the_contents_of_a_credentials_file', () =>
{
    let credentialsFileContent = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setHost('hostname')
        .setPort(5432)
        .getContentsOfCredentialsFile();

    expect(credentialsFileContent).toBe('hostname:5432:dbname:username:password');
});

test('it_can_get_the_name_of_the_db', () =>
{
    let dbName = 'testName';

    let dbDumper = PgSql.create().setDbName(dbName);

    expect(dbDumper.getDbName()).toBe(dbName);
});

test('it_can_add_an_extra_option', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .addExtraOption('-something-else')
        .getDumpCommand('dump.sql');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 -something-else > "dump.sql"');
});

test('it_can_get_the_host', () =>
{
    let dumper = PgSql.create().setHost('myHost');

    expect(dumper.getHost()).toBe('myHost');
});

test('it_can_generate_a_dump_command_with_no_create_info', () =>
{
    let dumpCommand = PgSql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .doNotCreateTables()
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('export PGPASSWORD=\'password\'; \'pg_dump\' -U username -h localhost -p 5432 --data-only > "dump.sql"');
});
