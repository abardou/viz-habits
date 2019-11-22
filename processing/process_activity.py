import pandas as pd
import pprint
import json
import tools
import database as db

if __name__ == "__main__":
    userId = 1
    path = "data/user"+str(userId)+"/"
    filename = "AUM_V4_Activity_2019-11-21_15-00-13.csv"

    activity_col = db.get_activity_collection()

    # Format : App name / Date / Time / Duration
    data = tools.get_dataframe(path+filename)
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
