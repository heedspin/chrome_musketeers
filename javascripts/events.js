
function PopupWindow(tab) {
	this.tab_id = tab.id;
	this.window_id = null;
	this.storage_key = "PopupWindow-" + this.tab_id;
	this.subject = null;
	this.url = null;	
}

PopupWindow_persist = function(pw) {
	var to_store = {};
	to_store[pw.storage_key] = pw;
	console.log("Storing " + JSON.stringify(to_store));
	chrome.storage.local.set(to_store, function(result) {
		console.log("Stored " + JSON.stringify(to_store) + " " + JSON.stringify(result));	
	});
}

PopupWindow_createWindow = function(tab) {
	pw = new PopupWindow(tab);
	chrome.windows.create({url: "popup.html", type: "popup"}, function(w) {
		var popupUrl = chrome.extension.getURL('popup.html');
		pw.window_id = w.id;
		PopupWindow_persist(pw);
	});
}

// var views = chrome.extension.getViews();
// for (var i = 0; i < views.length; i++) {
// 	var view = views[i];
// 	if (view.location.href == popupUrl) {				
// 		popup_window.window_id = view.id;
// 		popup_window.persist();
// 	  break;
// 	}
// }

PopupWindow_setSubject = function(pw, subject) {
	if (pw.subject != subject) {
		pw.subject = subject;
		var view = chrome.extension.getViews({windowId: pw.window_id})[0];
		view.setSubject(pw.subject);
		console.log("Set subject: " + pw.subject);
		PopupWindow_persist(pw);		
	}
}

PopupWindow_setUrl = function(pw, url) {
	if (pw.url != url) {
		pw.url = url;
		console.log("Set url: " + pw.url);
		PopupWindow_persist(pw);		
	}
}

PopupWindow_find = function(tab_id, f) {
	var popup_storage_key = "PopupWindow-" + tab_id;
	chrome.storage.local.get(popup_storage_key, function(result) {
		console.log("Loaded " + JSON.stringify(popup_storage_key));
		f(result[popup_storage_key])
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if ('hello' in request) {
		console.log("Received hello from tab " + sender.tab.id);
		PopupWindow_createWindow(sender.tab);
	} else if ('subject' in request) {
		console.log("Received subject from tab " + sender.tab.id + ": " + request.subject);
		PopupWindow_find(sender.tab.id, function(pw) {
			PopupWindow_setSubject(pw, request.subject);
		})		
	}
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	// console.log("tab " + tabId + " changed: " + JSON.stringify(changeInfo));
	if (changeInfo.url) {
		PopupWindow_find(tabId, function(pw) {
			if (pw && pw.window_id) {
				PopupWindow_setUrl(pw, changeInfo.url);
			}
		});
	}
});

