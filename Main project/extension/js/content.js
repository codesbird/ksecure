// import {allIgnoreChildren,segments} from "./block_segment";

let trapedElements;
let trapedElementsNavigate = [];
let countIndex = 0;
const endpoint = "http://127.0.0.1:8000/";
const descriptions = {
    "Sneaking": "Coerces users to act in ways that they would not normally act by obscuring information.",
    "Urgency": "Places deadlines on things to make them appear more desirable",
    "Misdirection": "Aims to deceptively incline a user towards one choice over the other.",
    "Social Proof": "Gives the perception that a given action or product has been approved by other people.",
    "Scarcity": "Tries to increase the value of something by making it appear to be limited in availability.",
    "Obstruction": "Tries to make an action more difficult so that a user is less likely to do that action.",
    "Forced Action": "Forces a user to complete extra, unrelated tasks to do something that should be simple.",
};


function getElementArea(element) {
    var rect = element.getBoundingClientRect();
    return rect.height * rect.width;
};

function getClientRect(element) {
    if (element.tagName.toLowerCase() === 'html') {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        return {
            top: 0,
            left: 0,
            bottom: h,
            right: w,
            width: w,
            height: h,
            x: 0,
            y: 0
        };
    }
    else {
        return element.getBoundingClientRect();
    }
};

function getBackgroundColor(element) {
    var style = window.getComputedStyle(element);
    var tagName = element.tagName.toLowerCase();

    if (style === null || style.backgroundColor === 'transparent') {
        var parent = element.parentElement;
        return (parent === null || tagName === 'body') ? 'rgb(255, 255, 255)' : getBackgroundColor(parent);
    }
    else {
        return style.backgroundColor;
    }
};

function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0),
        i = arr.length,
        temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};

function elementCombinations() {
    var r = [],
        arg = 'arguments',
        max = arg.length - 1;

    // function helper(arr, i) {
    //     for (var j = 0, l = arg[i].length; j < l; j++) {
    //     var a = arr.slice(0);
    //     a.push(arg[i][j])
    //     if (i === max) {
    //         r.push(a);
    //     } else
    //         helper(a, i + 1);
    //     }
    // }
    // helper([], 0);

    // return r.length === 0 ? arguments : r;
};

function getVisibleChildren(element) {
    if (element) {
        var children = Array.from(element.children);
        return children.filter(child => isShown(child));
    } else {
        return [];
    }
};

function getParents(node) {
    const result = [];
    while (node = node.parentElement) {
        result.push(node);
    }
    return result;
};

