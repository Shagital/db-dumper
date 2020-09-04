const GzipCompressor = require('./Compressors/GzipCompressor');
const CannotSetParameter = require('./Exceptions/CannotSetParameter');
const DumpFailed = require('./Exceptions/DumpFailed');
const fs = require('fs');
const os = require('os');
const path = require('path');

class DbDumper {
    constructor() {
        /** @var string */
        this.dbName = null;

        /** @var string */
        this.userName = null;

        /** @var string */
        this.password = null;

        /** @var string */
        this.host = 'localhost';

        /** @var int */
        this.port = 5432;

        /** @var string */
        this.socket = '';

        /** @var int */
        this.timeout = 0;

        /** @var string */
        this.dumpBinaryPath = '';

        /** @var array */
        this.includeTables = [];

        /** @var array */
        this.excludeTables = [];

        /** @var array */
        this.extraOptions = [];

        /** @var array */
        this.extraOptionsAfterDbName = [];

        /** @var object */
        this.compressor = null;

        this.tempFilePath = null;
    }

    static create() {
        return new this();
    };

    getDbName() {
        return this.dbName;
    };

    /**
     *
     * @return this
     * @param dbName
     */
    setDbName (dbName) {
        this.dbName = dbName;

        return this;
    };

    /**
     *
     * @return this
     * @param userName
     */
    setUserName (userName) {
        this.userName = userName;

        return this;
    }

    /**
     *
     * @return this
     * @param password
     */
    setPassword (password) {
        this.password = password;

        return this;
    }

    /**
     *
     * @return this
     * @param host
     */
    setHost (host) {
        this.host = host;

        return this;
    }

    getHost () {
        return this.host;
    }

    /**
     * @param port
     *
     * @return this
     */
    setPort (port) {
        this.port = port;

        return this;
    }

    /**
     * @param socket
     *
     * @return this
     */
    setSocket (socket) {
        this.socket = socket;

        return this;
    }

    /**
     *
     * @return this
     * @param timeout
     */
    setTimeout (timeout) {
        this.timeout = timeout;

        return this;
    }

    setDumpBinaryPath (dumpBinaryPath) {
        if (dumpBinaryPath !== '' && dumpBinaryPath.substr(-1) !== '/') {
            dumpBinaryPath += '/';
        }

        this.dumpBinaryPath = dumpBinaryPath;

        return this;
    }

    /**
     * @deprecated
     *
     * @return this
     */
    enableCompression () {
        this.compressor = new GzipCompressor();

        return this;
    }

    getCompressorExtension() {
        return this.compressor.useExtension();
    }

    useCompressor (compressor) {
        this.compressor = compressor;

        return this;
    }

    /**
     *
     * @return this
     *
     * @param includeTables
     */
    setIncludedTables (includeTables) {
        if (this.excludeTables.length) {
            throw CannotSetParameter.conflictingParameters('includeTables', 'excludeTables');
        }

        if (!Array.isArray(includeTables)) {
            includeTables = includeTables.split(',');
        }

        this.includeTables = includeTables;

        return this;
    }

    /**
     *
     * @return this
     *
     * @param excludeTables
     */
    setExcludedTables (excludeTables) {
        if (this.includeTables.length) {
            throw CannotSetParameter.conflictingParameters('excludeTables', 'includeTables');
        }

        if (!Array.isArray(excludeTables)) {
            excludeTables = excludeTables.split(',');
        }

        this.excludeTables = excludeTables;

        return this;
    }

    fwrite(file, content) {
        const log = fs.createWriteStream(file, {flags: 'a'});
        log.write(content);
        log.end();
    }

    tempFile(fileName) {
        let fullPath = path.join(os.tmpdir(), fileName);
        fs.writeFile(fullPath, '', function (err) {
            if (err) {
                throw err;
            }
        });
        return fullPath;
    }

    /**
     *
     * @return this
     * @param extraOption
     */
    addExtraOption (extraOption) {
        if (extraOption.length) {
            this.extraOptions.push(extraOption);
        }

        return this;
    }

    /**
     *
     * @return this
     * @param extraOptionAfterDbName
     */
    addExtraOptionAfterDbName (extraOptionAfterDbName) {
        if (extraOptionAfterDbName.length) {
            this.extraOptionsAfterDbName.push(extraOptionAfterDbName);
        }

        return this;
    }

    dumpToFile (dumpFile) {
    };

    async checkIfDumpWasSuccessFul (error, outputFile) {
        if (error) {
            throw DumpFailed.processDidNotEndSuccessfully(error);
        }

        if (!fs.existsSync(outputFile)) {
            throw DumpFailed.dumpfileWasNotCreated();
        }

        if (await this.filesize(outputFile) === 0) {
            throw DumpFailed.dumpfileWasEmpty();
        }

        try {
            fs.unlinkSync(this.tempFilePath)
        } catch (e) {
            //ignore
        }
    }

    filesize (filename) {
        var stats = fs.statSync(filename)
        return stats["size"]
    }

    getCompressCommand (command, dumpFile) {
        let compressCommand = this.compressor.useCommand();

        if (this.isWindows()) {
            return `${command} | ${compressCommand} > ${dumpFile}`;
        }

        return `((((${command}; echo $\? >&3) | ${compressCommand} > ${dumpFile}) 3>&1) | (read x; exit \$x))`;
    }

    echoToFile (command, dumpFile) {
        dumpFile = '"' + this.addcslashes(dumpFile, '\\"') + '"';

        if (this.compressor) {
            return this.getCompressCommand(command, dumpFile);
        }

        return command + ' > ' + dumpFile;
    }

    addcslashes (string) {
        return string.replace(/\\/g, '\\\\')
            .replace(/\u0008/g, '\\b')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\f/g, '\\f')
            .replace(/\r/g, '\\r')
            .replace(/'/g, '\\\'')
            .replace(/"/g, '\\"');
    }

    determineQuote() {
        return this.isWindows() ? '"' : "'";
    }

    isWindows () {
        return process.platform === "win32";
    }
}

module.exports = DbDumper;
