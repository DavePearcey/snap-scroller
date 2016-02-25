/*******************************************************************************************************************************************************
*
*                   PDS SCROLLER
*
*
*       USAGE: (showing default values)
*       $(document).PDSscroller({
*           section: ".section",
*           scrollSpeed: 500,
*           sectionsAreWindowHeight: false,
*           pushStates: false,
*           after: function () { }
*       });
*
*
*       Options Explained:
*
*       section: define the class to target as a snap point
*
*       scrollSpeed: define how fast it scrolls between sections
*
*       sectionsAreWindowHeight: if true sets all targets to be window height
*
*       pushStates: if true, pushes html5 history popstate when switching between sections. will NOT change history state if target does not have an id
*
*       after: callback that fires your own code after the action is complete
*
*
*       Functions Explained
*
*       init: initializes the plugin and sets options
*
*       update: resets variables and array of snap point objects. intended for on resize
*
*       reinit: same as update but can change options
*
*       animateTo: animate to number or object
*
*       goTo: go to number or object without animation
*
*       current: returns current/closest snap point as an object. if disabled or using sidebar, gets nearest
*
*       next: returns object after the current one. returns null if current is last object
*
*       previous: returns object before current one. returns null if current is first object
*
*       disable: stops snap scroll and update. reinit will re-enable. can still get current, next, prev.
*
*       enable: re-enables everything
*
*       isDisabled: returns boolean
*
********************************************************************************************************************************************************
*
*                   FUTURE UPDATES
*
*
*       Add in option to include an automatically generated side-nav.
*
*       Extnd option "sectionsAreWindowHeight" to be able to accept an array so only certain elements will fit height.
*
********************************************************************************************************************************************************/


