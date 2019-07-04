//do not polute global scope
(function(){

    //ensure urCapture is not defined yet
    if (typeof window.urCapture !== 'undefined'){
        window.console && window.console.error('Attempting to redefine urCapture helper module')
    }

    //create our urCapture object
    window.urCapture = {

    }
})()