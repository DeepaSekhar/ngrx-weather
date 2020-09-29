import { Action } from '@ngrx/store';
import { LocationData } from '../models/location-data/location-data'

export enum LocationActionTypes {
  LoadLocations = '[Location] Load Locations',
  LocationError = '[Home Page]Location Error'
}

export class LocationAction implements Action {
  type: string;
  payload: {
    locationData: LocationData;
    error: string;
  }
}
export class LoadLocations implements Action {
  readonly type = LocationActionTypes.LoadLocations;
  constructor(readonly payload: { locationData: LocationData }) {

  }
}
export class LocationError implements Action {
  readonly type = LocationActionTypes.LocationError;
  constructor(readonly payload: { error: string }) { }
}



export type LocationActions = LoadLocations | LocationError;
