/*
 * AppChord data structure
 * Since the AppChord can be seen as a graph, an adjacency matrix is built.
 * The object also contains several attributes that avoid to repeat heavy
 * calculation on the whole dataset
 */
class AppChordModel {
    constructor(data) {
        this.build_apps_info(data);
        // Apps info need to be constructed before
        this.build_adjacency_mat(data);

        this.filtered_apps = this.apps.slice();
        this.filtered_apps_time = this.apps_time.slice();
        this.filtered_cumul_time = this.cumul_time;
        this.filtered_n_switches = this.n_switches.slice();
        this.filtered_adj_mat = this.adj_mat.slice();
    }

    build_apps_info(data) {
        this.apps = new Set();
        for (let d of data)
            this.apps.add(d['App Name']);
        this.apps = Array.from(this.apps);

        this.apps_time = new Array(this.apps.length).fill(0);
        this.cumul_time = 0;
        for (let d of data) {
            var app_idx = this.get_app_index(d['App Name'])
            this.apps_time[app_idx] += d['Duration'];
            this.cumul_time += d['Duration'];
        }

        for (let i in this.apps_time)
            this.apps_time[i] = this.apps_time[i] / this.cumul_time
    }

    build_adjacency_mat(data) {
        // Extract users
        var users = new Set();
        for (let d of data)
            users.add(d['User_ID'])

        // Build the matrix
        this.adj_mat = new Array(this.apps.length).fill(0)
                           .map(d => {return new Array(this.apps.length).fill(0)})

        // Fill the matrix with each user sequence
        this.n_switches = new Array(this.apps.length).fill(0);
        for (let uid of users) {
            // Build the user sequence
            var f_data = data.filter(d => d['User_ID'] == uid)
                             .sort(function(a, b) { return a.Time - b.Time; });
            var mem = undefined;
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

        this.remove_by_switches(this.filtered_apps, this.filtered_apps_time,
                                this.filtered_cumul_time, this.filtered_n_switches,
                                this.filtered_adj_mat)

        // Normalize the matrix
        for (let line in this.adj_mat)
            for (let col in this.adj_mat[line])
                this.adj_mat[line][col] = this.adj_mat[line][col] / this.n_switches[line]
    }

    get_app_index(app_name) {
        return this.apps.indexOf(app_name)
    }

    remove_by_switches(app, app_time, c_time, n_switch, adj_mat) {
        var to_rem = []
        for (let i in this.filtered_n_switches)
            if (this.filtered_n_switches[i] == 0)
                to_rem.push(i);
        to_rem.sort(function(a, b) { return b - a; })

        // TODO
    }

    apply_time_filter(min_time, max_time=Number.MAX_SAFE_INTEGER) {
        // Filter apps
        var abs_time = this.apps_time.map(d => {return Math.round(this.cumul_time*d); })
        var to_rem = []
        for (let i in abs_time)
            if (abs_time[i] < min_time || abs_time[i] > max_time)
                to_rem.push(i);
        to_rem.sort(function(a, b) { return b - a; })

        // Remove apps filtered from attributes
        for (let i of to_rem) {
            this.filtered_cumul_time -= abs_time[i]
            this.filtered_apps.splice(i, 1)
            this.filtered_apps_time.splice(i, 1)

            this.filtered_n_switches.splice(i, 1)
            this.filtered_adj_mat.splice(i, 1)
            for (let j in this.filtered_adj_mat)
                this.filtered_adj_mat[j].splice(i, 1)
        }

        // Update n_switches
        this.filtered_n_switches = this.filtered_n_switches.map(
            function(d, i) {
                return Math.round(d * this.filtered_adj_mat[i].reduce(function(a, b) {return a + b}))
            }, this);

        // It is useless to keep apps with 0 switches
        this.remove_by_switches(this.apps, this.apps_time, this.cumul_time, this.n_switches, this.adj_mat)
        
    }

    apply_frequency_filter(min_freq, max_freq=1) {

    }

    apply_filters(min_time=0, max_time=Number.MAX_SAFE_INTEGER, min_freq=0, max_freq=1) {
        this.filtered_apps = this.apps.slice();
        this.filtered_apps_time = this.apps_time.slice();
        this.filtered_cumul_time = this.cumul_time;
        this.filtered_n_switches = this.n_switches.slice();
        this.filtered_adj_mat = this.adj_mat.slice();

        this.apply_time_filter(min_time, max_time)
        this.apply_frequency_filter(min_freq, max_freq)
    }
}

var xobj = new XMLHttpRequest();
xobj.overrideMimeType("application/json");
xobj.open('GET', './../../../data/dataset.json', true);
xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            var data = JSON.parse(xobj.responseText)
            var f = d => d['App Name'] != "Screen off"
            data = data.filter(f)
            var acm = new AppChordModel(data)
            acm.apply_filters(0, 1, 0, 1)
        }
};
xobj.send(null);