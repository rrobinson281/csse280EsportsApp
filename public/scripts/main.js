var rhit = rhit || {};







rhit.LoginPageController = class {
	constructor(){
		document.querySelector("#loginBtn").onclick = () =>{
			rhit.loginManager.signIn();
		}
	}
}
rhit.AuthManager = class {
	constructor() {
		this._user = null;
	  }
 	beginListening(changeListener) {
		 firebase.auth().onAuthStateChanged((user)=>{
			this._user = user;
			changeListener();
		 });
	 }
 	signIn() {
		console.log("sign in with rosefire");
		Rosefire.signIn(`c7f695c7-5b13-4a4d-addd-76202bb2cb37`, (err, rfUser) => {
			if (err) {
			  console.log("Rosefire error!", err);
			  return;
			}
			console.log("Rosefire success!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				console.log("what");
				if (error.code === 'auth/invalid-custom-token') {
				  console.log("The token you provided is not valid.");
				} else {
				  console.log("signInWithCustomToken error", error.message);
				}
			  });
		 
		  });	   
	 }
	signOut() {
		firebase.auth().signOut().catch((error) =>{
			console.log("sign out error");
		})
	}
	get isSignedIn() {return !!this._user;}
	get uid() { return this._user.uid} 
}
rhit.checkForRedirects = function(){
	if(document.querySelector("#loginPage") && rhit.loginManager.isSignedIn){
		window.location.href = "/homePage.html";
	}
	if(!document.querySelector("#loginPage") && !rhit.loginManager.isSignedIn){
		window.location.href="/";
	}
}
rhit.initPage = function(){
	const urlParams = new URLSearchParams(window.location.search);
	if(document.querySelector("#bottomNav")){
		document.querySelector("#homeBtn").onclick = () => window.location.href="/homePage.html";
		document.querySelector("#communityBtn").onclick = () => window.location.href="/community.html";
		document.querySelector("#infoBtn").onclick = () => window.location.href="/info.html";
		document.querySelector("#profileBtn").onclick = () => window.location.href="/profile.html";
	}
	if(document.querySelector("#homePage")){

	}
	if(document.querySelector("#reccomendationPage")){

	}
	if(document.querySelector("#communityPage")){

	}
	if(document.querySelector("#communityPostPage"))[
		
	]
	if(document.querySelector("#infoPage")){

	}
	if(document.querySelector("#profilePage")){

	}
	
}

rhit.main = function () {
	console.log("Ready");
	rhit.initPage();
	// rhit.loginManager = new rhit.AuthManager();
	// rhit.loginManager.beginListening(() => {
	// 	console.log("auth change callback fired. TODO check for redirects and init the page");
	// 	rhit.checkForRedirects();
	// 	rhit.initPage();
	// });
};

rhit.main();
