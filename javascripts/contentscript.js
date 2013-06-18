// var subject = null;
// var count = 0;
// function ParseBody() {
// 	var new_subject = subject_regex.exec(document.body.outerHTML)
// 	if (new_subject != subject) {
// 		subject = new_subject;
// 		count += 1;
//   	chrome.extension.sendRequest({ match: subject, count: count }, function(response) {});
// 	}
// }

var current_subject = null;
var dom_modification_timer = null;
function DOMModificationHandler() {
	if (dom_modification_timer) {
		clearTimeout(dom_modification_timer);
	}	
	dom_modification_timer = setTimeout(sendSubject, 200);		
}
$('body').bind('DOMSubtreeModified', DOMModificationHandler);

function sendSubject() {
	var new_subject = getSubject();
	if (current_subject != new_subject) {
		current_subject = new_subject;
		chrome.runtime.sendMessage({subject: current_subject}, function() {});
	}
}

function getSubject() {
	// Gmail-specific
	return $("h1:not([role=banner])").children("span:first").text();
}

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
// 	var subject = getSubject();
// 	console.log("Received message: " + JSON.stringify(request) + " subject=" + subject);
// 	sendResponse({ subject: subject });
// })
// 
chrome.runtime.sendMessage({hello: "muskateers"}, function() {});
