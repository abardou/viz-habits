/*
 * AppChord data structure
 * Since the AppChord can be seen as a graph, an adjacency matrix is built.
 * The object also contains several attributes that avoid to repeat heavy
 * calculation on the whole dataset
 */
class AppChordModel {
    constructor(data) {
        // Will build the attributes linked to app info
        this.build_apps_info(data);
        // Apps info need to be constructed before
        // Will build the attributes linked to adjacency matrix
        this.build_adjacency_mat(data);

        // The filtered attributes are those to return to the user
        // Other attributes must NEVER change outside the constructor
        this.filtered_apps = this.apps.slice();
        this.filtered_apps_time = this.apps_time.slice();
        this.filtered_cumul_time = this.cumul_time;
        this.filtered_n_switches = this.n_switches.slice();
        this.filtered_adj_mat = this.adj_mat.slice();
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
        this.cumul_time = 0;
        for (let d of data) {
            let app_idx = this.get_app_index(d['App Name'])
            this.apps_time[app_idx] += d['Duration'];
            this.cumul_time += d['Duration'];
        }

        for (let i in this.apps_time)
            this.apps_time[i] = this.apps_time[i] / this.cumul_time
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
            users.add(d['User_ID'])

        // Build the matrix
        this.adj_mat = new Array(this.apps.length).fill(0)
                           .map(d => {return new Array(this.apps.length).fill(0)})

        // Fill the matrix with each user sequence
        this.n_switches = new Array(this.apps.length).fill(0);
        for (let uid of users) {
            // Build the user sequence
            let f_data = data.filter(d => d['User_ID'] == uid)
                             .sort(function(a, b) { return a.Time - b.Time; });
            let mem = undefined;
            // Loop through the user sequence and compute switches
            for (let d of f_data) {
                let app_idx = this.get_app_index(d['App Name']);
                if (mem != undefined && mem != this.get_app_index(d['App Name'])) {
                    this.adj_mat[mem][app_idx] += 1;
                    this.n_switches[mem] += 1;
                }
                mem = app_idx;
            }
        }

        // Normalize the matrix
        for (let line in this.adj_mat)
            for (let col in this.adj_mat[line])
                this.adj_mat[line][col] = this.adj_mat[line][col] / this.n_switches[line]
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

    /**
     * Remove in each provided attributes (must be references for side effects) the apps listed in to_rem
     * 
     * @param {Array(int)} to_rem the indexes of the apps to remove
     * @param {Array(Array(float))} matrix the adjacency matrix of the graph
     * @param {Array(string)} app the collection of apps' names
     * @param {Array(int)} app_time the collection of proportions of app consumption time
     * @param {int} c_time the cumulated consumption time
     * @param {Array(int)} switches the number of times each app switched to another
     * 
     * @returns {int} the new cumulated consumption time
     */
    remove_useless_apps(to_rem, matrix, app, app_time, c_time, switches) {
        // Compute the absolute time from c_time and app_time
        let abs_time = app_time.map(d => {return Math.round(c_time*d); })
        // Sort descending to_rem in order to prevent indexes issues
        to_rem = to_rem.sort(function(a, b) { return b - a; });
        // Remove apps filtered from attributes
        for (let i of to_rem) {
            c_time -= abs_time[i]
            app.splice(i, 1)
            app_time.splice(i, 1)

            switches.splice(i, 1)
            // Line of the matrix
            matrix.splice(i, 1)
            // Column of the matrix
            for (let j in matrix)
                matrix[j].splice(i, 1)
        }

        // Update n_switches
        // Compute coeffs to apply to proportions into matrix at the same time
        let coeffs = new Array(switches.length).fill(0)
        for (let i in switches) {
            let d = switches[i]
            switches[i] = Math.round(d * matrix[i].reduce(function(a, b) {return a + b}))
            if (switches[i] != 0)
                coeffs[i] = d / switches[i];
        }
        // Update adj_mat values thanks to coeffs
        for (let lig in matrix)
            for (let col in matrix[lig])
                matrix[lig][col] = coeffs[lig]*matrix[lig][col]

        return c_time
    }

    /**
     * Compute useless apps from the adjacency matrix of the graph
     * 
     * @param {Array(Array(float))} matrix the adjacency matrix of the graph
     * 
     * @returns {Array(int)} collection of indexes of apps to remove
     */
    get_useless_apps(matrix) {
        let to_rem = []
        // Useless apps are apps with sum(line) and sum(column) equal to 0 in the matrix
        for (let i in matrix) {
            let is_useless = true;
            for (let j in matrix[i])
                if (matrix[i][j] != 0 || matrix[j][i] != 0) {
                    is_useless = false;
                    break;
                }
            if (is_useless)
                to_rem.push(i);
        }
        return to_rem
    }

    /**
     * Update the filtered attributes in order to respect the provided time criteria
     * 
     * @param {int} min_time the min criterion
     * @param {int} max_time the max criterion
     */
    apply_time_filter(min_time, max_time=Number.MAX_SAFE_INTEGER) {
        // Build the absolute consumption time
        let abs_time = this.apps_time.map(d => {return Math.round(this.cumul_time*d); })
        let to_rem = []
        // Apply the filter and collect apps indexes to remove
        for (let i in abs_time)
            if (abs_time[i] < min_time || abs_time[i] > max_time)
                to_rem.push(i);

        // Filter with to_rem
        this.filtered_cumul_time = this.remove_useless_apps(to_rem, this.filtered_adj_mat, this.filtered_apps,
                                                            this.filtered_apps_time, this.filtered_cumul_time,
                                                            this.filtered_n_switches);

        // The filter may have produced new useless apps, we remove them
        to_rem = this.get_useless_apps(this.filtered_adj_mat)
        this.filtered_cumul_time = this.remove_useless_apps(to_rem, this.filtered_adj_mat, this.filtered_apps,
                                                            this.filtered_apps_time, this.filtered_cumul_time,
                                                            this.filtered_n_switches);
    }

    /**
     * Update the filtered attributes in order to respect the provided frequency criteria
     * 
     * @param {float} min_freq the min criterion
     * @param {float} max_freq the max criterion
     */
    apply_frequency_filter(min_freq, max_freq=1) {
        // Replace each coefficient outside the filter by 0
        this.filtered_adj_mat = this.filtered_adj_mat.map(d => {return d.map(c => {
            if (c < min_freq || c > max_freq)
                return 0
            return c
        })})

        // This action may have produced useless apps, we remove them and update the matrix coefficients accordingly
        let to_rem = this.get_useless_apps(this.filtered_adj_mat)
        this.filtered_cumul_time = this.remove_useless_apps(to_rem, this.filtered_adj_mat, this.filtered_apps,
                                                            this.filtered_apps_time, this.filtered_cumul_time,
                                                            this.filtered_n_switches);
    }

    /**
     * Update the filtered attributes with respect to time and frequency criteria
     * 
     * @param {int} min_time the min time criterion
     * @param {int} max_time the max time criterion
     * @param {float} min_freq the min frequency criterion
     * @param {float} max_freq the max frequency criterion
     */
    apply_filters(min_time=0, max_time=Number.MAX_SAFE_INTEGER, min_freq=0, max_freq=1) {
        // Copy the original data into the attributes to filter
        this.filtered_apps = this.apps.slice();
        this.filtered_apps_time = this.apps_time.slice();
        this.filtered_cumul_time = this.cumul_time;
        this.filtered_n_switches = this.n_switches.slice();
        this.filtered_adj_mat = this.adj_mat.slice();

        // Apply the filters
        this.apply_time_filter(min_time, max_time)
        this.apply_frequency_filter(min_freq, max_freq)
    }
}

// let xobj = new XMLHttpRequest();
// xobj.overrideMimeType("application/json");
// xobj.open('GET', './../../../data/dataset.json', true);
// xobj.onreadystatechange = function () {
//         if (xobj.readyState == 4 && xobj.status == "200") {
//             let data = JSON.parse(xobj.responseText)
//             let f = d => d['App Name'] != "Screen off"
//             data = data.filter(f)
//             let acm = new AppChordModel(data)
//             acm.apply_filters(0, Number.MAX_SAFE_INTEGER, 0.2, 0.5)
//             console.log(acm.filtered_adj_mat)
//         }
// };
// xobj.send(null);