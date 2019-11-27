import pandas as pd
from datetime import datetime as dt

# HH:mm:ss
def time_in_seconds(time_str):
    if time_str == "00:00:00":
        return 0
    
    hms = [int(x) for x in time_str.split(':')]
    return hms[0]*3600 + hms[1]*60 + hms[2]

# dataA is ref
def diff_app_names(dataA, dataB):
    appA = get_all_apps(dataA)
    appB = get_all_apps(dataB)

    return appB - appA

def get_all_apps(data):
    apps = set()
    for i in range(data.shape[0]):
        apps.add(str_process(data['App name'][i]))

    return apps

def get_dataframe(filepath):
    return pd.read_csv(filepath)

def translate_appname(appname):
    translations = {
        'Boutique Amazon' : 'Amazon Shopping',
        'Caméra': 'Camera',
        'Gestionnaire de fichiers': 'File Manager',
        'Photos': 'Gallery',
        'Programme d\'installation du kit': 'Package installer',
        'Horloge': 'Clock',
        'Téléphone': 'Phone',
        'Calculatrice': 'Calculator',
        'Google Actualités': 'Google News',
        'Screen off (locked)': 'Screen off'
    }

    if appname in translations:
        return translations[appname]
    
    return appname

def str_process(string):
    return translate_appname(string.replace('\xa0', ' '))

def app_to_remove():
    return ['Package installer', 'L\'interface', 'Device boot', 'Device shutdown']

def to_datetime(date, time):
    string = date + ' ' + time
    return dt.strptime(string, '%m/%d/%y %H:%M:%S')