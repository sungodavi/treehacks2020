import re
import pandas
import numpy as np

from tqdm import tqdm
from joblib import dump, load

from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score as acc
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier

import torch
from transformers import DistilBertTokenizer, DistilBertModel

PREPROCESS = False
MICRO_MULT = 10

tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
transformer = DistilBertModel.from_pretrained('distilbert-base-uncased', output_hidden_states=True)

def embed(x):
    x = tokenizer.encode(x, add_special_tokens=True)
    x = torch.tensor([x])
    with torch.no_grad():
        last_hs = transformer(x)[0] # last layer hidden state
        # (bs, max_seq_len) -> (bs, seq_len, hid_dim)
        final_hs = torch.squeeze(last_hs, 0)[-1, :]
    emb_X = final_hs.detach().numpy()
    return emb_X

# Load data
def clean(sent):
    sent = re.sub(r"(@|#)(\w|\d|_|-)+", "", sent)
    sent = re.sub(r"https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)", "", sent) # https://stackoverflow.com/a/3809435
    sent = sent.replace("RT ", "")
    sent = sent.replace("&gt", "")
    sent = sent.replace("&lt", "")
    sent = sent.replace("&;", "")
    sent = sent.replace("&amp;", "")
    sent = sent.replace("\n", "")
    sent = sent.replace("  ", "")
    sent = sent.replace("\\", "")
    sent = sent.replace(";", "")
    return sent

if __name__ == '__main__':
    csv = pandas.read_csv("hate_speech.csv")
    neg_X = csv[csv["class"] == 2]["tweet"].tolist()
    pos_X = csv[csv["class"] == 0]["tweet"].tolist()
    micro_X = open("microaggressions.txt").readlines()
    micro_X = sum([micro_X for _ in range(MICRO_MULT)], [])
    X = neg_X + pos_X + micro_X

    print(f"Neg: {len(neg_X)}. Pos: {len(pos_X)}. Micro: {len(micro_X)}")
    X = [clean(x).strip() for x in tqdm(X, desc="Cleaning...")]
    y = [0 for _ in neg_X] + [1 for _ in pos_X + micro_X]

    # Preprocess
    if PREPROCESS:
        emb_X = [embed(x) for x in tqdm(X, desc="Embedding...")]
        dump(emb_X, "emb_X.joblib")
    else:
        emb_X = load("emb_X.joblib")

    # Classify
    clf = CatBoostClassifier()
    X_train, X_test, y_train, y_test = train_test_split(emb_X, y, train_size=0.85)

    print("Training...")
    clf.fit(X_train, y_train)
    y_train_pred = clf.predict(X_train)
    print(f"Train accuracy: {acc(y_train, y_train_pred)}")

    print("Testing...")
    y_pred = clf.predict(X_test)
    print(f"Test accuracy: {acc(y_test, y_pred)}")

    dump(clf, "clf.joblib")
