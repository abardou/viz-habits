# VizThat

## Requirements
### Python
* `pymongo`
* `pythondns`

## Data format
Our data will be stored in a MongoDB database (see [this file](credentials) for credentials). We detail here, for each collection, the fields of a document.

### Activity
The Activity collection will store the list of apps used by the user, at a specific date, for a specific duration. Data is represented with the following fields:
* `user_id` : id of the user
* `app_name` : the app name
* `date` : the date and time at starting of the app
* `duration` : the duration of app usage

## Sources
Energy :  
    - smartphone users & smartphone penetration : https://www.bankmycell.com/blog/how-many-phones-are-in-the-world  
    - % of smartphones by brand by country : https://gs.statcounter.com/vendor-market-share/mobile/worldwide  
    - battery capacity of smartphones : https://www.androidauthority.com/smartphone-battery-capacity-887305/  
    
Economy :  
    - Electricity pricing by country : https://en.wikipedia.org/wiki/Electricity_pricing  
    - Voltage by country : https://www.worldstandards.eu/electricity/plug-voltage-by-country/  
    

