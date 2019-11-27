import json
import pandas as pd

if __name__ == "__main__":
    path = "position.json"
    target = "position.csv"
    with open(path) as json_file:
        js = json.load(json_file)
        
    dataframe = []
    for o in js['locations']:
        dataframe.append([o['latitudeE7'] / 1e7, o['longitudeE7'] / 1e7, o['timestampMs']])

    dataframe = pd.DataFrame(dataframe, columns=['Lat', 'Long', 'Time'])
    with open(target, 'w') as csv_file:
        dataframe.to_csv(csv_file)