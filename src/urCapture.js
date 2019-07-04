//do not polute global scope
(function(){

    //ensure urCapture is not defined yet
    if (typeof window.urCapture !== 'undefined'){
        window.console && window.console.error('Attempting to redefine urCapture helper module')
    }

    //bullet proofing - keep native references in case host is overriding used properties
    var MutationObserver = window.MutationObserver
    var addEventListener = window.EventTarget.prototype.addEventListener || window.EventTarget.prototype.attachEvent

    //define work mode
    var observerEnabled = typeof MutationObserver === 'function'

    //tested at https://jsperf.com/getelementsbyclassname-vs-queryselectorall/227
    //generically optimised, could arguably have average performance improved if we have awareness 
    //of what types of CSS selectors are mostly used (id, class, complex/composed, etc)
    var queryByIdRegex = /^\#[^\s]+$/
    var queryByClassnameRegex = /^\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/
    
    function optimalSelectorAll(selector){
            if (queryByIdRegex.test(selector)){
                var el = document.getElementById(selector.substring(1));
                return el !== null ? [el] : []
            } if(queryByClassnameRegex.test(selector)) {
                return document.getElementsByClassName(selector.substring(1))
            } else {
                return document.querySelectorAll(selector)
            }
        }   
    }

    //create our urCapture object
    window.urCapture = {
        
        // watchForAddedElements: (selector, callback)
        //document.querySelectorAll

        // watchForRemovedElements: (selector, callback)

    }
})()