var userConnectedStatus;
window.fbAsyncInit = function() {
	FB.init({
		appId      : '1647642512158872',
		xfbml      : true,
		version    : 'v2.3'
	});

	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
		if (userConnectedStatus === 'connected') {
			hideNotConnected();
			getUserPicture();
		} else if (userConnectedStatus === 'not_authorized') {
			showUserPopup();
			showNotConnected();
		} else {
			showUserPopup();
			showNotConnected();
		}
	});

	FB.Event.subscribe('auth.login', function(response) {
		userConnectedStatus=response.status;		
	});
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function statusChangeCallback(response) {
	userConnectedStatus=response.status;
}

function checkLoginState() {
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

function makeUserLogin(){
	FB.login(function(response) {
		if (response.status == "connected") {
			FB.api('/me', function(response) {
				console.log('Good to see you, ' + response.name + '.');
			});
			hideNotConnected();
			$("#loginPopup").modal('hide');
			getUserPicture();
		} else {
			showNotConnected();
			console.log('User cancelled login or did not fully authorize.');
		}
	});
}
function makeUserLogout(){
	FB.logout(function(){
		console.log("user logged out successfully...");
		showNotConnected();
		$("#listGroup").hide();
	});
}
function getUserStatus(){
	if(typeof userConnectedStatus != "undefined" && userConnectedStatus == "connected"){
		FB.api("/me/posts",function(response){
			var messages = [];
			var arr = response.data;
			for(var i=0;i<arr.length;i++){
				if(typeof arr[i].message != "undefined"){
					var msgObj = {id: arr[i].id, msg: arr[i].message, score: 0};
					messages.push(msgObj);
				}
			}
			debugger;
			analyzeSentiment(messages);

			$("#statusButton").hide();

			console.log("Exiting getUserStatus method");
		});
	} else {
		showUserPopup();
		showNotConnected();
	}
}
function getUserPicture(){
	FB.api("/me/picture",function(response){
		// console.log(response);
		$("#picture").css({"background":"url('"+response.data.url+"')", 'height': '50px', 'width': '50px'});
		$("#iconPic").hide();
	});
}
function postStatus(){
	var status = $("#inputStatus").val();
	console.log(status);
	
	FB.api('/me/feed', 'post', {message: 'Hello, world!'});
}
function addStatusListItem(message){
	console.log(message);

if(red === true){

	$('.progress').css({'color': 'red'});
}
if(message.score > 0 ){

	$('.progress').css({'color': 'green'});
}




	var listItem ="<div class='listItem'><div class='list-group-item'>"+
	"<div class='row-action-primary'>"+
	"<i class='mdi-editor-mode-comment'></i>"+
	"</div>"+
	"<div class='row-content'>"+
	"<h4 class='list-group-item-heading'>"+message.msg+"</h4>"+
	"<div class='progress'  style='width: " +
	(message.score) +
	"%;'>"+
	"<div class='progress-bar'></div>"+
	"</div>"+
	"</div>"+
	"</div>"+
	"<div class='list-group-separator'></div></div>";
	$("#listGroup").append(listItem);
}
function showUserPopup(){
	$("#loginPopup").modal('show');
}
function showNotConnected(){
	$("#notConnectedButton").show();
	$("#statusButton").hide();
}
function hideNotConnected(){
	$("#notConnectedButton").hide();
	$("#statusButton").show();
}

var red = false;
function analyzeSentiment(messages){
	debugger;
	var globalScores = [];
	// console.log(messages.length);
	for(var i=0;i<messages.length;i++){
		var obj = messages[i].msg.replace(/ /g, "+").replace(/#/g,"");
		// console.log("before ajax: " +messages[i]);
		$.ajax({
			 url: "https://api.idolondemand.com/1/api/sync/analyzesentiment/v1?text="
			+ obj
			+ "&apikey=e3b26b74-6afa-4cf7-add6-cf6bb3dfce08",
			 async:false
		}).done(function(data){
			debugger;
			// console.log("Ajax response received");
			var obj = data;
			// console.log(data);
			var score = obj.aggregate.score;
			if(score < 0){
				score = score+1;
				red = true;
			}
			score = score*100;
			// if(obj.aggregate.sentiment === "positive"){   
			// 	score = obj.positive[0].score * 100;
			// }else if(obj.aggregate.sentiment === "negative"){
			// 	score = (obj.negative[0].score + 1)*100;
			// }
			// obj.score = score;
			console.log("async score: " + score);
			globalScores.push(score);
		});
	}
	for(var i=0;i<messages.length;i++){
		console.log("globalScores: " + globalScores[i]);
		messages[i].score = globalScores[i];
		addStatusListItem(messages[i], red);
	}
	
}

$(document).ready(function(){
	$("#logoutButton").click(function(){
		makeUserLogout();
	});
});