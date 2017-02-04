angular.module('starter.controllers', ['ionic.cloud'])

.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $window) {

  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  $scope.loginData = {};
  $scope.user = {};

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  console.log($scope);

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.doLogin = function() {
    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.login('basic', details).then(function() {
      $scope.modal.hide();
      usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
        $scope.user = USER;
        $scope.user.email = $ionicUser.details.email;
        alert("Login Successful.");
        console.log($scope.user);
      });

    }, function(err) {
      for (var e of err.details) {
        alert(e);
      }
    });
  };

  $scope.doRegister = function() {
    if($ionicAuth.isAuthenticated()) {
      $ionicAuth.logout();
    }

    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.signup(details).then(function(){
      alert("Signup Success! " + details.email);
      $scope.doLogin();
    }, function(err) {
      for (var e of err.details) {
        if (e === 'conflict_email') {
          alert('A user has already signed up with the supplied email');
        } else if(e === 'required_password') {
          alert('Missing password field');
        } else if(e === 'required_email') {
          alert('Missing email field');
        } else if(e === 'invalid_email') {
          alert('The email did not pass validation.');
        } else {
          alert(e);
        }
      }
    });
  };
})

.controller('ProfileCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $window) {

  $scope.user = {};
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  $scope.userData = {};
  var feedback = function (res) {
    if (res.success === true) {
      if($ionicAuth.isAuthenticated()) {
        var images = $scope.user.image;
        if(images == undefined) {
          images = [];
        }
        images.push(res.data.link);
        $scope.user.image = images;
        usersDB.update({id: $ionicUser.id, image: images});
        alert("Upload Successful.");
      } else {
        alert("You must login to upload a picture.");
      } 
    }
  };

  new Imgur({
    clientid: 'cc86a8de0e7c459',
    callback: feedback
  });

  $scope.$on('$ionicView.enter', function(e) {
    usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
      $scope.user = USER;
      $scope.user.email = $ionicUser.details.email;
    });
  });

  angular.element(document).ready(function () {
    usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
      $scope.user = USER;
      $scope.user.email = $ionicUser.details.email;
    });
  });

  $ionicModal.fromTemplateUrl('templates/editprofile.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.editprofile = function() {
    $scope.modal.show();
  };

  $scope.closeEdit = function() {
    $scope.modal.hide();
  };

  $scope.checkAuth = function() {
    alert($ionicAuth.isAuthenticated() + " " + $ionicUser.details.name);
  };

  $scope.saveData = function() {
    if($ionicAuth.isAuthenticated()) {
      var vid;
      var images = $scope.user.image;
      var videos = $scope.user.video;
      if(images == undefined) {
        images = [];
      }
      if(videos == undefined) {
        videos = [];
      }
      var upadateData = {id: $ionicUser.id, complete: true};
      if($scope.userData.username != undefined) {
        upadateData.username = $scope.userData.username;
        $scope.user.username = $scope.userData.username;
      }
      if($scope.userData.name != undefined) {
        upadateData.name = $scope.userData.name;
        $scope.user.name = $scope.userData.name;
      }
      if($scope.userData.location != undefined) {
        upadateData.location = $scope.userData.location;
        $scope.user.location = $scope.userData.location;
      }
      if($scope.userData.description != undefined) {
        upadateData.description = $scope.userData.description;
        $scope.user.description = $scope.userData.description;
      }
      if($scope.userData.video != undefined) {
        // if($scope.user.video.indexOf($scope.userData.video) >= 0) {
        //   alert("Cannot add the same video twice.");
        // } else {
          vid = $scope.userData.video.replace("watch?v=", "v/");
          videos.push(vid);
          upadateData.video = videos;
          $scope.user.video = upadateData.video;
        //}
      }
      $scope.modal.hide();
      usersDB.update(upadateData);
    } else {
      alert("You must be signed in to do that.");
    }
  };

  $scope.logout = function() {
    $ionicAuth.logout();
    $scope.user = {name:"", username:"", email:"", description:"", location:"", image:""};
    alert("Successfully logged out.");
  };
})

.controller('AccountsCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser) {
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');

  $scope.$on('$ionicView.enter', function(e) {
    usersDB.findAll({complete: true}).fetch().subscribe(function(msg) {
      $scope.accounts = msg;
      console.log("$scope.accounts");
      console.log($scope.accounts);
      console.log($ionicUser);
    });
  });
});