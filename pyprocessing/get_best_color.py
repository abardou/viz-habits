from PIL import Image
import os



def near(c, tmp):
	return (c[0] - 5 <= tmp[0] <= c[0] + 5 and c[1] == tmp[1] and c[2] == tmp[2]) or (c[1] - 5 <= tmp[1] <= c[1] + 5 and c[0] == tmp[0] and c[2] == tmp[2]) or (c[2] - 5 <= tmp[2] <= c[2] + 5 and c[1] == tmp[1] and c[0] == tmp[0])

def clustering(d):
	res = {}

	for c in d:
		res[c] = d[c]
		for tmp in d:
			if near(c, tmp):
				res[c] += d[tmp]

	return res


for d in os.listdir('logos/'):
	if d[0] != '.':
		print(d)
		print('reading image')
		im = Image.open('logos/' + d + '/logo_' + d + '.jpg')

		w, h = im.size
		
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


		with open('logos/' + d + '/best_color.txt', 'w+') as file:
			file.write(' '.join([str(i) for i in colour]))
			file.close()

