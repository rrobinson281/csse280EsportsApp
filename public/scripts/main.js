var rhit = rhit || {};
var args = args || {};
rhit.RECOMMENDATION = "Recommendations";
rhit.USER_ID = "UserID";
rhit.RECOMMENDATION_TEXT="RecommendationText";
rhit.RECOMMENDATION_GAME="Game";
rhit.POSTS = "Posts";
rhit.POST_TEXT="PostText";
rhit.LAST_TOUCHED = "lastTouched";
rhit.PROFILE = "Profile";
rhit.PROFILE_PHOTO = "ProfilePhoto";
rhit.USER_PROFILES = "UserProfiles"
rhit.PROFILE_NAME = "ProfileName";
rhit.PROFILE_TYPE= "ProfileType";
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
			window.location.href="/homePage.html"
		})
		.catch(function(error){
			console.error("Error adding document: ",error);
			window.location.href="/homePage.html"
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
			newPost.onclick = () =>{
				console.log("You clicked on a post");
				if(post.UserId == rhit.loginManager.uid){
					console.log("Clicked on!");
					window.location.href=`/editPost.html?id=${post.id}`;
					
				}
				else{window.location.href=`/profile.html?id=${post.UserId}`}
			};
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
          <p id = "${post.id}"><img src = "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg">
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
		let query = this._ref.orderBy(rhit.LAST_TOUCHED,"desc").limit(50);
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
			window.location.href = "/community.html";
		})
		.catch(function(error){
			console.error("Error adding document: ",error);
		});
	}
}
rhit.EditPostManager = class{
	
	constructor(id){
		this._id = id;
		this._documentSnapshot = {};
		this._ref = firebase.firestore().collection(rhit.POSTS).doc(id);
		
	}
	beginListening(){
		this._ref.onSnapshot((doc)=>{
			if(doc.exists){
				this._documentSnapshot = doc;
				document.querySelector("#postInput").value = doc.get(rhit.POST_TEXT);
			}
			else console.log("that dont exist");
		});
	}
	update(newText){
		console.log(newText);
		this._ref.update({
			[rhit.POST_TEXT]: newText
		}).then(()=>{
			console.log("successful Update!");
			window.location.href = "/community.html";
		})
		.catch((error)=>{
			console.error("UpdateFailed: ",error);
		});
	}
	delete(){
		this._ref.delete().then(()=>{
			console.log("Document successfully deleted!");
			window.location.href = "/community.html";
		}).catch((error)=> {
			console.error("Error removing document: ", error);
		});
		
	}
}
rhit.ProfilePageController = class{
	constructor(){
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		this._uid = urlParams.get("id");
		rhit.profileManager = new rhit.ProfileManager(this._uid);
		rhit.profileManager.beginListening(this.updateView.bind(this));
		$('#editProfileDialog').on('show.bs.modal', (event) => {
			document.querySelector("#inputURL").value = rhit.profileManager.profilePhoto;
		});
		$('#editProfileDialog').on('shown.bs.modal', (event) => {
			document.querySelector("#inputURL").focus();
		});
		document.querySelector("#submitEditURL").onclick = () =>{
			rhit.profileManager.editProfilePhoto(document.querySelector("#inputURL").value);
		}
		
	}
	updateView(){
		document.querySelector("#userName").innerHTML = this._uid;
		document.querySelector("#profilePic").src = rhit.profileManager.profilePhoto;
		if(this._uid==rhit.loginManager.uid){
			console.log("User is same as profile user");
			document.querySelector("#editBtn").style.display = "flex";
		}
		//Make da profiles and stuff
		const newList = htmlmToElement(`<div id="accountDiv" class="justify-content-center">
										<div>&nbsp;User Accounts:</div>
										<div id="accountDivBody"><div class="container"><div class="row"></div></div>`);
		document.querySelector("#profileRow").innerHTML = "";
		console.log(rhit.profileManager.profileLength);
		for(let i = 0; i < rhit.profileManager.profileLength;i++){
			console.log("what");
			const profile = rhit.profileManager.getProfileAtIndex(i);
			const newProfile = this._profileElement(profile);
			newProfile.onclick = () => {};
			document.querySelector("#profileRow").append(newProfile);
			console.log(document.querySelector("#profileRow"));
			// newList.append(newPost);
		}
	}

	_profileElement(profile){
		return htmlmToElement(`<div class="col-6" id = "${profile.id}">
                <img id="${profile.type}Icon"
                  src=../img/${profile.type}.png
                  alt="twitter_img">&nbsp;${profile.name}
              </div>
              <br><br></br>`);
	}
}
rhit.ProfileManager = class{
	constructor(uid){
		this._documentSnapshot =[];
		this._profileList = [];
		this._uid = uid
		// this._ref = firebase.firestore().collection(rhit.PROFILE).doc(this._uid);
		this._ref = firebase.firestore().collection(rhit.PROFILE).doc(this._uid);
		this._profileRef = this._ref.collection(rhit.USER_PROFILES);
		this._ref.get().then((doc)=>{
			if(!doc.exists){
				firebase.firestore().collection(rhit.PROFILE).doc(this._uid).set({
					[rhit.PROFILE_PHOTO]: "https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg",
					[rhit.USER_PROFILES]: {}
				})

			}
		});
	}
	beginListening(func){
		this.unsubscribe = this._ref.onSnapshot((querySnapshot) => {
			this._documentSnapshot = querySnapshot;
			console.log(querySnapshot.get(rhit.PROFILE_PHOTO))
			
		});
		this._profileRef.onSnapshot(docs =>{
			this._profileList = docs.docs;
			console.log(this._profileList.length);
			func();
			// console.log(this._profileList[0].get(rhit.PROFILE_TYPE));
		});
	}
	editProfilePhoto(url){
		this._ref.update({
			[rhit.PROFILE_PHOTO]: url
		})
	}
	addProfile(profileType, profileName){
		this._profileRef.add({
			[rhit.PROFILE_TYPE]: profileType,
			[rhit.PROFILE_NAME]: profileName,
		}).then(function(docRef){
			console.log("Document written with ID: ",docRef.id);
		})
		.catch(function(error){
			console.error("Error adding document: ",error);
		});
	}
	editProfile(profileID, profileType, profileName){
		this._profileRef.doc(profileID).update({
			[rhit.PROFILE_TYPE]: profileType,
			[rhit.PROFILE_NAME]: profileName,
		}).then(()=>{
			console.log("successful Update!");
		})
		.catch((error)=>{
			console.error("UpdateFailed: ",error);
		});
	}
	removeProfile(profileID){
		this._profileRef.doc(profileID).delete().then(()=>{
			console.log("Document successfully deleted!");
			window.location.href = "/index.html";
		}).catch((error)=> {
			console.error("Error removing document: ", error);
		});
	}
	get profilePhoto(){
		return this._documentSnapshot.get(rhit.PROFILE_PHOTO);
	}
	get profileLength(){
		return this._profileList.length;
	}
	getProfileAtIndex(index){
		return new rhit.Profile(this._profileList[index].get(rhit.PROFILE_TYPE),
								this._profileList[index].get(rhit.PROFILE_NAME),
								this._profileList[index].id);
	}
}
rhit.Profile = class{
	constructor(type,name,id){
		this.type = type;
		this.name = name;
		this.id = id;
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
		document.querySelector("#profileBtn").onclick = () => window.location.href=`/profile.html?id=${rhit.loginManager.uid}`;
	}
	if(document.querySelector("#loginPage")){
		console.log("You are on login page.");
		new rhit.LoginPageController();
	}
	if(document.querySelector("#homePage")){
		console.log("You are on the HomePage");
		document.querySelector("#userNameText").innerHTML = `Welcome, ${rhit.loginManager.uid}!`;
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
		}
	}
	if(document.querySelector("#editPostPage")){
		console.log("You are on the Edit Post Page");
		const id = urlParams.get("id");
		rhit.editPostManager = new this.EditPostManager(id);
		rhit.editPostManager.beginListening();
		document.querySelector("#editPostBtn").onclick = () => {
			rhit.editPostManager.update(document.querySelector("#postInput").value);
		}
		document.querySelector("#submitDeletePost").onclick = () => {
			rhit.editPostManager.delete();
		}


	}
	
	if(document.querySelector("#infoPage")){

	}
	if(document.querySelector("#profilePage")){
		console.log("You are on the profilePage");
		// rhit.profileManager = null;
		rhit.profileController = new rhit.ProfilePageController();
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
