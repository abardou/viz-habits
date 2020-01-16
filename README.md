# VizHabits

![Alt text](doc/images/teaser.jpg?raw=true "Habits")


## Authors
* Hugo Polloli
* Anthony Bardou
* Tristan Syrzisko
* Théo Rabut

## Description

This projet aims to complete existing visualisations of users smartphones habits. The idea behind this project is based on a fact : we didn't find any visualization able to show us usage profiles based on application switches and sequences of applications.  
We propose two visualisations for two differents purpose :
* A Force Graph, representing which app the user usually go to after using a specific application.
* A Radial Tree (Tidy), representing all sequences started by unlocking the phone (Screen ON) and terminated by locking the phone (Screen OFF).

As our visualizations can be a bit messy when the amount of data to display grows, we decided to work on how we can effectively filter our visualisations to be more user friendly. These filters can also be a great tool to explore different usage profiles by navigating through several dimensions, including time and space.

Those visualizations are designed to be used by curious individuals or experts who need a visual representation of a group (aggregated data).

## Requirements

### Preprocessing
* `pandas`
* `numpy`

### Website
* `node.js` (dev)
* `vuetify.js`
* `D3.js`
* `FullPage.js`

## How can I run this on my machine ?
You can deploy our service on your machine with a few simple steps. Start by typing the following commands :
```
git clone https://github.com/abardou/viz-habits.git
cd viz-habits/viz-site
npm install
npm run serve
```

Then go to http://localhost:8080/ and you should be able to use our service.

## Sources 
### Data
We built our own dataset, using two different tracking services :
* AppUsage (PlayStore) : tracking application able to export in CSV user  activity on her smartphone.
* Google Position History : automatically collected once the GPS is active on an Android smartphone. Data can be exported by Google Takeout.

### Inspiration
* AppUsage offers visualisations based on the same data we used. 
* The Radial Tree we built is based on a design that can be found here : https://blockbuilder.org/mbostock/4063550