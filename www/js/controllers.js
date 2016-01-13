var widthArr = [60, 40, 50];
var loginUserType;
var TheBranchName;
angular.module('starter.controllers', ['firebase'])

.controller('AuthCtrl', function($scope, $ionicConfig) {

})

// APP
.controller('AppCtrl', function($scope, $location, $ionicConfig, $rootScope, $http, $ionicPopup) {




})

//LOGIN
.controller('LoginCtrl', function($scope, $http, $state, $location) {

	$scope.loginClick= 0;
	$scope.errorLogin=0;

	$scope.updateMe = function() { 
		$scope.loginClick= 1;
		//$location.path( "/app/manageProperty" );
    };
    
    $scope.investMe = function() {
	    $state.go('invest.chooseProperty');
    };

    $scope.userDetail = {};
	
	if(localStorage.getItem("email") != null) {
		$scope.userDetail.email = localStorage.getItem("email");
		$scope.userDetail.password = localStorage.getItem("password");
	}

	$scope.submit = function() {    
	   $http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Login', 
		    method: "POST",
		    data:  {mail:$scope.userDetail.email,
		    	    password:$scope.userDetail.password}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		    
		}).then(function(resp) {
			if(resp.data == "false") {
				$scope.msg = "The Email or Password incorrect";
				$scope.errorLogin=1;
				
				Ionic.io();
				// this will give you a fresh user or the previously saved 'current user'
				var user = Ionic.User.current();
				user.id = Ionic.User.anonymousId();

				//persist the user
				user.save();
			}
			else {
				// kick off the platform web client
				Ionic.io();

				// this will give you a fresh user or the previously saved 'current user'
				var user = Ionic.User.current();

				// if the user doesn't have an id, you'll need to give it one.
				if (!user.id) {
					user.id = Ionic.User.anonymousId();
					// user.id = 'your-custom-user-id';
				}

				user.set('name', resp.data["ClientName"]);
				user.set('userid', resp.data["UserId"]);

				//persist the user
				user.save();
				
				localStorage.setItem("loginUserType", resp.data["Type"]);
				if(resp.data["Type"] == "user") {
					loginUserType = "user";
					localStorage.setItem("id", resp.data["UserId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("isAdmin", resp.data["IsAdmin"]);
					localStorage.setItem("branch", resp.data["BranchId"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
				}
				else {
					user.set('name', resp.data["ClientName"]);
					loginUserType = "client";
					localStorage.setItem("id", resp.data["ClientId"]);
					localStorage.setItem("ClientName", resp.data["ClientName"]);
					localStorage.setItem("email", $scope.userDetail.email);
					localStorage.setItem("password", $scope.userDetail.password);
				}

				console.log(resp.data);					
				$state.go('overview');
			}
		
		}, function(err) {
		    $scope.msg = err;
		    console.error('ERR', err);
		})
    };
})

//ChooseProperty Ctrl - show all marketing properties
.controller('ChoosePropertyCtrl', function($scope, $http, $state, $rootScope, $timeout)  {
    
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Marketing', 
	    method: "GET", 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {

		$scope.properties = [];

		$scope.properties = resp.data;
	
	}, function(err) {
	    console.error('ERR', err);
	});
	
	$scope.chooseMarketingProperty = function(propertyId) {
		console.log("chooseMarketingProperty function " + propertyId);		
		$state.go('tab.propertyDetails');
		$timeout(function() {
	    	var unbind = $rootScope.$broadcast( "propertyId", {marketingPropertyId:propertyId} );
	    });
	};
})

//Chats Ctrl
.controller('ChatsCtrl', function($scope, $state, $firebaseObject ,$firebaseArray, $ionicScrollDelegate, $rootScope ) {



		$scope.branchToChat = function (BranchName) {

		TheBranchName = BranchName;

		console.log(BranchName);

		$state.go('chats');

	}
	





	$scope.chatIsActive = false;

	$scope.myId = localStorage.getItem("id");
	var userId = localStorage.getItem("id");

	var ref = new Firebase("https://updatemeapp.firebaseio.com/messages/" + TheBranchName + "/" + userId);

	ref.on("child_added", function(messageSnapshot) {			 
		var messageData = messageSnapshot.val();
		console.log(messageData);
	});

	$scope.chats = $firebaseArray(ref);

	var username = localStorage.getItem("ClientName");

	$scope.sendChat = function(chat) {

		$scope.chats.$add({
			user: username,
			userid: userId,
	        message: chat.message,
	        client: 'true',
	        timestamp: new Date().getTime()
		});
		chat.message = "";

		$ionicScrollDelegate.scrollBottom();

	}


})

//OverviewProperties Ctrl - logged in user
.controller('OverviewPropertiesCtrl', function($scope, $http, $timeout, $rootScope) {

	 $scope.progress = 0.75;
  
  // Color hex values
  var orange = "#e67e22";
  var red = "#e74c3c";
  var green = "#2ecc71";
  
  // Breakpoints for colors
  var breakToWarning = 0.60;
  var breakToDanger = 0.90;
  
  // Color change
  $scope.$watch('progress', function(){
    if ($scope.progress >= breakToDanger) {
      $scope.barColor = red;
    } else if ($scope.progress < breakToDanger && $scope.progress > breakToWarning) {
      $scope.barColor = orange;
    } else if ($scope.progress < breakToWarning) {
      $scope.barColor = green;
    }
  });
	
	// get properties for 'your properties' section
	var url;
    var id;
    var rndval;
    if(loginUserType == "client") {    	
    	url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage';
    	id = localStorage.getItem('id');
    	$http({
    	    url: url, 
    	    method: "GET",
    	    params:  {index:id}, 
    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    	}).then(function(resp) {

    		$scope.propertyImage = [];

    		$scope.propertyImage = resp.data;
			
    		if(resp.data.length % 2 == 0) {
    			for(var i = 0; i < resp.data.length; i+=2) {
    				rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
    				url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i].FileName;
    				$('#INVESTMENTSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
    				url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i+1].FileName;
    				rndval = 100 - rndval;
    				$('#INVESTMENTSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
    			}
    		} else {
    			url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[0].FileName;
				$('#INVESTMENTSimg').append('<div class="animated fadeInLeft col col-100" style="background-image: url(' +  "'" + url + "'" +');"></div>');
				for(var i = 1; i < resp.data.length; i+=2) {
					rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
					url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i].FileName;
					$('#INVESTMENTSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
					url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i+1].FileName;
					rndval = 100 - rndval;
					$('#INVESTMENTSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
    			}
    		}
    	
    	}, function(err) {
    	    console.error('ERR', err);
    	})
    }
	
	// get properties for 'special deals section'
	if(loginUserType == "client") {    	
		url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getSpecialDealsPropertyImage';
    	id = localStorage.getItem('id');
    	$http({
    	    url: url, 
    	    method: "GET",
    	    params:  {index:id}, 
    	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    	}).then(function(resp) {

    		$scope.specialPropertyImage = [];

    		$scope.specialPropertyImage = resp.data;

    		if(resp.data.length % 2 == 0) {
    			for(var i = 0; i < resp.data.length; i+=2) {
    				rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
    				url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i].FileName;
    				$('#SPECIAL_DEALSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
    				url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i+1].FileName;
    				rndval = 100 - rndval;
    				$('#SPECIAL_DEALSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
    			}
    		} else {
    			url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[0].FileName;
				$('#SPECIAL_DEALSimg').append('<div class="animated fadeInLeft col col-100" style="background-image: url(' +  "'" + url + "'" +');"></div>');
				for(var i = 1; i < resp.data.length; i+=2) {
					rndval = widthArr[Math.floor(Math.random()*widthArr.length)];
					url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i].FileName;
					$('#SPECIAL_DEALSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
					url = 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/uploads/' + resp.data[i+1].FileName;
					rndval = 100 - rndval;
					$('#SPECIAL_DEALSimg').append('<div class="animated fadeInLeft col col-' + rndval + '" style="background-image: url(' +  "'" + url + "'" +');"></div>');
    			}
    		}
    	
    	}, function(err) {
    	    console.error('ERR', err);
    	})
	}
	
	$scope.showDetails = function(propertyId) {
		console.log("showDetails function " + propertyId);
	    $timeout(function() {
	    	var unbind = $rootScope.$broadcast( "showDetails", {PropertyId:propertyId} );
	    });
	}
})

//propertyDetails ctrl
.controller('PropertyDetailsCtrl', function($scope, $http, $rootScope) {
	console.log("PropertyDetailsCtrl");
	
	var propertyId;
	$scope.$on( "showDetails", function(event, data) {	  
		propertyId = data.PropertyId;
		getPropertyImage(propertyId, $scope, $http)
		getPurchaseDetails(propertyId, $scope, $http);
		getClosingDetails(propertyId, $scope, $http);
		getRenovationDetails(propertyId, $scope, $http);
		getLeasingDetails(propertyId, $scope, $http);
		getOccupiedDetails(propertyId, $scope, $http);
		getEvictionDetails(propertyId, $scope, $http);		
	});	
})

.controller('DashCtrl', function($scope) {})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

function getPropertyImage(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getSpesificPropertyImage', 
	    method: "GET",
	    params:  {PropertyId: propertyId, ClientId: localStorage.getItem('id')}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.image = resp.data[0];
			
			console.log($scope.image);
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
	
	$scope.getAllImages = function() {
		console.log("getAllImages");
		$http({
		    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PropertyImage/getAllPropertyImages', 
		    method: "GET",
		    params:  {PropertyId: propertyId, ClientId: localStorage.getItem('id')}, 
		    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		}).then(function(resp) {
			if (resp.data.length != 0) {
				
				$scope.allImages = resp.data;
				
				console.log($scope.allImages);
			} 		
		}, function(err) {
		    console.error('ERR', err);
		})
	}
}

function getPurchaseDetails(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/PurchaseAndSale', 
	    method: "GET",
	    params:  {index: propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.purchaseAndSale = resp.data[0];
			
			$scope.isHasPurchaseFile = $scope.purchaseAndSale['IsHasFile'] == 1 ? true : false;
			$scope.IsBuyerFile = $scope.purchaseAndSale['IsBuyerFile'] == 1 ? true : false;
			$scope.IsSignedDocsFile = $scope.purchaseAndSale['IsSignedDocsFile'] == 1 ? true : false;
			$scope.IsBalanceFile = $scope.purchaseAndSale['IsBalanceFile'] == 1 ? true : false;
			$scope.IsFilesTo = $scope.purchaseAndSale['IsFilesToS‌ignFile'] == 1 ? true : false;
			$scope.showPurchaseNote = $scope.purchaseAndSale['ShowNote'] == 1 ? true : false;
							
		} 		
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getClosingDetails(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Closing', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.closing = resp.data[0];

			$scope.IsClosingHasFile = $scope.closing['IsHasFile'] == 1 ? true : false;
			$scope.IsWalkThroghFile = $scope.closing['IsWalkThroghFile'] == 1 ? true : false;
			$scope.IsInsuranceFile = $scope.closing['IsInsuranceFile'] == 1 ? true : false;
			$scope.IsClosingDocsFile = $scope.closing['IsClosingDocsFile'] == 1 ? true : false;
			$scope.showClosingNote = $scope.closing['ShowNote'] == 1 ? true : false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getRenovationDetails(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Renovation', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			
			$scope.renovation = resp.data[0];
		
			$scope.IsHasRenovationFile = $scope.renovation['IsHasFile'] == 1 ? true : false;
			$scope.IsFundsSentFile = $scope.renovation['IsFundsSentFile'] == 1 ? true : false;
			$scope.IsWorkEstimateFile = $scope.renovation['IsWorkEstimateFile'] == 1 ? true : false;
			$scope.IsPayment1File = $scope.renovation['IsPayment1File'] == 1 ? true : false;
			$scope.IsPayment2File = $scope.renovation['IsPayment2File'] == 1 ? true : false;
			$scope.IsPayment3File = $scope.renovation['IsPayment3File'] == 1 ? true : false;
			$scope.IsCOFOFile = $scope.renovation['IsCOFOFile'] == 1 ? true : false;
			$scope.showRenovationNote = $scope.renovation['ShowNote'] == 1 ? true : false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getLeasingDetails(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Leasing', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.leasing = resp.data[0];
		
			$scope.IsHasLeasingFile = $scope.leasing['IsHasFile'] == 1 ? true : false;
			$scope.IsApplicationFile = $scope.leasing['IsApplicationFile'] == 1 ? true : false;
			$scope.IsLeaseFile = $scope.leasing['IsLeaseFile'] == 1 ? true : false;
			$scope.showLeasingNote = $scope.leasing['ShowNote'] == 1 ? true : false;
		}		
	}, function(err) {
	    console.error('ERR', err);
	})	
}

function getOccupiedDetails(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Occupied', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
		
			$scope.occupied = resp.data[0];
		
			$scope.IsHasOccupiedFile = $scope.occupied['IsHasFile'] == 1 ? true : false;
			$scope.IsMaintanenceFile = $scope.occupied['IsMaintanenceFile'] == 1 ? true : false;
			$scope.showOccupiedNote = $scope.occupied['ShowNote'] == 1 ? true : false;
		}
	}, function(err) {
	    console.error('ERR', err);
	})
}

function getEvictionDetails(propertyId, $scope, $http) {
	$http({
	    url: 'http://ec2-52-32-92-71.us-west-2.compute.amazonaws.com/index.php/api/Eviction', 
	    method: "GET",
	    params:  {index:propertyId}, 
	    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	}).then(function(resp) {
		if (resp.data.length != 0) {
			$scope.eviction = resp.data[0];

			$scope.IsHasEvictionFile = $scope.eviction['IsHasFile'] == 1 ? true : false;
			$scope.showEvictionNote = $scope.eviction['ShowNote'] == 1 ? true : false;
		} 
	}, function(err) {
	    console.error('ERR', err);
	})
}