(function ($) {
    //external veriables used in multiple functions
    var settings;
    var snapPoints = [];
    var disabled = false;
    var canScroll = true;
    var windowHeight = $(window).height();
    var currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
    var previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;

    //make object of methods
    var methods = {
        /*** INITIALIZE ***/
        init: function (options) {
            //base internal variable initialization
            var timer;
            var isWheel = false;
            var timeout = null;
            currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
            previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
            windowHeight = $(window).height();

            //Default options and overwriting with $.extend
            settings = $.extend({
                // These are the defaults.
                section: ".section",
                scrollSpeed: 500,
                sectionsAreWindowHeight: false,
                pushStates: false,
                after: function () { }
            }, options);

            //create array of snap points.
            $(settings.section).each(function () {
                snapPoints.push($(this));
                if (settings.sectionsAreWindowHeight) {
                    $(this).css({ "height": windowHeight });
                }
            });

            $(window).on('scroll wheel DOMMouseScroll mousewheel', function (e) {
                if (!disabled) {
                    // If event is not wheel. Wheel fires before scroll, but it fires scroll afterwards...
                    if (e.type === 'scroll') {
                        //if isWheel is true, then user used the mousewheel and we want the event to happen.
                        if (isWheel) { //WHEEL
                            if (canScroll == false) {
                                e.preventDefault();
                            } else {
                                //get new window offset
                                currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;

                                //check direction of scrolling no matter the source or scroll
                                var direction = (currentWindowTop == previousWindowTop) ? -1 : (currentWindowTop > previousWindowTop) ? 1 : 0;// down : up

                                //checks snap points to see if within window (will add in leniency eventually)
                                $.each(snapPoints, function (index, obj) {
                                    if (direction == 1) { // Down
                                        if (obj.offset().top - currentWindowTop < windowHeight && obj.offset().top - currentWindowTop >= 0) {
                                            canScroll = false;
                                            $('html, body').animate({
                                                scrollTop: obj.offset().top
                                            }, settings.scrollSpeed, function () {
                                                // Animation complete.
                                                if (timeout == null) { // timeout because resetting these values straight away sometimes causes re-firing
                                                    timeout = setTimeout(function () {
                                                        timeout = null;
                                                        canScroll = true;
                                                        //re reset previous top as would be different after anim.
                                                        previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                                        currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                                        isWheel = false;
                                                        if (settings.pushStates && obj.attr('id')) {
                                                            history.pushState(obj.attr('id'), obj.attr('id'), "#" + obj.attr('id'));
                                                        }
                                                        settings.after.call();
                                                    }, 10);
                                                }
                                            });
                                        }
                                    } else if (direction == 0) { // Up
                                        //check if moving into a new element
                                        if (currentWindowTop > obj.offset().top && currentWindowTop < obj.offset().top + obj.height() && obj.offset().top + obj.height() - windowHeight < currentWindowTop) {
                                            //check size of element to define where to scroll to.
                                            if (obj.height() > windowHeight) {
                                                var scrollUpTo = (obj.offset().top + obj.height()) - windowHeight;
                                            } else {
                                                var scrollUpTo = obj.offset().top;
                                            }

                                            //if it needs to scroll, scroll, otherwise move up through the element as expected.
                                            if (scrollUpTo < currentWindowTop) {
                                                canScroll = false;
                                                $('html, body').animate({
                                                    scrollTop: scrollUpTo
                                                }, settings.scrollSpeed, function () {
                                                    // Animation complete.
                                                    if (timeout == null) { // timeout doing this straight away sometimes causes re-firing as scroll fires again after end
                                                        timeout = setTimeout(function () {
                                                            timeout = null;
                                                            canScroll = true;
                                                            //re reset previous top as would be different after anim.
                                                            previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                                            currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                                            isWheel = false;
                                                            if (settings.pushStates && obj.attr('id')) {
                                                                history.pushState(obj.attr('id'), obj.attr('id'), "#" + obj.attr('id'));
                                                            }
                                                            settings.after.call();
                                                        }, 50);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
                                //re-set previous window top to use next time (incase no anim)
                                previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                            }
                        } else {
                            //SCROLL HAPPENED WITHOUT WHEEL
                            isWheel = false;

                            //if pushstates is true, to set a new state after 300ms when using sidescroller
                            if (settings.pushStates) {
                                //cleartimeout if timeout exists
                                clearTimeout($.data(this, 'scrollTimer'));
                                //reset timeout so actions happen after scolling has stopped for X time (default 300ms)
                                $.data(this, 'scrollTimer', setTimeout(function () {
                                    //get new window offset
                                    currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                    var closest = null;
                                    $.each(snapPoints, function (index, obj) {
                                        if (closest == null || Math.abs(obj.offset().top - currentWindowTop) < Math.abs(closest.offset().top - currentWindowTop)) {
                                            closest = obj;
                                        }
                                    });
                                    if (closest.attr('id')) {
                                        history.pushState(closest.attr('id'), closest.attr('id'), "#" + closest.attr('id'));
                                    }
                                }, 300));
                            }
                        }
                    } else {
                        //if event is not a scroll, then it's wheel, so set isWheel true
                        isWheel = true;
                    }
                }
            });
        },
        /*** UPDATE ***/
        update: function () {
            if (!disabled) {
                //reset height variables etc
                currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                windowHeight = $(window).height();

                iswheel = false;
                canscroll = true;
                snapPoints = [];

                //create array of snap points.
                $(settings.section).each(function () {
                    snapPoints.push($(this));
                    if (settings.sectionsAreWindowHeight) {
                        $(this).css({ "height": windowHeight });
                    }
                });
            }
        },
        /*** REINIT ***/
        reinit: function (options) {
            //Default options and overwriting with $.extend
            settings = $.extend({
                // These are the defaults.
                section: ".section",
                scrollSpeed: 500,
                sectionsAreWindowHeight: false,
                pushStates: false,
                after: function () { }
            }, options);

            currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
            previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
            windowHeight = $(window).height();

            //create array of snap points.
            $(settings.section).each(function () {
                snapPoints.push($(this));
                if (settings.sectionsAreWindowHeight) {
                    $(this).css({ "height": windowHeight });
                }
            });

            //re-enable
            disabled = false;
        },
        /*** ANIMATE TO ***/
        animateTo: function (number) {
            if (number instanceof Object) { // element object
                obj = number;
            } else if (!isNaN(parseFloat(number)) && isFinite(number)) { // number (index)
                obj = snapPoints[number];
            }

            var timeout = null;
            if (!disabled) {
                if (obj) {
                    $('html, body').animate({
                        scrollTop: obj.offset().top
                    }, settings.scrollSpeed, function () {
                        // Animation complete.
                        if (timeout == null) { // timeout because resetting these values straight away sometimes causes re-firing
                            timeout = setTimeout(function () {
                                timeout = null;
                                canScroll = true;
                                //re reset previous top as would be different after anim.
                                previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                isWheel = false;
                                settings.after.call();
                            }, 100);
                        }
                    });
                } else {
                    $.error("Snap point (" + number + ") doesnt exist.");
                }
            }
        },
        /*** GO TO ***/
        goTo: function (number) {
            if (number instanceof Object) { // element object
                obj = number;
            } else if (!isNaN(parseFloat(number)) && isFinite(number)) { // number (index)
                obj = snapPoints[number];
            }

            var timeout = null;
            if (!disabled) {
                if (obj) {
                    $('html, body').animate({
                        scrollTop: obj.offset().top
                    }, 0, function () {
                        // Animation complete.
                        if (timeout == null) { // timeout because resetting these values straight away sometimes causes re-firing
                            timeout = setTimeout(function () {
                                timeout = null;
                                canScroll = true;
                                //re reset previous top as would be different after anim.
                                previousWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                currentWindowTop = window.pageYOffset || document.documentElement.scrollTop;
                                isWheel = false;
                                settings.after.call();
                            }, 100);
                        }
                    });
                } else {
                    $.error("Snap point (" + number + ") doesnt exist.");
                }
            }
        },
        /*** CURRENT ***/
        current: function () {
            var closest = null;
            $.each(snapPoints, function (index, obj) {
                if (closest == null || Math.abs(obj.offset().top - currentWindowTop) <= Math.abs(closest.offset().top - currentWindowTop)) {
                    closest = obj;
                }
            });

            return closest;
        },
        /*** NEXT ***/
        next: function () {
            var closest = null;
            $.each(snapPoints, function (index, obj) {
                if (closest == null || Math.abs(obj.offset().top - currentWindowTop) <= Math.abs(closest.offset().top - currentWindowTop)) {
                    closest = obj;
                }
            });

            return (closest.is(":last-of-type")) ? null : closest.next();
        },
        /*** PREVIOUS ***/
        previous: function () {
            var closest = null;
            $.each(snapPoints, function (index, obj) {
                if (closest == null || Math.abs(obj.offset().top - currentWindowTop) <= Math.abs(closest.offset().top - currentWindowTop)) {
                    closest = obj;
                }
            });

            return (closest.is(":first-of-type")) ? null : closest.prev();
        },
        /*** DISABLE ***/
        disable: function () {
            disabled = true;
        },
        /*** ENABLE ***/
        enable: function () {
            disabled = false;
        },
        /*** IS DISABLED ***/
        isDisabled: function () {
            return disabled;
        }
    };

    //Actual plugin
    $.fn.PDSscroller = function (methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.PDSscroller');
        }
    };
}(jQuery));