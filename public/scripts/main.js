var rhit = rhit || {};
var args = args || {};
rhit.RECOMMENDATION = "Recommendations";
rhit.USER_ID = "UserID";
rhit.RECOMMENDATION_TEXT="RecommendationText";
rhit.RECOMMENDATION_GAME="Game";
rhit.POSTS = "Posts";
rhit.POST_TEXT="PostText";
rhit.LAST_TOUCHED = "lastTouched";
function htmlmToElement(html){
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}
rhit.RecommendationManager = class{
	constructor(uid){
		this.uid = uid;
		this._ref = firebase.firestore().collection(rhit.RECOMMENDATION);
	}
	sendRecommendation(gameName, recommendationText){
		console.log('gameName :>> ', gameName);
		console.log('rec :>> ', recommendationText);
		if(recommendationText =="") return;
		this._ref.add({
			[rhit.USER_ID]: this.uid,
			[rhit.RECOMMENDATION_GAME]:gameName,
			[rhit.RECOMMENDATION_TEXT]: recommendationText,
		}).then(function(docRef){
			console.log("Document written with ID: ",docRef.id);
		})
		.catch(function(error){
			console.error("Error adding document: ",error);
		});
	}
}
rhit.CommunityPageController = class{
	constructor(){
		rhit.communityManager = new rhit.CommunityManager();
		document.querySelector("#cmtBtn").onclick = () => window.location.href = "/post.html";
		rhit.communityManager.beginListening(this.updateView.bind(this));
	}
	updateView(){
		const newList = htmlmToElement('<div id="communityList" class = "container justify-content-center"></div>');
		for(let i = 0; i < rhit.communityManager.length;i++){
			const post = rhit.communityManager.getPostAtIndex(i);
			const newPost = this._createPost(post);
			newList.append(newPost);
		}
		const oldList = document.querySelector("#communityList");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.append(newList);
	}
	_createPost(post){
		return htmlmToElement(`<div class = "row list-entry mx-auto">
        <div class = "listDiv mx-auto">
          <p><img src = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg">
            ${post.UserId}: ${post.Text}.</p>
        </div>
      </div>`);
	}
}
rhit.CommunityManager = class{
	constructor(){
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.POSTS);
	}
	beginListening(func){
		// let query = this._ref.orderBy(rhit.LAST_TOUCHED,"desc").limit(50);
		let query = this._ref.limit(50);
		this.unsubscribe = query.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			func();
		});
	}
	get length() {return this._documentSnapshots.length};
	getPostAtIndex(index){
		let doc = this._documentSnapshots[index];
		return new rhit.Post(doc.id,doc.get(rhit.USER_ID),doc.get(rhit.POST_TEXT));
	}
}
rhit.Post = class{
	constructor(id,UserId,Text){
		this.id = id;
		this.UserId = UserId;
		this.Text = Text;
	}
}
rhit.PostManager = class{
	constructor(){
		this._ref = this._ref = firebase.firestore().collection(rhit.POSTS);
	}
	addPost(postText){
		this._ref.add({
			[rhit.USER_ID]: rhit.loginManager.uid,
			[rhit.POST_TEXT]: postText,
			[rhit.LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
		}).then(function(docRef){
			console.log("Document written with ID: ",docRef.id);
		})
		.catch(function(error){
			console.error("Error adding document: ",error);
		});
	}
}
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
		Rosefire.signIn(`87add928-44b8-473d-ae44-8abf90427ae6`, (err, rfUser) => {
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
	if(document.querySelector("#loginPage")){
		console.log("You are on login page.");
		new rhit.LoginPageController();
	}
	if(document.querySelector("#homePage")){
		console.log("You are on the HomePage");
		document.querySelector("#scheduleVisitBtn").onclick = () => window.location = "https://ems.rose-hulman.edu/emswebapp/";
		document.querySelector("#recommendGameBtn").onclick = () => window.location.href = "/recommendation.html";
	}
	if(document.querySelector("#recommendationPage")){
		console.log("You are on the recommendationPage");
		rhit.recommendationManager = new this.RecommendationManager(rhit.loginManager.uid);
		document.querySelector("#recBtn").onclick = () => {
			let gameName = document.querySelector("#recommendGame").value;
			let recText = document.querySelector("#recInput").value;
			rhit.recommendationManager.sendRecommendation(gameName, recText);
			window.location.href="/homePage.html"
		};
	}
	if(document.querySelector("#communityPage")){
		console.log("You are on the communityPage");
		new rhit.CommunityPageController();
	}
	if(document.querySelector("#postPage")){
		console.log("You are on the Post Page");
		rhit.postManager = new this.PostManager();
		document.querySelector("#postBtn").onclick = ()  =>{
			let postText = document.querySelector("#postInput").value;
			rhit.postManager.addPost(postText);
			// window.location.href = "/community.html";
		}
	}
	
	if(document.querySelector("#infoPage")){

	}
	if(document.querySelector("#profilePage")){

	}
	
}

rhit.main = function () {
	console.log("Ready");
	
	//rhit.initPage();
	rhit.loginManager = new rhit.AuthManager();
	rhit.loginManager.beginListening(() => {
		console.log("auth change callback fired. TODO check for redirects and init the page");
		rhit.checkForRedirects();
		rhit.initPage();
	});
};

rhit.main();
