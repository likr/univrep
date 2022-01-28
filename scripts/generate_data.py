import argparse
import datetime
import itertools
import json
import os
from asari.api import Sonar


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()

    data = [json.loads(row.strip())
            for filename in args.files for row in open(filename)]
    data.sort(key=lambda item: (item['university'], item['published']))

    ts = []
    start_date = datetime.datetime(2021, 1, 1)
    end_date = datetime.datetime(2021, 12, 31)
    t = start_date
    while t <= end_date:
        ts.append(t.strftime('%Y-%m-%d'))
        t += datetime.timedelta(days=1)

    sonar = Sonar()
    result = {
        'dates': ts,
        'classes': ['positive', 'negative'],
        'universities': []
    }
    for university, items in itertools.groupby(data, lambda item: item['university']):
        count = {t: [0, 0] for t in ts}
        for item in items:
            t = datetime.datetime\
                .strptime(item['published'], "%a, %d %b %Y %H:%M:%S %Z")\
                .strftime('%Y-%m-%d')
            if t not in count:
                continue
            negpos = sonar.ping(text=item['title'])
            if negpos['top_class'] == 'positive':
                count[t][0] += 1
            if negpos['top_class'] == 'negative':
                count[t][1] += 1
        result['universities'].append({
            'name': university,
            'count': [count[t] for t in ts],
        })
    outpath = os.path.join(os.path.dirname(__file__), '../src/data.json')
    json.dump(result, open(outpath, 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
