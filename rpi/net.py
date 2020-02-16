import requests
import json

URL = "http://35.192.184.26/classify/"

def send_transcript(txt):
    global URL
    req = requests.post(URL, json={"transcript": txt})
    resp = json.loads(req.text)
    print (resp)
    return resp["is_aggression"]

print(send_transcript("I'm not sure if someone like you could thik of that"))
