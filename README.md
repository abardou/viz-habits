# VizThat

## Participants 
* Hugo Polloli
* Tristan Syrzisko
* Anthony Bardou
* Théo Rabut

## Description

This projet has for purpose to complete existing visualisations of users habits on their smartphones. The idea behind this project is based on a fact : we didn't find any visualisations of what we usually do after looking this application or this one.  
We propose two visualisations for differents purpose :
* The Force Graph, it represents what the user usually do after using a specific application.
* The Dendogram, it represents all sequences encountered between center of graph (Screen ON), and leaves (Screen OFF).

We use a lot our smartphone so we decided to work on how we can effectively filter our visualisations to be more user friendly.

Thoose visualisations are designed to be used by curious individuals or expert who needs a visual representation of a group (aggregated data).


## Requirements

### Preprocessing 
* `python 3`
* `pymongo`
* `pythondns`


### Website
* `node.js`
* `vuetify.js`
* `D3.js`


## Sources 
### Data
* AppUsage (PlayStore). Phone application based on tracking users activities (data can be exported in csv).
* Google Localisation. Can be activated or not (data can be exported).

### Inspiration
* AppUsage offers visualisations based on the same data we used. 

## How can I run this on my machine ? 
* git clone repository at https://github.com/abardou/viz-habits.git
* cd viz-site
* npm install
* npm run serve


