import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';

import { WeatherData } from '../models/weather-data/weather-data';
import { WeatherActionTypes, WeatherActions } from '../weather/weather.actions';
import { LocationActionTypes, LocationActions } from '../weather/location.actions';
import { LocationData } from '../models/location-data/location-data';

import { environment } from '../../environments/environment';


export interface WeatherState {
  weatherData: WeatherData | null;

}
const initialWeatherState: WeatherState = {
  weatherData: null
};
export interface LocationState {
  location: LocationData | null
  error: string | null
}
const initialLocationState: LocationState = {
  location: null,
  error: null
}
export interface AppState {
  weather: WeatherState
  location: LocationState
}

//weather reducer
export function weatherReducer(state: WeatherState = initialWeatherState, action: WeatherActions): WeatherState {
  switch (action.type) {
    case WeatherActionTypes.LoadWeather: {
      return {
        weatherData: action.payload.weatherData
      }
    }
    default:
      return state;
  }
}
//locationReducer
export function locationReducer(state: LocationState = initialLocationState, action: LocationActions): LocationState {
  switch (action.type) {
    case LocationActionTypes.LoadLocations:
      return {
        location: action.payload.locationData,
        error: null
      }


    case LocationActionTypes.LocationError:
      return {
        location: null,
        error: action.payload.error
      }

    default:
      return state;
  }
}

export const reducers: ActionReducerMap<AppState> = {
  weather: weatherReducer,
  location: locationReducer

};

export const selectWeather = (state: AppState) => state.weather.weatherData;

export const selectError = (state: AppState) => state.location.error;

export const metaReducers: MetaReducer<any>[] = !environment.production ? [] : [];
