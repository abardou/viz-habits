/*
 * AppChord data structure
 * Since the AppChord can be seen as a graph, an adjacency matrix is built.
 * The object also contains several attributes that avoid to repeat heavy
 * calculation on the whole dataset
 */
class RadialTreeModel {
    constructor(data, delta, start = "Screen on (unlocked)") {
        this.delta = delta
        this.start = start
        // Will build the attributes linked to app info
        this.build_apps_info(data);
        // Apps info need to be constructed before
        // Will build the attributes relative to assets (colors, images)
        this.build_assets();

        this.build_tree(data);

        // The filtered attributes are those to return to the user
        // Other attributes must NEVER change outside the constructor
        setTimeout(10000)
        this.filtered_apps = this.apps.slice();
        this.filtered_apps_time = this.apps_time.slice();
        //this.filtered_images = this.images.slice();
        //this.filtered_tree = this.tree.slice();
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

        // Attribute apps_time : collection of proportion of time consumption for each app
        this.apps_time = new Array(this.apps.length).fill(0);
        // Attribute cumul_time : sum(apps_time)
        for (let d of data) {
            let app_idx = this.get_app_index(d['App Name'])
            this.apps_time[app_idx] += d['Duration'];
        }
    }

    get_assets_location() {
        let loc = location.pathname;
        return loc.substr(0, loc.indexOf("/viz-habits/")+12)+"data/logos/";
    }

    build_assets() {
        var that = this;
        this.images = {}
        this.colors = {}
        let assets_dir = this.get_assets_location()


        for (let i in this.apps) {
            let appname = this.apps[i].toLowerCase().split('/').join('-')
            this.images[this.apps[i]] = assets_dir + appname + "/logo_circle.png";

            let filepath = assets_dir + appname + "/best_color.txt";


            let xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', filepath, true);
            xobj.onreadystatechange = function () {
                    if (xobj.readyState == 4 && xobj.status == "200") {
                        let data = xobj.responseText.split(' ').map(d => parseInt(d))
                        that.colors[that.apps[i]] = {'r' : data[0], 'g' : data[1], 'b' : data[2]}
                    }
            };
            xobj.send(null);
        }

        //console.log(this.images)
        //console.log(this.colors)
    }


    build_tree(data) {

    	let users = new Set();
        for (let d of data)
            users.add(d['User_ID'])


        this.user_sequences = {}

        for (let uid of users) {

	    	let f_data = data.filter(d => d['User_ID'] == uid)
	                             .sort(function(a, b) { return a.Time - b.Time; });

	        let sequences = []
	        let in_seq = false
	        let seq = []
	        for (let i of f_data) {
	        	if (i['App Name'] == this.start && !in_seq) {
	        		seq = [this.start]
	        		in_seq = true
	        	}
	        	else {
	        		if (i['App Name'] == "Screen off" && in_seq) {
	        			//seq.push("Screen off")
	        			sequences.push({'path' : seq})
	        			in_seq = false
	        		} else {
	        			if (in_seq && i['App Name'] != this.start) {
	        				seq.push(i['App Name'])
	        			}
	        		}
	        	}
	        }

            

			var goal = sequences.reduce(function(carry, pathEntry){
                
			  // On every path entry, resolve using the base object
			  pathEntry.path.reduce(function(pathObject, pathName){
			    // For each path name we come across, use the existing or create a subpath

			    pathObject[pathName] = pathObject[pathName] || {'nb_use': 0};

                
			    // Then return that subpath for the next operation
                pathObject[pathName]['nb_use'] += 1
			    return pathObject[pathName];
			  // Use the passed in base object to attach our resolutions
			  }, carry);
			  // Return the base object for suceeding paths, or for our final value
			  return carry;
			// Create our base object
			}, {});

			this.user_sequences[uid] = goal
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
        return this.apps.indexOf(app_name)
    }


    get_tree(id) {

    	let app_name = Object.keys(this.user_sequences[id])[0]
        
    	let json_as_tree = this.get_app_tree(app_name, this.user_sequences[id][app_name])

        //json_as_tree = this.filter_screen_off_leaf(json_as_tree)
        
    	return json_as_tree
    }

    get_app_tree(app_name, values) {
    	let children = []
		if (Object.keys(values).length > 0) {
			for (let b of Object.keys(values)) {
                if (b != "nb_use") {
                    let v = values[b]
    				children.push(this.get_app_tree(b, values[b]))
                }
			}
		}

		if (children.length > 0) {
			return {"name" : app_name, "image" : this.images[app_name], "nb_use" : values['nb_use'], "children" : children}
		} else {
			return {"name" : app_name, "image" : this.images[app_name], "nb_use" : values['nb_use']}
		}
	}

     filter_screen_off_leaf(sequences) {
        console.log(sequences)
        
        //console.log(res)
        let children = []

        if (sequences.children != undefined && sequences.children.length == 1 && sequences.children[0].name == "Screen off") {
            delete sequences.children
            sequences.children = children
        }

        if (sequences.children != undefined && sequences.children.length > 0) {
            
                for (let child of sequences.children) {
                    let ret = this.filter_screen_off_leaf(child)
                    children.push(ret)
                }
            
        }

        delete sequences.children

        sequences.children = children

        if (sequences.children.length > 0) {
            let sum = 0

            for (let c of sequences.children) {
                sum += c.nb_use
            }

            sequences.nb_use = sum
        }

        return sequences
    }

}
