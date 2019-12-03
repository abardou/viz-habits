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

# Format a date into the US format
def format_date(str_date):
    try:
        dt.strptime(str_date, '%m/%d/%y')
        return str_date
    except ValueError: # Format is assumed to be %d/%m/%Y
        date = dt.strptime(str_date, '%d/%m/%Y')
        return dt.strftime(date, '%m/%d/%y')

# Get all apps in a set, given the dataset data
def get_all_apps(data):
    apps = set()
    for i in range(data.shape[0]):
        apps.add(appname_process(data['App name'][i]))

    return apps

# Return a pandas dataframe given a filepath
def get_dataframe(filepath):
    return pd.read_csv(filepath)

# Process each appname by translating it and encoding it properly
def appname_process(string):
    return translate_appname(string.replace('\xa0', ' '))

# Return a list of apps to remove
def app_to_remove():
    return ['Package installer', 'L\'interface', 'Device boot', 'Device shutdown']

# Merge a string date and a string time into a timestamp
def to_timestamp(date, time):
    string = format_date(date) + ' ' + time
    return dt.timestamp(dt.strptime(string, '%m/%d/%y %H:%M:%S'))

# Translate appname into English
def translate_appname(appname):
    translations = {
        'Appareil allumé': 'Device boot',
        'Appareil photo': 'Camera',
        'Appareil éteint': 'Device shutdown',
        'Appel': 'Phone',
        'Boutique Amazon' : 'Amazon Shopping',
        'Calculatrice': 'Calculator',
        'Caméra': 'Camera',
        'Compte Samsung': 'Samsung account',
        'Contacts': 'Phone',
        'Écran allumé (déverrouillé)': 'Screen on (unlocked)',
        'Écran allumé (verrouillé)': 'Screen on (locked)',
        'Écran éteint': 'Screen off',
        'Écran éteint (verrouillé)': 'Screen off',
        'Galerie': 'Gallery',
        'Gestionnaire de fichiers': 'File Manager',
        'Google Actualités': 'Google News',
        'Google Play Jeux': 'Google Play Games',
        'Historique activé des notifications': 'Notifications history',
        'Horloge': 'Clock',
        'Maintenance de l\'appareil': 'Package installer',
        'Mes fichiers': 'Files',
        'Messages': 'SMS/MMS',
        'Météo': 'Weather',
        'Photos': 'Gallery',
        'Programme d\'installation du kit': 'Package installer',
        'Téléphone': 'Phone',
        'Screen off (locked)': 'Screen off',
        'Screen Time - Temps passé devant l\'écran': 'Screen Time',
    }

    if appname in translations:
        return translations[appname]
    
    return appname