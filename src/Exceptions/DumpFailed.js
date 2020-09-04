function DumpFailed() {
    /**
     *
     * @return string
     * @param error
     */
    this.processDidNotEndSuccessfully = (error) => {
        return `The dump process failed with exitcode ${error.code} : ${error.toString()}`;
    }

    /**
     * @return string
     */
    this.dumpfileWasNotCreated = () => {
        return 'The dumpfile could not be created';
    }

    /**
     */
    this.dumpfileWasEmpty = () => {
        return 'The created dumpfile is empty';
    }
}

module.exports = new DumpFailed()
