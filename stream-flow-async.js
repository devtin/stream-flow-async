/**
 * This functions
 * @param {Readable} stream
 * @param {Function} handler - async function meant to process each stream chunk
 * @param {Number} flow - amount of concurrent un-resolved async functions
 * @return {Promise<unknown>}
 */
const streamFlowAsync = ({
  stream,
  handler,
  flow = 1,
}) => {
  const asyncHandlers = [];

  const checkIfStreamShouldPause = () => {
    if (asyncHandlers.length >= flow && !stream.isPaused()) {
      stream.pause();
    }
  };

  const checkIfStreamShouldResume = () => {
    if (asyncHandlers.length < flow && stream.isPaused()) {
      stream.resume();
    }
  };

  return new Promise((resolve, reject) => {
    const handleAsyncHandler = (promise) => {
      asyncHandlers.push(promise);

      promise
        .then(() => {
          asyncHandlers.splice(asyncHandlers.indexOf(promise), 1);
          checkIfStreamShouldResume();
        })
        .catch((error) => {
          stream.destroy();
          reject(error);
        });
    };

    const processData = (chunk) => {
      handleAsyncHandler(handler(chunk));
      checkIfStreamShouldPause();
    };

    stream.on('data', processData).on('end', resolve).on('error', reject);
  });
};

module.exports = {
  streamFlowAsync,
};
