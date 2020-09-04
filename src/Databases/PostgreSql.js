const DbDumper = require('../DbDumper');
const CannotStartDump = require('../Exceptions/CannotStartDump');
const Crypto = require('crypto');
const exec = require('child_process').exec;

class PostgreSql extends DbDumper {
    constructor() {
        super();
        /** @var bool */
        this.useInserts = false;

        /** @var bool */
        this.createTables = true;

        this.port = 5432;
    }

    /**
     * @return $this
     */
    setUseInserts() {
        this.useInserts = true;

        return this;
    }

    /**
     * Dump the contents of the database to the given file.
     *
     *
     * @param dumpFile
     */
    async dumpToFile(dumpFile) {
        this.guardAgainstIncompleteCredentials();

        let command = this.getDumpCommand(dumpFile);

        let temporaryCredentialsFile = `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}`;
        let tempFileHandle = this.tempFile(temporaryCredentialsFile);
        this.fwrite(tempFileHandle, this.getContentsOfCredentialsFile())

        // TODO:Use env variables
        let envVars = this.getEnvironmentVariablesForDumpCommand(temporaryCredentialsFile);

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
        let quote = this.determineQuote();

        let command = [
            `export PGPASSWORD='${this.password}';`,
            `${quote}${this.dumpBinaryPath}pg_dump${quote}`,
            `-U ${this.userName}`,
            '-h ' + (this.socket === '' ? this.host : this.socket),
            `-p ${this.port}`,
        ];

        if (this.useInserts) {
            command.push('--inserts');
        }

        if (!this.createTables) {
            command.push('--data-only');
        }

        for (let extraOption of this.extraOptions) {
            command.push(extraOption);
        }

        if (this.includeTables.length) {
            command.push('-t ' + this.includeTables.map(s => s.trim()).join(' -t '));
        }

        if (this.excludeTables.length) {
            command.push('-T ' + this.excludeTables.map(s => s.trim()).join(' -T '));
        }

        return this.echoToFile(command.join(' '), dumpFile);
    }

    getContentsOfCredentialsFile() {
        let contents = [
            this.host,
            this.port,
            this.dbName,
            this.userName,
            this.password,
        ];

        return contents.join(':');
    }

    guardAgainstIncompleteCredentials() {
        for (let requiredProperty of ['userName', 'dbName', 'host']) {
            if (!this[requiredProperty] || !this[requiredProperty].length) {
                throw CannotStartDump.emptyParameter(requiredProperty);
            }
        }
    }

    getEnvironmentVariablesForDumpCommand(temporaryCredentialsFile) {
        return {
            'PGPASSFILE': temporaryCredentialsFile,
            'PGDATABASE': this.dbName,
        };
    }

    /**
     * @return $this
     */
    doNotCreateTables() {
        this.createTables = false;

        return this;
    }
}

module.exports = PostgreSql;
