/*
 * AppChord data structure
 * Since the AppChord can be seen as a graph, an adjacency matrix is built.
 * The object also contains several attributes that avoid to repeat heavy
 * calculation on the whole dataset
 */
export default class AppChordModel {
	constructor(data, delta) {
		this.delta = delta;
		// Will build the attributes linked to app info
		this.build_apps_info(data);
		// Apps info need to be constructed before
		// Will build the attributes relative to assets (colors, images)
		this.build_assets();
		// Will build the attributes relative to adjacency matrix
		this.build_adjacency_mat(data);
	}

	/**
	 * Build the attributes relative to the apps from the data provided
	 * 
	 * @param {Array(JSONObject)} data the dataset to build the attributes on
	 */
	build_apps_info(data) {
		// Attribute apps : collection of apps names and their indexes
		this.apps = new Set();
		for (let d of data)
			this.apps.add(d['App Name']);
		this.apps = Array.from(this.apps);

		// Attribute apps_users : collection of set of users for each app
		this.apps_users = new Array(this.apps.length).fill(undefined);
		this.users = new Set();
		// Attribute apps_time : collection of proportion of time consumption for each app
		this.apps_time = new Array(this.apps.length).fill(0);
		// Attribute cumul_time : sum(apps_time)
		for (let d of data) {
			let app_idx = this.get_app_index(d['App Name']);
			this.apps_time[app_idx] += d['Duration'];

			if (this.apps_users[app_idx] == undefined)
				this.apps_users[app_idx] = new Set();
			this.apps_users[app_idx].add(d['User_ID']);
			this.users.add(d['User_ID']);
		}
	}

	/**
	 * @returns {string} the assets dir path
	 */
	get_assets_location() {
		let loc = location.pathname;
		return loc.substr(0, loc.indexOf('/viz-habits/')+12)+'data/logos/';
	}

	/**
	 * @returns {string} build filepath of icons image and colors
	 */
	build_assets() {
		var that = this;
		this.images = new Array(this.apps.length);
		this.colors = new Array(this.apps.length);
		let assets_dir = this.get_assets_location();

		for (let i in this.apps) {
			let appname = this.apps[i].toLowerCase();
			this.images[i] = assets_dir + appname + '/logo_circle.png';

			let filepath = assets_dir + appname + '/best_color.txt';

			// Colors are stored within a file, must be requested with AJAX
			let xobj = new XMLHttpRequest();
			xobj.overrideMimeType('application/json');
			xobj.open('GET', filepath, true);
			xobj.onreadystatechange = function () {
				if (xobj.readyState == 4 && xobj.status == '200') {
					that.colors[i] = xobj.responseText.split(' ').map(d => parseInt(d));
				}
			};
			xobj.send(null);
		}
	}

	/**
	 * Build the attributes relative to the graph
	 * 
	 * @param {Array(JSONObject)} data the dataset to build the attributes on
	 */
	build_adjacency_mat(data) {
		// Extract users
		let users = new Set();
		for (let d of data)
			users.add(d['User_ID']);

		// Build the matrix
		this.adj_mat = new Array(this.apps.length)
			.fill(0)
			.map(() => {return new Array(this.apps.length).fill(0);});

		// Fill the matrix with each user sequence
		for (let uid of users) {
			// Build the user sequence
			let f_data = data
				.filter(d => d['User_ID'] == uid)
				.sort(function(a, b) { return a.Time - b.Time; });
				
			let mem = undefined;
			let mem_time = undefined;
			// Loop through the user sequence and compute switches
			for (let d of f_data) {
				let app_idx = this.get_app_index(d['App Name']);
				if (mem != undefined && mem != this.get_app_index(d['App Name']) && (d['Time'] - mem_time) < this.delta)
					this.adj_mat[mem][app_idx] += 1;
				mem = app_idx;
				mem_time = d['Time'];
			}
		}
	}

	/**
	 * Find the index of the an app name by searching into the apps attribute
	 * 
	 * @param {string} app_name the name of the app
	 * 
	 * @returns {int} the index of the app_name if it exists, -1 otherwise
	 */
	get_app_index(app_name) {
		return this.apps.indexOf(app_name);
	}

	/**
	 * @returns {Object} A JavaScript Object representation of the data, built for AppGraph
	 */
	get_as_json() {
		let json_obj = {'nodes': [], 'links': []};
		// Nodes
		for (let i in this.apps)
			json_obj.nodes.push({'id': this.apps[i], 'time': this.apps_time[i], 'image': this.images[i], 'users': this.apps_users[i], 'only_one_user': this.users.size == 1});

		for (let i in this.adj_mat) {
			let aii = this.get_app_index(this.apps[i]);
			let s_switches = this.adj_mat[aii].reduce(function(a, b) { return a+b; });
			for (let j = 0; j < i; j++) {
				let aij = this.get_app_index(this.apps[j]);
				let t_switches = this.adj_mat[aij].reduce(function(a, b) { return a+b; });
				let v = this.adj_mat[i][j] + this.adj_mat[j][i];
				if (v != 0)
					json_obj.links.push({
						'source': this.apps[i],
						'target': this.apps[j],
						'value': v, 'st': this.adj_mat[i][j],
						'ts': this.adj_mat[j][i],
						'fst': this.adj_mat[aii][aij] / s_switches,
						'fts': this.adj_mat[aij][aii] / t_switches
					});
			}
		}

		return json_obj;
	}
}
