# stream-flow-async

A utility wrapper to asynchronously post-process data from a Readable stream that controls the stream flow to a maximum
amount of concurrent un-resolved async operations in order to avoid
<a href="https://nodejs.org/es/docs/guides/backpressuring-in-streams/" target="_blank">back-pressuring</a>.

## Usage

```js
const fs = require('fs');
const { streamFlowAsync } = require('stream-flow-async');
const db = require('./my-db-conntection.js');

const stream = fs.createReadStream('emails.txt');

const saveInDb = (email) => {
  return db.collection('emails').insertOne({ email })
}

streamFlowAsync({
    stream, // the stream
    handler: saveInDb, // an async function handler that will receive each chunk
    flow: 10 // maximum amount of concurrent un-resolved async functions
  })
  .then(() => {
    console.log('all saved!')
  })
```

### An example using csv-parser

```js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('./my-db-conntection.js');

const stream = fs.createReadStream('millions-of-contacts.csv').pipe(csv());

const saveInDb = (contact) => {
  return db.collection('contacts').insertOne(contact)
}

streamFlowAsync({
    stream,
    handler: saveInDb, // receives each csv line parsed
    flow: 100
  })
  .then(() => {
    console.log('all saved!')
  })
```
