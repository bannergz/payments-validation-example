// Registrar codec Snappy para KafkaJS en CJS
const { CompressionCodecs, CompressionTypes } = require('kafkajs');
const snappyCodec = require('kafkajs-snappy');

CompressionCodecs[CompressionTypes.Snappy] = snappyCodec;
