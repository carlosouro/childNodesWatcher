describe('urCapture', function () {
    var addedSelector = '.addTest'
    var removedSelector = '.addTest'
    var addedElements = []
    var removedElements = []

    var addTestCallback, removeTestCallback

    it('should be able to run tests', function () {});

    it('should be able to setup multiple add listener', function () {
        

        window.urCapture.watchForAddedElements(addedSelector, function(el){
            addTestCallback(el)
        })

        //checks internal consistency
        assert.equal(window.urCapture.internalState.selectors.length, 1)
        assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 0)
        assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 0)
        assert.equal(Object.keys(window.urCapture.internalState.addedCallbackStack).length, 1)
        assert.equal(Object.keys(window.urCapture.internalState.removedCallbackStack).length, 0)

        assert.equal(window.urCapture.internalState.selectors[0], addedSelector)
        assert.notEqual(window.urCapture.internalState.addedCallbackStack[addedSelector], undefined)
    });

    it('should be able to detect added elements', function (done) {
        var el = document.createElement('div')
        el.className = 'addTest'
        addedElements.push(el)

        addTestCallback = function(e){
            assert.equal(el,e)

            Promise.resolve().then(function() {
                //checks internal consistency
                assert.equal(window.urCapture.internalState.matchedElementsInDOM.length, 1)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors.length, 1)

                assert.equal(window.urCapture.internalState.matchedElementsInDOM[0], el)
                assert.equal(window.urCapture.internalState.matchedElementsInDOMMatchedSelectors[0][0], addedSelector)
                done()
            })
            
        }

        //go!
        document.body.appendChild(el)
        
    });

    it('should be able to setup multiple add listener', function () {
        window.urCapture.watchForRemovedElements(removedSelector, function(el){
            removeTestCallback(el)
        })
    });
});