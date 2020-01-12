import json
import pandas as pd
from datetime import datetime

if __name__ == "__main__":
    path = "data/user2/position.json"
    target = "data/user2/position.csv"
    with open(path) as json_file:
        js = json.load(json_file)

    minDate = datetime(2019, 11, 7)
    maxDate = datetime(2019, 12, 11)

    dataframe = []
    for o in js['locations']:
        timestampS = int(o['timestampMs']) / 1e3
        dt_object = datetime.fromtimestamp(timestampS)

        if dt_object < minDate or dt_object > maxDate:
            continue

        dataframe.append([o['latitudeE7'] / 1e7, o['longitudeE7'] / 1e7, timestampS])

    dataframe = pd.DataFrame(dataframe, columns=['Lat', 'Long', 'Time'])
    with open(target, 'w') as csv_file:
        dataframe.to_csv(csv_file, line_terminator= '\n')