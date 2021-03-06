import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { LoadWeather } from '../weather/weather.actions';
import { map, mergeMap, catchError } from 'rxjs/operators'
import { AppState } from '../reducers'
import { Store } from '@ngrx/store'
import { WeatherService } from '../services/weather.service'
import { LocationActionTypes, LocationError, LoadLocations } from '../weather/location.actions'
import { of } from 'rxjs';




@Injectable()
export class WeatherEffects {
  constructor(private actions$: Actions, private store: Store<AppState>, private weatherService: WeatherService) { }

  @Effect()
  loadLocations$ = this.actions$
    .pipe(
      ofType<LoadLocations>(LocationActionTypes.LoadLocations),

      mergeMap((action) => this.weatherService.getWeather(action.payload.locationData)

        .pipe(
          map(weather => {
            return (new LoadWeather({ weatherData: weather }));
          }),
          catchError((errormessage => of(new LocationError({ error: errormessage }))))
        )


      ))

}
