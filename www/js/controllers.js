angular.module('starter.controllers', ['ionic.cloud'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $window) {

  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});


  // Form data for the login modal
  $scope.loginData = {};
  $scope.user = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  console.log($scope);

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.login('basic', details).then(function() {
      alert("Login Successful.");
      $scope.modal.hide();
      console.log($ionicUser);
      usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
        $scope.user = USER;
        $scope.user.email = $ionicUser.details.email;
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

  angular.element(document).ready(function () {
    usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
      $scope.user = USER;
      $scope.user.email = $ionicUser.details.email;
    });
  });

  $scope.checkAuth = function() {
    alert($ionicAuth.isAuthenticated() + " " + $ionicUser.details.name);

    // usersDB.update({
    //   id: "08dab02f-bf02-43af-bb43-fb550a91771d",
    //   description: "New description of korgankd using update function."
    // });
    // usersDB.find({id: "08dab02f-bf02-43af-bb43-fb550a91771d"}).fetch().subscribe(function(msg) {
    //   console.log(msg);
    // });
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
      if($scope.userData.image != undefined) {
        // if($scope.user.image.indexOf($scope.userData.image) >= 0) {
        //   alert("Cannot add the same image twice.");
        // } else {
          images.push($scope.userData.image);
          upadateData.image = images;
          $scope.user.image = upadateData.image;
        //}
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

  usersDB.findAll({complete: true}).fetch().subscribe(function(msg) {
    $scope.accounts = msg;
    console.log("$scope.accounts");
    console.log($scope.accounts);
    console.log($ionicUser);
  });
});