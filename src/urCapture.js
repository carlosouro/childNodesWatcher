//do not polute global scope
(function(){

    //ensure urCapture is not defined yet
    if (typeof window.urCapture !== 'undefined'){
        window.console && window.console.error('Attempting to redefine urCapture helper module')
    }

    var ElementMatchesFn = 'matches'

    //--- helper - start observing the whole DOM ---
    //observer patterns: MutationObserver / Mutation Events
    var isObserving = false
    function startObserving(){

        //console.log('starting to observe')

        //OPTIMAL COMPATIBILITY via MutationObserver
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver
        if(typeof MutationObserver === 'function') {
            //create mutation observer for document added/removed elements and start it
            var observer = new MutationObserver(function(mutations){
                var mutationsLength = mutations.length
                var mutation, nodes, nodeListLength
                for(var i = 0; i<mutationsLength; i++) {
                    mutation = mutations[i]

                    //check added nodes
                    nodes = mutation.addedNodes
                    nodeListLength = nodes.length
                    for(var j = 0; j<nodeListLength; j++) {
                        addedNode(nodes[j])
                    }

                    //check removed nodes
                    nodes = mutation.removedNodes
                    nodeListLength = nodes.length
                    for(var j = 0; j<nodeListLength; j++) {
                        removedNode(nodes[j])
                    }

                }

            })
            observer.observe(window.document, {childList:true, subtree: true})

        //MINIMUM COMPATIBILITY via Mutation Events
        } else {
            //create mutation observer for document added/removed elements and start it
            document.addEventListener('DOMNodeInserted', function(e){
                addedNode(e.target)
            })
            document.addEventListener('DOMNodeRemoved', function(e){
                removedNode(e.target)
            })
        }

        isObserving = true
    }


    //--- selector, state and callback stacks ---

    //all selectors list (for 'added' detection based on selectors)
    //note: includes also 'removed' matchable selectors for storing state upon addedNode()
    var selectors = []  // ['<selector1>', ...]

    //matched DOM elements state (for 'removed' detection based on selectors)
    //note: we use 2 lists for performance, but permanent consistency between the 2 lists is must-have
    var matchedElementsInDOM = []  // [<element1>, <element2>, ...]
    var matchedElementsInDOMMatchedSelectors = []  // [[<selector1-1>, ...], [<selector2-1>, ...], ...]

    //callback handlers holders (for quick triggering based of matched selector)
    var addedCallbackStack = [] // { "<selector>": [<callkback1>, ...]}
    var removedCallbackStack = [] // { "<selector>": [<callkback1>, ...]}

    //-- add/remove handlers --
    function addedNode(el){
        
        //ignore non Elements
        if (typeof el[ElementMatchesFn] === 'undefined') {
            return;
        }

        //PREP: in-loop helper variable declarations
        var j, selector, callbacks, callbacksLength

        //try to match any of our added/removed known selectors
        var matchedSelectors = []
        var length = selectors.length
        for (var i=0; i<length; i++) {
            selector = selectors[i]
            //Note: at scale, probably our performance bottleneck would be here
            //it is possible to improve, but very complex
            if( el[ElementMatchesFn](selector) ){
                //store it for elementsInDOM/elementsInDOMMatchedSelectors consistency resolution
                matchedSelectors.push(selector)

                //subloop: trigger 'added' callbacks (if any)
                callbacks = addedCallbackStack[selector] || []
                for (j=0; j<callbacksLength; j++) {
                    callbacks[j](el)
                }
            }
        }

        //store dom state consistency
        if(matchedSelectors.length>0) {
            matchedElementsInDOM.push(el)
            matchedElementsInDOMMatchedSelectors.push(matchedSelectors)
        }
    }
    function removedNode(el){

        //get the last known elements state (active selectors) of this node (if watched)
        var matchedIndex = matchedElementsInDOM.indexOf(el)

        //if it matches any of our watched elements, let's trigger 'removed' callbacks
        if(matchedIndex!==-1){

            //remove element from cache
            matchedElementsInDOM.splice(matchedIndex, 1)
            //get and remove its matched selectors
            var elementSelectors = matchedElementsInDOMMatchedSelectors.splice(matchedIndex, 1)[0]

            //PREP: in-loop helper variable declarations
            var j, callbacks, callbacksLength

            //loop through all matched selectors
            var length = elementSelectors.length
            for (var i=0; i<length; i++) {

                //trigger 'added' callbacks for the selector (if any)
                callbacks = removedCallbackStack[elementSelectors[i]] || []
                callbacksLength = callbacks.length
                for (j=0; j<callbacksLength; j++) {
                    callbacks[j](el)
                }
            }
        }
    }

    //helper function - adds selector to "selectors" if never seen before
    function addSelectorToGenericList(selector){
        if(typeof removedCallbackStack[selector] === 'undefined' && typeof addedCallbackStack[selector] === 'undefined') {
            //push to generic stack of all added selectors
            selectors.push(selector)
        }
    }

    //-- urCapture object interface --
    window.urCapture = {

        //expose internal consistency variables reference for unit testing
        internalState : {
            selectors: selectors,
            matchedElementsInDOM: matchedElementsInDOM,
            matchedElementsInDOMMatchedSelectors: matchedElementsInDOMMatchedSelectors,
            addedCallbackStack: addedCallbackStack,
            removedCallbackStack: removedCallbackStack
        },
        
        watchForAddedElements: function(selector, callback) {
            //start observer
            if(!isObserving) startObserving()
            //add to 'selectors' main list (if not there yet)
            addSelectorToGenericList(selector)

            //add selector entry if not existent
            if(typeof addedCallbackStack[selector] === 'undefined') {
                addedCallbackStack[selector] = []
            }

            //add callback to stack
            addedCallbackStack[selector].push(callback)
        },

        watchForRemovedElements: function(selector, callback) {
            //start observer
            if(!isObserving) startObserving()
            //add to 'selectors' main list (if not there yet)
            addSelectorToGenericList(selector)

            //have we seen it before?
            if(typeof removedCallbackStack[selector] === 'undefined') {
                //add selector entry if not existent
                removedCallbackStack[selector] = []

                //noteable case - new 'removed' selector match
                //there may be already added elements we want to listen to removal off
                //lets idenfify them, and store them in matchedElementsInDOM if need be
                var elements = window.document.querySelectorAll(selector)

                Array.prototype.forEach.call(elements, function (el) {
                    var matchedIndex = matchedElementsInDOM.indexOf(el)
                    if(matchedIndex !== -1){
                        //ok matched - means it was detected by our "addedNode" logic at some point
                        //now this specific selector may happen to not exist in addedCallbackStack 
                        //(could have been matched by some other 'added' selector),
                        //in this case we need to add it to matchedElementsInDOMMatchedSelectors
                        if(typeof addedCallbackStack[selector] === 'undefined'){
                            matchedElementsInDOMMatchedSelectors[j].push(selector)
                        }
                    } else {
                        //never matched, let's add it to the cache for watching removal
                        matchedElementsInDOM.push(el)
                        matchedElementsInDOMMatchedSelectors.push([selector])
                    }
                });

            }

            //add callback to stack
            removedCallbackStack[selector].push(callback)
        }

    }

})()