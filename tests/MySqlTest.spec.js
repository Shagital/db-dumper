const MySql = require('../src/Databases/MySql');
const CannotStartDump = require('../src/Exceptions/CannotStartDump');
const GzipCompressor = require('../src/Compressors/GzipCompressor');

test('it_provides_a_factory_method', () => {
    expect(MySql.create() instanceof MySql).toBe(true);
});

test('it_will_throw_an_exception_when_no_credentials_are_set', () => {
    try{
        MySql.create().dumpToFile('test.sql');
    } catch(e) {
        expect(CannotStartDump.emptyParameter('userName')).toBe(e.toString());
    };
});

test('it_can_generate_a_dump_command', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname > "dump.sql"' );
});

test('it_can_generate_a_dump_command_with_compression_enabled', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .enableCompression()
        .getDumpCommand('dump.sql', 'credentials.txt');

    let expected = '((((\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname; echo $? >&3) | gzip > "dump.sql") 3>&1) | (read x; exit $x))';

    expect(dumpCommand).toBe(expected);
});

test('it_can_generate_a_dump_command_with_gzip_compressor_enabled', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .useCompressor(new GzipCompressor)
        .getDumpCommand('dump.sql', 'credentials.txt');

    let expected = '((((\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname; echo $? >&3) | gzip > "dump.sql") 3>&1) | (read x; exit $x))';

    expect(dumpCommand).toBe(expected);
});

test('it_can_generate_a_dump_command_with_absolute_path_having_space_and_brackets', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .getDumpCommand('/save/to/new (directory)/dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname > "/save/to/new (directory)/dump.sql"');
});

test('it_can_generate_a_dump_command_without_using_comments', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .dontSkipComments()
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --extended-insert dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_without_using_extended_inserts', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .dontUseExtendedInserts()
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --skip-extended-insert dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_custom_binary_path', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setDumpBinaryPath('/custom/directory')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'/custom/directory/mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_without_using_extending_inserts', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.dontUseExtendedInserts()
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --skip-extended-insert dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_using_single_transaction', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setUseSingleTransaction()
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --single-transaction dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_using_skip_lock_tables', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setSkipLockTables()
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --skip-lock-tables dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_using_quick', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setUseQuick()
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --quick dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_a_custom_socket', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setSocket(1234)
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --socket=1234 dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_for_specific_tables_as_array', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setIncludedTables(['tb1', 'tb2', 'tb3'])
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname --tables tb1 tb2 tb3 > "dump.sql"');
});

test('it_can_generate_a_dump_command_for_specific_tables_as_string', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setIncludedTables('tb1,tb2,tb3')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert dbname --tables tb1 tb2 tb3 > "dump.sql"');
})

test('it_will_throw_an_exception_when_setting_exclude_tables_after_setting_tables', () =>
{
   try {
       MySql.create()
           .setDbName('dbname')
           .setUserName('username')
           .setPassword('password')
           .setIncludedTables('tb1,tb2,tb3')
           .setExcludedTables('tb4,tb5,tb6');
   }
   catch (e) {

   }
});

test('it_can_generate_a_dump_command_excluding_tables_as_array', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setExcludedTables(['tb1', 'tb2', 'tb3'])
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --ignore-table=dbname.tb1 --ignore-table=dbname.tb2 --ignore-table=dbname.tb3 dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_excluding_tables_as_string', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setExcludedTables('tb1,tb2,tb3')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --ignore-table=dbname.tb1 --ignore-table=dbname.tb2 --ignore-table=dbname.tb3 dbname > "dump.sql"');
});

test('it_will_throw_an_exception_when_setting_tables_after_setting_exclude_tables', () =>
{
    try {
        MySql.create()
            .setDbName('dbname')
            .setUserName('username')
            .setPassword('password')
            .setExcludedTables('tb1,tb2,tb3')
            .setIncludedTables('tb4,tb5,tb6');
    } catch (e) {

    }
});

