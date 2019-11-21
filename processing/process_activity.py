import pandas as pd
import pprint
import json

def get_activity_json_filename(userId):
    return "2_Activity.json"

if __name__ == "__main__":
    userId = "2"
    activity_filepath = "data/user"+userId+"/AUM_V4_Activity_2019-11-21_15-18-06.csv"
    data = pd.read_csv(activity_filepath)
    
    