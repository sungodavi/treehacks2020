import sys
import houndify

import pyaudio
import socket
import sys

FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 8000
CHUNK = 4096 * 2

from aiy.board import Board, Led

class MyListener(houndify.HoundListener):

  def onPartialTranscript(self, transcript):
    print("Partial transcript: " + transcript)

  def onFinalResponse(self, response):
    print("Final response: " + str(response))

  def onError(self, err):
    print("Error: " + str(err))


audio = pyaudio.PyAudio()
mic_stream = audio.open(
    format=FORMAT, channels=CHANNELS,
    rate=RATE, input=True,
    frames_per_buffer=CHUNK,
    input_device_index=0
)

client = houndify.StreamingHoundClient(
    clientID="q9Ew-LAe6qyPFGtdF5NfeQ==",
    clientKey="2jC6lryltmQb2hAvoXahcELKrzc_9zKM8X0UKqDh6dQRoogPAzc8I6zzGAIhmmKUzXGx--2FGFryE9dvXVVqMw==",
    userID="test_user",
    sampleRate=RATE
)

BUFFER_SIZE = 512

while True:
    client.start(MyListener())

    while True:
        # samples = sys.stdin.read(BUFFER_SIZE)
        samples = mic_stream.read(CHUNK,exception_on_overflow = False )
        if len(samples) == 0: break

        finished = client.fill(samples)
        if finished: break

    client.finish()
