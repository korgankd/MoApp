angular.module('starter.controllers', ['ionic.cloud'])

.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $window, $ionicLoading) {

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

  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  $scope.login = function() {
    $scope.modal.show();
  };

  $scope.doLogin = function() {
    if($ionicAuth.isAuthenticated()) {
      $ionicAuth.logout();
    }
    $scope.show();
    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.login('basic', details).then(function() {
      $scope.modal.hide();
      usersDB.find({id:$ionicUser.id}).fetch().subscribe(function(USER) {
        $scope.user = USER;
        $scope.user.email = $ionicUser.details.email;
        alert("Login Successful.");
        $window.location.reload();
      });
    }, function(err) {
      console.log(err);
    });
  };

  $scope.doRegister = function() {
    if($ionicAuth.isAuthenticated()) {
      $ionicAuth.logout();
    }
    var details = {"email": $scope.loginData.email, "password": $scope.loginData.password};
    $ionicAuth.signup(details).then(function() {
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

  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    });
  };
})

.controller('ProfileCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $window, $compile, $ionicLoading) {

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
      $scope.doRefresh();
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
    $scope.editCalendarModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/viewimage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.viewImageModal = modal;
  });

  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    });
  };

  $scope.showImage = function(imgUrl) {
    $scope.imageSrc = imgUrl;
    $scope.viewImageModal.show();
  };

  $scope.doRefresh = function() {
    var imgs = [];
    var vids = [];
    if($scope.user.image) {
      imgs = $scope.user.image;
      var displayedImages = document.getElementsByClassName("pics");
      if(displayedImages) { //if there are already pictures on page
        var displayedImageURLs = [];
        for (var i = 0; i < displayedImages.length; i++){
          displayedImageURLs[i] = displayedImages[i].src;
        }
        for (var i = 0; i < imgs.length; i++) {
          if(displayedImageURLs.indexOf(imgs[i]) < 0) {  //imgs[i] is not found
            $scope.addImageElement(imgs[i]);
          }
        }
        for (var i = displayedImageURLs.length-1; i >=0; i--) {
          if(imgs.indexOf(displayedImageURLs[i]) < 0) { //img displayed not in array
            displayedImages[i].parentElement.removeChild(displayedImages[i]);
          }
        }
      } else {
        for (var i = 0; i < imgs.length; i++) {
          $scope.addImageElement(imgs[i]);
        }
      }
    } else { //$scope.user.image is empty, remove image elements on page
      var displayedImages = document.getElementsByClassName("pics");
      if(displayedImages) {
        //removing items, count backwards from the top
        for(var i = displayedImages.length-1; i >= 0; i--) {
          displayedImages[i].parentElement.removeChild(displayedImages[i]);
        }
      }
    }
    if($scope.user.video) {
      vids = $scope.user.video;
      var displayedVideos = document.getElementsByClassName("vids");
      if(displayedVideos) { //page already contains at least one video
        var displayedVideoURLs = [];
        for (var i = 0; i < displayedVideos.length; i++){ //change array of elemetnts
          displayedVideoURLs[i] = displayedVideos[i].src; //to array of vid urls
        }
        for (var i = 0; i < vids.length; i++) {
          if(displayedVideoURLs.indexOf(vids[i]) < 0){  //vids[i] is not found on page
            $scope.addVideoElement(vids[i]);
          }
        }
        for (var i = displayedVideoURLs.length-1; i >=0; i--) {
          if(vids.indexOf(displayedVideoURLs[i]) < 0) { //vid displayed not in array
            displayedVideos[i].parentElement.removeChild(displayedVideos[i]);
          }
        }
      } else {
        for (var i = 0; i < vids.length; i++) { 
          $scope.addVideoElement(vids[i]);
        }
      }
    } else { //$scope.user.video is empty, remove image elements on page
      var displayedVideos = document.getElementsByClassName("vids");
      if(displayedVideos) {
        for(var i = displayedVideos.length-1; i >= 0; i--) {
          displayedVideos[i].parentElement.removeChild(displayedVideos[i]);
        }
      }
    }
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.addImageElement = function(imgUrl) {
    var td = document.createElement("td");
    var html = "<img src='"+imgUrl+"' style='width:200px; height:200px;' ng-click='showImage(\""+imgUrl+"\")' />";
    var newImgElement = document.createElement("img");
    newImgElement.src = imgUrl;
    newImgElement.style = "width:200px; height:200px;";
    document.getElementById("picsRow").appendChild(td);
    angular.element(td).append($compile(html)($scope));
  };

  $scope.addVideoElement = function(vidUrl) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    var newVidElement = document.createElement("iframe");
    newVidElement.src = vidUrl;
    td.appendChild(newVidElement);
    document.getElementById("vidsTable").appendChild(tr);
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
          $scope.addImageElement(res.data.link);
          alert("Upload Successful.");
          $scope.hide();
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
    $scope.editCalendarModal.show();
    //highlight shit on the list... not very efficient, fix later
    var dates = $scope.user.availableDates;
    console.log(dates);
    for(var i = 0; i < dates.length; i++) {
      var m = dates[i][0] + dates[i][1]; //create month/day var for number on dates array
      console.log(m);
      var day = dates[i][2] + dates[i][3];
      console.log(day);
      var month = document.getElementById(months[+m - 1]);
      month = month.getElementsByTagName("td");
      for(var j = 0; j < month.length; j++) {
        if(+angular.element(month[j]).text() == +day){
          console.log("found date: " + m + " " + day);
          console.log(month[j]);
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
    $scope.editCalendarModal.hide();
  };

  $scope.closeImage = function() {
    $scope.viewImageModal.hide();
  };

  $scope.hide = function(){
    $ionicLoading.hide();
  };

  $scope.checkAuth = function() {
    alert($ionicAuth.isAuthenticated() + " " + $ionicUser.details.email);
  };

  $scope.goToMonth = function(month) {
    var calendar = document.getElementById("calendar");
    var divs = calendar.getElementsByClassName("month");
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
      $scope.editCalendarModal.hide();
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
    if($ionicAuth.isAuthenticated() && $scope.userData.imageUrl) {
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
        $scope.addImageElement($scope.userData.imageUrl);
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
      if($scope.validateVideoUrl()) {
        vid = $scope.validate.url;
        //if url is not contained in array, add it and update db
        if($scope.user.video.indexOf(vid) >= 0) {
          alert("Cannot add the same video twice.");
        } else {
          videos.push(vid);
          $scope.user.video = videos;
          usersDB.update({id: $ionicUser.id, video: videos});
          $scope.addVideoElement(vid);
          alert("Successfully added video URL.");
          $scope.closeAddVideo(vid);
          console.log($scope.user.video);
        }
      }
    } else {
      console.log($scope.validate.url);
    }
  };

  $scope.validateVideoUrl = function() {
    var url = $scope.userData.videoUrl;
    var newUrl;
    var textCL = document.getElementById("validText").classList;
    if (url) {
      var regExpYT = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var regExpVim = /^(http\:\/\/|https\:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)$/;
      var matchYT = url.match(regExpYT);
      var matchVIM = url.match(regExpVim);
      if (matchYT && matchYT[2].length == 11) {
        // Do anything for being valid
        // if need to change the url to embed url then use below line
        newUrl = 'https://www.youtube.com/embed/' + matchYT[2];
        $scope.validate = {text:"Valid YouTube URL.",check:true, url: newUrl};
        textCL.add("green");
        textCL.toggle("red", textCL.contains("red")); // remove if contains red
        return true;
      } else if(matchVIM && matchVIM[4].length == 9) {
        newUrl = 'https://player.vimeo.com/video/' + matchVIM[4];
        $scope.validate = {text:"Valid Vimeo URL.",check:true, url: newUrl};
        textCL.add("green");
        textCL.toggle("red", textCL.contains("red")); // remove if contains red
        return true;
      } else {
        $scope.validate = {text:"Invalid Video URL.",check:false, url: ""};
        textCL.add("red");
        textCL.toggle("green", textCL.contains("green")); // remove if contains green
        return false;
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
    $scope.doRefresh();
  };
})

.controller('AccountsCtrl', function($scope, $ionicModal, $timeout, $ionicDB, $ionicAuth, $ionicUser, $window) {

  var months1 = ["january1","february1","march1","april1","may1","june1","july1","august1","september1","october1","november1","december1"];
  $ionicDB.connect();
  var usersDB = $ionicDB.collection('users');

  $scope.$on('$ionicView.enter', function(e) {
    usersDB.findAll({complete: true}).fetch().subscribe(function(msg) {
      $scope.accounts = msg;
    });
  });

  $ionicModal.fromTemplateUrl('templates/calendar.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.calendarModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/viewimage.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.viewImageModal = modal;
  });

  $scope.showImage = function(imgUrl) {
    $scope.imageSrc = imgUrl;
    $scope.viewImageModal.show();
  };

  $scope.doRefresh = function() {
    usersDB.findAll({complete: true}).fetch().subscribe(function(msg) {
      $scope.accounts = msg;
    });
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.goToMonth = function(month) {
    var calendar = document.getElementById("calendar1");
    var divs = calendar.getElementsByClassName("month");
    for(var i = 0; i < divs.length; i++){
      divs[i].hidden = true;
    }
    document.getElementById(month).hidden = false;
  };

  $scope.checkAvailability = function(id) {
    $scope.calendarModal.show();
    // find account object with this id
    var account;
    for(var i = 0; i < $scope.accounts.length; i++) {
      if($scope.accounts[i].id == id) {
        account = $scope.accounts[i];
      }
    }
    // highlight dates
    if(account.availableDates) {
      var dates = account.availableDates;
      console.log(dates);
      for(var i = 0; i < dates.length; i++) {
        var m = dates[i][0] + dates[i][1];
        var day = dates[i][2] + dates[i][3];
        console.log(months1[+m - 1]);
        var month = document.getElementById(months1[+m - 1]);
        month = month.getElementsByTagName("td");
        for(var j = 0; j < month.length; j++) {
          if(+angular.element(month[j]).text() == +day){
            console.log("found date: " + m + " " + day);
            console.log(month[j]);
            month[j].classList.add("highlight");
          }
        }
      }
    }
  };

  $scope.closeCalendar = function() {
    //clear all highlighted dates from modal before hiding
    for(var i = 0; i < months1.length; i++) {
      var month = document.getElementById(months1[i]);
      if (month != null) {
        month = month.getElementsByTagName("td");
        for(var j = 0; j < month.length; j++) {
          if(month[j].classList.contains("highlight")){
            month[j].classList.remove("highlight");
          }
        }
      }
    }
    $scope.calendarModal.hide();
  };

  $scope.closeImage = function() {
    $scope.viewImageModal.hide();
  };
});