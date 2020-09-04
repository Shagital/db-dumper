
function CannotSetParameter() {
    /**
     * @param name
     * @param conflictName
     *
     * @return string
     */
    this.conflictingParameters = (name, conflictName) => {
        return `Cannot set [${name}] because it conflicts with parameter [${conflictName}].`;
    }
}
module.exports = new CannotSetParameter()
