// export-schema.js

const { TRANSACTION_VALIDATION_REQUEST_SCHEMA } = require('./transaction-validation-request.schema');

// Prepara el objeto para el Schema Registry

const output = {
  schemaType: "JSON",
  schema: JSON.stringify(TRANSACTION_VALIDATION_REQUEST_SCHEMA)
};

// Imprime el resultado listo para guardar en schema.json
console.log(JSON.stringify(output, null, 2));

//Generate exportable schema for Schema Registry validation
//node export-schema.js > ./subjects/transaction-validation-request.schema.json