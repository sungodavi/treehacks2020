import base64
import json
import logging

from flask import Flask
from flask_sockets import Sockets

app = Flask(__name__)
sockets = Sockets(app)

HTTP_SERVER_PORT = 5000

import sys
import houndify

import socket
import sys

CHANNELS = 1
RATE = 8000
CHUNK = 4096

class MyListener(houndify.HoundListener):

  def onPartialTranscript(self, transcript):
    print("Partial transcript: " + transcript)

  def onFinalResponse(self, response):
    print("Final response: " + str(response))

  def onError(self, err):
    print("Error: " + str(err))


client = houndify.StreamingHoundClient(
    clientID="q9Ew-LAe6qyPFGtdF5NfeQ==",
    clientKey="2jC6lryltmQb2hAvoXahcELKrzc_9zKM8X0UKqDh6dQRoogPAzc8I6zzGAIhmmKUzXGx--2FGFryE9dvXVVqMw==",
    userID="test_user",
    sampleRate=RATE
)

client.start(MyListener())


@sockets.route('/media')
def echo(ws):
    app.logger.info("Connection accepted")
    # A lot of messages will be sent rapidly. We'll stop showing after the first one.
    has_seen_media = False
    message_count = 0
    while not ws.closed:
        message = ws.receive()
        if message is None:
            app.logger.info("No message received...")
            continue

        # Messages are a JSON encoded string
        data = json.loads(message)

        # Using the event type you can determine what type of message you are receiving
        if data['event'] == "connected":
            app.logger.info("Connected Message received: {}".format(message))
        if data['event'] == "start":
            app.logger.info("Start Message received: {}".format(message))
        if data['event'] == "media":
            #if not has_seen_media:
            app.logger.info("Media message: {}".format(message))
            payload = data['media']['payload']
            app.logger.info("Payload is: {}".format(payload))
            chunk = base64.b64decode(payload)


            finished = client.fill(chunk)

            app.logger.info("That's {} bytes".format(len(chunk)))
            app.logger.info("Additional media messages from WebSocket are being suppressed....")
            has_seen_media = True
        if data['event'] == "closed":
            app.logger.info("Closed Message received: {}".format(message))
            break
        message_count += 1

    app.logger.info("Connection closed. Received a total of {} messages".format(message_count))


if __name__ == '__main__':
    app.logger.setLevel(logging.DEBUG)
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler

    server = pywsgi.WSGIServer(('', HTTP_SERVER_PORT), app, handler_class=WebSocketHandler)
    print("Server listening on: http://localhost:" + str(HTTP_SERVER_PORT))
    server.serve_forever()

