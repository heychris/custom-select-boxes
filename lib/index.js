"use strict";

require("babel-polyfill");

(function () {
    // -------------------------------------------------------------------------
    // HELPER FUNCTIONS

    // A more performant forEach, also, this allows for dynamic variables
    function forEach(arr, action) {
        for (var i = 0; i < arr.length; i++) {
            action(arr[i]);
        }
    }

    // a clone of JQuery.closest()
    function closest(el, fn) {
        return el && (fn(el) ? el : closest(el.parentNode, fn));
    }

    // Build out the tag params
    function tag(name, content, attributes) {
        return {
            name: name,
            attributes: attributes,
            content: content
        };
    }

    // Literally just escape html... doi
    function escapeHtml(text) {
        var replacements = [[/&/g, "&amp;"], [/"/g, "&quot;"], [/</g, "&lt;"], [/>/g, "&gt;"]];

        forEach(replacements, function (replace) {
            text = text ? text.replace(replace[0], replace[1]) : text;
        });

        return text;
    }

    // Render the html to a string
    function renderHtml(element) {
        var pieces = [];

        // renderHtml helper function for attributes
        function renderAttributes(attributes) {
            var result = [];

            if (attributes) {
                for (var name in attributes) {
                    result.push(' ' + name + '=\"' + escapeHtml(attributes[name]) + '\"');
                }
            }

            return result.join('');
        }

        // the actual html render function
        function render(element) {
            // Text node
            if (typeof element == 'string') {
                pieces.push(escapeHtml(element));
            }

            // Empty tag
            else if (!element.content || element.content.length == 0) {
                    pieces.push('<' + element.name + renderAttributes(element.attributes) + '/>');
                }

                // Tag with content
                else {
                        pieces.push('<' + element.name + renderAttributes(element.attributes) + '>');

                        forEach(element.content, render);

                        pieces.push('</' + element.name + '>');
                    }
        }

        render(element);

        return pieces.join('');
    }

    // Check if a select element has the CustomDropdown-root class
    // Meaning that it has already been initialized
    function isInitialized(element) {
        return element.classList.contains('CustomDropdown-root');
    }

    // Merge the dropdown settings with the user settings
    // Object.assign needs a polyfill
    function dropdownSettings(specs) {
        return Object.assign({
            selector: 'select'
        }, specs);
    }

    // -------------------------------------------------------------------------

    function renderDropdown(element) {
        if (isInitialized(element)) return element;

        var _ = this;

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        _.selectElement = element;

        // Attach the HTML right after the SELECT element
        _.selectElement.insertAdjacentHTML('afterend', _.renderDropdownHtml(_.selectElement));
        _.selectElement.classList.add('CustomDropdown-root');

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        // TODO: find browser support for .nextSibling
        _.customDropdown = element.nextSibling;
        _.customDropdownOptions = _.customDropdown.querySelectorAll('.option');

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // ADD EVENT LISTENERS

        // When the Custom DROPDOWN is clicked
        _.customDropdown.addEventListener('click', _.toggleDropdown.bind(_));

        // When dropdown OPTIONS are clicked
        forEach(_.customDropdownOptions, function (option) {
            option.addEventListener('click', _.optionClickEvent.bind(_));
        });

        // Document body clicks,
        document.addEventListener('click', _.documentClickEvent.bind(_));
    }

    // -------------------------------------------------------------------------
    // renderDropdownHtml BUILDS OUT THE HTML FOR THE CUSTOM DROPDOWN

    renderDropdown.prototype.renderDropdownHtml = function (element) {
        var currentOption,
            listContainerUl,
            listContainer,
            options = element.querySelectorAll('option'),
            selectedOption = element.querySelector('option:checked'),
            newOptions = [];

        // Sort through all the options and build out the params
        forEach(options, function (option) {
            newOptions.push(tag('li', option.textContent, {
                'data-value': option.value,
                'class': 'option' + (option.selected ? ' selected' : '')
            }));
        });

        // Create the params for the current span
        currentOption = tag('span', selectedOption.textContent, {
            'class': 'current'
        });

        // UL container
        listContainerUl = tag('ul', newOptions, {});

        // Master list container
        listContainer = tag('div', [listContainerUl], {
            'class': 'list'
        });

        // Return a string of escaped HTML
        return renderHtml(tag('div', [listContainer, currentOption], {
            'class': 'CustomDropdown ' + element.className,
            'tabindex': 0
        }));
    };

    // -------------------------------------------------------------------------
    // openDropdown

    renderDropdown.prototype.openDropdown = function (element) {
        forEach(element.querySelectorAll('.option'), function (option) {
            option.setAttribute('tabindex', 0);
        });

        element.querySelector('.selected').focus();
    };

    // -------------------------------------------------------------------------
    // closeDropdown

    renderDropdown.prototype.closeDropdown = function (element) {
        var options = element.querySelectorAll('.option');

        forEach(options, function (option) {
            option.removeAttribute('tabindex');
        });

        element.focus();
    };

    // -------------------------------------------------------------------------
    // toggleDropdown

    renderDropdown.prototype.toggleDropdown = function (event) {
        var _ = this,
            element = event.currentTarget;

        element.classList.toggle('isOpen');

        return element.classList.contains('isOpen') ? _.openDropdown(element) : _.closeDropdown(element);
    };

    // -------------------------------------------------------------------------
    // optionClickEvent

    renderDropdown.prototype.optionClickEvent = function (event) {
        var _ = this,
            element = event.currentTarget,
            currentSelectedOption = _.customDropdown.querySelector('.selected'),
            clickEvent = document.createEvent('HTMLEvents');

        currentSelectedOption.classList.remove('selected');

        element.classList.add('selected');

        _.customDropdown.querySelector('.current').textContent = element.textContent;
        _.selectElement.value = element.dataset.value;

        clickEvent.initEvent('change', true, false);

        _.selectElement.dispatchEvent(clickEvent);
    };

    // -------------------------------------------------------------------------
    // documentClickEvent

    renderDropdown.prototype.documentClickEvent = function (event) {
        var isDropdownInPath,
            _ = this;

        isDropdownInPath = closest(event.target, function (el) {
            return el.parentNode ? el === _.customDropdown : undefined;
        });

        if (!isDropdownInPath) {
            _.customDropdown.classList.remove('isOpen');

            forEach(_.customDropdownOptions, function (option) {
                option.removeAttribute('tabindex');
            });
        }

        event.stopPropagation();
    };

    // -------------------------------------------------------------------------
    // this.dropdown

    // this.dropdowns is attached to the global scope and then made available
    // to the greater application
    this.dropdowns = function (specs) {
        var settings = dropdownSettings(specs),
            elements = document.querySelectorAll(settings.selector),
            dropdowns = [];

        if (elements) {
            forEach(elements, function (element) {
                dropdowns.push(new renderDropdown(element));
            });
        }

        return dropdowns;
    };
})();

new dropdowns({
    selector: '.Filter-sort'
});