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
        $window.location.reload();
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

  var months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  $scope.user = {};
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');
  $scope.userData = {};

  $scope.$on('$ionicView.enter', function(e) {
    if($ionicAuth.isAuthenticated()) {
      usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
        $scope.user = USER;
        $scope.user.email = $ionicUser.details.email;
      }); 
    }
  });

  angular.element(document).ready(function() {
    if($ionicAuth.isAuthenticated()) {
      usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
        $scope.user = USER;
        $scope.user.email = $ionicUser.details.email;
      }); 
    }
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

  $ionicModal.fromTemplateUrl('templates/editcalendar.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal4 = modal;
  });

  $scope.doRefresh = function() {
    $window.location.reload();
    $scope.$broadcast('scroll.refreshComplete');
  };

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
    //highlight shit on the list... not very efficient, fix later
    var dates = $scope.user.availableDates;
    console.log(dates);
    for(var i = 0; i < dates.length; i++) {
      var m = dates[i][0] + dates[i][1];
      console.log(m);
      var day = dates[i][2] + dates[i][3];
      console.log(day);
      var month = document.getElementById(months[+m - 1]);
      month = month.getElementsByTagName("td");
      for(var j = 0; j < month.length; j++) {
        if(+angular.element(month[j]).text() == +day){
          console.log("found date: " + m + " " + day);
          month[j].classList.add("highlight");
        }
      }
    }
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
    for(var i = 0; i < divs.length; i++){
      divs[i].hidden = true;
    }
    document.getElementById(month).hidden = false;
  };

  $scope.clickDate = function($event) {
    var day = angular.element($event.currentTarget).text();
    var month = 1 + months.indexOf($event.currentTarget.parentElement.parentElement.parentElement.parentElement.id);
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    if($event.currentTarget.classList.contains("highlight")) {
      $event.currentTarget.classList.remove("highlight");
      var index = $scope.user.availableDates.indexOf(month + day);
      if(index > -1) {
        $scope.user.availableDates.splice(index, 1);
        console.log($scope.user.availableDates);
      }
    }
    else{
      $event.currentTarget.classList.add("highlight");
      $scope.user.availableDates.push(month + day);
      console.log($scope.user.availableDates);
    }
  };

  $scope.saveCalendar = function() {
    if($ionicAuth.isAuthenticated()) {
      var upadateData = {id: $ionicUser.id, availableDates: $scope.user.availableDates};
      usersDB.update(upadateData);
      alert("Availability Saved Successfully.");
      $scope.modal4.hide();
    } else {
      alert("You must be signed in to do that.");
    }
  };

  $scope.saveData = function() {
    if($ionicAuth.isAuthenticated()) {
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
        alert("Successfully added image URL.");
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

  };

  $scope.review = function() {
    console.log($scope.user);
  };

  $scope.logout = function() {
    $ionicAuth.logout();
    $scope.user = {name:"", username:"", email:"", description:"", location:"", image:""};
    alert("Successfully logged out.");
    $window.location.reload();
  };
})

.controller('AccountsCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser) {

  var months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
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

  $ionicModal.fromTemplateUrl('templates/calendar.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal5 = modal;
  });

  $scope.goToMonth = function(month) {
    var divs = document.getElementsByClassName("month");
    for(var i = 0; i < divs.length; i++){
      divs[i].hidden = true;
    }
    document.getElementById(month).hidden = false;
  };

  $scope.checkAvailability = function(id) {
    $scope.modal5.show();
    // find account object with this id
    var account;
    for(var i = 0; i < $scope.accounts.length; i++) {
      if($scope.accounts[i].id == id) {
        account = $scope.accounts[i];
      }
    }
    // highlight dates
    if(account.availableDates != undefined) {
      var dates = account.availableDates;
      console.log(dates);
      for(var i = 0; i < dates.length; i++) {
        var m = dates[i][0] + dates[i][1];
        console.log(m);
        var day = dates[i][2] + dates[i][3];
        console.log(day);
        var month = document.getElementById(months[+m - 1]);
        month = month.getElementsByTagName("td");
        for(var j = 0; j < month.length; j++) {
          if(+angular.element(month[j]).text() == +day){
            console.log("found date: " + m + " " + day);
            month[j].classList.add("highlight");
          }
        }
      }
    }
  };

  $scope.closeCalendar = function() {
    //clear all highlighted dates from modal before hiding
    for(var i = 0; i < months.length; i++) {
      var month = document.getElementById(months[i]);
      if (month != null) {
        month = month.getElementsByTagName("td");
        for(var j = 0; j < month.length; j++) {
          if(month[j].classList.contains("highlight")){
            month[j].classList.remove("highlight");
          }
        }
      }
    }
    $scope.modal5.hide();
  };
});