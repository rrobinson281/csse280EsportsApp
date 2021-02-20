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
rhit.EVENT_REQUESTS ="EventRequests";
rhit.EVENT_TITLE = "EventTitle";
rhit.DESCRIPTION = "Description";
rhit.LOCATION = "Location";
rhit.DATE = "Date";
rhit.ADMINS = "Admins";
rhit.CALENDAR_ID = 'fr7a99kuoek1b669l8uicfdo7k@group.calendar.google.com';

//Code Recieved From 
//https://developers.google.com/calendar/quickstart/js
var CLIENT_ID = '452380067208-ibtvsdodmktiqrnae81thqgj7lpbfjr6.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDMBK7Vz-JbRyHdA5eJn1LGl-UiAukHBaU';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/calendar';

var authorizeButton = document.querySelector('#authorize_button');
var signoutButton = document.querySelector('#signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
*/

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  function initClient() {
	  console.log("initClient Called");
	gapi.client.init({
	  apiKey: API_KEY,
	  clientId: CLIENT_ID,
	  discoveryDocs: DISCOVERY_DOCS,
	  scope: SCOPES
	}).then(function () {
	  // Listen for sign-in state changes.
	  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	  // Handle the initial sign-in state.
	  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	  authorizeButton.onclick = handleAuthClick;
	  signoutButton.onclick = handleSignoutClick;
	}, function(error) {
		console.log('error :>> ', error);
	//   appendPre(JSON.stringify(error, null, 2));
	});
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
	  rhit.calendarSignedIn = true;
	  authorizeButton.style.display = 'none';
	  signoutButton.style.display = 'block';
	} else {
		rhit.calendarSignedIn = false;
	  authorizeButton.style.display = 'block';
	  signoutButton.style.display = 'none';
	}
  }

  /**
   *  Sign in the user upon button click.
   */
  function handleAuthClick(event) {
	  console.log("Authorized button clicked");
	gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
  }


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
		this._docs;
	}
	beginListening(func){
		let query = this._ref.limit(50);
		this.unsubscribe = query.onSnapshot((querySnapshot) => {
			this._docs = querySnapshot.docs;
			console.log(querySnapshot.docs.length);
			func();
		});
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
					window.location.href=`/editpost.html?id=${post.id}`;
					
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
          <p id = "${post.id}">
            ${post.UserId}: ${post.Text}.</p>
        </div>
      </div>`);
	}
}
rhit.CommunityManager = class{
	constructor(){
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.POSTS);
		this.profileManager
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
		this.profileNum=-1;
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
			this.updateView();
		};
		document.querySelector("#submitAddProfile").onclick = () => {
			let profileType = document.querySelector("#inputType").value;
			let profileName = document.querySelector("#inputName").value;
			rhit.profileManager.addProfile(profileType, profileName);
		}
		document.querySelector("#submitEditProfile").onclick = () =>{
			let profileType = document.querySelector("#editType").value;
			let profileName = document.querySelector("#editName").value;
			rhit.profileManager.editProfile(this.profileID,profileType, profileName);
		}
		document.querySelector("#submitDeleteProfile").onclick = () =>{
			rhit.profileManager.removeProfile(this.profileID);
		}
		document.querySelector("#GameRecommendations").onclick = () => window.location.href = '/recommendationsPage.html';
		document.querySelector("#RequestedEvents").onclick = () => window.location.href = '/requestedEvents.html';
	}
	updateView(){
		document.querySelector("#userName").innerHTML = this._uid;
		document.querySelector("#profilePic").src = rhit.profileManager.profilePhoto;
		$('#editAccountDialog').on('show.bs.modal', (event) => {
			let profile = rhit.profileManager.getProfileAtIndex(this.profileNum);
			document.querySelector("#editType").value = profile.type;
			document.querySelector("#editName").value = profile.name;
		});
		if(this._uid==rhit.loginManager.uid){
			console.log("User is same as profile user");
			document.querySelector("#editBtn").style.display = "flex";
			document.querySelector("#addProfileBtn").style.display = "inline-block";
			if(rhit.IsAdmin){
				console.log("User is Admin");
				document.querySelector("#AdminBtns").style.display = "inline-block";
			}
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
			if(this._uid == rhit.loginManager.uid){
				newProfile.onclick = () => {
					this.profileNum = i;
					this.profileID = profile.id;
					newProfile.dataset.toggle="modal"
					newProfile.dataset.target="#editAccountDialog"
				};
			}
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
					[rhit.IS_ADMIN]: false
				})
			}
		});
		// this._profileRef.get().then((doc) => {
		// 	this._profileRef.set({
		// 	})
		// })
	}
	beginListening(func){
		this.unsubscribe = this._ref.onSnapshot((querySnapshot) => {
			this._documentSnapshot = querySnapshot;
			console.log(querySnapshot.get(rhit.PROFILE_PHOTO))
			func();
			
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
	get isAdmin(){return this._documentSnapshot.get(rhit.IS_ADMIN)}
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
rhit.RecommendationPageController = class{
	constructor(){
		console.log("here");
		this.recommendationPageManager = new rhit.RecommendationPageManager();
		this.recommendationPageManager.beginListening(this.updateView.bind(this));
	}
	updateView(){
		const newList = htmlmToElement('<div id="recommendationList" class = "container justify-content-center"></div>');
		for(let i = 0; i < this.recommendationPageManager.length;i++){
			const recommendation = this.recommendationPageManager.getRecommendation(i);
			const newRecommendation = this._createRecommendation(recommendation);
			console.log('newEvent :>> ', newRecommendation);
			newList.append(newRecommendation);
		}
		const oldList = document.querySelector("#recommendationList");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		console.log(newList);
		oldList.parentElement.append(newList);
	}
	_createRecommendation(recommendation){
		return htmlmToElement(`<div class = "row list-entry mx-auto">
        <div class = "listDiv mx-auto">
			<div><span>Game requested by:</span> ${recommendation.get(rhit.USER_ID)}</div>
			<div><span>Game:</span> ${recommendation.get(rhit.RECOMMENDATION_GAME)}</div>
			<div><span>Recommendation Text:</span> ${recommendation.get(rhit.RECOMMENDATION_TEXT)}</div>
        </div>
      </div>`);
	}
}
rhit.RecommendationPageManager = class{
	constructor(){
		this._ref = firebase.firestore().collection(rhit.RECOMMENDATION);
		this._docs = [];
	}
	beginListening(func){
		let query = this._ref.limit(50);
		this.unsubscribe = query.onSnapshot((querySnapshot) => {
			this._docs = querySnapshot.docs;
			console.log(querySnapshot.docs.length);
			func();
		});
	}
	
	getRecommendation(index){
		return this._docs[index];
	}
	get length(){
		return this._docs.length;
	}
}
rhit.EventPageController = class{
	constructor(){
		rhit.eventManager.beginListening(this.updateView.bind(this));
	}
	updateView(){
		const newList = htmlmToElement('<div id="eventsList" class = "container justify-content-center"></div>');
		for(let i = 0; i < rhit.eventManager.length;i++){
			const event = rhit.eventManager.getRequestAtIndex(i);
			const newEvent = this._createEvent(event);
			console.log('newEvent :>> ', newEvent);
			newList.append(newEvent);
		}
		const oldList = document.querySelector("#eventsList");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		console.log(newList);
		oldList.parentElement.append(newList);		
	}
	_createEvent(event){
		return htmlmToElement(`<div id="eventEntry" class = "row list-entry mx-auto">
        <div class = "listDiv mx-auto">
			<div><span>Event Requested by:</span> ${event.user}</div>
			<div><span>Event Title:</span> ${event.title}</div>
			<div><span>Event Description:</span> ${event.desc}</div>
			<div><span>Event Location:</span> ${event.location}</div>
			<div><span>Event Date:</span> ${event.date}</div>
        </div>
      </div>`);
	}
}

rhit.EventManager = class{
	constructor(){
		this._ref = firebase.firestore().collection("EventRequests");
		// this._docs = [];
	}
	beginListening(func){
		console.log("HELLO!");
		let query = this._ref.orderBy(rhit.DATE).limit(50);
		this.unsubscribe = query.onSnapshot((querySnapshot) => {
			this._docs = querySnapshot.docs;
			console.log(querySnapshot.docs.length);
			func();
		});
	}
	addRequest(title, desc, location, date){
		console.log("Adding Request Log");
		this._ref.add({
			[rhit.EVENT_TITLE]: title,
			[rhit.DESCRIPTION]: desc,
			[rhit.LOCATION]: location,
			[rhit.DATE]: date,
			[rhit.USER_ID]: rhit.loginManager.uid,
		}).then(function(docRef){
			console.log("Document written with ID: ",docRef.id);
		})
		.catch(function(error){
			console.error("Error adding document: ",error);
		});
	}

	getRequestAtIndex(index){
		let event = this._docs[index];
		return new rhit.Event(event.get(rhit.EVENT_TITLE),
							  event.get(rhit.DESCRIPTION),
							  event.get(rhit.LOCATION),
							  event.get(rhit.DATE),
							  event.get(rhit.USER_ID));
	}
	get length(){return this._docs.length}
}

rhit.Event = class{
	constructor(title, desc, location, date, user){
		this.title = title;
		this.desc = desc;
		this.location = location;
		this.date = date;
		this.user = user;
	}
}

rhit.checkForRedirects = function(){
	if(document.querySelector("#loginPage") && rhit.loginManager.isSignedIn){
		window.location.href = "/homePage.html";
	}
	if(!document.querySelector("#loginPage") && !rhit.loginManager.isSignedIn){
		window.location.href="/";
	}
}

rhit.ApiManager = class{
	constructor(){
		if(!rhit.IsAdmin){
			document.querySelector("#addevent_button").innerHTML = "Request Event";
		}
	}
	createEvent(summary,location,description,date){
		let request = gapi.client.calendar.events.insert({
			'calendarId': `fr7a99kuoek1b669l8uicfdo7k@group.calendar.google.com`,
			'resource': this.createEventJson(summary,location,description,date)
		  });
		  request.execute((event) => {
			rhit.calendar.refetchEvents()
			console.log('Event created: ' + event.htmlLink);
		  });
		  
	}
	createEventJson(summary,location,description,date){
		return {
			'summary': `${summary}`,
			'location': `${location}`,
			'description': `${description}`,
			'start': {
				'date': `${date}`,
				'timeZone': 'America/Los_Angeles'
			  },
			  'end': {
				'date': `${date}`,
				'timeZone': 'America/Los_Angeles'
			  },
		  }
	}
}
rhit.initPage = async function(){
	const urlParams = new URLSearchParams(window.location.search);
	rhit.eventManager = new this.EventManager();
	if(document.querySelector("#bottomNav")){
		document.querySelector("#homeBtn").onclick = () => window.location.href="/homePage.html";
		document.querySelector("#communityBtn").onclick = () => window.location.href="/community.html";
		document.querySelector("#infoBtn").onclick = () => window.location.href="/info.html";
		document.querySelector("#profileBtn").onclick = () => window.location.href=`/profile.html?id=${rhit.loginManager.uid}`;
	
	}
	await firebase.firestore().collection(rhit.ADMINS).doc(rhit.loginManager.uid)
		.get().then((doc)=>{
			rhit.IsAdmin = doc.exists ? true : false
		});
	if(document.querySelector("#homePage")){
		console.log("You are on the HomePage");
		document.querySelector("#signout").onclick = () => rhit.loginManager.signOut();
		rhit.recommendationManager = new rhit.RecommendationManager(rhit.loginManager.uid);
		rhit.apiManager = new rhit.ApiManager();
		authorizeButton.onclick = handleAuthClick;
	  	signoutButton.onclick = handleSignoutClick;
		console.log('rhit.IsAdmin :>> ', rhit.IsAdmin);
		document.querySelector("#userNameText").innerHTML = `Welcome, ${rhit.loginManager.uid}!`;
		document.querySelector("#scheduleVisitBtn").onclick = () => window.location = "https://ems.rose-hulman.edu/emswebapp/";
		document.querySelector("#recommendGameBtn").onclick = () => window.location.href = "/recommendation.html";
		let calendarEl = document.querySelector('#calendar');
		rhit.calendar = new FullCalendar.Calendar(calendarEl, {	
			googleCalendarApiKey: 'AIzaSyDMBK7Vz-JbRyHdA5eJn1LGl-UiAukHBaU',
			events: {
			  googleCalendarId: 'fr7a99kuoek1b669l8uicfdo7k@group.calendar.google.com'
			}
		  });
		console.log("rendering Calendar");
		rhit.calendar.render();
		document.querySelector("#submitAddEvent").onclick = () => {
			const title = document.querySelector("#inputTitle").value;
			const location = document.querySelector("#inputLocation").value;
			const description = document.querySelector("#inputDescription").value;
			const date = document.querySelector("#inputEventDate").value;
			console.log(title, location, description, date);
			if(rhit.IsAdmin == true){
				console.log("HELLO");
				rhit.apiManager.createEvent(title, location, description, date);
			}
			else{
				console.log("HHHHHHHHHHHHHHHHHH");
				rhit.eventManager.addRequest(title, location, description, date);
			}
			
		};

		$('#addEventDialog').on('show.bs.modal', (event) =>{
			document.querySelector("#inputTitle").value = "";
			document.querySelector("#inputLocation").value = "";
			document.querySelector("#inputDescription").value = "";
			document.querySelector("#inputEventDate").value = "";
		});
		$('#addEventDialog').on('shown.bs.modal', (event) =>{
			//post animation
			document.querySelector("#inputTitle").focus();
		});
		
	}
	if(document.querySelector("#recommendationPage")){
		console.log("You are on the recommendationPage");
		rhit.recommendationManager = new rhit.RecommendationManager(rhit.loginManager.uid);
		document.querySelector("#recBtn").onclick = () => {
			let gameName = document.querySelector("#recommendGame").value;
			let recText = document.querySelector("#recInput").value;
			rhit.recommendationManager.sendRecommendation(gameName, recText);
		};
	}
	if(document.querySelector("#communityPage")){
		document.querySelector("#signout").onclick = () => rhit.loginManager.signOut();
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
		document.querySelector("#signout").onclick = () => rhit.loginManager.signOut();
	}
	if(document.querySelector("#profilePage")){
		document.querySelector("#signout").onclick = () => rhit.loginManager.signOut();
		console.log("You are on the profilePage");
		// rhit.profileManager = null;
		rhit.profileController = new rhit.ProfilePageController();
	}
	if(document.querySelector("#recomendationsPage")){
		console.log("You are on the recomendationsPage");
		new rhit.RecommendationPageController();
	}
	if(document.querySelector("#requestedEvents")){
		console.log("You are on the requestedEvents");
		new rhit.EventPageController();
	}
	
}

rhit.main = function () {
	console.log("Ready");
	
	//rhit.initPage();
	rhit.loginManager = new rhit.AuthManager();
	rhit.loginManager.beginListening(() => {
		console.log("auth change callback fired. TODO check for redirects and init the page");
		if(document.querySelector("#loginPage")){
			console.log("You are on login page.");
			new rhit.LoginPageController();
		}
		rhit.checkForRedirects();
		rhit.initPage();
	});
};

rhit.main();