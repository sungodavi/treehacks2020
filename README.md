 run 


python3 -m venv venv
source ./venv/bin/activate
pip install flask flask-sockets

python test.py


then ngrok http 5000

in a new tab 

to make work




model for data:

{
callId: uniqInt,
transcript: string (sentence from user),
speakerTag: int (speakerUser)
wordTimes: array of tuples (start and end time of each word)
confidence: int 0 < i < 1
 

}







