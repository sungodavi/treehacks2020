import argparse
import time
import threading

from aiy.board import Board
from aiy.voice.audio import AudioFormat, play_wav, record_file, Recorder

from datetime import datetime
import audio_proc
import net

TRANSFER_INT_SECONDS = 5
TRANSFER_START = datetime.now()

def interval_predicate():
    print('[EQUIBOX] Waiting Interval Before Finishing')
    time.sleep(TRANSFER_INT_SECONDS)    

    return True

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--filename', '-f', default='recording.wav')
    args = parser.parse_args()

    with Board() as board:
        done = threading.Event()
        
        form = AudioFormat(sample_rate_hz=16000, num_channels=1, bytes_per_sample=2)
        record_file(form, filename=args.filename, wait=interval_predicate, filetype='wav')
        print('[EQUIBOX] Recorded Interval')

def analyze():
    txt = [i for i in audio_proc.run_analysis() if i != ""]
    print (txt[-1])
    analyzed = net.send_transcript(txt[-1])
    print ("Analyzed ", txt[-1], "got", analyzed)


if __name__ == '__main__':
    print('[EQUIBOX] Conversation recording started..')
    while True:
        main()
        proc_t = threading.Thread(target = analyze)
        proc_t.start()