test('it_can_generate_the_contents_of_a_credentials_file', () =>
{
    let credentialsFileContent = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.setHost('hostname')
.setSocket(1234)
.getContentsOfCredentialsFile();

    expect(credentialsFileContent)
        .toBe("[client]\nuser = 'username'\npassword = 'password'\nhost = 'hostname'\nport = '3306'");
});

test('it_can_get_the_name_of_the_db', () =>
{
    let dbName = 'testName';

    let dbDumper = MySql.create().setDbName(dbName);

    expect(dbDumper.getDbName()).toBe(dbName);
});

test('it_can_add_extra_options', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.addExtraOption('--extra-option')
.addExtraOption('--another-extra-option="value"')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --extra-option --another-extra-option="value" dbname > "dump.sql"');
});

/** @test */
test('it_can_add_extra_options_after_db_name', () =>
{
    let dumpCommand = MySql.create()
.setDbName('dbname')
.setUserName('username')
.setPassword('password')
.addExtraOption('--extra-option')
.addExtraOptionAfterDbName('--another-extra-option="value"')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --extra-option dbname --another-extra-option="value" > "dump.sql"');
});

test('it_can_get_the_host', () =>
{
    let dumper = MySql.create().setHost('myHost');

    expect(dumper.getHost()).toBe('myHost');
});


test('it_can_set_db_name_as_an_extra_options', () =>
{
    let dumpCommand = MySql.create()
.setUserName('username')
.setPassword('password')
.addExtraOption('--extra-option')
.addExtraOption('--another-extra-option="value"')
.addExtraOption('--databases dbname')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --extra-option --another-extra-option="value" --databases dbname > "dump.sql"');
});


test('it_can_get_the_name_of_the_db_when_dbname_was_set_as_an_extra_option', () =>
{
    let dbName = 'testName';

    let dbDumper = MySql.create().addExtraOption(`--databases ${dbName}`);

    expect(dbDumper.getDbName()).toBe(dbName);
});


test('it_can_get_the_name_of_the_db_when_dbname_was_overriden_as_an_extra_option', () =>
{
    let dbName = 'testName';
    let overridenDbName = 'otherName';

    let dbDumper = MySql.create().setDbName(dbName).addExtraOption(`--databases ${overridenDbName}`);

    expect(dbDumper.getDbName()).toBe(overridenDbName);
});

test('it_can_get_the_name_of_the_db_when_all_databases_was_set_as_an_extra_option', () =>
{
    let dumpCommand = MySql.create()
.setUserName('username')
.setPassword('password')
.addExtraOption('--all-databases')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --all-databases > "dump.sql"');
});


test('it_can_generate_a_dump_command_excluding_tables_as_array_when_dbname_was_set_as_an_extra_option', () =>
{
    let dumpCommand = MySql.create()
.setUserName('username')
.setPassword('password')
.addExtraOption('--databases dbname')
.setExcludedTables(['tb1', 'tb2', 'tb3'])
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --ignore-table=dbname.tb1 --ignore-table=dbname.tb2 --ignore-table=dbname.tb3 --databases dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_excluding_tables_as_string_when_dbname_was_set_as_an_extra_option', () =>
{
    let dumpCommand = MySql.create()
.setUserName('username')
.setPassword('password')
.addExtraOption('--databases dbname')
.setExcludedTables('tb1,tb2,tb3')
.getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand)
        .toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --ignore-table=dbname.tb1 --ignore-table=dbname.tb2 --ignore-table=dbname.tb3 --databases dbname > "dump.sql"');
});

/** @test */
test('it_can_generate_a_dump_command_with_set_gtid_purged', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .setGPurged('OFF')
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --skip-comments --extended-insert --set-gtid-purged=OFF dbname > "dump.sql"');
});

test('it_can_generate_a_dump_command_with_no_create_info', () =>
{
    let dumpCommand = MySql.create()
        .setDbName('dbname')
        .setUserName('username')
        .setPassword('password')
        .doNotCreateTables()
        .getDumpCommand('dump.sql', 'credentials.txt');

    expect(dumpCommand).toBe('\'mysqldump\' --defaults-extra-file="credentials.txt" --no-create-info --skip-comments --extended-insert dbname > "dump.sql"');
});
