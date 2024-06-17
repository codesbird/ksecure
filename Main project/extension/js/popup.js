

window.onload = function () {


  console.log("Popup loaded");
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }

    console.log("Sending message to content script");
    chrome.tabs.sendMessage(tabs[0].id, { message: "popup_open" }, function (response) {

      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Message response:", response);
      }
    });
  });

  document.getElementsByClassName("analyze-button")[0].onclick = function (event) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

      document.getElementById('showanimation').style.display = 'none';
      document.getElementById('countanimationid').classList.add('countanimation');

      chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });

    });
  };

  document.getElementById("nexttrap").addEventListener('click',function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "next" });

    });
  });

  document.getElementById("pretrap").addEventListener('click',function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "pre" });

    });
  });

  document.getElementsByClassName("link")[0].onclick = function () {
    chrome.tabs.create({
      url: document.getElementsByClassName("link")[0].getAttribute("href"),
    });
  };

};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "update_current_count") {
    document.getElementById('countanimationid').classList.remove('countanimation');

    document.getElementById('analyzebutton').style.display = 'none';

    let count=document.getElementById('showanimation')
    count.style.display = 'block';
    count.textContent = request.count;
    document.getElementById('navigation_count').innerText = `1/${request.count}`

  }
  else if(request.message=='update trap'){
      document.getElementById('navigation_count').innerText = request.count;
  }
});
