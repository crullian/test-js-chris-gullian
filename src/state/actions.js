import fetch from 'fetch-jsonp'
import moment from 'moment'

export function getPopularMovies () {
  return dispatch => {
    const fourStarUrl = 'https://itunes.apple.com/search?country=us&media=movie&entity=movie&limit=100&attribute=ratingIndex&term=4'
    const fiveStarUrl = 'https://itunes.apple.com/search?country=us&media=movie&entity=movie&limit=100&attribute=ratingIndex&term=5'
    const req1 = fetch(fourStarUrl)
    const req2 = fetch(fiveStarUrl)
    const compare = (a, b) => {
      let a_trackName = a.trackName.replace('The ', '')
      let b_trackName = b.trackName.replace('The ', '')
      if (a.releaseYear < b.releaseYear) {
        return -1;
      } else if (a.releaseYear > b.releaseYear) {
        return 1;
      }
      if (a_trackName < b_trackName) {
        return -1;
      } else if (a_trackName > b_trackName) {
        return 1;
      } else {
        return 0;
      }
    }

    return Promise.all([req1, req2])
      .then(responses => responses.map(res => res.json()))
      .then(jsonPromises => Promise.all(jsonPromises))
      .then(jsonResponses => {
        //
        // jsonResponses contains the results of two API requests
        //

        //
        // 1. combine the results of these requests
        // 2. sort the results FIRST by year THEN by title (trackName)
        // 3. each movie object in the results needs a releaseYear attribute added
        //    this is used in src/components/movies-list.js line 26
        //

        // Lets build a new array of the results data.
        const jsonResultSet = jsonResponses[0].results.concat(jsonResponses[1].results)

        // This maps a new year property on each entry derived from 'releaseDate' time stamp.
        jsonResultSet.map(entry => {
          return entry['releaseYear'] = moment(entry['releaseDate']).format('YYYY')
        });

        // Here we set our final results array by sorting our results data (if we have it!)
        // using our custom compare function which sorts first by year, then by title.
        const combinedResults = jsonResultSet ? jsonResultSet.sort(compare) : []

        return dispatch({
          type: 'GET_MOVIES_SUCCESS',
          movies: combinedResults
        })
      })
  }
}


