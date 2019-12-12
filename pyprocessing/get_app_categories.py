import json
import urllib.request
from bs4 import BeautifulSoup

with open('../data/dataset.json', 'r', encoding='utf-8') as file:
	data = json.load(file)
	res = []
	for app in data:
		if app['App Name'] not in res and app['App Name'] not in ['Screen on (locked)', 'Screen off', 'Screen on (unlocked)']:
			res.append(app['App Name']) 

	file.close()

# with open('../data/categories.json', 'r', encoding='utf-8') as f:
# 	categories = json.load(f)

categories = {}
for d in res:
	print(d)
	fp = urllib.request.urlopen("https://play.google.com/store/search?q=" + urllib.parse.quote(d) + "&c=apps&hl=fr")
	soup = BeautifulSoup(fp, 'html.parser')
	id = soup.find('a', {'class': 'poRVub'})['href'].split('=')[-1]

	pa = urllib.request.urlopen("https://play.google.com/store/apps/details?id=" + urllib.parse.quote(id) + "&hl=fr")
	soup2 = BeautifulSoup(pa, 'html.parser')

	categories[d] = soup2.find('a', {'itemprop': 'genre'}).text

print(categories)
with open('../data/categories.json', 'w', encoding='utf-8') as f:
	json.dump(categories, f)