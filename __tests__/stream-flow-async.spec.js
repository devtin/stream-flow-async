const { Readable } = require('stream');
const { streamFlowAsync } = require('../stream-flow-async.js');

const streamData = ['line 1', 'line 2', 'line 3', 'line 4', 'line 5'];

describe('streamFlowAsync', () => {
  it('makes ${flow} amount of simultaneous calls', async () => {
    const handler = jest.fn(async () => {});

    const stream1 = Readable.from(streamData);
    const pauseSpy = jest.spyOn(stream1, 'pause');

    await streamFlowAsync({
      stream: stream1,
      handler,
      flow: 1
    });

    expect(handler).toHaveBeenCalledTimes(5);
    expect(pauseSpy).toHaveBeenCalledTimes(5);

    jest.clearAllMocks();

    const stream2 = Readable.from(streamData);
    const pause2Spy = jest.spyOn(stream2, 'pause');

    await streamFlowAsync({
      stream: stream2,
      handler,
      flow: 5
    });

    expect(handler).toHaveBeenCalledTimes(5);
    expect(pause2Spy).not.toHaveBeenCalled();
  })

  it('early aborts on failure', async () => {
    const handler = jest.fn(async () => {}).mockRejectedValue(new Error('ouch'));

    const stream = Readable.from(streamData);
    const destroySpy = jest.spyOn(stream, 'destroy');

    await expect(streamFlowAsync({
      stream,
      handler
    })).rejects.toThrow('ouch');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(destroySpy).toHaveBeenCalled();
  })
})
