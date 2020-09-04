const DbDumper = require('../DbDumper');
const CannotStartDump = require('../Exceptions/CannotStartDump');
const Crypto = require('crypto');
const exec = require('child_process').exec;


class MySql extends DbDumper {
    constructor() {
        super();
        /** @var bool */
        this.skipComments = true;

        /** @var bool */
        this.useExtendedInserts = true;

        /** @var bool */
        this.useSingleTransaction = false;

        /** @var bool */
        this.skipLockTables = false;

        /** @var bool */
        this.useQuick = false;

        /** @var string */
        this.defaultCharacterSet = '';

        /** @var bool */
        this.dbNameWasSetAsExtraOption = false;

        /** @var bool */
        this.allDatabasesWasSetAsExtraOption = false;

        /** @var string */
        this.setGtidPurged = 'AUTO';

        /** @var bool */
        this.createTables = true;

        this.port = 3306;
    }

    /**
     * @return this
     */
    skipComments() {
        this.skipComments = true;

        return this;
    }

    /**
     * @return this
     */
    dontSkipComments() {
        this.skipComments = false;

        return this;
    }

    /**
     * @return this
     */
    useExtendedInserts() {
        this.useExtendedInserts = true;

        return this;
    }

    /**
     * @return this
     */
    dontUseExtendedInserts() {
        this.useExtendedInserts = false;

        return this;
    }

    /**
     * @return this
     */
    setUseSingleTransaction() {
        this.useSingleTransaction = true;

        return this;
    }

    /**
     * @return this
     */
    dontUseSingleTransaction() {
        this.useSingleTransaction = false;

        return this;
    }

    /**
     * @return this
     */
    setSkipLockTables() {
        this.skipLockTables = true;

        return this;
    }

    /**
     * @return this
     */
    dontSkipLockTables() {
        this.skipLockTables = false;

        return this;
    }

    /**
     * @return this
     */
    setUseQuick() {
        this.useQuick = true;

        return this;
    }

    /**
     * @return this
     */
    dontUseQuick() {
        this.useQuick = false;

        return this;
    }

    /**
     *
     * @return this
     * @param characterSet
     */
    setDefaultCharacterSet(characterSet) {
        this.defaultCharacterSet = characterSet;

        return this;
    }

    /**
     * @return this
     */
    setGPurged(setGtidPurged) {
        this.setGtidPurged = setGtidPurged;

        return this;
    }

    /**
     * Dump the contents of the database to the given file.
     *
     *
     * @param dumpFile
     */
    dumpToFile(dumpFile) {
        this.guardAgainstIncompleteCredentials();

        let temporaryCredentialsFile = `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.txt`;
        let tempFileHandle = this.tempFile(temporaryCredentialsFile);
        this.tempFilePath = tempFileHandle;
        this.fwrite(tempFileHandle, this.getContentsOfCredentialsFile())

        let command = this.getDumpCommand(dumpFile, this.tempFilePath);

        let vm = this;
         exec(command, async function (err, std, stde) {
            await vm.checkIfDumpWasSuccessFul(err, dumpFile);
        });

    }

    addExtraOption(extraOption) {
        if (extraOption.includes('--all-databases')) {
            this.dbNameWasSetAsExtraOption = true;
            this.allDatabasesWasSetAsExtraOption = true;
        }

        let matches = extraOption.match(/^--databases (\S+)/);
        if (matches && matches.length) {
            this.setDbName(matches[1]);
            this.dbNameWasSetAsExtraOption = true;
        }

        return super.addExtraOption(extraOption);
    }

    /**
     * @return this
     */
    doNotCreateTables() {
        this.createTables = false;

        return this;
    }

    /**
     * Get the command that should be performed to dump the database.
     *
     * @param dumpFile
     * @param temporaryCredentialsFile
     *
     * @return string
     */
    getDumpCommand(dumpFile, temporaryCredentialsFile) {
        let quote = this.determineQuote();

        let command = [
            `${quote}${this.dumpBinaryPath}mysqldump${quote}`,
            `--defaults-extra-file=\"${temporaryCredentialsFile}\"`,
        ];

        if (!this.createTables) {
            command.push('--no-create-info');
        }

        if (this.skipComments) {
            command.push('--skip-comments');
        }

        command.push(this.useExtendedInserts ? '--extended-insert' : '--skip-extended-insert');

        if (this.useSingleTransaction) {
            command.push('--single-transaction');
        }

        if (this.skipLockTables) {
            command.push('--skip-lock-tables');
        }

        if (this.useQuick) {
            command.push('--quick');
        }

        if (this.socket !== '') {
            command.push(`--socket=${this.socket}`);
        }

        for (let tableName of this.excludeTables) {
            command.push(`--ignore-table=${this.dbName}.${tableName.trim()}`);
        }

        if (this.defaultCharacterSet.length) {
            command.push('--default-character-set=' + this.defaultCharacterSet);
        }

        for (let extraOption of this.extraOptions) {
            command.push(extraOption);
        }

        if (this.setGtidPurged !== 'AUTO') {
            command.push('--set-gtid-purged=' + this.setGtidPurged);
        }

        if (!this.dbNameWasSetAsExtraOption) {
            command.push(this.dbName);
        }

        if (this.includeTables.length) {
            let includeTables = this.includeTables.join(' ');
            command.push(`--tables ${includeTables}`);
        }

        for (let extraOptionAfterDbName of this.extraOptionsAfterDbName) {
            command.push(extraOptionAfterDbName);
        }

        return this.echoToFile(command.join(' '), dumpFile);
    }

    getContentsOfCredentialsFile() {
        let contents = [
            `[client]`,
            `user = '${this.userName}'`,
            `password = '${this.password}'`,
            `host = '${this.host}'`,
            `port = '${this.port}'`,
        ];

        return contents.join('\n');
    }

    guardAgainstIncompleteCredentials() {
        for (let requiredProperty of ['userName', 'host']) {
            if (this[requiredProperty] === null || this[requiredProperty].length === 0) {
                throw CannotStartDump.emptyParameter(requiredProperty);
            }
        }

        if ((!this.dbName || this.dbName.length === 0) && !this.allDatabasesWasSetAsExtraOption) {
            throw CannotStartDump.emptyParameter('dbName');
        }
    }
}

module.exports = MySql;
