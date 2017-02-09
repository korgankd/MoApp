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

  $scope.months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  $scope.user = {};
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  $scope.userData = {};

  $scope.$on('$ionicView.enter', function(e) {
    usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
      $scope.user = USER;
      $scope.user.email = $ionicUser.details.email;
      console.log($scope.user);
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

  $ionicModal.fromTemplateUrl('templates/addimage.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal2 = modal;
  });

  $ionicModal.fromTemplateUrl('templates/addvideo.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal3 = modal;
  });

  $ionicModal.fromTemplateUrl('templates/calendar.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal4 = modal;
  });

  $scope.addimage = function() {
    if($ionicAuth.isAuthenticated()) { // just double checking...
      $scope.modal2.show();
      var feedback = function (res) {
        if (res.success === true) {
          var images = $scope.user.image;
          if(images == undefined) {
            images = [];
          }
          images.push(res.data.link);
          $scope.user.image = images;
          usersDB.update({id: $ionicUser.id, image: images});
          alert("Upload Successful.");
          $scope.closeAddImage();
        }
      };
      new Imgur({
        clientid: '6d3c420180559db',
        callback: feedback
      });
    } else {
      alert("Log in to add images.");
    }
  };

  $scope.addvideo = function() {
    if($ionicAuth.isAuthenticated()) { // just double checking...
      $scope.modal3.show();
    }
  };

  $scope.editprofile = function() {
    $scope.modal.show();
  };

  $scope.editcalendar = function() {
    $scope.modal4.show();
  };

  $scope.closeAddVideo = function() {
    $scope.modal3.hide();
  };

  $scope.closeAddImage = function() {
    $scope.modal2.hide();
  };

  $scope.closeEdit = function() {
    $scope.modal.hide();
  };

  $scope.closeCalendar = function() {
    $scope.modal4.hide();
  };

  $scope.checkAuth = function() {
    alert($ionicAuth.isAuthenticated() + " " + $ionicUser.details.email);
  };

  $scope.goToMonth = function(month) {
    var divs = document.getElementsByClassName("month");
    console.log(divs);
    for(var i = 0; i < divs.length; i++){
      divs[i].hidden = true;
    }
    document.getElementById(month).hidden = false;
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
      $scope.modal.hide();
      usersDB.update(upadateData);
    } else {
      alert("You must be signed in to do that.");
    }
  };

  $scope.saveImage = function() {
    //if youre signed in and there is text in the imageurl field...
    if($ionicAuth.isAuthenticated() && $scope.userData.imageUrl != undefined) {
      var images = $scope.user.image; //get image array from scope.user
      if(images == undefined) { //create array if undefined
        images = [];
      }
      //if url is not contained in array, add it and update db
      if($scope.user.image.indexOf($scope.userData.imageUrl) >= 0) {
        alert("Cannot add the same image twice.");
      } else {
        images.push($scope.userData.imageUrl);
        $scope.user.image = images;
        usersDB.update({id: $ionicUser.id, image: images});
        alert("Successfully added image URL.")
        $scope.closeAddImage();
        console.log($scope.user.image);
      }
    }
  };

  $scope.saveVideo = function() {
    var vid;
    //if youre signed in and there is text in the videourl field...
    if($ionicAuth.isAuthenticated() && $scope.userData.videoUrl != undefined) {
      var videos = $scope.user.video; //get video array from scope.user
      if(videos == undefined) { //create array if undefined
        videos = [];
      }
      vid = $scope.userData.videoUrl.replace("watch?v=", "embed/");
      //if url is not contained in array, add it and update db
      if($scope.user.video.indexOf(vid) >= 0) {
        alert("Cannot add the same video twice.");
      } else {
        videos.push(vid);
        $scope.user.video = videos;
        usersDB.update({id: $ionicUser.id, video: videos});
        alert("Successfully added video URL.")
        $scope.closeAddVideo();
        console.log($scope.user.video);
      }
    }
  };

  $scope.like = function() {
    alert("like!");
    usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
      $scope.user = USER;
      $scope.user.email = $ionicUser.details.email;
    });
  };

  $scope.review = function() {
    
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