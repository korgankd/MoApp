angular.module('starter.services', [])

.service('googleService', ['$http', '$q', function ($http, $q) {

    var deferred = $q.defer();
    this.googleApiClientReady = function () {
        gapi.client.setApiKey('AIzaSyC-cxUvi0ludOZWC5rQBbVnRTwyDH89674');
        gapi.client.load('youtube', 'v3', function() {
            var request = gapi.client.youtube.playlistItems.list({
                part: 'snippet',
                playlistId: 'PLila01eYiSBjOtR8oqXkY0i5c1QS6k2Mu',
                maxResults: 8
            });
            request.execute(function(response) {
                deferred.resolve(response.result);
            });
        });
        return deferred.promise;
    };
}]);
