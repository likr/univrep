import argparse
import datetime
import itertools
import json
import os
from asari.api import Sonar
import jaconv
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()

    data = [json.loads(row.strip())
            for filename in args.files for row in open(filename)]
    data.sort(key=lambda item: (item['university'], item['published']))

    date_format = '%Y-%m'
    ts = set()
    start_date = datetime.datetime(2017, 1, 1)
    end_date = datetime.datetime(2021, 12, 31)
    t = start_date
    while t <= end_date:
        ts.add(t.strftime(date_format))
        t += datetime.timedelta(days=1)
    ts = sorted(ts)

    sonar = Sonar()
    nlp = spacy.load('ja_ginza')
    result = {
        'dates': ts,
        'universities': []
    }
    for university, items in itertools.groupby(data, lambda item: item['university']):
        print(university)
        count = {t: 0 for t in ts}
        words = {t: [] for t in ts}
        for item in items:
            t = datetime.datetime\
                .strptime(item['published'], "%a, %d %b %Y %H:%M:%S %Z")\
                .strftime(date_format)
            if t not in count:
                continue
            negpos = sonar.ping(text=item['title'])
            if negpos['top_class'] == 'negative':
                count[t] += 1
            words[t].extend([
                chunk.text for chunk in nlp(jaconv.normalize(item['title'])).noun_chunks
            ])

        corpus = [' '.join(words[t]) for t in ts]
        vectorizer = TfidfVectorizer(max_df=0.9, min_df=3, sublinear_tf=True)
        X = vectorizer.fit_transform(corpus)
        words = vectorizer.get_feature_names()
        keyphrases = [[words[j] for j in sorted(range(len(words)), key=lambda j: X[i, j], reverse=True)[:5]] if count[t] >= 3 else []
                      for i, t in enumerate(ts)]

        result['universities'].append({
            'name': university,
            'count': [count[t] for t in ts],
            'keyphrase': keyphrases
        })
    outpath = os.path.join(os.path.dirname(__file__), '../src/data.json')
    json.dump(result, open(outpath, 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
