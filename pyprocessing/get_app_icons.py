import json
import urllib.request
from html.parser import HTMLParser
from bs4 import BeautifulSoup
import os

with open('dataset.json', 'r') as file:
	data = json.load(file)
	res = []
	for app in data:
		if app['App Name'] not in res and app['App Name'] not in ['Screen on (locked)', 'Screen off', 'Screen on (unlocked)']:
			res.append(app['App Name']) 

	print(res)

	file.close()

files = os.listdir('logos/')

for i in res:
	i = '-'.join(i.split('/'))
	if not i in files:
		os.mkdir('logos/' + i.lower())

		fp = urllib.request.urlopen("https://play.google.com/store/search?q=" + urllib.parse.quote(i) + "&c=apps&hl=fr")

		page = BeautifulSoup(fp, 'html.parser')

		icon_tag = page.find_all('span', class_ = 'yNWQ8e K3IMke buPxGf')

		icon_url = icon_tag[0].find('span').find('img').get('data-src')

		urllib.request.urlretrieve(icon_url, "logos/" + i.lower() + "/logo_" + i.lower() + ".jpg")



