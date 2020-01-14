/*
 * AppChord data structure
 * Since the AppChord can be seen as a graph, an adjacency matrix is built.
 * The object also contains several attributes that avoid to repeat heavy
 * calculation on the whole dataset
 */
export default class RadialTreeModel {
	constructor(data, delta, start = 'Screen on (unlocked)', end = 'Screen off') {
		this.delta = delta;
		this.start = start;
		this.end = end;

		// Will build the attributes linked to app info
		this.build_apps_info(data);

		// Apps info need to be constructed before
		// Will build the attributes relative to assets (colors, images)
		this.build_assets();

		this.build_tree(data);
	}

	/**
	 * Build the attributes relative to the apps from the data provided
	 * 
	 * @param {Array(JSONObject)} data the dataset to build the attributes on
	 */
	build_apps_info(data) {
		// Attribute apps : collection of apps names and their indexes
		this.apps = new Set();
		for (const d of data) {
			this.apps.add(d['App Name']);
		}
		this.apps = Array.from(this.apps);

		// Attribute apps_time : collection of proportion of time consumption for each app
		this.apps_time = new Array(this.apps.length).fill(0);
		// Attribute cumul_time : sum(apps_time)
		for (const d of data) {
			const app_idx = this.apps.indexOf(d['App Name']); 
			this.apps_time[app_idx] += d['Duration'];
		}
	}

	get_assets_location() {
		let loc = location.pathname;
		return loc.substr(0, loc.indexOf('/viz-habits/')+12)+'data/logos/';
	}

	build_assets() {
		const that = this;
		this.images = {};
		this.colors = {};
		let assets_dir = this.get_assets_location();


		for (let i in this.apps) {
			let appname = this.apps[i].toLowerCase().split('/').join('-');
			this.images[this.apps[i]] = assets_dir + appname + '/logo_circle.png';

			let filepath = assets_dir + appname + '/best_color.txt';

			fetch(filepath).then(async resp => {
				let data = await resp.text();
				data = data.split(' ').map(d => parseInt(d));
				that.colors[that.apps[i]] = {'r' : data[0], 'g' : data[1], 'b' : data[2]};
			});
		}
	}

	build_tree(data) {
		this.users = new Set();
		for (const d of data) {
			this.users.add(d['User_ID']);
		}

		this.user_trees = {};

		for (const uid of this.users) {
			const f_data = data.filter(d => d['User_ID'] == uid)
				.sort((a, b) => { return a.Time - b.Time; });

			const sequences = [];
			let in_seq = false;
			let seq = [];
			for (const d of f_data) {
				if (d['App Name'] == this.start && !in_seq) {
					seq = [this.start];
					in_seq = true;
				}
				else {
					if (d['App Name'] == this.end && in_seq) {
						sequences.push(seq);
						in_seq = false;
					} else if (in_seq) {
						if (seq.length > 2 && d['App Name'] == seq[seq.length - 1]) {
							console.log(d['App Name']);
							console.log(seq[seq.length - 1]);
							continue;
						}
						seq.push(d['App Name']);
					}
				}
			}
			
			let max = 0;
			for (const m of sequences) {
				if (m.length > max) {
					max = m.length;
				}
			}

			console.log(max);
			
			for (const [i, seqBase] of sequences.entries()) {
				const sequence = seqBase.slice(1);
				// Alternate = longueur 5 mini
				if (sequence.length < 5) continue;

				let altArray = [],
					alt = false;

				const alts = [];
				
				for (const [i, app] of sequence.entries()) {
					altArray.push(app);
					const len = altArray.length;

					if (len >= 3) {
						// Cassage d'alternance
						if (app !== altArray[len - 3]) {
							if (alt) {
								alts.push({
									idxDeb: i - len + 1,
									idxFin: i - 1,
									app1: altArray[0],
									app2: altArray[1],
									nbSwitches: altArray.length - 1
								});
								alt = false;
							}
							
							altArray = altArray.slice(-2);
						} else if (altArray.length >= 5) {
							alt = true;
						}
					}
				}

				if (alts.length > 0) {
					let lastIdx = 0,
						res = [];

					for (const [i, alt] of alts.entries()) {
						res = res.concat(seqBase.slice(lastIdx, alt.idxDeb + 1));
						res.push({app1: alt.app1, app2: alt.app2, nbSwitches: alt.nbSwitches});
					
						lastIdx = alt.idxFin + 2;

						if (i === alts.length - 1) {
							res = res.concat(seqBase.slice(lastIdx));
						}
					}

					sequences[i] = res;
				}
			}

			console.log(sequences);
			max = 0;
			let maxseq = null;
			for (const m of sequences) {
				if (m.length > max) {
					max = m.length;
					maxseq = m;
				}
			}

			console.log(max);
			console.log(maxseq);

			break;
			const goal = {
				name: 'Screen on (unlocked)',
				nb_use: 0,
				children: []
			};
			for (const seq of sequences) {
				let currentNode = goal;
				currentNode.nb_use++;

				for (const app of seq.slice(1)) {
					let found = false,
						child = null;
					for (const c of currentNode.children) {
						if (c.name === app) {
							found = true;
							child = c;
							break;
						}
					}

					if (found) {
						currentNode = child;
						currentNode.nb_use++;
					} else {
						currentNode.children.push({
							name: app,
							nb_use: 1,
							children: []
						});
					}
				}
			}

			console.log(goal);

			/*
			const goal = sequences.reduce((carry, pathEntry) => {
				// On every path entry, resolve using the base object
				pathEntry.path.reduce((pathObject, pathName) => {
					// For each path name we come across, use the existing or create a subpath
					pathObject[pathName] = pathObject[pathName] || {'nb_use': 0};
				
					// Then return that subpath for the next operation
					pathObject[pathName]['nb_use'] += 1;
					return pathObject[pathName];
				// Use the passed in base object to attach our resolutions
				}, carry);
				// Return the base object for suceeding paths, or for our final value
				return carry;
			// Create our base object
			}, {});
			*/

			// let fixed = {name: 'Screen on (unlocked)', children: []};
			// for (const key in goal['Screen on (unlocked)']) {
			// 	if (key === 'nb_use') {
			// 		fixed[key] = goal['Screen on (unlocked)'][key];
			// 	} else {
			// 		continue;
			// 	}
			// }

			// this.user_trees[uid] = goal;
		}
	}

	get_user_tree(user) {
		return this.user_trees[user];
	}
}
