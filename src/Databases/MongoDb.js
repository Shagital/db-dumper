const DbDumper = require('../DbDumper');
const CannotStartDump = require('../Exceptions/CannotStartDump');
const exec = require('child_process').exec;

class MongoDb extends DbDumper {
    constructor() {
        super();
        this.port = 27017;

        /** @var null|string */
        this.collection = null;

        /** @var null|string */
        this.authenticationDatabase = null;
    }

    /**
     * Dump the contents of the database to the given file.
     *
     *
     * @param dumpFile
     */
    dumpToFile(dumpFile) {
        this.guardAgainstIncompleteCredentials();

        let command = this.getDumpCommand(dumpFile);

        let vm = this;
        exec(command, async function (err, std, stde) {
            await vm.checkIfDumpWasSuccessFul(err, dumpFile);
        });
    }

    /**
     * Verifies if the dbname and host options are set.
     *
     * @throws CannotStartDump
     * @return void
     */
    guardAgainstIncompleteCredentials() {
        for (let requiredProperty of ['dbName', 'host']) {
            if (!this[requiredProperty] || !this[requiredProperty].length) {
                throw CannotStartDump.emptyParameter(requiredProperty);
            }
        }
    }

    /**
     *
     * @return MongoDb
     * @param collection
     */
    setCollection(collection) {
        this.collection = collection;

        return this;
    }

    /**
     *
     * @return this
     * @param authenticationDatabase
     */
    setAuthenticationDatabase(authenticationDatabase) {
        this.authenticationDatabase = authenticationDatabase;

        return this;
    }

    /**
     * Generate the dump command for MongoDb.
     *
     *
     * @return string
     * @param filename
     */
    getDumpCommand(filename) {
        let quote = this.determineQuote();

        let command = [
            `${quote}${this.dumpBinaryPath}mongodump${quote}`,
            `--db ${this.dbName}`,
            '--archive',
        ];

        if (this.userName) {
            command.push(`--username '${this.userName}'`);
        }

        if (this.password) {
            command.push(`--password '${this.password}'`);
        }

        if (this.host) {
            command.push(`--host ${this.host}`);
        }

        if (this.port) {
            command.push(`--port ${this.port}`);
        }

        if (this.collection) {
            command.push(`--collection ${this.collection}`);
        }

        if (this.authenticationDatabase) {
            command.push(`--authenticationDatabase ${this.authenticationDatabase}`);
        }

        return this.echoToFile(command.join(' '), filename);
    }
}

module.exports = MongoDb;
