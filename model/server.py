from copy import copy
from flask import Flask, request, make_response
from test_model import classify as clf

app = Flask(__name__)

@app.route('/classify/', methods=['POST'])
def classify():
    if request.headers['Content-Type'] == 'application/json':
        try:
            transcript = request.json["transcript"]
        except KeyError:
            return make_response("Need 'transcript' field.", 415)

        resp = copy(request.json)
        resp.update(clf(transcript))
        return make_response(resp, 200)

    else:
        return make_response("Unsupported content-type", 415)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=4390, debug=False)