function isShown(element) {
    function displayed(element, style) {
        if (!style) {
            style = window.getComputedStyle(element);
        }

        if (style.display === 'none') {
            return false;
        } else {
            var parent = element.parentNode;

            if (parent && (parent.nodeType === Node.DOCUMENT_NODE)) {
                return true;
            }

            return parent && displayed(parent, null);
        }
    };

    function getOpacity(element, style) {
        if (!style) {
            style = window.getComputedStyle(element);
        }

        if (style.position === 'relative') {
            return 1.0;
        } else {
            return parseFloat(style.opacity);
        }
    };

    function positiveSize(element, style) {
        if (!style) {
            style = window.getComputedStyle(element);
        }

        var tagName = element.tagName.toLowerCase();
        var rect = getClientRect(element);
        if (rect.height > 0 && rect.width > 0) {
            return true;
        }

        if (tagName == 'path' && (rect.height > 0 || rect.width > 0)) {
            var strokeWidth = element.strokeWidth;
            return !!strokeWidth && (parseInt(strokeWidth, 10) > 0);
        }

        return style.overflow !== 'hidden' && Array.from(element.childNodes).some(
            n => (n.nodeType === Node.TEXT_NODE && !!filterText(n.nodeValue)) ||
                (n.nodeType === Node.ELEMENT_NODE &&
                    positiveSize(n) && window.getComputedStyle(n).display !== 'none')
        );
    };

    function getOverflowState(element) {
        var region = getClientRect(element);
        var htmlElem = document.documentElement;
        var bodyElem = document.body;
        var htmlOverflowStyle = window.getComputedStyle(htmlElem).overflow;
        var treatAsFixedPosition;

        function getOverflowParent(e) {
            var position = window.getComputedStyle(e).position;
            if (position === 'fixed') {
                treatAsFixedPosition = true;
                return e == htmlElem ? null : htmlElem;
            } else {
                var parent = e.parentElement;

                while (parent && !canBeOverflowed(parent)) {
                    parent = parent.parentElement;
                }

                return parent;
            }

            function canBeOverflowed(container) {
                if (container == htmlElem) {
                    return true;
                }

                var style = window.getComputedStyle(container);
                var containerDisplay = style.display;
                if (containerDisplay.startsWith('inline')) {
                    return false;
                }

                if (position === 'absolute' && style.position === 'static') {
                    return false;
                }

                return true;
            }
        }

        function getOverflowStyles(e) {
            var overflowElem = e;
            if (htmlOverflowStyle === 'visible') {
                if (e == htmlElem && bodyElem) {
                    overflowElem = bodyElem;
                } else if (e == bodyElem) {
                    return {
                        x: 'visible',
                        y: 'visible'
                    };
                }
            }

            var ostyle = window.getComputedStyle(overflowElem);
            var overflow = {
                x: ostyle.overflowX,
                y: ostyle.overflowY
            };

            if (e == htmlElem) {
                overflow.x = overflow.x === 'visible' ? 'auto' : overflow.x;
                overflow.y = overflow.y === 'visible' ? 'auto' : overflow.y;
            }

            return overflow;
        }

        function getScroll(e) {
            if (e == htmlElem) {
                return {
                    x: htmlElem.scrollLeft,
                    y: htmlElem.scrollTop
                };
            } else {
                return {
                    x: e.scrollLeft,
                    y: e.scrollTop
                };
            }
        }

        for (var container = getOverflowParent(element); !!container; container =
            getOverflowParent(container)) {
            var containerOverflow = getOverflowStyles(container);

            if (containerOverflow.x === 'visible' && containerOverflow.y ===
                'visible') {
                continue;
            }

            var containerRect = getClientRect(container);

            if (containerRect.width == 0 || containerRect.height == 0) {
                return 'hidden';
            }

            var underflowsX = region.right < containerRect.left;
            var underflowsY = region.bottom < containerRect.top;

            if ((underflowsX && containerOverflow.x === 'hidden') || (underflowsY &&
                containerOverflow.y === 'hidden')) {
                return 'hidden';
            } else if ((underflowsX && containerOverflow.x !== 'visible') || (
                underflowsY && containerOverflow.y !== 'visible')) {
                var containerScroll = getScroll(container);
                var unscrollableX = region.right < containerRect.left -
                    containerScroll.x;
                var unscrollableY = region.bottom < containerRect.top -
                    containerScroll.y;
                if ((unscrollableX && containerOverflow.x !== 'visible') || (
                    unscrollableY && containerOverflow.x !== 'visible')) {
                    return 'hidden';
                }

                var containerState = getOverflowState(container);
                return containerState === 'hidden' ? 'hidden' : 'scroll';
            }

            var overflowsX = region.left >= containerRect.left + containerRect.width;
            var overflowsY = region.top >= containerRect.top + containerRect.height;

            if ((overflowsX && containerOverflow.x === 'hidden') || (overflowsY &&
                containerOverflow.y === 'hidden')) {
                return 'hidden';
            } else if ((overflowsX && containerOverflow.x !== 'visible') || (
                overflowsY && containerOverflow.y !== 'visible')) {
                if (treatAsFixedPosition) {
                    var docScroll = getScroll(container);
                    if ((region.left >= htmlElem.scrollWidth - docScroll.x) || (
                        region.right >= htmlElem.scrollHeight - docScroll.y)) {
                        return 'hidden';
                    }
                }

                var containerState = getOverflowState(container);
                return containerState === 'hidden' ? 'hidden' : 'scroll';
            }
        }

        return 'none';
    };

    function hiddenByOverflow(element) {
        return getOverflowState(element) === 'hidden' && Array.from(element.childNodes)
            .every(n => n.nodeType !== Node.ELEMENT_NODE || hiddenByOverflow(n) ||
                !positiveSize(n));
    }

    var tagName = element.tagName.toLowerCase();

    if (tagName === 'body') {
        return true;
    }

    if (tagName === 'input' && element.type.toLowerCase() === 'hidden') {
        return false;
    }

    if (tagName === 'noscript' || tagName === 'script' || tagName === 'style') {
        return false;
    }

    var style = window.getComputedStyle(element);

    if (style == null) {
        return false;
    }

    if (style.visibility === 'hidden' || style.visibility === 'collapse') {
        return false;
    }

    if (!displayed(element, style)) {
        return false;
    }

    if (getOpacity(element, style) === 0.0) {
        return false;
    }

    if (!positiveSize(element, style)) {
        return false;
    }

    return !hiddenByOverflow(element);
};

