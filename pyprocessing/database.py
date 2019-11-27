import pymongo

# Cache for db object
db_object = None

def get_database():
    if db_object is None:
        client = pymongo.MongoClient("mongodb+srv://thatuser:thatpassword@clusterthat-vxghd.mongodb.net/test?retryWrites=true&w=majority")
        return client.that
    
    return db_object
    
# Give the activity collection
def get_activity_collection():
    db = get_database()
    return db.Activity

def get_gtelt_filter(gteFilter, ltFilter):
    f = {}
    if gteFilter is not None:
        f['$gte'] = gteFilter
    if ltFilter is not None:
        f['$lt'] = ltFilter

    return f if f != {} else None