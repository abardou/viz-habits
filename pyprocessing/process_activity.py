import pandas as pd
import pprint
import json
import tools
from datetime import datetime as dt

def extract_app_usage_data(userId, filepath):
    # Format : App name / Date / Time / Duration
    data = tools.get_dataframe(filepath)
    new_data = {'User_ID': [], 'Time': [], 'App Name': [], 'Duration': []}
    # For each data line
    for i in range(data.shape[0]):
        # Create a dict with formatted values
        doc = {
            'User_ID': userId,
            'Time': tools.to_timestamp(data['Date'][i], data['Time'][i]),
            'App Name': tools.appname_process(data['App name'][i]),
            'Duration': tools.time_in_seconds(data['Duration'][i])
        }

        # If the data needs to be stored, addition to the dict new_data
        if doc['Duration'] != 0 and doc['App Name'] not in tools.app_to_remove():
            for k in new_data:
                new_data[k].append(doc[k])
    # Create a df with new data and return it
    return pd.DataFrame(new_data)

if __name__ == "__main__":
    extract_app_usage_data(3, "data/user3/AUM_V4_Activity_2019-11-26_09-26-10.csv")
    