const Compressor = require('./Compressor');

class GzipCompressor extends Compressor {
    useCommand = () => {
        return 'gzip';
    }

    useExtension = () => {
        return 'gz';
    }
}

module.exports = GzipCompressor
