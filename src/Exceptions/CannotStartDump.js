
function CannotStartDump()
{
    /**
     *
     * @return string
     * @param name
     */
    this.emptyParameter = (name) =>
{
    return `Parameter [${name}] cannot be empty.`;
}
}

module.exports = new CannotStartDump()
