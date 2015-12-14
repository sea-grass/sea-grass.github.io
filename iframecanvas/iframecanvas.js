/* iframecanvas.js -- this doesn't work as intended after refactoring. need to investigate. */
(function() {
  "use strict";
  document.addEventListener("DOMContentLoaded", function(e) {
    console.log("wowowow");
    var TARGET_ELEMENT, iframe;
    var height, width;
    var ndups = 0;
    
    height = width = 5;
    
    TARGET_ELEMENT = document.body.appendChild(new Cel());
    iframe = TARGET_ELEMENT.appendChild(new Cel({
      "type": "iframe",
      "src": "./black.html",
      "style": {
        "display": "none"
      }
    }));
    console.log("Created TARGET", TARGET_ELEMENT);
    on_load(iframe, createDuplicateFrames);  
  });
  
  function on_load(iframe, callback) {
    if (iframe.addEventListener) iframe.addEventListener("load", callback);
    else iframe.attachEvent("onload", callback);
  }
  
  function createDuplicateFrames(e) {
    console.log("creating duplicate frames");
    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        var duplicateFrame;
        
        duplicateFrame = duplicate(iframe, function(frameClone) {
          var uniqueID, idEl;
          
          uniqueID = (ndups++) + ": [" + x + ", " + y + "]";
          idEl = frameClone.doc.createElement("p"); //new child elements of each frame need to be created by their own respective doc
          idEl.innerText = uniqueID;
          
          frameClone.body.appendChild(idEl);
        });
        
        TARGET_ELEMENT.appendChild(duplicateFrame);
      }
    }
  }
  
  function duplicate(iframe, callback) {
    var srcFrame, destFrame, frameDuplicate;
    function frameStruct(options) {
      var doc, head, body;
      if (!options) return {doc:null, head:null, body:null };
      return {
        doc: options.doc,
        head:options.head,
        body:options.body
      };
    }
    
    srcFrame = frameStruct();
    destFrame = frameStruct();
    
    frameDuplicate = new Cel({
      type: "iframe",
      "classes": ["pixel"],
      attrs: {
        "src": "about:blank",
        "seamless": "seamless",
        "scrolling": "no"
      }
    });
    
    on_load(frameDuplicate, function() {
      srcFrame.doc = iframe.contentWindow.document;
      srcFrame.head = srcFrame.doc.getElementsByTagName("head")[0];
      srcFrame.body = srcFrame.doc.getElementsByTagName("body")[0];
      
      destFrame.doc = frameDuplicate.contentWindow.document;
      destFrame.head = destFrame.doc.getElementsByTagName("head")[0];
      destFrame.body = destFrame.doc.getElementsByTagName("body")[0];
      
      if (destFrame.head) removeNodes(destFrame.head);
      if (destFrame.body) removeNodes(destFrame.body);
      
      appendNodes(srcFrame.head, destFrame.head);
      appendNodes(srcFrame.body, destFrame.body);
      //now that the destFrame is a duplicate, call the callback
      callback(destFrame);
    });
    return frameDuplicate;
  }
  
  function removeNodes(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }
  function appendNodes(iframe1Node, iframe2Node) {
    var child, script;
    child = iframe1Node.firstChild;
    while (child) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.nodeName.toUpperCase() === "SCRIPT") {
          //we need to create the script the old fashioned way
          //and append it to the dom for IE to recognize it
          script = destFrame.doc.createElement("script");
          script.type = child.type;
          script.src = child.src;
          
          iframe2Node.appendChild(script);
        } else {
          //Otherwise, we append it the regular way
          //Note the use of importNode(). This is the proper
          //way to copy a node from an external document
          //that can be inserted into the current document
          // https://developer.mozilla.org/en/DOM/document.importNode
          iframe2Node.appendChild(destFrame.doc.importNode(child, true));
        }
      }
      
      child = child.nextSibling;
    }
  }
})();