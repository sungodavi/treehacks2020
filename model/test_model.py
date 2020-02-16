from train_model import embed
from joblib import load

clf = load("clf.joblib")

def classify(sent):
    emb_x = embed(sent)
    return {
        "is_aggression": bool(clf.predict(emb_x)),
        "prob_aggression": float(clf.predict(emb_x, prediction_type="Probability")[-1])
    }

if __name__ == '__main__':
    from IPython import embed as e; e()
