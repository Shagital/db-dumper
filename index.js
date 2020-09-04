
const MySql = require(__dirname+'/src/Databases/MySql');
const PostgreSql = require(__dirname+'/src/Databases/PostgreSql');
const Sqlite = require(__dirname+'/src/Databases/Sqlite');
const MongoDb = require(__dirname+'/src/Databases/MongoDb');

const Compressor = require(__dirname+'/src/Compressors/Compressor');
const GzipCompressor = require(__dirname+'/src/Compressors/GzipCompressor');

module.exports = {
    MySql,
    PostgreSql,
    Sqlite,
    MongoDb,

    Compressor,
    GzipCompressor
}
