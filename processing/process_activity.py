import pandas as pd
import pprint
import json
import tools
import database as db
from datetime import datetime as dt

def csv_to_database(userId, filepath):
    activity_col = db.get_activity_collection()

    # Format : App name / Date / Time / Duration
    data = tools.get_dataframe(filepath)
    for i in range(data.shape[0]):
        doc = {
            'user_id': userId,
            'date': tools.to_datetime(data['Date'][i], data['Time'][i]),
            'app_name': tools.str_process(data['App name'][i]),
            'duration': tools.time_in_seconds(data['Duration'][i])
        }

        if doc['duration'] != 0 and doc['app_name'] not in tools.app_to_remove():
            activity_col.update_one(
                doc,
                {'$setOnInsert' : doc},
                upsert=True
            )

def app_graph_data(userId, dateGte=None, dateLt=None, durationGte=None, durationLt=None):
    global_filter = {'user_id': userId}

    date_filter = db.get_gtelt_filter(dateGte, dateLt)
    if date_filter is not None:
        global_filter['date'] = date_filter

    duration_filter = db.get_gtelt_filter(durationGte, durationLt)
    if duration_filter is not None:
        global_filter['duration'] = duration_filter

    activity_col = db.get_activity_collection()
    data = activity_col.find(global_filter, {'_id':0, 'date':1, 'app_name':1}).sort('date', 1)

    return data[:30]

def build_app_graph_adjacency_matrix(data):
    matrix = {}
    previous = None
    for doc in data:
        if doc['app_name'] not in matrix.keys():
            if previous is None:
                matrix[doc['app_name']] = {doc['app_name']: 0}
                previous = doc['app_name']
                continue
            else:
                for k,v in matrix.items():
                    matrix[k][doc['app_name']] = 0
                key = list(matrix.keys())[0]
                matrix[doc['app_name']] = {k:0 for k in matrix[key].keys()}
        
        matrix[previous][doc['app_name']] += 1
        previous = doc['app_name']
    
    for k1,v1 in matrix.items():
        s = sum(v1.values())
        for k2,v2 in matrix[k1].items():
            matrix[k1][k2] = v2/s

    return matrix

def get_processed_app_graph(userId, dateGte=None, dateLt=None, durationGte=None, durationLt=None):
    data = app_graph_data(userId, dateGte=dateGte, dateLt=dateLt, durationGte=durationGte, durationLt=durationLt)
    adj_ma = build_app_graph_adjacency_matrix(data)

if __name__ == "__main__":
    pass
    # get_processed_app_graph(1)