function isInteractable(element) {
    function isEnabled(element) {
        var disabledSupportElements = ['button', 'input', 'optgroup', 'option', 'select', 'textarea'];
        var tagName = element.tagName.toLowerCase();

        if (!disabledSupportElements.includes(tagName)) {
            return true;
        }

        if (element.getAttribute('disabled')) {
            return false;
        }

        if (element.parentElement && tagName === 'optgroup' || tagName === 'option') {
            return isEnabled(element.parentElement);
        }

        return true;
    }

    function arePointerEventsDisabled(element) {
        var style = window.getComputedStyle(element);
        if (!style) {
            return false;
        }

        return style.pointerEvents === 'none';
    }

    return isShown(element) && isEnabled(element) && !arePointerEventsDisabled(element);
};

function containsTextNodes(element) {
    if (element) {
        if (element.hasChildNodes()) {
            var nodes = [];
            for (var cnode of element.childNodes) {
                if (cnode.nodeType === Node.TEXT_NODE) {
                    var text = filterText(cnode.nodeValue);
                    if (text.length !== 0) {
                        nodes.push(text);
                    }
                }
            }

            return (nodes.length > 0 ? true : false);
        } else {
            return false;
        }
    } else {
        return false;
    }
};

function filterText(text) {
    return text.replace(/(\r\n|\n|\r)/gm, '').trim();
};

function isPixel(element) {
    var rect = element.getBoundingClientRect();
    var height = rect.bottom - rect.top;
    var width = rect.right - rect.left;

    return (height === 1 && width === 1);
};

function containsBlockElements(element, visibility = true) {
    for (var be of blockElements) {
        var children = Array.from(element.getElementsByTagName(be));
        if (visibility) {
            for (child of children) {
                if (isShown(child))
                    return true;
            }
        }
        else {
            return children.length > 0 ? true : false;
        }
    }

    return false;
};

function isWhitespace(element) {
    return (element.nodeType === element.TEXT_NODE &&
        element.textContent.trim().length === 0);
};


function allIgnoreChildren(element) {
    if (element.children.length === 0) {
        return false;
    }
    else {
        for (var child of element.children) {
            if (ignoredElements.includes(child.tagName.toLowerCase())) {
                continue;
            }
            else {
                return false;
            }
        }
        return true;
    }
};



function segments(element) {
    if (!element) {
        return [];
    }

    var tag = element.tagName.toLowerCase();
    if (!ignoredElements.includes(tag) && !isPixel(element) && isShown(element)) {
        if (blockElements.includes(tag)) {
            if (!containsBlockElements(element)) {
                if (allIgnoreChildren(element)) {
                    return [];
                }
                else {
                    if (getElementArea(element) / winArea > 0.3) {
                        var result = [];

                        for (var child of element.children) {
                            result = result.concat(segments(child));
                        }

                        return result;
                    }
                    else {
                        return [element];
                    }
                }
            }
            else if (containsTextNodes(element)) {
                return [element];
            }
            else {
                var result = [];

                for (var child of element.children) {
                    result = result.concat(segments(child));
                }

                return result;
            }
        }
        else {
            if (containsBlockElements(element, false)) {
                var result = [];

                for (var child of element.children) {
                    result = result.concat(segments(child));
                }

                return result;
            }
            else {
                if (getElementArea(element) / winArea > 0.3) {
                    var result = [];

                    for (var child of element.children) {
                        result = result.concat(segments(child));
                    }

                    return result;
                }
                else {
                    return [element];
                }
            }
        }
    }
    else {
        return [];
    }
};


