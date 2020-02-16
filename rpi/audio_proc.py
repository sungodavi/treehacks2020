#!/usr/bin/env python3
import houndify
import sys
import time
import wave

CLIENT_ID = "q9Ew-LAe6qyPFGtdF5NfeQ=="
CLIENT_KEY = "2jC6lryltmQb2hAvoXahcELKrzc_9zKM8X0UKqDh6dQRoogPAzc8I6zzGAIhmmKUzXGx--2FGFryE9dvXVVqMw==" 
AUDIO_FILE = "recording.wav"

BUFFER_SIZE = 256

def run_analysis():

    audio = wave.open(AUDIO_FILE)
    if audio.getsampwidth() != 2:
      print("%s: wrong sample width (must be 16-bit)" % fname)
      sys.exit()
    if audio.getframerate() != 8000 and audio.getframerate() != 16000:
      print("%s: unsupported sampling frequency (must be either 8 or 16 khz)" % fname)
      sys.exit()
    if audio.getnchannels() != 1:
      print("%s: must be single channel (mono)" % fname)
      sys.exit()


    audio_size = audio.getnframes() * audio.getsampwidth()
    audio_duration = audio.getnframes() / audio.getframerate()
    chunk_duration = BUFFER_SIZE * audio_duration / audio_size


    #
    # Simplest HoundListener; just print out what we receive.
    # You can use these callbacks to interact with your UI.
    #
    class MicroListener(houndify.HoundListener):
      partials = []

      def onPartialTranscript(self, transcript):
          self.partials.append(transcript)
          #print("Partial transcript: " + transcript)
          pass
      def onFinalResponse(self, response):
          pass
      def onError(self, err):
        print("Error: " + str(err))


    client = houndify.StreamingHoundClient(CLIENT_ID, CLIENT_KEY, "test_user", enableVAD=False)
    client.setLocation(37.388309, -121.973968)
    client.setSampleRate(audio.getframerate())

    # # Uncomment the lines below to see an example of using a custom
    # # grammar for matching.  Use the file 'turnthelightson.wav' to try it.
    # clientMatches = [ {
    #   "Expression" : '([1/100 ("can"|"could"|"will"|"would")."you"].[1/10 "please"].("turn"|"switch"|(1/100 "flip"))."on".["the"].("light"|"lights").[1/20 "for"."me"].[1/20 "please"])|([1/100 ("can"|"could"|"will"|"would")."you"].[1/10 "please"].[100 ("turn"|"switch"|(1/100 "flip"))].["the"].("light"|"lights")."on".[1/20 "for"."me"].[1/20 "please"])|((("i".("want"|"like"))|((("i".["would"])|("i\'d")).("like"|"want"))).["the"].("light"|"lights").["turned"|"switched"|("to"."go")|(1/100"flipped")]."on".[1/20"please"])"',
    #   "Result" : { "Intent" : "TURN_LIGHT_ON" },
    #   "SpokenResponse" : "Ok, I\'m turning the lights on.",
    #   "SpokenResponseLong" : "Ok, I\'m turning the lights on.",
    #   "WrittenResponse" : "Ok, I\'m turning the lights on.",
    #   "WrittenResponseLong" : "Ok, I\'m turning the lights on."
    # } ]
    #
    # client.setHoundRequestInfo('ClientMatches', clientMatches)

    client_list = MicroListener()

    client.start(client_list)

    while True:
      chunk_start = time.time()

      samples = audio.readframes(BUFFER_SIZE)
      if len(samples) == 0: break
      if client.fill(samples): break

      # # Uncomment the line below to simulate real-time request
      # time.sleep(chunk_duration - time.time() + chunk_start) 

    result = client.finish() # returns either final response or error
    return client_list.partials
