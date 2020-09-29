import { Component, OnInit } from '@angular/core';
import { map, startWith, take } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { WeatherService } from '../services/weather.service';
import { WeatherData } from '../models/weather-data/weather-data';
import { CurrentConditionsComponent } from '../cards/current-conditions/current-conditions.component';
import { WeatherDiscussionComponent } from '../cards/weather-discussion/weather-discussion.component';
import { WeeklyForecastComponent } from '../cards/weekly-forecast/weekly-forecast.component';
import { HourlyForecastComponent } from '../cards/hourly-forecast/hourly-forecast.component';
import { AboutDesktopComponent } from '../cards/about-desktop/about-desktop.component';
import { AboutMobileComponent } from '../cards/about-mobile/about-mobile.component';
import { LocationData } from '../models/location-data/location-data';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as USCities from '../../assets/us_cities.json';
import { City } from '../models/city/city';
import { Store, select } from '@ngrx/store'
import { AppState, selectError } from '../reducers'
import { LoadLocations } from './location.actions'
import { LoadWeather } from './weather.actions';


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  weatherData: WeatherData;
  lat: string;
  long: string;
  cardsDesktop = [];
  cardsMobile = [];
  displayValues = false;
  spinnerColor = 'primary';
  spinnerSize = 8;
  locationData: LocationData = new LocationData();
  citiesCtrl = new FormControl();
  filteredCities: Observable<City[]>;
  cities = [];
  selectedLocation = '';
  error$: Observable<any>

  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return this.cardsMobile;
      } else {
        return this.cardsDesktop;
      }
    })
  );

  constructor(private breakpointObserver: BreakpointObserver,
    public weatherService: WeatherService,
    private store: Store<AppState>) {
    // desktop view
    this.cardsDesktop = [
      {
        title: 'Current Conditions',
        cols: 1,
        rows: 1,
        component: CurrentConditionsComponent
      },
      {
        title: 'Hourly Forecast',
        cols: 1,
        rows: 1,
        component: HourlyForecastComponent
      },
      {
        title: 'Weather Discussion',
        cols: 1,
        rows: 2,
        component: WeatherDiscussionComponent
      },
      {
        title: 'Weekly Forecast',
        cols: 2,
        rows: 1,
        component: WeeklyForecastComponent
      },
      {
        title: 'About',
        cols: 3,
        rows: 1,
        component: AboutDesktopComponent
      }
    ];

    // Mobile View
    this.cardsMobile = [
      {
        title: 'Current Conditions',
        cols: 3,
        rows: 1,
        component: CurrentConditionsComponent
      },
      {
        title: 'Hourly Forecast',
        cols: 3,
        rows: 1,
        component: HourlyForecastComponent
      },
      {
        title: 'Weather Discussion',
        cols: 3,
        rows: 2,
        component: WeatherDiscussionComponent
      },
      {
        title: 'Weekly Forecast',
        cols: 3,
        rows: 1,
        component: WeeklyForecastComponent
      },
      {
        title: 'About',
        cols: 3,
        rows: 2,
        component: AboutMobileComponent
      }
    ];

    // push a value to the list of locations so the user can go back to where they started
    const homeCity: City = {
      capital: '',
      state: '',
      latitude: '',
      longitude: '',
      combinedName: '(your location)'
    };
    this.cities.push(homeCity);

    // read in file of US capital citys for selection
    // source https://gist.github.com/jpriebe/d62a45e29f24e843c974
    const citiesJSON = JSON.stringify(USCities);
    // console.log("cities", citiesJSON)
    const parsedCities = JSON.parse(citiesJSON);
    // console.log("parsedCities", parsedCities)
    parsedCities.default.forEach((parsedCity) => {
      const city: City = {
        capital: parsedCity.capital,
        state: parsedCity.abbr,
        latitude: parsedCity.lat,
        longitude: parsedCity.long,
        combinedName: parsedCity.capital + ', ' + parsedCity.abbr
      };
      this.cities.push(city);
    });

    this.filteredCities = this.citiesCtrl.valueChanges
      .pipe(
        startWith(''),
        map(city => city ? this._filterCities(city) : this.cities.slice())
      );
  }

  private _filterCities(value: string): City[] {
    const filterValue = value.toLowerCase();

    return this.cities.filter(city => city.capital.toLowerCase().indexOf(filterValue) === 0);
  }

  ngOnInit(): void {
    this.error$ = this.store.pipe(select(selectError));
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        const coordPosition = {
          latitude: 41.14558,
          longitude: -104.802040
        }

        this.savePosition(coordPosition);
      });
    } catch (error) {
      alert('Browser does not support location services');
    }
  }

  savePosition(position) {
    this.locationData.latitude = position.latitude.toFixed(4).toString();
    console.log("latitude", this.locationData.latitude);
    this.locationData.longitude = position.longitude.toFixed(4).toString();
    console.log("longitude", this.locationData.longitude);
    for (const city of this.cities) {
      if (city.combinedName === '(your location)') {
        city.latitude = this.locationData.latitude;
        city.longitude = this.locationData.longitude;
      }
    }
    this.store.dispatch(new LoadLocations({ locationData: this.locationData }))

    // this.weatherService.getWeather(this.locationData)
    //   .pipe(take(1))
    //   .subscribe(weather => this.weatherData = weather);
  }

  onSelectionChanged(event: MatAutocompleteSelectedEvent) {
    console.log("event", event)
    for (const city of this.cities) {
      if (city.combinedName === event.option.value) {

        const latitude = parseFloat(city.latitude)
        console.log("onselection latitude", latitude);
        const longitude = parseFloat(city.longitude)
        console.log("onselection longitude", longitude)
        console.log("location Data", this.locationData)
        this.locationData = new LocationData()
        this.locationData.latitude = latitude.toFixed(4).toString()

        this.locationData.longitude = longitude.toFixed(4).toString()
        this.store.dispatch(new LoadWeather({ weatherData: null }))
        this.store.dispatch(new LoadLocations({ locationData: this.locationData }))

        // this.weatherData = null;
        // this.weatherService.getWeather(this.locationData)
        //   .pipe(take(1))
        //   .subscribe(weather => this.weatherData = weather);

        break;
      }
    }
  }
}
