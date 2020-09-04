const DbDumper = require('../DbDumper');
const exec = require('child_process').exec;

class Sqlite extends DbDumper {
    constructor() {
        super();
    }
    /**
     * Dump the contents of the database to a given file.
     *
     *
     * @param dumpFile
     */
    dumpToFile(dumpFile) {
        let command = this.getDumpCommand(dumpFile);

        let vm = this;
        exec(command, async function (err, std, stde) {
            await vm.checkIfDumpWasSuccessFul(err, dumpFile);
        });
    }

    /**
     * Get the command that should be performed to dump the database.
     *
     *
     * @return string
     * @param dumpFile
     */
    getDumpCommand(dumpFile) {
        let dumpInSqlite = "echo 'BEGIN IMMEDIATE;\n.dump'";
        if (this.isWindows()) {
            dumpInSqlite = '(echo BEGIN IMMEDIATE; & echo .dump)';
        }
        let quote = this.determineQuote();

        let command = `${dumpInSqlite} | ${quote}${this.dumpBinaryPath}sqlite3${quote} --bail ${quote}${this.dbName}${quote}`;

        return this.echoToFile(command, dumpFile);
    }
}

module.exports = Sqlite;