function scrape() {
    // website has already been analyzed
    // if (document.getElementById("insite_count")) {
    //     return;
    // }

    // aggregate all DOM elements on the page
    let elements = segments(document.body);
    trapedElements = elements;
    let filtered_elements = [];

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText != undefined) {
            let text = elements[i].innerText.trim().replace(/\t/g, " ");


            if (text.length == 0) {
                continue;
            }
            filtered_elements.push(text);
        }
    }

    // post to the web server
    fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: filtered_elements }),
    })
        .then((resp) => resp.json())
        .then((resp) => {
            result = resp.result
            console.log(result)

            let dp_count = 0;
            let element_index = 0;
            // let result = ['Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Social Proof', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Urgency', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Urgency', 'Not Dark', 'Not Dark', 'Misdirection', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Scarcity', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Social Proof', 'Not Dark', 'Urgency', 'Misdirection', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Misdirection', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Scarcity', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark', 'Not Dark'];
            trapedElementsNavigate = [];
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].innerText == undefined) {
                    continue;
                }
                
                let text = elements[i].innerText.replace(/\t/g, " ");
                
                if (text.length > 0) {
                    if (result[dp_count] === "Not Dark") {
                        dp_count++;
                        continue;
                    }
                    
                    highlight(elements[i], result[dp_count]);
                    trapedElementsNavigate.push(elements[i])
                    console.log(elements[i], result[dp_count]);
                    dp_count++;
                }
            }
            
            // store number of dark patterns
            let g = document.createElement("div");
            g.id = "insite_count";
            g.value = trapedElementsNavigate.length;
            g.style.opacity = 1;
            g.style.position = "fixed";
            document.body.appendChild(g);
            sendDarkPatterns(g.value);
        })
        .catch((error) => {
            console.log(error);
            console.log(error.stack);
        });
}


function highlight(element, type) {
    element.classList.add("insite-highlight");

    let body = document.createElement("span");
    body.classList.add("insite-highlight-body");

    /* header */
    let header = document.createElement("div");
    header.classList.add("modal-header");
    let headerText = document.createElement("h1");
    headerText.innerHTML = type + " Pattern";
    header.appendChild(headerText);
    body.appendChild(header);

    /* content */
    let content = document.createElement("div");
    content.classList.add("modal-content");
    content.innerHTML = descriptions[type];
    body.appendChild(content);

    element.appendChild(body);
}

function sendDarkPatterns(number) {

    chrome.runtime.sendMessage({
        message: "update_current_count",
        count: number,
    });
}

function nextTrap() {
    trapedElementsNavigate[countIndex].style.backgroundColor = 'rgb(247, 230, 96)';

    countIndex = (countIndex + 1) % trapedElementsNavigate.length;

    trapedElementsNavigate[countIndex].style.backgroundColor = '#edff00';
    trapedElementsNavigate[countIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    chrome.runtime.sendMessage({
        message: "update trap",
        count: `${countIndex+1}/${trapedElementsNavigate.length}`,
    });

}
function preTrap() {
    trapedElementsNavigate[countIndex].style.backgroundColor = 'rgb(247, 230, 96)';
    countIndex = ('', countIndex - 1 + trapedElementsNavigate.length) % trapedElementsNavigate.length;
    trapedElementsNavigate[countIndex].style.backgroundColor = '#edff00';

    trapedElementsNavigate[countIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });

    chrome.runtime.sendMessage({
        message: "update trap",
        count: `${countIndex+1}/${trapedElementsNavigate.length}`,

    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    // return true; // Indicate that sendResponse will be called asynchronously
    console.log(request.message)
    if (request.message === "analyze_site") {
        scrape();
    } else if (request.message === "popup_open") {
        sendResponse({ status: "Content script received 'popup_open'" });

    }
    else if (request.message == 'next') {
        nextTrap()
    }
    else if (request.message == 'pre') {
        preTrap()
    }

});
