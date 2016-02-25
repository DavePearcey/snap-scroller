# snap-scroller

This is a section scroller. It can work for sections of varying sizes. However it may not work on mobile devices, as i have had no need to write that in. I just disable it for mobile devices.

        USAGE: (showing default values)
        $(document).PDSscroller({
            section: ".section",
            scrollSpeed: 500,
            sectionsAreWindowHeight: false,
            pushStates: false,
            after: function () { }
        });
 
 
        Options Explained:
 
        section: define the class to target as a snap point
 
        scrollSpeed: define how fast it scrolls between sections
 
        sectionsAreWindowHeight: if true sets all targets to be window height
 
        pushStates: if true, pushes html5 history popstate when switching between sections. will NOT change history state if target does not have an id
 
        after: callback that fires your own code after the action is complete
 
 
        Functions Explained
 
        init: initializes the plugin and sets options
 
        update: resets variables and array of snap point objects. intended for on resize
 
        reinit: same as update but can change options
 
        animateTo: animate to number or object
 
        goTo: go to number or object without animation
 
        current: returns current/closest snap point as an object. if disabled or using sidebar, gets nearest
 
        next: returns object after the current one. returns null if current is last object
 
        previous: returns object before current one. returns null if current is first object
 
        disable: stops snap scroll and update. reinit will re-enable. can still get current, next, prev.
 
        enable: re-enables everything
 
        isDisabled: returns boolean
