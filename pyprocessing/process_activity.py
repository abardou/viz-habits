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

def build_positions_for_activity(activity, location):
    lat = [float('nan')]*activity.shape[0]
    long = [float('nan')]*activity.shape[0]

    for i in range(activity.shape[0]):
        tmin = activity['Time'][i]
        tmax = tmin + activity['Duration'][i]
        loc_points = location[location['Time'].between(tmin, tmax, inclusive=True)]

        if not loc_points.empty:
            means = location[['Lat', 'Long']].mean()
            lat[i] = means['Lat']
            long[i] = means['Long']

    return lat, long

def build_aggregate_for_user(userId, activity_source, location_source, aggregate_target):
    activity_data = extract_app_usage_data(userId, activity_source)

    if location_source is not None:
        tmax, tmin = (activity_data['Time'].max(), activity_data['Time'].min())
        location_data = pd.read_csv(location_source)
        location_data = location_data[location_data['Time'].between(tmin, tmax, inclusive=True)]

        lat, long = build_positions_for_activity(activity_data, location_data)
    else:
        lat = [float('nan')]*activity_data.shape[0]
        long = [float('nan')]*activity_data.shape[0]

    activity_data['Lat'] = lat
    activity_data['Long'] = long

    activity_data.to_csv(aggregate_target)

def aggregate_aggregates(aggregates, aggregate_target):
    dataframes = [pd.read_csv(a) for a in aggregates]
    data = dataframes[0].append(dataframes[1:], ignore_index=True).drop(columns="Unnamed: 0")
    data.to_json(aggregate_target, orient='records')

if __name__ == "__main__":
    # pprint.pprint(tools.diff_app_names(tools.get_dataframe("data/user2/AUM_V4_Activity_2019-12-10_22-19-45.csv"), tools.get_dataframe("data/user1/AUM_V4_Activity_2019-12-05_00-46-03.csv")))
    build_aggregate_for_user(1, "data/user1/AUM_V4_Activity_2019-12-05_00-46-03.csv", "data/user1/position.csv", "data/user1/u1_aggregate.csv")
    build_aggregate_for_user(2, "data/user2/AUM_V4_Activity_2019-12-10_22-19-45.csv", "data/user2/position.csv", "data/user2/u2_aggregate.csv")
    build_aggregate_for_user(3, "data/user3/AUM_V4_Activity_2019-12-10_14-47-33.csv", "data/user3/position.csv", "data/user3/u3_aggregate.csv")
    
    aggregate_aggregates([
        "data/user1/u1_aggregate.csv",
        "data/user2/u2_aggregate.csv",
        "data/user3/u3_aggregate.csv"
    ], "data/dataset.json")