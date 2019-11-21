import pymongo

def get_database(db_name):
    client = pymongo.MongoClient("mongodb+srv://thatuser:thatpassword@clusterthat-vxghd.mongodb.net/test?retryWrites=true&w=majority")
    
    return client[db_name]