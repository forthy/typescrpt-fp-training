# Project dependencies

## JSON Schema

[TypeBox](https://github.com/sinclairzx81/typebox)

Given Fastify supports [JSON Schema](https://json-schema.org), TypeBox should help JSON schema writing for our development.

Example:
```typescript

import { Type, Static } from '@sinclair/typebox'

//--------------------------------------------------------------------------------------------
//
// Let's say you have the following type ...
//
//--------------------------------------------------------------------------------------------

type Record = {
    id: string,
    name: string,
    timestamp: number
}

//--------------------------------------------------------------------------------------------
//
// ... you can express this type in the following way.
//
//--------------------------------------------------------------------------------------------

const Record = Type.Object({        // const Record = {
    id: Type.String(),              //   type: 'object',
    name: Type.String(),            //   properties: {
    timestamp: Type.Integer()       //      id: {
})                                  //         type: 'string'
                                    //      },
                                    //      name: {
                                    //         type: 'string'
                                    //      },
                                    //      timestamp: {
                                    //         type: 'integer'
                                    //      }
                                    //   },
                                    //   required: [
                                    //      "id",
                                    //      "name",
                                    //      "timestamp"
                                    //   ]
                                    // }

//--------------------------------------------------------------------------------------------
//
// ... then infer back to the original static type this way.
//
//--------------------------------------------------------------------------------------------

type Record = Static<typeof Record> // type Record = {
                                    //    id: string,
                                    //    name: string,
                                    //    timestamp: number
                                    // }

//--------------------------------------------------------------------------------------------
//
// ... then use the type both as JSON schema and as a TypeScript type.
//
//--------------------------------------------------------------------------------------------

function receive(record: Record) { // ... as a type
    if(JSON.validate(Record, {     // ... as a schema
        id: '42',
        name: 'dave',
        timestamp: Date.now()
    })) {
        // ok...
    }
}
```
