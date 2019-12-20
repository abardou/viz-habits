import json
import urllib.request
from html.parser import HTMLParser
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageOps
import os

with open('../data/dataset.json', 'r') as file:
	data = json.load(file)
	res = []
	for app in data:
		if app['App Name'] not in res and app['App Name'] not in ['Screen on (locked)', 'Screen off', 'Screen on (unlocked)']:
			res.append(app['App Name']) 

	print(res)

	file.close()

files = os.listdir('../data/logos/')

for d in res:
	d = '-'.join(d.split('/'))
	if not d.lower() in files:
		os.mkdir('../data/logos/' + d.lower())

		fp = urllib.request.urlopen("https://play.google.com/store/search?q=" + urllib.parse.quote(d) + "&c=apps&hl=fr")

		page = BeautifulSoup(fp, 'html.parser')

		icon_tag = page.find_all('span', class_ = 'yNWQ8e K3IMke buPxGf')

		icon_url = icon_tag[0].find('span').find('img').get('data-src')

		d = d.lower()

		urllib.request.urlretrieve(icon_url, "../data/logos/" + d + "/logo_" + d + ".jpg")

		print('reading image : ' + d)
		im = Image.open('../data/logos/' + d + '/logo_' + d + '.jpg')

		w, h = im.size

		### GET BEST COLOR ###
		
		rgb_im = im.convert('RGB')

		temp = {}

		for i in range(w):
			for j in range(h):
				rgb = rgb_im.getpixel((i, j))

				if not rgb in temp:
					temp[rgb] = 0
				temp[rgb] += 1


		t = temp.copy()

		for j in range(256):
			if (j, j, j) in temp: temp.pop((j, j, j))

		if len(temp) == 0:
			res = t
			if (0, 0, 0) in res: res.pop((0, 0, 0))
			if (255, 255, 255) in res: res.pop((255, 255, 255))
			
		else:
			res = temp

		colour = max(res, key=res.get)


		with open('../data/logos/' + d + '/best_color.txt', 'w+') as file:
			file.write(' '.join([str(i) for i in colour]))
			file.close()


		### LOGO AS CIRCLE ###

		bigsize = (im.size[0] * 3, im.size[1] * 3)
		mask = Image.new('L', bigsize, 0)
		draw = ImageDraw.Draw(mask) 
		draw.ellipse((0, 0) + bigsize, fill=255)
		mask = mask.resize(im.size, Image.ANTIALIAS)
		im.putalpha(mask)

		output = ImageOps.fit(im, mask.size, centering=(0.5, 0.5))
		output.save('../data/logos/' + d + '/logo_circle.png')


		### REMOVE OLD IMAGE ###

		os.remove('../data/logos/' + d + '/logo_' + d + '.jpg')



