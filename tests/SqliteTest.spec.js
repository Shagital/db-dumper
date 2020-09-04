const Sqlite = require('../src/Databases/Sqlite');
const GzipCompressor = require('../src/Compressors/GzipCompressor');
const fs = require('fs');

test('it_provides_a_factory_method', () =>
{
    expect(Sqlite.create() instanceof Sqlite).toBe(true);
});

test('function it_can_generate_a_dump_command', () =>
{
    let dumpCommand = Sqlite.create()
        .setDbName('dbname.sqlite')
        .getDumpCommand('dump.sql');

    let expected = "echo 'BEGIN IMMEDIATE;\n.dump' | 'sqlite3' --bail 'dbname.sqlite' > \"dump.sql\"";

    expect(expected).toBe(dumpCommand);
})

test('it_can_generate_a_dump_command_with_compression_enabled', () =>
{
    let dumpCommand = Sqlite.create()
        .setDbName('dbname.sqlite')
        .enableCompression()
        .getDumpCommand('dump.sql');

    let expected = '((((echo \'BEGIN IMMEDIATE;\n.dump\' | \'sqlite3\' --bail \'dbname.sqlite\'; echo $? >&3) | gzip > "dump.sql") 3>&1) | (read x; exit $x))';

    expect(expected).toBe(dumpCommand);

})

test('it_can_generate_a_dump_command_with_gzip_compressor_enabled', () =>
{
    let dumpCommand = Sqlite.create()
        .setDbName('dbname.sqlite')
        .useCompressor(new GzipCompressor)
        .getDumpCommand('dump.sql');

    let expected = '((((echo \'BEGIN IMMEDIATE;\n.dump\' | \'sqlite3\' --bail \'dbname.sqlite\'; echo $? >&3) | gzip > "dump.sql") 3>&1) | (read x; exit $x))';

    expect(expected).toBe(dumpCommand);
})

test('it_can_generate_a_dump_command_with_absolute_paths', () =>
{
    let dumpCommand = Sqlite.create()
        .setDbName('/path/to/dbname.sqlite')
        .setDumpBinaryPath('/usr/bin')
        .getDumpCommand('/save/to/dump.sql');

    let expected = "echo 'BEGIN IMMEDIATE;\n.dump' | '/usr/bin/sqlite3' --bail '/path/to/dbname.sqlite' > \"/save/to/dump.sql\"";

    expect(expected).toBe(dumpCommand);
})

test('it_can_generate_a_dump_command_with_absolute_paths_having_space_and_brackets', () =>
{
    let dumpCommand = Sqlite.create()
        .setDbName('/path/to/dbname.sqlite')
        .setDumpBinaryPath('/usr/bin')
        .getDumpCommand('/save/to/new (directory)/dump.sql');

    let expected = "echo 'BEGIN IMMEDIATE;\n.dump' | '/usr/bin/sqlite3' --bail '/path/to/dbname.sqlite' > \"/save/to/new (directory)/dump.sql\"";

    expect(expected).toBe(dumpCommand);
});

const fileExists = (file) => {
    return new Promise((resolve, reject) => {
        fs.access(file, fs.constants.F_OK, (err) => {
            err ? reject(false) : resolve(true)
        });
    })
};
const filesize = (filename) => {
    var stats = fs.statSync(filename)
    return stats["size"]
};

test('it_successfully_creates_a_backup', async () =>
{
    let dbPath = __dirname+'/stubs/database.sqlite';
    let dbBackupPath = __dirname+'/temp/backup.sql';

    Sqlite.create()
        .setDbName(dbPath)
        .useCompressor(new GzipCompressor)
        .dumpToFile(dbBackupPath);

    // TODO: Figure out a more efficient way to determine when backup file is ready
    setTimeout(async () => {
        let fileSize = await filesize(dbBackupPath);
        let fileExist = await fileExists(dbBackupPath);

        expect(fileExist).toBe(true);
        expect(fileSize).not.toBe(0);
    }, 3000);


});
