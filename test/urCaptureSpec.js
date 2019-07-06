describe('urCapture', function () {

    var addedClass1Callback, removedClass1Callback, 
        addedClass2Callback, removedClass2Callback, 
        removedClass1Callback2, addedClass1Callback2;

    it('should be able to run tests', function () {});

    it('should be able to setup add listener', function () {
        

        window.urCapture.watchForAddedElements('.class1', function(){
            addedClass1Callback(this)
        })

        //checks internal consistency
        assert.equal(window.urCapture.internalState.selectors.length, 1)
        assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 0)
        assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 0)
        assert.equal(Object.keys(window.urCapture.internalState.addedCallbackStack).length, 1)
        assert.equal(Object.keys(window.urCapture.internalState.removedCallbackStack).length, 0)

        assert.equal(window.urCapture.internalState.selectors[0], '.class1')
        assert.notEqual(window.urCapture.internalState.addedCallbackStack['.class1'], undefined)
    });

    var element1
    it('should be able to detect added elements', function (done) {
        element1 = document.createElement('div')
        element1.className = 'class1'

        addedClass1Callback = function(e){
            assert.equal(element1,e)

            Promise.resolve().then(function() {
                //checks internal consistency
                assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 1)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 1)

                assert.equal(window.urCapture.internalState.matchedElementsInDOM[0], element1)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors[0][0], '.class1')
                done()
            })
            
        }

        //go!
        document.body.appendChild(element1)
        
    });

    var element2
    it('should not care about non-matched added elements', function (done) {
        element2 = document.createElement('div')
        element2.className = 'class2'

        addedClass1Callback = function(){
            throw 'detected wrong added element'
        }

        document.body.appendChild(element2)

        window.setTimeout(function(){
            done()
        }, 500)
    });

    var element3
    it('should be able to detect a second added element', function (done) {
        element3 = document.createElement('div')
        element3.className = 'class1 class2'

        addedClass1Callback = function(e){
            assert.equal(element3,e)

            Promise.resolve().then(function() {
                //checks internal consistency
                assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 2)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 2)

                assert.equal(window.urCapture.internalState.matchedElementsInDOM[1], element3)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors[1][0], '.class1')
                done()
            })
            
        }

        //go!
        document.body.appendChild(element3)
        
    });

    it('should be able to detect removed elements', function (done) {
        window.urCapture.watchForRemovedElements('.class1', function(){
            removedClass1Callback(this)
        })

        //checks internal consistency
        assert.equal(window.urCapture.internalState.selectors.length, 1)
        assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 2)
        assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 2)
        assert.equal(Object.keys(window.urCapture.internalState.addedCallbackStack).length, 1)
        assert.equal(Object.keys(window.urCapture.internalState.removedCallbackStack).length, 1)

        assert.equal(window.urCapture.internalState.selectors[0], '.class1')
        assert.notEqual(window.urCapture.internalState.removedCallbackStack['.class1'], undefined)
        

        removedClass1Callback = function(e){
            assert.equal(element1,e)

            Promise.resolve().then(function() {
                //checks internal consistency
                assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 1)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 1)

                assert.equal(window.urCapture.internalState.matchedElementsInDOM[0], element3)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors[0][0], '.class1')
                done()
            })
            
        }

        //remove the element
        document.body.removeChild(element1)
    });

    it('should be able to detect removed elements (2)', function (done) {
        window.urCapture.watchForRemovedElements('.class2', function(){
            removedClass2Callback(this)
        })

        //checks internal consistency
        assert.equal(window.urCapture.internalState.selectors.length, 2)
        //element2 should have been added to cache
        assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 2)
        assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 2)
        assert.equal(Object.keys(window.urCapture.internalState.addedCallbackStack).length, 1)
        assert.equal(Object.keys(window.urCapture.internalState.removedCallbackStack).length, 2)

        assert.equal(window.urCapture.internalState.selectors[1], '.class2')
        assert.notEqual(window.urCapture.internalState.removedCallbackStack['.class2'], undefined)
        

        removedClass2Callback = function(e){
            assert.equal(element2,e)

            Promise.resolve().then(function() {
                //checks internal consistency
                assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 1)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 1)

                assert.equal(window.urCapture.internalState.matchedElementsInDOM[0], element3)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors[0][0], '.class1')
                done()
            })
            
        }

        //remove the element
        document.body.removeChild(element2)
    });

    it('should be able to fire multiple removed callbacks for multiple selectors', function (done) {     

        window.urCapture.watchForRemovedElements('.class1', function(){
            removedClass1Callback2(this)
        })

        var resolve1, resolve2, resolve3
        Promise.all([
            new Promise(function(resolve){resolve1 = resolve}),
            new Promise(function(resolve){resolve2 = resolve}),
            new Promise(function(resolve){resolve3 = resolve})
        ]).then(function(){
            //checks internal consistency
            assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 0)
            assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 0)

            done()
        })

        removedClass1Callback = function(e){
            assert.equal(element3,e)
            resolve1()
        }

        removedClass2Callback = function(e){
            assert.equal(element3,e)
            resolve2()    
        }

        removedClass1Callback2 = function(e){
            assert.equal(element3,e)
            resolve3()  
        }

        //remove the element
        document.body.removeChild(element3)
    });

    it('should be able to fire multiple added callbacks for multiple selectors on multiple elements', function (done) {     

        window.urCapture.watchForAddedElements('.class1', function(){
            addedClass1Callback2(this)
        })

        window.urCapture.watchForAddedElements('.class2', function(){
            addedClass2Callback(this)
        })
        

        var resolve1, resolve2, resolve3,
        resolve4, resolve5, resolve6
        Promise.all([
            new Promise(function(resolve){resolve1 = resolve}),
            new Promise(function(resolve){resolve2 = resolve}),
            new Promise(function(resolve){resolve3 = resolve}),
            new Promise(function(resolve){resolve4 = resolve}),
            new Promise(function(resolve){resolve5 = resolve}),
            new Promise(function(resolve){resolve6 = resolve})
        ]).then(function(){
            //checks internal consistency
            assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 3)
            assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 3)

            assert.equal(Object.keys(window.urCapture.internalState.addedCallbackStack).length, 2)
            assert.equal(Object.keys(window.urCapture.internalState.removedCallbackStack).length, 2)

            done()
        })

        addedClass1Callback = function(e){
            assert.equal(element3,e)
            resolve1()
            addedClass1Callback = function(e){
                assert.equal(element1,e)
                resolve2()
            }
        }

        addedClass1Callback2 = function(e){
            assert.equal(element3,e)
            resolve3()
            addedClass1Callback2 = function(e){
                assert.equal(element1,e)
                resolve4()
            } 
        }

        addedClass2Callback = function(e){
            assert.equal(element3,e)
            resolve5()  
            addedClass2Callback = function(e){
                assert.equal(element2,e)
                resolve6()  
            }
        }

        element3.appendChild(element2)
        element2.appendChild(element1)

        //add all the elements
        document.body.appendChild(element3)
    });

    it('should be able to fire multiple removed callbacks for multiple selectors on multiple elements', function (done) {     
        
        var resolve1, resolve2, resolve3,
        resolve4, resolve5, resolve6
        Promise.all([
            new Promise(function(resolve){resolve1 = resolve}),
            new Promise(function(resolve){resolve2 = resolve}),
            new Promise(function(resolve){resolve3 = resolve}),
            new Promise(function(resolve){resolve4 = resolve}),
            new Promise(function(resolve){resolve5 = resolve}),
            new Promise(function(resolve){resolve6 = resolve})
        ]).then(function(){
            //checks internal consistency
            assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 0)
            assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 0)

            assert.equal(window.urCapture.internalState.selectors.length, 2)

            assert.equal(Object.keys(window.urCapture.internalState.addedCallbackStack).length, 2)
            assert.equal(Object.keys(window.urCapture.internalState.removedCallbackStack).length, 2)

            assert.equal(window.urCapture.internalState.selectors[0], '.class1')
            assert.equal(window.urCapture.internalState.selectors[1], '.class2')

            assert.notEqual(window.urCapture.internalState.addedCallbackStack['.class1'], undefined)
            assert.equal(window.urCapture.internalState.addedCallbackStack['.class1'].length, 2)

            assert.notEqual(window.urCapture.internalState.addedCallbackStack['.class2'], undefined)
            assert.equal(window.urCapture.internalState.addedCallbackStack['.class2'].length, 1)

            assert.notEqual(window.urCapture.internalState.removedCallbackStack['.class1'], undefined)
            assert.equal(window.urCapture.internalState.removedCallbackStack['.class1'].length, 2)

            assert.notEqual(window.urCapture.internalState.removedCallbackStack['.class2'], undefined)
            assert.equal(window.urCapture.internalState.removedCallbackStack['.class2'].length, 1)

            done()
        })

        removedClass1Callback = function(e){
            assert.equal(element3,e)
            resolve1()
            removedClass1Callback = function(e){
                assert.equal(element1,e)
                resolve2()
            }
        }

        removedClass1Callback2 = function(e){
            assert.equal(element3,e)
            resolve3()
            removedClass1Callback2 = function(e){
                assert.equal(element1,e)
                resolve4()
            } 
        }

        removedClass2Callback = function(e){
            assert.equal(element3,e)
            resolve5()  
            removedClass2Callback = function(e){
                assert.equal(element2,e)
                resolve6()  
            }
        }

        //add all the elements
        document.body.removeChild(element3)
    });
});