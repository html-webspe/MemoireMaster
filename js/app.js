(() => {
    "use strict";
    const modules_flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(2 == webP.height);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = true === support ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function functions_menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Прокинувся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if ("error" !== this._dataValue) {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Йой, не заповнено атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && 27 == e.which && "Escape" === e.code && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && 9 == e.which && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Відкрив попап`);
                } else this.popupLogging(`Йой, такого попапу немає. Перевірте коректність введення. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && "string" === typeof selectorValue && "" !== selectorValue.trim()) this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
            this.popupLogging(`Закрив попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            this.youTubeCode = buttons.getAttribute(this.options.youtubeAttribute) ? buttons.getAttribute(this.options.youtubeAttribute) : null;
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && 0 === focusedIndex) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? FLS(`[Попапос]: ${message}`) : null;
        }
    }
    modules_flsModules.popup = new Popup({});
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                const headerElement = document.querySelector(headerItem);
                if (!headerElement.classList.contains("_header-scroll")) {
                    headerElement.style.cssText = `transition-duration: 0s;`;
                    headerElement.classList.add("_header-scroll");
                    headerItemHeight = headerElement.offsetHeight;
                    headerElement.classList.remove("_header-scroll");
                    setTimeout((() => {
                        headerElement.style.cssText = ``;
                    }), 0);
                } else headerItemHeight = headerElement.offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? functions_menuClose() : null;
            if ("undefined" !== typeof SmoothScroll) (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            FLS(`[gotoBlock]: Юхуу...їдемо до ${targetBlock}`);
        } else FLS(`[gotoBlock]: Йой... Такого блоку немає на сторінці: ${targetBlock}`);
    };
    function formFieldsInit(options = {
        viewPass: false,
        autoHeight: false
    }) {
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                targetElement.hasAttribute("data-validate") ? formValidate.removeError(targetElement) : null;
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if ("INPUT" === targetElement.tagName || "TEXTAREA" === targetElement.tagName) {
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                targetElement.hasAttribute("data-validate") ? formValidate.validateInput(targetElement) : null;
            }
        }));
        if (options.viewPass) document.addEventListener("click", (function(e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains("_viewpass-active") ? "password" : "text";
                targetElement.parentElement.querySelector("input").setAttribute("type", inputType);
                targetElement.classList.toggle("_viewpass-active");
            }
        }));
        if (options.autoHeight) {
            const textareas = document.querySelectorAll("textarea[data-autoheight]");
            if (textareas.length) {
                textareas.forEach((textarea => {
                    const startHeight = textarea.hasAttribute("data-autoheight-min") ? Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
                    const maxHeight = textarea.hasAttribute("data-autoheight-max") ? Number(textarea.dataset.autoheightMax) : 1 / 0;
                    setHeight(textarea, Math.min(startHeight, maxHeight));
                    textarea.addEventListener("input", (() => {
                        if (textarea.scrollHeight > startHeight) {
                            textarea.style.height = `auto`;
                            setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
                        }
                    }));
                }));
                function setHeight(textarea, height) {
                    textarea.style.height = `${height}px`;
                }
            }
        }
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((null !== formRequiredItem.offsetParent || "SELECT" === formRequiredItem.tagName) && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if ("email" === formRequiredItem.dataset.required) {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if ("checkbox" === formRequiredItem.type && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
            setTimeout((function() {
                formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
                formRequiredItem.classList.remove("_form-error");
                formRequiredItem.parentElement.classList.remove("_form-error");
            }), 3e3);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (modules_flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        modules_flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    function formSubmit() {
        const forms = document.forms;
        if (forms.length) for (const form of forms) {
            form.addEventListener("submit", (function(e) {
                const form = e.target;
                formSubmitAction(form, e);
            }));
            form.addEventListener("reset", (function(e) {
                const form = e.target;
                formValidate.formClean(form);
            }));
        }
        async function formSubmitAction(form, e) {
            const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
            if (0 === error) {
                const ajax = form.hasAttribute("data-ajax");
                if (ajax) {
                    e.preventDefault();
                    const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
                    const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
                    const formData = new FormData(form);
                    form.classList.add("_sending");
                    const response = await fetch(formAction, {
                        method: formMethod,
                        body: formData
                    });
                    if (response.ok) {
                        let responseResult = await response.json();
                        form.classList.remove("_sending");
                        formSent(form, responseResult);
                    } else {
                        alert("Помилка");
                        form.classList.remove("_sending");
                    }
                } else if (form.hasAttribute("data-dev")) {
                    e.preventDefault();
                    formSent(form);
                }
            } else {
                e.preventDefault();
                if (form.querySelector("._form-error") && form.hasAttribute("data-goto-error")) {
                    const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : "._form-error";
                    gotoblock_gotoBlock(formGoToErrorClass, true, 1e3);
                }
            }
        }
        function formSent(form, responseResult = ``) {
            document.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    form
                }
            }));
            setTimeout((() => {
                if (modules_flsModules.popup) {
                    const popup = form.dataset.popupMessage;
                    popup ? modules_flsModules.popup.open(popup) : null;
                }
            }), 0);
            formValidate.formClean(form);
            formLogging(`Форму відправлено!`);
        }
        function formLogging(message) {
            FLS(`[Форми]: ${message}`);
        }
    }
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    function _assertThisInitialized(self) {
        if (void 0 === self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return self;
    }
    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
    }
    /*!
 * GSAP 3.11.4
 * https://greensock.com
 *
 * @license Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/    var _suppressOverwrites, _reverting, _context, _globalTimeline, _win, _coreInitted, _doc, _coreReady, _lastRenderedFrame, _quickTween, _tickerActive, _config = {
        autoSleep: 120,
        force3D: "auto",
        nullTargetWarn: 1,
        units: {
            lineHeight: ""
        }
    }, _defaults = {
        duration: .5,
        overwrite: false,
        delay: 0
    }, _bigNum = 1e8, _tinyNum = 1 / _bigNum, _2PI = 2 * Math.PI, _HALF_PI = _2PI / 4, _gsID = 0, _sqrt = Math.sqrt, _cos = Math.cos, _sin = Math.sin, _isString = function _isString(value) {
        return "string" === typeof value;
    }, _isFunction = function _isFunction(value) {
        return "function" === typeof value;
    }, _isNumber = function _isNumber(value) {
        return "number" === typeof value;
    }, _isUndefined = function _isUndefined(value) {
        return "undefined" === typeof value;
    }, _isObject = function _isObject(value) {
        return "object" === typeof value;
    }, _isNotFalse = function _isNotFalse(value) {
        return false !== value;
    }, _windowExists = function _windowExists() {
        return "undefined" !== typeof window;
    }, _isFuncOrString = function _isFuncOrString(value) {
        return _isFunction(value) || _isString(value);
    }, _isTypedArray = "function" === typeof ArrayBuffer && ArrayBuffer.isView || function() {}, _isArray = Array.isArray, _strictNumExp = /(?:-?\.?\d|\.)+/gi, _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, _relExp = /[+-]=-?[.\d]+/, _delimitedValueExp = /[^,'"\[\]\s]+/gi, _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, _globals = {}, _installScope = {}, _install = function _install(scope) {
        return (_installScope = _merge(scope, _globals)) && gsap;
    }, _missingPlugin = function _missingPlugin(property, value) {
        return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
    }, _warn = function _warn(message, suppress) {
        return !suppress && console.warn(message);
    }, _addGlobal = function _addGlobal(name, obj) {
        return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
    }, _emptyFunc = function _emptyFunc() {
        return 0;
    }, _startAtRevertConfig = {
        suppressEvents: true,
        isStart: true,
        kill: false
    }, _revertConfigNoKill = {
        suppressEvents: true,
        kill: false
    }, _revertConfig = {
        suppressEvents: true
    }, _reservedProps = {}, _lazyTweens = [], _lazyLookup = {}, _plugins = {}, _effects = {}, _nextGCFrame = 30, _harnessPlugins = [], _callbackNames = "", _harness = function _harness(targets) {
        var harnessPlugin, i, target = targets[0];
        _isObject(target) || _isFunction(target) || (targets = [ targets ]);
        if (!(harnessPlugin = (target._gsap || {}).harness)) {
            i = _harnessPlugins.length;
            while (i-- && !_harnessPlugins[i].targetTest(target)) ;
            harnessPlugin = _harnessPlugins[i];
        }
        i = targets.length;
        while (i--) targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
        return targets;
    }, _getCache = function _getCache(target) {
        return target._gsap || _harness(toArray(target))[0]._gsap;
    }, _getProperty = function _getProperty(target, property, v) {
        return (v = target[property]) && _isFunction(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
    }, _forEachName = function _forEachName(names, func) {
        return (names = names.split(",")).forEach(func) || names;
    }, _round = function _round(value) {
        return Math.round(1e5 * value) / 1e5 || 0;
    }, _roundPrecise = function _roundPrecise(value) {
        return Math.round(1e7 * value) / 1e7 || 0;
    }, _parseRelative = function _parseRelative(start, value) {
        var operator = value.charAt(0), end = parseFloat(value.substr(2));
        start = parseFloat(start);
        return "+" === operator ? start + end : "-" === operator ? start - end : "*" === operator ? start * end : start / end;
    }, _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
        var l = toFind.length, i = 0;
        for (;toSearch.indexOf(toFind[i]) < 0 && ++i < l; ) ;
        return i < l;
    }, _lazyRender = function _lazyRender() {
        var i, tween, l = _lazyTweens.length, a = _lazyTweens.slice(0);
        _lazyLookup = {};
        _lazyTweens.length = 0;
        for (i = 0; i < l; i++) {
            tween = a[i];
            tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
        }
    }, _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
        _lazyTweens.length && !_reverting && _lazyRender();
        animation.render(time, suppressEvents, force || _reverting && time < 0 && (animation._initted || animation._startAt));
        _lazyTweens.length && !_reverting && _lazyRender();
    }, _numericIfPossible = function _numericIfPossible(value) {
        var n = parseFloat(value);
        return (n || 0 === n) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString(value) ? value.trim() : value;
    }, _passThrough = function _passThrough(p) {
        return p;
    }, _setDefaults = function _setDefaults(obj, defaults) {
        for (var p in defaults) p in obj || (obj[p] = defaults[p]);
        return obj;
    }, _setKeyframeDefaults = function _setKeyframeDefaults(excludeDuration) {
        return function(obj, defaults) {
            for (var p in defaults) p in obj || "duration" === p && excludeDuration || "ease" === p || (obj[p] = defaults[p]);
        };
    }, _merge = function _merge(base, toMerge) {
        for (var p in toMerge) base[p] = toMerge[p];
        return base;
    }, _mergeDeep = function _mergeDeep(base, toMerge) {
        for (var p in toMerge) "__proto__" !== p && "constructor" !== p && "prototype" !== p && (base[p] = _isObject(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
        return base;
    }, _copyExcluding = function _copyExcluding(obj, excluding) {
        var p, copy = {};
        for (p in obj) p in excluding || (copy[p] = obj[p]);
        return copy;
    }, _inheritDefaults = function _inheritDefaults(vars) {
        var parent = vars.parent || _globalTimeline, func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults;
        if (_isNotFalse(vars.inherit)) while (parent) {
            func(vars, parent.vars.defaults);
            parent = parent.parent || parent._dp;
        }
        return vars;
    }, _arraysMatch = function _arraysMatch(a1, a2) {
        var i = a1.length, match = i === a2.length;
        while (match && i-- && a1[i] === a2[i]) ;
        return i < 0;
    }, _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
        if (void 0 === firstProp) firstProp = "_first";
        if (void 0 === lastProp) lastProp = "_last";
        var t, prev = parent[lastProp];
        if (sortBy) {
            t = child[sortBy];
            while (prev && prev[sortBy] > t) prev = prev._prev;
        }
        if (prev) {
            child._next = prev._next;
            prev._next = child;
        } else {
            child._next = parent[firstProp];
            parent[firstProp] = child;
        }
        if (child._next) child._next._prev = child; else parent[lastProp] = child;
        child._prev = prev;
        child.parent = child._dp = parent;
        return child;
    }, _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
        if (void 0 === firstProp) firstProp = "_first";
        if (void 0 === lastProp) lastProp = "_last";
        var prev = child._prev, next = child._next;
        if (prev) prev._next = next; else if (parent[firstProp] === child) parent[firstProp] = next;
        if (next) next._prev = prev; else if (parent[lastProp] === child) parent[lastProp] = prev;
        child._next = child._prev = child.parent = null;
    }, _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
        child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
        child._act = 0;
    }, _uncache = function _uncache(animation, child) {
        if (animation && (!child || child._end > animation._dur || child._start < 0)) {
            var a = animation;
            while (a) {
                a._dirty = 1;
                a = a.parent;
            }
        }
        return animation;
    }, _recacheAncestors = function _recacheAncestors(animation) {
        var parent = animation.parent;
        while (parent && parent.parent) {
            parent._dirty = 1;
            parent.totalDuration();
            parent = parent.parent;
        }
        return animation;
    }, _rewindStartAt = function _rewindStartAt(tween, totalTime, suppressEvents, force) {
        return tween._startAt && (_reverting ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
    }, _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
        return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
    }, _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
        return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
    }, _animationCycle = function _animationCycle(tTime, cycleDuration) {
        var whole = Math.floor(tTime /= cycleDuration);
        return tTime && whole === tTime ? whole - 1 : whole;
    }, _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
        return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
    }, _setEnd = function _setEnd(animation) {
        return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
    }, _alignPlayhead = function _alignPlayhead(animation, totalTime) {
        var parent = animation._dp;
        if (parent && parent.smoothChildTiming && animation._ts) {
            animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
            _setEnd(animation);
            parent._dirty || _uncache(parent, animation);
        }
        return animation;
    }, _postAddChecks = function _postAddChecks(timeline, child) {
        var t;
        if (child._time || child._initted && !child._dur) {
            t = _parentToChildTotalTime(timeline.rawTime(), child);
            if (!child._dur || _clamp(0, child.totalDuration(), t) - child._tTime > _tinyNum) child.render(t, true);
        }
        if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
            if (timeline._dur < timeline.duration()) {
                t = timeline;
                while (t._dp) {
                    t.rawTime() >= 0 && t.totalTime(t._tTime);
                    t = t._dp;
                }
            }
            timeline._zTime = -_tinyNum;
        }
    }, _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
        child.parent && _removeFromParent(child);
        child._start = _roundPrecise((_isNumber(position) ? position : position || timeline !== _globalTimeline ? _parsePosition(timeline, position, child) : timeline._time) + child._delay);
        child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
        _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);
        _isFromOrFromStart(child) || (timeline._recent = child);
        skipChecks || _postAddChecks(timeline, child);
        timeline._ts < 0 && _alignPlayhead(timeline, timeline._tTime);
        return timeline;
    }, _scrollTrigger = function _scrollTrigger(animation, trigger) {
        return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
    }, _attemptInitTween = function _attemptInitTween(tween, time, force, suppressEvents, tTime) {
        _initTween(tween, time, tTime);
        if (!tween._initted) return 1;
        if (!force && tween._pt && !_reverting && (tween._dur && false !== tween.vars.lazy || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
            _lazyTweens.push(tween);
            tween._lazy = [ tTime, suppressEvents ];
            return 1;
        }
    }, _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
        var parent = _ref.parent;
        return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
    }, _isFromOrFromStart = function _isFromOrFromStart(_ref2) {
        var data = _ref2.data;
        return "isFromStart" === data || "isStart" === data;
    }, _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
        var pt, iteration, prevIteration, prevRatio = tween.ratio, ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1, repeatDelay = tween._rDelay, tTime = 0;
        if (repeatDelay && tween._repeat) {
            tTime = _clamp(0, tween._tDur, totalTime);
            iteration = _animationCycle(tTime, repeatDelay);
            tween._yoyo && 1 & iteration && (ratio = 1 - ratio);
            if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
                prevRatio = 1 - ratio;
                tween.vars.repeatRefresh && tween._initted && tween.invalidate();
            }
        }
        if (ratio !== prevRatio || _reverting || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
            if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) return;
            prevIteration = tween._zTime;
            tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0);
            suppressEvents || (suppressEvents = totalTime && !prevIteration);
            tween.ratio = ratio;
            tween._from && (ratio = 1 - ratio);
            tween._time = 0;
            tween._tTime = tTime;
            pt = tween._pt;
            while (pt) {
                pt.r(ratio, pt.d);
                pt = pt._next;
            }
            totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
            tween._onUpdate && !suppressEvents && _callback(tween, "onUpdate");
            tTime && tween._repeat && !suppressEvents && tween.parent && _callback(tween, "onRepeat");
            if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
                ratio && _removeFromParent(tween, 1);
                if (!suppressEvents && !_reverting) {
                    _callback(tween, ratio ? "onComplete" : "onReverseComplete", true);
                    tween._prom && tween._prom();
                }
            }
        } else if (!tween._zTime) tween._zTime = totalTime;
    }, _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
        var child;
        if (time > prevTime) {
            child = animation._first;
            while (child && child._start <= time) {
                if ("isPause" === child.data && child._start > prevTime) return child;
                child = child._next;
            }
        } else {
            child = animation._last;
            while (child && child._start >= time) {
                if ("isPause" === child.data && child._start < prevTime) return child;
                child = child._prev;
            }
        }
    }, _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
        var repeat = animation._repeat, dur = _roundPrecise(duration) || 0, totalProgress = animation._tTime / animation._tDur;
        totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
        animation._dur = dur;
        animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
        totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
        animation.parent && _setEnd(animation);
        skipUncache || _uncache(animation.parent, animation);
        return animation;
    }, _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
        return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
    }, _zeroPosition = {
        _start: 0,
        endTime: _emptyFunc,
        totalDuration: _emptyFunc
    }, _parsePosition = function _parsePosition(animation, position, percentAnimation) {
        var i, offset, isPercent, labels = animation.labels, recent = animation._recent || _zeroPosition, clippedDuration = animation.duration() >= _bigNum ? recent.endTime(false) : animation._dur;
        if (_isString(position) && (isNaN(position) || position in labels)) {
            offset = position.charAt(0);
            isPercent = "%" === position.substr(-1);
            i = position.indexOf("=");
            if ("<" === offset || ">" === offset) {
                i >= 0 && (position = position.replace(/=/, ""));
                return ("<" === offset ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
            }
            if (i < 0) {
                position in labels || (labels[position] = clippedDuration);
                return labels[position];
            }
            offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
            if (isPercent && percentAnimation) offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
            return i > 1 ? _parsePosition(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
        }
        return null == position ? clippedDuration : +position;
    }, _createTweenType = function _createTweenType(type, params, timeline) {
        var irVars, parent, isLegacy = _isNumber(params[1]), varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1), vars = params[varsIndex];
        isLegacy && (vars.duration = params[1]);
        vars.parent = timeline;
        if (type) {
            irVars = vars;
            parent = timeline;
            while (parent && !("immediateRender" in irVars)) {
                irVars = parent.vars.defaults || {};
                parent = _isNotFalse(parent.vars.inherit) && parent.parent;
            }
            vars.immediateRender = _isNotFalse(irVars.immediateRender);
            type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1];
        }
        return new Tween(params[0], vars, params[varsIndex + 1]);
    }, _conditionalReturn = function _conditionalReturn(value, func) {
        return value || 0 === value ? func(value) : func;
    }, _clamp = function _clamp(min, max, value) {
        return value < min ? min : value > max ? max : value;
    }, getUnit = function getUnit(value, v) {
        return !_isString(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
    }, clamp = function clamp(min, max, value) {
        return _conditionalReturn(value, (function(v) {
            return _clamp(min, max, v);
        }));
    }, _slice = [].slice, _isArrayLike = function _isArrayLike(value, nonEmpty) {
        return value && _isObject(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject(value[0])) && !value.nodeType && value !== _win;
    }, _flatten = function _flatten(ar, leaveStrings, accumulator) {
        if (void 0 === accumulator) accumulator = [];
        return ar.forEach((function(value) {
            var _accumulator;
            return _isString(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
        })) || accumulator;
    }, toArray = function toArray(value, scope, leaveStrings) {
        return _context && !scope && _context.selector ? _context.selector(value) : _isString(value) && !leaveStrings && (_coreInitted || !_wake()) ? _slice.call((scope || _doc).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [ value ] : [];
    }, selector = function selector(value) {
        value = toArray(value)[0] || _warn("Invalid scope") || {};
        return function(v) {
            var el = value.current || value.nativeElement || value;
            return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc.createElement("div") : value);
        };
    }, shuffle = function shuffle(a) {
        return a.sort((function() {
            return .5 - Math.random();
        }));
    }, distribute = function distribute(v) {
        if (_isFunction(v)) return v;
        var vars = _isObject(v) ? v : {
            each: v
        }, ease = _parseEase(vars.ease), from = vars.from || 0, base = parseFloat(vars.base) || 0, cache = {}, isDecimal = from > 0 && from < 1, ratios = isNaN(from) || isDecimal, axis = vars.axis, ratioX = from, ratioY = from;
        if (_isString(from)) ratioX = ratioY = {
            center: .5,
            edges: .5,
            end: 1
        }[from] || 0; else if (!isDecimal && ratios) {
            ratioX = from[0];
            ratioY = from[1];
        }
        return function(i, target, a) {
            var originX, originY, x, y, d, j, max, min, wrapAt, l = (a || vars).length, distances = cache[l];
            if (!distances) {
                wrapAt = "auto" === vars.grid ? 0 : (vars.grid || [ 1, _bigNum ])[1];
                if (!wrapAt) {
                    max = -_bigNum;
                    while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) ;
                    wrapAt--;
                }
                distances = cache[l] = [];
                originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
                originY = wrapAt === _bigNum ? 0 : ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
                max = 0;
                min = _bigNum;
                for (j = 0; j < l; j++) {
                    x = j % wrapAt - originX;
                    y = originY - (j / wrapAt | 0);
                    distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs("y" === axis ? y : x);
                    d > max && (max = d);
                    d < min && (min = d);
                }
                "random" === from && shuffle(distances);
                distances.max = max - min;
                distances.min = min;
                distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : "y" === axis ? l / wrapAt : wrapAt) || 0) * ("edges" === from ? -1 : 1);
                distances.b = l < 0 ? base - l : base;
                distances.u = getUnit(vars.amount || vars.each) || 0;
                ease = ease && l < 0 ? _invertEase(ease) : ease;
            }
            l = (distances[i] - distances.min) / distances.max || 0;
            return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u;
        };
    }, _roundModifier = function _roundModifier(v) {
        var p = Math.pow(10, ((v + "").split(".")[1] || "").length);
        return function(raw) {
            var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
            return (n - n % 1) / p + (_isNumber(raw) ? 0 : getUnit(raw));
        };
    }, snap = function snap(snapTo, value) {
        var radius, is2D, isArray = _isArray(snapTo);
        if (!isArray && _isObject(snapTo)) {
            radius = isArray = snapTo.radius || _bigNum;
            if (snapTo.values) {
                snapTo = toArray(snapTo.values);
                if (is2D = !_isNumber(snapTo[0])) radius *= radius;
            } else snapTo = _roundModifier(snapTo.increment);
        }
        return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction(snapTo) ? function(raw) {
            is2D = snapTo(raw);
            return Math.abs(is2D - raw) <= radius ? is2D : raw;
        } : function(raw) {
            var dx, dy, x = parseFloat(is2D ? raw.x : raw), y = parseFloat(is2D ? raw.y : 0), min = _bigNum, closest = 0, i = snapTo.length;
            while (i--) {
                if (is2D) {
                    dx = snapTo[i].x - x;
                    dy = snapTo[i].y - y;
                    dx = dx * dx + dy * dy;
                } else dx = Math.abs(snapTo[i] - x);
                if (dx < min) {
                    min = dx;
                    closest = i;
                }
            }
            closest = !radius || min <= radius ? snapTo[closest] : raw;
            return is2D || closest === raw || _isNumber(raw) ? closest : closest + getUnit(raw);
        });
    }, random = function random(min, max, roundingIncrement, returnFunction) {
        return _conditionalReturn(_isArray(min) ? !max : true === roundingIncrement ? !!(roundingIncrement = 0) : !returnFunction, (function() {
            return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + .99 * roundingIncrement)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
        }));
    }, pipe = function pipe() {
        for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) functions[_key] = arguments[_key];
        return function(value) {
            return functions.reduce((function(v, f) {
                return f(v);
            }), value);
        };
    }, unitize = function unitize(func, unit) {
        return function(value) {
            return func(parseFloat(value)) + (unit || getUnit(value));
        };
    }, normalize = function normalize(min, max, value) {
        return mapRange(min, max, 0, 1, value);
    }, _wrapArray = function _wrapArray(a, wrapper, value) {
        return _conditionalReturn(value, (function(index) {
            return a[~~wrapper(index)];
        }));
    }, wrap = function wrap(min, max, value) {
        var range = max - min;
        return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, (function(value) {
            return (range + (value - min) % range) % range + min;
        }));
    }, wrapYoyo = function wrapYoyo(min, max, value) {
        var range = max - min, total = 2 * range;
        return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, (function(value) {
            value = (total + (value - min) % total) % total || 0;
            return min + (value > range ? total - value : value);
        }));
    }, _replaceRandom = function _replaceRandom(value) {
        var i, nums, end, isArray, prev = 0, s = "";
        while (~(i = value.indexOf("random(", prev))) {
            end = value.indexOf(")", i);
            isArray = "[" === value.charAt(i + 7);
            nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
            s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
            prev = end + 1;
        }
        return s + value.substr(prev, value.length - prev);
    }, mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
        var inRange = inMax - inMin, outRange = outMax - outMin;
        return _conditionalReturn(value, (function(value) {
            return outMin + ((value - inMin) / inRange * outRange || 0);
        }));
    }, interpolate = function interpolate(start, end, progress, mutate) {
        var func = isNaN(start + end) ? 0 : function(p) {
            return (1 - p) * start + p * end;
        };
        if (!func) {
            var p, i, interpolators, l, il, isString = _isString(start), master = {};
            true === progress && (mutate = 1) && (progress = null);
            if (isString) {
                start = {
                    p: start
                };
                end = {
                    p: end
                };
            } else if (_isArray(start) && !_isArray(end)) {
                interpolators = [];
                l = start.length;
                il = l - 2;
                for (i = 1; i < l; i++) interpolators.push(interpolate(start[i - 1], start[i]));
                l--;
                func = function func(p) {
                    p *= l;
                    var i = Math.min(il, ~~p);
                    return interpolators[i](p - i);
                };
                progress = end;
            } else if (!mutate) start = _merge(_isArray(start) ? [] : {}, start);
            if (!interpolators) {
                for (p in end) _addPropTween.call(master, start, p, "get", end[p]);
                func = function func(p) {
                    return _renderPropTweens(p, master) || (isString ? start.p : start);
                };
            }
        }
        return _conditionalReturn(progress, func);
    }, _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
        var p, distance, label, labels = timeline.labels, min = _bigNum;
        for (p in labels) {
            distance = labels[p] - fromTime;
            if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
                label = p;
                min = distance;
            }
        }
        return label;
    }, _callback = function _callback(animation, type, executeLazyFirst) {
        var params, scope, result, v = animation.vars, callback = v[type], prevContext = _context, context = animation._ctx;
        if (!callback) return;
        params = v[type + "Params"];
        scope = v.callbackScope || animation;
        executeLazyFirst && _lazyTweens.length && _lazyRender();
        context && (_context = context);
        result = params ? callback.apply(scope, params) : callback.call(scope);
        _context = prevContext;
        return result;
    }, _interrupt = function _interrupt(animation) {
        _removeFromParent(animation);
        animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting);
        animation.progress() < 1 && _callback(animation, "onInterrupt");
        return animation;
    }, _createPlugin = function _createPlugin(config) {
        config = !config.name && config["default"] || config;
        var name = config.name, isFunc = _isFunction(config), Plugin = name && !isFunc && config.init ? function() {
            this._props = [];
        } : config, instanceDefaults = {
            init: _emptyFunc,
            render: _renderPropTweens,
            add: _addPropTween,
            kill: _killPropTweensOf,
            modifier: _addPluginModifier,
            rawVars: 0
        }, statics = {
            targetTest: 0,
            get: 0,
            getSetter: _getSetter,
            aliases: {},
            register: 0
        };
        _wake();
        if (config !== Plugin) {
            if (_plugins[name]) return;
            _setDefaults(Plugin, _setDefaults(_copyExcluding(config, instanceDefaults), statics));
            _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics)));
            _plugins[Plugin.prop = name] = Plugin;
            if (config.targetTest) {
                _harnessPlugins.push(Plugin);
                _reservedProps[name] = 1;
            }
            name = ("css" === name ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin";
        }
        _addGlobal(name, Plugin);
        config.register && config.register(gsap, Plugin, PropTween);
    }, _255 = 255, _colorLookup = {
        aqua: [ 0, _255, _255 ],
        lime: [ 0, _255, 0 ],
        silver: [ 192, 192, 192 ],
        black: [ 0, 0, 0 ],
        maroon: [ 128, 0, 0 ],
        teal: [ 0, 128, 128 ],
        blue: [ 0, 0, _255 ],
        navy: [ 0, 0, 128 ],
        white: [ _255, _255, _255 ],
        olive: [ 128, 128, 0 ],
        yellow: [ _255, _255, 0 ],
        orange: [ _255, 165, 0 ],
        gray: [ 128, 128, 128 ],
        purple: [ 128, 0, 128 ],
        green: [ 0, 128, 0 ],
        red: [ _255, 0, 0 ],
        pink: [ _255, 192, 203 ],
        cyan: [ 0, _255, _255 ],
        transparent: [ _255, _255, _255, 0 ]
    }, _hue = function _hue(h, m1, m2) {
        h += h < 0 ? 1 : h > 1 ? -1 : 0;
        return (6 * h < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : 3 * h < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
    }, splitColor = function splitColor(v, toHSL, forceAlpha) {
        var r, g, b, h, s, l, max, min, d, wasHSL, a = !v ? _colorLookup.black : _isNumber(v) ? [ v >> 16, v >> 8 & _255, v & _255 ] : 0;
        if (!a) {
            if ("," === v.substr(-1)) v = v.substr(0, v.length - 1);
            if (_colorLookup[v]) a = _colorLookup[v]; else if ("#" === v.charAt(0)) {
                if (v.length < 6) {
                    r = v.charAt(1);
                    g = v.charAt(2);
                    b = v.charAt(3);
                    v = "#" + r + r + g + g + b + b + (5 === v.length ? v.charAt(4) + v.charAt(4) : "");
                }
                if (9 === v.length) {
                    a = parseInt(v.substr(1, 6), 16);
                    return [ a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255 ];
                }
                v = parseInt(v.substr(1), 16);
                a = [ v >> 16, v >> 8 & _255, v & _255 ];
            } else if ("hsl" === v.substr(0, 3)) {
                a = wasHSL = v.match(_strictNumExp);
                if (!toHSL) {
                    h = +a[0] % 360 / 360;
                    s = +a[1] / 100;
                    l = +a[2] / 100;
                    g = l <= .5 ? l * (s + 1) : l + s - l * s;
                    r = 2 * l - g;
                    a.length > 3 && (a[3] *= 1);
                    a[0] = _hue(h + 1 / 3, r, g);
                    a[1] = _hue(h, r, g);
                    a[2] = _hue(h - 1 / 3, r, g);
                } else if (~v.indexOf("=")) {
                    a = v.match(_numExp);
                    forceAlpha && a.length < 4 && (a[3] = 1);
                    return a;
                }
            } else a = v.match(_strictNumExp) || _colorLookup.transparent;
            a = a.map(Number);
        }
        if (toHSL && !wasHSL) {
            r = a[0] / _255;
            g = a[1] / _255;
            b = a[2] / _255;
            max = Math.max(r, g, b);
            min = Math.min(r, g, b);
            l = (max + min) / 2;
            if (max === min) h = s = 0; else {
                d = max - min;
                s = l > .5 ? d / (2 - max - min) : d / (max + min);
                h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
                h *= 60;
            }
            a[0] = ~~(h + .5);
            a[1] = ~~(100 * s + .5);
            a[2] = ~~(100 * l + .5);
        }
        forceAlpha && a.length < 4 && (a[3] = 1);
        return a;
    }, _colorOrderData = function _colorOrderData(v) {
        var values = [], c = [], i = -1;
        v.split(_colorExp).forEach((function(v) {
            var a = v.match(_numWithUnitExp) || [];
            values.push.apply(values, a);
            c.push(i += a.length + 1);
        }));
        values.c = c;
        return values;
    }, _formatColors = function _formatColors(s, toHSL, orderMatchData) {
        var c, shell, d, l, result = "", colors = (s + result).match(_colorExp), type = toHSL ? "hsla(" : "rgba(", i = 0;
        if (!colors) return s;
        colors = colors.map((function(color) {
            return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
        }));
        if (orderMatchData) {
            d = _colorOrderData(s);
            c = orderMatchData.c;
            if (c.join(result) !== d.c.join(result)) {
                shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
                l = shell.length - 1;
                for (;i < l; i++) result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
            }
        }
        if (!shell) {
            shell = s.split(_colorExp);
            l = shell.length - 1;
            for (;i < l; i++) result += shell[i] + colors[i];
        }
        return result + shell[l];
    }, _colorExp = function() {
        var p, s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b";
        for (p in _colorLookup) s += "|" + p + "\\b";
        return new RegExp(s + ")", "gi");
    }(), _hslExp = /hsl[a]?\(/, _colorStringFilter = function _colorStringFilter(a) {
        var toHSL, combined = a.join(" ");
        _colorExp.lastIndex = 0;
        if (_colorExp.test(combined)) {
            toHSL = _hslExp.test(combined);
            a[1] = _formatColors(a[1], toHSL);
            a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1]));
            return true;
        }
    }, _ticker = function() {
        var _id, _req, _raf, _self, _delta, _i, _getTime = Date.now, _lagThreshold = 500, _adjustedLag = 33, _startTime = _getTime(), _lastUpdate = _startTime, _gap = 1e3 / 240, _nextTime = _gap, _listeners = [], _tick = function _tick(v) {
            var overlap, dispatch, time, frame, elapsed = _getTime() - _lastUpdate, manual = true === v;
            elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
            _lastUpdate += elapsed;
            time = _lastUpdate - _startTime;
            overlap = time - _nextTime;
            if (overlap > 0 || manual) {
                frame = ++_self.frame;
                _delta = time - 1e3 * _self.time;
                _self.time = time /= 1e3;
                _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
                dispatch = 1;
            }
            manual || (_id = _req(_tick));
            if (dispatch) for (_i = 0; _i < _listeners.length; _i++) _listeners[_i](time, _delta, frame, v);
        };
        _self = {
            time: 0,
            frame: 0,
            tick: function tick() {
                _tick(true);
            },
            deltaRatio: function deltaRatio(fps) {
                return _delta / (1e3 / (fps || 60));
            },
            wake: function wake() {
                if (_coreReady) {
                    if (!_coreInitted && _windowExists()) {
                        _win = _coreInitted = window;
                        _doc = _win.document || {};
                        _globals.gsap = gsap;
                        (_win.gsapVersions || (_win.gsapVersions = [])).push(gsap.version);
                        _install(_installScope || _win.GreenSockGlobals || !_win.gsap && _win || {});
                        _raf = _win.requestAnimationFrame;
                    }
                    _id && _self.sleep();
                    _req = _raf || function(f) {
                        return setTimeout(f, _nextTime - 1e3 * _self.time + 1 | 0);
                    };
                    _tickerActive = 1;
                    _tick(2);
                }
            },
            sleep: function sleep() {
                (_raf ? _win.cancelAnimationFrame : clearTimeout)(_id);
                _tickerActive = 0;
                _req = _emptyFunc;
            },
            lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
                _lagThreshold = threshold || 1 / 0;
                _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
            },
            fps: function fps(_fps) {
                _gap = 1e3 / (_fps || 240);
                _nextTime = 1e3 * _self.time + _gap;
            },
            add: function add(callback, once, prioritize) {
                var func = once ? function(t, d, f, v) {
                    callback(t, d, f, v);
                    _self.remove(func);
                } : callback;
                _self.remove(callback);
                _listeners[prioritize ? "unshift" : "push"](func);
                _wake();
                return func;
            },
            remove: function remove(callback, i) {
                ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
            },
            _listeners
        };
        return _self;
    }(), _wake = function _wake() {
        return !_tickerActive && _ticker.wake();
    }, _easeMap = {}, _customEaseExp = /^[\d.\-M][\d.\-,\s]/, _quotesExp = /["']/g, _parseObjectInString = function _parseObjectInString(value) {
        var index, val, parsedVal, obj = {}, split = value.substr(1, value.length - 3).split(":"), key = split[0], i = 1, l = split.length;
        for (;i < l; i++) {
            val = split[i];
            index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
            parsedVal = val.substr(0, index);
            obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
            key = val.substr(index + 1).trim();
        }
        return obj;
    }, _valueInParentheses = function _valueInParentheses(value) {
        var open = value.indexOf("(") + 1, close = value.indexOf(")"), nested = value.indexOf("(", open);
        return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
    }, _configEaseFromString = function _configEaseFromString(name) {
        var split = (name + "").split("("), ease = _easeMap[split[0]];
        return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [ _parseObjectInString(split[1]) ] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
    }, _invertEase = function _invertEase(ease) {
        return function(p) {
            return 1 - ease(1 - p);
        };
    }, _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
        var ease, child = timeline._first;
        while (child) {
            if (child instanceof Timeline) _propagateYoyoEase(child, isYoyo); else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) if (child.timeline) _propagateYoyoEase(child.timeline, isYoyo); else {
                ease = child._ease;
                child._ease = child._yEase;
                child._yEase = ease;
                child._yoyo = isYoyo;
            }
            child = child._next;
        }
    }, _parseEase = function _parseEase(ease, defaultEase) {
        return !ease ? defaultEase : (_isFunction(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
    }, _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
        if (void 0 === easeOut) easeOut = function easeOut(p) {
            return 1 - easeIn(1 - p);
        };
        if (void 0 === easeInOut) easeInOut = function easeInOut(p) {
            return p < .5 ? easeIn(2 * p) / 2 : 1 - easeIn(2 * (1 - p)) / 2;
        };
        var lowercaseName, ease = {
            easeIn,
            easeOut,
            easeInOut
        };
        _forEachName(names, (function(name) {
            _easeMap[name] = _globals[name] = ease;
            _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
            for (var p in ease) _easeMap[lowercaseName + ("easeIn" === p ? ".in" : "easeOut" === p ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
        }));
        return ease;
    }, _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
        return function(p) {
            return p < .5 ? (1 - easeOut(1 - 2 * p)) / 2 : .5 + easeOut(2 * (p - .5)) / 2;
        };
    }, _configElastic = function _configElastic(type, amplitude, period) {
        var p1 = amplitude >= 1 ? amplitude : 1, p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1), p3 = p2 / _2PI * (Math.asin(1 / p1) || 0), easeOut = function easeOut(p) {
            return 1 === p ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
        }, ease = "out" === type ? easeOut : "in" === type ? function(p) {
            return 1 - easeOut(1 - p);
        } : _easeInOutFromOut(easeOut);
        p2 = _2PI / p2;
        ease.config = function(amplitude, period) {
            return _configElastic(type, amplitude, period);
        };
        return ease;
    }, _configBack = function _configBack(type, overshoot) {
        if (void 0 === overshoot) overshoot = 1.70158;
        var easeOut = function easeOut(p) {
            return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
        }, ease = "out" === type ? easeOut : "in" === type ? function(p) {
            return 1 - easeOut(1 - p);
        } : _easeInOutFromOut(easeOut);
        ease.config = function(overshoot) {
            return _configBack(type, overshoot);
        };
        return ease;
    };
    _forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", (function(name, i) {
        var power = i < 5 ? i + 1 : i;
        _insertEase(name + ",Power" + (power - 1), i ? function(p) {
            return Math.pow(p, power);
        } : function(p) {
            return p;
        }, (function(p) {
            return 1 - Math.pow(1 - p, power);
        }), (function(p) {
            return p < .5 ? Math.pow(2 * p, power) / 2 : 1 - Math.pow(2 * (1 - p), power) / 2;
        }));
    }));
    _easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
    _insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
    (function(n, c) {
        var n1 = 1 / c, n2 = 2 * n1, n3 = 2.5 * n1, easeOut = function easeOut(p) {
            return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
        };
        _insertEase("Bounce", (function(p) {
            return 1 - easeOut(1 - p);
        }), easeOut);
    })(7.5625, 2.75);
    _insertEase("Expo", (function(p) {
        return p ? Math.pow(2, 10 * (p - 1)) : 0;
    }));
    _insertEase("Circ", (function(p) {
        return -(_sqrt(1 - p * p) - 1);
    }));
    _insertEase("Sine", (function(p) {
        return 1 === p ? 1 : -_cos(p * _HALF_PI) + 1;
    }));
    _insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
    _easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
        config: function config(steps, immediateStart) {
            if (void 0 === steps) steps = 1;
            var p1 = 1 / steps, p2 = steps + (immediateStart ? 0 : 1), p3 = immediateStart ? 1 : 0, max = 1 - _tinyNum;
            return function(p) {
                return ((p2 * _clamp(0, max, p) | 0) + p3) * p1;
            };
        }
    };
    _defaults.ease = _easeMap["quad.out"];
    _forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", (function(name) {
        return _callbackNames += name + "," + name + "Params,";
    }));
    var GSCache = function GSCache(target, harness) {
        this.id = _gsID++;
        target._gsap = this;
        this.target = target;
        this.harness = harness;
        this.get = harness ? harness.get : _getProperty;
        this.set = harness ? harness.getSetter : _getSetter;
    };
    var Animation = function() {
        function Animation(vars) {
            this.vars = vars;
            this._delay = +vars.delay || 0;
            if (this._repeat = vars.repeat === 1 / 0 ? -2 : vars.repeat || 0) {
                this._rDelay = vars.repeatDelay || 0;
                this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
            }
            this._ts = 1;
            _setDuration(this, +vars.duration, 1, 1);
            this.data = vars.data;
            if (_context) {
                this._ctx = _context;
                _context.data.push(this);
            }
            _tickerActive || _ticker.wake();
        }
        var _proto = Animation.prototype;
        _proto.delay = function delay(value) {
            if (value || 0 === value) {
                this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
                this._delay = value;
                return this;
            }
            return this._delay;
        };
        _proto.duration = function duration(value) {
            return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
        };
        _proto.totalDuration = function totalDuration(value) {
            if (!arguments.length) return this._tDur;
            this._dirty = 0;
            return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
        };
        _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
            _wake();
            if (!arguments.length) return this._tTime;
            var parent = this._dp;
            if (parent && parent.smoothChildTiming && this._ts) {
                _alignPlayhead(this, _totalTime);
                !parent._dp || parent.parent || _postAddChecks(parent, this);
                while (parent && parent.parent) {
                    if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) parent.totalTime(parent._tTime, true);
                    parent = parent.parent;
                }
                if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) _addToTimeline(this._dp, this, this._start - this._delay);
            }
            if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
                this._ts || (this._pTime = _totalTime);
                _lazySafeRender(this, _totalTime, suppressEvents);
            }
            return this;
        };
        _proto.time = function time(value, suppressEvents) {
            return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time;
        };
        _proto.totalProgress = function totalProgress(value, suppressEvents) {
            return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
        };
        _proto.progress = function progress(value, suppressEvents) {
            return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(1 & this.iteration()) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
        };
        _proto.iteration = function iteration(value, suppressEvents) {
            var cycleDuration = this.duration() + this._rDelay;
            return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
        };
        _proto.timeScale = function timeScale(value) {
            if (!arguments.length) return this._rts === -_tinyNum ? 0 : this._rts;
            if (this._rts === value) return this;
            var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime;
            this._rts = +value || 0;
            this._ts = this._ps || value === -_tinyNum ? 0 : this._rts;
            this.totalTime(_clamp(-this._delay, this._tDur, tTime), true);
            _setEnd(this);
            return _recacheAncestors(this);
        };
        _proto.paused = function paused(value) {
            if (!arguments.length) return this._ps;
            if (this._ps !== value) {
                this._ps = value;
                if (value) {
                    this._pTime = this._tTime || Math.max(-this._delay, this.rawTime());
                    this._ts = this._act = 0;
                } else {
                    _wake();
                    this._ts = this._rts;
                    this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, 1 === this.progress() && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum));
                }
            }
            return this;
        };
        _proto.startTime = function startTime(value) {
            if (arguments.length) {
                this._start = value;
                var parent = this.parent || this._dp;
                parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
                return this;
            }
            return this._start;
        };
        _proto.endTime = function endTime(includeRepeats) {
            return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
        };
        _proto.rawTime = function rawTime(wrapRepeats) {
            var parent = this.parent || this._dp;
            return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
        };
        _proto.revert = function revert(config) {
            if (void 0 === config) config = _revertConfig;
            var prevIsReverting = _reverting;
            _reverting = config;
            if (this._initted || this._startAt) {
                this.timeline && this.timeline.revert(config);
                this.totalTime(-.01, config.suppressEvents);
            }
            "nested" !== this.data && false !== config.kill && this.kill();
            _reverting = prevIsReverting;
            return this;
        };
        _proto.globalTime = function globalTime(rawTime) {
            var animation = this, time = arguments.length ? rawTime : animation.rawTime();
            while (animation) {
                time = animation._start + time / (animation._ts || 1);
                animation = animation._dp;
            }
            return !this.parent && this._sat ? this._sat.vars.immediateRender ? -1 : this._sat.globalTime(rawTime) : time;
        };
        _proto.repeat = function repeat(value) {
            if (arguments.length) {
                this._repeat = value === 1 / 0 ? -2 : value;
                return _onUpdateTotalDuration(this);
            }
            return -2 === this._repeat ? 1 / 0 : this._repeat;
        };
        _proto.repeatDelay = function repeatDelay(value) {
            if (arguments.length) {
                var time = this._time;
                this._rDelay = value;
                _onUpdateTotalDuration(this);
                return time ? this.time(time) : this;
            }
            return this._rDelay;
        };
        _proto.yoyo = function yoyo(value) {
            if (arguments.length) {
                this._yoyo = value;
                return this;
            }
            return this._yoyo;
        };
        _proto.seek = function seek(position, suppressEvents) {
            return this.totalTime(_parsePosition(this, position), _isNotFalse(suppressEvents));
        };
        _proto.restart = function restart(includeDelay, suppressEvents) {
            return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
        };
        _proto.play = function play(from, suppressEvents) {
            null != from && this.seek(from, suppressEvents);
            return this.reversed(false).paused(false);
        };
        _proto.reverse = function reverse(from, suppressEvents) {
            null != from && this.seek(from || this.totalDuration(), suppressEvents);
            return this.reversed(true).paused(false);
        };
        _proto.pause = function pause(atTime, suppressEvents) {
            null != atTime && this.seek(atTime, suppressEvents);
            return this.paused(true);
        };
        _proto.resume = function resume() {
            return this.paused(false);
        };
        _proto.reversed = function reversed(value) {
            if (arguments.length) {
                !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0));
                return this;
            }
            return this._rts < 0;
        };
        _proto.invalidate = function invalidate() {
            this._initted = this._act = 0;
            this._zTime = -_tinyNum;
            return this;
        };
        _proto.isActive = function isActive() {
            var rawTime, parent = this.parent || this._dp, start = this._start;
            return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
        };
        _proto.eventCallback = function eventCallback(type, callback, params) {
            var vars = this.vars;
            if (arguments.length > 1) {
                if (!callback) delete vars[type]; else {
                    vars[type] = callback;
                    params && (vars[type + "Params"] = params);
                    "onUpdate" === type && (this._onUpdate = callback);
                }
                return this;
            }
            return vars[type];
        };
        _proto.then = function then(onFulfilled) {
            var self = this;
            return new Promise((function(resolve) {
                var f = _isFunction(onFulfilled) ? onFulfilled : _passThrough, _resolve = function _resolve() {
                    var _then = self.then;
                    self.then = null;
                    _isFunction(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
                    resolve(f);
                    self.then = _then;
                };
                if (self._initted && 1 === self.totalProgress() && self._ts >= 0 || !self._tTime && self._ts < 0) _resolve(); else self._prom = _resolve;
            }));
        };
        _proto.kill = function kill() {
            _interrupt(this);
        };
        return Animation;
    }();
    _setDefaults(Animation.prototype, {
        _time: 0,
        _start: 0,
        _end: 0,
        _tTime: 0,
        _tDur: 0,
        _dirty: 0,
        _repeat: 0,
        _yoyo: false,
        parent: null,
        _initted: false,
        _rDelay: 0,
        _ts: 1,
        _dp: 0,
        ratio: 0,
        _zTime: -_tinyNum,
        _prom: 0,
        _ps: false,
        _rts: 1
    });
    var Timeline = function(_Animation) {
        _inheritsLoose(Timeline, _Animation);
        function Timeline(vars, position) {
            var _this;
            if (void 0 === vars) vars = {};
            _this = _Animation.call(this, vars) || this;
            _this.labels = {};
            _this.smoothChildTiming = !!vars.smoothChildTiming;
            _this.autoRemoveChildren = !!vars.autoRemoveChildren;
            _this._sort = _isNotFalse(vars.sortChildren);
            _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
            vars.reversed && _this.reverse();
            vars.paused && _this.paused(true);
            vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
            return _this;
        }
        var _proto2 = Timeline.prototype;
        _proto2.to = function to(targets, vars, position) {
            _createTweenType(0, arguments, this);
            return this;
        };
        _proto2.from = function from(targets, vars, position) {
            _createTweenType(1, arguments, this);
            return this;
        };
        _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
            _createTweenType(2, arguments, this);
            return this;
        };
        _proto2.set = function set(targets, vars, position) {
            vars.duration = 0;
            vars.parent = this;
            _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
            vars.immediateRender = !!vars.immediateRender;
            new Tween(targets, vars, _parsePosition(this, position), 1);
            return this;
        };
        _proto2.call = function call(callback, params, position) {
            return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
        };
        _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
            vars.duration = duration;
            vars.stagger = vars.stagger || stagger;
            vars.onComplete = onCompleteAll;
            vars.onCompleteParams = onCompleteAllParams;
            vars.parent = this;
            new Tween(targets, vars, _parsePosition(this, position));
            return this;
        };
        _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
            vars.runBackwards = 1;
            _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
            return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
        };
        _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
            toVars.startAt = fromVars;
            _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
            return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
        };
        _proto2.render = function render(totalTime, suppressEvents, force) {
            var time, child, next, iteration, cycleDuration, prevPaused, pauseTween, timeScale, prevStart, prevIteration, yoyo, isYoyo, prevTime = this._time, tDur = this._dirty ? this.totalDuration() : this._tDur, dur = this._dur, tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime), crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur);
            this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
            if (tTime !== this._tTime || force || crossingStart) {
                if (prevTime !== this._time && dur) {
                    tTime += this._time - prevTime;
                    totalTime += this._time - prevTime;
                }
                time = tTime;
                prevStart = this._start;
                timeScale = this._ts;
                prevPaused = !timeScale;
                if (crossingStart) {
                    dur || (prevTime = this._zTime);
                    (totalTime || !suppressEvents) && (this._zTime = totalTime);
                }
                if (this._repeat) {
                    yoyo = this._yoyo;
                    cycleDuration = dur + this._rDelay;
                    if (this._repeat < -1 && totalTime < 0) return this.totalTime(100 * cycleDuration + totalTime, suppressEvents, force);
                    time = _roundPrecise(tTime % cycleDuration);
                    if (tTime === tDur) {
                        iteration = this._repeat;
                        time = dur;
                    } else {
                        iteration = ~~(tTime / cycleDuration);
                        if (iteration && iteration === tTime / cycleDuration) {
                            time = dur;
                            iteration--;
                        }
                        time > dur && (time = dur);
                    }
                    prevIteration = _animationCycle(this._tTime, cycleDuration);
                    !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration);
                    if (yoyo && 1 & iteration) {
                        time = dur - time;
                        isYoyo = 1;
                    }
                    if (iteration !== prevIteration && !this._lock) {
                        var rewinding = yoyo && 1 & prevIteration, doesWrap = rewinding === (yoyo && 1 & iteration);
                        iteration < prevIteration && (rewinding = !rewinding);
                        prevTime = rewinding ? 0 : dur;
                        this._lock = 1;
                        this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
                        this._tTime = tTime;
                        !suppressEvents && this.parent && _callback(this, "onRepeat");
                        this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
                        if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) return this;
                        dur = this._dur;
                        tDur = this._tDur;
                        if (doesWrap) {
                            this._lock = 2;
                            prevTime = rewinding ? dur : -1e-4;
                            this.render(prevTime, true);
                            this.vars.repeatRefresh && !isYoyo && this.invalidate();
                        }
                        this._lock = 0;
                        if (!this._ts && !prevPaused) return this;
                        _propagateYoyoEase(this, isYoyo);
                    }
                }
                if (this._hasPause && !this._forcing && this._lock < 2) {
                    pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
                    if (pauseTween) tTime -= time - (time = pauseTween._start);
                }
                this._tTime = tTime;
                this._time = time;
                this._act = !timeScale;
                if (!this._initted) {
                    this._onUpdate = this.vars.onUpdate;
                    this._initted = 1;
                    this._zTime = totalTime;
                    prevTime = 0;
                }
                if (!prevTime && time && !suppressEvents) {
                    _callback(this, "onStart");
                    if (this._tTime !== tTime) return this;
                }
                if (time >= prevTime && totalTime >= 0) {
                    child = this._first;
                    while (child) {
                        next = child._next;
                        if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
                            if (child.parent !== this) return this.render(totalTime, suppressEvents, force);
                            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
                            if (time !== this._time || !this._ts && !prevPaused) {
                                pauseTween = 0;
                                next && (tTime += this._zTime = -_tinyNum);
                                break;
                            }
                        }
                        child = next;
                    }
                } else {
                    child = this._last;
                    var adjustedTime = totalTime < 0 ? totalTime : time;
                    while (child) {
                        next = child._prev;
                        if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
                            if (child.parent !== this) return this.render(totalTime, suppressEvents, force);
                            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting && (child._initted || child._startAt));
                            if (time !== this._time || !this._ts && !prevPaused) {
                                pauseTween = 0;
                                next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum);
                                break;
                            }
                        }
                        child = next;
                    }
                }
                if (pauseTween && !suppressEvents) {
                    this.pause();
                    pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
                    if (this._ts) {
                        this._start = prevStart;
                        _setEnd(this);
                        return this.render(totalTime, suppressEvents, force);
                    }
                }
                this._onUpdate && !suppressEvents && _callback(this, "onUpdate", true);
                if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
                    (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
                    if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
                        _callback(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
                        this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
                    }
                }
            }
            return this;
        };
        _proto2.add = function add(child, position) {
            var _this2 = this;
            _isNumber(position) || (position = _parsePosition(this, position, child));
            if (!(child instanceof Animation)) {
                if (_isArray(child)) {
                    child.forEach((function(obj) {
                        return _this2.add(obj, position);
                    }));
                    return this;
                }
                if (_isString(child)) return this.addLabel(child, position);
                if (_isFunction(child)) child = Tween.delayedCall(0, child); else return this;
            }
            return this !== child ? _addToTimeline(this, child, position) : this;
        };
        _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
            if (void 0 === nested) nested = true;
            if (void 0 === tweens) tweens = true;
            if (void 0 === timelines) timelines = true;
            if (void 0 === ignoreBeforeTime) ignoreBeforeTime = -_bigNum;
            var a = [], child = this._first;
            while (child) {
                if (child._start >= ignoreBeforeTime) if (child instanceof Tween) tweens && a.push(child); else {
                    timelines && a.push(child);
                    nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
                }
                child = child._next;
            }
            return a;
        };
        _proto2.getById = function getById(id) {
            var animations = this.getChildren(1, 1, 1), i = animations.length;
            while (i--) if (animations[i].vars.id === id) return animations[i];
        };
        _proto2.remove = function remove(child) {
            if (_isString(child)) return this.removeLabel(child);
            if (_isFunction(child)) return this.killTweensOf(child);
            _removeLinkedListItem(this, child);
            if (child === this._recent) this._recent = this._last;
            return _uncache(this);
        };
        _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
            if (!arguments.length) return this._tTime;
            this._forcing = 1;
            if (!this._dp && this._ts) this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
            _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
            this._forcing = 0;
            return this;
        };
        _proto2.addLabel = function addLabel(label, position) {
            this.labels[label] = _parsePosition(this, position);
            return this;
        };
        _proto2.removeLabel = function removeLabel(label) {
            delete this.labels[label];
            return this;
        };
        _proto2.addPause = function addPause(position, callback, params) {
            var t = Tween.delayedCall(0, callback || _emptyFunc, params);
            t.data = "isPause";
            this._hasPause = 1;
            return _addToTimeline(this, t, _parsePosition(this, position));
        };
        _proto2.removePause = function removePause(position) {
            var child = this._first;
            position = _parsePosition(this, position);
            while (child) {
                if (child._start === position && "isPause" === child.data) _removeFromParent(child);
                child = child._next;
            }
        };
        _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
            var tweens = this.getTweensOf(targets, onlyActive), i = tweens.length;
            while (i--) _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
            return this;
        };
        _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
            var children, a = [], parsedTargets = toArray(targets), child = this._first, isGlobalTime = _isNumber(onlyActive);
            while (child) {
                if (child instanceof Tween) {
                    if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) a.push(child);
                } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) a.push.apply(a, children);
                child = child._next;
            }
            return a;
        };
        _proto2.tweenTo = function tweenTo(position, vars) {
            vars = vars || {};
            var initted, tl = this, endTime = _parsePosition(tl, position), _vars = vars, startAt = _vars.startAt, _onStart = _vars.onStart, onStartParams = _vars.onStartParams, immediateRender = _vars.immediateRender, tween = Tween.to(tl, _setDefaults({
                ease: vars.ease || "none",
                lazy: false,
                immediateRender: false,
                time: endTime,
                overwrite: "auto",
                duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
                onStart: function onStart() {
                    tl.pause();
                    if (!initted) {
                        var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
                        tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
                        initted = 1;
                    }
                    _onStart && _onStart.apply(tween, onStartParams || []);
                }
            }, vars));
            return immediateRender ? tween.render(0) : tween;
        };
        _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
            return this.tweenTo(toPosition, _setDefaults({
                startAt: {
                    time: _parsePosition(this, fromPosition)
                }
            }, vars));
        };
        _proto2.recent = function recent() {
            return this._recent;
        };
        _proto2.nextLabel = function nextLabel(afterTime) {
            if (void 0 === afterTime) afterTime = this._time;
            return _getLabelInDirection(this, _parsePosition(this, afterTime));
        };
        _proto2.previousLabel = function previousLabel(beforeTime) {
            if (void 0 === beforeTime) beforeTime = this._time;
            return _getLabelInDirection(this, _parsePosition(this, beforeTime), 1);
        };
        _proto2.currentLabel = function currentLabel(value) {
            return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
        };
        _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
            if (void 0 === ignoreBeforeTime) ignoreBeforeTime = 0;
            var p, child = this._first, labels = this.labels;
            while (child) {
                if (child._start >= ignoreBeforeTime) {
                    child._start += amount;
                    child._end += amount;
                }
                child = child._next;
            }
            if (adjustLabels) for (p in labels) if (labels[p] >= ignoreBeforeTime) labels[p] += amount;
            return _uncache(this);
        };
        _proto2.invalidate = function invalidate(soft) {
            var child = this._first;
            this._lock = 0;
            while (child) {
                child.invalidate(soft);
                child = child._next;
            }
            return _Animation.prototype.invalidate.call(this, soft);
        };
        _proto2.clear = function clear(includeLabels) {
            if (void 0 === includeLabels) includeLabels = true;
            var next, child = this._first;
            while (child) {
                next = child._next;
                this.remove(child);
                child = next;
            }
            this._dp && (this._time = this._tTime = this._pTime = 0);
            includeLabels && (this.labels = {});
            return _uncache(this);
        };
        _proto2.totalDuration = function totalDuration(value) {
            var prev, start, parent, max = 0, self = this, child = self._last, prevStart = _bigNum;
            if (arguments.length) return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
            if (self._dirty) {
                parent = self.parent;
                while (child) {
                    prev = child._prev;
                    child._dirty && child.totalDuration();
                    start = child._start;
                    if (start > prevStart && self._sort && child._ts && !self._lock) {
                        self._lock = 1;
                        _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
                    } else prevStart = start;
                    if (start < 0 && child._ts) {
                        max -= start;
                        if (!parent && !self._dp || parent && parent.smoothChildTiming) {
                            self._start += start / self._ts;
                            self._time -= start;
                            self._tTime -= start;
                        }
                        self.shiftChildren(-start, false, -Infinity);
                        prevStart = 0;
                    }
                    child._end > max && child._ts && (max = child._end);
                    child = prev;
                }
                _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);
                self._dirty = 0;
            }
            return self._tDur;
        };
        Timeline.updateRoot = function updateRoot(time) {
            if (_globalTimeline._ts) {
                _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
                _lastRenderedFrame = _ticker.frame;
            }
            if (_ticker.frame >= _nextGCFrame) {
                _nextGCFrame += _config.autoSleep || 120;
                var child = _globalTimeline._first;
                if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
                    while (child && !child._ts) child = child._next;
                    child || _ticker.sleep();
                }
            }
        };
        return Timeline;
    }(Animation);
    _setDefaults(Timeline.prototype, {
        _lock: 0,
        _hasPause: 0,
        _forcing: 0
    });
    var _overwritingTween, _forceAllPropTweens, _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
        var result, startNums, color, endNum, chunk, startNum, hasRandom, a, pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter), index = 0, matchIndex = 0;
        pt.b = start;
        pt.e = end;
        start += "";
        end += "";
        if (hasRandom = ~end.indexOf("random(")) end = _replaceRandom(end);
        if (stringFilter) {
            a = [ start, end ];
            stringFilter(a, target, prop);
            start = a[0];
            end = a[1];
        }
        startNums = start.match(_complexStringNumExp) || [];
        while (result = _complexStringNumExp.exec(end)) {
            endNum = result[0];
            chunk = end.substring(index, result.index);
            if (color) color = (color + 1) % 5; else if ("rgba(" === chunk.substr(-5)) color = 1;
            if (endNum !== startNums[matchIndex++]) {
                startNum = parseFloat(startNums[matchIndex - 1]) || 0;
                pt._pt = {
                    _next: pt._pt,
                    p: chunk || 1 === matchIndex ? chunk : ",",
                    s: startNum,
                    c: "=" === endNum.charAt(1) ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
                    m: color && color < 4 ? Math.round : 0
                };
                index = _complexStringNumExp.lastIndex;
            }
        }
        pt.c = index < end.length ? end.substring(index, end.length) : "";
        pt.fp = funcParam;
        if (_relExp.test(end) || hasRandom) pt.e = 0;
        this._pt = pt;
        return pt;
    }, _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
        _isFunction(end) && (end = end(index || 0, target, targets));
        var pt, currentValue = target[prop], parsedStart = "get" !== start ? start : !_isFunction(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](), setter = !_isFunction(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc;
        if (_isString(end)) {
            if (~end.indexOf("random(")) end = _replaceRandom(end);
            if ("=" === end.charAt(1)) {
                pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
                if (pt || 0 === pt) end = pt;
            }
        }
        if (!optional || parsedStart !== end || _forceAllPropTweens) {
            if (!isNaN(parsedStart * end) && "" !== end) {
                pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), "boolean" === typeof currentValue ? _renderBoolean : _renderPlain, 0, setter);
                funcParam && (pt.fp = funcParam);
                modifier && pt.modifier(modifier, this, target);
                return this._pt = pt;
            }
            !currentValue && !(prop in target) && _missingPlugin(prop, end);
            return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
        }
    }, _processVars = function _processVars(vars, index, target, targets, tween) {
        _isFunction(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
        if (!_isObject(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) return _isString(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
        var p, copy = {};
        for (p in vars) copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
        return copy;
    }, _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
        var plugin, pt, ptLookup, i;
        if (_plugins[property] && false !== (plugin = new _plugins[property]).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets)) {
            tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
            if (tween !== _quickTween) {
                ptLookup = tween._ptLookup[tween._targets.indexOf(target)];
                i = plugin._props.length;
                while (i--) ptLookup[plugin._props[i]] = pt;
            }
        }
        return plugin;
    }, _initTween = function _initTween(tween, time, tTime) {
        var cleanVars, i, p, pt, target, hasPriority, gsData, harness, plugin, ptLookup, index, harnessVars, overwritten, vars = tween.vars, ease = vars.ease, startAt = vars.startAt, immediateRender = vars.immediateRender, lazy = vars.lazy, onUpdate = vars.onUpdate, onUpdateParams = vars.onUpdateParams, callbackScope = vars.callbackScope, runBackwards = vars.runBackwards, yoyoEase = vars.yoyoEase, keyframes = vars.keyframes, autoRevert = vars.autoRevert, dur = tween._dur, prevStartAt = tween._startAt, targets = tween._targets, parent = tween.parent, fullTargets = parent && "nested" === parent.data ? parent.vars.targets : targets, autoOverwrite = "auto" === tween._overwrite && !_suppressOverwrites, tl = tween.timeline;
        tl && (!keyframes || !ease) && (ease = "none");
        tween._ease = _parseEase(ease, _defaults.ease);
        tween._yEase = yoyoEase ? _invertEase(_parseEase(true === yoyoEase ? ease : yoyoEase, _defaults.ease)) : 0;
        if (yoyoEase && tween._yoyo && !tween._repeat) {
            yoyoEase = tween._yEase;
            tween._yEase = tween._ease;
            tween._ease = yoyoEase;
        }
        tween._from = !tl && !!vars.runBackwards;
        if (!tl || keyframes && !vars.stagger) {
            harness = targets[0] ? _getCache(targets[0]).harness : 0;
            harnessVars = harness && vars[harness.prop];
            cleanVars = _copyExcluding(vars, _reservedProps);
            if (prevStartAt) {
                prevStartAt._zTime < 0 && prevStartAt.progress(1);
                time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig);
                prevStartAt._lazy = 0;
            }
            if (startAt) {
                _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults({
                    data: "isStart",
                    overwrite: false,
                    parent,
                    immediateRender: true,
                    lazy: !prevStartAt && _isNotFalse(lazy),
                    startAt: null,
                    delay: 0,
                    onUpdate,
                    onUpdateParams,
                    callbackScope,
                    stagger: 0
                }, startAt)));
                tween._startAt._dp = 0;
                tween._startAt._sat = tween;
                time < 0 && (_reverting || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill);
                if (immediateRender) if (dur && time <= 0 && tTime <= 0) {
                    time && (tween._zTime = time);
                    return;
                }
            } else if (runBackwards && dur) if (!prevStartAt) {
                time && (immediateRender = false);
                p = _setDefaults({
                    overwrite: false,
                    data: "isFromStart",
                    lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
                    immediateRender,
                    stagger: 0,
                    parent
                }, cleanVars);
                harnessVars && (p[harness.prop] = harnessVars);
                _removeFromParent(tween._startAt = Tween.set(targets, p));
                tween._startAt._dp = 0;
                tween._startAt._sat = tween;
                time < 0 && (_reverting ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
                tween._zTime = time;
                if (!immediateRender) _initTween(tween._startAt, _tinyNum, _tinyNum); else if (!time) return;
            }
            tween._pt = tween._ptCache = 0;
            lazy = dur && _isNotFalse(lazy) || lazy && !dur;
            for (i = 0; i < targets.length; i++) {
                target = targets[i];
                gsData = target._gsap || _harness(targets)[i]._gsap;
                tween._ptLookup[i] = ptLookup = {};
                _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender();
                index = fullTargets === targets ? i : fullTargets.indexOf(target);
                if (harness && false !== (plugin = new harness).init(target, harnessVars || cleanVars, tween, index, fullTargets)) {
                    tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
                    plugin._props.forEach((function(name) {
                        ptLookup[name] = pt;
                    }));
                    plugin.priority && (hasPriority = 1);
                }
                if (!harness || harnessVars) for (p in cleanVars) if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) plugin.priority && (hasPriority = 1); else ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
                tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
                if (autoOverwrite && tween._pt) {
                    _overwritingTween = tween;
                    _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time));
                    overwritten = !tween.parent;
                    _overwritingTween = 0;
                }
                tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
            }
            hasPriority && _sortPropTweensByPriority(tween);
            tween._onInit && tween._onInit(tween);
        }
        tween._onUpdate = onUpdate;
        tween._initted = (!tween._op || tween._pt) && !overwritten;
        keyframes && time <= 0 && tl.render(_bigNum, true, true);
    }, _updatePropTweens = function _updatePropTweens(tween, property, value, start, startIsRelative, ratio, time) {
        var pt, rootPT, lookup, i, ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property];
        if (!ptCache) {
            ptCache = tween._ptCache[property] = [];
            lookup = tween._ptLookup;
            i = tween._targets.length;
            while (i--) {
                pt = lookup[i][property];
                if (pt && pt.d && pt.d._pt) {
                    pt = pt.d._pt;
                    while (pt && pt.p !== property && pt.fp !== property) pt = pt._next;
                }
                if (!pt) {
                    _forceAllPropTweens = 1;
                    tween.vars[property] = "+=0";
                    _initTween(tween, time);
                    _forceAllPropTweens = 0;
                    return 1;
                }
                ptCache.push(pt);
            }
        }
        i = ptCache.length;
        while (i--) {
            rootPT = ptCache[i];
            pt = rootPT._pt || rootPT;
            pt.s = (start || 0 === start) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
            pt.c = value - pt.s;
            rootPT.e && (rootPT.e = _round(value) + getUnit(rootPT.e));
            rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b));
        }
    }, _addAliasesToVars = function _addAliasesToVars(targets, vars) {
        var copy, p, i, aliases, harness = targets[0] ? _getCache(targets[0]).harness : 0, propertyAliases = harness && harness.aliases;
        if (!propertyAliases) return vars;
        copy = _merge({}, vars);
        for (p in propertyAliases) if (p in copy) {
            aliases = propertyAliases[p].split(",");
            i = aliases.length;
            while (i--) copy[aliases[i]] = copy[p];
        }
        return copy;
    }, _parseKeyframe = function _parseKeyframe(prop, obj, allProps, easeEach) {
        var p, a, ease = obj.ease || easeEach || "power1.inOut";
        if (_isArray(obj)) {
            a = allProps[prop] || (allProps[prop] = []);
            obj.forEach((function(value, i) {
                return a.push({
                    t: i / (obj.length - 1) * 100,
                    v: value,
                    e: ease
                });
            }));
        } else for (p in obj) {
            a = allProps[p] || (allProps[p] = []);
            "ease" === p || a.push({
                t: parseFloat(prop),
                v: obj[p],
                e: ease
            });
        }
    }, _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
        return _isFunction(value) ? value.call(tween, i, target, targets) : _isString(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
    }, _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", _staggerPropsToSkip = {};
    _forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", (function(name) {
        return _staggerPropsToSkip[name] = 1;
    }));
    var Tween = function(_Animation2) {
        _inheritsLoose(Tween, _Animation2);
        function Tween(targets, vars, position, skipInherit) {
            var _this3;
            if ("number" === typeof vars) {
                position.duration = vars;
                vars = position;
                position = null;
            }
            _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
            var tl, i, copy, l, p, curTarget, staggerFunc, staggerVarsToMerge, _this3$vars = _this3.vars, duration = _this3$vars.duration, delay = _this3$vars.delay, immediateRender = _this3$vars.immediateRender, stagger = _this3$vars.stagger, overwrite = _this3$vars.overwrite, keyframes = _this3$vars.keyframes, defaults = _this3$vars.defaults, scrollTrigger = _this3$vars.scrollTrigger, yoyoEase = _this3$vars.yoyoEase, parent = vars.parent || _globalTimeline, parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber(targets[0]) : "length" in vars) ? [ targets ] : toArray(targets);
            _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
            _this3._ptLookup = [];
            _this3._overwrite = overwrite;
            if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
                vars = _this3.vars;
                tl = _this3.timeline = new Timeline({
                    data: "nested",
                    defaults: defaults || {},
                    targets: parent && "nested" === parent.data ? parent.vars.targets : parsedTargets
                });
                tl.kill();
                tl.parent = tl._dp = _assertThisInitialized(_this3);
                tl._start = 0;
                if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
                    l = parsedTargets.length;
                    staggerFunc = stagger && distribute(stagger);
                    if (_isObject(stagger)) for (p in stagger) if (~_staggerTweenProps.indexOf(p)) {
                        staggerVarsToMerge || (staggerVarsToMerge = {});
                        staggerVarsToMerge[p] = stagger[p];
                    }
                    for (i = 0; i < l; i++) {
                        copy = _copyExcluding(vars, _staggerPropsToSkip);
                        copy.stagger = 0;
                        yoyoEase && (copy.yoyoEase = yoyoEase);
                        staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
                        curTarget = parsedTargets[i];
                        copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
                        copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
                        if (!stagger && 1 === l && copy.delay) {
                            _this3._delay = delay = copy.delay;
                            _this3._start += delay;
                            copy.delay = 0;
                        }
                        tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
                        tl._ease = _easeMap.none;
                    }
                    tl.duration() ? duration = delay = 0 : _this3.timeline = 0;
                } else if (keyframes) {
                    _inheritDefaults(_setDefaults(tl.vars.defaults, {
                        ease: "none"
                    }));
                    tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
                    var a, kf, v, time = 0;
                    if (_isArray(keyframes)) {
                        keyframes.forEach((function(frame) {
                            return tl.to(parsedTargets, frame, ">");
                        }));
                        tl.duration();
                    } else {
                        copy = {};
                        for (p in keyframes) "ease" === p || "easeEach" === p || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
                        for (p in copy) {
                            a = copy[p].sort((function(a, b) {
                                return a.t - b.t;
                            }));
                            time = 0;
                            for (i = 0; i < a.length; i++) {
                                kf = a[i];
                                v = {
                                    ease: kf.e,
                                    duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
                                };
                                v[p] = kf.v;
                                tl.to(parsedTargets, v, time);
                                time += v.duration;
                            }
                        }
                        tl.duration() < duration && tl.to({}, {
                            duration: duration - tl.duration()
                        });
                    }
                }
                duration || _this3.duration(duration = tl.duration());
            } else _this3.timeline = 0;
            if (true === overwrite && !_suppressOverwrites) {
                _overwritingTween = _assertThisInitialized(_this3);
                _globalTimeline.killTweensOf(parsedTargets);
                _overwritingTween = 0;
            }
            _addToTimeline(parent, _assertThisInitialized(_this3), position);
            vars.reversed && _this3.reverse();
            vars.paused && _this3.paused(true);
            if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && "nested" !== parent.data) {
                _this3._tTime = -_tinyNum;
                _this3.render(Math.max(0, -delay) || 0);
            }
            scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
            return _this3;
        }
        var _proto3 = Tween.prototype;
        _proto3.render = function render(totalTime, suppressEvents, force) {
            var time, pt, iteration, cycleDuration, prevIteration, isYoyo, ratio, timeline, yoyoEase, prevTime = this._time, tDur = this._tDur, dur = this._dur, isNegative = totalTime < 0, tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime;
            if (!dur) _renderZeroDurationTween(this, totalTime, suppressEvents, force); else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative) {
                time = tTime;
                timeline = this.timeline;
                if (this._repeat) {
                    cycleDuration = dur + this._rDelay;
                    if (this._repeat < -1 && isNegative) return this.totalTime(100 * cycleDuration + totalTime, suppressEvents, force);
                    time = _roundPrecise(tTime % cycleDuration);
                    if (tTime === tDur) {
                        iteration = this._repeat;
                        time = dur;
                    } else {
                        iteration = ~~(tTime / cycleDuration);
                        if (iteration && iteration === tTime / cycleDuration) {
                            time = dur;
                            iteration--;
                        }
                        time > dur && (time = dur);
                    }
                    isYoyo = this._yoyo && 1 & iteration;
                    if (isYoyo) {
                        yoyoEase = this._yEase;
                        time = dur - time;
                    }
                    prevIteration = _animationCycle(this._tTime, cycleDuration);
                    if (time === prevTime && !force && this._initted) {
                        this._tTime = tTime;
                        return this;
                    }
                    if (iteration !== prevIteration) {
                        timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo);
                        if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
                            this._lock = force = 1;
                            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
                        }
                    }
                }
                if (!this._initted) {
                    if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
                        this._tTime = 0;
                        return this;
                    }
                    if (prevTime !== this._time) return this;
                    if (dur !== this._dur) return this.render(totalTime, suppressEvents, force);
                }
                this._tTime = tTime;
                this._time = time;
                if (!this._act && this._ts) {
                    this._act = 1;
                    this._lazy = 0;
                }
                this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
                if (this._from) this.ratio = ratio = 1 - ratio;
                if (time && !prevTime && !suppressEvents) {
                    _callback(this, "onStart");
                    if (this._tTime !== tTime) return this;
                }
                pt = this._pt;
                while (pt) {
                    pt.r(ratio, pt.d);
                    pt = pt._next;
                }
                timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
                if (this._onUpdate && !suppressEvents) {
                    isNegative && _rewindStartAt(this, totalTime, suppressEvents, force);
                    _callback(this, "onUpdate");
                }
                this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback(this, "onRepeat");
                if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
                    isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
                    (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1);
                    if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
                        _callback(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
                        this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
                    }
                }
            }
            return this;
        };
        _proto3.targets = function targets() {
            return this._targets;
        };
        _proto3.invalidate = function invalidate(soft) {
            (!soft || !this.vars.runBackwards) && (this._startAt = 0);
            this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
            this._ptLookup = [];
            this.timeline && this.timeline.invalidate(soft);
            return _Animation2.prototype.invalidate.call(this, soft);
        };
        _proto3.resetTo = function resetTo(property, value, start, startIsRelative) {
            _tickerActive || _ticker.wake();
            this._ts || this.play();
            var ratio, time = Math.min(this._dur, (this._dp._time - this._start) * this._ts);
            this._initted || _initTween(this, time);
            ratio = this._ease(time / this._dur);
            if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time)) return this.resetTo(property, value, start, startIsRelative);
            _alignPlayhead(this, 0);
            this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
            return this.render(0);
        };
        _proto3.kill = function kill(targets, vars) {
            if (void 0 === vars) vars = "all";
            if (!targets && (!vars || "all" === vars)) {
                this._lazy = this._pt = 0;
                return this.parent ? _interrupt(this) : this;
            }
            if (this.timeline) {
                var tDur = this.timeline.totalDuration();
                this.timeline.killTweensOf(targets, vars, _overwritingTween && true !== _overwritingTween.vars.overwrite)._first || _interrupt(this);
                this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1);
                return this;
            }
            var overwrittenProps, curLookup, curOverwriteProps, props, p, pt, i, parsedTargets = this._targets, killingTargets = targets ? toArray(targets) : parsedTargets, propTweenLookup = this._ptLookup, firstPT = this._pt;
            if ((!vars || "all" === vars) && _arraysMatch(parsedTargets, killingTargets)) {
                "all" === vars && (this._pt = 0);
                return _interrupt(this);
            }
            overwrittenProps = this._op = this._op || [];
            if ("all" !== vars) {
                if (_isString(vars)) {
                    p = {};
                    _forEachName(vars, (function(name) {
                        return p[name] = 1;
                    }));
                    vars = p;
                }
                vars = _addAliasesToVars(parsedTargets, vars);
            }
            i = parsedTargets.length;
            while (i--) if (~killingTargets.indexOf(parsedTargets[i])) {
                curLookup = propTweenLookup[i];
                if ("all" === vars) {
                    overwrittenProps[i] = vars;
                    props = curLookup;
                    curOverwriteProps = {};
                } else {
                    curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
                    props = vars;
                }
                for (p in props) {
                    pt = curLookup && curLookup[p];
                    if (pt) {
                        if (!("kill" in pt.d) || true === pt.d.kill(p)) _removeLinkedListItem(this, pt, "_pt");
                        delete curLookup[p];
                    }
                    if ("all" !== curOverwriteProps) curOverwriteProps[p] = 1;
                }
            }
            this._initted && !this._pt && firstPT && _interrupt(this);
            return this;
        };
        Tween.to = function to(targets, vars) {
            return new Tween(targets, vars, arguments[2]);
        };
        Tween.from = function from(targets, vars) {
            return _createTweenType(1, arguments);
        };
        Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
            return new Tween(callback, 0, {
                immediateRender: false,
                lazy: false,
                overwrite: false,
                delay,
                onComplete: callback,
                onReverseComplete: callback,
                onCompleteParams: params,
                onReverseCompleteParams: params,
                callbackScope: scope
            });
        };
        Tween.fromTo = function fromTo(targets, fromVars, toVars) {
            return _createTweenType(2, arguments);
        };
        Tween.set = function set(targets, vars) {
            vars.duration = 0;
            vars.repeatDelay || (vars.repeat = 0);
            return new Tween(targets, vars);
        };
        Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
            return _globalTimeline.killTweensOf(targets, props, onlyActive);
        };
        return Tween;
    }(Animation);
    _setDefaults(Tween.prototype, {
        _targets: [],
        _lazy: 0,
        _startAt: 0,
        _op: 0,
        _onInit: 0
    });
    _forEachName("staggerTo,staggerFrom,staggerFromTo", (function(name) {
        Tween[name] = function() {
            var tl = new Timeline, params = _slice.call(arguments, 0);
            params.splice("staggerFromTo" === name ? 5 : 4, 0, 0);
            return tl[name].apply(tl, params);
        };
    }));
    var _setterPlain = function _setterPlain(target, property, value) {
        return target[property] = value;
    }, _setterFunc = function _setterFunc(target, property, value) {
        return target[property](value);
    }, _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
        return target[property](data.fp, value);
    }, _setterAttribute = function _setterAttribute(target, property, value) {
        return target.setAttribute(property, value);
    }, _getSetter = function _getSetter(target, property) {
        return _isFunction(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
    }, _renderPlain = function _renderPlain(ratio, data) {
        return data.set(data.t, data.p, Math.round(1e6 * (data.s + data.c * ratio)) / 1e6, data);
    }, _renderBoolean = function _renderBoolean(ratio, data) {
        return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
    }, _renderComplexString = function _renderComplexString(ratio, data) {
        var pt = data._pt, s = "";
        if (!ratio && data.b) s = data.b; else if (1 === ratio && data.e) s = data.e; else {
            while (pt) {
                s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round(1e4 * (pt.s + pt.c * ratio)) / 1e4) + s;
                pt = pt._next;
            }
            s += data.c;
        }
        data.set(data.t, data.p, s, data);
    }, _renderPropTweens = function _renderPropTweens(ratio, data) {
        var pt = data._pt;
        while (pt) {
            pt.r(ratio, pt.d);
            pt = pt._next;
        }
    }, _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
        var next, pt = this._pt;
        while (pt) {
            next = pt._next;
            pt.p === property && pt.modifier(modifier, tween, target);
            pt = next;
        }
    }, _killPropTweensOf = function _killPropTweensOf(property) {
        var hasNonDependentRemaining, next, pt = this._pt;
        while (pt) {
            next = pt._next;
            if (pt.p === property && !pt.op || pt.op === property) _removeLinkedListItem(this, pt, "_pt"); else if (!pt.dep) hasNonDependentRemaining = 1;
            pt = next;
        }
        return !hasNonDependentRemaining;
    }, _setterWithModifier = function _setterWithModifier(target, property, value, data) {
        data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
    }, _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
        var next, pt2, first, last, pt = parent._pt;
        while (pt) {
            next = pt._next;
            pt2 = first;
            while (pt2 && pt2.pr > pt.pr) pt2 = pt2._next;
            if (pt._prev = pt2 ? pt2._prev : last) pt._prev._next = pt; else first = pt;
            if (pt._next = pt2) pt2._prev = pt; else last = pt;
            pt = next;
        }
        parent._pt = first;
    };
    var PropTween = function() {
        function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
            this.t = target;
            this.s = start;
            this.c = change;
            this.p = prop;
            this.r = renderer || _renderPlain;
            this.d = data || this;
            this.set = setter || _setterPlain;
            this.pr = priority || 0;
            this._next = next;
            if (next) next._prev = this;
        }
        var _proto4 = PropTween.prototype;
        _proto4.modifier = function modifier(func, tween, target) {
            this.mSet = this.mSet || this.set;
            this.set = _setterWithModifier;
            this.m = func;
            this.mt = target;
            this.tween = tween;
        };
        return PropTween;
    }();
    _forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", (function(name) {
        return _reservedProps[name] = 1;
    }));
    _globals.TweenMax = _globals.TweenLite = Tween;
    _globals.TimelineLite = _globals.TimelineMax = Timeline;
    _globalTimeline = new Timeline({
        sortChildren: false,
        defaults: _defaults,
        autoRemoveChildren: true,
        id: "root",
        smoothChildTiming: true
    });
    _config.stringFilter = _colorStringFilter;
    var _media = [], _listeners = {}, _emptyArray = [], _lastMediaTime = 0, _dispatch = function _dispatch(type) {
        return (_listeners[type] || _emptyArray).map((function(f) {
            return f();
        }));
    }, _onMediaChange = function _onMediaChange() {
        var time = Date.now(), matches = [];
        if (time - _lastMediaTime > 2) {
            _dispatch("matchMediaInit");
            _media.forEach((function(c) {
                var match, p, anyMatch, toggled, queries = c.queries, conditions = c.conditions;
                for (p in queries) {
                    match = _win.matchMedia(queries[p]).matches;
                    match && (anyMatch = 1);
                    if (match !== conditions[p]) {
                        conditions[p] = match;
                        toggled = 1;
                    }
                }
                if (toggled) {
                    c.revert();
                    anyMatch && matches.push(c);
                }
            }));
            _dispatch("matchMediaRevert");
            matches.forEach((function(c) {
                return c.onMatch(c);
            }));
            _lastMediaTime = time;
            _dispatch("matchMedia");
        }
    };
    var Context = function() {
        function Context(func, scope) {
            this.selector = scope && selector(scope);
            this.data = [];
            this._r = [];
            this.isReverted = false;
            func && this.add(func);
        }
        var _proto5 = Context.prototype;
        _proto5.add = function add(name, func, scope) {
            if (_isFunction(name)) {
                scope = func;
                func = name;
                name = _isFunction;
            }
            var self = this, f = function f() {
                var result, prev = _context, prevSelector = self.selector;
                prev && prev !== self && prev.data.push(self);
                scope && (self.selector = selector(scope));
                _context = self;
                result = func.apply(self, arguments);
                _isFunction(result) && self._r.push(result);
                _context = prev;
                self.selector = prevSelector;
                self.isReverted = false;
                return result;
            };
            self.last = f;
            return name === _isFunction ? f(self) : name ? self[name] = f : f;
        };
        _proto5.ignore = function ignore(func) {
            var prev = _context;
            _context = null;
            func(this);
            _context = prev;
        };
        _proto5.getTweens = function getTweens() {
            var a = [];
            this.data.forEach((function(e) {
                return e instanceof Context ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && "nested" === e.parent.data) && a.push(e);
            }));
            return a;
        };
        _proto5.clear = function clear() {
            this._r.length = this.data.length = 0;
        };
        _proto5.kill = function kill(revert, matchMedia) {
            var _this4 = this;
            if (revert) {
                var tweens = this.getTweens();
                this.data.forEach((function(t) {
                    if ("isFlip" === t.data) {
                        t.revert();
                        t.getChildren(true, true, false).forEach((function(tween) {
                            return tweens.splice(tweens.indexOf(tween), 1);
                        }));
                    }
                }));
                tweens.map((function(t) {
                    return {
                        g: t.globalTime(0),
                        t
                    };
                })).sort((function(a, b) {
                    return b.g - a.g || -1;
                })).forEach((function(o) {
                    return o.t.revert(revert);
                }));
                this.data.forEach((function(e) {
                    return !(e instanceof Animation) && e.revert && e.revert(revert);
                }));
                this._r.forEach((function(f) {
                    return f(revert, _this4);
                }));
                this.isReverted = true;
            } else this.data.forEach((function(e) {
                return e.kill && e.kill();
            }));
            this.clear();
            if (matchMedia) {
                var i = _media.indexOf(this);
                !!~i && _media.splice(i, 1);
            }
        };
        _proto5.revert = function revert(config) {
            this.kill(config || {});
        };
        return Context;
    }();
    var MatchMedia = function() {
        function MatchMedia(scope) {
            this.contexts = [];
            this.scope = scope;
        }
        var _proto6 = MatchMedia.prototype;
        _proto6.add = function add(conditions, func, scope) {
            _isObject(conditions) || (conditions = {
                matches: conditions
            });
            var mq, p, active, context = new Context(0, scope || this.scope), cond = context.conditions = {};
            this.contexts.push(context);
            func = context.add("onMatch", func);
            context.queries = conditions;
            for (p in conditions) if ("all" === p) active = 1; else {
                mq = _win.matchMedia(conditions[p]);
                if (mq) {
                    _media.indexOf(context) < 0 && _media.push(context);
                    (cond[p] = mq.matches) && (active = 1);
                    mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
                }
            }
            active && func(context);
            return this;
        };
        _proto6.revert = function revert(config) {
            this.kill(config || {});
        };
        _proto6.kill = function kill(revert) {
            this.contexts.forEach((function(c) {
                return c.kill(revert, true);
            }));
        };
        return MatchMedia;
    }();
    var _gsap = {
        registerPlugin: function registerPlugin() {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
            args.forEach((function(config) {
                return _createPlugin(config);
            }));
        },
        timeline: function timeline(vars) {
            return new Timeline(vars);
        },
        getTweensOf: function getTweensOf(targets, onlyActive) {
            return _globalTimeline.getTweensOf(targets, onlyActive);
        },
        getProperty: function getProperty(target, property, unit, uncache) {
            _isString(target) && (target = toArray(target)[0]);
            var getter = _getCache(target || {}).get, format = unit ? _passThrough : _numericIfPossible;
            "native" === unit && (unit = "");
            return !target ? target : !property ? function(property, unit, uncache) {
                return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
            } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
        },
        quickSetter: function quickSetter(target, property, unit) {
            target = toArray(target);
            if (target.length > 1) {
                var setters = target.map((function(t) {
                    return gsap.quickSetter(t, property, unit);
                })), l = setters.length;
                return function(value) {
                    var i = l;
                    while (i--) setters[i](value);
                };
            }
            target = target[0] || {};
            var Plugin = _plugins[property], cache = _getCache(target), p = cache.harness && (cache.harness.aliases || {})[property] || property, setter = Plugin ? function(value) {
                var p = new Plugin;
                _quickTween._pt = 0;
                p.init(target, unit ? value + unit : value, _quickTween, 0, [ target ]);
                p.render(1, p);
                _quickTween._pt && _renderPropTweens(1, _quickTween);
            } : cache.set(target, p);
            return Plugin ? setter : function(value) {
                return setter(target, p, unit ? value + unit : value, cache, 1);
            };
        },
        quickTo: function quickTo(target, property, vars) {
            var _merge2;
            var tween = gsap.to(target, _merge((_merge2 = {}, _merge2[property] = "+=0.1", _merge2.paused = true, 
            _merge2), vars || {})), func = function func(value, start, startIsRelative) {
                return tween.resetTo(property, value, start, startIsRelative);
            };
            func.tween = tween;
            return func;
        },
        isTweening: function isTweening(targets) {
            return _globalTimeline.getTweensOf(targets, true).length > 0;
        },
        defaults: function defaults(value) {
            value && value.ease && (value.ease = _parseEase(value.ease, _defaults.ease));
            return _mergeDeep(_defaults, value || {});
        },
        config: function config(value) {
            return _mergeDeep(_config, value || {});
        },
        registerEffect: function registerEffect(_ref3) {
            var name = _ref3.name, effect = _ref3.effect, plugins = _ref3.plugins, defaults = _ref3.defaults, extendTimeline = _ref3.extendTimeline;
            (plugins || "").split(",").forEach((function(pluginName) {
                return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
            }));
            _effects[name] = function(targets, vars, tl) {
                return effect(toArray(targets), _setDefaults(vars || {}, defaults), tl);
            };
            if (extendTimeline) Timeline.prototype[name] = function(targets, vars, position) {
                return this.add(_effects[name](targets, _isObject(vars) ? vars : (position = vars) && {}, this), position);
            };
        },
        registerEase: function registerEase(name, ease) {
            _easeMap[name] = _parseEase(ease);
        },
        parseEase: function parseEase(ease, defaultEase) {
            return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
        },
        getById: function getById(id) {
            return _globalTimeline.getById(id);
        },
        exportRoot: function exportRoot(vars, includeDelayedCalls) {
            if (void 0 === vars) vars = {};
            var child, next, tl = new Timeline(vars);
            tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
            _globalTimeline.remove(tl);
            tl._dp = 0;
            tl._time = tl._tTime = _globalTimeline._time;
            child = _globalTimeline._first;
            while (child) {
                next = child._next;
                if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) _addToTimeline(tl, child, child._start - child._delay);
                child = next;
            }
            _addToTimeline(_globalTimeline, tl, 0);
            return tl;
        },
        context: function context(func, scope) {
            return func ? new Context(func, scope) : _context;
        },
        matchMedia: function matchMedia(scope) {
            return new MatchMedia(scope);
        },
        matchMediaRefresh: function matchMediaRefresh() {
            return _media.forEach((function(c) {
                var found, p, cond = c.conditions;
                for (p in cond) if (cond[p]) {
                    cond[p] = false;
                    found = 1;
                }
                found && c.revert();
            })) || _onMediaChange();
        },
        addEventListener: function addEventListener(type, callback) {
            var a = _listeners[type] || (_listeners[type] = []);
            ~a.indexOf(callback) || a.push(callback);
        },
        removeEventListener: function removeEventListener(type, callback) {
            var a = _listeners[type], i = a && a.indexOf(callback);
            i >= 0 && a.splice(i, 1);
        },
        utils: {
            wrap,
            wrapYoyo,
            distribute,
            random,
            snap,
            normalize,
            getUnit,
            clamp,
            splitColor,
            toArray,
            selector,
            mapRange,
            pipe,
            unitize,
            interpolate,
            shuffle
        },
        install: _install,
        effects: _effects,
        ticker: _ticker,
        updateRoot: Timeline.updateRoot,
        plugins: _plugins,
        globalTimeline: _globalTimeline,
        core: {
            PropTween,
            globals: _addGlobal,
            Tween,
            Timeline,
            Animation,
            getCache: _getCache,
            _removeLinkedListItem,
            reverting: function reverting() {
                return _reverting;
            },
            context: function context(toAdd) {
                if (toAdd && _context) {
                    _context.data.push(toAdd);
                    toAdd._ctx = _context;
                }
                return _context;
            },
            suppressOverwrites: function suppressOverwrites(value) {
                return _suppressOverwrites = value;
            }
        }
    };
    _forEachName("to,from,fromTo,delayedCall,set,killTweensOf", (function(name) {
        return _gsap[name] = Tween[name];
    }));
    _ticker.add(Timeline.updateRoot);
    _quickTween = _gsap.to({}, {
        duration: 0
    });
    var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
        var pt = plugin._pt;
        while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) pt = pt._next;
        return pt;
    }, _addModifiers = function _addModifiers(tween, modifiers) {
        var p, i, pt, targets = tween._targets;
        for (p in modifiers) {
            i = targets.length;
            while (i--) {
                pt = tween._ptLookup[i][p];
                if (pt && (pt = pt.d)) {
                    if (pt._pt) pt = _getPluginPropTween(pt, p);
                    pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
                }
            }
        }
    }, _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
        return {
            name,
            rawVars: 1,
            init: function init(target, vars, tween) {
                tween._onInit = function(tween) {
                    var temp, p;
                    if (_isString(vars)) {
                        temp = {};
                        _forEachName(vars, (function(name) {
                            return temp[name] = 1;
                        }));
                        vars = temp;
                    }
                    if (modifier) {
                        temp = {};
                        for (p in vars) temp[p] = modifier(vars[p]);
                        vars = temp;
                    }
                    _addModifiers(tween, vars);
                };
            }
        };
    };
    var gsap = _gsap.registerPlugin({
        name: "attr",
        init: function init(target, vars, tween, index, targets) {
            var p, pt, v;
            this.tween = tween;
            for (p in vars) {
                v = target.getAttribute(p) || "";
                pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
                pt.op = p;
                pt.b = v;
                this._props.push(p);
            }
        },
        render: function render(ratio, data) {
            var pt = data._pt;
            while (pt) {
                _reverting ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d);
                pt = pt._next;
            }
        }
    }, {
        name: "endArray",
        init: function init(target, value) {
            var i = value.length;
            while (i--) this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
        }
    }, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap;
    Tween.version = Timeline.version = gsap.version = "3.11.4";
    _coreReady = 1;
    _windowExists() && _wake();
    _easeMap.Power0, _easeMap.Power1, _easeMap.Power2, _easeMap.Power3, _easeMap.Power4, 
    _easeMap.Linear, _easeMap.Quad, _easeMap.Cubic, _easeMap.Quart, _easeMap.Quint, 
    _easeMap.Strong, _easeMap.Elastic, _easeMap.Back, _easeMap.SteppedEase, _easeMap.Bounce, 
    _easeMap.Sine, _easeMap.Expo, _easeMap.Circ;
    /*!
 * CSSPlugin 3.11.4
 * https://greensock.com
 *
 * Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
    var CSSPlugin_win, CSSPlugin_doc, _docElement, _pluginInitted, _tempDiv, _recentSetterPlugin, CSSPlugin_reverting, _supports3D, CSSPlugin_windowExists = function _windowExists() {
        return "undefined" !== typeof window;
    }, _transformProps = {}, _RAD2DEG = 180 / Math.PI, _DEG2RAD = Math.PI / 180, _atan2 = Math.atan2, CSSPlugin_bigNum = 1e8, _capsExp = /([A-Z])/g, _horizontalExp = /(left|right|width|margin|padding|x)/i, _complexExp = /[\s,\(]\S/, _propertyAliases = {
        autoAlpha: "opacity,visibility",
        scale: "scaleX,scaleY",
        alpha: "opacity"
    }, _renderCSSProp = function _renderCSSProp(ratio, data) {
        return data.set(data.t, data.p, Math.round(1e4 * (data.s + data.c * ratio)) / 1e4 + data.u, data);
    }, _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
        return data.set(data.t, data.p, 1 === ratio ? data.e : Math.round(1e4 * (data.s + data.c * ratio)) / 1e4 + data.u, data);
    }, _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
        return data.set(data.t, data.p, ratio ? Math.round(1e4 * (data.s + data.c * ratio)) / 1e4 + data.u : data.b, data);
    }, _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
        var value = data.s + data.c * ratio;
        data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
    }, _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
        return data.set(data.t, data.p, ratio ? data.e : data.b, data);
    }, _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
        return data.set(data.t, data.p, 1 !== ratio ? data.b : data.e, data);
    }, _setterCSSStyle = function _setterCSSStyle(target, property, value) {
        return target.style[property] = value;
    }, _setterCSSProp = function _setterCSSProp(target, property, value) {
        return target.style.setProperty(property, value);
    }, _setterTransform = function _setterTransform(target, property, value) {
        return target._gsap[property] = value;
    }, _setterScale = function _setterScale(target, property, value) {
        return target._gsap.scaleX = target._gsap.scaleY = value;
    }, _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
        var cache = target._gsap;
        cache.scaleX = cache.scaleY = value;
        cache.renderTransform(ratio, cache);
    }, _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
        var cache = target._gsap;
        cache[property] = value;
        cache.renderTransform(ratio, cache);
    }, _transformProp = "transform", _transformOriginProp = _transformProp + "Origin", _saveStyle = function _saveStyle(property, isNotCSS) {
        var _this = this;
        var target = this.target, style = target.style;
        if (property in _transformProps) {
            this.tfm = this.tfm || {};
            if ("transform" !== property) {
                property = _propertyAliases[property] || property;
                ~property.indexOf(",") ? property.split(",").forEach((function(a) {
                    return _this.tfm[a] = _get(target, a);
                })) : this.tfm[property] = target._gsap.x ? target._gsap[property] : _get(target, property);
            }
            if (this.props.indexOf(_transformProp) >= 0) return;
            if (target._gsap.svg) {
                this.svgo = target.getAttribute("data-svg-origin");
                this.props.push(_transformOriginProp, isNotCSS, "");
            }
            property = _transformProp;
        }
        (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
    }, _removeIndependentTransforms = function _removeIndependentTransforms(style) {
        if (style.translate) {
            style.removeProperty("translate");
            style.removeProperty("scale");
            style.removeProperty("rotate");
        }
    }, _revertStyle = function _revertStyle() {
        var i, p, props = this.props, target = this.target, style = target.style, cache = target._gsap;
        for (i = 0; i < props.length; i += 3) props[i + 1] ? target[props[i]] = props[i + 2] : props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].replace(_capsExp, "-$1").toLowerCase());
        if (this.tfm) {
            for (p in this.tfm) cache[p] = this.tfm[p];
            if (cache.svg) {
                cache.renderTransform();
                target.setAttribute("data-svg-origin", this.svgo || "");
            }
            i = CSSPlugin_reverting();
            if (i && !i.isStart && !style[_transformProp]) {
                _removeIndependentTransforms(style);
                cache.uncache = 1;
            }
        }
    }, _getStyleSaver = function _getStyleSaver(target, properties) {
        var saver = {
            target,
            props: [],
            revert: _revertStyle,
            save: _saveStyle
        };
        properties && properties.split(",").forEach((function(p) {
            return saver.save(p);
        }));
        return saver;
    }, _createElement = function _createElement(type, ns) {
        var e = CSSPlugin_doc.createElementNS ? CSSPlugin_doc.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : CSSPlugin_doc.createElement(type);
        return e.style ? e : CSSPlugin_doc.createElement(type);
    }, _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
        var cs = getComputedStyle(target);
        return cs[property] || cs.getPropertyValue(property.replace(_capsExp, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || "";
    }, _prefixes = "O,Moz,ms,Ms,Webkit".split(","), _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
        var e = element || _tempDiv, s = e.style, i = 5;
        if (property in s && !preferPrefix) return property;
        property = property.charAt(0).toUpperCase() + property.substr(1);
        while (i-- && !(_prefixes[i] + property in s)) ;
        return i < 0 ? null : (3 === i ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
    }, _initCore = function _initCore() {
        if (CSSPlugin_windowExists() && window.document) {
            CSSPlugin_win = window;
            CSSPlugin_doc = CSSPlugin_win.document;
            _docElement = CSSPlugin_doc.documentElement;
            _tempDiv = _createElement("div") || {
                style: {}
            };
            _createElement("div");
            _transformProp = _checkPropPrefix(_transformProp);
            _transformOriginProp = _transformProp + "Origin";
            _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0";
            _supports3D = !!_checkPropPrefix("perspective");
            CSSPlugin_reverting = gsap.core.reverting;
            _pluginInitted = 1;
        }
    }, _getBBoxHack = function _getBBoxHack(swapIfPossible) {
        var bbox, svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), oldParent = this.parentNode, oldSibling = this.nextSibling, oldCSS = this.style.cssText;
        _docElement.appendChild(svg);
        svg.appendChild(this);
        this.style.display = "block";
        if (swapIfPossible) try {
            bbox = this.getBBox();
            this._gsapBBox = this.getBBox;
            this.getBBox = _getBBoxHack;
        } catch (e) {} else if (this._gsapBBox) bbox = this._gsapBBox();
        if (oldParent) if (oldSibling) oldParent.insertBefore(this, oldSibling); else oldParent.appendChild(this);
        _docElement.removeChild(svg);
        this.style.cssText = oldCSS;
        return bbox;
    }, _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
        var i = attributesArray.length;
        while (i--) if (target.hasAttribute(attributesArray[i])) return target.getAttribute(attributesArray[i]);
    }, _getBBox = function _getBBox(target) {
        var bounds;
        try {
            bounds = target.getBBox();
        } catch (error) {
            bounds = _getBBoxHack.call(target, true);
        }
        bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true));
        return bounds && !bounds.width && !bounds.x && !bounds.y ? {
            x: +_getAttributeFallbacks(target, [ "x", "cx", "x1" ]) || 0,
            y: +_getAttributeFallbacks(target, [ "y", "cy", "y1" ]) || 0,
            width: 0,
            height: 0
        } : bounds;
    }, _isSVG = function _isSVG(e) {
        return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
    }, _removeProperty = function _removeProperty(target, property) {
        if (property) {
            var style = target.style;
            if (property in _transformProps && property !== _transformOriginProp) property = _transformProp;
            if (style.removeProperty) {
                if ("ms" === property.substr(0, 2) || "webkit" === property.substr(0, 6)) property = "-" + property;
                style.removeProperty(property.replace(_capsExp, "-$1").toLowerCase());
            } else style.removeAttribute(property);
        }
    }, _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
        var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
        plugin._pt = pt;
        pt.b = beginning;
        pt.e = end;
        plugin._props.push(property);
        return pt;
    }, _nonConvertibleUnits = {
        deg: 1,
        rad: 1,
        turn: 1
    }, _nonStandardLayouts = {
        grid: 1,
        flex: 1
    }, _convertToUnit = function _convertToUnit(target, property, value, unit) {
        var px, parent, cache, isSVG, curValue = parseFloat(value) || 0, curUnit = (value + "").trim().substr((curValue + "").length) || "px", style = _tempDiv.style, horizontal = _horizontalExp.test(property), isRootSVG = "svg" === target.tagName.toLowerCase(), measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"), amount = 100, toPixels = "px" === unit, toPercent = "%" === unit;
        if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) return curValue;
        "px" !== curUnit && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
        isSVG = target.getCTM && _isSVG(target);
        if ((toPercent || "%" === curUnit) && (_transformProps[property] || ~property.indexOf("adius"))) {
            px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
            return _round(toPercent ? curValue / px * amount : curValue / 100 * px);
        }
        style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
        parent = ~property.indexOf("adius") || "em" === unit && target.appendChild && !isRootSVG ? target : target.parentNode;
        if (isSVG) parent = (target.ownerSVGElement || {}).parentNode;
        if (!parent || parent === CSSPlugin_doc || !parent.appendChild) parent = CSSPlugin_doc.body;
        cache = parent._gsap;
        if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) return _round(curValue / cache.width * amount); else {
            (toPercent || "%" === curUnit) && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
            parent === target && (style.position = "static");
            parent.appendChild(_tempDiv);
            px = _tempDiv[measureProperty];
            parent.removeChild(_tempDiv);
            style.position = "absolute";
            if (horizontal && toPercent) {
                cache = _getCache(parent);
                cache.time = _ticker.time;
                cache.width = parent[measureProperty];
            }
        }
        return _round(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
    }, _get = function _get(target, property, unit, uncache) {
        var value;
        _pluginInitted || _initCore();
        if (property in _propertyAliases && "transform" !== property) {
            property = _propertyAliases[property];
            if (~property.indexOf(",")) property = property.split(",")[0];
        }
        if (_transformProps[property] && "transform" !== property) {
            value = _parseTransform(target, uncache);
            value = "transformOrigin" !== property ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
        } else {
            value = target.style[property];
            if (!value || "auto" === value || uncache || ~(value + "").indexOf("calc(")) value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || ("opacity" === property ? 1 : 0);
        }
        return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
    }, _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
        if (!start || "none" === start) {
            var p = _checkPropPrefix(prop, target, 1), s = p && _getComputedProperty(target, p, 1);
            if (s && s !== start) {
                prop = p;
                start = s;
            } else if ("borderColor" === prop) start = _getComputedProperty(target, "borderTopColor");
        }
        var a, result, startValues, startNum, color, startValue, endValue, endNum, chunk, endUnit, startUnit, endValues, pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString), index = 0, matchIndex = 0;
        pt.b = start;
        pt.e = end;
        start += "";
        end += "";
        if ("auto" === end) {
            target.style[prop] = end;
            end = _getComputedProperty(target, prop) || end;
            target.style[prop] = start;
        }
        a = [ start, end ];
        _colorStringFilter(a);
        start = a[0];
        end = a[1];
        startValues = start.match(_numWithUnitExp) || [];
        endValues = end.match(_numWithUnitExp) || [];
        if (endValues.length) {
            while (result = _numWithUnitExp.exec(end)) {
                endValue = result[0];
                chunk = end.substring(index, result.index);
                if (color) color = (color + 1) % 5; else if ("rgba(" === chunk.substr(-5) || "hsla(" === chunk.substr(-5)) color = 1;
                if (endValue !== (startValue = startValues[matchIndex++] || "")) {
                    startNum = parseFloat(startValue) || 0;
                    startUnit = startValue.substr((startNum + "").length);
                    "=" === endValue.charAt(1) && (endValue = _parseRelative(startNum, endValue) + startUnit);
                    endNum = parseFloat(endValue);
                    endUnit = endValue.substr((endNum + "").length);
                    index = _numWithUnitExp.lastIndex - endUnit.length;
                    if (!endUnit) {
                        endUnit = endUnit || _config.units[prop] || startUnit;
                        if (index === end.length) {
                            end += endUnit;
                            pt.e += endUnit;
                        }
                    }
                    if (startUnit !== endUnit) startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
                    pt._pt = {
                        _next: pt._pt,
                        p: chunk || 1 === matchIndex ? chunk : ",",
                        s: startNum,
                        c: endNum - startNum,
                        m: color && color < 4 || "zIndex" === prop ? Math.round : 0
                    };
                }
            }
            pt.c = index < end.length ? end.substring(index, end.length) : "";
        } else pt.r = "display" === prop && "none" === end ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
        _relExp.test(end) && (pt.e = 0);
        this._pt = pt;
        return pt;
    }, _keywordToPercent = {
        top: "0%",
        bottom: "100%",
        left: "0%",
        right: "100%",
        center: "50%"
    }, _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
        var split = value.split(" "), x = split[0], y = split[1] || "50%";
        if ("top" === x || "bottom" === x || "left" === y || "right" === y) {
            value = x;
            x = y;
            y = value;
        }
        split[0] = _keywordToPercent[x] || x;
        split[1] = _keywordToPercent[y] || y;
        return split.join(" ");
    }, _renderClearProps = function _renderClearProps(ratio, data) {
        if (data.tween && data.tween._time === data.tween._dur) {
            var prop, clearTransforms, i, target = data.t, style = target.style, props = data.u, cache = target._gsap;
            if ("all" === props || true === props) {
                style.cssText = "";
                clearTransforms = 1;
            } else {
                props = props.split(",");
                i = props.length;
                while (--i > -1) {
                    prop = props[i];
                    if (_transformProps[prop]) {
                        clearTransforms = 1;
                        prop = "transformOrigin" === prop ? _transformOriginProp : _transformProp;
                    }
                    _removeProperty(target, prop);
                }
            }
            if (clearTransforms) {
                _removeProperty(target, _transformProp);
                if (cache) {
                    cache.svg && target.removeAttribute("transform");
                    _parseTransform(target, 1);
                    cache.uncache = 1;
                    _removeIndependentTransforms(style);
                }
            }
        }
    }, _specialProps = {
        clearProps: function clearProps(plugin, target, property, endValue, tween) {
            if ("isFromStart" !== tween.data) {
                var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
                pt.u = endValue;
                pt.pr = -10;
                pt.tween = tween;
                plugin._props.push(property);
                return 1;
            }
        }
    }, _identity2DMatrix = [ 1, 0, 0, 1, 0, 0 ], _rotationalProperties = {}, _isNullTransform = function _isNullTransform(value) {
        return "matrix(1, 0, 0, 1, 0, 0)" === value || "none" === value || !value;
    }, _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
        var matrixString = _getComputedProperty(target, _transformProp);
        return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round);
    }, _getMatrix = function _getMatrix(target, force2D) {
        var parent, nextSibling, temp, addedToDOM, cache = target._gsap || _getCache(target), style = target.style, matrix = _getComputedTransformMatrixAsArray(target);
        if (cache.svg && target.getAttribute("transform")) {
            temp = target.transform.baseVal.consolidate().matrix;
            matrix = [ temp.a, temp.b, temp.c, temp.d, temp.e, temp.f ];
            return "1,0,0,1,0,0" === matrix.join(",") ? _identity2DMatrix : matrix;
        } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
            temp = style.display;
            style.display = "block";
            parent = target.parentNode;
            if (!parent || !target.offsetParent) {
                addedToDOM = 1;
                nextSibling = target.nextElementSibling;
                _docElement.appendChild(target);
            }
            matrix = _getComputedTransformMatrixAsArray(target);
            temp ? style.display = temp : _removeProperty(target, "display");
            if (addedToDOM) nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
        }
        return force2D && matrix.length > 6 ? [ matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13] ] : matrix;
    }, _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
        var bounds, determinant, x, y, cache = target._gsap, matrix = matrixArray || _getMatrix(target, true), xOriginOld = cache.xOrigin || 0, yOriginOld = cache.yOrigin || 0, xOffsetOld = cache.xOffset || 0, yOffsetOld = cache.yOffset || 0, a = matrix[0], b = matrix[1], c = matrix[2], d = matrix[3], tx = matrix[4], ty = matrix[5], originSplit = origin.split(" "), xOrigin = parseFloat(originSplit[0]) || 0, yOrigin = parseFloat(originSplit[1]) || 0;
        if (!originIsAbsolute) {
            bounds = _getBBox(target);
            xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
            yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
        } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
            x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
            y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
            xOrigin = x;
            yOrigin = y;
        }
        if (smooth || false !== smooth && cache.smooth) {
            tx = xOrigin - xOriginOld;
            ty = yOrigin - yOriginOld;
            cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
            cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
        } else cache.xOffset = cache.yOffset = 0;
        cache.xOrigin = xOrigin;
        cache.yOrigin = yOrigin;
        cache.smooth = !!smooth;
        cache.origin = origin;
        cache.originIsAbsolute = !!originIsAbsolute;
        target.style[_transformOriginProp] = "0px 0px";
        if (pluginToAddPropTweensTo) {
            _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
            _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
            _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
            _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
        }
        target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
    }, _parseTransform = function _parseTransform(target, uncache) {
        var cache = target._gsap || new GSCache(target);
        if ("x" in cache && !uncache && !cache.uncache) return cache;
        var x, y, z, scaleX, scaleY, rotation, rotationX, rotationY, skewX, skewY, perspective, xOrigin, yOrigin, matrix, angle, cos, sin, a, b, c, d, a12, a22, t1, t2, t3, a13, a23, a33, a42, a43, a32, style = target.style, invertedScaleX = cache.scaleX < 0, px = "px", deg = "deg", cs = getComputedStyle(target), origin = _getComputedProperty(target, _transformOriginProp) || "0";
        x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
        scaleX = scaleY = 1;
        cache.svg = !!(target.getCTM && _isSVG(target));
        if (cs.translate) {
            if ("none" !== cs.translate || "none" !== cs.scale || "none" !== cs.rotate) style[_transformProp] = ("none" !== cs.translate ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + ("none" !== cs.rotate ? "rotate(" + cs.rotate + ") " : "") + ("none" !== cs.scale ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + ("none" !== cs[_transformProp] ? cs[_transformProp] : "");
            style.scale = style.rotate = style.translate = "none";
        }
        matrix = _getMatrix(target, cache.svg);
        if (cache.svg) {
            if (cache.uncache) {
                t2 = target.getBBox();
                origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
                t1 = "";
            } else t1 = !uncache && target.getAttribute("data-svg-origin");
            _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, false !== cache.smooth, matrix);
        }
        xOrigin = cache.xOrigin || 0;
        yOrigin = cache.yOrigin || 0;
        if (matrix !== _identity2DMatrix) {
            a = matrix[0];
            b = matrix[1];
            c = matrix[2];
            d = matrix[3];
            x = a12 = matrix[4];
            y = a22 = matrix[5];
            if (6 === matrix.length) {
                scaleX = Math.sqrt(a * a + b * b);
                scaleY = Math.sqrt(d * d + c * c);
                rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0;
                skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
                skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
                if (cache.svg) {
                    x -= xOrigin - (xOrigin * a + yOrigin * c);
                    y -= yOrigin - (xOrigin * b + yOrigin * d);
                }
            } else {
                a32 = matrix[6];
                a42 = matrix[7];
                a13 = matrix[8];
                a23 = matrix[9];
                a33 = matrix[10];
                a43 = matrix[11];
                x = matrix[12];
                y = matrix[13];
                z = matrix[14];
                angle = _atan2(a32, a33);
                rotationX = angle * _RAD2DEG;
                if (angle) {
                    cos = Math.cos(-angle);
                    sin = Math.sin(-angle);
                    t1 = a12 * cos + a13 * sin;
                    t2 = a22 * cos + a23 * sin;
                    t3 = a32 * cos + a33 * sin;
                    a13 = a12 * -sin + a13 * cos;
                    a23 = a22 * -sin + a23 * cos;
                    a33 = a32 * -sin + a33 * cos;
                    a43 = a42 * -sin + a43 * cos;
                    a12 = t1;
                    a22 = t2;
                    a32 = t3;
                }
                angle = _atan2(-c, a33);
                rotationY = angle * _RAD2DEG;
                if (angle) {
                    cos = Math.cos(-angle);
                    sin = Math.sin(-angle);
                    t1 = a * cos - a13 * sin;
                    t2 = b * cos - a23 * sin;
                    t3 = c * cos - a33 * sin;
                    a43 = d * sin + a43 * cos;
                    a = t1;
                    b = t2;
                    c = t3;
                }
                angle = _atan2(b, a);
                rotation = angle * _RAD2DEG;
                if (angle) {
                    cos = Math.cos(angle);
                    sin = Math.sin(angle);
                    t1 = a * cos + b * sin;
                    t2 = a12 * cos + a22 * sin;
                    b = b * cos - a * sin;
                    a22 = a22 * cos - a12 * sin;
                    a = t1;
                    a12 = t2;
                }
                if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
                    rotationX = rotation = 0;
                    rotationY = 180 - rotationY;
                }
                scaleX = _round(Math.sqrt(a * a + b * b + c * c));
                scaleY = _round(Math.sqrt(a22 * a22 + a32 * a32));
                angle = _atan2(a12, a22);
                skewX = Math.abs(angle) > 2e-4 ? angle * _RAD2DEG : 0;
                perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
            }
            if (cache.svg) {
                t1 = target.getAttribute("transform");
                cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp));
                t1 && target.setAttribute("transform", t1);
            }
        }
        if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) if (invertedScaleX) {
            scaleX *= -1;
            skewX += rotation <= 0 ? 180 : -180;
            rotation += rotation <= 0 ? 180 : -180;
        } else {
            scaleY *= -1;
            skewX += skewX <= 0 ? 180 : -180;
        }
        uncache = uncache || cache.uncache;
        cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
        cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
        cache.z = z + px;
        cache.scaleX = _round(scaleX);
        cache.scaleY = _round(scaleY);
        cache.rotation = _round(rotation) + deg;
        cache.rotationX = _round(rotationX) + deg;
        cache.rotationY = _round(rotationY) + deg;
        cache.skewX = skewX + deg;
        cache.skewY = skewY + deg;
        cache.transformPerspective = perspective + px;
        if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) style[_transformOriginProp] = _firstTwoOnly(origin);
        cache.xOffset = cache.yOffset = 0;
        cache.force3D = _config.force3D;
        cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
        cache.uncache = 0;
        return cache;
    }, _firstTwoOnly = function _firstTwoOnly(value) {
        return (value = value.split(" "))[0] + " " + value[1];
    }, _addPxTranslate = function _addPxTranslate(target, start, value) {
        var unit = getUnit(start);
        return _round(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
    }, _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
        cache.z = "0px";
        cache.rotationY = cache.rotationX = "0deg";
        cache.force3D = 0;
        _renderCSSTransforms(ratio, cache);
    }, _zeroDeg = "0deg", _zeroPx = "0px", _endParenthesis = ") ", _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
        var _ref = cache || this, xPercent = _ref.xPercent, yPercent = _ref.yPercent, x = _ref.x, y = _ref.y, z = _ref.z, rotation = _ref.rotation, rotationY = _ref.rotationY, rotationX = _ref.rotationX, skewX = _ref.skewX, skewY = _ref.skewY, scaleX = _ref.scaleX, scaleY = _ref.scaleY, transformPerspective = _ref.transformPerspective, force3D = _ref.force3D, target = _ref.target, zOrigin = _ref.zOrigin, transforms = "", use3D = "auto" === force3D && ratio && 1 !== ratio || true === force3D;
        if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
            var cos, angle = parseFloat(rotationY) * _DEG2RAD, a13 = Math.sin(angle), a33 = Math.cos(angle);
            angle = parseFloat(rotationX) * _DEG2RAD;
            cos = Math.cos(angle);
            x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
            y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
            z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
        }
        if (transformPerspective !== _zeroPx) transforms += "perspective(" + transformPerspective + _endParenthesis;
        if (xPercent || yPercent) transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
        if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
        if (rotation !== _zeroDeg) transforms += "rotate(" + rotation + _endParenthesis;
        if (rotationY !== _zeroDeg) transforms += "rotateY(" + rotationY + _endParenthesis;
        if (rotationX !== _zeroDeg) transforms += "rotateX(" + rotationX + _endParenthesis;
        if (skewX !== _zeroDeg || skewY !== _zeroDeg) transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
        if (1 !== scaleX || 1 !== scaleY) transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
        target.style[_transformProp] = transforms || "translate(0, 0)";
    }, _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
        var a11, a21, a12, a22, temp, _ref2 = cache || this, xPercent = _ref2.xPercent, yPercent = _ref2.yPercent, x = _ref2.x, y = _ref2.y, rotation = _ref2.rotation, skewX = _ref2.skewX, skewY = _ref2.skewY, scaleX = _ref2.scaleX, scaleY = _ref2.scaleY, target = _ref2.target, xOrigin = _ref2.xOrigin, yOrigin = _ref2.yOrigin, xOffset = _ref2.xOffset, yOffset = _ref2.yOffset, forceCSS = _ref2.forceCSS, tx = parseFloat(x), ty = parseFloat(y);
        rotation = parseFloat(rotation);
        skewX = parseFloat(skewX);
        skewY = parseFloat(skewY);
        if (skewY) {
            skewY = parseFloat(skewY);
            skewX += skewY;
            rotation += skewY;
        }
        if (rotation || skewX) {
            rotation *= _DEG2RAD;
            skewX *= _DEG2RAD;
            a11 = Math.cos(rotation) * scaleX;
            a21 = Math.sin(rotation) * scaleX;
            a12 = Math.sin(rotation - skewX) * -scaleY;
            a22 = Math.cos(rotation - skewX) * scaleY;
            if (skewX) {
                skewY *= _DEG2RAD;
                temp = Math.tan(skewX - skewY);
                temp = Math.sqrt(1 + temp * temp);
                a12 *= temp;
                a22 *= temp;
                if (skewY) {
                    temp = Math.tan(skewY);
                    temp = Math.sqrt(1 + temp * temp);
                    a11 *= temp;
                    a21 *= temp;
                }
            }
            a11 = _round(a11);
            a21 = _round(a21);
            a12 = _round(a12);
            a22 = _round(a22);
        } else {
            a11 = scaleX;
            a22 = scaleY;
            a21 = a12 = 0;
        }
        if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
            tx = _convertToUnit(target, "x", x, "px");
            ty = _convertToUnit(target, "y", y, "px");
        }
        if (xOrigin || yOrigin || xOffset || yOffset) {
            tx = _round(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
            ty = _round(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
        }
        if (xPercent || yPercent) {
            temp = target.getBBox();
            tx = _round(tx + xPercent / 100 * temp.width);
            ty = _round(ty + yPercent / 100 * temp.height);
        }
        temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
        target.setAttribute("transform", temp);
        forceCSS && (target.style[_transformProp] = temp);
    }, _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue) {
        var direction, pt, cap = 360, isString = _isString(endValue), endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1), change = endNum - startNum, finalValue = startNum + change + "deg";
        if (isString) {
            direction = endValue.split("_")[1];
            if ("short" === direction) {
                change %= cap;
                if (change !== change % (cap / 2)) change += change < 0 ? cap : -cap;
            }
            if ("cw" === direction && change < 0) change = (change + cap * CSSPlugin_bigNum) % cap - ~~(change / cap) * cap; else if ("ccw" === direction && change > 0) change = (change - cap * CSSPlugin_bigNum) % cap - ~~(change / cap) * cap;
        }
        plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
        pt.e = finalValue;
        pt.u = "deg";
        plugin._props.push(property);
        return pt;
    }, _assign = function _assign(target, source) {
        for (var p in source) target[p] = source[p];
        return target;
    }, _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
        var endCache, p, startValue, endValue, startNum, endNum, startUnit, endUnit, startCache = _assign({}, target._gsap), exclude = "perspective,force3D,transformOrigin,svgOrigin", style = target.style;
        if (startCache.svg) {
            startValue = target.getAttribute("transform");
            target.setAttribute("transform", "");
            style[_transformProp] = transforms;
            endCache = _parseTransform(target, 1);
            _removeProperty(target, _transformProp);
            target.setAttribute("transform", startValue);
        } else {
            startValue = getComputedStyle(target)[_transformProp];
            style[_transformProp] = transforms;
            endCache = _parseTransform(target, 1);
            style[_transformProp] = startValue;
        }
        for (p in _transformProps) {
            startValue = startCache[p];
            endValue = endCache[p];
            if (startValue !== endValue && exclude.indexOf(p) < 0) {
                startUnit = getUnit(startValue);
                endUnit = getUnit(endValue);
                startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
                endNum = parseFloat(endValue);
                plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
                plugin._pt.u = endUnit || 0;
                plugin._props.push(p);
            }
        }
        _assign(endCache, startCache);
    };
    _forEachName("padding,margin,Width,Radius", (function(name, index) {
        var t = "Top", r = "Right", b = "Bottom", l = "Left", props = (index < 3 ? [ t, r, b, l ] : [ t + l, t + r, b + r, b + l ]).map((function(side) {
            return index < 2 ? name + side : "border" + side + name;
        }));
        _specialProps[index > 1 ? "border" + name : name] = function(plugin, target, property, endValue, tween) {
            var a, vars;
            if (arguments.length < 4) {
                a = props.map((function(prop) {
                    return _get(plugin, prop, property);
                }));
                vars = a.join(" ");
                return 5 === vars.split(a[0]).length ? a[0] : vars;
            }
            a = (endValue + "").split(" ");
            vars = {};
            props.forEach((function(prop, i) {
                return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
            }));
            plugin.init(target, vars, tween);
        };
    }));
    var CSSPlugin = {
        name: "css",
        register: _initCore,
        targetTest: function targetTest(target) {
            return target.style && target.nodeType;
        },
        init: function init(target, vars, tween, index, targets) {
            var startValue, endValue, endNum, startNum, type, specialProp, p, startUnit, endUnit, relative, isTransformRelated, transformPropTween, cache, smooth, hasPriority, inlineProps, props = this._props, style = target.style, startAt = tween.vars.startAt;
            _pluginInitted || _initCore();
            this.styles = this.styles || _getStyleSaver(target);
            inlineProps = this.styles.props;
            this.tween = tween;
            for (p in vars) {
                if ("autoRound" === p) continue;
                endValue = vars[p];
                if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) continue;
                type = typeof endValue;
                specialProp = _specialProps[p];
                if ("function" === type) {
                    endValue = endValue.call(tween, index, target, targets);
                    type = typeof endValue;
                }
                if ("string" === type && ~endValue.indexOf("random(")) endValue = _replaceRandom(endValue);
                if (specialProp) specialProp(this, target, p, endValue, tween) && (hasPriority = 1); else if ("--" === p.substr(0, 2)) {
                    startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
                    endValue += "";
                    _colorExp.lastIndex = 0;
                    if (!_colorExp.test(startValue)) {
                        startUnit = getUnit(startValue);
                        endUnit = getUnit(endValue);
                    }
                    endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
                    this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
                    props.push(p);
                    inlineProps.push(p, 0, style[p]);
                } else if ("undefined" !== type) {
                    if (startAt && p in startAt) {
                        startValue = "function" === typeof startAt[p] ? startAt[p].call(tween, index, target, targets) : startAt[p];
                        _isString(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
                        getUnit(startValue + "") || (startValue += _config.units[p] || getUnit(_get(target, p)) || "");
                        "=" === (startValue + "").charAt(1) && (startValue = _get(target, p));
                    } else startValue = _get(target, p);
                    startNum = parseFloat(startValue);
                    relative = "string" === type && "=" === endValue.charAt(1) && endValue.substr(0, 2);
                    relative && (endValue = endValue.substr(2));
                    endNum = parseFloat(endValue);
                    if (p in _propertyAliases) {
                        if ("autoAlpha" === p) {
                            if (1 === startNum && "hidden" === _get(target, "visibility") && endNum) startNum = 0;
                            inlineProps.push("visibility", 0, style.visibility);
                            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
                        }
                        if ("scale" !== p && "transform" !== p) {
                            p = _propertyAliases[p];
                            ~p.indexOf(",") && (p = p.split(",")[0]);
                        }
                    }
                    isTransformRelated = p in _transformProps;
                    if (isTransformRelated) {
                        this.styles.save(p);
                        if (!transformPropTween) {
                            cache = target._gsap;
                            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform);
                            smooth = false !== vars.smoothOrigin && cache.smooth;
                            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp, 0, 1, cache.renderTransform, cache, 0, -1);
                            transformPropTween.dep = 1;
                        }
                        if ("scale" === p) {
                            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
                            this._pt.u = 0;
                            props.push("scaleY", p);
                            p += "X";
                        } else if ("transformOrigin" === p) {
                            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
                            endValue = _convertKeywordsToPercentages(endValue);
                            if (cache.svg) _applySVGOrigin(target, endValue, 0, smooth, 0, this); else {
                                endUnit = parseFloat(endValue.split(" ")[2]) || 0;
                                endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
                                _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
                            }
                            continue;
                        } else if ("svgOrigin" === p) {
                            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
                            continue;
                        } else if (p in _rotationalProperties) {
                            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
                            continue;
                        } else if ("smoothOrigin" === p) {
                            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
                            continue;
                        } else if ("force3D" === p) {
                            cache[p] = endValue;
                            continue;
                        } else if ("transform" === p) {
                            _addRawTransformPTs(this, endValue, target);
                            continue;
                        }
                    } else if (!(p in style)) p = _checkPropPrefix(p) || p;
                    if (isTransformRelated || (endNum || 0 === endNum) && (startNum || 0 === startNum) && !_complexExp.test(endValue) && p in style) {
                        startUnit = (startValue + "").substr((startNum + "").length);
                        endNum || (endNum = 0);
                        endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
                        startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
                        this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && ("px" === endUnit || "zIndex" === p) && false !== vars.autoRound ? _renderRoundedCSSProp : _renderCSSProp);
                        this._pt.u = endUnit || 0;
                        if (startUnit !== endUnit && "%" !== endUnit) {
                            this._pt.b = startValue;
                            this._pt.r = _renderCSSPropWithBeginning;
                        }
                    } else if (!(p in style)) {
                        if (p in target) this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets); else if ("parseTransform" !== p) {
                            _missingPlugin(p, endValue);
                            continue;
                        }
                    } else _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
                    isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : inlineProps.push(p, 1, startValue || target[p]));
                    props.push(p);
                }
            }
            hasPriority && _sortPropTweensByPriority(this);
        },
        render: function render(ratio, data) {
            if (data.tween._time || !CSSPlugin_reverting()) {
                var pt = data._pt;
                while (pt) {
                    pt.r(ratio, pt.d);
                    pt = pt._next;
                }
            } else data.styles.revert();
        },
        get: _get,
        aliases: _propertyAliases,
        getSetter: function getSetter(target, property, plugin) {
            var p = _propertyAliases[property];
            p && p.indexOf(",") < 0 && (property = p);
            return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? "scale" === property ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && ("scale" === property ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
        },
        core: {
            _removeProperty,
            _getMatrix
        }
    };
    gsap.utils.checkPrefix = _checkPropPrefix;
    gsap.core.getStyleSaver = _getStyleSaver;
    (function(positionAndScale, rotation, others, aliases) {
        var all = _forEachName(positionAndScale + "," + rotation + "," + others, (function(name) {
            _transformProps[name] = 1;
        }));
        _forEachName(rotation, (function(name) {
            _config.units[name] = "deg";
            _rotationalProperties[name] = 1;
        }));
        _propertyAliases[all[13]] = positionAndScale + "," + rotation;
        _forEachName(aliases, (function(name) {
            var split = name.split(":");
            _propertyAliases[split[1]] = all[split[0]];
        }));
    })("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
    _forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", (function(name) {
        _config.units[name] = "px";
    }));
    gsap.registerPlugin(CSSPlugin);
    var gsapWithCSS = gsap.registerPlugin(CSSPlugin) || gsap;
    gsapWithCSS.core.Tween;
    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }
    /*!
 * Observer 3.11.4
 * https://greensock.com
 *
 * @license Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/    var Observer_gsap, Observer_coreInitted, Observer_win, Observer_doc, _docEl, _body, _isTouch, _pointerType, ScrollTrigger, _root, _normalizer, _eventTypes, Observer_context, _getGSAP = function _getGSAP() {
        return Observer_gsap || "undefined" !== typeof window && (Observer_gsap = window.gsap) && Observer_gsap.registerPlugin && Observer_gsap;
    }, _startup = 1, _observers = [], _scrollers = [], _proxies = [], _getTime = Date.now, _bridge = function _bridge(name, value) {
        return value;
    }, _integrate = function _integrate() {
        var core = ScrollTrigger.core, data = core.bridge || {}, scrollers = core._scrollers, proxies = core._proxies;
        scrollers.push.apply(scrollers, _scrollers);
        proxies.push.apply(proxies, _proxies);
        _scrollers = scrollers;
        _proxies = proxies;
        _bridge = function _bridge(name, value) {
            return data[name](value);
        };
    }, _getProxyProp = function _getProxyProp(element, property) {
        return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
    }, _isViewport = function _isViewport(el) {
        return !!~_root.indexOf(el);
    }, _addListener = function _addListener(element, type, func, nonPassive, capture) {
        return element.addEventListener(type, func, {
            passive: !nonPassive,
            capture: !!capture
        });
    }, _removeListener = function _removeListener(element, type, func, capture) {
        return element.removeEventListener(type, func, !!capture);
    }, _scrollLeft = "scrollLeft", _scrollTop = "scrollTop", _onScroll = function _onScroll() {
        return _normalizer && _normalizer.isPressed || _scrollers.cache++;
    }, _scrollCacheFunc = function _scrollCacheFunc(f, doNotCache) {
        var cachingFunc = function cachingFunc(value) {
            if (value || 0 === value) {
                _startup && (Observer_win.history.scrollRestoration = "manual");
                var isNormalizing = _normalizer && _normalizer.isPressed;
                value = cachingFunc.v = Math.round(value) || (_normalizer && _normalizer.iOS ? 1 : 0);
                f(value);
                cachingFunc.cacheID = _scrollers.cache;
                isNormalizing && _bridge("ss", value);
            } else if (doNotCache || _scrollers.cache !== cachingFunc.cacheID || _bridge("ref")) {
                cachingFunc.cacheID = _scrollers.cache;
                cachingFunc.v = f();
            }
            return cachingFunc.v + cachingFunc.offset;
        };
        cachingFunc.offset = 0;
        return f && cachingFunc;
    }, _horizontal = {
        s: _scrollLeft,
        p: "left",
        p2: "Left",
        os: "right",
        os2: "Right",
        d: "width",
        d2: "Width",
        a: "x",
        sc: _scrollCacheFunc((function(value) {
            return arguments.length ? Observer_win.scrollTo(value, _vertical.sc()) : Observer_win.pageXOffset || Observer_doc[_scrollLeft] || _docEl[_scrollLeft] || _body[_scrollLeft] || 0;
        }))
    }, _vertical = {
        s: _scrollTop,
        p: "top",
        p2: "Top",
        os: "bottom",
        os2: "Bottom",
        d: "height",
        d2: "Height",
        a: "y",
        op: _horizontal,
        sc: _scrollCacheFunc((function(value) {
            return arguments.length ? Observer_win.scrollTo(_horizontal.sc(), value) : Observer_win.pageYOffset || Observer_doc[_scrollTop] || _docEl[_scrollTop] || _body[_scrollTop] || 0;
        }))
    }, _getTarget = function _getTarget(t) {
        return Observer_gsap.utils.toArray(t)[0] || ("string" === typeof t && false !== Observer_gsap.config().nullTargetWarn ? console.warn("Element not found:", t) : null);
    }, _getScrollFunc = function _getScrollFunc(element, _ref) {
        var s = _ref.s, sc = _ref.sc;
        _isViewport(element) && (element = Observer_doc.scrollingElement || _docEl);
        var i = _scrollers.indexOf(element), offset = sc === _vertical.sc ? 1 : 2;
        !~i && (i = _scrollers.push(element) - 1);
        _scrollers[i + offset] || element.addEventListener("scroll", _onScroll);
        var prev = _scrollers[i + offset], func = prev || (_scrollers[i + offset] = _scrollCacheFunc(_getProxyProp(element, s), true) || (_isViewport(element) ? sc : _scrollCacheFunc((function(value) {
            return arguments.length ? element[s] = value : element[s];
        }))));
        func.target = element;
        prev || (func.smooth = "smooth" === Observer_gsap.getProperty(element, "scrollBehavior"));
        return func;
    }, _getVelocityProp = function _getVelocityProp(value, minTimeRefresh, useDelta) {
        var v1 = value, v2 = value, t1 = _getTime(), t2 = t1, min = minTimeRefresh || 50, dropToZeroTime = Math.max(500, 3 * min), update = function update(value, force) {
            var t = _getTime();
            if (force || t - t1 > min) {
                v2 = v1;
                v1 = value;
                t2 = t1;
                t1 = t;
            } else if (useDelta) v1 += value; else v1 = v2 + (value - v2) / (t - t2) * (t1 - t2);
        }, reset = function reset() {
            v2 = v1 = useDelta ? 0 : v1;
            t2 = t1 = 0;
        }, getVelocity = function getVelocity(latestValue) {
            var tOld = t2, vOld = v2, t = _getTime();
            (latestValue || 0 === latestValue) && latestValue !== v1 && update(latestValue);
            return t1 === t2 || t - t2 > dropToZeroTime ? 0 : (v1 + (useDelta ? vOld : -vOld)) / ((useDelta ? t : t1) - tOld) * 1e3;
        };
        return {
            update,
            reset,
            getVelocity
        };
    }, _getEvent = function _getEvent(e, preventDefault) {
        preventDefault && !e._gsapAllow && e.preventDefault();
        return e.changedTouches ? e.changedTouches[0] : e;
    }, _getAbsoluteMax = function _getAbsoluteMax(a) {
        var max = Math.max.apply(Math, a), min = Math.min.apply(Math, a);
        return Math.abs(max) >= Math.abs(min) ? max : min;
    }, _setScrollTrigger = function _setScrollTrigger() {
        ScrollTrigger = Observer_gsap.core.globals().ScrollTrigger;
        ScrollTrigger && ScrollTrigger.core && _integrate();
    }, Observer_initCore = function _initCore(core) {
        Observer_gsap = core || _getGSAP();
        if (Observer_gsap && "undefined" !== typeof document && document.body) {
            Observer_win = window;
            Observer_doc = document;
            _docEl = Observer_doc.documentElement;
            _body = Observer_doc.body;
            _root = [ Observer_win, Observer_doc, _docEl, _body ];
            Observer_gsap.utils.clamp;
            Observer_context = Observer_gsap.core.context || function() {};
            _pointerType = "onpointerenter" in _body ? "pointer" : "mouse";
            _isTouch = Observer.isTouch = Observer_win.matchMedia && Observer_win.matchMedia("(hover: none), (pointer: coarse)").matches ? 1 : "ontouchstart" in Observer_win || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 ? 2 : 0;
            _eventTypes = Observer.eventTypes = ("ontouchstart" in _docEl ? "touchstart,touchmove,touchcancel,touchend" : !("onpointerdown" in _docEl) ? "mousedown,mousemove,mouseup,mouseup" : "pointerdown,pointermove,pointercancel,pointerup").split(",");
            setTimeout((function() {
                return _startup = 0;
            }), 500);
            _setScrollTrigger();
            Observer_coreInitted = 1;
        }
        return Observer_coreInitted;
    };
    _horizontal.op = _vertical;
    _scrollers.cache = 0;
    var Observer = function() {
        function Observer(vars) {
            this.init(vars);
        }
        var _proto = Observer.prototype;
        _proto.init = function init(vars) {
            Observer_coreInitted || Observer_initCore(Observer_gsap) || console.warn("Please gsap.registerPlugin(Observer)");
            ScrollTrigger || _setScrollTrigger();
            var tolerance = vars.tolerance, dragMinimum = vars.dragMinimum, type = vars.type, target = vars.target, lineHeight = vars.lineHeight, debounce = vars.debounce, preventDefault = vars.preventDefault, onStop = vars.onStop, onStopDelay = vars.onStopDelay, ignore = vars.ignore, wheelSpeed = vars.wheelSpeed, event = vars.event, onDragStart = vars.onDragStart, onDragEnd = vars.onDragEnd, onDrag = vars.onDrag, onPress = vars.onPress, onRelease = vars.onRelease, onRight = vars.onRight, onLeft = vars.onLeft, onUp = vars.onUp, onDown = vars.onDown, onChangeX = vars.onChangeX, onChangeY = vars.onChangeY, onChange = vars.onChange, onToggleX = vars.onToggleX, onToggleY = vars.onToggleY, onHover = vars.onHover, onHoverEnd = vars.onHoverEnd, onMove = vars.onMove, ignoreCheck = vars.ignoreCheck, isNormalizer = vars.isNormalizer, onGestureStart = vars.onGestureStart, onGestureEnd = vars.onGestureEnd, onWheel = vars.onWheel, onEnable = vars.onEnable, onDisable = vars.onDisable, onClick = vars.onClick, scrollSpeed = vars.scrollSpeed, capture = vars.capture, allowClicks = vars.allowClicks, lockAxis = vars.lockAxis, onLockAxis = vars.onLockAxis;
            this.target = target = _getTarget(target) || _docEl;
            this.vars = vars;
            ignore && (ignore = Observer_gsap.utils.toArray(ignore));
            tolerance = tolerance || 1e-9;
            dragMinimum = dragMinimum || 0;
            wheelSpeed = wheelSpeed || 1;
            scrollSpeed = scrollSpeed || 1;
            type = type || "wheel,touch,pointer";
            debounce = false !== debounce;
            lineHeight || (lineHeight = parseFloat(Observer_win.getComputedStyle(_body).lineHeight) || 22);
            var id, onStopDelayedCall, dragged, moved, wheeled, locked, axis, self = this, prevDeltaX = 0, prevDeltaY = 0, scrollFuncX = _getScrollFunc(target, _horizontal), scrollFuncY = _getScrollFunc(target, _vertical), scrollX = scrollFuncX(), scrollY = scrollFuncY(), limitToTouch = ~type.indexOf("touch") && !~type.indexOf("pointer") && "pointerdown" === _eventTypes[0], isViewport = _isViewport(target), ownerDoc = target.ownerDocument || Observer_doc, deltaX = [ 0, 0, 0 ], deltaY = [ 0, 0, 0 ], onClickTime = 0, clickCapture = function clickCapture() {
                return onClickTime = _getTime();
            }, _ignoreCheck = function _ignoreCheck(e, isPointerOrTouch) {
                return (self.event = e) && ignore && ~ignore.indexOf(e.target) || isPointerOrTouch && limitToTouch && "touch" !== e.pointerType || ignoreCheck && ignoreCheck(e, isPointerOrTouch);
            }, onStopFunc = function onStopFunc() {
                self._vx.reset();
                self._vy.reset();
                onStopDelayedCall.pause();
                onStop && onStop(self);
            }, update = function update() {
                var dx = self.deltaX = _getAbsoluteMax(deltaX), dy = self.deltaY = _getAbsoluteMax(deltaY), changedX = Math.abs(dx) >= tolerance, changedY = Math.abs(dy) >= tolerance;
                onChange && (changedX || changedY) && onChange(self, dx, dy, deltaX, deltaY);
                if (changedX) {
                    onRight && self.deltaX > 0 && onRight(self);
                    onLeft && self.deltaX < 0 && onLeft(self);
                    onChangeX && onChangeX(self);
                    onToggleX && self.deltaX < 0 !== prevDeltaX < 0 && onToggleX(self);
                    prevDeltaX = self.deltaX;
                    deltaX[0] = deltaX[1] = deltaX[2] = 0;
                }
                if (changedY) {
                    onDown && self.deltaY > 0 && onDown(self);
                    onUp && self.deltaY < 0 && onUp(self);
                    onChangeY && onChangeY(self);
                    onToggleY && self.deltaY < 0 !== prevDeltaY < 0 && onToggleY(self);
                    prevDeltaY = self.deltaY;
                    deltaY[0] = deltaY[1] = deltaY[2] = 0;
                }
                if (moved || dragged) {
                    onMove && onMove(self);
                    if (dragged) {
                        onDrag(self);
                        dragged = false;
                    }
                    moved = false;
                }
                locked && !(locked = false) && onLockAxis && onLockAxis(self);
                if (wheeled) {
                    onWheel(self);
                    wheeled = false;
                }
                id = 0;
            }, onDelta = function onDelta(x, y, index) {
                deltaX[index] += x;
                deltaY[index] += y;
                self._vx.update(x);
                self._vy.update(y);
                debounce ? id || (id = requestAnimationFrame(update)) : update();
            }, onTouchOrPointerDelta = function onTouchOrPointerDelta(x, y) {
                if (lockAxis && !axis) {
                    self.axis = axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
                    locked = true;
                }
                if ("y" !== axis) {
                    deltaX[2] += x;
                    self._vx.update(x, true);
                }
                if ("x" !== axis) {
                    deltaY[2] += y;
                    self._vy.update(y, true);
                }
                debounce ? id || (id = requestAnimationFrame(update)) : update();
            }, _onDrag = function _onDrag(e) {
                if (_ignoreCheck(e, 1)) return;
                e = _getEvent(e, preventDefault);
                var x = e.clientX, y = e.clientY, dx = x - self.x, dy = y - self.y, isDragging = self.isDragging;
                self.x = x;
                self.y = y;
                if (isDragging || Math.abs(self.startX - x) >= dragMinimum || Math.abs(self.startY - y) >= dragMinimum) {
                    onDrag && (dragged = true);
                    isDragging || (self.isDragging = true);
                    onTouchOrPointerDelta(dx, dy);
                    isDragging || onDragStart && onDragStart(self);
                }
            }, _onPress = self.onPress = function(e) {
                if (_ignoreCheck(e, 1)) return;
                self.axis = axis = null;
                onStopDelayedCall.pause();
                self.isPressed = true;
                e = _getEvent(e);
                prevDeltaX = prevDeltaY = 0;
                self.startX = self.x = e.clientX;
                self.startY = self.y = e.clientY;
                self._vx.reset();
                self._vy.reset();
                _addListener(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, preventDefault, true);
                self.deltaX = self.deltaY = 0;
                onPress && onPress(self);
            }, _onRelease = function _onRelease(e) {
                if (_ignoreCheck(e, 1)) return;
                _removeListener(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
                var isTrackingDrag = !isNaN(self.y - self.startY), wasDragging = self.isDragging && (Math.abs(self.x - self.startX) > 3 || Math.abs(self.y - self.startY) > 3), eventData = _getEvent(e);
                if (!wasDragging && isTrackingDrag) {
                    self._vx.reset();
                    self._vy.reset();
                    if (preventDefault && allowClicks) Observer_gsap.delayedCall(.08, (function() {
                        if (_getTime() - onClickTime > 300 && !e.defaultPrevented) if (e.target.click) e.target.click(); else if (ownerDoc.createEvent) {
                            var syntheticEvent = ownerDoc.createEvent("MouseEvents");
                            syntheticEvent.initMouseEvent("click", true, true, Observer_win, 1, eventData.screenX, eventData.screenY, eventData.clientX, eventData.clientY, false, false, false, false, 0, null);
                            e.target.dispatchEvent(syntheticEvent);
                        }
                    }));
                }
                self.isDragging = self.isGesturing = self.isPressed = false;
                onStop && !isNormalizer && onStopDelayedCall.restart(true);
                onDragEnd && wasDragging && onDragEnd(self);
                onRelease && onRelease(self, wasDragging);
            }, _onGestureStart = function _onGestureStart(e) {
                return e.touches && e.touches.length > 1 && (self.isGesturing = true) && onGestureStart(e, self.isDragging);
            }, _onGestureEnd = function _onGestureEnd() {
                return (self.isGesturing = false) || onGestureEnd(self);
            }, onScroll = function onScroll(e) {
                if (_ignoreCheck(e)) return;
                var x = scrollFuncX(), y = scrollFuncY();
                onDelta((x - scrollX) * scrollSpeed, (y - scrollY) * scrollSpeed, 1);
                scrollX = x;
                scrollY = y;
                onStop && onStopDelayedCall.restart(true);
            }, _onWheel = function _onWheel(e) {
                if (_ignoreCheck(e)) return;
                e = _getEvent(e, preventDefault);
                onWheel && (wheeled = true);
                var multiplier = (1 === e.deltaMode ? lineHeight : 2 === e.deltaMode ? Observer_win.innerHeight : 1) * wheelSpeed;
                onDelta(e.deltaX * multiplier, e.deltaY * multiplier, 0);
                onStop && !isNormalizer && onStopDelayedCall.restart(true);
            }, _onMove = function _onMove(e) {
                if (_ignoreCheck(e)) return;
                var x = e.clientX, y = e.clientY, dx = x - self.x, dy = y - self.y;
                self.x = x;
                self.y = y;
                moved = true;
                (dx || dy) && onTouchOrPointerDelta(dx, dy);
            }, _onHover = function _onHover(e) {
                self.event = e;
                onHover(self);
            }, _onHoverEnd = function _onHoverEnd(e) {
                self.event = e;
                onHoverEnd(self);
            }, _onClick = function _onClick(e) {
                return _ignoreCheck(e) || _getEvent(e, preventDefault) && onClick(self);
            };
            onStopDelayedCall = self._dc = Observer_gsap.delayedCall(onStopDelay || .25, onStopFunc).pause();
            self.deltaX = self.deltaY = 0;
            self._vx = _getVelocityProp(0, 50, true);
            self._vy = _getVelocityProp(0, 50, true);
            self.scrollX = scrollFuncX;
            self.scrollY = scrollFuncY;
            self.isDragging = self.isGesturing = self.isPressed = false;
            Observer_context(this);
            self.enable = function(e) {
                if (!self.isEnabled) {
                    _addListener(isViewport ? ownerDoc : target, "scroll", _onScroll);
                    type.indexOf("scroll") >= 0 && _addListener(isViewport ? ownerDoc : target, "scroll", onScroll, preventDefault, capture);
                    type.indexOf("wheel") >= 0 && _addListener(target, "wheel", _onWheel, preventDefault, capture);
                    if (type.indexOf("touch") >= 0 && _isTouch || type.indexOf("pointer") >= 0) {
                        _addListener(target, _eventTypes[0], _onPress, preventDefault, capture);
                        _addListener(ownerDoc, _eventTypes[2], _onRelease);
                        _addListener(ownerDoc, _eventTypes[3], _onRelease);
                        allowClicks && _addListener(target, "click", clickCapture, false, true);
                        onClick && _addListener(target, "click", _onClick);
                        onGestureStart && _addListener(ownerDoc, "gesturestart", _onGestureStart);
                        onGestureEnd && _addListener(ownerDoc, "gestureend", _onGestureEnd);
                        onHover && _addListener(target, _pointerType + "enter", _onHover);
                        onHoverEnd && _addListener(target, _pointerType + "leave", _onHoverEnd);
                        onMove && _addListener(target, _pointerType + "move", _onMove);
                    }
                    self.isEnabled = true;
                    e && e.type && _onPress(e);
                    onEnable && onEnable(self);
                }
                return self;
            };
            self.disable = function() {
                if (self.isEnabled) {
                    _observers.filter((function(o) {
                        return o !== self && _isViewport(o.target);
                    })).length || _removeListener(isViewport ? ownerDoc : target, "scroll", _onScroll);
                    if (self.isPressed) {
                        self._vx.reset();
                        self._vy.reset();
                        _removeListener(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
                    }
                    _removeListener(isViewport ? ownerDoc : target, "scroll", onScroll, capture);
                    _removeListener(target, "wheel", _onWheel, capture);
                    _removeListener(target, _eventTypes[0], _onPress, capture);
                    _removeListener(ownerDoc, _eventTypes[2], _onRelease);
                    _removeListener(ownerDoc, _eventTypes[3], _onRelease);
                    _removeListener(target, "click", clickCapture, true);
                    _removeListener(target, "click", _onClick);
                    _removeListener(ownerDoc, "gesturestart", _onGestureStart);
                    _removeListener(ownerDoc, "gestureend", _onGestureEnd);
                    _removeListener(target, _pointerType + "enter", _onHover);
                    _removeListener(target, _pointerType + "leave", _onHoverEnd);
                    _removeListener(target, _pointerType + "move", _onMove);
                    self.isEnabled = self.isPressed = self.isDragging = false;
                    onDisable && onDisable(self);
                }
            };
            self.kill = self.revert = function() {
                self.disable();
                var i = _observers.indexOf(self);
                i >= 0 && _observers.splice(i, 1);
                _normalizer === self && (_normalizer = 0);
            };
            _observers.push(self);
            isNormalizer && _isViewport(target) && (_normalizer = self);
            self.enable(event);
        };
        _createClass(Observer, [ {
            key: "velocityX",
            get: function get() {
                return this._vx.getVelocity();
            }
        }, {
            key: "velocityY",
            get: function get() {
                return this._vy.getVelocity();
            }
        } ]);
        return Observer;
    }();
    Observer.version = "3.11.4";
    Observer.create = function(vars) {
        return new Observer(vars);
    };
    Observer.register = Observer_initCore;
    Observer.getAll = function() {
        return _observers.slice();
    };
    Observer.getById = function(id) {
        return _observers.filter((function(o) {
            return o.vars.id === id;
        }))[0];
    };
    _getGSAP() && Observer_gsap.registerPlugin(Observer);
    /*!
 * ScrollTrigger 3.11.4
 * https://greensock.com
 *
 * @license Copyright 2008-2022, GreenSock. All rights reserved.
 * Subject to the terms at https://greensock.com/standard-license or for
 * Club GreenSock members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
    var ScrollTrigger_gsap, ScrollTrigger_coreInitted, ScrollTrigger_win, ScrollTrigger_doc, ScrollTrigger_docEl, ScrollTrigger_body, ScrollTrigger_root, _resizeDelay, _toArray, ScrollTrigger_clamp, _time2, _syncInterval, _refreshing, _pointerIsDown, ScrollTrigger_transformProp, _i, _prevWidth, _prevHeight, _autoRefresh, _sort, ScrollTrigger_suppressOverwrites, _ignoreResize, ScrollTrigger_normalizer, _ignoreMobileResize, _baseScreenHeight, _baseScreenWidth, _fixIOSBug, ScrollTrigger_context, _scrollRestoration, _limitCallbacks, _rafID, _refreshingAll, _queueRefreshID, _primary, ScrollTrigger_startup = 1, ScrollTrigger_getTime = Date.now, _time1 = ScrollTrigger_getTime(), _lastScrollTime = 0, _enabled = 0, _pointerDownHandler = function _pointerDownHandler() {
        return _pointerIsDown = 1;
    }, _pointerUpHandler = function _pointerUpHandler() {
        return _pointerIsDown = 0;
    }, ScrollTrigger_passThrough = function _passThrough(v) {
        return v;
    }, ScrollTrigger_round = function _round(value) {
        return Math.round(1e5 * value) / 1e5 || 0;
    }, ScrollTrigger_windowExists = function _windowExists() {
        return "undefined" !== typeof window;
    }, ScrollTrigger_getGSAP = function _getGSAP() {
        return ScrollTrigger_gsap || ScrollTrigger_windowExists() && (ScrollTrigger_gsap = window.gsap) && ScrollTrigger_gsap.registerPlugin && ScrollTrigger_gsap;
    }, ScrollTrigger_isViewport = function _isViewport(e) {
        return !!~ScrollTrigger_root.indexOf(e);
    }, _getBoundsFunc = function _getBoundsFunc(element) {
        return _getProxyProp(element, "getBoundingClientRect") || (ScrollTrigger_isViewport(element) ? function() {
            _winOffsets.width = ScrollTrigger_win.innerWidth;
            _winOffsets.height = ScrollTrigger_win.innerHeight;
            return _winOffsets;
        } : function() {
            return _getBounds(element);
        });
    }, _getSizeFunc = function _getSizeFunc(scroller, isViewport, _ref) {
        var d = _ref.d, d2 = _ref.d2, a = _ref.a;
        return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function() {
            return a()[d];
        } : function() {
            return (isViewport ? ScrollTrigger_win["inner" + d2] : scroller["client" + d2]) || 0;
        };
    }, _getOffsetsFunc = function _getOffsetsFunc(element, isViewport) {
        return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function() {
            return _winOffsets;
        };
    }, _maxScroll = function _maxScroll(element, _ref2) {
        var s = _ref2.s, d2 = _ref2.d2, d = _ref2.d, a = _ref2.a;
        return (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : ScrollTrigger_isViewport(element) ? (ScrollTrigger_docEl[s] || ScrollTrigger_body[s]) - (ScrollTrigger_win["inner" + d2] || ScrollTrigger_docEl["client" + d2] || ScrollTrigger_body["client" + d2]) : element[s] - element["offset" + d2];
    }, _iterateAutoRefresh = function _iterateAutoRefresh(func, events) {
        for (var i = 0; i < _autoRefresh.length; i += 3) (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
    }, ScrollTrigger_isString = function _isString(value) {
        return "string" === typeof value;
    }, ScrollTrigger_isFunction = function _isFunction(value) {
        return "function" === typeof value;
    }, ScrollTrigger_isNumber = function _isNumber(value) {
        return "number" === typeof value;
    }, ScrollTrigger_isObject = function _isObject(value) {
        return "object" === typeof value;
    }, _endAnimation = function _endAnimation(animation, reversed, pause) {
        return animation && animation.progress(reversed ? 0 : 1) && pause && animation.pause();
    }, ScrollTrigger_callback = function _callback(self, func) {
        if (self.enabled) {
            var result = func(self);
            result && result.totalTime && (self.callbackAnimation = result);
        }
    }, _abs = Math.abs, _left = "left", _top = "top", _right = "right", _bottom = "bottom", _width = "width", _height = "height", _Right = "Right", _Left = "Left", _Top = "Top", _Bottom = "Bottom", _padding = "padding", _margin = "margin", _Width = "Width", _Height = "Height", _px = "px", _getComputedStyle = function _getComputedStyle(element) {
        return ScrollTrigger_win.getComputedStyle(element);
    }, _makePositionable = function _makePositionable(element) {
        var position = _getComputedStyle(element).position;
        element.style.position = "absolute" === position || "fixed" === position ? position : "relative";
    }, ScrollTrigger_setDefaults = function _setDefaults(obj, defaults) {
        for (var p in defaults) p in obj || (obj[p] = defaults[p]);
        return obj;
    }, _getBounds = function _getBounds(element, withoutTransforms) {
        var tween = withoutTransforms && "matrix(1, 0, 0, 1, 0, 0)" !== _getComputedStyle(element)[ScrollTrigger_transformProp] && ScrollTrigger_gsap.to(element, {
            x: 0,
            y: 0,
            xPercent: 0,
            yPercent: 0,
            rotation: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            skewX: 0,
            skewY: 0
        }).progress(1), bounds = element.getBoundingClientRect();
        tween && tween.progress(0).kill();
        return bounds;
    }, _getSize = function _getSize(element, _ref3) {
        var d2 = _ref3.d2;
        return element["offset" + d2] || element["client" + d2] || 0;
    }, _getLabelRatioArray = function _getLabelRatioArray(timeline) {
        var p, a = [], labels = timeline.labels, duration = timeline.duration();
        for (p in labels) a.push(labels[p] / duration);
        return a;
    }, _getClosestLabel = function _getClosestLabel(animation) {
        return function(value) {
            return ScrollTrigger_gsap.utils.snap(_getLabelRatioArray(animation), value);
        };
    }, _snapDirectional = function _snapDirectional(snapIncrementOrArray) {
        var snap = ScrollTrigger_gsap.utils.snap(snapIncrementOrArray), a = Array.isArray(snapIncrementOrArray) && snapIncrementOrArray.slice(0).sort((function(a, b) {
            return a - b;
        }));
        return a ? function(value, direction, threshold) {
            if (void 0 === threshold) threshold = .001;
            var i;
            if (!direction) return snap(value);
            if (direction > 0) {
                value -= threshold;
                for (i = 0; i < a.length; i++) if (a[i] >= value) return a[i];
                return a[i - 1];
            } else {
                i = a.length;
                value += threshold;
                while (i--) if (a[i] <= value) return a[i];
            }
            return a[0];
        } : function(value, direction, threshold) {
            if (void 0 === threshold) threshold = .001;
            var snapped = snap(value);
            return !direction || Math.abs(snapped - value) < threshold || snapped - value < 0 === direction < 0 ? snapped : snap(direction < 0 ? value - snapIncrementOrArray : value + snapIncrementOrArray);
        };
    }, _getLabelAtDirection = function _getLabelAtDirection(timeline) {
        return function(value, st) {
            return _snapDirectional(_getLabelRatioArray(timeline))(value, st.direction);
        };
    }, _multiListener = function _multiListener(func, element, types, callback) {
        return types.split(",").forEach((function(type) {
            return func(element, type, callback);
        }));
    }, ScrollTrigger_addListener = function _addListener(element, type, func, nonPassive, capture) {
        return element.addEventListener(type, func, {
            passive: !nonPassive,
            capture: !!capture
        });
    }, ScrollTrigger_removeListener = function _removeListener(element, type, func, capture) {
        return element.removeEventListener(type, func, !!capture);
    }, _wheelListener = function _wheelListener(func, el, scrollFunc) {
        return scrollFunc && scrollFunc.wheelHandler && func(el, "wheel", scrollFunc);
    }, _markerDefaults = {
        startColor: "green",
        endColor: "red",
        indent: 0,
        fontSize: "16px",
        fontWeight: "normal"
    }, ScrollTrigger_defaults = {
        toggleActions: "play",
        anticipatePin: 0
    }, _keywords = {
        top: 0,
        left: 0,
        center: .5,
        bottom: 1,
        right: 1
    }, _offsetToPx = function _offsetToPx(value, size) {
        if (ScrollTrigger_isString(value)) {
            var eqIndex = value.indexOf("="), relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;
            if (~eqIndex) {
                value.indexOf("%") > eqIndex && (relative *= size / 100);
                value = value.substr(0, eqIndex - 1);
            }
            value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
        }
        return value;
    }, _createMarker = function _createMarker(type, name, container, direction, _ref4, offset, matchWidthEl, containerAnimation) {
        var startColor = _ref4.startColor, endColor = _ref4.endColor, fontSize = _ref4.fontSize, indent = _ref4.indent, fontWeight = _ref4.fontWeight;
        var e = ScrollTrigger_doc.createElement("div"), useFixedPosition = ScrollTrigger_isViewport(container) || "fixed" === _getProxyProp(container, "pinType"), isScroller = -1 !== type.indexOf("scroller"), parent = useFixedPosition ? ScrollTrigger_body : container, isStart = -1 !== type.indexOf("start"), color = isStart ? startColor : endColor, css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
        css += "position:" + ((isScroller || containerAnimation) && useFixedPosition ? "fixed;" : "absolute;");
        (isScroller || containerAnimation || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
        matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
        e._isStart = isStart;
        e.setAttribute("class", "gsap-marker-" + type + (name ? " marker-" + name : ""));
        e.style.cssText = css;
        e.innerText = name || 0 === name ? type + "-" + name : type;
        parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
        e._offset = e["offset" + direction.op.d2];
        _positionMarker(e, 0, direction, isStart);
        return e;
    }, _positionMarker = function _positionMarker(marker, start, direction, flipped) {
        var vars = {
            display: "block"
        }, side = direction[flipped ? "os2" : "p2"], oppositeSide = direction[flipped ? "p2" : "os2"];
        marker._isFlipped = flipped;
        vars[direction.a + "Percent"] = flipped ? -100 : 0;
        vars[direction.a] = flipped ? "1px" : 0;
        vars["border" + side + _Width] = 1;
        vars["border" + oppositeSide + _Width] = 0;
        vars[direction.p] = start + "px";
        ScrollTrigger_gsap.set(marker, vars);
    }, _triggers = [], _ids = {}, _sync = function _sync() {
        return ScrollTrigger_getTime() - _lastScrollTime > 34 && (_rafID || (_rafID = requestAnimationFrame(_updateAll)));
    }, ScrollTrigger_onScroll = function _onScroll() {
        if (!ScrollTrigger_normalizer || !ScrollTrigger_normalizer.isPressed || ScrollTrigger_normalizer.startX > ScrollTrigger_body.clientWidth) {
            _scrollers.cache++;
            if (ScrollTrigger_normalizer) _rafID || (_rafID = requestAnimationFrame(_updateAll)); else _updateAll();
            _lastScrollTime || ScrollTrigger_dispatch("scrollStart");
            _lastScrollTime = ScrollTrigger_getTime();
        }
    }, _setBaseDimensions = function _setBaseDimensions() {
        _baseScreenWidth = ScrollTrigger_win.innerWidth;
        _baseScreenHeight = ScrollTrigger_win.innerHeight;
    }, _onResize = function _onResize() {
        _scrollers.cache++;
        !_refreshing && !_ignoreResize && !ScrollTrigger_doc.fullscreenElement && !ScrollTrigger_doc.webkitFullscreenElement && (!_ignoreMobileResize || _baseScreenWidth !== ScrollTrigger_win.innerWidth || Math.abs(ScrollTrigger_win.innerHeight - _baseScreenHeight) > .25 * ScrollTrigger_win.innerHeight) && _resizeDelay.restart(true);
    }, ScrollTrigger_listeners = {}, ScrollTrigger_emptyArray = [], _softRefresh = function _softRefresh() {
        return ScrollTrigger_removeListener(ScrollTrigger_ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true);
    }, ScrollTrigger_dispatch = function _dispatch(type) {
        return ScrollTrigger_listeners[type] && ScrollTrigger_listeners[type].map((function(f) {
            return f();
        })) || ScrollTrigger_emptyArray;
    }, _savedStyles = [], _revertRecorded = function _revertRecorded(media) {
        for (var i = 0; i < _savedStyles.length; i += 5) if (!media || _savedStyles[i + 4] && _savedStyles[i + 4].query === media) {
            _savedStyles[i].style.cssText = _savedStyles[i + 1];
            _savedStyles[i].getBBox && _savedStyles[i].setAttribute("transform", _savedStyles[i + 2] || "");
            _savedStyles[i + 3].uncache = 1;
        }
    }, _revertAll = function _revertAll(kill, media) {
        var trigger;
        for (_i = 0; _i < _triggers.length; _i++) {
            trigger = _triggers[_i];
            if (trigger && (!media || trigger._ctx === media)) if (kill) trigger.kill(1); else trigger.revert(true, true);
        }
        media && _revertRecorded(media);
        media || ScrollTrigger_dispatch("revert");
    }, _clearScrollMemory = function _clearScrollMemory(scrollRestoration, force) {
        _scrollers.cache++;
        (force || !_refreshingAll) && _scrollers.forEach((function(obj) {
            return ScrollTrigger_isFunction(obj) && obj.cacheID++ && (obj.rec = 0);
        }));
        ScrollTrigger_isString(scrollRestoration) && (ScrollTrigger_win.history.scrollRestoration = _scrollRestoration = scrollRestoration);
    }, _refreshID = 0, _queueRefreshAll = function _queueRefreshAll() {
        if (_queueRefreshID !== _refreshID) {
            var id = _queueRefreshID = _refreshID;
            requestAnimationFrame((function() {
                return id === _refreshID && _refreshAll(true);
            }));
        }
    }, _refreshAll = function _refreshAll(force, skipRevert) {
        if (_lastScrollTime && !force) {
            ScrollTrigger_addListener(ScrollTrigger_ScrollTrigger, "scrollEnd", _softRefresh);
            return;
        }
        _refreshingAll = ScrollTrigger_ScrollTrigger.isRefreshing = true;
        _scrollers.forEach((function(obj) {
            return ScrollTrigger_isFunction(obj) && obj.cacheID++ && (obj.rec = obj());
        }));
        var refreshInits = ScrollTrigger_dispatch("refreshInit");
        _sort && ScrollTrigger_ScrollTrigger.sort();
        skipRevert || _revertAll();
        _scrollers.forEach((function(obj) {
            if (ScrollTrigger_isFunction(obj)) {
                obj.smooth && (obj.target.style.scrollBehavior = "auto");
                obj(0);
            }
        }));
        _triggers.slice(0).forEach((function(t) {
            return t.refresh();
        }));
        _triggers.forEach((function(t, i) {
            if (t._subPinOffset && t.pin) {
                var prop = t.vars.horizontal ? "offsetWidth" : "offsetHeight", original = t.pin[prop];
                t.revert(true, 1);
                t.adjustPinSpacing(t.pin[prop] - original);
                t.revert(false, 1);
            }
        }));
        _triggers.forEach((function(t) {
            return "max" === t.vars.end && t.setPositions(t.start, Math.max(t.start + 1, _maxScroll(t.scroller, t._dir)));
        }));
        refreshInits.forEach((function(result) {
            return result && result.render && result.render(-1);
        }));
        _scrollers.forEach((function(obj) {
            if (ScrollTrigger_isFunction(obj)) {
                obj.smooth && requestAnimationFrame((function() {
                    return obj.target.style.scrollBehavior = "smooth";
                }));
                obj.rec && obj(obj.rec);
            }
        }));
        _clearScrollMemory(_scrollRestoration, 1);
        _resizeDelay.pause();
        _refreshID++;
        _updateAll(2);
        _triggers.forEach((function(t) {
            return ScrollTrigger_isFunction(t.vars.onRefresh) && t.vars.onRefresh(t);
        }));
        _refreshingAll = ScrollTrigger_ScrollTrigger.isRefreshing = false;
        ScrollTrigger_dispatch("refresh");
    }, _lastScroll = 0, _direction = 1, _updateAll = function _updateAll(force) {
        if (!_refreshingAll || 2 === force) {
            ScrollTrigger_ScrollTrigger.isUpdating = true;
            _primary && _primary.update(0);
            var l = _triggers.length, time = ScrollTrigger_getTime(), recordVelocity = time - _time1 >= 50, scroll = l && _triggers[0].scroll();
            _direction = _lastScroll > scroll ? -1 : 1;
            _lastScroll = scroll;
            if (recordVelocity) {
                if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
                    _lastScrollTime = 0;
                    ScrollTrigger_dispatch("scrollEnd");
                }
                _time2 = _time1;
                _time1 = time;
            }
            if (_direction < 0) {
                _i = l;
                while (_i-- > 0) _triggers[_i] && _triggers[_i].update(0, recordVelocity);
                _direction = 1;
            } else for (_i = 0; _i < l; _i++) _triggers[_i] && _triggers[_i].update(0, recordVelocity);
            ScrollTrigger_ScrollTrigger.isUpdating = false;
        }
        _rafID = 0;
    }, _propNamesToCopy = [ _left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float", "zIndex", "gridColumnStart", "gridColumnEnd", "gridRowStart", "gridRowEnd", "gridArea", "justifySelf", "alignSelf", "placeSelf", "order" ], _stateProps = _propNamesToCopy.concat([ _width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left ]), _swapPinOut = function _swapPinOut(pin, spacer, state) {
        _setState(state);
        var cache = pin._gsap;
        if (cache.spacerIsNative) _setState(cache.spacerState); else if (pin._gsap.swappedIn) {
            var parent = spacer.parentNode;
            if (parent) {
                parent.insertBefore(pin, spacer);
                parent.removeChild(spacer);
            }
        }
        pin._gsap.swappedIn = false;
    }, _swapPinIn = function _swapPinIn(pin, spacer, cs, spacerState) {
        if (!pin._gsap.swappedIn) {
            var p, i = _propNamesToCopy.length, spacerStyle = spacer.style, pinStyle = pin.style;
            while (i--) {
                p = _propNamesToCopy[i];
                spacerStyle[p] = cs[p];
            }
            spacerStyle.position = "absolute" === cs.position ? "absolute" : "relative";
            "inline" === cs.display && (spacerStyle.display = "inline-block");
            pinStyle[_bottom] = pinStyle[_right] = "auto";
            spacerStyle.flexBasis = cs.flexBasis || "auto";
            spacerStyle.overflow = "visible";
            spacerStyle.boxSizing = "border-box";
            spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
            spacerStyle[_height] = _getSize(pin, _vertical) + _px;
            spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";
            _setState(spacerState);
            pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
            pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
            pinStyle[_padding] = cs[_padding];
            if (pin.parentNode !== spacer) {
                pin.parentNode.insertBefore(spacer, pin);
                spacer.appendChild(pin);
            }
            pin._gsap.swappedIn = true;
        }
    }, ScrollTrigger_capsExp = /([A-Z])/g, _setState = function _setState(state) {
        if (state) {
            var p, value, style = state.t.style, l = state.length, i = 0;
            (state.t._gsap || ScrollTrigger_gsap.core.getCache(state.t)).uncache = 1;
            for (;i < l; i += 2) {
                value = state[i + 1];
                p = state[i];
                if (value) style[p] = value; else if (style[p]) style.removeProperty(p.replace(ScrollTrigger_capsExp, "-$1").toLowerCase());
            }
        }
    }, _getState = function _getState(element) {
        var l = _stateProps.length, style = element.style, state = [], i = 0;
        for (;i < l; i++) state.push(_stateProps[i], style[_stateProps[i]]);
        state.t = element;
        return state;
    }, _copyState = function _copyState(state, override, omitOffsets) {
        var p, result = [], l = state.length, i = omitOffsets ? 8 : 0;
        for (;i < l; i += 2) {
            p = state[i];
            result.push(p, p in override ? override[p] : state[i + 1]);
        }
        result.t = state.t;
        return result;
    }, _winOffsets = {
        left: 0,
        top: 0
    }, ScrollTrigger_parsePosition = function _parsePosition(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax, containerAnimation) {
        ScrollTrigger_isFunction(value) && (value = value(self));
        if (ScrollTrigger_isString(value) && "max" === value.substr(0, 3)) value = scrollerMax + ("=" === value.charAt(4) ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
        var p1, p2, element, time = containerAnimation ? containerAnimation.time() : 0;
        containerAnimation && containerAnimation.seek(0);
        if (!ScrollTrigger_isNumber(value)) {
            ScrollTrigger_isFunction(trigger) && (trigger = trigger(self));
            var bounds, localOffset, globalOffset, display, offsets = (value || "0").split(" ");
            element = _getTarget(trigger) || ScrollTrigger_body;
            bounds = _getBounds(element) || {};
            if ((!bounds || !bounds.left && !bounds.top) && "none" === _getComputedStyle(element).display) {
                display = element.style.display;
                element.style.display = "block";
                bounds = _getBounds(element);
                display ? element.style.display = display : element.style.removeProperty("display");
            }
            localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
            globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
            value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
            markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
            scrollerSize -= scrollerSize - globalOffset;
        } else if (markerScroller) _positionMarker(markerScroller, scrollerSize, direction, true);
        if (marker) {
            var position = value + scrollerSize, isStart = marker._isStart;
            p1 = "scroll" + direction.d2;
            _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(ScrollTrigger_body[p1], ScrollTrigger_docEl[p1]) : marker.parentNode[p1]) <= position + 1);
            if (useFixedPosition) {
                scrollerBounds = _getBounds(markerScroller);
                useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
            }
        }
        if (containerAnimation && element) {
            p1 = _getBounds(element);
            containerAnimation.seek(scrollerMax);
            p2 = _getBounds(element);
            containerAnimation._caScrollDist = p1[direction.p] - p2[direction.p];
            value = value / containerAnimation._caScrollDist * scrollerMax;
        }
        containerAnimation && containerAnimation.seek(time);
        return containerAnimation ? value : Math.round(value);
    }, _prefixExp = /(webkit|moz|length|cssText|inset)/i, _reparent = function _reparent(element, parent, top, left) {
        if (element.parentNode !== parent) {
            var p, cs, style = element.style;
            if (parent === ScrollTrigger_body) {
                element._stOrig = style.cssText;
                cs = _getComputedStyle(element);
                for (p in cs) if (!+p && !_prefixExp.test(p) && cs[p] && "string" === typeof style[p] && "0" !== p) style[p] = cs[p];
                style.top = top;
                style.left = left;
            } else style.cssText = element._stOrig;
            ScrollTrigger_gsap.core.getCache(element).uncache = 1;
            parent.appendChild(element);
        }
    }, _getTweenCreator = function _getTweenCreator(scroller, direction) {
        var lastScroll1, lastScroll2, getScroll = _getScrollFunc(scroller, direction), prop = "_scroll" + direction.p2, getTween = function getTween(scrollTo, vars, initialValue, change1, change2) {
            var tween = getTween.tween, onComplete = vars.onComplete, modifiers = {};
            initialValue = initialValue || getScroll();
            change2 = change1 && change2 || 0;
            change1 = change1 || scrollTo - initialValue;
            tween && tween.kill();
            lastScroll1 = Math.round(initialValue);
            vars[prop] = scrollTo;
            vars.modifiers = modifiers;
            modifiers[prop] = function(value) {
                value = Math.round(getScroll());
                if (value !== lastScroll1 && value !== lastScroll2 && Math.abs(value - lastScroll1) > 3 && Math.abs(value - lastScroll2) > 3) {
                    tween.kill();
                    getTween.tween = 0;
                } else value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
                lastScroll2 = lastScroll1;
                return lastScroll1 = Math.round(value);
            };
            vars.onUpdate = function() {
                _scrollers.cache++;
                _updateAll();
            };
            vars.onComplete = function() {
                getTween.tween = 0;
                onComplete && onComplete.call(tween);
            };
            tween = getTween.tween = ScrollTrigger_gsap.to(scroller, vars);
            return tween;
        };
        scroller[prop] = getScroll;
        getScroll.wheelHandler = function() {
            return getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
        };
        ScrollTrigger_addListener(scroller, "wheel", getScroll.wheelHandler);
        return getTween;
    };
    var ScrollTrigger_ScrollTrigger = function() {
        function ScrollTrigger(vars, animation) {
            ScrollTrigger_coreInitted || ScrollTrigger.register(ScrollTrigger_gsap) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
            this.init(vars, animation);
        }
        var _proto = ScrollTrigger.prototype;
        _proto.init = function init(vars, animation) {
            this.progress = this.start = 0;
            this.vars && this.kill(true, true);
            if (!_enabled) {
                this.update = this.refresh = this.kill = ScrollTrigger_passThrough;
                return;
            }
            vars = ScrollTrigger_setDefaults(ScrollTrigger_isString(vars) || ScrollTrigger_isNumber(vars) || vars.nodeType ? {
                trigger: vars
            } : vars, ScrollTrigger_defaults);
            var tweenTo, pinCache, snapFunc, scroll1, scroll2, start, end, markerStart, markerEnd, markerStartTrigger, markerEndTrigger, markerVars, change, pinOriginalState, pinActiveState, pinState, spacer, offset, pinGetter, pinSetter, pinStart, pinChange, spacingStart, spacerState, markerStartSetter, pinMoves, markerEndSetter, cs, snap1, snap2, scrubTween, scrubSmooth, snapDurClamp, snapDelayedCall, prevProgress, prevScroll, prevAnimProgress, caMarkerSetter, customRevertReturn, _vars = vars, onUpdate = _vars.onUpdate, toggleClass = _vars.toggleClass, id = _vars.id, onToggle = _vars.onToggle, onRefresh = _vars.onRefresh, scrub = _vars.scrub, trigger = _vars.trigger, pin = _vars.pin, pinSpacing = _vars.pinSpacing, invalidateOnRefresh = _vars.invalidateOnRefresh, anticipatePin = _vars.anticipatePin, onScrubComplete = _vars.onScrubComplete, onSnapComplete = _vars.onSnapComplete, once = _vars.once, snap = _vars.snap, pinReparent = _vars.pinReparent, pinSpacer = _vars.pinSpacer, containerAnimation = _vars.containerAnimation, fastScrollEnd = _vars.fastScrollEnd, preventOverlaps = _vars.preventOverlaps, direction = vars.horizontal || vars.containerAnimation && false !== vars.horizontal ? _horizontal : _vertical, isToggle = !scrub && 0 !== scrub, scroller = _getTarget(vars.scroller || ScrollTrigger_win), scrollerCache = ScrollTrigger_gsap.core.getCache(scroller), isViewport = ScrollTrigger_isViewport(scroller), useFixedPosition = "fixed" === ("pinType" in vars ? vars.pinType : _getProxyProp(scroller, "pinType") || isViewport && "fixed"), callbacks = [ vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack ], toggleActions = isToggle && vars.toggleActions.split(" "), markers = "markers" in vars ? vars.markers : ScrollTrigger_defaults.markers, borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0, self = this, onRefreshInit = vars.onRefreshInit && function() {
                return vars.onRefreshInit(self);
            }, getScrollerSize = _getSizeFunc(scroller, isViewport, direction), getScrollerOffsets = _getOffsetsFunc(scroller, isViewport), lastSnap = 0, lastRefresh = 0, scrollFunc = _getScrollFunc(scroller, direction);
            ScrollTrigger_context(self);
            self._dir = direction;
            anticipatePin *= 45;
            self.scroller = scroller;
            self.scroll = containerAnimation ? containerAnimation.time.bind(containerAnimation) : scrollFunc;
            scroll1 = scrollFunc();
            self.vars = vars;
            animation = animation || vars.animation;
            if ("refreshPriority" in vars) {
                _sort = 1;
                -9999 === vars.refreshPriority && (_primary = self);
            }
            scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
                top: _getTweenCreator(scroller, _vertical),
                left: _getTweenCreator(scroller, _horizontal)
            };
            self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];
            self.scrubDuration = function(value) {
                scrubSmooth = ScrollTrigger_isNumber(value) && value;
                if (!scrubSmooth) {
                    scrubTween && scrubTween.progress(1).kill();
                    scrubTween = 0;
                } else scrubTween ? scrubTween.duration(value) : scrubTween = ScrollTrigger_gsap.to(animation, {
                    ease: "expo",
                    totalProgress: "+=0.001",
                    duration: scrubSmooth,
                    paused: true,
                    onComplete: function onComplete() {
                        return onScrubComplete && onScrubComplete(self);
                    }
                });
            };
            if (animation) {
                animation.vars.lazy = false;
                animation._initted || false !== animation.vars.immediateRender && false !== vars.immediateRender && animation.duration() && animation.render(0, true, true);
                self.animation = animation.pause();
                animation.scrollTrigger = self;
                self.scrubDuration(scrub);
                snap1 = 0;
                id || (id = animation.vars.id);
            }
            _triggers.push(self);
            if (snap) {
                if (!ScrollTrigger_isObject(snap) || snap.push) snap = {
                    snapTo: snap
                };
                "scrollBehavior" in ScrollTrigger_body.style && ScrollTrigger_gsap.set(isViewport ? [ ScrollTrigger_body, ScrollTrigger_docEl ] : scroller, {
                    scrollBehavior: "auto"
                });
                _scrollers.forEach((function(o) {
                    return ScrollTrigger_isFunction(o) && o.target === (isViewport ? ScrollTrigger_doc.scrollingElement || ScrollTrigger_docEl : scroller) && (o.smooth = false);
                }));
                snapFunc = ScrollTrigger_isFunction(snap.snapTo) ? snap.snapTo : "labels" === snap.snapTo ? _getClosestLabel(animation) : "labelsDirectional" === snap.snapTo ? _getLabelAtDirection(animation) : false !== snap.directional ? function(value, st) {
                    return _snapDirectional(snap.snapTo)(value, ScrollTrigger_getTime() - lastRefresh < 500 ? 0 : st.direction);
                } : ScrollTrigger_gsap.utils.snap(snap.snapTo);
                snapDurClamp = snap.duration || {
                    min: .1,
                    max: 2
                };
                snapDurClamp = ScrollTrigger_isObject(snapDurClamp) ? ScrollTrigger_clamp(snapDurClamp.min, snapDurClamp.max) : ScrollTrigger_clamp(snapDurClamp, snapDurClamp);
                snapDelayedCall = ScrollTrigger_gsap.delayedCall(snap.delay || scrubSmooth / 2 || .1, (function() {
                    var scroll = scrollFunc(), refreshedRecently = ScrollTrigger_getTime() - lastRefresh < 500, tween = tweenTo.tween;
                    if ((refreshedRecently || Math.abs(self.getVelocity()) < 10) && !tween && !_pointerIsDown && lastSnap !== scroll) {
                        var progress = (scroll - start) / change, totalProgress = animation && !isToggle ? animation.totalProgress() : progress, velocity = refreshedRecently ? 0 : (totalProgress - snap2) / (ScrollTrigger_getTime() - _time2) * 1e3 || 0, change1 = ScrollTrigger_gsap.utils.clamp(-progress, 1 - progress, _abs(velocity / 2) * velocity / .185), naturalEnd = progress + (false === snap.inertia ? 0 : change1), endValue = ScrollTrigger_clamp(0, 1, snapFunc(naturalEnd, self)), endScroll = Math.round(start + endValue * change), _snap = snap, onStart = _snap.onStart, _onInterrupt = _snap.onInterrupt, _onComplete = _snap.onComplete;
                        if (scroll <= end && scroll >= start && endScroll !== scroll) {
                            if (tween && !tween._initted && tween.data <= _abs(endScroll - scroll)) return;
                            if (false === snap.inertia) change1 = endValue - progress;
                            tweenTo(endScroll, {
                                duration: snapDurClamp(_abs(.185 * Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) / velocity / .05 || 0)),
                                ease: snap.ease || "power3",
                                data: _abs(endScroll - scroll),
                                onInterrupt: function onInterrupt() {
                                    return snapDelayedCall.restart(true) && _onInterrupt && _onInterrupt(self);
                                },
                                onComplete: function onComplete() {
                                    self.update();
                                    lastSnap = scrollFunc();
                                    snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
                                    onSnapComplete && onSnapComplete(self);
                                    _onComplete && _onComplete(self);
                                }
                            }, scroll, change1 * change, endScroll - scroll - change1 * change);
                            onStart && onStart(self, tweenTo.tween);
                        }
                    } else if (self.isActive && lastSnap !== scroll) snapDelayedCall.restart(true);
                })).pause();
            }
            id && (_ids[id] = self);
            trigger = self.trigger = _getTarget(trigger || pin);
            customRevertReturn = trigger && trigger._gsap && trigger._gsap.stRevert;
            customRevertReturn && (customRevertReturn = customRevertReturn(self));
            pin = true === pin ? trigger : _getTarget(pin);
            ScrollTrigger_isString(toggleClass) && (toggleClass = {
                targets: trigger,
                className: toggleClass
            });
            if (pin) {
                false === pinSpacing || pinSpacing === _margin || (pinSpacing = !pinSpacing && pin.parentNode && pin.parentNode.style && "flex" === _getComputedStyle(pin.parentNode).display ? false : _padding);
                self.pin = pin;
                pinCache = ScrollTrigger_gsap.core.getCache(pin);
                if (!pinCache.spacer) {
                    if (pinSpacer) {
                        pinSpacer = _getTarget(pinSpacer);
                        pinSpacer && !pinSpacer.nodeType && (pinSpacer = pinSpacer.current || pinSpacer.nativeElement);
                        pinCache.spacerIsNative = !!pinSpacer;
                        pinSpacer && (pinCache.spacerState = _getState(pinSpacer));
                    }
                    pinCache.spacer = spacer = pinSpacer || ScrollTrigger_doc.createElement("div");
                    spacer.classList.add("pin-spacer");
                    id && spacer.classList.add("pin-spacer-" + id);
                    pinCache.pinState = pinOriginalState = _getState(pin);
                } else pinOriginalState = pinCache.pinState;
                false !== vars.force3D && ScrollTrigger_gsap.set(pin, {
                    force3D: true
                });
                self.spacer = spacer = pinCache.spacer;
                cs = _getComputedStyle(pin);
                spacingStart = cs[pinSpacing + direction.os2];
                pinGetter = ScrollTrigger_gsap.getProperty(pin);
                pinSetter = ScrollTrigger_gsap.quickSetter(pin, direction.a, _px);
                _swapPinIn(pin, spacer, cs);
                pinState = _getState(pin);
            }
            if (markers) {
                markerVars = ScrollTrigger_isObject(markers) ? ScrollTrigger_setDefaults(markers, _markerDefaults) : _markerDefaults;
                markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
                markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
                offset = markerStartTrigger["offset" + direction.op.d2];
                var content = _getTarget(_getProxyProp(scroller, "content") || scroller);
                markerStart = this.markerStart = _createMarker("start", id, content, direction, markerVars, offset, 0, containerAnimation);
                markerEnd = this.markerEnd = _createMarker("end", id, content, direction, markerVars, offset, 0, containerAnimation);
                containerAnimation && (caMarkerSetter = ScrollTrigger_gsap.quickSetter([ markerStart, markerEnd ], direction.a, _px));
                if (!useFixedPosition && !(_proxies.length && true === _getProxyProp(scroller, "fixedMarkers"))) {
                    _makePositionable(isViewport ? ScrollTrigger_body : scroller);
                    ScrollTrigger_gsap.set([ markerStartTrigger, markerEndTrigger ], {
                        force3D: true
                    });
                    markerStartSetter = ScrollTrigger_gsap.quickSetter(markerStartTrigger, direction.a, _px);
                    markerEndSetter = ScrollTrigger_gsap.quickSetter(markerEndTrigger, direction.a, _px);
                }
            }
            if (containerAnimation) {
                var oldOnUpdate = containerAnimation.vars.onUpdate, oldParams = containerAnimation.vars.onUpdateParams;
                containerAnimation.eventCallback("onUpdate", (function() {
                    self.update(0, 0, 1);
                    oldOnUpdate && oldOnUpdate.apply(oldParams || []);
                }));
            }
            self.previous = function() {
                return _triggers[_triggers.indexOf(self) - 1];
            };
            self.next = function() {
                return _triggers[_triggers.indexOf(self) + 1];
            };
            self.revert = function(revert, temp) {
                if (!temp) return self.kill(true);
                var r = false !== revert || !self.enabled, prevRefreshing = _refreshing;
                if (r !== self.isReverted) {
                    if (r) {
                        prevScroll = Math.max(scrollFunc(), self.scroll.rec || 0);
                        prevProgress = self.progress;
                        prevAnimProgress = animation && animation.progress();
                    }
                    markerStart && [ markerStart, markerEnd, markerStartTrigger, markerEndTrigger ].forEach((function(m) {
                        return m.style.display = r ? "none" : "block";
                    }));
                    if (r) {
                        _refreshing = 1;
                        self.update(r);
                    }
                    if (pin && (!pinReparent || !self.isActive)) if (r) _swapPinOut(pin, spacer, pinOriginalState); else _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState);
                    r || self.update(r);
                    _refreshing = prevRefreshing;
                    self.isReverted = r;
                }
            };
            self.refresh = function(soft, force) {
                if ((_refreshing || !self.enabled) && !force) return;
                if (pin && soft && _lastScrollTime) {
                    ScrollTrigger_addListener(ScrollTrigger, "scrollEnd", _softRefresh);
                    return;
                }
                !_refreshingAll && onRefreshInit && onRefreshInit(self);
                _refreshing = 1;
                lastRefresh = ScrollTrigger_getTime();
                if (tweenTo.tween) {
                    tweenTo.tween.kill();
                    tweenTo.tween = 0;
                }
                scrubTween && scrubTween.pause();
                invalidateOnRefresh && animation && animation.revert({
                    kill: false
                }).invalidate();
                self.isReverted || self.revert(true, true);
                self._subPinOffset = false;
                var cs, bounds, scroll, isVertical, override, curTrigger, curPin, oppositeScroll, initted, revertedPins, forcedOverflow, size = getScrollerSize(), scrollerBounds = getScrollerOffsets(), max = containerAnimation ? containerAnimation.duration() : _maxScroll(scroller, direction), offset = 0, otherPinOffset = 0, parsedEnd = vars.end, parsedEndTrigger = vars.endTrigger || trigger, parsedStart = vars.start || (0 === vars.start || !trigger ? 0 : pin ? "0 0" : "0 100%"), pinnedContainer = self.pinnedContainer = vars.pinnedContainer && _getTarget(vars.pinnedContainer), triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0, i = triggerIndex;
                while (i--) {
                    curTrigger = _triggers[i];
                    curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = 1);
                    curPin = curTrigger.pin;
                    if (curPin && (curPin === trigger || curPin === pin) && !curTrigger.isReverted) {
                        revertedPins || (revertedPins = []);
                        revertedPins.unshift(curTrigger);
                        curTrigger.revert(true, true);
                    }
                    if (curTrigger !== _triggers[i]) {
                        triggerIndex--;
                        i--;
                    }
                }
                ScrollTrigger_isFunction(parsedStart) && (parsedStart = parsedStart(self));
                start = ScrollTrigger_parsePosition(parsedStart, trigger, size, direction, scrollFunc(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation) || (pin ? -.001 : 0);
                ScrollTrigger_isFunction(parsedEnd) && (parsedEnd = parsedEnd(self));
                if (ScrollTrigger_isString(parsedEnd) && !parsedEnd.indexOf("+=")) if (~parsedEnd.indexOf(" ")) parsedEnd = (ScrollTrigger_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd; else {
                    offset = _offsetToPx(parsedEnd.substr(2), size);
                    parsedEnd = ScrollTrigger_isString(parsedStart) ? parsedStart : start + offset;
                    parsedEndTrigger = trigger;
                }
                end = Math.max(start, ScrollTrigger_parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, scrollFunc() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation)) || -.001;
                change = end - start || (start -= .01) && .001;
                offset = 0;
                i = triggerIndex;
                while (i--) {
                    curTrigger = _triggers[i];
                    curPin = curTrigger.pin;
                    if (curPin && curTrigger.start - curTrigger._pinPush <= start && !containerAnimation && curTrigger.end > 0) {
                        cs = curTrigger.end - curTrigger.start;
                        if ((curPin === trigger && curTrigger.start - curTrigger._pinPush < start || curPin === pinnedContainer) && !ScrollTrigger_isNumber(parsedStart)) offset += cs * (1 - curTrigger.progress);
                        curPin === pin && (otherPinOffset += cs);
                    }
                }
                start += offset;
                end += offset;
                self._pinPush = otherPinOffset;
                if (markerStart && offset) {
                    cs = {};
                    cs[direction.a] = "+=" + offset;
                    pinnedContainer && (cs[direction.p] = "-=" + scrollFunc());
                    ScrollTrigger_gsap.set([ markerStart, markerEnd ], cs);
                }
                if (pin) {
                    cs = _getComputedStyle(pin);
                    isVertical = direction === _vertical;
                    scroll = scrollFunc();
                    pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
                    if (!max && end > 1) {
                        forcedOverflow = (isViewport ? ScrollTrigger_doc.scrollingElement || ScrollTrigger_docEl : scroller).style;
                        forcedOverflow = {
                            style: forcedOverflow,
                            value: forcedOverflow["overflow" + direction.a.toUpperCase()]
                        };
                        forcedOverflow["overflow" + direction.a.toUpperCase()] = "scroll";
                    }
                    _swapPinIn(pin, spacer, cs);
                    pinState = _getState(pin);
                    bounds = _getBounds(pin, true);
                    oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();
                    if (pinSpacing) {
                        spacerState = [ pinSpacing + direction.os2, change + otherPinOffset + _px ];
                        spacerState.t = spacer;
                        i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
                        i && spacerState.push(direction.d, i + _px);
                        _setState(spacerState);
                        if (pinnedContainer) _triggers.forEach((function(t) {
                            if (t.pin === pinnedContainer && false !== t.vars.pinSpacing) t._subPinOffset = true;
                        }));
                        useFixedPosition && scrollFunc(prevScroll);
                    }
                    if (useFixedPosition) {
                        override = {
                            top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
                            left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
                            boxSizing: "border-box",
                            position: "fixed"
                        };
                        override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
                        override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
                        override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
                        override[_padding] = cs[_padding];
                        override[_padding + _Top] = cs[_padding + _Top];
                        override[_padding + _Right] = cs[_padding + _Right];
                        override[_padding + _Bottom] = cs[_padding + _Bottom];
                        override[_padding + _Left] = cs[_padding + _Left];
                        pinActiveState = _copyState(pinOriginalState, override, pinReparent);
                        _refreshingAll && scrollFunc(0);
                    }
                    if (animation) {
                        initted = animation._initted;
                        ScrollTrigger_suppressOverwrites(1);
                        animation.render(animation.duration(), true, true);
                        pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
                        pinMoves = Math.abs(change - pinChange) > 1;
                        useFixedPosition && pinMoves && pinActiveState.splice(pinActiveState.length - 2, 2);
                        animation.render(0, true, true);
                        initted || animation.invalidate(true);
                        animation.parent || animation.totalTime(animation.totalTime());
                        ScrollTrigger_suppressOverwrites(0);
                    } else pinChange = change;
                    forcedOverflow && (forcedOverflow.value ? forcedOverflow.style["overflow" + direction.a.toUpperCase()] = forcedOverflow.value : forcedOverflow.style.removeProperty("overflow-" + direction.a));
                } else if (trigger && scrollFunc() && !containerAnimation) {
                    bounds = trigger.parentNode;
                    while (bounds && bounds !== ScrollTrigger_body) {
                        if (bounds._pinOffset) {
                            start -= bounds._pinOffset;
                            end -= bounds._pinOffset;
                        }
                        bounds = bounds.parentNode;
                    }
                }
                revertedPins && revertedPins.forEach((function(t) {
                    return t.revert(false, true);
                }));
                self.start = start;
                self.end = end;
                scroll1 = scroll2 = _refreshingAll ? prevScroll : scrollFunc();
                if (!containerAnimation && !_refreshingAll) {
                    scroll1 < prevScroll && scrollFunc(prevScroll);
                    self.scroll.rec = 0;
                }
                self.revert(false, true);
                if (snapDelayedCall) {
                    lastSnap = -1;
                    self.isActive && scrollFunc(start + change * prevProgress);
                    snapDelayedCall.restart(true);
                }
                _refreshing = 0;
                animation && isToggle && (animation._initted || prevAnimProgress) && animation.progress() !== prevAnimProgress && animation.progress(prevAnimProgress, true).render(animation.time(), true, true);
                if (prevProgress !== self.progress || containerAnimation) {
                    animation && !isToggle && animation.totalProgress(prevProgress, true);
                    self.progress = (scroll1 - start) / change === prevProgress ? 0 : prevProgress;
                }
                pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange));
                onRefresh && !_refreshingAll && onRefresh(self);
            };
            self.getVelocity = function() {
                return (scrollFunc() - scroll2) / (ScrollTrigger_getTime() - _time2) * 1e3 || 0;
            };
            self.endAnimation = function() {
                _endAnimation(self.callbackAnimation);
                if (animation) scrubTween ? scrubTween.progress(1) : !animation.paused() ? _endAnimation(animation, animation.reversed()) : isToggle || _endAnimation(animation, self.direction < 0, 1);
            };
            self.labelToScroll = function(label) {
                return animation && animation.labels && (start || self.refresh() || start) + animation.labels[label] / animation.duration() * change || 0;
            };
            self.getTrailing = function(name) {
                var i = _triggers.indexOf(self), a = self.direction > 0 ? _triggers.slice(0, i).reverse() : _triggers.slice(i + 1);
                return (ScrollTrigger_isString(name) ? a.filter((function(t) {
                    return t.vars.preventOverlaps === name;
                })) : a).filter((function(t) {
                    return self.direction > 0 ? t.end <= start : t.start >= end;
                }));
            };
            self.update = function(reset, recordVelocity, forceFake) {
                if (containerAnimation && !forceFake && !reset) return;
                var isActive, wasActive, toggleState, action, stateChanged, toggled, isAtMax, isTakingAction, scroll = _refreshingAll ? prevScroll : self.scroll(), p = reset ? 0 : (scroll - start) / change, clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0, prevProgress = self.progress;
                if (recordVelocity) {
                    scroll2 = scroll1;
                    scroll1 = containerAnimation ? scrollFunc() : scroll;
                    if (snap) {
                        snap2 = snap1;
                        snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
                    }
                }
                anticipatePin && !clipped && pin && !_refreshing && !ScrollTrigger_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (ScrollTrigger_getTime() - _time2) * anticipatePin && (clipped = 1e-4);
                if (clipped !== prevProgress && self.enabled) {
                    isActive = self.isActive = !!clipped && clipped < 1;
                    wasActive = !!prevProgress && prevProgress < 1;
                    toggled = isActive !== wasActive;
                    stateChanged = toggled || !!clipped !== !!prevProgress;
                    self.direction = clipped > prevProgress ? 1 : -1;
                    self.progress = clipped;
                    if (stateChanged && !_refreshing) {
                        toggleState = clipped && !prevProgress ? 0 : 1 === clipped ? 1 : 1 === prevProgress ? 2 : 3;
                        if (isToggle) {
                            action = !toggled && "none" !== toggleActions[toggleState + 1] && toggleActions[toggleState + 1] || toggleActions[toggleState];
                            isTakingAction = animation && ("complete" === action || "reset" === action || action in animation);
                        }
                    }
                    preventOverlaps && (toggled || isTakingAction) && (isTakingAction || scrub || !animation) && (ScrollTrigger_isFunction(preventOverlaps) ? preventOverlaps(self) : self.getTrailing(preventOverlaps).forEach((function(t) {
                        return t.endAnimation();
                    })));
                    if (!isToggle) if (scrubTween && !_refreshing && !ScrollTrigger_startup) {
                        scrubTween._dp._time - scrubTween._start !== scrubTween._time && scrubTween.render(scrubTween._dp._time - scrubTween._start);
                        if (scrubTween.resetTo) scrubTween.resetTo("totalProgress", clipped, animation._tTime / animation._tDur); else {
                            scrubTween.vars.totalProgress = clipped;
                            scrubTween.invalidate().restart();
                        }
                    } else if (animation) animation.totalProgress(clipped, !!_refreshing);
                    if (pin) {
                        reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);
                        if (!useFixedPosition) pinSetter(ScrollTrigger_round(pinStart + pinChange * clipped)); else if (stateChanged) {
                            isAtMax = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction);
                            if (pinReparent) if (!reset && (isActive || isAtMax)) {
                                var bounds = _getBounds(pin, true), _offset = scroll - start;
                                _reparent(pin, ScrollTrigger_body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
                            } else _reparent(pin, spacer);
                            _setState(isActive || isAtMax ? pinActiveState : pinState);
                            pinMoves && clipped < 1 && isActive || pinSetter(pinStart + (1 === clipped && !isAtMax ? pinChange : 0));
                        }
                    }
                    snap && !tweenTo.tween && !_refreshing && !ScrollTrigger_startup && snapDelayedCall.restart(true);
                    toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach((function(el) {
                        return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
                    }));
                    onUpdate && !isToggle && !reset && onUpdate(self);
                    if (stateChanged && !_refreshing) {
                        if (isToggle) {
                            if (isTakingAction) if ("complete" === action) animation.pause().totalProgress(1); else if ("reset" === action) animation.restart(true).pause(); else if ("restart" === action) animation.restart(true); else animation[action]();
                            onUpdate && onUpdate(self);
                        }
                        if (toggled || !_limitCallbacks) {
                            onToggle && toggled && ScrollTrigger_callback(self, onToggle);
                            callbacks[toggleState] && ScrollTrigger_callback(self, callbacks[toggleState]);
                            once && (1 === clipped ? self.kill(false, 1) : callbacks[toggleState] = 0);
                            if (!toggled) {
                                toggleState = 1 === clipped ? 1 : 3;
                                callbacks[toggleState] && ScrollTrigger_callback(self, callbacks[toggleState]);
                            }
                        }
                        if (fastScrollEnd && !isActive && Math.abs(self.getVelocity()) > (ScrollTrigger_isNumber(fastScrollEnd) ? fastScrollEnd : 2500)) {
                            _endAnimation(self.callbackAnimation);
                            scrubTween ? scrubTween.progress(1) : _endAnimation(animation, "reverse" === action ? 1 : !clipped, 1);
                        }
                    } else if (isToggle && onUpdate && !_refreshing) onUpdate(self);
                }
                if (markerEndSetter) {
                    var n = containerAnimation ? scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0) : scroll;
                    markerStartSetter(n + (markerStartTrigger._isFlipped ? 1 : 0));
                    markerEndSetter(n);
                }
                caMarkerSetter && caMarkerSetter(-scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0));
            };
            self.enable = function(reset, refresh) {
                if (!self.enabled) {
                    self.enabled = true;
                    ScrollTrigger_addListener(scroller, "resize", _onResize);
                    ScrollTrigger_addListener(isViewport ? ScrollTrigger_doc : scroller, "scroll", ScrollTrigger_onScroll);
                    onRefreshInit && ScrollTrigger_addListener(ScrollTrigger, "refreshInit", onRefreshInit);
                    if (false !== reset) {
                        self.progress = prevProgress = 0;
                        scroll1 = scroll2 = lastSnap = scrollFunc();
                    }
                    false !== refresh && self.refresh();
                }
            };
            self.getTween = function(snap) {
                return snap && tweenTo ? tweenTo.tween : scrubTween;
            };
            self.setPositions = function(newStart, newEnd) {
                if (pin) {
                    pinStart += newStart - start;
                    pinChange += newEnd - newStart - change;
                    pinSpacing === _padding && self.adjustPinSpacing(newEnd - newStart - change);
                }
                self.start = start = newStart;
                self.end = end = newEnd;
                change = newEnd - newStart;
                self.update();
            };
            self.adjustPinSpacing = function(amount) {
                if (spacerState) {
                    var i = spacerState.indexOf(direction.d) + 1;
                    spacerState[i] = parseFloat(spacerState[i]) + amount + _px;
                    spacerState[1] = parseFloat(spacerState[1]) + amount + _px;
                    _setState(spacerState);
                }
            };
            self.disable = function(reset, allowAnimation) {
                if (self.enabled) {
                    false !== reset && self.revert(true, true);
                    self.enabled = self.isActive = false;
                    allowAnimation || scrubTween && scrubTween.pause();
                    prevScroll = 0;
                    pinCache && (pinCache.uncache = 1);
                    onRefreshInit && ScrollTrigger_removeListener(ScrollTrigger, "refreshInit", onRefreshInit);
                    if (snapDelayedCall) {
                        snapDelayedCall.pause();
                        tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
                    }
                    if (!isViewport) {
                        var i = _triggers.length;
                        while (i--) if (_triggers[i].scroller === scroller && _triggers[i] !== self) return;
                        ScrollTrigger_removeListener(scroller, "resize", _onResize);
                        ScrollTrigger_removeListener(scroller, "scroll", ScrollTrigger_onScroll);
                    }
                }
            };
            self.kill = function(revert, allowAnimation) {
                self.disable(revert, allowAnimation);
                scrubTween && !allowAnimation && scrubTween.kill();
                id && delete _ids[id];
                var i = _triggers.indexOf(self);
                i >= 0 && _triggers.splice(i, 1);
                i === _i && _direction > 0 && _i--;
                i = 0;
                _triggers.forEach((function(t) {
                    return t.scroller === self.scroller && (i = 1);
                }));
                i || _refreshingAll || (self.scroll.rec = 0);
                if (animation) {
                    animation.scrollTrigger = null;
                    revert && animation.revert({
                        kill: false
                    });
                    allowAnimation || animation.kill();
                }
                markerStart && [ markerStart, markerEnd, markerStartTrigger, markerEndTrigger ].forEach((function(m) {
                    return m.parentNode && m.parentNode.removeChild(m);
                }));
                _primary === self && (_primary = 0);
                if (pin) {
                    pinCache && (pinCache.uncache = 1);
                    i = 0;
                    _triggers.forEach((function(t) {
                        return t.pin === pin && i++;
                    }));
                    i || (pinCache.spacer = 0);
                }
                vars.onKill && vars.onKill(self);
            };
            self.enable(false, false);
            customRevertReturn && customRevertReturn(self);
            !animation || !animation.add || change ? self.refresh() : ScrollTrigger_gsap.delayedCall(.01, (function() {
                return start || end || self.refresh();
            })) && (change = .01) && (start = end = 0);
            pin && _queueRefreshAll();
        };
        ScrollTrigger.register = function register(core) {
            if (!ScrollTrigger_coreInitted) {
                ScrollTrigger_gsap = core || ScrollTrigger_getGSAP();
                ScrollTrigger_windowExists() && window.document && ScrollTrigger.enable();
                ScrollTrigger_coreInitted = _enabled;
            }
            return ScrollTrigger_coreInitted;
        };
        ScrollTrigger.defaults = function defaults(config) {
            if (config) for (var p in config) ScrollTrigger_defaults[p] = config[p];
            return ScrollTrigger_defaults;
        };
        ScrollTrigger.disable = function disable(reset, kill) {
            _enabled = 0;
            _triggers.forEach((function(trigger) {
                return trigger[kill ? "kill" : "disable"](reset);
            }));
            ScrollTrigger_removeListener(ScrollTrigger_win, "wheel", ScrollTrigger_onScroll);
            ScrollTrigger_removeListener(ScrollTrigger_doc, "scroll", ScrollTrigger_onScroll);
            clearInterval(_syncInterval);
            ScrollTrigger_removeListener(ScrollTrigger_doc, "touchcancel", ScrollTrigger_passThrough);
            ScrollTrigger_removeListener(ScrollTrigger_body, "touchstart", ScrollTrigger_passThrough);
            _multiListener(ScrollTrigger_removeListener, ScrollTrigger_doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
            _multiListener(ScrollTrigger_removeListener, ScrollTrigger_doc, "pointerup,touchend,mouseup", _pointerUpHandler);
            _resizeDelay.kill();
            _iterateAutoRefresh(ScrollTrigger_removeListener);
            for (var i = 0; i < _scrollers.length; i += 3) {
                _wheelListener(ScrollTrigger_removeListener, _scrollers[i], _scrollers[i + 1]);
                _wheelListener(ScrollTrigger_removeListener, _scrollers[i], _scrollers[i + 2]);
            }
        };
        ScrollTrigger.enable = function enable() {
            ScrollTrigger_win = window;
            ScrollTrigger_doc = document;
            ScrollTrigger_docEl = ScrollTrigger_doc.documentElement;
            ScrollTrigger_body = ScrollTrigger_doc.body;
            if (ScrollTrigger_gsap) {
                _toArray = ScrollTrigger_gsap.utils.toArray;
                ScrollTrigger_clamp = ScrollTrigger_gsap.utils.clamp;
                ScrollTrigger_context = ScrollTrigger_gsap.core.context || ScrollTrigger_passThrough;
                ScrollTrigger_suppressOverwrites = ScrollTrigger_gsap.core.suppressOverwrites || ScrollTrigger_passThrough;
                _scrollRestoration = ScrollTrigger_win.history.scrollRestoration || "auto";
                ScrollTrigger_gsap.core.globals("ScrollTrigger", ScrollTrigger);
                if (ScrollTrigger_body) {
                    _enabled = 1;
                    Observer.register(ScrollTrigger_gsap);
                    ScrollTrigger.isTouch = Observer.isTouch;
                    _fixIOSBug = Observer.isTouch && /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent);
                    ScrollTrigger_addListener(ScrollTrigger_win, "wheel", ScrollTrigger_onScroll);
                    ScrollTrigger_root = [ ScrollTrigger_win, ScrollTrigger_doc, ScrollTrigger_docEl, ScrollTrigger_body ];
                    if (ScrollTrigger_gsap.matchMedia) {
                        ScrollTrigger.matchMedia = function(vars) {
                            var p, mm = ScrollTrigger_gsap.matchMedia();
                            for (p in vars) mm.add(p, vars[p]);
                            return mm;
                        };
                        ScrollTrigger_gsap.addEventListener("matchMediaInit", (function() {
                            return _revertAll();
                        }));
                        ScrollTrigger_gsap.addEventListener("matchMediaRevert", (function() {
                            return _revertRecorded();
                        }));
                        ScrollTrigger_gsap.addEventListener("matchMedia", (function() {
                            _refreshAll(0, 1);
                            ScrollTrigger_dispatch("matchMedia");
                        }));
                        ScrollTrigger_gsap.matchMedia("(orientation: portrait)", (function() {
                            _setBaseDimensions();
                            return _setBaseDimensions;
                        }));
                    } else console.warn("Requires GSAP 3.11.0 or later");
                    _setBaseDimensions();
                    ScrollTrigger_addListener(ScrollTrigger_doc, "scroll", ScrollTrigger_onScroll);
                    var bounds, i, bodyStyle = ScrollTrigger_body.style, border = bodyStyle.borderTopStyle, AnimationProto = ScrollTrigger_gsap.core.Animation.prototype;
                    AnimationProto.revert || Object.defineProperty(AnimationProto, "revert", {
                        value: function value() {
                            return this.time(-.01, true);
                        }
                    });
                    bodyStyle.borderTopStyle = "solid";
                    bounds = _getBounds(ScrollTrigger_body);
                    _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0;
                    _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
                    border ? bodyStyle.borderTopStyle = border : bodyStyle.removeProperty("border-top-style");
                    _syncInterval = setInterval(_sync, 250);
                    ScrollTrigger_gsap.delayedCall(.5, (function() {
                        return ScrollTrigger_startup = 0;
                    }));
                    ScrollTrigger_addListener(ScrollTrigger_doc, "touchcancel", ScrollTrigger_passThrough);
                    ScrollTrigger_addListener(ScrollTrigger_body, "touchstart", ScrollTrigger_passThrough);
                    _multiListener(ScrollTrigger_addListener, ScrollTrigger_doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
                    _multiListener(ScrollTrigger_addListener, ScrollTrigger_doc, "pointerup,touchend,mouseup", _pointerUpHandler);
                    ScrollTrigger_transformProp = ScrollTrigger_gsap.utils.checkPrefix("transform");
                    _stateProps.push(ScrollTrigger_transformProp);
                    ScrollTrigger_coreInitted = ScrollTrigger_getTime();
                    _resizeDelay = ScrollTrigger_gsap.delayedCall(.2, _refreshAll).pause();
                    _autoRefresh = [ ScrollTrigger_doc, "visibilitychange", function() {
                        var w = ScrollTrigger_win.innerWidth, h = ScrollTrigger_win.innerHeight;
                        if (ScrollTrigger_doc.hidden) {
                            _prevWidth = w;
                            _prevHeight = h;
                        } else if (_prevWidth !== w || _prevHeight !== h) _onResize();
                    }, ScrollTrigger_doc, "DOMContentLoaded", _refreshAll, ScrollTrigger_win, "load", _refreshAll, ScrollTrigger_win, "resize", _onResize ];
                    _iterateAutoRefresh(ScrollTrigger_addListener);
                    _triggers.forEach((function(trigger) {
                        return trigger.enable(0, 1);
                    }));
                    for (i = 0; i < _scrollers.length; i += 3) {
                        _wheelListener(ScrollTrigger_removeListener, _scrollers[i], _scrollers[i + 1]);
                        _wheelListener(ScrollTrigger_removeListener, _scrollers[i], _scrollers[i + 2]);
                    }
                }
            }
        };
        ScrollTrigger.config = function config(vars) {
            "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
            var ms = vars.syncInterval;
            ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
            "ignoreMobileResize" in vars && (_ignoreMobileResize = 1 === ScrollTrigger.isTouch && vars.ignoreMobileResize);
            if ("autoRefreshEvents" in vars) {
                _iterateAutoRefresh(ScrollTrigger_removeListener) || _iterateAutoRefresh(ScrollTrigger_addListener, vars.autoRefreshEvents || "none");
                _ignoreResize = -1 === (vars.autoRefreshEvents + "").indexOf("resize");
            }
        };
        ScrollTrigger.scrollerProxy = function scrollerProxy(target, vars) {
            var t = _getTarget(target), i = _scrollers.indexOf(t), isViewport = ScrollTrigger_isViewport(t);
            if (~i) _scrollers.splice(i, isViewport ? 6 : 2);
            if (vars) isViewport ? _proxies.unshift(ScrollTrigger_win, vars, ScrollTrigger_body, vars, ScrollTrigger_docEl, vars) : _proxies.unshift(t, vars);
        };
        ScrollTrigger.clearMatchMedia = function clearMatchMedia(query) {
            _triggers.forEach((function(t) {
                return t._ctx && t._ctx.query === query && t._ctx.kill(true, true);
            }));
        };
        ScrollTrigger.isInViewport = function isInViewport(element, ratio, horizontal) {
            var bounds = (ScrollTrigger_isString(element) ? _getTarget(element) : element).getBoundingClientRect(), offset = bounds[horizontal ? _width : _height] * ratio || 0;
            return horizontal ? bounds.right - offset > 0 && bounds.left + offset < ScrollTrigger_win.innerWidth : bounds.bottom - offset > 0 && bounds.top + offset < ScrollTrigger_win.innerHeight;
        };
        ScrollTrigger.positionInViewport = function positionInViewport(element, referencePoint, horizontal) {
            ScrollTrigger_isString(element) && (element = _getTarget(element));
            var bounds = element.getBoundingClientRect(), size = bounds[horizontal ? _width : _height], offset = null == referencePoint ? size / 2 : referencePoint in _keywords ? _keywords[referencePoint] * size : ~referencePoint.indexOf("%") ? parseFloat(referencePoint) * size / 100 : parseFloat(referencePoint) || 0;
            return horizontal ? (bounds.left + offset) / ScrollTrigger_win.innerWidth : (bounds.top + offset) / ScrollTrigger_win.innerHeight;
        };
        ScrollTrigger.killAll = function killAll(allowListeners) {
            _triggers.slice(0).forEach((function(t) {
                return "ScrollSmoother" !== t.vars.id && t.kill();
            }));
            if (true !== allowListeners) {
                var listeners = ScrollTrigger_listeners.killAll || [];
                ScrollTrigger_listeners = {};
                listeners.forEach((function(f) {
                    return f();
                }));
            }
        };
        return ScrollTrigger;
    }();
    ScrollTrigger_ScrollTrigger.version = "3.11.4";
    ScrollTrigger_ScrollTrigger.saveStyles = function(targets) {
        return targets ? _toArray(targets).forEach((function(target) {
            if (target && target.style) {
                var i = _savedStyles.indexOf(target);
                i >= 0 && _savedStyles.splice(i, 5);
                _savedStyles.push(target, target.style.cssText, target.getBBox && target.getAttribute("transform"), ScrollTrigger_gsap.core.getCache(target), ScrollTrigger_context());
            }
        })) : _savedStyles;
    };
    ScrollTrigger_ScrollTrigger.revert = function(soft, media) {
        return _revertAll(!soft, media);
    };
    ScrollTrigger_ScrollTrigger.create = function(vars, animation) {
        return new ScrollTrigger_ScrollTrigger(vars, animation);
    };
    ScrollTrigger_ScrollTrigger.refresh = function(safe) {
        return safe ? _onResize() : (ScrollTrigger_coreInitted || ScrollTrigger_ScrollTrigger.register()) && _refreshAll(true);
    };
    ScrollTrigger_ScrollTrigger.update = function(force) {
        return ++_scrollers.cache && _updateAll(true === force ? 2 : 0);
    };
    ScrollTrigger_ScrollTrigger.clearScrollMemory = _clearScrollMemory;
    ScrollTrigger_ScrollTrigger.maxScroll = function(element, horizontal) {
        return _maxScroll(element, horizontal ? _horizontal : _vertical);
    };
    ScrollTrigger_ScrollTrigger.getScrollFunc = function(element, horizontal) {
        return _getScrollFunc(_getTarget(element), horizontal ? _horizontal : _vertical);
    };
    ScrollTrigger_ScrollTrigger.getById = function(id) {
        return _ids[id];
    };
    ScrollTrigger_ScrollTrigger.getAll = function() {
        return _triggers.filter((function(t) {
            return "ScrollSmoother" !== t.vars.id;
        }));
    };
    ScrollTrigger_ScrollTrigger.isScrolling = function() {
        return !!_lastScrollTime;
    };
    ScrollTrigger_ScrollTrigger.snapDirectional = _snapDirectional;
    ScrollTrigger_ScrollTrigger.addEventListener = function(type, callback) {
        var a = ScrollTrigger_listeners[type] || (ScrollTrigger_listeners[type] = []);
        ~a.indexOf(callback) || a.push(callback);
    };
    ScrollTrigger_ScrollTrigger.removeEventListener = function(type, callback) {
        var a = ScrollTrigger_listeners[type], i = a && a.indexOf(callback);
        i >= 0 && a.splice(i, 1);
    };
    ScrollTrigger_ScrollTrigger.batch = function(targets, vars) {
        var p, result = [], varsCopy = {}, interval = vars.interval || .016, batchMax = vars.batchMax || 1e9, proxyCallback = function proxyCallback(type, callback) {
            var elements = [], triggers = [], delay = ScrollTrigger_gsap.delayedCall(interval, (function() {
                callback(elements, triggers);
                elements = [];
                triggers = [];
            })).pause();
            return function(self) {
                elements.length || delay.restart(true);
                elements.push(self.trigger);
                triggers.push(self);
                batchMax <= elements.length && delay.progress(1);
            };
        };
        for (p in vars) varsCopy[p] = "on" === p.substr(0, 2) && ScrollTrigger_isFunction(vars[p]) && "onRefreshInit" !== p ? proxyCallback(p, vars[p]) : vars[p];
        if (ScrollTrigger_isFunction(batchMax)) {
            batchMax = batchMax();
            ScrollTrigger_addListener(ScrollTrigger_ScrollTrigger, "refresh", (function() {
                return batchMax = vars.batchMax();
            }));
        }
        _toArray(targets).forEach((function(target) {
            var config = {};
            for (p in varsCopy) config[p] = varsCopy[p];
            config.trigger = target;
            result.push(ScrollTrigger_ScrollTrigger.create(config));
        }));
        return result;
    };
    var _inputIsFocused, _clampScrollAndGetDurationMultiplier = function _clampScrollAndGetDurationMultiplier(scrollFunc, current, end, max) {
        current > max ? scrollFunc(max) : current < 0 && scrollFunc(0);
        return end > max ? (max - current) / (end - current) : end < 0 ? current / (current - end) : 1;
    }, _allowNativePanning = function _allowNativePanning(target, direction) {
        if (true === direction) target.style.removeProperty("touch-action"); else target.style.touchAction = true === direction ? "auto" : direction ? "pan-" + direction + (Observer.isTouch ? " pinch-zoom" : "") : "none";
        target === ScrollTrigger_docEl && _allowNativePanning(ScrollTrigger_body, direction);
    }, _overflow = {
        auto: 1,
        scroll: 1
    }, _nestedScroll = function _nestedScroll(_ref5) {
        var event = _ref5.event, target = _ref5.target, axis = _ref5.axis;
        var cs, node = (event.changedTouches ? event.changedTouches[0] : event).target, cache = node._gsap || ScrollTrigger_gsap.core.getCache(node), time = ScrollTrigger_getTime();
        if (!cache._isScrollT || time - cache._isScrollT > 2e3) {
            while (node && node !== ScrollTrigger_body && (node.scrollHeight <= node.clientHeight && node.scrollWidth <= node.clientWidth || !(_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]))) node = node.parentNode;
            cache._isScroll = node && node !== target && !ScrollTrigger_isViewport(node) && (_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]);
            cache._isScrollT = time;
        }
        if (cache._isScroll || "x" === axis) {
            event.stopPropagation();
            event._gsapAllow = true;
        }
    }, _inputObserver = function _inputObserver(target, type, inputs, nested) {
        return Observer.create({
            target,
            capture: true,
            debounce: false,
            lockAxis: true,
            type,
            onWheel: nested = nested && _nestedScroll,
            onPress: nested,
            onDrag: nested,
            onScroll: nested,
            onEnable: function onEnable() {
                return inputs && ScrollTrigger_addListener(ScrollTrigger_doc, Observer.eventTypes[0], _captureInputs, false, true);
            },
            onDisable: function onDisable() {
                return ScrollTrigger_removeListener(ScrollTrigger_doc, Observer.eventTypes[0], _captureInputs, true);
            }
        });
    }, _inputExp = /(input|label|select|textarea)/i, _captureInputs = function _captureInputs(e) {
        var isInput = _inputExp.test(e.target.tagName);
        if (isInput || _inputIsFocused) {
            e._gsapAllow = true;
            _inputIsFocused = isInput;
        }
    }, _getScrollNormalizer = function _getScrollNormalizer(vars) {
        ScrollTrigger_isObject(vars) || (vars = {});
        vars.preventDefault = vars.isNormalizer = vars.allowClicks = true;
        vars.type || (vars.type = "wheel,touch");
        vars.debounce = !!vars.debounce;
        vars.id = vars.id || "normalizer";
        var self, maxY, lastRefreshID, skipTouchMove, tween, startScrollX, startScrollY, onStopDelayedCall, _vars2 = vars, normalizeScrollX = _vars2.normalizeScrollX, momentum = _vars2.momentum, allowNestedScroll = _vars2.allowNestedScroll, target = _getTarget(vars.target) || ScrollTrigger_docEl, smoother = ScrollTrigger_gsap.core.globals().ScrollSmoother, smootherInstance = smoother && smoother.get(), content = _fixIOSBug && (vars.content && _getTarget(vars.content) || smootherInstance && false !== vars.content && !smootherInstance.smooth() && smootherInstance.content()), scrollFuncY = _getScrollFunc(target, _vertical), scrollFuncX = _getScrollFunc(target, _horizontal), scale = 1, initialScale = (Observer.isTouch && ScrollTrigger_win.visualViewport ? ScrollTrigger_win.visualViewport.scale * ScrollTrigger_win.visualViewport.width : ScrollTrigger_win.outerWidth) / ScrollTrigger_win.innerWidth, wheelRefresh = 0, resolveMomentumDuration = ScrollTrigger_isFunction(momentum) ? function() {
            return momentum(self);
        } : function() {
            return momentum || 2.8;
        }, inputObserver = _inputObserver(target, vars.type, true, allowNestedScroll), resumeTouchMove = function resumeTouchMove() {
            return skipTouchMove = false;
        }, scrollClampX = ScrollTrigger_passThrough, scrollClampY = ScrollTrigger_passThrough, updateClamps = function updateClamps() {
            maxY = _maxScroll(target, _vertical);
            scrollClampY = ScrollTrigger_clamp(_fixIOSBug ? 1 : 0, maxY);
            normalizeScrollX && (scrollClampX = ScrollTrigger_clamp(0, _maxScroll(target, _horizontal)));
            lastRefreshID = _refreshID;
        }, removeContentOffset = function removeContentOffset() {
            content._gsap.y = ScrollTrigger_round(parseFloat(content._gsap.y) + scrollFuncY.offset) + "px";
            content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + parseFloat(content._gsap.y) + ", 0, 1)";
            scrollFuncY.offset = scrollFuncY.cacheID = 0;
        }, ignoreDrag = function ignoreDrag() {
            if (skipTouchMove) {
                requestAnimationFrame(resumeTouchMove);
                var offset = ScrollTrigger_round(self.deltaY / 2), scroll = scrollClampY(scrollFuncY.v - offset);
                if (content && scroll !== scrollFuncY.v + scrollFuncY.offset) {
                    scrollFuncY.offset = scroll - scrollFuncY.v;
                    var y = ScrollTrigger_round((parseFloat(content && content._gsap.y) || 0) - scrollFuncY.offset);
                    content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + y + ", 0, 1)";
                    content._gsap.y = y + "px";
                    scrollFuncY.cacheID = _scrollers.cache;
                    _updateAll();
                }
                return true;
            }
            scrollFuncY.offset && removeContentOffset();
            skipTouchMove = true;
        }, onResize = function onResize() {
            updateClamps();
            if (tween.isActive() && tween.vars.scrollY > maxY) scrollFuncY() > maxY ? tween.progress(1) && scrollFuncY(maxY) : tween.resetTo("scrollY", maxY);
        };
        content && ScrollTrigger_gsap.set(content, {
            y: "+=0"
        });
        vars.ignoreCheck = function(e) {
            return _fixIOSBug && "touchmove" === e.type && ignoreDrag(e) || scale > 1.05 && "touchstart" !== e.type || self.isGesturing || e.touches && e.touches.length > 1;
        };
        vars.onPress = function() {
            var prevScale = scale;
            scale = ScrollTrigger_round((ScrollTrigger_win.visualViewport && ScrollTrigger_win.visualViewport.scale || 1) / initialScale);
            tween.pause();
            prevScale !== scale && _allowNativePanning(target, scale > 1.01 ? true : normalizeScrollX ? false : "x");
            startScrollX = scrollFuncX();
            startScrollY = scrollFuncY();
            updateClamps();
            lastRefreshID = _refreshID;
        };
        vars.onRelease = vars.onGestureStart = function(self, wasDragging) {
            scrollFuncY.offset && removeContentOffset();
            if (!wasDragging) onStopDelayedCall.restart(true); else {
                _scrollers.cache++;
                var currentScroll, endScroll, dur = resolveMomentumDuration();
                if (normalizeScrollX) {
                    currentScroll = scrollFuncX();
                    endScroll = currentScroll + .05 * dur * -self.velocityX / .227;
                    dur *= _clampScrollAndGetDurationMultiplier(scrollFuncX, currentScroll, endScroll, _maxScroll(target, _horizontal));
                    tween.vars.scrollX = scrollClampX(endScroll);
                }
                currentScroll = scrollFuncY();
                endScroll = currentScroll + .05 * dur * -self.velocityY / .227;
                dur *= _clampScrollAndGetDurationMultiplier(scrollFuncY, currentScroll, endScroll, _maxScroll(target, _vertical));
                tween.vars.scrollY = scrollClampY(endScroll);
                tween.invalidate().duration(dur).play(.01);
                if (_fixIOSBug && tween.vars.scrollY >= maxY || currentScroll >= maxY - 1) ScrollTrigger_gsap.to({}, {
                    onUpdate: onResize,
                    duration: dur
                });
            }
        };
        vars.onWheel = function() {
            tween._ts && tween.pause();
            if (ScrollTrigger_getTime() - wheelRefresh > 1e3) {
                lastRefreshID = 0;
                wheelRefresh = ScrollTrigger_getTime();
            }
        };
        vars.onChange = function(self, dx, dy, xArray, yArray) {
            _refreshID !== lastRefreshID && updateClamps();
            dx && normalizeScrollX && scrollFuncX(scrollClampX(xArray[2] === dx ? startScrollX + (self.startX - self.x) : scrollFuncX() + dx - xArray[1]));
            if (dy) {
                scrollFuncY.offset && removeContentOffset();
                var isTouch = yArray[2] === dy, y = isTouch ? startScrollY + self.startY - self.y : scrollFuncY() + dy - yArray[1], yClamped = scrollClampY(y);
                isTouch && y !== yClamped && (startScrollY += yClamped - y);
                scrollFuncY(yClamped);
            }
            (dy || dx) && _updateAll();
        };
        vars.onEnable = function() {
            _allowNativePanning(target, normalizeScrollX ? false : "x");
            ScrollTrigger_ScrollTrigger.addEventListener("refresh", onResize);
            ScrollTrigger_addListener(ScrollTrigger_win, "resize", onResize);
            if (scrollFuncY.smooth) {
                scrollFuncY.target.style.scrollBehavior = "auto";
                scrollFuncY.smooth = scrollFuncX.smooth = false;
            }
            inputObserver.enable();
        };
        vars.onDisable = function() {
            _allowNativePanning(target, true);
            ScrollTrigger_removeListener(ScrollTrigger_win, "resize", onResize);
            ScrollTrigger_ScrollTrigger.removeEventListener("refresh", onResize);
            inputObserver.kill();
        };
        vars.lockAxis = false !== vars.lockAxis;
        self = new Observer(vars);
        self.iOS = _fixIOSBug;
        _fixIOSBug && !scrollFuncY() && scrollFuncY(1);
        _fixIOSBug && ScrollTrigger_gsap.ticker.add(ScrollTrigger_passThrough);
        onStopDelayedCall = self._dc;
        tween = ScrollTrigger_gsap.to(self, {
            ease: "power4",
            paused: true,
            scrollX: normalizeScrollX ? "+=0.1" : "+=0",
            scrollY: "+=0.1",
            onComplete: onStopDelayedCall.vars.onComplete
        });
        return self;
    };
    ScrollTrigger_ScrollTrigger.sort = function(func) {
        return _triggers.sort(func || function(a, b) {
            return -1e6 * (a.vars.refreshPriority || 0) + a.start - (b.start + -1e6 * (b.vars.refreshPriority || 0));
        });
    };
    ScrollTrigger_ScrollTrigger.observe = function(vars) {
        return new Observer(vars);
    };
    ScrollTrigger_ScrollTrigger.normalizeScroll = function(vars) {
        if ("undefined" === typeof vars) return ScrollTrigger_normalizer;
        if (true === vars && ScrollTrigger_normalizer) return ScrollTrigger_normalizer.enable();
        if (false === vars) return ScrollTrigger_normalizer && ScrollTrigger_normalizer.kill();
        var normalizer = vars instanceof Observer ? vars : _getScrollNormalizer(vars);
        ScrollTrigger_normalizer && ScrollTrigger_normalizer.target === normalizer.target && ScrollTrigger_normalizer.kill();
        ScrollTrigger_isViewport(normalizer.target) && (ScrollTrigger_normalizer = normalizer);
        return normalizer;
    };
    ScrollTrigger_ScrollTrigger.core = {
        _getVelocityProp,
        _inputObserver,
        _scrollers,
        _proxies,
        bridge: {
            ss: function ss() {
                _lastScrollTime || ScrollTrigger_dispatch("scrollStart");
                _lastScrollTime = ScrollTrigger_getTime();
            },
            ref: function ref() {
                return _refreshing;
            }
        }
    };
    ScrollTrigger_getGSAP() && ScrollTrigger_gsap.registerPlugin(ScrollTrigger_ScrollTrigger);
    gsapWithCSS.registerPlugin(ScrollTrigger_ScrollTrigger);
    let stepAnimation = () => {
        let tlStep = gsapWithCSS.timeline({
            defaults: {
                duration: 1
            },
            repeat: -1,
            repeatDelay: 1
        });
        const steps = document.querySelectorAll(".steps__item-icon");
        steps.forEach((step => {
            let stepTimeLine = gsapWithCSS.timeline({
                defaults: {
                    duration: 1
                },
                repeat: -1,
                repeatDelay: 4
            });
            stepTimeLine.to(step, {
                scale: 1.03,
                ease: "none"
            }).to(step, {
                scale: 1,
                ease: "none"
            });
        }));
        return tlStep;
    };
    stepAnimation();
    let packagesAnimation = () => {
        let tlPackage = gsapWithCSS.timeline({
            defaults: {
                duration: 1
            },
            repeat: -1,
            repeatDelay: 1
        });
        const packagesItem = document.querySelectorAll(".packages__item");
        let i = 0;
        packagesItem.forEach((itemPackag => {
            let itemPackagTimeLine = gsapWithCSS.timeline({
                defaults: {
                    duration: 1
                },
                repeat: -1,
                repeatDelay: 4
            });
            itemPackagTimeLine.to(itemPackag, {
                y: -15
            }).to(itemPackag, {
                y: 0,
                ease: "bounce.out"
            });
            tlPackage.add(itemPackagTimeLine, i > 0 ? "-=1.5" : "0");
            i++;
        }));
        return tlPackage;
    };
    var sa = packagesAnimation();
    const firstStep = document.querySelector(".packages__list");
    firstStep.addEventListener("mouseover", (() => {
        sa.pause();
    }));
    firstStep.addEventListener("mouseleave", (() => {
        sa.resume();
    }));
    let docP = gsapWithCSS.utils.toArray(".doc p");
    docP.forEach((item => {
        gsapWithCSS.fromTo(item, {
            opacity: 0,
            y: 50
        }, {
            opacity: 1,
            y: 0,
            scrollTrigger: {
                trigger: ".doc"
            },
            duration: 2
        });
    }));
    gsapWithCSS.fromTo(".doc img", {
        opacity: 0,
        x: -50
    }, {
        opacity: 1,
        x: 0,
        scrollTrigger: {
            trigger: ".doc"
        },
        duration: 1.8
    });
    !function(a) {
        "object" == typeof module && module.exports ? module.exports = a() : window.intlTelInput = a();
    }((function(a) {
        "use strict";
        return function() {
            function b(a, b) {
                if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
            }
            function c(a, b) {
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), 
                    Object.defineProperty(a, d.key, d);
                }
            }
            function d(a, b, d) {
                return b && c(a.prototype, b), d && c(a, d), a;
            }
            for (var e = [ [ "Afghanistan (‫افغانستان‬‎)", "af", "93" ], [ "Albania (Shqipëri)", "al", "355" ], [ "Algeria (‫الجزائر‬‎)", "dz", "213" ], [ "American Samoa", "as", "1", 5, [ "684" ] ], [ "Andorra", "ad", "376" ], [ "Angola", "ao", "244" ], [ "Anguilla", "ai", "1", 6, [ "264" ] ], [ "Antigua and Barbuda", "ag", "1", 7, [ "268" ] ], [ "Argentina", "ar", "54" ], [ "Armenia (Հայաստան)", "am", "374" ], [ "Aruba", "aw", "297" ], [ "Ascension Island", "ac", "247" ], [ "Australia", "au", "61", 0 ], [ "Austria (Österreich)", "at", "43" ], [ "Azerbaijan (Azərbaycan)", "az", "994" ], [ "Bahamas", "bs", "1", 8, [ "242" ] ], [ "Bahrain (‫البحرين‬‎)", "bh", "973" ], [ "Bangladesh (বাংলাদেশ)", "bd", "880" ], [ "Barbados", "bb", "1", 9, [ "246" ] ], [ "Belarus (Беларусь)", "by", "375" ], [ "Belgium (België)", "be", "32" ], [ "Belize", "bz", "501" ], [ "Benin (Bénin)", "bj", "229" ], [ "Bermuda", "bm", "1", 10, [ "441" ] ], [ "Bhutan (འབྲུག)", "bt", "975" ], [ "Bolivia", "bo", "591" ], [ "Bosnia and Herzegovina (Босна и Херцеговина)", "ba", "387" ], [ "Botswana", "bw", "267" ], [ "Brazil (Brasil)", "br", "55" ], [ "British Indian Ocean Territory", "io", "246" ], [ "British Virgin Islands", "vg", "1", 11, [ "284" ] ], [ "Brunei", "bn", "673" ], [ "Bulgaria (България)", "bg", "359" ], [ "Burkina Faso", "bf", "226" ], [ "Burundi (Uburundi)", "bi", "257" ], [ "Cambodia (កម្ពុជា)", "kh", "855" ], [ "Cameroon (Cameroun)", "cm", "237" ], [ "Canada", "ca", "1", 1, [ "204", "226", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905" ] ], [ "Cape Verde (Kabu Verdi)", "cv", "238" ], [ "Caribbean Netherlands", "bq", "599", 1, [ "3", "4", "7" ] ], [ "Cayman Islands", "ky", "1", 12, [ "345" ] ], [ "Central African Republic (République centrafricaine)", "cf", "236" ], [ "Chad (Tchad)", "td", "235" ], [ "Chile", "cl", "56" ], [ "China (中国)", "cn", "86" ], [ "Christmas Island", "cx", "61", 2, [ "89164" ] ], [ "Cocos (Keeling) Islands", "cc", "61", 1, [ "89162" ] ], [ "Colombia", "co", "57" ], [ "Comoros (‫جزر القمر‬‎)", "km", "269" ], [ "Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", "cd", "243" ], [ "Congo (Republic) (Congo-Brazzaville)", "cg", "242" ], [ "Cook Islands", "ck", "682" ], [ "Costa Rica", "cr", "506" ], [ "Côte d’Ivoire", "ci", "225" ], [ "Croatia (Hrvatska)", "hr", "385" ], [ "Cuba", "cu", "53" ], [ "Curaçao", "cw", "599", 0 ], [ "Cyprus (Κύπρος)", "cy", "357" ], [ "Czech Republic (Česká republika)", "cz", "420" ], [ "Denmark (Danmark)", "dk", "45" ], [ "Djibouti", "dj", "253" ], [ "Dominica", "dm", "1", 13, [ "767" ] ], [ "Dominican Republic (República Dominicana)", "do", "1", 2, [ "809", "829", "849" ] ], [ "Ecuador", "ec", "593" ], [ "Egypt (‫مصر‬‎)", "eg", "20" ], [ "El Salvador", "sv", "503" ], [ "Equatorial Guinea (Guinea Ecuatorial)", "gq", "240" ], [ "Eritrea", "er", "291" ], [ "Estonia (Eesti)", "ee", "372" ], [ "Eswatini", "sz", "268" ], [ "Ethiopia", "et", "251" ], [ "Falkland Islands (Islas Malvinas)", "fk", "500" ], [ "Faroe Islands (Føroyar)", "fo", "298" ], [ "Fiji", "fj", "679" ], [ "Finland (Suomi)", "fi", "358", 0 ], [ "France", "fr", "33" ], [ "French Guiana (Guyane française)", "gf", "594" ], [ "French Polynesia (Polynésie française)", "pf", "689" ], [ "Gabon", "ga", "241" ], [ "Gambia", "gm", "220" ], [ "Georgia (საქართველო)", "ge", "995" ], [ "Germany (Deutschland)", "de", "49" ], [ "Ghana (Gaana)", "gh", "233" ], [ "Gibraltar", "gi", "350" ], [ "Greece (Ελλάδα)", "gr", "30" ], [ "Greenland (Kalaallit Nunaat)", "gl", "299" ], [ "Grenada", "gd", "1", 14, [ "473" ] ], [ "Guadeloupe", "gp", "590", 0 ], [ "Guam", "gu", "1", 15, [ "671" ] ], [ "Guatemala", "gt", "502" ], [ "Guernsey", "gg", "44", 1, [ "1481", "7781", "7839", "7911" ] ], [ "Guinea (Guinée)", "gn", "224" ], [ "Guinea-Bissau (Guiné Bissau)", "gw", "245" ], [ "Guyana", "gy", "592" ], [ "Haiti", "ht", "509" ], [ "Honduras", "hn", "504" ], [ "Hong Kong (香港)", "hk", "852" ], [ "Hungary (Magyarország)", "hu", "36" ], [ "Iceland (Ísland)", "is", "354" ], [ "India (भारत)", "in", "91" ], [ "Indonesia", "id", "62" ], [ "Iran (‫ایران‬‎)", "ir", "98" ], [ "Iraq (‫العراق‬‎)", "iq", "964" ], [ "Ireland", "ie", "353" ], [ "Isle of Man", "im", "44", 2, [ "1624", "74576", "7524", "7924", "7624" ] ], [ "Israel (‫ישראל‬‎)", "il", "972" ], [ "Italy (Italia)", "it", "39", 0 ], [ "Jamaica", "jm", "1", 4, [ "876", "658" ] ], [ "Japan (日本)", "jp", "81" ], [ "Jersey", "je", "44", 3, [ "1534", "7509", "7700", "7797", "7829", "7937" ] ], [ "Jordan (‫الأردن‬‎)", "jo", "962" ], [ "Kazakhstan (Казахстан)", "kz", "7", 1, [ "33", "7" ] ], [ "Kenya", "ke", "254" ], [ "Kiribati", "ki", "686" ], [ "Kosovo", "xk", "383" ], [ "Kuwait (‫الكويت‬‎)", "kw", "965" ], [ "Kyrgyzstan (Кыргызстан)", "kg", "996" ], [ "Laos (ລາວ)", "la", "856" ], [ "Latvia (Latvija)", "lv", "371" ], [ "Lebanon (‫لبنان‬‎)", "lb", "961" ], [ "Lesotho", "ls", "266" ], [ "Liberia", "lr", "231" ], [ "Libya (‫ليبيا‬‎)", "ly", "218" ], [ "Liechtenstein", "li", "423" ], [ "Lithuania (Lietuva)", "lt", "370" ], [ "Luxembourg", "lu", "352" ], [ "Macau (澳門)", "mo", "853" ], [ "North Macedonia (Македонија)", "mk", "389" ], [ "Madagascar (Madagasikara)", "mg", "261" ], [ "Malawi", "mw", "265" ], [ "Malaysia", "my", "60" ], [ "Maldives", "mv", "960" ], [ "Mali", "ml", "223" ], [ "Malta", "mt", "356" ], [ "Marshall Islands", "mh", "692" ], [ "Martinique", "mq", "596" ], [ "Mauritania (‫موريتانيا‬‎)", "mr", "222" ], [ "Mauritius (Moris)", "mu", "230" ], [ "Mayotte", "yt", "262", 1, [ "269", "639" ] ], [ "Mexico (México)", "mx", "52" ], [ "Micronesia", "fm", "691" ], [ "Moldova (Republica Moldova)", "md", "373" ], [ "Monaco", "mc", "377" ], [ "Mongolia (Монгол)", "mn", "976" ], [ "Montenegro (Crna Gora)", "me", "382" ], [ "Montserrat", "ms", "1", 16, [ "664" ] ], [ "Morocco (‫المغرب‬‎)", "ma", "212", 0 ], [ "Mozambique (Moçambique)", "mz", "258" ], [ "Myanmar (Burma) (မြန်မာ)", "mm", "95" ], [ "Namibia (Namibië)", "na", "264" ], [ "Nauru", "nr", "674" ], [ "Nepal (नेपाल)", "np", "977" ], [ "Netherlands (Nederland)", "nl", "31" ], [ "New Caledonia (Nouvelle-Calédonie)", "nc", "687" ], [ "New Zealand", "nz", "64" ], [ "Nicaragua", "ni", "505" ], [ "Niger (Nijar)", "ne", "227" ], [ "Nigeria", "ng", "234" ], [ "Niue", "nu", "683" ], [ "Norfolk Island", "nf", "672" ], [ "North Korea (조선 민주주의 인민 공화국)", "kp", "850" ], [ "Northern Mariana Islands", "mp", "1", 17, [ "670" ] ], [ "Norway (Norge)", "no", "47", 0 ], [ "Oman (‫عُمان‬‎)", "om", "968" ], [ "Pakistan (‫پاکستان‬‎)", "pk", "92" ], [ "Palau", "pw", "680" ], [ "Palestine (‫فلسطين‬‎)", "ps", "970" ], [ "Panama (Panamá)", "pa", "507" ], [ "Papua New Guinea", "pg", "675" ], [ "Paraguay", "py", "595" ], [ "Peru (Perú)", "pe", "51" ], [ "Philippines", "ph", "63" ], [ "Poland (Polska)", "pl", "48" ], [ "Portugal", "pt", "351" ], [ "Puerto Rico", "pr", "1", 3, [ "787", "939" ] ], [ "Qatar (‫قطر‬‎)", "qa", "974" ], [ "Réunion (La Réunion)", "re", "262", 0 ], [ "Romania (România)", "ro", "40" ], [ "Russia (Россия)", "ru", "7", 0 ], [ "Rwanda", "rw", "250" ], [ "Saint Barthélemy", "bl", "590", 1 ], [ "Saint Helena", "sh", "290" ], [ "Saint Kitts and Nevis", "kn", "1", 18, [ "869" ] ], [ "Saint Lucia", "lc", "1", 19, [ "758" ] ], [ "Saint Martin (Saint-Martin (partie française))", "mf", "590", 2 ], [ "Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "pm", "508" ], [ "Saint Vincent and the Grenadines", "vc", "1", 20, [ "784" ] ], [ "Samoa", "ws", "685" ], [ "San Marino", "sm", "378" ], [ "São Tomé and Príncipe (São Tomé e Príncipe)", "st", "239" ], [ "Saudi Arabia (‫المملكة العربية السعودية‬‎)", "sa", "966" ], [ "Senegal (Sénégal)", "sn", "221" ], [ "Serbia (Србија)", "rs", "381" ], [ "Seychelles", "sc", "248" ], [ "Sierra Leone", "sl", "232" ], [ "Singapore", "sg", "65" ], [ "Sint Maarten", "sx", "1", 21, [ "721" ] ], [ "Slovakia (Slovensko)", "sk", "421" ], [ "Slovenia (Slovenija)", "si", "386" ], [ "Solomon Islands", "sb", "677" ], [ "Somalia (Soomaaliya)", "so", "252" ], [ "South Africa", "za", "27" ], [ "South Korea (대한민국)", "kr", "82" ], [ "South Sudan (‫جنوب السودان‬‎)", "ss", "211" ], [ "Spain (España)", "es", "34" ], [ "Sri Lanka (ශ්‍රී ලංකාව)", "lk", "94" ], [ "Sudan (‫السودان‬‎)", "sd", "249" ], [ "Suriname", "sr", "597" ], [ "Svalbard and Jan Mayen", "sj", "47", 1, [ "79" ] ], [ "Sweden (Sverige)", "se", "46" ], [ "Switzerland (Schweiz)", "ch", "41" ], [ "Syria (‫سوريا‬‎)", "sy", "963" ], [ "Taiwan (台灣)", "tw", "886" ], [ "Tajikistan", "tj", "992" ], [ "Tanzania", "tz", "255" ], [ "Thailand (ไทย)", "th", "66" ], [ "Timor-Leste", "tl", "670" ], [ "Togo", "tg", "228" ], [ "Tokelau", "tk", "690" ], [ "Tonga", "to", "676" ], [ "Trinidad and Tobago", "tt", "1", 22, [ "868" ] ], [ "Tunisia (‫تونس‬‎)", "tn", "216" ], [ "Turkey (Türkiye)", "tr", "90" ], [ "Turkmenistan", "tm", "993" ], [ "Turks and Caicos Islands", "tc", "1", 23, [ "649" ] ], [ "Tuvalu", "tv", "688" ], [ "U.S. Virgin Islands", "vi", "1", 24, [ "340" ] ], [ "Uganda", "ug", "256" ], [ "Ukraine (Україна)", "ua", "380" ], [ "United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "ae", "971" ], [ "United Kingdom", "gb", "44", 0 ], [ "United States", "us", "1", 0 ], [ "Uruguay", "uy", "598" ], [ "Uzbekistan (Oʻzbekiston)", "uz", "998" ], [ "Vanuatu", "vu", "678" ], [ "Vatican City (Città del Vaticano)", "va", "39", 1, [ "06698" ] ], [ "Venezuela", "ve", "58" ], [ "Vietnam (Việt Nam)", "vn", "84" ], [ "Wallis and Futuna (Wallis-et-Futuna)", "wf", "681" ], [ "Western Sahara (‫الصحراء الغربية‬‎)", "eh", "212", 1, [ "5288", "5289" ] ], [ "Yemen (‫اليمن‬‎)", "ye", "967" ], [ "Zambia", "zm", "260" ], [ "Zimbabwe", "zw", "263" ], [ "Åland Islands", "ax", "358", 1, [ "18" ] ] ], f = 0; f < e.length; f++) {
                var g = e[f];
                e[f] = {
                    name: g[0],
                    iso2: g[1],
                    dialCode: g[2],
                    priority: g[3] || 0,
                    areaCodes: g[4] || null
                };
            }
            var h = {
                getInstance: function(a) {
                    var b = a.getAttribute("data-intl-tel-input-id");
                    return window.intlTelInputGlobals.instances[b];
                },
                instances: {},
                documentReady: function() {
                    return "complete" === document.readyState;
                }
            };
            "object" == typeof window && (window.intlTelInputGlobals = h);
            var i = 0, j = {
                allowDropdown: !0,
                autoHideDialCode: !0,
                autoPlaceholder: "polite",
                customContainer: "",
                customPlaceholder: null,
                dropdownContainer: null,
                excludeCountries: [],
                formatOnDisplay: !0,
                geoIpLookup: null,
                hiddenInput: "",
                initialCountry: "",
                localizedCountries: null,
                nationalMode: !0,
                onlyCountries: [],
                placeholderNumberType: "MOBILE",
                preferredCountries: [ "us", "gb" ],
                separateDialCode: !1,
                utilsScript: ""
            }, k = [ "800", "822", "833", "844", "855", "866", "877", "880", "881", "882", "883", "884", "885", "886", "887", "888", "889" ], l = function(a, b) {
                for (var c = Object.keys(a), d = 0; d < c.length; d++) b(c[d], a[c[d]]);
            }, m = function(a) {
                l(window.intlTelInputGlobals.instances, (function(b) {
                    window.intlTelInputGlobals.instances[b][a]();
                }));
            }, n = function() {
                function c(a, d) {
                    var e = this;
                    b(this, c), this.id = i++, this.a = a, this.b = null, this.c = null;
                    var f = d || {};
                    this.d = {}, l(j, (function(a, b) {
                        e.d[a] = f.hasOwnProperty(a) ? f[a] : b;
                    })), this.e = Boolean(a.getAttribute("placeholder"));
                }
                return d(c, [ {
                    key: "_init",
                    value: function() {
                        var a = this;
                        if (this.d.nationalMode && (this.d.autoHideDialCode = !1), this.d.separateDialCode && (this.d.autoHideDialCode = this.d.nationalMode = !1), 
                        this.g = /Android.+Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent), 
                        this.g && (document.body.classList.add("iti-mobile"), this.d.dropdownContainer || (this.d.dropdownContainer = document.body)), 
                        "undefined" != typeof Promise) {
                            var b = new Promise((function(b, c) {
                                a.h = b, a.i = c;
                            })), c = new Promise((function(b, c) {
                                a.i0 = b, a.i1 = c;
                            }));
                            this.promise = Promise.all([ b, c ]);
                        } else this.h = this.i = function() {}, this.i0 = this.i1 = function() {};
                        this.s = {}, this._b(), this._f(), this._h(), this._i(), this._i3();
                    }
                }, {
                    key: "_b",
                    value: function() {
                        this._d(), this._d2(), this._e(), this.d.localizedCountries && this._d0(), (this.d.onlyCountries.length || this.d.localizedCountries) && this.p.sort(this._d1);
                    }
                }, {
                    key: "_c",
                    value: function(b, c, d) {
                        c.length > this.countryCodeMaxLen && (this.countryCodeMaxLen = c.length), this.q.hasOwnProperty(c) || (this.q[c] = []);
                        for (var e = 0; e < this.q[c].length; e++) if (this.q[c][e] === b) return;
                        var f = d !== a ? d : this.q[c].length;
                        this.q[c][f] = b;
                    }
                }, {
                    key: "_d",
                    value: function() {
                        if (this.d.onlyCountries.length) {
                            var a = this.d.onlyCountries.map((function(a) {
                                return a.toLowerCase();
                            }));
                            this.p = e.filter((function(b) {
                                return a.indexOf(b.iso2) > -1;
                            }));
                        } else if (this.d.excludeCountries.length) {
                            var b = this.d.excludeCountries.map((function(a) {
                                return a.toLowerCase();
                            }));
                            this.p = e.filter((function(a) {
                                return -1 === b.indexOf(a.iso2);
                            }));
                        } else this.p = e;
                    }
                }, {
                    key: "_d0",
                    value: function() {
                        for (var a = 0; a < this.p.length; a++) {
                            var b = this.p[a].iso2.toLowerCase();
                            this.d.localizedCountries.hasOwnProperty(b) && (this.p[a].name = this.d.localizedCountries[b]);
                        }
                    }
                }, {
                    key: "_d1",
                    value: function(a, b) {
                        return a.name.localeCompare(b.name);
                    }
                }, {
                    key: "_d2",
                    value: function() {
                        this.countryCodeMaxLen = 0, this.dialCodes = {}, this.q = {};
                        for (var a = 0; a < this.p.length; a++) {
                            var b = this.p[a];
                            this.dialCodes[b.dialCode] || (this.dialCodes[b.dialCode] = !0), this._c(b.iso2, b.dialCode, b.priority);
                        }
                        for (var c = 0; c < this.p.length; c++) {
                            var d = this.p[c];
                            if (d.areaCodes) for (var e = this.q[d.dialCode][0], f = 0; f < d.areaCodes.length; f++) {
                                for (var g = d.areaCodes[f], h = 1; h < g.length; h++) {
                                    var i = d.dialCode + g.substr(0, h);
                                    this._c(e, i), this._c(d.iso2, i);
                                }
                                this._c(d.iso2, d.dialCode + g);
                            }
                        }
                    }
                }, {
                    key: "_e",
                    value: function() {
                        this.preferredCountries = [];
                        for (var a = 0; a < this.d.preferredCountries.length; a++) {
                            var b = this.d.preferredCountries[a].toLowerCase(), c = this._y(b, !1, !0);
                            c && this.preferredCountries.push(c);
                        }
                    }
                }, {
                    key: "_e2",
                    value: function(a, b, c) {
                        var d = document.createElement(a);
                        return b && l(b, (function(a, b) {
                            return d.setAttribute(a, b);
                        })), c && c.appendChild(d), d;
                    }
                }, {
                    key: "_f",
                    value: function() {
                        this.a.hasAttribute("autocomplete") || this.a.form && this.a.form.hasAttribute("autocomplete") || this.a.setAttribute("autocomplete", "off");
                        var a = "iti";
                        this.d.allowDropdown && (a += " iti--allow-dropdown"), this.d.separateDialCode && (a += " iti--separate-dial-code"), 
                        this.d.customContainer && (a += " ", a += this.d.customContainer);
                        var b = this._e2("div", {
                            class: a
                        });
                        if (this.a.parentNode.insertBefore(b, this.a), this.k = this._e2("div", {
                            class: "iti__flag-container"
                        }, b), b.appendChild(this.a), this.selectedFlag = this._e2("div", {
                            class: "iti__selected-flag",
                            role: "combobox",
                            "aria-controls": "iti-".concat(this.id, "__country-listbox"),
                            "aria-owns": "iti-".concat(this.id, "__country-listbox"),
                            "aria-expanded": "false"
                        }, this.k), this.l = this._e2("div", {
                            class: "iti__flag"
                        }, this.selectedFlag), this.d.separateDialCode && (this.t = this._e2("div", {
                            class: "iti__selected-dial-code"
                        }, this.selectedFlag)), this.d.allowDropdown && (this.selectedFlag.setAttribute("tabindex", "0"), 
                        this.u = this._e2("div", {
                            class: "iti__arrow"
                        }, this.selectedFlag), this.m = this._e2("ul", {
                            class: "iti__country-list iti__hide",
                            id: "iti-".concat(this.id, "__country-listbox"),
                            role: "listbox",
                            "aria-label": "List of countries"
                        }), this.preferredCountries.length && (this._g(this.preferredCountries, "iti__preferred", !0), 
                        this._e2("li", {
                            class: "iti__divider",
                            role: "separator",
                            "aria-disabled": "true"
                        }, this.m)), this._g(this.p, "iti__standard"), this.d.dropdownContainer ? (this.dropdown = this._e2("div", {
                            class: "iti iti--container"
                        }), this.dropdown.appendChild(this.m)) : this.k.appendChild(this.m)), this.d.hiddenInput) {
                            var c = this.d.hiddenInput, d = this.a.getAttribute("name");
                            if (d) {
                                var e = d.lastIndexOf("[");
                                -1 !== e && (c = "".concat(d.substr(0, e), "[").concat(c, "]"));
                            }
                            this.hiddenInput = this._e2("input", {
                                type: "hidden",
                                name: c
                            }), b.appendChild(this.hiddenInput);
                        }
                    }
                }, {
                    key: "_g",
                    value: function(a, b, c) {
                        for (var d = "", e = 0; e < a.length; e++) {
                            var f = a[e], g = c ? "-preferred" : "";
                            d += "<li class='iti__country ".concat(b, "' tabIndex='-1' id='iti-").concat(this.id, "__item-").concat(f.iso2).concat(g, "' role='option' data-dial-code='").concat(f.dialCode, "' data-country-code='").concat(f.iso2, "' aria-selected='false'>"), 
                            d += "<div class='iti__flag-box'><div class='iti__flag iti__".concat(f.iso2, "'></div></div>"), 
                            d += "<span class='iti__country-name'>".concat(f.name, "</span>"), d += "<span class='iti__dial-code'>+".concat(f.dialCode, "</span>"), 
                            d += "</li>";
                        }
                        this.m.insertAdjacentHTML("beforeend", d);
                    }
                }, {
                    key: "_h",
                    value: function() {
                        var a = this.a.getAttribute("value"), b = this.a.value, c = a && "+" === a.charAt(0) && (!b || "+" !== b.charAt(0)), d = c ? a : b, e = this._5(d), f = this._w(d), g = this.d, h = g.initialCountry, i = g.nationalMode, j = g.autoHideDialCode, k = g.separateDialCode;
                        e && !f ? this._v(d) : "auto" !== h && (h ? this._z(h.toLowerCase()) : e && f ? this._z("us") : (this.j = this.preferredCountries.length ? this.preferredCountries[0].iso2 : this.p[0].iso2, 
                        d || this._z(this.j)), d || i || j || k || (this.a.value = "+".concat(this.s.dialCode))), 
                        d && this._u(d);
                    }
                }, {
                    key: "_i",
                    value: function() {
                        this._j(), this.d.autoHideDialCode && this._l(), this.d.allowDropdown && this._i2(), 
                        this.hiddenInput && this._i0();
                    }
                }, {
                    key: "_i0",
                    value: function() {
                        var a = this;
                        this._a14 = function() {
                            a.hiddenInput.value = a.getNumber();
                        }, this.a.form && this.a.form.addEventListener("submit", this._a14);
                    }
                }, {
                    key: "_i1",
                    value: function() {
                        for (var a = this.a; a && "LABEL" !== a.tagName; ) a = a.parentNode;
                        return a;
                    }
                }, {
                    key: "_i2",
                    value: function() {
                        var a = this;
                        this._a9 = function(b) {
                            a.m.classList.contains("iti__hide") ? a.a.focus() : b.preventDefault();
                        };
                        var b = this._i1();
                        b && b.addEventListener("click", this._a9), this._a10 = function() {
                            !a.m.classList.contains("iti__hide") || a.a.disabled || a.a.readOnly || a._n();
                        }, this.selectedFlag.addEventListener("click", this._a10), this._a11 = function(b) {
                            a.m.classList.contains("iti__hide") && -1 !== [ "ArrowUp", "Up", "ArrowDown", "Down", " ", "Enter" ].indexOf(b.key) && (b.preventDefault(), 
                            b.stopPropagation(), a._n()), "Tab" === b.key && a._2();
                        }, this.k.addEventListener("keydown", this._a11);
                    }
                }, {
                    key: "_i3",
                    value: function() {
                        var a = this;
                        this.d.utilsScript && !window.intlTelInputUtils ? window.intlTelInputGlobals.documentReady() ? window.intlTelInputGlobals.loadUtils(this.d.utilsScript) : window.addEventListener("load", (function() {
                            window.intlTelInputGlobals.loadUtils(a.d.utilsScript);
                        })) : this.i0(), "auto" === this.d.initialCountry ? this._i4() : this.h();
                    }
                }, {
                    key: "_i4",
                    value: function() {
                        window.intlTelInputGlobals.autoCountry ? this.handleAutoCountry() : window.intlTelInputGlobals.startedLoadingAutoCountry || (window.intlTelInputGlobals.startedLoadingAutoCountry = !0, 
                        "function" == typeof this.d.geoIpLookup && this.d.geoIpLookup((function(a) {
                            window.intlTelInputGlobals.autoCountry = a.toLowerCase(), setTimeout((function() {
                                return m("handleAutoCountry");
                            }));
                        }), (function() {
                            return m("rejectAutoCountryPromise");
                        })));
                    }
                }, {
                    key: "_j",
                    value: function() {
                        var a = this;
                        this._a12 = function() {
                            a._v(a.a.value) && a._m2CountryChange();
                        }, this.a.addEventListener("keyup", this._a12), this._a13 = function() {
                            setTimeout(a._a12);
                        }, this.a.addEventListener("cut", this._a13), this.a.addEventListener("paste", this._a13);
                    }
                }, {
                    key: "_j2",
                    value: function(a) {
                        var b = this.a.getAttribute("maxlength");
                        return b && a.length > b ? a.substr(0, b) : a;
                    }
                }, {
                    key: "_l",
                    value: function() {
                        var a = this;
                        this._a8 = function() {
                            a._l2();
                        }, this.a.form && this.a.form.addEventListener("submit", this._a8), this.a.addEventListener("blur", this._a8);
                    }
                }, {
                    key: "_l2",
                    value: function() {
                        if ("+" === this.a.value.charAt(0)) {
                            var a = this._m(this.a.value);
                            a && this.s.dialCode !== a || (this.a.value = "");
                        }
                    }
                }, {
                    key: "_m",
                    value: function(a) {
                        return a.replace(/\D/g, "");
                    }
                }, {
                    key: "_m2",
                    value: function(a) {
                        var b = document.createEvent("Event");
                        b.initEvent(a, !0, !0), this.a.dispatchEvent(b);
                    }
                }, {
                    key: "_n",
                    value: function() {
                        this.m.classList.remove("iti__hide"), this.selectedFlag.setAttribute("aria-expanded", "true"), 
                        this._o(), this.b && (this._x(this.b, !1), this._3(this.b, !0)), this._p(), this.u.classList.add("iti__arrow--up"), 
                        this._m2("open:countrydropdown");
                    }
                }, {
                    key: "_n2",
                    value: function(a, b, c) {
                        c && !a.classList.contains(b) ? a.classList.add(b) : !c && a.classList.contains(b) && a.classList.remove(b);
                    }
                }, {
                    key: "_o",
                    value: function() {
                        var a = this;
                        if (this.d.dropdownContainer && this.d.dropdownContainer.appendChild(this.dropdown), 
                        !this.g) {
                            var b = this.a.getBoundingClientRect(), c = window.pageYOffset || document.documentElement.scrollTop, d = b.top + c, e = this.m.offsetHeight, f = d + this.a.offsetHeight + e < c + window.innerHeight, g = d - e > c;
                            if (this._n2(this.m, "iti__country-list--dropup", !f && g), this.d.dropdownContainer) {
                                var h = !f && g ? 0 : this.a.offsetHeight;
                                this.dropdown.style.top = "".concat(d + h, "px"), this.dropdown.style.left = "".concat(b.left + document.body.scrollLeft, "px"), 
                                this._a4 = function() {
                                    return a._2();
                                }, window.addEventListener("scroll", this._a4);
                            }
                        }
                    }
                }, {
                    key: "_o2",
                    value: function(a) {
                        for (var b = a; b && b !== this.m && !b.classList.contains("iti__country"); ) b = b.parentNode;
                        return b === this.m ? null : b;
                    }
                }, {
                    key: "_p",
                    value: function() {
                        var a = this;
                        this._a0 = function(b) {
                            var c = a._o2(b.target);
                            c && a._x(c, !1);
                        }, this.m.addEventListener("mouseover", this._a0), this._a1 = function(b) {
                            var c = a._o2(b.target);
                            c && a._1(c);
                        }, this.m.addEventListener("click", this._a1);
                        var b = !0;
                        this._a2 = function() {
                            b || a._2(), b = !1;
                        }, document.documentElement.addEventListener("click", this._a2);
                        var c = "", d = null;
                        this._a3 = function(b) {
                            b.preventDefault(), "ArrowUp" === b.key || "Up" === b.key || "ArrowDown" === b.key || "Down" === b.key ? a._q(b.key) : "Enter" === b.key ? a._r() : "Escape" === b.key ? a._2() : /^[a-zA-ZÀ-ÿа-яА-Я ]$/.test(b.key) && (d && clearTimeout(d), 
                            c += b.key.toLowerCase(), a._s(c), d = setTimeout((function() {
                                c = "";
                            }), 1e3));
                        }, document.addEventListener("keydown", this._a3);
                    }
                }, {
                    key: "_q",
                    value: function(a) {
                        var b = "ArrowUp" === a || "Up" === a ? this.c.previousElementSibling : this.c.nextElementSibling;
                        b && (b.classList.contains("iti__divider") && (b = "ArrowUp" === a || "Up" === a ? b.previousElementSibling : b.nextElementSibling), 
                        this._x(b, !0));
                    }
                }, {
                    key: "_r",
                    value: function() {
                        this.c && this._1(this.c);
                    }
                }, {
                    key: "_s",
                    value: function(a) {
                        for (var b = 0; b < this.p.length; b++) if (this._t(this.p[b].name, a)) {
                            var c = this.m.querySelector("#iti-".concat(this.id, "__item-").concat(this.p[b].iso2));
                            this._x(c, !1), this._3(c, !0);
                            break;
                        }
                    }
                }, {
                    key: "_t",
                    value: function(a, b) {
                        return a.substr(0, b.length).toLowerCase() === b;
                    }
                }, {
                    key: "_u",
                    value: function(a) {
                        var b = a;
                        if (this.d.formatOnDisplay && window.intlTelInputUtils && this.s) {
                            var c = !this.d.separateDialCode && (this.d.nationalMode || "+" !== b.charAt(0)), d = intlTelInputUtils.numberFormat, e = d.NATIONAL, f = d.INTERNATIONAL, g = c ? e : f;
                            b = intlTelInputUtils.formatNumber(b, this.s.iso2, g);
                        }
                        b = this._7(b), this.a.value = b;
                    }
                }, {
                    key: "_v",
                    value: function(a) {
                        var b = a, c = this.s.dialCode, d = "1" === c;
                        b && this.d.nationalMode && d && "+" !== b.charAt(0) && ("1" !== b.charAt(0) && (b = "1".concat(b)), 
                        b = "+".concat(b)), this.d.separateDialCode && c && "+" !== b.charAt(0) && (b = "+".concat(c).concat(b));
                        var e = this._5(b, !0), f = this._m(b), g = null;
                        if (e) {
                            var h = this.q[this._m(e)], i = -1 !== h.indexOf(this.s.iso2) && f.length <= e.length - 1;
                            if (!("1" === c && this._w(f)) && !i) for (var j = 0; j < h.length; j++) if (h[j]) {
                                g = h[j];
                                break;
                            }
                        } else "+" === b.charAt(0) && f.length ? g = "" : b && "+" !== b || (g = this.j);
                        return null !== g && this._z(g);
                    }
                }, {
                    key: "_w",
                    value: function(a) {
                        var b = this._m(a);
                        if ("1" === b.charAt(0)) {
                            var c = b.substr(1, 3);
                            return -1 !== k.indexOf(c);
                        }
                        return !1;
                    }
                }, {
                    key: "_x",
                    value: function(a, b) {
                        var c = this.c;
                        c && c.classList.remove("iti__highlight"), this.c = a, this.c.classList.add("iti__highlight"), 
                        b && this.c.focus();
                    }
                }, {
                    key: "_y",
                    value: function(a, b, c) {
                        for (var d = b ? e : this.p, f = 0; f < d.length; f++) if (d[f].iso2 === a) return d[f];
                        if (c) return null;
                        throw new Error("No country data for '".concat(a, "'"));
                    }
                }, {
                    key: "_z",
                    value: function(a) {
                        var b = this.s.iso2 ? this.s : {};
                        this.s = a ? this._y(a, !1, !1) : {}, this.s.iso2 && (this.j = this.s.iso2), this.l.setAttribute("class", "iti__flag iti__".concat(a));
                        var c = a ? "".concat(this.s.name, ": +").concat(this.s.dialCode) : "Unknown";
                        if (this.selectedFlag.setAttribute("title", c), this.d.separateDialCode) {
                            var d = this.s.dialCode ? "+".concat(this.s.dialCode) : "";
                            this.t.innerHTML = d;
                            var e = this.selectedFlag.offsetWidth || this._z2();
                            this.a.style.paddingLeft = "".concat(e + 6, "px");
                        }
                        if (this._0(), this.d.allowDropdown) {
                            var f = this.b;
                            if (f && (f.classList.remove("iti__active"), f.setAttribute("aria-selected", "false")), 
                            a) {
                                var g = this.m.querySelector("#iti-".concat(this.id, "__item-").concat(a, "-preferred")) || this.m.querySelector("#iti-".concat(this.id, "__item-").concat(a));
                                g.setAttribute("aria-selected", "true"), g.classList.add("iti__active"), this.b = g, 
                                this.selectedFlag.setAttribute("aria-activedescendant", g.getAttribute("id"));
                            }
                        }
                        return b.iso2 !== a;
                    }
                }, {
                    key: "_z2",
                    value: function() {
                        var a = this.a.parentNode.cloneNode();
                        a.style.visibility = "hidden", document.body.appendChild(a);
                        var b = this.k.cloneNode();
                        a.appendChild(b);
                        var c = this.selectedFlag.cloneNode(!0);
                        b.appendChild(c);
                        var d = c.offsetWidth;
                        return a.parentNode.removeChild(a), d;
                    }
                }, {
                    key: "_0",
                    value: function() {
                        var a = "aggressive" === this.d.autoPlaceholder || !this.e && "polite" === this.d.autoPlaceholder;
                        if (window.intlTelInputUtils && a) {
                            var b = intlTelInputUtils.numberType[this.d.placeholderNumberType], c = this.s.iso2 ? intlTelInputUtils.getExampleNumber(this.s.iso2, this.d.nationalMode, b) : "";
                            c = this._7(c), "function" == typeof this.d.customPlaceholder && (c = this.d.customPlaceholder(c, this.s)), 
                            this.a.setAttribute("placeholder", c);
                        }
                    }
                }, {
                    key: "_1",
                    value: function(a) {
                        var b = this._z(a.getAttribute("data-country-code"));
                        this._2(), this._4(a.getAttribute("data-dial-code"), !0), this.a.focus();
                        var c = this.a.value.length;
                        this.a.setSelectionRange(c, c), b && this._m2CountryChange();
                    }
                }, {
                    key: "_2",
                    value: function() {
                        this.m.classList.add("iti__hide"), this.selectedFlag.setAttribute("aria-expanded", "false"), 
                        this.u.classList.remove("iti__arrow--up"), document.removeEventListener("keydown", this._a3), 
                        document.documentElement.removeEventListener("click", this._a2), this.m.removeEventListener("mouseover", this._a0), 
                        this.m.removeEventListener("click", this._a1), this.d.dropdownContainer && (this.g || window.removeEventListener("scroll", this._a4), 
                        this.dropdown.parentNode && this.dropdown.parentNode.removeChild(this.dropdown)), 
                        this._m2("close:countrydropdown");
                    }
                }, {
                    key: "_3",
                    value: function(a, b) {
                        var c = this.m, d = window.pageYOffset || document.documentElement.scrollTop, e = c.offsetHeight, f = c.getBoundingClientRect().top + d, g = f + e, h = a.offsetHeight, i = a.getBoundingClientRect().top + d, j = i + h, k = i - f + c.scrollTop, l = e / 2 - h / 2;
                        if (i < f) b && (k -= l), c.scrollTop = k; else if (j > g) {
                            b && (k += l);
                            var m = e - h;
                            c.scrollTop = k - m;
                        }
                    }
                }, {
                    key: "_4",
                    value: function(a, b) {
                        var c, d = this.a.value, e = "+".concat(a);
                        if ("+" === d.charAt(0)) {
                            var f = this._5(d);
                            c = f ? d.replace(f, e) : e;
                        } else {
                            if (this.d.nationalMode || this.d.separateDialCode) return;
                            if (d) c = e + d; else {
                                if (!b && this.d.autoHideDialCode) return;
                                c = e;
                            }
                        }
                        this.a.value = c;
                    }
                }, {
                    key: "_5",
                    value: function(a, b) {
                        var c = "";
                        if ("+" === a.charAt(0)) for (var d = "", e = 0; e < a.length; e++) {
                            var f = a.charAt(e);
                            if (!isNaN(parseInt(f, 10))) {
                                if (d += f, b) this.q[d] && (c = a.substr(0, e + 1)); else if (this.dialCodes[d]) {
                                    c = a.substr(0, e + 1);
                                    break;
                                }
                                if (d.length === this.countryCodeMaxLen) break;
                            }
                        }
                        return c;
                    }
                }, {
                    key: "_6",
                    value: function() {
                        var a = this.a.value.trim(), b = this.s.dialCode, c = this._m(a);
                        return (this.d.separateDialCode && "+" !== a.charAt(0) && b && c ? "+".concat(b) : "") + a;
                    }
                }, {
                    key: "_7",
                    value: function(a) {
                        var b = a;
                        if (this.d.separateDialCode) {
                            var c = this._5(b);
                            if (c) {
                                c = "+".concat(this.s.dialCode);
                                var d = " " === b[c.length] || "-" === b[c.length] ? c.length + 1 : c.length;
                                b = b.substr(d);
                            }
                        }
                        return this._j2(b);
                    }
                }, {
                    key: "_m2CountryChange",
                    value: function() {
                        this._m2("countrychange");
                    }
                }, {
                    key: "handleAutoCountry",
                    value: function() {
                        "auto" === this.d.initialCountry && (this.j = window.intlTelInputGlobals.autoCountry, 
                        this.a.value || this.setCountry(this.j), this.h());
                    }
                }, {
                    key: "handleUtils",
                    value: function() {
                        window.intlTelInputUtils && (this.a.value && this._u(this.a.value), this._0()), 
                        this.i0();
                    }
                }, {
                    key: "destroy",
                    value: function() {
                        var a = this.a.form;
                        if (this.d.allowDropdown) {
                            this._2(), this.selectedFlag.removeEventListener("click", this._a10), this.k.removeEventListener("keydown", this._a11);
                            var b = this._i1();
                            b && b.removeEventListener("click", this._a9);
                        }
                        this.hiddenInput && a && a.removeEventListener("submit", this._a14), this.d.autoHideDialCode && (a && a.removeEventListener("submit", this._a8), 
                        this.a.removeEventListener("blur", this._a8)), this.a.removeEventListener("keyup", this._a12), 
                        this.a.removeEventListener("cut", this._a13), this.a.removeEventListener("paste", this._a13), 
                        this.a.removeAttribute("data-intl-tel-input-id");
                        var c = this.a.parentNode;
                        c.parentNode.insertBefore(this.a, c), c.parentNode.removeChild(c), delete window.intlTelInputGlobals.instances[this.id];
                    }
                }, {
                    key: "getExtension",
                    value: function() {
                        return window.intlTelInputUtils ? intlTelInputUtils.getExtension(this._6(), this.s.iso2) : "";
                    }
                }, {
                    key: "getNumber",
                    value: function(a) {
                        if (window.intlTelInputUtils) {
                            var b = this.s.iso2;
                            return intlTelInputUtils.formatNumber(this._6(), b, a);
                        }
                        return "";
                    }
                }, {
                    key: "getNumberType",
                    value: function() {
                        return window.intlTelInputUtils ? intlTelInputUtils.getNumberType(this._6(), this.s.iso2) : -99;
                    }
                }, {
                    key: "getSelectedCountryData",
                    value: function() {
                        return this.s;
                    }
                }, {
                    key: "getValidationError",
                    value: function() {
                        if (window.intlTelInputUtils) {
                            var a = this.s.iso2;
                            return intlTelInputUtils.getValidationError(this._6(), a);
                        }
                        return -99;
                    }
                }, {
                    key: "isValidNumber",
                    value: function() {
                        var a = this._6().trim(), b = this.d.nationalMode ? this.s.iso2 : "";
                        return window.intlTelInputUtils ? intlTelInputUtils.isValidNumber(a, b) : null;
                    }
                }, {
                    key: "setCountry",
                    value: function(a) {
                        var b = a.toLowerCase();
                        this.l.classList.contains("iti__".concat(b)) || (this._z(b), this._4(this.s.dialCode, !1), 
                        this._m2CountryChange());
                    }
                }, {
                    key: "setNumber",
                    value: function(a) {
                        var b = this._v(a);
                        this._u(a), b && this._m2CountryChange();
                    }
                }, {
                    key: "setPlaceholderNumberType",
                    value: function(a) {
                        this.d.placeholderNumberType = a, this._0();
                    }
                } ]), c;
            }();
            h.getCountryData = function() {
                return e;
            };
            var o = function(a, b, c) {
                var d = document.createElement("script");
                d.onload = function() {
                    m("handleUtils"), b && b();
                }, d.onerror = function() {
                    m("rejectUtilsScriptPromise"), c && c();
                }, d.className = "iti-load-utils", d.async = !0, d.src = a, document.body.appendChild(d);
            };
            return h.loadUtils = function(a) {
                if (!window.intlTelInputUtils && !window.intlTelInputGlobals.startedLoadingUtilsScript) {
                    if (window.intlTelInputGlobals.startedLoadingUtilsScript = !0, "undefined" != typeof Promise) return new Promise((function(b, c) {
                        return o(a, b, c);
                    }));
                    o(a);
                }
                return null;
            }, h.defaults = j, h.version = "17.0.15", function(a, b) {
                var c = new n(a, b);
                return c._init(), a.setAttribute("data-intl-tel-input-id", c.id), window.intlTelInputGlobals.instances[c.id] = c, 
                c;
            };
        }();
    }));
    (function() {
        var aa = this || self;
        function k(a, b) {
            a = a.split(".");
            var c = aa;
            a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
            for (var d; a.length && (d = a.shift()); ) a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {} : c[d] = b;
        }
        function m(a, b) {
            function c() {}
            c.prototype = b.prototype;
            a.$ = b.prototype;
            a.prototype = new c;
            a.prototype.constructor = a;
            a.fa = function(d, e, g) {
                for (var f = Array(arguments.length - 2), h = 2; h < arguments.length; h++) f[h - 2] = arguments[h];
                return b.prototype[e].apply(d, f);
            };
        }
        function ba(a) {
            var d, b = [], c = 0;
            for (d in a) b[c++] = a[d];
            return b;
        }
        function ca(a, b) {
            a.sort(b || da);
        }
        function da(a, b) {
            return a > b ? 1 : a < b ? -1 : 0;
        }
        function ea(a, b) {
            this.g = a;
            this.m = !!b.o;
            this.i = b.h;
            this.v = b.type;
            this.u = !1;
            switch (this.i) {
              case fa:
              case ha:
              case ia:
              case ja:
              case ka:
              case la:
              case ma:
                this.u = !0;
            }
            this.l = b.defaultValue;
        }
        var ma = 1, la = 2, fa = 3, ha = 4, ia = 6, ja = 16, ka = 18;
        function na(a, b) {
            this.i = a;
            this.g = {};
            for (a = 0; a < b.length; a++) {
                var c = b[a];
                this.g[c.g] = c;
            }
        }
        function oa(a) {
            a = ba(a.g);
            ca(a, (function(b, c) {
                return b.g - c.g;
            }));
            return a;
        }
        function n() {
            this.g = {};
            this.l = this.j().g;
            this.i = this.m = null;
        }
        n.prototype.has = function(a) {
            return null != this.g[a.g];
        };
        n.prototype.get = function(a, b) {
            return p(this, a.g, b);
        };
        n.prototype.set = function(a, b) {
            q(this, a.g, b);
        };
        n.prototype.add = function(a, b) {
            r(this, a.g, b);
        };
        function t(a, b) {
            for (var c = oa(a.j()), d = 0; d < c.length; d++) {
                var e = c[d], g = e.g;
                if (null != b.g[g]) {
                    a.i && delete a.i[e.g];
                    var f = 11 == e.i || 10 == e.i;
                    if (e.m) {
                        e = u(b, g);
                        for (var h = 0; h < e.length; h++) r(a, g, f ? e[h].clone() : e[h]);
                    } else e = v(b, g), f ? (f = v(a, g)) ? t(f, e) : q(a, g, e.clone()) : q(a, g, e);
                }
            }
        }
        n.prototype.clone = function() {
            var a = new this.constructor;
            a != this && (a.g = {}, a.i && (a.i = {}), t(a, this));
            return a;
        };
        function v(a, b) {
            var c = a.g[b];
            if (null == c) return null;
            if (a.m) {
                if (!(b in a.i)) {
                    var d = a.m, e = a.l[b];
                    if (null != c) if (e.m) {
                        for (var g = [], f = 0; f < c.length; f++) g[f] = d.i(e, c[f]);
                        c = g;
                    } else c = d.i(e, c);
                    return a.i[b] = c;
                }
                return a.i[b];
            }
            return c;
        }
        function p(a, b, c) {
            var d = v(a, b);
            return a.l[b].m ? d[c || 0] : d;
        }
        function w(a, b) {
            if (null != a.g[b]) a = p(a, b, void 0); else a: {
                a = a.l[b];
                if (void 0 === a.l) if (b = a.v, b === Boolean) a.l = !1; else if (b === Number) a.l = 0; else if (b === String) a.l = a.u ? "0" : ""; else {
                    a = new b;
                    break a;
                }
                a = a.l;
            }
            return a;
        }
        function u(a, b) {
            return v(a, b) || [];
        }
        function x(a, b) {
            return a.l[b].m ? null != a.g[b] ? a.g[b].length : 0 : null != a.g[b] ? 1 : 0;
        }
        function q(a, b, c) {
            a.g[b] = c;
            a.i && (a.i[b] = c);
        }
        function r(a, b, c) {
            a.g[b] || (a.g[b] = []);
            a.g[b].push(c);
            a.i && delete a.i[b];
        }
        function y(a, b) {
            var d, c = [];
            for (d in b) 0 != d && c.push(new ea(d, b[d]));
            return new na(a, c);
        }
        function A() {}
        A.prototype.g = function(a) {
            new a.i;
            throw Error("Unimplemented");
        };
        A.prototype.i = function(a, b) {
            if (11 == a.i || 10 == a.i) return b instanceof n ? b : this.g(a.v.prototype.j(), b);
            if (14 == a.i) return "string" === typeof b && B.test(b) && (a = Number(b), 0 < a) ? a : b;
            if (!a.u) return b;
            a = a.v;
            if (a === String) {
                if ("number" === typeof b) return String(b);
            } else if (a === Number && "string" === typeof b && ("Infinity" === b || "-Infinity" === b || "NaN" === b || B.test(b))) return Number(b);
            return b;
        };
        var B = /^-?[0-9]+$/;
        function C() {}
        m(C, A);
        C.prototype.g = function(a, b) {
            a = new a.i;
            a.m = this;
            a.g = b;
            a.i = {};
            return a;
        };
        function D() {}
        m(D, C);
        D.prototype.i = function(a, b) {
            return 8 == a.i ? !!b : A.prototype.i.apply(this, arguments);
        };
        D.prototype.g = function(a, b) {
            return D.$.g.call(this, a, b);
        };
        function E(a, b) {
            null != a && this.g.apply(this, arguments);
        }
        E.prototype.i = "";
        E.prototype.set = function(a) {
            this.i = "" + a;
        };
        E.prototype.g = function(a, b, c) {
            this.i += String(a);
            if (null != b) for (var d = 1; d < arguments.length; d++) this.i += arguments[d];
            return this;
        };
        E.prototype.toString = function() {
            return this.i;
        };
        function F() {
            n.call(this);
        }
        m(F, n);
        var pa = null;
        function G() {
            n.call(this);
        }
        m(G, n);
        var qa = null;
        function H() {
            n.call(this);
        }
        m(H, n);
        var ra = null;
        F.prototype.j = function() {
            var a = pa;
            a || (pa = a = y(F, {
                0: {
                    name: "NumberFormat",
                    s: "i18n.phonenumbers.NumberFormat"
                },
                1: {
                    name: "pattern",
                    required: !0,
                    h: 9,
                    type: String
                },
                2: {
                    name: "format",
                    required: !0,
                    h: 9,
                    type: String
                },
                3: {
                    name: "leading_digits_pattern",
                    o: !0,
                    h: 9,
                    type: String
                },
                4: {
                    name: "national_prefix_formatting_rule",
                    h: 9,
                    type: String
                },
                6: {
                    name: "national_prefix_optional_when_formatting",
                    h: 8,
                    defaultValue: !1,
                    type: Boolean
                },
                5: {
                    name: "domestic_carrier_code_formatting_rule",
                    h: 9,
                    type: String
                }
            }));
            return a;
        };
        F.j = F.prototype.j;
        G.prototype.j = function() {
            var a = qa;
            a || (qa = a = y(G, {
                0: {
                    name: "PhoneNumberDesc",
                    s: "i18n.phonenumbers.PhoneNumberDesc"
                },
                2: {
                    name: "national_number_pattern",
                    h: 9,
                    type: String
                },
                9: {
                    name: "possible_length",
                    o: !0,
                    h: 5,
                    type: Number
                },
                10: {
                    name: "possible_length_local_only",
                    o: !0,
                    h: 5,
                    type: Number
                },
                6: {
                    name: "example_number",
                    h: 9,
                    type: String
                }
            }));
            return a;
        };
        G.j = G.prototype.j;
        H.prototype.j = function() {
            var a = ra;
            a || (ra = a = y(H, {
                0: {
                    name: "PhoneMetadata",
                    s: "i18n.phonenumbers.PhoneMetadata"
                },
                1: {
                    name: "general_desc",
                    h: 11,
                    type: G
                },
                2: {
                    name: "fixed_line",
                    h: 11,
                    type: G
                },
                3: {
                    name: "mobile",
                    h: 11,
                    type: G
                },
                4: {
                    name: "toll_free",
                    h: 11,
                    type: G
                },
                5: {
                    name: "premium_rate",
                    h: 11,
                    type: G
                },
                6: {
                    name: "shared_cost",
                    h: 11,
                    type: G
                },
                7: {
                    name: "personal_number",
                    h: 11,
                    type: G
                },
                8: {
                    name: "voip",
                    h: 11,
                    type: G
                },
                21: {
                    name: "pager",
                    h: 11,
                    type: G
                },
                25: {
                    name: "uan",
                    h: 11,
                    type: G
                },
                27: {
                    name: "emergency",
                    h: 11,
                    type: G
                },
                28: {
                    name: "voicemail",
                    h: 11,
                    type: G
                },
                29: {
                    name: "short_code",
                    h: 11,
                    type: G
                },
                30: {
                    name: "standard_rate",
                    h: 11,
                    type: G
                },
                31: {
                    name: "carrier_specific",
                    h: 11,
                    type: G
                },
                33: {
                    name: "sms_services",
                    h: 11,
                    type: G
                },
                24: {
                    name: "no_international_dialling",
                    h: 11,
                    type: G
                },
                9: {
                    name: "id",
                    required: !0,
                    h: 9,
                    type: String
                },
                10: {
                    name: "country_code",
                    h: 5,
                    type: Number
                },
                11: {
                    name: "international_prefix",
                    h: 9,
                    type: String
                },
                17: {
                    name: "preferred_international_prefix",
                    h: 9,
                    type: String
                },
                12: {
                    name: "national_prefix",
                    h: 9,
                    type: String
                },
                13: {
                    name: "preferred_extn_prefix",
                    h: 9,
                    type: String
                },
                15: {
                    name: "national_prefix_for_parsing",
                    h: 9,
                    type: String
                },
                16: {
                    name: "national_prefix_transform_rule",
                    h: 9,
                    type: String
                },
                18: {
                    name: "same_mobile_and_fixed_line_pattern",
                    h: 8,
                    defaultValue: !1,
                    type: Boolean
                },
                19: {
                    name: "number_format",
                    o: !0,
                    h: 11,
                    type: F
                },
                20: {
                    name: "intl_number_format",
                    o: !0,
                    h: 11,
                    type: F
                },
                22: {
                    name: "main_country_for_code",
                    h: 8,
                    defaultValue: !1,
                    type: Boolean
                },
                23: {
                    name: "leading_digits",
                    h: 9,
                    type: String
                },
                26: {
                    name: "leading_zero_possible",
                    h: 8,
                    defaultValue: !1,
                    type: Boolean
                }
            }));
            return a;
        };
        H.j = H.prototype.j;
        function I() {
            n.call(this);
        }
        m(I, n);
        var sa = null, ta = {
            ea: 0,
            da: 1,
            ca: 5,
            ba: 10,
            aa: 20
        };
        I.prototype.j = function() {
            var a = sa;
            a || (sa = a = y(I, {
                0: {
                    name: "PhoneNumber",
                    s: "i18n.phonenumbers.PhoneNumber"
                },
                1: {
                    name: "country_code",
                    required: !0,
                    h: 5,
                    type: Number
                },
                2: {
                    name: "national_number",
                    required: !0,
                    h: 4,
                    type: Number
                },
                3: {
                    name: "extension",
                    h: 9,
                    type: String
                },
                4: {
                    name: "italian_leading_zero",
                    h: 8,
                    type: Boolean
                },
                8: {
                    name: "number_of_leading_zeros",
                    h: 5,
                    defaultValue: 1,
                    type: Number
                },
                5: {
                    name: "raw_input",
                    h: 9,
                    type: String
                },
                6: {
                    name: "country_code_source",
                    h: 14,
                    defaultValue: 0,
                    type: ta
                },
                7: {
                    name: "preferred_domestic_carrier_code",
                    h: 9,
                    type: String
                }
            }));
            return a;
        };
        I.ctor = I;
        I.ctor.j = I.prototype.j;
        var J = {
            1: "US AG AI AS BB BM BS CA DM DO GD GU JM KN KY LC MP MS PR SX TC TT VC VG VI".split(" "),
            7: [ "RU", "KZ" ],
            20: [ "EG" ],
            27: [ "ZA" ],
            30: [ "GR" ],
            31: [ "NL" ],
            32: [ "BE" ],
            33: [ "FR" ],
            34: [ "ES" ],
            36: [ "HU" ],
            39: [ "IT", "VA" ],
            40: [ "RO" ],
            41: [ "CH" ],
            43: [ "AT" ],
            44: [ "GB", "GG", "IM", "JE" ],
            45: [ "DK" ],
            46: [ "SE" ],
            47: [ "NO", "SJ" ],
            48: [ "PL" ],
            49: [ "DE" ],
            51: [ "PE" ],
            52: [ "MX" ],
            53: [ "CU" ],
            54: [ "AR" ],
            55: [ "BR" ],
            56: [ "CL" ],
            57: [ "CO" ],
            58: [ "VE" ],
            60: [ "MY" ],
            61: [ "AU", "CC", "CX" ],
            62: [ "ID" ],
            63: [ "PH" ],
            64: [ "NZ" ],
            65: [ "SG" ],
            66: [ "TH" ],
            81: [ "JP" ],
            82: [ "KR" ],
            84: [ "VN" ],
            86: [ "CN" ],
            90: [ "TR" ],
            91: [ "IN" ],
            92: [ "PK" ],
            93: [ "AF" ],
            94: [ "LK" ],
            95: [ "MM" ],
            98: [ "IR" ],
            211: [ "SS" ],
            212: [ "MA", "EH" ],
            213: [ "DZ" ],
            216: [ "TN" ],
            218: [ "LY" ],
            220: [ "GM" ],
            221: [ "SN" ],
            222: [ "MR" ],
            223: [ "ML" ],
            224: [ "GN" ],
            225: [ "CI" ],
            226: [ "BF" ],
            227: [ "NE" ],
            228: [ "TG" ],
            229: [ "BJ" ],
            230: [ "MU" ],
            231: [ "LR" ],
            232: [ "SL" ],
            233: [ "GH" ],
            234: [ "NG" ],
            235: [ "TD" ],
            236: [ "CF" ],
            237: [ "CM" ],
            238: [ "CV" ],
            239: [ "ST" ],
            240: [ "GQ" ],
            241: [ "GA" ],
            242: [ "CG" ],
            243: [ "CD" ],
            244: [ "AO" ],
            245: [ "GW" ],
            246: [ "IO" ],
            247: [ "AC" ],
            248: [ "SC" ],
            249: [ "SD" ],
            250: [ "RW" ],
            251: [ "ET" ],
            252: [ "SO" ],
            253: [ "DJ" ],
            254: [ "KE" ],
            255: [ "TZ" ],
            256: [ "UG" ],
            257: [ "BI" ],
            258: [ "MZ" ],
            260: [ "ZM" ],
            261: [ "MG" ],
            262: [ "RE", "YT" ],
            263: [ "ZW" ],
            264: [ "NA" ],
            265: [ "MW" ],
            266: [ "LS" ],
            267: [ "BW" ],
            268: [ "SZ" ],
            269: [ "KM" ],
            290: [ "SH", "TA" ],
            291: [ "ER" ],
            297: [ "AW" ],
            298: [ "FO" ],
            299: [ "GL" ],
            350: [ "GI" ],
            351: [ "PT" ],
            352: [ "LU" ],
            353: [ "IE" ],
            354: [ "IS" ],
            355: [ "AL" ],
            356: [ "MT" ],
            357: [ "CY" ],
            358: [ "FI", "AX" ],
            359: [ "BG" ],
            370: [ "LT" ],
            371: [ "LV" ],
            372: [ "EE" ],
            373: [ "MD" ],
            374: [ "AM" ],
            375: [ "BY" ],
            376: [ "AD" ],
            377: [ "MC" ],
            378: [ "SM" ],
            380: [ "UA" ],
            381: [ "RS" ],
            382: [ "ME" ],
            383: [ "XK" ],
            385: [ "HR" ],
            386: [ "SI" ],
            387: [ "BA" ],
            389: [ "MK" ],
            420: [ "CZ" ],
            421: [ "SK" ],
            423: [ "LI" ],
            500: [ "FK" ],
            501: [ "BZ" ],
            502: [ "GT" ],
            503: [ "SV" ],
            504: [ "HN" ],
            505: [ "NI" ],
            506: [ "CR" ],
            507: [ "PA" ],
            508: [ "PM" ],
            509: [ "HT" ],
            590: [ "GP", "BL", "MF" ],
            591: [ "BO" ],
            592: [ "GY" ],
            593: [ "EC" ],
            594: [ "GF" ],
            595: [ "PY" ],
            596: [ "MQ" ],
            597: [ "SR" ],
            598: [ "UY" ],
            599: [ "CW", "BQ" ],
            670: [ "TL" ],
            672: [ "NF" ],
            673: [ "BN" ],
            674: [ "NR" ],
            675: [ "PG" ],
            676: [ "TO" ],
            677: [ "SB" ],
            678: [ "VU" ],
            679: [ "FJ" ],
            680: [ "PW" ],
            681: [ "WF" ],
            682: [ "CK" ],
            683: [ "NU" ],
            685: [ "WS" ],
            686: [ "KI" ],
            687: [ "NC" ],
            688: [ "TV" ],
            689: [ "PF" ],
            690: [ "TK" ],
            691: [ "FM" ],
            692: [ "MH" ],
            800: [ "001" ],
            808: [ "001" ],
            850: [ "KP" ],
            852: [ "HK" ],
            853: [ "MO" ],
            855: [ "KH" ],
            856: [ "LA" ],
            870: [ "001" ],
            878: [ "001" ],
            880: [ "BD" ],
            881: [ "001" ],
            882: [ "001" ],
            883: [ "001" ],
            886: [ "TW" ],
            888: [ "001" ],
            960: [ "MV" ],
            961: [ "LB" ],
            962: [ "JO" ],
            963: [ "SY" ],
            964: [ "IQ" ],
            965: [ "KW" ],
            966: [ "SA" ],
            967: [ "YE" ],
            968: [ "OM" ],
            970: [ "PS" ],
            971: [ "AE" ],
            972: [ "IL" ],
            973: [ "BH" ],
            974: [ "QA" ],
            975: [ "BT" ],
            976: [ "MN" ],
            977: [ "NP" ],
            979: [ "001" ],
            992: [ "TJ" ],
            993: [ "TM" ],
            994: [ "AZ" ],
            995: [ "GE" ],
            996: [ "KG" ],
            998: [ "UZ" ]
        }, va = {
            AC: [ , [ , , "(?:[01589]\\d|[46])\\d{4}", , , , , , , [ 5, 6 ] ], [ , , "6[2-467]\\d{3}", , , , "62889", , , [ 5 ] ], [ , , "4\\d{4}", , , , "40123", , , [ 5 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AC", 247, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:0[1-9]|[1589]\\d)\\d{4}", , , , "542011", , , [ 6 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AD: [ , [ , , "(?:1|6\\d)\\d{7}|[135-9]\\d{5}", , , , , , , [ 6, 8, 9 ] ], [ , , "[78]\\d{5}", , , , "712345", , , [ 6 ] ], [ , , "690\\d{6}|[356]\\d{5}", , , , "312345", , , [ 6, 9 ] ], [ , , "180[02]\\d{4}", , , , "18001234", , , [ 8 ] ], [ , , "[19]\\d{5}", , , , "912345", , , [ 6 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AD", 376, "00", , , , , , , , [ [ , "(\\d{3})(\\d{3})", "$1 $2", [ "[135-9]" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "1" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "6" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "1800\\d{4}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AE: [ , [ , , "(?:[4-7]\\d|9[0-689])\\d{7}|800\\d{2,9}|[2-4679]\\d{7}", , , , , , , [ 5, 6, 7, 8, 9, 10, 11, 12 ] ], [ , , "[2-4679][2-8]\\d{6}", , , , "22345678", , , [ 8 ], [ 7 ] ], [ , , "5[024-68]\\d{7}", , , , "501234567", , , [ 9 ] ], [ , , "400\\d{6}|800\\d{2,9}", , , , "800123456" ], [ , , "900[02]\\d{5}", , , , "900234567", , , [ 9 ] ], [ , , "700[05]\\d{5}", , , , "700012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AE", 971, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2,9})", "$1 $2", [ "60|8" ] ], [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "[236]|[479][2-8]" ], "0$1" ], [ , "(\\d{3})(\\d)(\\d{5})", "$1 $2 $3", [ "[479]" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "5" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "600[25]\\d{5}", , , , "600212345", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AF: [ , [ , , "[2-7]\\d{8}", , , , , , , [ 9 ], [ 7 ] ], [ , , "(?:[25][0-8]|[34][0-4]|6[0-5])[2-9]\\d{6}", , , , "234567890", , , , [ 7 ] ], [ , , "7\\d{8}", , , , "701234567", , , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AF", 93, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[1-9]" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2-7]" ], "0$1" ] ], [ [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2-7]" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AG: [ , [ , , "(?:268|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}", , , , "2684601234", , , , [ 7 ] ], [ , , "268(?:464|7(?:1[3-9]|[28]\\d|3[0246]|64|7[0-689]))\\d{4}", , , , "2684641234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , "26848[01]\\d{4}", , , , "2684801234", , , , [ 7 ] ], "AG", 1, "011", "1", , , "1|([457]\\d{6})$", "268$1", , , , , [ , , "26840[69]\\d{4}", , , , "2684061234", , , , [ 7 ] ], , "268", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AI: [ , [ , , "(?:264|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "264(?:292|4(?:6[12]|9[78]))\\d{4}", , , , "2644612345", , , , [ 7 ] ], [ , , "264(?:235|4(?:69|76)|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}", , , , "2642351234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "AI", 1, "011", "1", , , "1|([2457]\\d{6})$", "264$1", , , , , [ , , "264724\\d{4}", , , , "2647241234", , , , [ 7 ] ], , "264", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AL: [ , [ , , "(?:700\\d\\d|900)\\d{3}|8\\d{5,7}|(?:[2-5]|6\\d)\\d{7}", , , , , , , [ 6, 7, 8, 9 ], [ 5 ] ], [ , , "4505[0-2]\\d{3}|(?:[2358][16-9]\\d[2-9]|4410)\\d{4}|(?:[2358][2-5][2-9]|4(?:[2-57-9][2-9]|6\\d))\\d{5}", , , , "22345678", , , [ 8 ], [ 5, 6, 7 ] ], [ , , "6(?:[78][2-9]|9\\d)\\d{6}", , , , "672123456", , , [ 9 ] ], [ , , "800\\d{4}", , , , "8001234", , , [ 7 ] ], [ , , "900[1-9]\\d\\d", , , , "900123", , , [ 6 ] ], [ , , "808[1-9]\\d\\d", , , , "808123", , , [ 6 ] ], [ , , "700[2-9]\\d{4}", , , , "70021234", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], "AL", 355, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3,4})", "$1 $2", [ "80|9" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "4[2-6]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2358][2-5]|4" ], "0$1" ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "[23578]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "6" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AM: [ , [ , , "(?:[1-489]\\d|55|60|77)\\d{6}", , , , , , , [ 8 ], [ 5, 6 ] ], [ , , "(?:(?:1[0-25]|47)\\d|2(?:2[2-46]|3[1-8]|4[2-69]|5[2-7]|6[1-9]|8[1-7])|3[12]2)\\d{5}", , , , "10123456", , , , [ 5, 6 ] ], [ , , "(?:33|4[1349]|55|77|88|9[13-9])\\d{6}", , , , "77123456" ], [ , , "800\\d{5}", , , , "80012345" ], [ , , "90[016]\\d{5}", , , , "90012345" ], [ , , "80[1-4]\\d{5}", , , , "80112345" ], [ , , , , , , , , , [ -1 ] ], [ , , "60(?:2[78]|3[5-9]|4[02-9]|5[0-46-9]|[6-8]\\d|9[01])\\d{4}", , , , "60271234" ], "AM", 374, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "[89]0" ], "0 $1" ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "2|3[12]" ], "(0$1)" ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "1|47" ], "(0$1)" ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "[3-9]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AO: [ , [ , , "[29]\\d{8}", , , , , , , [ 9 ] ], [ , , "2\\d(?:[0134][25-9]|[25-9]\\d)\\d{5}", , , , "222123456" ], [ , , "9[1-49]\\d{7}", , , , "923123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AO", 244, "00", , , , , , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[29]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AR: [ , [ , , "(?:11|[89]\\d\\d)\\d{8}|[2368]\\d{9}", , , , , , , [ 10, 11 ], [ 6, 7, 8 ] ], [ , , "3888[013-9]\\d{5}|(?:29(?:54|66)|3(?:777|865))[2-8]\\d{5}|3(?:7(?:1[15]|81)|8(?:21|4[16]|69|9[12]))[46]\\d{5}|(?:2(?:2(?:2[59]|44|52)|3(?:26|44)|473|9(?:[07]2|2[26]|34|46))|3327)[45]\\d{5}|(?:2(?:284|302|657|920)|3(?:4(?:8[27]|92)|541|755|878))[2-7]\\d{5}|(?:2(?:(?:26|62)2|32[03]|477|9(?:42|83))|3(?:329|4(?:[47]6|62|89)|564))[2-6]\\d{5}|(?:(?:11[1-8]|670)\\d|2(?:2(?:0[45]|1[2-6]|3[3-6])|3(?:[06]4|7[45])|494|6(?:04|1[2-8]|[36][45]|4[3-6])|80[45]|9(?:[17][4-6]|[48][45]|9[3-6]))|3(?:364|4(?:1[2-7]|[235][4-6]|84)|5(?:1[2-8]|[38][4-6])|6(?:2[45]|44)|7[069][45]|8(?:[03][45]|[17][2-6]|[58][3-6])))\\d{6}|2(?:2(?:21|4[23]|6[145]|7[1-4]|8[356]|9[267])|3(?:16|3[13-8]|43|5[346-8]|9[3-5])|475|6(?:2[46]|4[78]|5[1568])|9(?:03|2[1457-9]|3[1356]|4[08]|[56][23]|82))4\\d{5}|(?:2(?:2(?:57|81)|3(?:24|46|92)|9(?:01|23|64))|3(?:4(?:42|71)|5(?:25|37|4[347]|71)|7(?:18|5[17])))[3-6]\\d{5}|(?:2(?:2(?:02|2[3467]|4[156]|5[45]|6[6-8]|91)|3(?:1[47]|25|[45][25]|96)|47[48]|625|932)|3(?:38[2578]|4(?:0[0-24-9]|3[78]|4[457]|58|6[03-9]|72|83|9[136-8])|5(?:2[124]|[368][23]|4[2689]|7[2-6])|7(?:16|2[15]|3[145]|4[13]|5[468]|7[2-5]|8[26])|8(?:2[5-7]|3[278]|4[3-5]|5[78]|6[1-378]|[78]7|94)))[4-6]\\d{5}", , , , "1123456789", , , [ 10 ], [ 6, 7, 8 ] ], [ , , "93888[013-9]\\d{5}|9(?:29(?:54|66)|3(?:777|865))[2-8]\\d{5}|93(?:7(?:1[15]|81)|8(?:21|4[16]|69|9[12]))[46]\\d{5}|9(?:2(?:2(?:2[59]|44|52)|3(?:26|44)|473|9(?:[07]2|2[26]|34|46))|3327)[45]\\d{5}|9(?:2(?:284|302|657|920)|3(?:4(?:8[27]|92)|541|755|878))[2-7]\\d{5}|9(?:2(?:(?:26|62)2|32[03]|477|9(?:42|83))|3(?:329|4(?:[47]6|62|89)|564))[2-6]\\d{5}|(?:675\\d|9(?:11[1-8]\\d|2(?:2(?:0[45]|1[2-6]|3[3-6])|3(?:[06]4|7[45])|494|6(?:04|1[2-8]|[36][45]|4[3-6])|80[45]|9(?:[17][4-6]|[48][45]|9[3-6]))|3(?:364|4(?:1[2-7]|[235][4-6]|84)|5(?:1[2-8]|[38][4-6])|6(?:2[45]|44)|7[069][45]|8(?:[03][45]|[17][2-6]|[58][3-6]))))\\d{6}|92(?:2(?:21|4[23]|6[145]|7[1-4]|8[356]|9[267])|3(?:16|3[13-8]|43|5[346-8]|9[3-5])|475|6(?:2[46]|4[78]|5[1568])|9(?:03|2[1457-9]|3[1356]|4[08]|[56][23]|82))4\\d{5}|9(?:2(?:2(?:57|81)|3(?:24|46|92)|9(?:01|23|64))|3(?:4(?:42|71)|5(?:25|37|4[347]|71)|7(?:18|5[17])))[3-6]\\d{5}|9(?:2(?:2(?:02|2[3467]|4[156]|5[45]|6[6-8]|91)|3(?:1[47]|25|[45][25]|96)|47[48]|625|932)|3(?:38[2578]|4(?:0[0-24-9]|3[78]|4[457]|58|6[03-9]|72|83|9[136-8])|5(?:2[124]|[368][23]|4[2689]|7[2-6])|7(?:16|2[15]|3[145]|4[13]|5[468]|7[2-5]|8[26])|8(?:2[5-7]|3[278]|4[3-5]|5[78]|6[1-378]|[78]7|94)))[4-6]\\d{5}", , , , "91123456789", , , , [ 6, 7, 8 ] ], [ , , "800\\d{7,8}", , , , "8001234567" ], [ , , "60[04579]\\d{7}", , , , "6001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AR", 54, "00", "0", , , "0?(?:(11|2(?:2(?:02?|[13]|2[13-79]|4[1-6]|5[2457]|6[124-8]|7[1-4]|8[13-6]|9[1267])|3(?:02?|1[467]|2[03-6]|3[13-8]|[49][2-6]|5[2-8]|[67])|4(?:7[3-578]|9)|6(?:[0136]|2[24-6]|4[6-8]?|5[15-8])|80|9(?:0[1-3]|[19]|2\\d|3[1-6]|4[02568]?|5[2-4]|6[2-46]|72?|8[23]?))|3(?:3(?:2[79]|6|8[2578])|4(?:0[0-24-9]|[12]|3[5-8]?|4[24-7]|5[4-68]?|6[02-9]|7[126]|8[2379]?|9[1-36-8])|5(?:1|2[1245]|3[237]?|4[1-46-9]|6[2-4]|7[1-6]|8[2-5]?)|6[24]|7(?:[069]|1[1568]|2[15]|3[145]|4[13]|5[14-8]|7[2-57]|8[126])|8(?:[01]|2[15-7]|3[2578]?|4[13-6]|5[4-8]?|6[1-357-9]|7[36-8]?|8[5-8]?|9[124])))15)?", "9$1", , , [ [ , "(\\d{3})", "$1", [ "0|1(?:0[0-35-7]|1[02-5]|2[015]|3[47]|4[478])|911" ] ], [ , "(\\d{2})(\\d{4})", "$1-$2", [ "[1-9]" ] ], [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[2-8]" ] ], [ , "(\\d{4})(\\d{4})", "$1-$2", [ "[1-8]" ] ], [ , "(\\d{4})(\\d{2})(\\d{4})", "$1 $2-$3", [ "2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9])", "2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8]))|2(?:2[24-9]|3[1-59]|47)", "2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5[56][46]|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]", "2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|58|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|54(?:4|5[13-7]|6[89])|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:454|85[56])[46]|3(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]" ], "0$1", , 1 ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2-$3", [ "1" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", [ "[68]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2-$3", [ "[23]" ], "0$1", , 1 ], [ , "(\\d)(\\d{4})(\\d{2})(\\d{4})", "$2 15-$3-$4", [ "9(?:2[2-469]|3[3-578])", "9(?:2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9]))", "9(?:2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8])))|92(?:2[24-9]|3[1-59]|47)", "9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5(?:[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]", "9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|5(?:4(?:4|5[13-7]|6[89])|[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]" ], "0$1" ], [ , "(\\d)(\\d{2})(\\d{4})(\\d{4})", "$2 15-$3-$4", [ "91" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{5})", "$1-$2-$3", [ "8" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{4})", "$2 15-$3-$4", [ "9" ], "0$1" ] ], [ [ , "(\\d{4})(\\d{2})(\\d{4})", "$1 $2-$3", [ "2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9])", "2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8]))|2(?:2[24-9]|3[1-59]|47)", "2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5[56][46]|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]", "2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|58|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|54(?:4|5[13-7]|6[89])|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:454|85[56])[46]|3(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]" ], "0$1", , 1 ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2-$3", [ "1" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", [ "[68]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2-$3", [ "[23]" ], "0$1", , 1 ], [ , "(\\d)(\\d{4})(\\d{2})(\\d{4})", "$1 $2 $3-$4", [ "9(?:2[2-469]|3[3-578])", "9(?:2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9]))", "9(?:2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8])))|92(?:2[24-9]|3[1-59]|47)", "9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5(?:[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]", "9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|5(?:4(?:4|5[13-7]|6[89])|[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]" ] ], [ , "(\\d)(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3-$4", [ "91" ] ], [ , "(\\d{3})(\\d{3})(\\d{5})", "$1-$2-$3", [ "8" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3-$4", [ "9" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "810\\d{7}", , , , , , , [ 10 ] ], [ , , "810\\d{7}", , , , "8101234567", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AS: [ , [ , , "(?:[58]\\d\\d|684|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "6846(?:22|33|44|55|77|88|9[19])\\d{4}", , , , "6846221234", , , , [ 7 ] ], [ , , "684(?:2(?:48|5[2468]|72)|7(?:3[13]|70|82))\\d{4}", , , , "6847331234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "AS", 1, "011", "1", , , "1|([267]\\d{6})$", "684$1", , , , , [ , , , , , , , , , [ -1 ] ], , "684", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AT: [ , [ , , "1\\d{3,12}|2\\d{6,12}|43(?:(?:0\\d|5[02-9])\\d{3,9}|2\\d{4,5}|[3467]\\d{4}|8\\d{4,6}|9\\d{4,7})|5\\d{4,12}|8\\d{7,12}|9\\d{8,12}|(?:[367]\\d|4[0-24-9])\\d{4,11}", , , , , , , [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ], [ 3 ] ], [ , , "1(?:11\\d|[2-9]\\d{3,11})|(?:316|463|(?:51|66|73)2)\\d{3,10}|(?:2(?:1[467]|2[13-8]|5[2357]|6[1-46-8]|7[1-8]|8[124-7]|9[1458])|3(?:1[1-578]|3[23568]|4[5-7]|5[1378]|6[1-38]|8[3-68])|4(?:2[1-8]|35|7[1368]|8[2457])|5(?:2[1-8]|3[357]|4[147]|5[12578]|6[37])|6(?:13|2[1-47]|4[135-8]|5[468])|7(?:2[1-8]|35|4[13478]|5[68]|6[16-8]|7[1-6]|9[45]))\\d{4,10}", , , , "1234567890", , , , [ 3 ] ], [ , , "6(?:5[0-3579]|6[013-9]|[7-9]\\d)\\d{4,10}", , , , "664123456", , , [ 7, 8, 9, 10, 11, 12, 13 ] ], [ , , "800\\d{6,10}", , , , "800123456", , , [ 9, 10, 11, 12, 13 ] ], [ , , "(?:8[69][2-68]|9(?:0[01]|3[019]))\\d{6,10}", , , , "900123456", , , [ 9, 10, 11, 12, 13 ] ], [ , , "8(?:10|2[018])\\d{6,10}|828\\d{5}", , , , "810123456", , , [ 8, 9, 10, 11, 12, 13 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "5(?:0[1-9]|17|[79]\\d)\\d{2,10}|7[28]0\\d{6,10}", , , , "780123456", , , [ 5, 6, 7, 8, 9, 10, 11, 12, 13 ] ], "AT", 43, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3,12})", "$1 $2", [ "1(?:11|[2-9])" ], "0$1" ], [ , "(\\d{3})(\\d{2})", "$1 $2", [ "517" ], "0$1" ], [ , "(\\d{2})(\\d{3,5})", "$1 $2", [ "5[079]" ], "0$1" ], [ , "(\\d{6})", "$1", [ "1" ] ], [ , "(\\d{3})(\\d{3,10})", "$1 $2", [ "(?:31|4)6|51|6(?:5[0-3579]|[6-9])|7(?:20|32|8)|[89]" ], "0$1" ], [ , "(\\d{4})(\\d{3,9})", "$1 $2", [ "[2-467]|5[2-6]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "5" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4,7})", "$1 $2 $3", [ "5" ], "0$1" ] ], [ [ , "(\\d)(\\d{3,12})", "$1 $2", [ "1(?:11|[2-9])" ], "0$1" ], [ , "(\\d{3})(\\d{2})", "$1 $2", [ "517" ], "0$1" ], [ , "(\\d{2})(\\d{3,5})", "$1 $2", [ "5[079]" ], "0$1" ], [ , "(\\d{3})(\\d{3,10})", "$1 $2", [ "(?:31|4)6|51|6(?:5[0-3579]|[6-9])|7(?:20|32|8)|[89]" ], "0$1" ], [ , "(\\d{4})(\\d{3,9})", "$1 $2", [ "[2-467]|5[2-6]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "5" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4,7})", "$1 $2 $3", [ "5" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AU: [ , [ , , "1(?:[0-79]\\d{7}(?:\\d(?:\\d{2})?)?|8[0-24-9]\\d{7})|[2-478]\\d{8}|1\\d{4,7}", , , , , , , [ 5, 6, 7, 8, 9, 10, 12 ] ], [ , , "(?:(?:2(?:[0-26-9]\\d|3[0-8]|4[02-9]|5[0135-9])|3(?:[0-3589]\\d|4[0-578]|6[1-9]|7[0-35-9])|7(?:[013-57-9]\\d|2[0-8]))\\d{3}|8(?:51(?:0(?:0[03-9]|[12479]\\d|3[2-9]|5[0-8]|6[1-9]|8[0-7])|1(?:[0235689]\\d|1[0-69]|4[0-589]|7[0-47-9])|2(?:0[0-79]|[18][13579]|2[14-9]|3[0-46-9]|[4-6]\\d|7[89]|9[0-4]))|(?:6[0-8]|[78]\\d)\\d{3}|9(?:[02-9]\\d{3}|1(?:(?:[0-58]\\d|6[0135-9])\\d|7(?:0[0-24-9]|[1-9]\\d)|9(?:[0-46-9]\\d|5[0-79])))))\\d{3}", , , , "212345678", , , [ 9 ], [ 8 ] ], [ , , "4(?:83[0-38]|93[0-6])\\d{5}|4(?:[0-3]\\d|4[047-9]|5[0-25-9]|6[06-9]|7[02-9]|8[0-24-9]|9[0-27-9])\\d{6}", , , , "412345678", , , [ 9 ] ], [ , , "180(?:0\\d{3}|2)\\d{3}", , , , "1800123456", , , [ 7, 10 ] ], [ , , "190[0-26]\\d{6}", , , , "1900123456", , , [ 10 ] ], [ , , "13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}", , , , "1300123456", , , [ 6, 8, 10, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}", , , , "147101234", , , [ 9 ] ], "AU", 61, "001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011", "0", , , "0|(183[12])", , "0011", , [ [ , "(\\d{2})(\\d{3,4})", "$1 $2", [ "16" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", [ "13" ] ], [ , "(\\d{3})(\\d{3})", "$1 $2", [ "19" ] ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "180", "1802" ] ], [ , "(\\d{4})(\\d{3,4})", "$1 $2", [ "19" ] ], [ , "(\\d{2})(\\d{3})(\\d{2,4})", "$1 $2 $3", [ "16" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "14|4" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "[2378]" ], "(0$1)", "$CC ($1)" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1(?:30|[89])" ] ], [ , "(\\d{4})(\\d{4})(\\d{4})", "$1 $2 $3", [ "130" ] ] ], [ [ , "(\\d{2})(\\d{3,4})", "$1 $2", [ "16" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2,4})", "$1 $2 $3", [ "16" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "14|4" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "[2378]" ], "(0$1)", "$CC ($1)" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1(?:30|[89])" ] ] ], [ , , "163\\d{2,6}", , , , "1631234", , , [ 5, 6, 7, 8, 9 ] ], 1, , [ , , "1(?:3(?:00\\d{5}|45[0-4])|802)\\d{3}|1[38]00\\d{6}|13\\d{4}", , , , , , , [ 6, 7, 8, 10, 12 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AW: [ , [ , , "(?:[25-79]\\d\\d|800)\\d{4}", , , , , , , [ 7 ] ], [ , , "5(?:2\\d|8[1-9])\\d{4}", , , , "5212345" ], [ , , "(?:290|5[69]\\d|6(?:[03]0|22|4[0-2]|[69]\\d)|7(?:[34]\\d|7[07])|9(?:6[45]|9[4-8]))\\d{4}", , , , "5601234" ], [ , , "800\\d{4}", , , , "8001234" ], [ , , "900\\d{4}", , , , "9001234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:28\\d|501)\\d{4}", , , , "5011234" ], "AW", 297, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[25-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            AX: [ , [ , , "2\\d{4,9}|35\\d{4,5}|(?:60\\d\\d|800)\\d{4,6}|7\\d{5,11}|(?:[14]\\d|3[0-46-9]|50)\\d{4,8}", , , , , , , [ 5, 6, 7, 8, 9, 10, 11, 12 ] ], [ , , "18[1-8]\\d{3,6}", , , , "181234567", , , [ 6, 7, 8, 9 ] ], [ , , "4946\\d{2,6}|(?:4[0-8]|50)\\d{4,8}", , , , "412345678", , , [ 6, 7, 8, 9, 10 ] ], [ , , "800\\d{4,6}", , , , "800123456", , , [ 7, 8, 9 ] ], [ , , "[67]00\\d{5,6}", , , , "600123456", , , [ 8, 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AX", 358, "00|99(?:[01469]|5(?:[14]1|3[23]|5[59]|77|88|9[09]))", "0", , , "0", , "00", , , , [ , , , , , , , , , [ -1 ] ], , "18", [ , , , , , , , , , [ -1 ] ], [ , , "20\\d{4,8}|60[12]\\d{5,6}|7(?:099\\d{4,5}|5[03-9]\\d{3,7})|20[2-59]\\d\\d|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:10|29|3[09]|70[1-5]\\d)\\d{4,8}", , , , "10112345" ], , , [ , , , , , , , , , [ -1 ] ] ],
            AZ: [ , [ , , "365\\d{6}|(?:[124579]\\d|60|88)\\d{7}", , , , , , , [ 9 ], [ 7 ] ], [ , , "(?:2[12]428|3655[02])\\d{4}|(?:2(?:22[0-79]|63[0-28])|3654)\\d{5}|(?:(?:1[28]|46)\\d|2(?:[014-6]2|[23]3))\\d{6}", , , , "123123456", , , , [ 7 ] ], [ , , "36554\\d{4}|(?:[16]0|4[04]|5[015]|7[07]|99)\\d{7}", , , , "401234567" ], [ , , "88\\d{7}", , , , "881234567" ], [ , , "900200\\d{3}", , , , "900200123" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "AZ", 994, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", [ "[1-9]" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "90" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "1[28]|2|365|46", "1[28]|2|365[45]|46", "1[28]|2|365(?:4|5[02])|46" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[13-9]" ], "0$1" ] ], [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "90" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "1[28]|2|365|46", "1[28]|2|365[45]|46", "1[28]|2|365(?:4|5[02])|46" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[13-9]" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BA: [ , [ , , "6\\d{8}|(?:[35689]\\d|49|70)\\d{6}", , , , , , , [ 8, 9 ], [ 6 ] ], [ , , "(?:3(?:[05-79][2-9]|1[4579]|[23][24-9]|4[2-4689]|8[2457-9])|49[2-579]|5(?:0[2-49]|[13][2-9]|[268][2-4679]|4[4689]|5[2-79]|7[2-69]|9[2-4689]))\\d{5}", , , , "30212345", , , [ 8 ], [ 6 ] ], [ , , "6040\\d{5}|6(?:03|[1-356]|44|7\\d)\\d{6}", , , , "61123456" ], [ , , "8[08]\\d{6}", , , , "80123456", , , [ 8 ] ], [ , , "9[0246]\\d{6}", , , , "90123456", , , [ 8 ] ], [ , , "8[12]\\d{6}", , , , "82123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BA", 387, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})", "$1-$2", [ "[2-9]" ] ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "6[1-3]|[7-9]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2-$3", [ "[3-5]|6[56]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "6" ], "0$1" ] ], [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "6[1-3]|[7-9]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2-$3", [ "[3-5]|6[56]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "6" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "703[235]0\\d{3}|70(?:2[0-5]|3[0146]|[56]0)\\d{4}", , , , "70341234", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BB: [ , [ , , "(?:246|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "246(?:2(?:2[78]|7[0-4])|4(?:1[024-6]|2\\d|3[2-9])|5(?:20|[34]\\d|54|7[1-3])|6(?:2\\d|38)|7[35]7|9(?:1[89]|63))\\d{4}", , , , "2464123456", , , , [ 7 ] ], [ , , "246(?:2(?:[3568]\\d|4[0-57-9])|45\\d|69[5-7]|8(?:[2-5]\\d|83))\\d{4}", , , , "2462501234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "(?:246976|900[2-9]\\d\\d)\\d{4}", , , , "9002123456", , , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , "24631\\d{5}", , , , "2463101234", , , , [ 7 ] ], "BB", 1, "011", "1", , , "1|([2-9]\\d{6})$", "246$1", , , , , [ , , , , , , , , , [ -1 ] ], , "246", [ , , , , , , , , , [ -1 ] ], [ , , "246(?:292|367|4(?:1[7-9]|3[01]|44|67)|7(?:36|53))\\d{4}", , , , "2464301234", , , , [ 7 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BD: [ , [ , , "[1-469]\\d{9}|8[0-79]\\d{7,8}|[2-79]\\d{8}|[2-9]\\d{7}|[3-9]\\d{6}|[57-9]\\d{5}", , , , , , , [ 6, 7, 8, 9, 10 ] ], [ , , "(?:4(?:31\\d\\d|423)|5222)\\d{3}(?:\\d{2})?|8332[6-9]\\d\\d|(?:3(?:03[56]|224)|4(?:22[25]|653))\\d{3,4}|(?:3(?:42[47]|529|823)|4(?:027|525|65(?:28|8))|562|6257|7(?:1(?:5[3-5]|6[12]|7[156]|89)|22[589]56|32|42675|52(?:[25689](?:56|8)|[347]8)|71(?:6[1267]|75|89)|92374)|82(?:2[59]|32)56|9(?:03[23]56|23(?:256|373)|31|5(?:1|2[4589]56)))\\d{3}|(?:3(?:02[348]|22[35]|324|422)|4(?:22[67]|32[236-9]|6(?:2[46]|5[57])|953)|5526|6(?:024|6655)|81)\\d{4,5}|(?:2(?:7(?:1[0-267]|2[0-289]|3[0-29]|4[01]|5[1-3]|6[013]|7[0178]|91)|8(?:0[125]|1[1-6]|2[0157-9]|3[1-69]|41|6[1-35]|7[1-5]|8[1-8]|9[0-6])|9(?:0[0-2]|1[0-4]|2[568]|3[3-6]|5[5-7]|6[0136-9]|7[0-7]|8[014-9]))|3(?:0(?:2[025-79]|3[2-4])|181|22[12]|32[2356]|824)|4(?:02[09]|22[348]|32[045]|523|6(?:27|54))|666(?:22|53)|7(?:22[57-9]|42[56]|82[35])8|8(?:0[124-9]|2(?:181|2[02-4679]8)|4[12]|[5-7]2)|9(?:[04]2|2(?:2|328)|81))\\d{4}|(?:2(?:222|[45]\\d)\\d|3(?:1(?:2[5-7]|[5-7])|425|822)|4(?:033|1\\d|[257]1|332|4(?:2[246]|5[25])|6(?:2[35]|56|62)|8(?:23|54)|92[2-5])|5(?:02[03489]|22[457]|32[35-79]|42[46]|6(?:[18]|53)|724|826)|6(?:023|2(?:2[2-5]|5[3-5]|8)|32[3478]|42[34]|52[47]|6(?:[18]|6(?:2[34]|5[24]))|[78]2[2-5]|92[2-6])|7(?:02|21\\d|[3-589]1|6[12]|72[24])|8(?:217|3[12]|[5-7]1)|9[24]1)\\d{5}|(?:(?:3[2-8]|5[2-57-9]|6[03-589])1|4[4689][18])\\d{5}|[59]1\\d{5}", , , , "27111234" ], [ , , "(?:1[13-9]\\d|644)\\d{7}|(?:3[78]|44|66)[02-9]\\d{7}", , , , "1812345678", , , [ 10 ] ], [ , , "80[03]\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "96(?:0[469]|1[0-47]|3[389]|6[69]|7[78])\\d{6}", , , , "9604123456", , , [ 10 ] ], "BD", 880, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{4,6})", "$1-$2", [ "31[5-8]|[459]1" ], "0$1" ], [ , "(\\d{3})(\\d{3,7})", "$1-$2", [ "3(?:[67]|8[013-9])|4(?:6[168]|7|[89][18])|5(?:6[128]|9)|6(?:28|4[14]|5)|7[2-589]|8(?:0[014-9]|[12])|9[358]|(?:3[2-5]|4[235]|5[2-578]|6[0389]|76|8[3-7]|9[24])1|(?:44|66)[01346-9]" ], "0$1" ], [ , "(\\d{4})(\\d{3,6})", "$1-$2", [ "[13-9]|22" ], "0$1" ], [ , "(\\d)(\\d{7,8})", "$1-$2", [ "2" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BE: [ , [ , , "4\\d{8}|[1-9]\\d{7}", , , , , , , [ 8, 9 ] ], [ , , "80[2-8]\\d{5}|(?:1[0-69]|[23][2-8]|4[23]|5\\d|6[013-57-9]|71|8[1-79]|9[2-4])\\d{6}", , , , "12345678", , , [ 8 ] ], [ , , "4[5-9]\\d{7}", , , , "470123456", , , [ 9 ] ], [ , , "800[1-9]\\d{4}", , , , "80012345", , , [ 8 ] ], [ , , "(?:70(?:2[0-57]|3[04-7]|44|69|7[0579])|90(?:0[0-8]|1[36]|2[0-3568]|3[013-689]|[47][2-68]|5[1-68]|6[0-378]|9[34679]))\\d{4}", , , , "90012345", , , [ 8 ] ], [ , , "7879\\d{4}", , , , "78791234", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BE", 32, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "(?:80|9)0" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[239]|4[23]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[15-8]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "4" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "78(?:0[57]|1[0458]|2[25]|3[15-8]|48|[56]0|7[078]|9\\d)\\d{4}", , , , "78102345", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BF: [ , [ , , "[025-7]\\d{7}", , , , , , , [ 8 ] ], [ , , "2(?:0(?:49|5[23]|6[56]|9[016-9])|4(?:4[569]|5[4-6]|6[56]|7[0179])|5(?:[34]\\d|50|6[5-7]))\\d{4}", , , , "20491234" ], [ , , "(?:0[1267]|5[1-8]|[67]\\d)\\d{6}", , , , "70123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BF", 226, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[025-7]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BG: [ , [ , , "[2-7]\\d{6,7}|[89]\\d{6,8}|2\\d{5}", , , , , , , [ 6, 7, 8, 9 ], [ 4, 5 ] ], [ , , "2\\d{5,7}|(?:43[1-6]|70[1-9])\\d{4,5}|(?:[36]\\d|4[124-7]|[57][1-9]|8[1-6]|9[1-7])\\d{5,6}", , , , "2123456", , , [ 6, 7, 8 ], [ 4, 5 ] ], [ , , "43[07-9]\\d{5}|(?:48|8[7-9]\\d|9(?:8\\d|9[69]))\\d{6}", , , , "48123456", , , [ 8, 9 ] ], [ , , "800\\d{5}", , , , "80012345", , , [ 8 ] ], [ , , "90\\d{6}", , , , "90123456", , , [ 8 ] ], [ , , "700\\d{5}", , , , "70012345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BG", 359, "00", "0", , , "0", , , , [ [ , "(\\d{6})", "$1", [ "1" ] ], [ , "(\\d)(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "2" ], "0$1" ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "43[1-6]|70[1-9]" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2,3})", "$1 $2 $3", [ "[356]|4[124-7]|7[1-9]|8[1-6]|9[1-7]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "(?:70|8)0" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3", [ "43[1-7]|7" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[48]|9[08]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "9" ], "0$1" ] ], [ [ , "(\\d)(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "2" ], "0$1" ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "43[1-6]|70[1-9]" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2,3})", "$1 $2 $3", [ "[356]|4[124-7]|7[1-9]|8[1-6]|9[1-7]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "(?:70|8)0" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3", [ "43[1-7]|7" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[48]|9[08]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "9" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BH: [ , [ , , "[136-9]\\d{7}", , , , , , , [ 8 ] ], [ , , "(?:1(?:3[1356]|6[0156]|7\\d)\\d|6(?:1[16]\\d|500|6(?:0\\d|3[12]|44|7[7-9]|88)|9[69][69])|7(?:1(?:11|78)|7\\d\\d))\\d{4}", , , , "17001234" ], [ , , "(?:3(?:[1-79]\\d|8[0-47-9])\\d|6(?:3(?:00|33|6[16])|6(?:3[03-9]|[69]\\d|7[0-6])))\\d{4}", , , , "36001234" ], [ , , "80\\d{6}", , , , "80123456" ], [ , , "(?:87|9[014578])\\d{6}", , , , "90123456" ], [ , , "84\\d{6}", , , , "84123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BH", 973, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[13679]|8[047]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BI: [ , [ , , "(?:[267]\\d|31)\\d{6}", , , , , , , [ 8 ] ], [ , , "22\\d{6}", , , , "22201234" ], [ , , "(?:29|31|6[1257-9]|7[125-9])\\d{6}", , , , "79561234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BI", 257, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2367]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BJ: [ , [ , , "[25689]\\d{7}", , , , , , , [ 8 ] ], [ , , "2(?:02|1[037]|2[45]|3[68])\\d{5}", , , , "20211234" ], [ , , "(?:5[1-35-8]|6\\d|9[013-9])\\d{6}", , , , "90011234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "857[58]\\d{4}", , , , "85751234" ], "BJ", 229, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[25689]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "81\\d{6}", , , , "81123456" ], , , [ , , , , , , , , , [ -1 ] ] ],
            BL: [ , [ , , "(?:590|(?:69|80)\\d|976)\\d{6}", , , , , , , [ 9 ] ], [ , , "590(?:2[7-9]|5[12]|87)\\d{4}", , , , "590271234" ], [ , , "69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))\\d{4}", , , , "690001234" ], [ , , "80[0-5]\\d{6}", , , , "800012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "976[01]\\d{5}", , , , "976012345" ], "BL", 590, "00", "0", , , "0", , , , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BM: [ , [ , , "(?:441|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "441(?:[46]\\d\\d|5(?:4\\d|60|89))\\d{4}", , , , "4414123456", , , , [ 7 ] ], [ , , "441(?:[2378]\\d|5[0-39])\\d{5}", , , , "4413701234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "BM", 1, "011", "1", , , "1|([2-8]\\d{6})$", "441$1", , , , , [ , , , , , , , , , [ -1 ] ], , "441", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BN: [ , [ , , "[2-578]\\d{6}", , , , , , , [ 7 ] ], [ , , "22[0-7]\\d{4}|(?:2[013-9]|[34]\\d|5[0-25-9])\\d{5}", , , , "2345678" ], [ , , "(?:22[89]|[78]\\d\\d)\\d{4}", , , , "7123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "5[34]\\d{5}", , , , "5345678" ], "BN", 673, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[2-578]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BO: [ , [ , , "(?:[2-467]\\d\\d|8001)\\d{5}", , , , , , , [ 8, 9 ], [ 7 ] ], [ , , "(?:2(?:2\\d\\d|5(?:11|[258]\\d|9[67])|6(?:12|2\\d|9[34])|8(?:2[34]|39|62))|3(?:3\\d\\d|4(?:6\\d|8[24])|8(?:25|42|5[257]|86|9[25])|9(?:[27]\\d|3[2-4]|4[248]|5[24]|6[2-6]))|4(?:4\\d\\d|6(?:11|[24689]\\d|72)))\\d{4}", , , , "22123456", , , [ 8 ], [ 7 ] ], [ , , "[67]\\d{7}", , , , "71234567", , , [ 8 ] ], [ , , "8001[07]\\d{4}", , , , "800171234", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BO", 591, "00(?:1\\d)?", "0", , , "0(1\\d)?", , , , [ [ , "(\\d)(\\d{7})", "$1 $2", [ "[23]|4[46]" ], , "0$CC $1" ], [ , "(\\d{8})", "$1", [ "[67]" ], , "0$CC $1" ], [ , "(\\d{3})(\\d{2})(\\d{4})", "$1 $2 $3", [ "8" ], , "0$CC $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "8001[07]\\d{4}", , , , , , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BQ: [ , [ , , "(?:[34]1|7\\d)\\d{5}", , , , , , , [ 7 ] ], [ , , "(?:318[023]|41(?:6[023]|70)|7(?:1[578]|2[05]|50)\\d)\\d{3}", , , , "7151234" ], [ , , "(?:31(?:8[14-8]|9[14578])|416[14-9]|7(?:0[01]|7[07]|8\\d|9[056])\\d)\\d{3}", , , , "3181234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BQ", 599, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , "[347]", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BR: [ , [ , , "(?:[1-46-9]\\d\\d|5(?:[0-46-9]\\d|5[0-24679]))\\d{8}|[1-9]\\d{9}|[3589]\\d{8}|[34]\\d{7}", , , , , , , [ 8, 9, 10, 11 ] ], [ , , "(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-5]\\d{7}", , , , "1123456789", , , [ 10 ], [ 8 ] ], [ , , "(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])(?:7|9\\d)\\d{7}", , , , "11961234567", , , [ 10, 11 ], [ 8, 9 ] ], [ , , "800\\d{6,7}", , , , "800123456", , , [ 9, 10 ] ], [ , , "300\\d{6}|[59]00\\d{6,7}", , , , "300123456", , , [ 9, 10 ] ], [ , , "300\\d{7}|[34]00\\d{5}|4(?:02|37)0\\d{4}", , , , "40041234", , , [ 8, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BR", 55, "00(?:1[245]|2[1-35]|31|4[13]|[56]5|99)", "0", , , "(?:0|90)(?:(1[245]|2[1-35]|31|4[13]|[56]5|99)(\\d{10,11}))?", "$2", , , [ [ , "(\\d{3,6})", "$1", [ "1(?:1[25-8]|2[357-9]|3[02-68]|4[12568]|5|6[0-8]|8[015]|9[0-47-9])|321|610" ] ], [ , "(\\d{4})(\\d{4})", "$1-$2", [ "300|4(?:0[02]|37)", "4(?:02|37)0|[34]00" ] ], [ , "(\\d{4})(\\d{4})", "$1-$2", [ "[2-57]", "[2357]|4(?:[0-24-9]|3(?:[0-689]|7[1-9]))" ] ], [ , "(\\d{3})(\\d{2,3})(\\d{4})", "$1 $2 $3", [ "(?:[358]|90)0" ], "0$1" ], [ , "(\\d{5})(\\d{4})", "$1-$2", [ "9" ] ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2-$3", [ "(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-57]" ], "($1)", "0 $CC ($1)" ], [ , "(\\d{2})(\\d{5})(\\d{4})", "$1 $2-$3", [ "[16][1-9]|[2-57-9]" ], "($1)", "0 $CC ($1)" ] ], [ [ , "(\\d{4})(\\d{4})", "$1-$2", [ "300|4(?:0[02]|37)", "4(?:02|37)0|[34]00" ] ], [ , "(\\d{3})(\\d{2,3})(\\d{4})", "$1 $2 $3", [ "(?:[358]|90)0" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2-$3", [ "(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-57]" ], "($1)", "0 $CC ($1)" ], [ , "(\\d{2})(\\d{5})(\\d{4})", "$1 $2-$3", [ "[16][1-9]|[2-57-9]" ], "($1)", "0 $CC ($1)" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "4020\\d{4}|[34]00\\d{5}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BS: [ , [ , , "(?:242|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[347]|8[0-4]|9[2-467])|461|502|6(?:0[1-4]|12|2[013]|[45]0|7[67]|8[78]|9[89])|7(?:02|88))\\d{4}", , , , "2423456789", , , , [ 7 ] ], [ , , "242(?:3(?:5[79]|7[56]|95)|4(?:[23][1-9]|4[1-35-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[45]|3[35]|44|5[1-46-9]|65|77)|6[34]6|7(?:27|38)|8(?:0[1-9]|1[02-9]|2\\d|[89]9))\\d{4}", , , , "2423591234", , , , [ 7 ] ], [ , , "242300\\d{4}|8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456", , , , [ 7 ] ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "BS", 1, "011", "1", , , "1|([3-8]\\d{6})$", "242$1", , , , , [ , , , , , , , , , [ -1 ] ], , "242", [ , , , , , , , , , [ -1 ] ], [ , , "242225\\d{4}", , , , "2422250123" ], , , [ , , , , , , , , , [ -1 ] ] ],
            BT: [ , [ , , "[17]\\d{7}|[2-8]\\d{6}", , , , , , , [ 7, 8 ], [ 6 ] ], [ , , "(?:2[3-6]|[34][5-7]|5[236]|6[2-46]|7[246]|8[2-4])\\d{5}", , , , "2345678", , , [ 7 ], [ 6 ] ], [ , , "(?:1[67]|77)\\d{6}", , , , "17123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BT", 975, "00", , , , , , , , [ [ , "(\\d{3})(\\d{3})", "$1 $2", [ "[2-7]" ] ], [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2-68]|7[246]" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "1[67]|7" ] ] ], [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2-68]|7[246]" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "1[67]|7" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BW: [ , [ , , "(?:0800|(?:[37]|800)\\d)\\d{6}|(?:[2-6]\\d|90)\\d{5}", , , , , , , [ 7, 8, 10 ] ], [ , , "(?:2(?:4[0-48]|6[0-24]|9[0578])|3(?:1[0-35-9]|55|[69]\\d|7[013])|4(?:6[03]|7[1267]|9[0-5])|5(?:3[03489]|4[0489]|7[1-47]|88|9[0-49])|6(?:2[1-35]|5[149]|8[067]))\\d{4}", , , , "2401234", , , [ 7 ] ], [ , , "(?:321|7(?:[1-7]\\d|8[01]))\\d{5}", , , , "71123456", , , [ 8 ] ], [ , , "(?:0800|800\\d)\\d{6}", , , , "0800012345", , , [ 10 ] ], [ , , "90\\d{5}", , , , "9012345", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "79(?:1(?:[01]\\d|20)|2[0-25-7]\\d)\\d{3}", , , , "79101234", , , [ 8 ] ], "BW", 267, "00", , , , , , , , [ [ , "(\\d{2})(\\d{5})", "$1 $2", [ "90" ] ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[24-6]|3[15-79]" ] ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[37]" ] ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "0" ] ], [ , "(\\d{3})(\\d{4})(\\d{3})", "$1 $2 $3", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BY: [ , [ , , "(?:[12]\\d|33|44|902)\\d{7}|8(?:0[0-79]\\d{5,7}|[1-7]\\d{9})|8(?:1[0-489]|[5-79]\\d)\\d{7}|8[1-79]\\d{6,7}|8[0-79]\\d{5}|8\\d{5}", , , , , , , [ 6, 7, 8, 9, 10, 11 ], [ 5 ] ], [ , , "(?:1(?:5(?:1[1-5]|[24]\\d|6[2-4]|9[1-7])|6(?:[235]\\d|4[1-7])|7\\d\\d)|2(?:1(?:[246]\\d|3[0-35-9]|5[1-9])|2(?:[235]\\d|4[0-8])|3(?:[26]\\d|3[02-79]|4[024-7]|5[03-7])))\\d{5}", , , , "152450911", , , [ 9 ], [ 5, 6, 7 ] ], [ , , "(?:2(?:5[5-79]|9[1-9])|(?:33|44)\\d)\\d{6}", , , , "294911911", , , [ 9 ] ], [ , , "800\\d{3,7}|8(?:0[13]|20\\d)\\d{7}", , , , "8011234567" ], [ , , "(?:810|902)\\d{7}", , , , "9021234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "249\\d{6}", , , , "249123456", , , [ 9 ] ], "BY", 375, "810", "8", , , "0|80?", , "8~10", , [ [ , "(\\d{3})(\\d{3})", "$1 $2", [ "800" ], "8 $1" ], [ , "(\\d{3})(\\d{2})(\\d{2,4})", "$1 $2 $3", [ "800" ], "8 $1" ], [ , "(\\d{4})(\\d{2})(\\d{3})", "$1 $2-$3", [ "1(?:5[169]|6[3-5]|7[179])|2(?:1[35]|2[34]|3[3-5])", "1(?:5[169]|6(?:3[1-3]|4|5[125])|7(?:1[3-9]|7[0-24-6]|9[2-7]))|2(?:1[35]|2[34]|3[3-5])" ], "8 0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2-$3-$4", [ "1(?:[56]|7[467])|2[1-3]" ], "8 0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2-$3-$4", [ "[1-4]" ], "8 0$1" ], [ , "(\\d{3})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "[89]" ], "8 $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "800\\d{3,7}|(?:8(?:0[13]|10|20\\d)|902)\\d{7}" ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            BZ: [ , [ , , "(?:0800\\d|[2-8])\\d{6}", , , , , , , [ 7, 11 ] ], [ , , "(?:2(?:[02]\\d|36|[68]0)|[3-58](?:[02]\\d|[68]0)|7(?:[02]\\d|32|[68]0))\\d{4}", , , , "2221234", , , [ 7 ] ], [ , , "6[0-35-7]\\d{5}", , , , "6221234", , , [ 7 ] ], [ , , "0800\\d{7}", , , , "08001234123", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "BZ", 501, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[2-8]" ] ], [ , "(\\d)(\\d{3})(\\d{4})(\\d{3})", "$1-$2-$3-$4", [ "0" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CA: [ , [ , , "(?:[2-8]\\d|90)\\d{8}", , , , , , , [ 10 ], [ 7 ] ], [ , , "(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|6[578])|4(?:03|1[68]|3[178]|50|74)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47|72)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}", , , , "5062345678", , , , [ 7 ] ], [ , , "(?:2(?:04|[23]6|[48]9|50)|3(?:06|43|6[578])|4(?:03|1[68]|3[178]|50|74)|5(?:06|1[49]|48|79|8[17])|6(?:04|13|39|47|72)|7(?:0[59]|78|8[02])|8(?:[06]7|19|25|73)|90[25])[2-9]\\d{6}", , , , "5062345678", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|(?:5(?:00|2[12]|33|44|66|77|88)|622)[2-9]\\d{6}", , , , "5002345678" ], [ , , "600[2-9]\\d{6}", , , , "6002012345" ], "CA", 1, "011", "1", , , "1", , , 1, , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CC: [ , [ , , "1(?:[0-79]\\d{8}(?:\\d{2})?|8[0-24-9]\\d{7})|[148]\\d{8}|1\\d{5,7}", , , , , , , [ 6, 7, 8, 9, 10, 12 ] ], [ , , "8(?:51(?:0(?:02|31|60|89)|1(?:18|76)|223)|91(?:0(?:1[0-2]|29)|1(?:[28]2|50|79)|2(?:10|64)|3(?:[06]8|22)|4[29]8|62\\d|70[23]|959))\\d{3}", , , , "891621234", , , [ 9 ], [ 8 ] ], [ , , "4(?:83[0-38]|93[0-6])\\d{5}|4(?:[0-3]\\d|4[047-9]|5[0-25-9]|6[06-9]|7[02-9]|8[0-24-9]|9[0-27-9])\\d{6}", , , , "412345678", , , [ 9 ] ], [ , , "180(?:0\\d{3}|2)\\d{3}", , , , "1800123456", , , [ 7, 10 ] ], [ , , "190[0-26]\\d{6}", , , , "1900123456", , , [ 10 ] ], [ , , "13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}", , , , "1300123456", , , [ 6, 8, 10, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}", , , , "147101234", , , [ 9 ] ], "CC", 61, "001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011", "0", , , "0|([59]\\d{7})$", "8$1", "0011", , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CD: [ , [ , , "[189]\\d{8}|[1-68]\\d{6}", , , , , , , [ 7, 9 ] ], [ , , "12\\d{7}|[1-6]\\d{6}", , , , "1234567" ], [ , , "88\\d{5}|(?:8[0-59]|9[017-9])\\d{7}", , , , "991234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CD", 243, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", [ "88" ], "0$1" ], [ , "(\\d{2})(\\d{5})", "$1 $2", [ "[1-6]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[89]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CF: [ , [ , , "(?:[27]\\d{3}|8776)\\d{4}", , , , , , , [ 8 ] ], [ , , "2[12]\\d{6}", , , , "21612345" ], [ , , "7[0257]\\d{6}", , , , "70012345" ], [ , , , , , , , , , [ -1 ] ], [ , , "8776\\d{4}", , , , "87761234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CF", 236, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[278]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CG: [ , [ , , "222\\d{6}|(?:0\\d|80)\\d{7}", , , , , , , [ 9 ] ], [ , , "222[1-589]\\d{5}", , , , "222123456" ], [ , , "026(?:1[0-5]|6[6-9])\\d{4}|0(?:[14-6]\\d\\d|2(?:40|5[5-8]|6[07-9]))\\d{5}", , , , "061234567" ], [ , , , , , , , , , [ -1 ] ], [ , , "80(?:0\\d\\d|120)\\d{4}", , , , "800123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CG", 242, "00", , , , , , , , [ [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "8" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[02]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CH: [ , [ , , "8\\d{11}|[2-9]\\d{8}", , , , , , , [ 9, 12 ] ], [ , , "(?:2[12467]|3[1-4]|4[134]|5[256]|6[12]|[7-9]1)\\d{7}", , , , "212345678", , , [ 9 ] ], [ , , "7[35-9]\\d{7}", , , , "781234567", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "90[016]\\d{6}", , , , "900123456", , , [ 9 ] ], [ , , "84[0248]\\d{6}", , , , "840123456", , , [ 9 ] ], [ , , "878\\d{6}", , , , "878123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], "CH", 41, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8[047]|90" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2-79]|81" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "8" ], "0$1" ] ], , [ , , "74[0248]\\d{6}", , , , "740123456", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "5[18]\\d{7}", , , , "581234567", , , [ 9 ] ], , , [ , , "860\\d{9}", , , , "860123456789", , , [ 12 ] ] ],
            CI: [ , [ , , "[02]\\d{9}", , , , , , , [ 10 ] ], [ , , "2(?:[15]\\d{3}|7(?:2(?:0[23]|1[2357]|[23][45]|4[3-5])|3(?:06|1[69]|[2-6]7)))\\d{5}", , , , "2123456789" ], [ , , "0704[0-7]\\d{5}|0(?:[15]\\d\\d|7(?:0[0-37-9]|[4-9][7-9]))\\d{6}", , , , "0123456789" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CI", 225, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d)(\\d{5})", "$1 $2 $3 $4", [ "2" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3 $4", [ "0" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CK: [ , [ , , "[2-578]\\d{4}", , , , , , , [ 5 ] ], [ , , "(?:2\\d|3[13-7]|4[1-5])\\d{3}", , , , "21234" ], [ , , "[578]\\d{4}", , , , "71234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CK", 682, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})", "$1 $2", [ "[2-578]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CL: [ , [ , , "12300\\d{6}|6\\d{9,10}|[2-9]\\d{8}", , , , , , , [ 9, 10, 11 ] ], [ , , "2(?:1982[0-6]|3314[05-9])\\d{3}|(?:2(?:1(?:160|962)|3(?:2\\d\\d|3(?:[034]\\d|1[0-35-9]|2[1-9]|5[0-2])|600))|80[1-9]\\d\\d|9(?:3(?:[0-57-9]\\d\\d|6(?:0[02-9]|[1-9]\\d))|6(?:[0-8]\\d\\d|9(?:[02-79]\\d|1[05-9]))|7[1-9]\\d\\d|9(?:[03-9]\\d\\d|1(?:[0235-9]\\d|4[0-24-9])|2(?:[0-79]\\d|8[0-46-9]))))\\d{4}|(?:22|3[2-5]|[47][1-35]|5[1-3578]|6[13-57]|8[1-9]|9[2458])\\d{7}", , , , "221234567", , , [ 9 ] ], [ , , "2(?:1982[0-6]|3314[05-9])\\d{3}|(?:2(?:1(?:160|962)|3(?:2\\d\\d|3(?:[034]\\d|1[0-35-9]|2[1-9]|5[0-2])|600))|80[1-9]\\d\\d|9(?:3(?:[0-57-9]\\d\\d|6(?:0[02-9]|[1-9]\\d))|6(?:[0-8]\\d\\d|9(?:[02-79]\\d|1[05-9]))|7[1-9]\\d\\d|9(?:[03-9]\\d\\d|1(?:[0235-9]\\d|4[0-24-9])|2(?:[0-79]\\d|8[0-46-9]))))\\d{4}|(?:22|3[2-5]|[47][1-35]|5[1-3578]|6[13-57]|8[1-9]|9[2458])\\d{7}", , , , "221234567", , , [ 9 ] ], [ , , "(?:123|8)00\\d{6}", , , , "800123456", , , [ 9, 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "600\\d{7,8}", , , , "6001234567", , , [ 10, 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "44\\d{7}", , , , "441234567", , , [ 9 ] ], "CL", 56, "(?:0|1(?:1[0-69]|2[02-5]|5[13-58]|69|7[0167]|8[018]))0", , , , , , , 1, [ [ , "(\\d{4})", "$1", [ "1(?:[03-589]|21)|[29]0|78" ] ], [ , "(\\d{5})(\\d{4})", "$1 $2", [ "219", "2196" ], "($1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "44" ] ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "2[1-3]" ], "($1)" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "9[2-9]" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "3[2-5]|[47]|5[1-3578]|6[13-57]|8(?:0[1-9]|[1-9])" ], "($1)" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "60|8" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ] ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "60" ] ] ], [ [ , "(\\d{5})(\\d{4})", "$1 $2", [ "219", "2196" ], "($1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "44" ] ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "2[1-3]" ], "($1)" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "9[2-9]" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "3[2-5]|[47]|5[1-3578]|6[13-57]|8(?:0[1-9]|[1-9])" ], "($1)" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "60|8" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ] ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "60" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "600\\d{7,8}", , , , , , , [ 10, 11 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CM: [ , [ , , "[26]\\d{8}|88\\d{6,7}", , , , , , , [ 8, 9 ] ], [ , , "2(?:22|33)\\d{6}", , , , "222123456", , , [ 9 ] ], [ , , "(?:24[23]|6[5-9]\\d)\\d{6}", , , , "671234567", , , [ 9 ] ], [ , , "88\\d{6,7}", , , , "88012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CM", 237, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "88" ] ], [ , "(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "[26]|88" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CN: [ , [ , , "1[127]\\d{8,9}|2\\d{9}(?:\\d{2})?|[12]\\d{6,7}|86\\d{6}|(?:1[03-689]\\d|6)\\d{7,9}|(?:[3-579]\\d|8[0-57-9])\\d{6,9}", , , , , , , [ 7, 8, 9, 10, 11, 12 ], [ 5, 6 ] ], [ , , "(?:10(?:[02-79]\\d\\d|[18](?:0[1-9]|[1-9]\\d))|21(?:[18](?:0[1-9]|[1-9]\\d)|[2-79]\\d\\d))\\d{5}|(?:43[35]|754)\\d{7,8}|8(?:078\\d{7}|51\\d{7,8})|(?:10|(?:2|85)1|43[35]|754)(?:100\\d\\d|95\\d{3,4})|(?:2[02-57-9]|3(?:11|7[179])|4(?:[15]1|3[12])|5(?:1\\d|2[37]|3[12]|51|7[13-79]|9[15])|7(?:[39]1|5[57]|6[09])|8(?:71|98))(?:[02-8]\\d{7}|1(?:0(?:0\\d\\d(?:\\d{3})?|[1-9]\\d{5})|[1-9]\\d{6})|9(?:[0-46-9]\\d{6}|5\\d{3}(?:\\d(?:\\d{2})?)?))|(?:3(?:1[02-9]|35|49|5\\d|7[02-68]|9[1-68])|4(?:1[02-9]|2[179]|3[46-9]|5[2-9]|6[47-9]|7\\d|8[23])|5(?:3[03-9]|4[36]|5[02-9]|6[1-46]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[17]\\d|2[248]|3[04-9]|4[3-6]|5[0-3689]|6[2368]|9[02-9])|8(?:1[236-8]|2[5-7]|3\\d|5[2-9]|7[02-9]|8[36-8]|9[1-7])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:[02-8]\\d{6}|1(?:0(?:0\\d\\d(?:\\d{2})?|[1-9]\\d{4})|[1-9]\\d{5})|9(?:[0-46-9]\\d{5}|5\\d{3,5}))", , , , "1012345678", , , [ 7, 8, 9, 10, 11 ], [ 5, 6 ] ], [ , , "1740[0-5]\\d{6}|1(?:[38]\\d|4[57]|5[0-35-9]|6[25-7]|7[0-35-8]|9[0135-9])\\d{8}", , , , "13123456789", , , [ 11 ] ], [ , , "(?:(?:10|21)8|8)00\\d{7}", , , , "8001234567", , , [ 10, 12 ] ], [ , , "16[08]\\d{5}", , , , "16812345", , , [ 8 ] ], [ , , "400\\d{7}|950\\d{7,8}|(?:10|2[0-57-9]|3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))96\\d{3,4}", , , , "4001234567", , , [ 7, 8, 9, 10, 11 ], [ 5, 6 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CN", 86, "00|1(?:[12]\\d|79)\\d\\d00", "0", , , "0|(1(?:[12]\\d|79)\\d\\d)", , "00", , [ [ , "(\\d{5,6})", "$1", [ "96" ] ], [ , "(\\d{2})(\\d{5,6})", "$1 $2", [ "(?:10|2[0-57-9])[19]", "(?:10|2[0-57-9])(?:10|9[56])", "(?:10|2[0-57-9])(?:100|9[56])" ], "0$1", "$CC $1" ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[1-9]", "1[1-9]|26|[3-9]|(?:10|2[0-57-9])(?:[0-8]|9[0-47-9])", "1[1-9]|26|[3-9]|(?:10|2[0-57-9])(?:[02-8]|1(?:0[1-9]|[1-9])|9[0-47-9])" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "16[08]" ] ], [ , "(\\d{3})(\\d{5,6})", "$1 $2", [ "3(?:[157]|35|49|9[1-68])|4(?:[17]|2[179]|6[47-9]|8[23])|5(?:[1357]|2[37]|4[36]|6[1-46]|80)|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])|(?:4[35]|59|85)[1-9]", "(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))[19]", "85[23](?:10|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:10|9[56])", "85[23](?:100|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:100|9[56])" ], "0$1", "$CC $1" ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[1-9]", "1[1-9]|26|[3-9]|(?:10|2[0-57-9])(?:[0-8]|9[0-47-9])", "26|3(?:[0268]|9[079])|4(?:[049]|2[02-68]|[35]0|6[0-356]|8[014-9])|5(?:0|2[0-24-689]|4[0-2457-9]|6[057-9]|90)|6(?:[0-24578]|6[14-79]|9[03-9])|7(?:0[02-9]|2[0135-79]|3[23]|4[0-27-9]|6[1457]|8)|8(?:[046]|1[01459]|2[0-489]|50|8[0-2459]|9[09])|9(?:0[0457]|1[08]|[268]|4[024-9])|(?:34|85[23])[0-8]|(?:1|58)[1-9]|(?:63|95)[06-9]|(?:33|85[23]9)[0-46-9]|(?:10|2[0-57-9]|3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:[0-8]|9[0-47-9])", "26|3(?:[0268]|3[0-46-9]|4[0-8]|9[079])|4(?:[049]|2[02-68]|[35]0|6[0-356]|8[014-9])|5(?:0|2[0-24-689]|4[0-2457-9]|6[057-9]|90)|6(?:[0-24578]|3[06-9]|6[14-79]|9[03-9])|7(?:0[02-9]|2[0135-79]|3[23]|4[0-27-9]|6[1457]|8)|8(?:[046]|1[01459]|2[0-489]|5(?:0|[23](?:[02-8]|1[1-9]|9[0-46-9]))|8[0-2459]|9[09])|9(?:0[0457]|1[08]|[268]|4[024-9]|5[06-9])|(?:1|58|85[23]10)[1-9]|(?:10|2[0-57-9])(?:[0-8]|9[0-47-9])|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:[02-8]|1(?:0[1-9]|[1-9])|9[0-47-9])" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "(?:4|80)0" ] ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "10|2(?:[02-57-9]|1[1-9])", "10|2(?:[02-57-9]|1[1-9])", "10[0-79]|2(?:[02-57-9]|1[1-79])|(?:10|21)8(?:0[1-9]|[1-9])" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "3(?:[3-59]|7[02-68])|4(?:[26-8]|3[3-9]|5[2-9])|5(?:3[03-9]|[468]|7[028]|9[2-46-9])|6|7(?:[0-247]|3[04-9]|5[0-4689]|6[2368])|8(?:[1-358]|9[1-7])|9(?:[013479]|5[1-5])|(?:[34]1|55|79|87)[02-9]" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{7,8})", "$1 $2", [ "9" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "80" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "[3-578]" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "1[3-9]" ], , "$CC $1" ], [ , "(\\d{2})(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "[12]" ], "0$1", , 1 ] ], [ [ , "(\\d{2})(\\d{5,6})", "$1 $2", [ "(?:10|2[0-57-9])[19]", "(?:10|2[0-57-9])(?:10|9[56])", "(?:10|2[0-57-9])(?:100|9[56])" ], "0$1", "$CC $1" ], [ , "(\\d{3})(\\d{5,6})", "$1 $2", [ "3(?:[157]|35|49|9[1-68])|4(?:[17]|2[179]|6[47-9]|8[23])|5(?:[1357]|2[37]|4[36]|6[1-46]|80)|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])|(?:4[35]|59|85)[1-9]", "(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))[19]", "85[23](?:10|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:10|9[56])", "85[23](?:100|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:100|9[56])" ], "0$1", "$CC $1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "(?:4|80)0" ] ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "10|2(?:[02-57-9]|1[1-9])", "10|2(?:[02-57-9]|1[1-9])", "10[0-79]|2(?:[02-57-9]|1[1-79])|(?:10|21)8(?:0[1-9]|[1-9])" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "3(?:[3-59]|7[02-68])|4(?:[26-8]|3[3-9]|5[2-9])|5(?:3[03-9]|[468]|7[028]|9[2-46-9])|6|7(?:[0-247]|3[04-9]|5[0-4689]|6[2368])|8(?:[1-358]|9[1-7])|9(?:[013479]|5[1-5])|(?:[34]1|55|79|87)[02-9]" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{7,8})", "$1 $2", [ "9" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "80" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "[3-578]" ], "0$1", "$CC $1", 1 ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "1[3-9]" ], , "$CC $1" ], [ , "(\\d{2})(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "[12]" ], "0$1", , 1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "(?:(?:10|21)8|[48])00\\d{7}|950\\d{7,8}", , , , , , , [ 10, 11, 12 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CO: [ , [ , , "(?:(?:1\\d|[36])\\d{3}|9101)\\d{6}|[124-8]\\d{7}", , , , , , , [ 8, 10, 11 ], [ 7 ] ], [ , , "60[124-8][2-9]\\d{6}|[124-8][2-9]\\d{6}", , , , "12345678", , , [ 8, 10 ], [ 7 ] ], [ , , "3333(?:0(?:0\\d|1[0-5])|[4-9]\\d\\d)\\d{3}|(?:3(?:24[2-6]|3(?:00|3[0-24-9]))|9101)\\d{6}|3(?:0[0-5]|1\\d|2[0-3]|5[01]|70)\\d{7}", , , , "3211234567", , , [ 10 ] ], [ , , "1800\\d{7}", , , , "18001234567", , , [ 11 ] ], [ , , "19(?:0[01]|4[78])\\d{7}", , , , "19001234567", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CO", 57, "00(?:4(?:[14]4|56)|[579])", "0", , , "0([3579]|4(?:[14]4|56))?", , , , [ [ , "(\\d)(\\d{7})", "$1 $2", [ "[146][2-9]|[2578]" ], "($1)", "0$CC $1" ], [ , "(\\d{3})(\\d{7})", "$1 $2", [ "6" ], "($1)" ], [ , "(\\d{3})(\\d{7})", "$1 $2", [ "[39]" ], , "0$CC $1" ], [ , "(\\d)(\\d{3})(\\d{7})", "$1-$2-$3", [ "1" ], "0$1" ] ], [ [ , "(\\d)(\\d{7})", "$1 $2", [ "[146][2-9]|[2578]" ], "($1)", "0$CC $1" ], [ , "(\\d{3})(\\d{7})", "$1 $2", [ "6" ], "($1)" ], [ , "(\\d{3})(\\d{7})", "$1 $2", [ "[39]" ], , "0$CC $1" ], [ , "(\\d)(\\d{3})(\\d{7})", "$1 $2 $3", [ "1" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CR: [ , [ , , "(?:8\\d|90)\\d{8}|(?:[24-8]\\d{3}|3005)\\d{4}", , , , , , , [ 8, 10 ] ], [ , , "210[7-9]\\d{4}|2(?:[024-7]\\d|1[1-9])\\d{5}", , , , "22123456", , , [ 8 ] ], [ , , "(?:3005\\d|6500[01])\\d{3}|(?:5[07]|6[0-4]|7[0-3]|8[3-9])\\d{6}", , , , "83123456", , , [ 8 ] ], [ , , "800\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , "90[059]\\d{7}", , , , "9001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:210[0-6]|4\\d{3}|5100)\\d{4}", , , , "40001234", , , [ 8 ] ], "CR", 506, "00", , , , "(19(?:0[0-2468]|1[09]|20|66|77|99))", , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[2-7]|8[3-9]" ], , "$CC $1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", [ "[89]" ], , "$CC $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CU: [ , [ , , "[27]\\d{6,7}|[34]\\d{5,7}|(?:5|8\\d\\d)\\d{7}", , , , , , , [ 6, 7, 8, 10 ], [ 4, 5 ] ], [ , , "(?:3[23]|48)\\d{4,6}|(?:31|4[36]|8(?:0[25]|78)\\d)\\d{6}|(?:2[1-4]|4[1257]|7\\d)\\d{5,6}", , , , "71234567", , , , [ 4, 5 ] ], [ , , "5\\d{7}", , , , "51234567", , , [ 8 ] ], [ , , "800\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "807\\d{7}", , , , "8071234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CU", 53, "119", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{4,6})", "$1 $2", [ "2[1-4]|[34]" ], "(0$1)" ], [ , "(\\d)(\\d{6,7})", "$1 $2", [ "7" ], "(0$1)" ], [ , "(\\d)(\\d{7})", "$1 $2", [ "5" ], "0$1" ], [ , "(\\d{3})(\\d{7})", "$1 $2", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CV: [ , [ , , "(?:[2-59]\\d\\d|800)\\d{4}", , , , , , , [ 7 ] ], [ , , "2(?:2[1-7]|3[0-8]|4[12]|5[1256]|6\\d|7[1-3]|8[1-5])\\d{4}", , , , "2211234" ], [ , , "(?:[34][36]|5[1-389]|9\\d)\\d{5}", , , , "9911234" ], [ , , "800\\d{4}", , , , "8001234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CV", 238, "0", , , , , , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", [ "[2-589]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CW: [ , [ , , "(?:[34]1|60|(?:7|9\\d)\\d)\\d{5}", , , , , , , [ 7, 8 ] ], [ , , "9(?:4(?:3[0-5]|4[14]|6\\d)|50\\d|7(?:2[014]|3[02-9]|4[4-9]|6[357]|77|8[7-9])|8(?:3[39]|[46]\\d|7[01]|8[57-9]))\\d{4}", , , , "94351234" ], [ , , "953[01]\\d{4}|9(?:5[12467]|6[5-9])\\d{5}", , , , "95181234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "60[0-2]\\d{4}", , , , "6001234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "CW", 599, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[3467]" ] ], [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "9[4-8]" ] ] ], , [ , , "955\\d{5}", , , , "95581234", , , [ 8 ] ], 1, "[69]", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CX: [ , [ , , "1(?:[0-79]\\d{8}(?:\\d{2})?|8[0-24-9]\\d{7})|[148]\\d{8}|1\\d{5,7}", , , , , , , [ 6, 7, 8, 9, 10, 12 ] ], [ , , "8(?:51(?:0(?:01|30|59|88)|1(?:17|46|75)|2(?:22|35))|91(?:00[6-9]|1(?:[28]1|49|78)|2(?:09|63)|3(?:12|26|75)|4(?:56|97)|64\\d|7(?:0[01]|1[0-2])|958))\\d{3}", , , , "891641234", , , [ 9 ], [ 8 ] ], [ , , "4(?:83[0-38]|93[0-6])\\d{5}|4(?:[0-3]\\d|4[047-9]|5[0-25-9]|6[06-9]|7[02-9]|8[0-24-9]|9[0-27-9])\\d{6}", , , , "412345678", , , [ 9 ] ], [ , , "180(?:0\\d{3}|2)\\d{3}", , , , "1800123456", , , [ 7, 10 ] ], [ , , "190[0-26]\\d{6}", , , , "1900123456", , , [ 10 ] ], [ , , "13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}", , , , "1300123456", , , [ 6, 8, 10, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}", , , , "147101234", , , [ 9 ] ], "CX", 61, "001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011", "0", , , "0|([59]\\d{7})$", "8$1", "0011", , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            CY: [ , [ , , "(?:[279]\\d|[58]0)\\d{6}", , , , , , , [ 8 ] ], [ , , "2[2-6]\\d{6}", , , , "22345678" ], [ , , "9[4-79]\\d{6}", , , , "96123456" ], [ , , "800\\d{5}", , , , "80001234" ], [ , , "90[09]\\d{5}", , , , "90012345" ], [ , , "80[1-9]\\d{5}", , , , "80112345" ], [ , , "700\\d{5}", , , , "70012345" ], [ , , , , , , , , , [ -1 ] ], "CY", 357, "00", , , , , , , , [ [ , "(\\d{2})(\\d{6})", "$1 $2", [ "[257-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:50|77)\\d{6}", , , , "77123456" ], , , [ , , , , , , , , , [ -1 ] ] ],
            CZ: [ , [ , , "(?:[2-578]\\d|60)\\d{7}|9\\d{8,11}", , , , , , , [ 9, 10, 11, 12 ] ], [ , , "(?:2\\d|3[1257-9]|4[16-9]|5[13-9])\\d{7}", , , , "212345678", , , [ 9 ] ], [ , , "(?:60[1-8]|7(?:0[2-5]|[2379]\\d))\\d{6}", , , , "601123456", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "9(?:0[05689]|76)\\d{6}", , , , "900123456", , , [ 9 ] ], [ , , "8[134]\\d{7}", , , , "811234567", , , [ 9 ] ], [ , , "70[01]\\d{6}", , , , "700123456", , , [ 9 ] ], [ , , "9[17]0\\d{6}", , , , "910123456", , , [ 9 ] ], "CZ", 420, "00", , , , , , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2-8]|9[015-7]" ] ], [ , "(\\d{2})(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3 $4", [ "96" ] ], [ , "(\\d{2})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "9" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "9" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "9(?:5\\d|7[2-4])\\d{6}", , , , "972123456", , , [ 9 ] ], , , [ , , "9(?:3\\d{9}|6\\d{7,10})", , , , "93123456789" ] ],
            DE: [ , [ , , "[2579]\\d{5,14}|49(?:[34]0|69|8\\d)\\d\\d?|49(?:37|49|60|7[089]|9\\d)\\d{1,3}|49(?:1\\d|2[02-9]|3[2-689]|7[1-7])\\d{1,8}|(?:1|[368]\\d|4[0-8])\\d{3,13}|49(?:[05]\\d|[23]1|[46][1-8])\\d{1,9}", , , , , , , [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ], [ 2, 3 ] ], [ , , "32\\d{9,11}|49[2-6]\\d{10}|49[0-7]\\d{3,9}|(?:[34]0|[68]9)\\d{3,13}|(?:2(?:0[1-689]|[1-3569]\\d|4[0-8]|7[1-7]|8[0-7])|3(?:[3569]\\d|4[0-79]|7[1-7]|8[1-8])|4(?:1[02-9]|[2-48]\\d|5[0-6]|6[0-8]|7[0-79])|5(?:0[2-8]|[124-6]\\d|[38][0-8]|[79][0-7])|6(?:0[02-9]|[1-358]\\d|[47][0-8]|6[1-9])|7(?:0[2-8]|1[1-9]|[27][0-7]|3\\d|[4-6][0-8]|8[0-5]|9[013-7])|8(?:0[2-9]|1[0-79]|2\\d|3[0-46-9]|4[0-6]|5[013-9]|6[1-8]|7[0-8]|8[0-24-6])|9(?:0[6-9]|[1-4]\\d|[589][0-7]|6[0-8]|7[0-467]))\\d{3,12}", , , , "30123456", , , [ 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ], [ 2, 3, 4 ] ], [ , , "15[0-25-9]\\d{8}|1(?:6[023]|7\\d)\\d{7,8}", , , , "15123456789", , , [ 10, 11 ] ], [ , , "800\\d{7,12}", , , , "8001234567890", , , [ 10, 11, 12, 13, 14, 15 ] ], [ , , "(?:137[7-9]|900(?:[135]|9\\d))\\d{6}", , , , "9001234567", , , [ 10, 11 ] ], [ , , "180\\d{5,11}|13(?:7[1-6]\\d\\d|8)\\d{4}", , , , "18012345", , , [ 7, 8, 9, 10, 11, 12, 13, 14 ] ], [ , , "700\\d{8}", , , , "70012345678", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], "DE", 49, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3,13})", "$1 $2", [ "3[02]|40|[68]9" ], "0$1" ], [ , "(\\d{3})(\\d{3,12})", "$1 $2", [ "2(?:0[1-389]|1[124]|2[18]|3[14])|3(?:[35-9][15]|4[015])|906|(?:2[4-9]|4[2-9]|[579][1-9]|[68][1-8])1", "2(?:0[1-389]|12[0-8])|3(?:[35-9][15]|4[015])|906|2(?:[13][14]|2[18])|(?:2[4-9]|4[2-9]|[579][1-9]|[68][1-8])1" ], "0$1" ], [ , "(\\d{4})(\\d{2,11})", "$1 $2", [ "[24-6]|3(?:[3569][02-46-9]|4[2-4679]|7[2-467]|8[2-46-8])|70[2-8]|8(?:0[2-9]|[1-8])|90[7-9]|[79][1-9]", "[24-6]|3(?:3(?:0[1-467]|2[127-9]|3[124578]|7[1257-9]|8[1256]|9[145])|4(?:2[135]|4[13578]|9[1346])|5(?:0[14]|2[1-3589]|6[1-4]|7[13468]|8[13568])|6(?:2[1-489]|3[124-6]|6[13]|7[12579]|8[1-356]|9[135])|7(?:2[1-7]|4[145]|6[1-5]|7[1-4])|8(?:21|3[1468]|6|7[1467]|8[136])|9(?:0[12479]|2[1358]|4[134679]|6[1-9]|7[136]|8[147]|9[1468]))|70[2-8]|8(?:0[2-9]|[1-8])|90[7-9]|[79][1-9]|3[68]4[1347]|3(?:47|60)[1356]|3(?:3[46]|46|5[49])[1246]|3[4579]3[1357]" ], "0$1" ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "138" ], "0$1" ], [ , "(\\d{5})(\\d{2,10})", "$1 $2", [ "3" ], "0$1" ], [ , "(\\d{3})(\\d{5,11})", "$1 $2", [ "181" ], "0$1" ], [ , "(\\d{3})(\\d)(\\d{4,10})", "$1 $2 $3", [ "1(?:3|80)|9" ], "0$1" ], [ , "(\\d{3})(\\d{7,8})", "$1 $2", [ "1[67]" ], "0$1" ], [ , "(\\d{3})(\\d{7,12})", "$1 $2", [ "8" ], "0$1" ], [ , "(\\d{5})(\\d{6})", "$1 $2", [ "185", "1850", "18500" ], "0$1" ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "7" ], "0$1" ], [ , "(\\d{4})(\\d{7})", "$1 $2", [ "18[68]" ], "0$1" ], [ , "(\\d{5})(\\d{6})", "$1 $2", [ "15[0568]" ], "0$1" ], [ , "(\\d{4})(\\d{7})", "$1 $2", [ "15[1279]" ], "0$1" ], [ , "(\\d{3})(\\d{8})", "$1 $2", [ "18" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{7,8})", "$1 $2 $3", [ "1(?:6[023]|7)" ], "0$1" ], [ , "(\\d{4})(\\d{2})(\\d{7})", "$1 $2 $3", [ "15[279]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{8})", "$1 $2 $3", [ "15" ], "0$1" ] ], , [ , , "16(?:4\\d{1,10}|[89]\\d{1,11})", , , , "16412345", , , [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "18(?:1\\d{5,11}|[2-9]\\d{8})", , , , "18500123456", , , [ 8, 9, 10, 11, 12, 13, 14 ] ], , , [ , , "1(?:6(?:013|255|399)|7(?:(?:[015]1|[69]3)3|[2-4]55|[78]99))\\d{7,8}|15(?:(?:[03-68]00|113)\\d|2\\d55|7\\d99|9\\d33)\\d{7}", , , , "177991234567", , , [ 12, 13 ] ] ],
            DJ: [ , [ , , "(?:2\\d|77)\\d{6}", , , , , , , [ 8 ] ], [ , , "2(?:1[2-5]|7[45])\\d{5}", , , , "21360003" ], [ , , "77\\d{6}", , , , "77831001" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "DJ", 253, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[27]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            DK: [ , [ , , "[2-9]\\d{7}", , , , , , , [ 8 ] ], [ , , "(?:[2-7]\\d|8[126-9]|9[1-46-9])\\d{6}", , , , "32123456" ], [ , , "(?:[2-7]\\d|8[126-9]|9[1-46-9])\\d{6}", , , , "32123456" ], [ , , "80\\d{6}", , , , "80123456" ], [ , , "90\\d{6}", , , , "90123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "DK", 45, "00", , , , , , , 1, [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            DM: [ , [ , , "(?:[58]\\d\\d|767|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4])\\d{4}", , , , "7674201234", , , , [ 7 ] ], [ , , "767(?:2(?:[2-4689]5|7[5-7])|31[5-7]|61[1-8]|70[1-6])\\d{4}", , , , "7672251234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "DM", 1, "011", "1", , , "1|([2-7]\\d{6})$", "767$1", , , , , [ , , , , , , , , , [ -1 ] ], , "767", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            DO: [ , [ , , "(?:[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "8(?:[04]9[2-9]\\d\\d|29(?:2(?:[0-59]\\d|6[04-9]|7[0-27]|8[0237-9])|3(?:[0-35-9]\\d|4[7-9])|[45]\\d\\d|6(?:[0-27-9]\\d|[3-5][1-9]|6[0135-8])|7(?:0[013-9]|[1-37]\\d|4[1-35689]|5[1-4689]|6[1-57-9]|8[1-79]|9[1-8])|8(?:0[146-9]|1[0-48]|[248]\\d|3[1-79]|5[01589]|6[013-68]|7[124-8]|9[0-8])|9(?:[0-24]\\d|3[02-46-9]|5[0-79]|60|7[0169]|8[57-9]|9[02-9])))\\d{4}", , , , "8092345678", , , , [ 7 ] ], [ , , "8[024]9[2-9]\\d{6}", , , , "8092345678", , , , [ 7 ] ], [ , , "8(?:00(?:14|[2-9]\\d)|(?:33|44|55|66|77|88)[2-9]\\d)\\d{5}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "DO", 1, "011", "1", , , "1", , , , , , [ , , , , , , , , , [ -1 ] ], , "8001|8[024]9", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            DZ: [ , [ , , "(?:[1-4]|[5-79]\\d|80)\\d{7}", , , , , , , [ 8, 9 ] ], [ , , "9619\\d{5}|(?:1\\d|2[013-79]|3[0-8]|4[0135689])\\d{6}", , , , "12345678" ], [ , , "(?:5(?:4[0-29]|5\\d|6[0-2])|6(?:[569]\\d|7[0-6])|7[7-9]\\d)\\d{6}", , , , "551234567", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "80[3-689]1\\d{5}", , , , "808123456", , , [ 9 ] ], [ , , "80[12]1\\d{5}", , , , "801123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "98[23]\\d{6}", , , , "983123456", , , [ 9 ] ], "DZ", 213, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[1-4]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "9" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[5-8]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            EC: [ , [ , , "1\\d{9,10}|(?:[2-7]|9\\d)\\d{7}", , , , , , , [ 8, 9, 10, 11 ], [ 7 ] ], [ , , "[2-7][2-7]\\d{6}", , , , "22123456", , , [ 8 ], [ 7 ] ], [ , , "964[0-2]\\d{5}|9(?:39|[57][89]|6[0-36-9]|[89]\\d)\\d{6}", , , , "991234567", , , [ 9 ] ], [ , , "1800\\d{7}|1[78]00\\d{6}", , , , "18001234567", , , [ 10, 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "[2-7]890\\d{4}", , , , "28901234", , , [ 8 ] ], "EC", 593, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[2-7]" ] ], [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2-$3", [ "[2-7]" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "9" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "1" ] ] ], [ [ , "(\\d)(\\d{3})(\\d{4})", "$1-$2-$3", [ "[2-7]" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "9" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "1" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            EE: [ , [ , , "8\\d{9}|[4578]\\d{7}|(?:[3-8]\\d|90)\\d{5}", , , , , , , [ 7, 8, 10 ] ], [ , , "(?:3[23589]|4[3-8]|6\\d|7[1-9]|88)\\d{5}", , , , "3212345", , , [ 7 ] ], [ , , "(?:5\\d{5}|8(?:1(?:0(?:000|[3-9]\\d\\d)|(?:1(?:0[236]|1\\d)|(?:23|[3-79]\\d)\\d)\\d)|2(?:0(?:000|(?:19|[24-7]\\d)\\d)|(?:(?:[124-6]\\d|3[5-9])\\d|7(?:[679]\\d|8[13-9])|8(?:[2-6]\\d|7[01]))\\d)|[349]\\d{4}))\\d\\d|5(?:(?:[02]\\d|5[0-478])\\d|1(?:[0-8]\\d|95)|6(?:4[0-4]|5[1-589]))\\d{3}", , , , "51234567", , , [ 7, 8 ] ], [ , , "800(?:(?:0\\d\\d|1)\\d|[2-9])\\d{3}", , , , "80012345" ], [ , , "(?:40\\d\\d|900)\\d{4}", , , , "9001234", , , [ 7, 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70[0-2]\\d{5}", , , , "70012345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], "EE", 372, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[369]|4[3-8]|5(?:[0-2]|5[0-478]|6[45])|7[1-9]|88", "[369]|4[3-8]|5(?:[02]|1(?:[0-8]|95)|5[0-478]|6(?:4[0-4]|5[1-589]))|7[1-9]|88" ] ], [ , "(\\d{4})(\\d{3,4})", "$1 $2", [ "[45]|8(?:00|[1-49])", "[45]|8(?:00[1-9]|[1-49])" ] ], [ , "(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", [ "7" ] ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "800[2-9]\\d{3}", , , , , , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            EG: [ , [ , , "[189]\\d{8,9}|[24-6]\\d{8}|[135]\\d{7}", , , , , , , [ 8, 9, 10 ], [ 6, 7 ] ], [ , , "13[23]\\d{6}|(?:15|57)\\d{6,7}|(?:2[2-4]|3|4[05-8]|5[05]|6[24-689]|8[2468]|9[235-7])\\d{7}", , , , "234567890", , , [ 8, 9 ], [ 6, 7 ] ], [ , , "1[0-25]\\d{8}", , , , "1001234567", , , [ 10 ] ], [ , , "800\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , "900\\d{7}", , , , "9001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "EG", 20, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{7,8})", "$1 $2", [ "[23]" ], "0$1" ], [ , "(\\d{2})(\\d{6,7})", "$1 $2", [ "1[35]|[4-6]|8[2468]|9[235-7]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[189]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            EH: [ , [ , , "[5-8]\\d{8}", , , , , , , [ 9 ] ], [ , , "528[89]\\d{5}", , , , "528812345" ], [ , , "(?:6(?:[0-79]\\d|8[0-247-9])|7(?:[01]\\d|6[1267]|7[0-57]))\\d{6}", , , , "650123456" ], [ , , "80\\d{7}", , , , "801234567" ], [ , , "89\\d{7}", , , , "891234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "592(?:4[0-2]|93)\\d{4}", , , , "592401234" ], "EH", 212, "00", "0", , , "0", , , , , , [ , , , , , , , , , [ -1 ] ], , "528[89]", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ER: [ , [ , , "[178]\\d{6}", , , , , , , [ 7 ], [ 6 ] ], [ , , "(?:1(?:1[12568]|[24]0|55|6[146])|8\\d\\d)\\d{4}", , , , "8370362", , , , [ 6 ] ], [ , , "(?:17[1-3]|7\\d\\d)\\d{4}", , , , "7123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "ER", 291, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "[178]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ES: [ , [ , , "[5-9]\\d{8}", , , , , , , [ 9 ] ], [ , , "96906(?:0[0-8]|1[1-9]|[2-9]\\d)\\d\\d|9(?:69(?:0[0-57-9]|[1-9]\\d)|73(?:[0-8]\\d|9[1-9]))\\d{4}|(?:8(?:[1356]\\d|[28][0-8]|[47][1-9])|9(?:[135]\\d|[268][0-8]|4[1-9]|7[124-9]))\\d{6}", , , , "810123456" ], [ , , "(?:590[16]00\\d|9(?:6906(?:09|10)|7390\\d\\d))\\d\\d|(?:6\\d|7[1-48])\\d{7}", , , , "612345678" ], [ , , "[89]00\\d{6}", , , , "800123456" ], [ , , "80[367]\\d{6}", , , , "803123456" ], [ , , "90[12]\\d{6}", , , , "901123456" ], [ , , "70\\d{7}", , , , "701234567" ], [ , , , , , , , , , [ -1 ] ], "ES", 34, "00", , , , , , , , [ [ , "(\\d{4})", "$1", [ "905" ] ], [ , "(\\d{6})", "$1", [ "[79]9" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[89]00" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[5-9]" ] ] ], [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[89]00" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[5-9]" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "51\\d{7}", , , , "511234567" ], , , [ , , , , , , , , , [ -1 ] ] ],
            ET: [ , [ , , "(?:11|[2-59]\\d)\\d{7}", , , , , , , [ 9 ], [ 7 ] ], [ , , "11667[01]\\d{3}|(?:11(?:1(?:1[124]|2[2-7]|3[1-5]|5[5-8]|8[6-8])|2(?:13|3[6-8]|5[89]|7[05-9]|8[2-6])|3(?:2[01]|3[0-289]|4[1289]|7[1-4]|87)|4(?:1[69]|3[2-49]|4[0-3]|6[5-8])|5(?:1[578]|44|5[0-4])|6(?:1[78]|2[69]|39|4[5-7]|5[1-5]|6[0-59]|8[015-8]))|2(?:2(?:11[1-9]|22[0-7]|33\\d|44[1467]|66[1-68])|5(?:11[124-6]|33[2-8]|44[1467]|55[14]|66[1-3679]|77[124-79]|880))|3(?:3(?:11[0-46-8]|(?:22|55)[0-6]|33[0134689]|44[04]|66[01467])|4(?:44[0-8]|55[0-69]|66[0-3]|77[1-5]))|4(?:6(?:119|22[0-24-7]|33[1-5]|44[13-69]|55[14-689]|660|88[1-4])|7(?:(?:11|22)[1-9]|33[13-7]|44[13-6]|55[1-689]))|5(?:7(?:227|55[05]|(?:66|77)[14-8])|8(?:11[149]|22[013-79]|33[0-68]|44[013-8]|550|66[1-5]|77\\d)))\\d{4}", , , , "111112345", , , , [ 7 ] ], [ , , "9\\d{8}", , , , "911234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "ET", 251, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[1-59]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            FI: [ , [ , , "[1-35689]\\d{4}|7\\d{10,11}|(?:[124-7]\\d|3[0-46-9])\\d{8}|[1-9]\\d{5,8}", , , , , , , [ 5, 6, 7, 8, 9, 10, 11, 12 ] ], [ , , "(?:1[3-79][1-8]|[235689][1-8]\\d)\\d{2,6}", , , , "131234567", , , [ 5, 6, 7, 8, 9 ] ], [ , , "4946\\d{2,6}|(?:4[0-8]|50)\\d{4,8}", , , , "412345678", , , [ 6, 7, 8, 9, 10 ] ], [ , , "800\\d{4,6}", , , , "800123456", , , [ 7, 8, 9 ] ], [ , , "[67]00\\d{5,6}", , , , "600123456", , , [ 8, 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "FI", 358, "00|99(?:[01469]|5(?:[14]1|3[23]|5[59]|77|88|9[09]))", "0", , , "0", , "00", , [ [ , "(\\d{5})", "$1", [ "75[12]" ], "0$1" ], [ , "(\\d)(\\d{4,9})", "$1 $2", [ "[2568][1-8]|3(?:0[1-9]|[1-9])|9" ], "0$1" ], [ , "(\\d{6})", "$1", [ "11" ] ], [ , "(\\d{3})(\\d{3,7})", "$1 $2", [ "[12]00|[368]|70[07-9]" ], "0$1" ], [ , "(\\d{2})(\\d{4,8})", "$1 $2", [ "[1245]|7[135]" ], "0$1" ], [ , "(\\d{2})(\\d{6,10})", "$1 $2", [ "7" ], "0$1" ] ], [ [ , "(\\d)(\\d{4,9})", "$1 $2", [ "[2568][1-8]|3(?:0[1-9]|[1-9])|9" ], "0$1" ], [ , "(\\d{3})(\\d{3,7})", "$1 $2", [ "[12]00|[368]|70[07-9]" ], "0$1" ], [ , "(\\d{2})(\\d{4,8})", "$1 $2", [ "[1245]|7[135]" ], "0$1" ], [ , "(\\d{2})(\\d{6,10})", "$1 $2", [ "7" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], 1, "1[03-79]|[2-9]", [ , , "20(?:2[023]|9[89])\\d{1,6}|(?:60[12]\\d|7099)\\d{4,5}|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:[1-3]00|7(?:0[1-5]\\d\\d|5[03-9]))\\d{3,7}" ], [ , , "20\\d{4,8}|60[12]\\d{5,6}|7(?:099\\d{4,5}|5[03-9]\\d{3,7})|20[2-59]\\d\\d|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:10|29|3[09]|70[1-5]\\d)\\d{4,8}", , , , "10112345" ], , , [ , , , , , , , , , [ -1 ] ] ],
            FJ: [ , [ , , "45\\d{5}|(?:0800\\d|[235-9])\\d{6}", , , , , , , [ 7, 11 ] ], [ , , "603\\d{4}|(?:3[0-5]|6[25-7]|8[58])\\d{5}", , , , "3212345", , , [ 7 ] ], [ , , "(?:[279]\\d|45|5[01568]|8[034679])\\d{5}", , , , "7012345", , , [ 7 ] ], [ , , "0800\\d{7}", , , , "08001234567", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "FJ", 679, "0(?:0|52)", , , , , , "00", , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[235-9]|45" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "0" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            FK: [ , [ , , "[2-7]\\d{4}", , , , , , , [ 5 ] ], [ , , "[2-47]\\d{4}", , , , "31234" ], [ , , "[56]\\d{4}", , , , "51234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "FK", 500, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            FM: [ , [ , , "(?:[39]\\d\\d|820)\\d{4}", , , , , , , [ 7 ] ], [ , , "31(?:00[67]|208|309)\\d\\d|(?:3(?:[2357]0[1-9]|602|804|905)|(?:820|9[2-6]\\d)\\d)\\d{3}", , , , "3201234" ], [ , , "31(?:00[67]|208|309)\\d\\d|(?:3(?:[2357]0[1-9]|602|804|905)|(?:820|9[2-7]\\d)\\d)\\d{3}", , , , "3501234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "FM", 691, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[389]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            FO: [ , [ , , "[2-9]\\d{5}", , , , , , , [ 6 ] ], [ , , "(?:20|[34]\\d|8[19])\\d{4}", , , , "201234" ], [ , , "(?:[27][1-9]|5\\d|91)\\d{4}", , , , "211234" ], [ , , "80[257-9]\\d{3}", , , , "802123" ], [ , , "90(?:[13-5][15-7]|2[125-7]|9\\d)\\d\\d", , , , "901123" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:6[0-36]|88)\\d{4}", , , , "601234" ], "FO", 298, "00", , , , "(10(?:01|[12]0|88))", , , , [ [ , "(\\d{6})", "$1", [ "[2-9]" ], , "$CC $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            FR: [ , [ , , "[1-9]\\d{8}", , , , , , , [ 9 ] ], [ , , "(?:[1-35]\\d|4[1-9])\\d{7}", , , , "123456789" ], [ , , "(?:6(?:[0-24-8]\\d|3[0-8]|9[589])|7(?:00|[3-9]\\d))\\d{6}", , , , "612345678" ], [ , , "80[0-5]\\d{6}", , , , "801234567" ], [ , , "836(?:0[0-36-9]|[1-9]\\d)\\d{4}|8(?:1[2-9]|2[2-47-9]|3[0-57-9]|[569]\\d|8[0-35-9])\\d{6}", , , , "891123456" ], [ , , "8(?:1[01]|2[0156]|84)\\d{6}", , , , "884012345" ], [ , , , , , , , , , [ -1 ] ], [ , , "9\\d{8}", , , , "912345678" ], "FR", 33, "00", "0", , , "0", , , , [ [ , "(\\d{4})", "$1", [ "10" ] ], [ , "(\\d{3})(\\d{3})", "$1 $2", [ "1" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ], "0 $1" ], [ , "(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "[1-79]" ], "0$1" ] ], [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ], "0 $1" ], [ , "(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "[1-79]" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "80[6-9]\\d{6}", , , , "806123456" ], , , [ , , , , , , , , , [ -1 ] ] ],
            GA: [ , [ , , "(?:[067]\\d|11)\\d{6}|[2-7]\\d{6}", , , , , , , [ 7, 8 ] ], [ , , "[01]1\\d{6}", , , , "01441234", , , [ 8 ] ], [ , , "(?:(?:0[2-7]\\d|6(?:0[0-4]|10|[256]\\d))\\d|7(?:[47]\\d\\d|658))\\d{4}|[2-7]\\d{6}", , , , "06031234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GA", 241, "00", , , , "0(11\\d{6}|60\\d{6}|61\\d{6}|6[256]\\d{6}|7[47]\\d{6}|76\\d{6})", "$1", , , [ [ , "(\\d)(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2-7]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "11|[67]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "0" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GB: [ , [ , , "[1-357-9]\\d{9}|[18]\\d{8}|8\\d{6}", , , , , , , [ 7, 9, 10 ], [ 4, 5, 6, 8 ] ], [ , , "(?:1(?:1(?:3(?:[0-58]\\d\\d|73[0235])|4(?:[0-5]\\d\\d|69[7-9]|70[0359])|(?:5[0-26-9]|[78][0-49])\\d\\d|6(?:[0-4]\\d\\d|50[0-24-69]))|2(?:(?:0[024-9]|2[3-9]|3[3-79]|4[1-689]|[58][02-9]|6[0-47-9]|7[013-9]|9\\d)\\d\\d|1(?:[0-7]\\d\\d|8(?:[02]\\d|1[0-278])))|(?:3(?:0\\d|1[0-8]|[25][02-9]|3[02-579]|[468][0-46-9]|7[1-35-79]|9[2-578])|4(?:0[03-9]|[137]\\d|[28][02-57-9]|4[02-69]|5[0-8]|[69][0-79])|5(?:0[1-35-9]|[16]\\d|2[024-9]|3[015689]|4[02-9]|5[03-9]|7[0-35-9]|8[0-468]|9[0-57-9])|6(?:0[034689]|1\\d|2[0-35689]|[38][013-9]|4[1-467]|5[0-69]|6[13-9]|7[0-8]|9[0-24578])|7(?:0[0246-9]|2\\d|3[0236-8]|4[03-9]|5[0-46-9]|6[013-9]|7[0-35-9]|8[024-9]|9[02-9])|8(?:0[35-9]|2[1-57-9]|3[02-578]|4[0-578]|5[124-9]|6[2-69]|7\\d|8[02-9]|9[02569])|9(?:0[02-589]|[18]\\d|2[02-689]|3[1-57-9]|4[2-9]|5[0-579]|6[2-47-9]|7[0-24578]|9[2-57]))\\d\\d)|2(?:0[013478]|3[0189]|4[017]|8[0-46-9]|9[0-2])\\d{3})\\d{4}|1(?:2(?:0(?:46[1-4]|87[2-9])|545[1-79]|76(?:2\\d|3[1-8]|6[1-6])|9(?:7(?:2[0-4]|3[2-5])|8(?:2[2-8]|7[0-47-9]|8[3-5])))|3(?:6(?:38[2-5]|47[23])|8(?:47[04-9]|64[0157-9]))|4(?:044[1-7]|20(?:2[23]|8\\d)|6(?:0(?:30|5[2-57]|6[1-8]|7[2-8])|140)|8(?:052|87[1-3]))|5(?:2(?:4(?:3[2-79]|6\\d)|76\\d)|6(?:26[06-9]|686))|6(?:06(?:4\\d|7[4-79])|295[5-7]|35[34]\\d|47(?:24|61)|59(?:5[08]|6[67]|74)|9(?:55[0-4]|77[23]))|7(?:26(?:6[13-9]|7[0-7])|(?:442|688)\\d|50(?:2[0-3]|[3-68]2|76))|8(?:27[56]\\d|37(?:5[2-5]|8[239])|843[2-58])|9(?:0(?:0(?:6[1-8]|85)|52\\d)|3583|4(?:66[1-8]|9(?:2[01]|81))|63(?:23|3[1-4])|9561))\\d{3}", , , , "1212345678", , , [ 9, 10 ], [ 4, 5, 6, 7, 8 ] ], [ , , "7(?:457[0-57-9]|700[01]|911[028])\\d{5}|7(?:[1-3]\\d\\d|4(?:[0-46-9]\\d|5[0-689])|5(?:0[0-8]|[13-9]\\d|2[0-35-9])|7(?:0[1-9]|[1-7]\\d|8[02-9]|9[0-689])|8(?:[014-9]\\d|[23][0-8])|9(?:[024-9]\\d|1[02-9]|3[0-689]))\\d{6}", , , , "7400123456", , , [ 10 ] ], [ , , "80[08]\\d{7}|800\\d{6}|8001111", , , , "8001234567" ], [ , , "(?:8(?:4[2-5]|7[0-3])|9(?:[01]\\d|8[2-49]))\\d{7}|845464\\d", , , , "9012345678", , , [ 7, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70\\d{8}", , , , "7012345678", , , [ 10 ] ], [ , , "56\\d{8}", , , , "5612345678", , , [ 10 ] ], "GB", 44, "00", "0", " x", , "0", , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "800", "8001", "80011", "800111", "8001111" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", [ "845", "8454", "84546", "845464" ], "0$1" ], [ , "(\\d{3})(\\d{6})", "$1 $2", [ "800" ], "0$1" ], [ , "(\\d{5})(\\d{4,5})", "$1 $2", [ "1(?:38|5[23]|69|76|94)", "1(?:(?:38|69)7|5(?:24|39)|768|946)", "1(?:3873|5(?:242|39[4-6])|(?:697|768)[347]|9467)" ], "0$1" ], [ , "(\\d{4})(\\d{5,6})", "$1 $2", [ "1(?:[2-69][02-9]|[78])" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "[25]|7(?:0|6[02-9])", "[25]|7(?:0|6(?:[03-9]|2[356]))" ], "0$1" ], [ , "(\\d{4})(\\d{6})", "$1 $2", [ "7" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[1389]" ], "0$1" ] ], , [ , , "76(?:464|652)\\d{5}|76(?:0[0-2]|2[356]|34|4[01347]|5[49]|6[0-369]|77|81|9[139])\\d{6}", , , , "7640123456", , , [ 10 ] ], 1, , [ , , , , , , , , , [ -1 ] ], [ , , "(?:3[0347]|55)\\d{8}", , , , "5512345678", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GD: [ , [ , , "(?:473|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-49]|5[5-79]|73|90)|63[68]|7(?:58|84)|800|938)\\d{4}", , , , "4732691234", , , , [ 7 ] ], [ , , "473(?:4(?:0[2-79]|1[04-9]|2[0-5]|58)|5(?:2[01]|3[3-8])|901)\\d{4}", , , , "4734031234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "GD", 1, "011", "1", , , "1|([2-9]\\d{6})$", "473$1", , , , , [ , , , , , , , , , [ -1 ] ], , "473", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GE: [ , [ , , "(?:[3-57]\\d\\d|800)\\d{6}", , , , , , , [ 9 ], [ 6, 7 ] ], [ , , "(?:3(?:[256]\\d|4[124-9]|7[0-4])|4(?:1\\d|2[2-7]|3[1-79]|4[2-8]|7[239]|9[1-7]))\\d{6}", , , , "322123456", , , , [ 6, 7 ] ], [ , , "5(?:(?:0555|1177)[5-9]|757(?:7[7-9]|8[01]))\\d{3}|5(?:0070|(?:11|33)33|[25]222)[0-4]\\d{3}|5(?:00(?:0\\d|50)|11(?:00|1\\d|2[0-4])|5200|75(?:00|[57]5)|8(?:0(?:[01]\\d|2[0-4])|58[89]|8(?:55|88)))\\d{4}|(?:5(?:[14]4|5[0157-9]|68|7[0147-9]|9[1-35-9])|790)\\d{6}", , , , "555123456" ], [ , , "800\\d{6}", , , , "800123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70[67]\\d{6}", , , , "706123456" ], "GE", 995, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "70" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "32" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[57]" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[348]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "70[67]\\d{6}" ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GF: [ , [ , , "(?:[56]94|80\\d|976)\\d{6}", , , , , , , [ 9 ] ], [ , , "594(?:[023]\\d|1[01]|4[03-9]|5[6-9]|6[0-3]|80|9[0-4])\\d{4}", , , , "594101234" ], [ , , "694(?:[0-249]\\d|3[0-48])\\d{4}", , , , "694201234" ], [ , , "80[0-5]\\d{6}", , , , "800012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "976\\d{6}", , , , "976012345" ], "GF", 594, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[569]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GG: [ , [ , , "(?:1481|[357-9]\\d{3})\\d{6}|8\\d{6}(?:\\d{2})?", , , , , , , [ 7, 9, 10 ], [ 6 ] ], [ , , "1481[25-9]\\d{5}", , , , "1481256789", , , [ 10 ], [ 6 ] ], [ , , "7(?:(?:781|839)\\d|911[17])\\d{5}", , , , "7781123456", , , [ 10 ] ], [ , , "80[08]\\d{7}|800\\d{6}|8001111", , , , "8001234567" ], [ , , "(?:8(?:4[2-5]|7[0-3])|9(?:[01]\\d|8[0-3]))\\d{7}|845464\\d", , , , "9012345678", , , [ 7, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70\\d{8}", , , , "7012345678", , , [ 10 ] ], [ , , "56\\d{8}", , , , "5612345678", , , [ 10 ] ], "GG", 44, "00", "0", , , "0|([25-9]\\d{5})$", "1481$1", , , , , [ , , "76(?:464|652)\\d{5}|76(?:0[0-2]|2[356]|34|4[01347]|5[49]|6[0-369]|77|81|9[139])\\d{6}", , , , "7640123456", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:3[0347]|55)\\d{8}", , , , "5512345678", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GH: [ , [ , , "(?:[235]\\d{3}|800)\\d{5}", , , , , , , [ 8, 9 ], [ 7 ] ], [ , , "3082[0-5]\\d{4}|3(?:0(?:[237]\\d|8[01])|[167](?:2[0-6]|7\\d|80)|2(?:2[0-5]|7\\d|80)|3(?:2[0-3]|7\\d|80)|4(?:2[013-9]|3[01]|7\\d|80)|5(?:2[0-7]|7\\d|80)|8(?:2[0-2]|7\\d|80)|9(?:[28]0|7\\d))\\d{5}", , , , "302345678", , , [ 9 ], [ 7 ] ], [ , , "(?:2(?:[0346-8]\\d|5[67])|5(?:[0457]\\d|6[01]|9[1-9]))\\d{6}", , , , "231234567", , , [ 9 ] ], [ , , "800\\d{5}", , , , "80012345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GH", 233, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[237]|8[0-2]" ] ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "8" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[235]" ], "0$1" ] ], [ [ , "(\\d{3})(\\d{5})", "$1 $2", [ "8" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[235]" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "800\\d{5}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GI: [ , [ , , "(?:[25]\\d\\d|606)\\d{5}", , , , , , , [ 8 ] ], [ , , "21(?:6[24-7]\\d|90[0-2])\\d{3}|2(?:00|2[25])\\d{5}", , , , "20012345" ], [ , , "(?:5[146-8]\\d|606)\\d{5}", , , , "57123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GI", 350, "00", , , , , , , , [ [ , "(\\d{3})(\\d{5})", "$1 $2", [ "2" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GL: [ , [ , , "(?:19|[2-689]\\d|70)\\d{4}", , , , , , , [ 6 ] ], [ , , "(?:19|3[1-7]|6[14689]|70|8[14-79]|9\\d)\\d{4}", , , , "321000" ], [ , , "[245]\\d{5}", , , , "221234" ], [ , , "80\\d{4}", , , , "801234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "3[89]\\d{4}", , , , "381234" ], "GL", 299, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", [ "19|[2-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GM: [ , [ , , "[2-9]\\d{6}", , , , , , , [ 7 ] ], [ , , "(?:4(?:[23]\\d\\d|4(?:1[024679]|[6-9]\\d))|5(?:5(?:3\\d|4[0-7])|6[67]\\d|7(?:1[04]|2[035]|3[58]|48))|8\\d{3})\\d{3}", , , , "5661234" ], [ , , "(?:[23679]\\d|5[0-389])\\d{5}", , , , "3012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GM", 220, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[2-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GN: [ , [ , , "722\\d{6}|(?:3|6\\d)\\d{7}", , , , , , , [ 8, 9 ] ], [ , , "3(?:0(?:24|3[12]|4[1-35-7]|5[13]|6[189]|[78]1|9[1478])|1\\d\\d)\\d{4}", , , , "30241234", , , [ 8 ] ], [ , , "6[0-356]\\d{7}", , , , "601123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "722\\d{6}", , , , "722123456", , , [ 9 ] ], "GN", 224, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "3" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[67]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GP: [ , [ , , "(?:590|(?:69|80)\\d|976)\\d{6}", , , , , , , [ 9 ] ], [ , , "590(?:0[1-68]|1[0-2]|2[0-68]|3[1289]|4[0-24-9]|5[3-579]|6[0189]|7[08]|8[0-689]|9\\d)\\d{4}", , , , "590201234" ], [ , , "69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))\\d{4}", , , , "690001234" ], [ , , "80[0-5]\\d{6}", , , , "800012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "976[01]\\d{5}", , , , "976012345" ], "GP", 590, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[569]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], 1, , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GQ: [ , [ , , "222\\d{6}|(?:3\\d|55|[89]0)\\d{7}", , , , , , , [ 9 ] ], [ , , "33[0-24-9]\\d[46]\\d{4}|3(?:33|5\\d)\\d[7-9]\\d{4}", , , , "333091234" ], [ , , "(?:222|55\\d)\\d{6}", , , , "222123456" ], [ , , "80\\d[1-9]\\d{5}", , , , "800123456" ], [ , , "90\\d[1-9]\\d{5}", , , , "900123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GQ", 240, "00", , , , , , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[235]" ] ], [ , "(\\d{3})(\\d{6})", "$1 $2", [ "[89]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GR: [ , [ , , "5005000\\d{3}|8\\d{9,11}|(?:[269]\\d|70)\\d{8}", , , , , , , [ 10, 11, 12 ] ], [ , , "2(?:1\\d\\d|2(?:2[1-46-9]|[36][1-8]|4[1-7]|5[1-4]|7[1-5]|[89][1-9])|3(?:1\\d|2[1-57]|[35][1-3]|4[13]|7[1-7]|8[124-6]|9[1-79])|4(?:1\\d|2[1-8]|3[1-4]|4[13-5]|6[1-578]|9[1-5])|5(?:1\\d|[29][1-4]|3[1-5]|4[124]|5[1-6])|6(?:1\\d|[269][1-6]|3[1245]|4[1-7]|5[13-9]|7[14]|8[1-5])|7(?:1\\d|2[1-5]|3[1-6]|4[1-7]|5[1-57]|6[135]|9[125-7])|8(?:1\\d|2[1-5]|[34][1-4]|9[1-57]))\\d{6}", , , , "2123456789", , , [ 10 ] ], [ , , "68[57-9]\\d{7}|(?:69|94)\\d{8}", , , , "6912345678", , , [ 10 ] ], [ , , "800\\d{7,9}", , , , "8001234567" ], [ , , "90[19]\\d{7}", , , , "9091234567", , , [ 10 ] ], [ , , "8(?:0[16]|12|[27]5|50)\\d{7}", , , , "8011234567", , , [ 10 ] ], [ , , "70\\d{8}", , , , "7012345678", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], "GR", 30, "00", , , , , , , , [ [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "21|7" ] ], [ , "(\\d{4})(\\d{6})", "$1 $2", [ "2(?:2|3[2-57-9]|4[2-469]|5[2-59]|6[2-9]|7[2-69]|8[2-49])|5" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2689]" ] ], [ , "(\\d{3})(\\d{3,4})(\\d{5})", "$1 $2 $3", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "5005000\\d{3}", , , , "5005000123", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GT: [ , [ , , "(?:1\\d{3}|[2-7])\\d{7}", , , , , , , [ 8, 11 ] ], [ , , "[267][2-9]\\d{6}", , , , "22456789", , , [ 8 ] ], [ , , "[3-5]\\d{7}", , , , "51234567", , , [ 8 ] ], [ , , "18[01]\\d{8}", , , , "18001112222", , , [ 11 ] ], [ , , "19\\d{9}", , , , "19001112222", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GT", 502, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[2-7]" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GU: [ , [ , , "(?:[58]\\d\\d|671|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}", , , , "6713001234", , , , [ 7 ] ], [ , , "671(?:3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[0236-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[48])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[78]))\\d{4}", , , , "6713001234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "GU", 1, "011", "1", , , "1|([3-9]\\d{6})$", "671$1", , 1, , , [ , , , , , , , , , [ -1 ] ], , "671", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GW: [ , [ , , "[49]\\d{8}|4\\d{6}", , , , , , , [ 7, 9 ] ], [ , , "443\\d{6}", , , , "443201234", , , [ 9 ] ], [ , , "9(?:5\\d|6[569]|77)\\d{6}", , , , "955012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "40\\d{5}", , , , "4012345", , , [ 7 ] ], "GW", 245, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "40" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[49]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            GY: [ , [ , , "(?:862\\d|9008)\\d{3}|(?:[2-46]\\d|77)\\d{5}", , , , , , , [ 7 ] ], [ , , "(?:2(?:1[6-9]|2[0-35-9]|3[1-4]|5[3-9]|6\\d|7[0-24-79])|3(?:2[25-9]|3\\d)|4(?:4[0-24]|5[56])|77[1-57])\\d{4}", , , , "2201234" ], [ , , "6\\d{6}", , , , "6091234" ], [ , , "(?:289|862)\\d{4}", , , , "2891234" ], [ , , "9008\\d{3}", , , , "9008123" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "GY", 592, "001", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[2-46-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            HK: [ , [ , , "8[0-46-9]\\d{6,7}|9\\d{4}(?:\\d(?:\\d(?:\\d{4})?)?)?|(?:[235-79]\\d|46)\\d{6}", , , , , , , [ 5, 6, 7, 8, 9, 11 ] ], [ , , "(?:2(?:[13-9]\\d|2[013-9])\\d|3(?:(?:[1569][0-24-9]|4[0-246-9]|7[0-24-69])\\d|8(?:4[0-8]|5[0-5]|9\\d))|58(?:0[1-8]|1[2-9]))\\d{4}", , , , "21234567", , , [ 8 ] ], [ , , "(?:46(?:[07][0-7]|1[0-6]|4[0-57-9]|5[0-8]|6[0-4])|573[0-6]|6(?:26[013-7]|66[0-3])|70(?:7[1-5]|8[0-4])|848[015-9]|929[03-9])\\d{4}|(?:46[238]|5(?:[1-59][0-46-9]|6[0-4689]|7[0-2469])|6(?:0[1-9]|[13-59]\\d|[268][0-57-9]|7[0-79])|84[09]|9(?:0[1-9]|1[02-9]|[2358][0-8]|[467]\\d))\\d{5}", , , , "51234567", , , [ 8 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "900(?:[0-24-9]\\d{7}|3\\d{1,4})", , , , "90012345678", , , [ 5, 6, 7, 8, 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "8(?:1[0-4679]\\d|2(?:[0-36]\\d|7[0-4])|3(?:[034]\\d|2[09]|70))\\d{4}", , , , "81123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], "HK", 852, "00(?:30|5[09]|[126-9]?)", , , , , , "00", , [ [ , "(\\d{3})(\\d{2,5})", "$1 $2", [ "900", "9003" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[2-7]|8[1-4]|9(?:0[1-9]|[1-8])" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8" ] ], [ , "(\\d{3})(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "9" ] ] ], , [ , , "7(?:1(?:0[0-38]|1[0-3679]|3[013]|69|9[0136])|2(?:[02389]\\d|1[18]|7[27-9])|3(?:[0-38]\\d|7[0-369]|9[2357-9])|47\\d|5(?:[178]\\d|5[0-5])|6(?:0[0-7]|2[236-9]|[35]\\d)|7(?:[27]\\d|8[7-9])|8(?:[23689]\\d|7[1-9])|9(?:[025]\\d|6[0-246-8]|7[0-36-9]|8[238]))\\d{4}", , , , "71123456", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "30(?:0[1-9]|[15-7]\\d|2[047]|89)\\d{4}", , , , "30161234", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            HN: [ , [ , , "8\\d{10}|[237-9]\\d{7}", , , , , , , [ 8, 11 ] ], [ , , "2(?:2(?:0[0-39]|1[1-367]|[23]\\d|4[03-6]|5[57]|6[245]|7[0135689]|8[01346-9]|9[0-2])|4(?:0[78]|2[3-59]|3[13-9]|4[0-68]|5[1-35])|5(?:0[7-9]|16|4[03-5]|5\\d|6[014-6]|7[04]|80)|6(?:[056]\\d|17|2[067]|3[04]|4[0-378]|[78][0-8]|9[01])|7(?:6[46-9]|7[02-9]|8[034]|91)|8(?:79|8[0-357-9]|9[1-57-9]))\\d{4}", , , , "22123456", , , [ 8 ] ], [ , , "[37-9]\\d{7}", , , , "91234567", , , [ 8 ] ], [ , , "8002\\d{7}", , , , "80021234567", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "HN", 504, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1-$2", [ "[237-9]" ] ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "8" ] ] ], [ [ , "(\\d{4})(\\d{4})", "$1-$2", [ "[237-9]" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "8002\\d{7}", , , , , , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            HR: [ , [ , , "(?:[24-69]\\d|3[0-79])\\d{7}|80\\d{5,7}|[1-79]\\d{7}|6\\d{5,6}", , , , , , , [ 6, 7, 8, 9 ] ], [ , , "1\\d{7}|(?:2[0-3]|3[1-5]|4[02-47-9]|5[1-3])\\d{6,7}", , , , "12345678", , , [ 8, 9 ], [ 6, 7 ] ], [ , , "9(?:751\\d{5}|8\\d{6,7})|9(?:0[1-9]|[1259]\\d|7[0679])\\d{6}", , , , "921234567", , , [ 8, 9 ] ], [ , , "80[01]\\d{4,6}", , , , "800123456", , , [ 7, 8, 9 ] ], [ , , "6[01459]\\d{6}|6[01]\\d{4,5}", , , , "611234", , , [ 6, 7, 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "7[45]\\d{6}", , , , "74123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], "HR", 385, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{2,3})", "$1 $2 $3", [ "6[01]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2,3})", "$1 $2 $3", [ "8" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{3})", "$1 $2 $3", [ "1" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[67]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "9" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[2-5]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "62\\d{6,7}|72\\d{6}", , , , "62123456", , , [ 8, 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            HT: [ , [ , , "[2-489]\\d{7}", , , , , , , [ 8 ] ], [ , , "2(?:2\\d|5[1-5]|81|9[149])\\d{5}", , , , "22453300" ], [ , , "[34]\\d{7}", , , , "34101234" ], [ , , "8\\d{7}", , , , "80012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "9(?:[67][0-4]|8[0-3589]|9\\d)\\d{5}", , , , "98901234" ], "HT", 509, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", [ "[2-489]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            HU: [ , [ , , "[235-7]\\d{8}|[1-9]\\d{7}", , , , , , , [ 8, 9 ], [ 6, 7 ] ], [ , , "(?:1\\d|[27][2-9]|3[2-7]|4[24-9]|5[2-79]|6[23689]|8[2-57-9]|9[2-69])\\d{6}", , , , "12345678", , , [ 8 ], [ 6, 7 ] ], [ , , "(?:[257]0|3[01])\\d{7}", , , , "201234567", , , [ 9 ] ], [ , , "(?:[48]0\\d|680[29])\\d{5}", , , , "80123456" ], [ , , "9[01]\\d{6}", , , , "90123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "21\\d{7}", , , , "211234567", , , [ 9 ] ], "HU", 36, "00", "06", , , "06", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ], "(06 $1)" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[27][2-9]|3[2-7]|4[24-9]|5[2-79]|6|8[2-57-9]|9[2-69]" ], "(06 $1)" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[2-9]" ], "06 $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "(?:[48]0\\d|680[29])\\d{5}" ], [ , , "38\\d{7}", , , , "381234567", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ID: [ , [ , , "(?:(?:00[1-9]|8\\d)\\d{4}|[1-36])\\d{6}|00\\d{10}|[1-9]\\d{8,10}|[2-9]\\d{7}", , , , , , , [ 7, 8, 9, 10, 11, 12, 13 ], [ 5, 6 ] ], [ , , "2[124]\\d{7,8}|619\\d{8}|2(?:1(?:14|500)|2\\d{3})\\d{3}|61\\d{5,8}|(?:2(?:[35][1-4]|6[0-8]|7[1-6]|8\\d|9[1-8])|3(?:1|[25][1-8]|3[1-68]|4[1-3]|6[1-3568]|7[0-469]|8\\d)|4(?:0[1-589]|1[01347-9]|2[0-36-8]|3[0-24-68]|43|5[1-378]|6[1-5]|7[134]|8[1245])|5(?:1[1-35-9]|2[25-8]|3[124-9]|4[1-3589]|5[1-46]|6[1-8])|6(?:[25]\\d|3[1-69]|4[1-6])|7(?:02|[125][1-9]|[36]\\d|4[1-8]|7[0-36-9])|9(?:0[12]|1[013-8]|2[0-479]|5[125-8]|6[23679]|7[159]|8[01346]))\\d{5,8}", , , , "218350123", , , [ 7, 8, 9, 10, 11 ], [ 5, 6 ] ], [ , , "8[1-35-9]\\d{7,10}", , , , "812345678", , , [ 9, 10, 11, 12 ] ], [ , , "00[17]803\\d{7}|(?:177\\d|800)\\d{5,7}|001803\\d{6}", , , , "8001234567", , , [ 8, 9, 10, 11, 12, 13 ] ], [ , , "809\\d{7}", , , , "8091234567", , , [ 10 ] ], [ , , "804\\d{7}", , , , "8041234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "ID", 62, "00[89]", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "15" ] ], [ , "(\\d{2})(\\d{5,9})", "$1 $2", [ "2[124]|[36]1" ], "(0$1)" ], [ , "(\\d{3})(\\d{5,7})", "$1 $2", [ "800" ], "0$1" ], [ , "(\\d{3})(\\d{5,8})", "$1 $2", [ "[2-79]" ], "(0$1)" ], [ , "(\\d{3})(\\d{3,4})(\\d{3})", "$1-$2-$3", [ "8[1-35-9]" ], "0$1" ], [ , "(\\d{3})(\\d{6,8})", "$1 $2", [ "1" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "804" ], "0$1" ], [ , "(\\d{3})(\\d)(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "80" ], "0$1" ], [ , "(\\d{3})(\\d{4})(\\d{4,5})", "$1-$2-$3", [ "8" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "001" ] ], [ , "(\\d{2})(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "0" ] ] ], [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "15" ] ], [ , "(\\d{2})(\\d{5,9})", "$1 $2", [ "2[124]|[36]1" ], "(0$1)" ], [ , "(\\d{3})(\\d{5,7})", "$1 $2", [ "800" ], "0$1" ], [ , "(\\d{3})(\\d{5,8})", "$1 $2", [ "[2-79]" ], "(0$1)" ], [ , "(\\d{3})(\\d{3,4})(\\d{3})", "$1-$2-$3", [ "8[1-35-9]" ], "0$1" ], [ , "(\\d{3})(\\d{6,8})", "$1 $2", [ "1" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "804" ], "0$1" ], [ , "(\\d{3})(\\d)(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "80" ], "0$1" ], [ , "(\\d{3})(\\d{4})(\\d{4,5})", "$1-$2-$3", [ "8" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "001803\\d{6,7}|(?:007803\\d|8071)\\d{6}", , , , , , , [ 10, 12, 13 ] ], [ , , "(?:1500|8071\\d{3})\\d{3}", , , , "8071123456", , , [ 7, 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            IE: [ , [ , , "(?:1\\d|[2569])\\d{6,8}|4\\d{6,9}|7\\d{8}|8\\d{8,9}", , , , , , , [ 7, 8, 9, 10 ], [ 5, 6 ] ], [ , , "(?:1\\d|21)\\d{6,7}|(?:2[24-9]|4(?:0[24]|5\\d|7)|5(?:0[45]|1\\d|8)|6(?:1\\d|[237-9])|9(?:1\\d|[35-9]))\\d{5}|(?:23|4(?:[1-469]|8\\d)|5[23679]|6[4-6]|7[14]|9[04])\\d{7}", , , , "2212345", , , , [ 5, 6 ] ], [ , , "8(?:22|[35-9]\\d)\\d{6}", , , , "850123456", , , [ 9 ] ], [ , , "1800\\d{6}", , , , "1800123456", , , [ 10 ] ], [ , , "15(?:1[2-8]|[2-8]0|9[089])\\d{6}", , , , "1520123456", , , [ 10 ] ], [ , , "18[59]0\\d{6}", , , , "1850123456", , , [ 10 ] ], [ , , "700\\d{6}", , , , "700123456", , , [ 9 ] ], [ , , "76\\d{7}", , , , "761234567", , , [ 9 ] ], "IE", 353, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{5})", "$1 $2", [ "2[24-9]|47|58|6[237-9]|9[35-9]" ], "(0$1)" ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "[45]0" ], "(0$1)" ], [ , "(\\d)(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "1" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[2569]|4[1-69]|7[14]" ], "(0$1)" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "70" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "81" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[78]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1" ] ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "4" ], "(0$1)" ], [ , "(\\d{2})(\\d)(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "18[59]0\\d{6}", , , , , , , [ 10 ] ], [ , , "818\\d{6}", , , , "818123456", , , [ 9 ] ], , , [ , , "88210[1-9]\\d{4}|8(?:[35-79]5\\d\\d|8(?:[013-9]\\d\\d|2(?:[01][1-9]|[2-9]\\d)))\\d{5}", , , , "8551234567", , , [ 10 ] ] ],
            IL: [ , [ , , "1\\d{6}(?:\\d{3,5})?|[57]\\d{8}|[1-489]\\d{7}", , , , , , , [ 7, 8, 9, 10, 11, 12 ] ], [ , , "153\\d{8,9}|29[1-9]\\d{5}|(?:2[0-8]|[3489]\\d)\\d{6}", , , , "21234567", , , [ 8, 11, 12 ], [ 7 ] ], [ , , "5(?:(?:[02368]\\d|[19][2-9]|4[1-9])\\d|5(?:01|1[79]|2[2-9]|3[0-3]|4[34]|5[015689]|6[6-8]|7[0-267]|8[7-9]|9[1-9]))\\d{5}", , , , "502345678", , , [ 9 ] ], [ , , "1(?:255|80[019]\\d{3})\\d{3}", , , , "1800123456", , , [ 7, 10 ] ], [ , , "1212\\d{4}|1(?:200|9(?:0[01]|19))\\d{6}", , , , "1919123456", , , [ 8, 10 ] ], [ , , "1700\\d{6}", , , , "1700123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "7(?:380|8(?:33|55|77|81))\\d{5}|7(?:18|2[23]|3[237]|47|6[58]|7\\d|82|9[235-9])\\d{6}", , , , "771234567", , , [ 9 ] ], "IL", 972, "0(?:0|1[2-9])", "0", , , "0", , , , [ [ , "(\\d{4})(\\d{3})", "$1-$2", [ "125" ] ], [ , "(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3", [ "121" ] ], [ , "(\\d)(\\d{3})(\\d{4})", "$1-$2-$3", [ "[2-489]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "[57]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1-$2-$3", [ "12" ] ], [ , "(\\d{4})(\\d{6})", "$1-$2", [ "159" ] ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{3})", "$1-$2-$3-$4", [ "1[7-9]" ] ], [ , "(\\d{3})(\\d{1,2})(\\d{3})(\\d{4})", "$1-$2 $3-$4", [ "15" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "1700\\d{6}", , , , , , , [ 10 ] ], [ , , "1599\\d{6}", , , , "1599123456", , , [ 10 ] ], , , [ , , "151\\d{8,9}", , , , "15112340000", , , [ 11, 12 ] ] ],
            IM: [ , [ , , "1624\\d{6}|(?:[3578]\\d|90)\\d{8}", , , , , , , [ 10 ], [ 6 ] ], [ , , "1624(?:230|[5-8]\\d\\d)\\d{3}", , , , "1624756789", , , , [ 6 ] ], [ , , "76245[06]\\d{4}|7(?:4576|[59]24\\d|624[0-4689])\\d{5}", , , , "7924123456" ], [ , , "808162\\d{4}", , , , "8081624567" ], [ , , "8(?:440[49]06|72299\\d)\\d{3}|(?:8(?:45|70)|90[0167])624\\d{4}", , , , "9016247890" ], [ , , , , , , , , , [ -1 ] ], [ , , "70\\d{8}", , , , "7012345678" ], [ , , "56\\d{8}", , , , "5612345678" ], "IM", 44, "00", "0", , , "0|([25-8]\\d{5})$", "1624$1", , , , , [ , , , , , , , , , [ -1 ] ], , "74576|(?:16|7[56])24", [ , , , , , , , , , [ -1 ] ], [ , , "3440[49]06\\d{3}|(?:3(?:08162|3\\d{4}|45624|7(?:0624|2299))|55\\d{4})\\d{4}", , , , "5512345678" ], , , [ , , , , , , , , , [ -1 ] ] ],
            IN: [ , [ , , "(?:000800|[2-9]\\d\\d)\\d{7}|1\\d{7,12}", , , , , , , [ 8, 9, 10, 11, 12, 13 ], [ 6, 7 ] ], [ , , "2717(?:[2-7]\\d|95)\\d{4}|(?:271[0-689]|782[0-6])[2-7]\\d{5}|(?:170[24]|2(?:(?:[02][2-79]|90)\\d|80[13468])|(?:3(?:23|80)|683|79[1-7])\\d|4(?:20[24]|72[2-8])|552[1-7])\\d{6}|(?:11|33|4[04]|80)[2-7]\\d{7}|(?:342|674|788)(?:[0189][2-7]|[2-7]\\d)\\d{5}|(?:1(?:2[0-249]|3[0-25]|4[145]|[59][14]|6[014]|7[1257]|8[01346])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568]|9[14])|3(?:26|4[13]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[014-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|2[14]|3[134]|4[47]|5[15]|[67]1)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91))[2-7]\\d{6}|(?:1(?:2[35-8]|3[346-9]|4[236-9]|[59][0235-9]|6[235-9]|7[34689]|8[257-9])|2(?:1[134689]|3[24-8]|4[2-8]|5[25689]|6[2-4679]|7[3-79]|8[2-479]|9[235-9])|3(?:01|1[79]|2[1245]|4[5-8]|5[125689]|6[235-7]|7[157-9]|8[2-46-8])|4(?:1[14578]|2[5689]|3[2-467]|5[4-7]|6[35]|73|8[2689]|9[2389])|5(?:[16][146-9]|2[14-8]|3[1346]|4[14-69]|5[46]|7[2-4]|8[2-8]|9[246])|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[124-6])|7(?:1[013-9]|2[0235-9]|3[2679]|4[1-35689]|5[2-46-9]|[67][02-9]|8[013-7]|9[089])|8(?:1[1357-9]|2[235-8]|3[03-57-9]|4[0-24-9]|5\\d|6[2457-9]|7[1-6]|8[1256]|9[2-4]))\\d[2-7]\\d{5}", , , , "7410410123", , , [ 10 ], [ 6, 7, 8 ] ], [ , , "(?:61279|7(?:887[02-9]|9(?:313|79[07-9]))|8(?:079[04-9]|(?:84|91)7[02-8]))\\d{5}|(?:6(?:12|[2-47]1|5[17]|6[13]|80)[0189]|7(?:1(?:2[0189]|9[0-5])|2(?:[14][017-9]|8[0-59])|3(?:2[5-8]|[34][017-9]|9[016-9])|4(?:1[015-9]|[29][89]|39|8[389])|5(?:[15][017-9]|2[04-9]|9[7-9])|6(?:0[0-47]|1[0-257-9]|2[0-4]|3[19]|5[4589])|70[0289]|88[089]|97[02-8])|8(?:0(?:6[67]|7[02-8])|70[017-9]|84[01489]|91[0-289]))\\d{6}|(?:7(?:31|4[47])|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[0189]\\d|7[02-8])\\d{5}|(?:6(?:[09]\\d|1[04679]|2[03689]|3[05-9]|4[0489]|50|6[069]|7[07]|8[7-9])|7(?:0\\d|2[0235-79]|3[05-8]|40|5[0346-8]|6[6-9]|7[1-9]|8[0-79]|9[089])|8(?:0[01589]|1[0-57-9]|2[235-9]|3[03-57-9]|[45]\\d|6[02457-9]|7[1-69]|8[0-25-9]|9[02-9])|9\\d\\d)\\d{7}|(?:6(?:(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|8[124-6])\\d|7(?:[235689]\\d|4[0189]))|7(?:1(?:[013-8]\\d|9[6-9])|28[6-8]|3(?:2[0-49]|9[2-5])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]\\d|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]|881))[0189]\\d{5}", , , , "8123456789", , , [ 10 ] ], [ , , "000800\\d{7}|1(?:600\\d{6}|80(?:0\\d{4,9}|3\\d{9}))", , , , "1800123456" ], [ , , "186[12]\\d{9}", , , , "1861123456789", , , [ 13 ] ], [ , , "1860\\d{7}", , , , "18603451234", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "IN", 91, "00", "0", , , "0", , , , [ [ , "(\\d{7})", "$1", [ "575" ] ], [ , "(\\d{8})", "$1", [ "5(?:0|2[23]|3[03]|[67]1|88)", "5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|888)", "5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|8888)" ], , , 1 ], [ , "(\\d{4})(\\d{4,5})", "$1 $2", [ "180", "1800" ], , , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "140" ], , , 1 ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "11|2[02]|33|4[04]|79[1-7]|80[2-46]", "11|2[02]|33|4[04]|79(?:[1-6]|7[19])|80(?:[2-4]|6[0-589])", "11|2[02]|33|4[04]|79(?:[124-6]|3(?:[02-9]|1[0-24-9])|7(?:1|9[1-6]))|80(?:[2-4]|6[0-589])" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1(?:2[0-249]|3[0-25]|4[145]|[68]|7[1257])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|5[12]|[78]1)|6(?:12|[2-4]1|5[17]|6[13]|80)|7(?:12|3[134]|4[47]|61|88)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)|(?:43|59|75)[15]|(?:1[59]|29|67|72)[14]", "1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|674|7(?:(?:2[14]|3[34]|5[15])[2-6]|61[346]|88[0-8])|8(?:70[2-6]|84[235-7]|91[3-7])|(?:1(?:29|60|8[06])|261|552|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|31|4[47])|8(?:16|2[014]|3[126]|6[136]|7[78]|83))[2-7]", "1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12(?:[2-6]|7[0-8])|74[2-7])|7(?:(?:2[14]|5[15])[2-6]|3171|61[346]|88(?:[2-7]|82))|8(?:70[2-6]|84(?:[2356]|7[19])|91(?:[3-6]|7[19]))|73[134][2-6]|(?:74[47]|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[2-6]|7[19])|(?:1(?:29|60|8[06])|261|552|6(?:[2-4]1|5[17]|6[13]|7(?:1|4[0189])|80)|7(?:12|88[01]))[2-7]" ], "0$1", , 1 ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2[2457-9]|3[2-5]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1[013-9]|28|3[129]|4[1-35689]|5[29]|6[02-5]|70)|807", "1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2(?:[2457]|84|95)|3(?:[2-4]|55)|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1(?:[013-8]|9[6-9])|28[6-8]|3(?:17|2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4|5[0-367])|70[13-7])|807[19]", "1(?:[2-479]|5(?:[0236-9]|5[013-9]))|[2-5]|6(?:2(?:84|95)|355|83)|73179|807(?:1|9[1-3])|(?:1552|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[124-6])\\d|7(?:1(?:[013-8]\\d|9[6-9])|28[6-8]|3(?:2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]\\d|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]))[2-7]" ], "0$1", , 1 ], [ , "(\\d{5})(\\d{5})", "$1 $2", [ "[6-9]" ], "0$1", , 1 ], [ , "(\\d{4})(\\d{2,4})(\\d{4})", "$1 $2 $3", [ "1(?:6|8[06])", "1(?:6|8[06]0)" ], , , 1 ], [ , "(\\d{3})(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "0" ] ], [ , "(\\d{4})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "18" ], , , 1 ] ], [ [ , "(\\d{8})", "$1", [ "5(?:0|2[23]|3[03]|[67]1|88)", "5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|888)", "5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|8888)" ], , , 1 ], [ , "(\\d{4})(\\d{4,5})", "$1 $2", [ "180", "1800" ], , , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "140" ], , , 1 ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "11|2[02]|33|4[04]|79[1-7]|80[2-46]", "11|2[02]|33|4[04]|79(?:[1-6]|7[19])|80(?:[2-4]|6[0-589])", "11|2[02]|33|4[04]|79(?:[124-6]|3(?:[02-9]|1[0-24-9])|7(?:1|9[1-6]))|80(?:[2-4]|6[0-589])" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1(?:2[0-249]|3[0-25]|4[145]|[68]|7[1257])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|5[12]|[78]1)|6(?:12|[2-4]1|5[17]|6[13]|80)|7(?:12|3[134]|4[47]|61|88)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)|(?:43|59|75)[15]|(?:1[59]|29|67|72)[14]", "1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|674|7(?:(?:2[14]|3[34]|5[15])[2-6]|61[346]|88[0-8])|8(?:70[2-6]|84[235-7]|91[3-7])|(?:1(?:29|60|8[06])|261|552|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|31|4[47])|8(?:16|2[014]|3[126]|6[136]|7[78]|83))[2-7]", "1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12(?:[2-6]|7[0-8])|74[2-7])|7(?:(?:2[14]|5[15])[2-6]|3171|61[346]|88(?:[2-7]|82))|8(?:70[2-6]|84(?:[2356]|7[19])|91(?:[3-6]|7[19]))|73[134][2-6]|(?:74[47]|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[2-6]|7[19])|(?:1(?:29|60|8[06])|261|552|6(?:[2-4]1|5[17]|6[13]|7(?:1|4[0189])|80)|7(?:12|88[01]))[2-7]" ], "0$1", , 1 ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2[2457-9]|3[2-5]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1[013-9]|28|3[129]|4[1-35689]|5[29]|6[02-5]|70)|807", "1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2(?:[2457]|84|95)|3(?:[2-4]|55)|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1(?:[013-8]|9[6-9])|28[6-8]|3(?:17|2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4|5[0-367])|70[13-7])|807[19]", "1(?:[2-479]|5(?:[0236-9]|5[013-9]))|[2-5]|6(?:2(?:84|95)|355|83)|73179|807(?:1|9[1-3])|(?:1552|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[124-6])\\d|7(?:1(?:[013-8]\\d|9[6-9])|28[6-8]|3(?:2[0-49]|9[2-57])|4(?:1[2-4]|[29][0-7]|3[0-8]|[56]\\d|8[0-24-7])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]))[2-7]" ], "0$1", , 1 ], [ , "(\\d{5})(\\d{5})", "$1 $2", [ "[6-9]" ], "0$1", , 1 ], [ , "(\\d{4})(\\d{2,4})(\\d{4})", "$1 $2 $3", [ "1(?:6|8[06])", "1(?:6|8[06]0)" ], , , 1 ], [ , "(\\d{4})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "18" ], , , 1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "1(?:600\\d{6}|800\\d{4,9})|(?:000800|18(?:03\\d\\d|6(?:0|[12]\\d\\d)))\\d{7}" ], [ , , "140\\d{7}", , , , "1409305260", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            IO: [ , [ , , "3\\d{6}", , , , , , , [ 7 ] ], [ , , "37\\d{5}", , , , "3709100" ], [ , , "38\\d{5}", , , , "3801234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "IO", 246, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "3" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            IQ: [ , [ , , "(?:1|7\\d\\d)\\d{7}|[2-6]\\d{7,8}", , , , , , , [ 8, 9, 10 ], [ 6, 7 ] ], [ , , "1\\d{7}|(?:2[13-5]|3[02367]|4[023]|5[03]|6[026])\\d{6,7}", , , , "12345678", , , [ 8, 9 ], [ 6, 7 ] ], [ , , "7[3-9]\\d{8}", , , , "7912345678", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "IQ", 964, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[2-6]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "7" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            IR: [ , [ , , "[1-9]\\d{9}|(?:[1-8]\\d\\d|9)\\d{3,4}", , , , , , , [ 4, 5, 6, 7, 10 ], [ 8 ] ], [ , , "(?:1[137]|2[13-68]|3[1458]|4[145]|5[1468]|6[16]|7[1467]|8[13467])(?:[03-57]\\d{7}|[16]\\d{3}(?:\\d{4})?|[289]\\d{3}(?:\\d(?:\\d{3})?)?)|94(?:000[09]|2(?:121|[2689]0\\d)|30[0-2]\\d|4(?:111|40\\d))\\d{4}", , , , "2123456789", , , [ 6, 7, 10 ], [ 4, 5, 8 ] ], [ , , "9(?:(?:0(?:[0-35]\\d|4[4-6])|(?:[13]\\d|2[0-3])\\d)\\d|9(?:(?:[0-3]\\d|4[0145])\\d|5[15]0|8(?:1\\d|88)|9(?:0[013]|[19]\\d|21|77|8[7-9])))\\d{5}", , , , "9123456789", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "IR", 98, "00", "0", , , "0", , , , [ [ , "(\\d{4,5})", "$1", [ "96" ], "0$1" ], [ , "(\\d{2})(\\d{4,5})", "$1 $2", [ "(?:1[137]|2[13-68]|3[1458]|4[145]|5[1468]|6[16]|7[1467]|8[13467])[12689]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "9" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "[1-8]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "9(?:4440\\d{5}|6(?:0[12]|2[16-8]|3(?:08|[14]5|[23]|66)|4(?:0|80)|5[01]|6[89]|86|9[19]))", , , , , , , [ 4, 5, 10 ] ], [ , , "96(?:0[12]|2[16-8]|3(?:08|[14]5|[23]|66)|4(?:0|80)|5[01]|6[89]|86|9[19])", , , , "9601", , , [ 4, 5 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            IS: [ , [ , , "(?:38\\d|[4-9])\\d{6}", , , , , , , [ 7, 9 ] ], [ , , "(?:4(?:1[0-24-69]|2[0-7]|[37][0-8]|4[0-245]|5[0-68]|6\\d|8[0-36-8])|5(?:05|[156]\\d|2[02578]|3[0-579]|4[03-7]|7[0-2578]|8[0-35-9]|9[013-689])|872)\\d{4}", , , , "4101234", , , [ 7 ] ], [ , , "(?:38[589]\\d\\d|6(?:1[1-8]|2[0-6]|3[027-9]|4[014679]|5[0159]|6[0-69]|70|8[06-8]|9\\d)|7(?:5[057]|[6-9]\\d)|8(?:2[0-59]|[3-69]\\d|8[28]))\\d{4}", , , , "6111234" ], [ , , "80[08]\\d{4}", , , , "8001234", , , [ 7 ] ], [ , , "90(?:0\\d|1[5-79]|2[015-79]|3[135-79]|4[125-7]|5[25-79]|7[1-37]|8[0-35-7])\\d{3}", , , , "9001234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "49[0-24-79]\\d{4}", , , , "4921234", , , [ 7 ] ], "IS", 354, "00|1(?:0(?:01|[12]0)|100)", , , , , , "00", , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[4-9]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "3" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "809\\d{4}", , , , "8091234", , , [ 7 ] ], , , [ , , "(?:689|8(?:7[18]|80)|95[48])\\d{4}", , , , "6891234", , , [ 7 ] ] ],
            IT: [ , [ , , "0\\d{5,10}|1\\d{8,10}|3(?:[0-8]\\d{7,10}|9\\d{7,8})|55\\d{8}|8\\d{5}(?:\\d{2,4})?", , , , , , , [ 6, 7, 8, 9, 10, 11, 12 ] ], [ , , "0669[0-79]\\d{1,6}|0(?:1(?:[0159]\\d|[27][1-5]|31|4[1-4]|6[1356]|8[2-57])|2\\d\\d|3(?:[0159]\\d|2[1-4]|3[12]|[48][1-6]|6[2-59]|7[1-7])|4(?:[0159]\\d|[23][1-9]|4[245]|6[1-5]|7[1-4]|81)|5(?:[0159]\\d|2[1-5]|3[2-6]|4[1-79]|6[4-6]|7[1-578]|8[3-8])|6(?:[0-57-9]\\d|6[0-8])|7(?:[0159]\\d|2[12]|3[1-7]|4[2-46]|6[13569]|7[13-6]|8[1-59])|8(?:[0159]\\d|2[3-578]|3[1-356]|[6-8][1-5])|9(?:[0159]\\d|[238][1-5]|4[12]|6[1-8]|7[1-6]))\\d{2,7}", , , , "0212345678", , , [ 6, 7, 8, 9, 10, 11 ] ], [ , , "3[1-9]\\d{8}|3[2-9]\\d{7}", , , , "3123456789", , , [ 9, 10 ] ], [ , , "80(?:0\\d{3}|3)\\d{3}", , , , "800123456", , , [ 6, 9 ] ], [ , , "(?:0878\\d{3}|89(?:2\\d|3[04]|4(?:[0-4]|[5-9]\\d\\d)|5[0-4]))\\d\\d|(?:1(?:44|6[346])|89(?:38|5[5-9]|9))\\d{6}", , , , "899123456", , , [ 6, 8, 9, 10 ] ], [ , , "84(?:[08]\\d{3}|[17])\\d{3}", , , , "848123456", , , [ 6, 9 ] ], [ , , "1(?:78\\d|99)\\d{6}", , , , "1781234567", , , [ 9, 10 ] ], [ , , "55\\d{8}", , , , "5512345678", , , [ 10 ] ], "IT", 39, "00", , , , , , , , [ [ , "(\\d{4,5})", "$1", [ "1(?:0|9[246])", "1(?:0|9(?:2[2-9]|[46]))" ] ], [ , "(\\d{6})", "$1", [ "1(?:1|92)" ] ], [ , "(\\d{2})(\\d{4,6})", "$1 $2", [ "0[26]" ] ], [ , "(\\d{3})(\\d{3,6})", "$1 $2", [ "0[13-57-9][0159]|8(?:03|4[17]|9[2-5])", "0[13-57-9][0159]|8(?:03|4[17]|9(?:2|3[04]|[45][0-4]))" ] ], [ , "(\\d{4})(\\d{2,6})", "$1 $2", [ "0(?:[13-579][2-46-8]|8[236-8])" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "894" ] ], [ , "(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "0[26]|5" ] ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "1(?:44|[679])|[38]" ] ], [ , "(\\d{3})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "0[13-57-9][0159]|14" ] ], [ , "(\\d{2})(\\d{4})(\\d{5})", "$1 $2 $3", [ "0[26]" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "0" ] ], [ , "(\\d{3})(\\d{4})(\\d{4,5})", "$1 $2 $3", [ "3" ] ] ], [ [ , "(\\d{2})(\\d{4,6})", "$1 $2", [ "0[26]" ] ], [ , "(\\d{3})(\\d{3,6})", "$1 $2", [ "0[13-57-9][0159]|8(?:03|4[17]|9[2-5])", "0[13-57-9][0159]|8(?:03|4[17]|9(?:2|3[04]|[45][0-4]))" ] ], [ , "(\\d{4})(\\d{2,6})", "$1 $2", [ "0(?:[13-579][2-46-8]|8[236-8])" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "894" ] ], [ , "(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "0[26]|5" ] ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "1(?:44|[679])|[38]" ] ], [ , "(\\d{3})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "0[13-57-9][0159]|14" ] ], [ , "(\\d{2})(\\d{4})(\\d{5})", "$1 $2 $3", [ "0[26]" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "0" ] ], [ , "(\\d{3})(\\d{4})(\\d{4,5})", "$1 $2 $3", [ "3" ] ] ], [ , , , , , , , , , [ -1 ] ], 1, , [ , , "848\\d{6}", , , , , , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "3[2-8]\\d{9,10}", , , , "33101234501", , , [ 11, 12 ] ] ],
            JE: [ , [ , , "1534\\d{6}|(?:[3578]\\d|90)\\d{8}", , , , , , , [ 10 ], [ 6 ] ], [ , , "1534[0-24-8]\\d{5}", , , , "1534456789", , , , [ 6 ] ], [ , , "7(?:(?:(?:50|82)9|937)\\d|7(?:00[378]|97[7-9]))\\d{5}", , , , "7797712345" ], [ , , "80(?:07(?:35|81)|8901)\\d{4}", , , , "8007354567" ], [ , , "(?:8(?:4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))|90(?:066[59]|1810|71(?:07|55)))\\d{4}", , , , "9018105678" ], [ , , , , , , , , , [ -1 ] ], [ , , "701511\\d{4}", , , , "7015115678" ], [ , , "56\\d{8}", , , , "5612345678" ], "JE", 44, "00", "0", , , "0|([0-24-8]\\d{5})$", "1534$1", , , , , [ , , "76(?:464|652)\\d{5}|76(?:0[0-2]|2[356]|34|4[01347]|5[49]|6[0-369]|77|81|9[139])\\d{6}", , , , "7640123456" ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:3(?:0(?:07(?:35|81)|8901)|3\\d{4}|4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))|55\\d{4})\\d{4}", , , , "5512345678" ], , , [ , , , , , , , , , [ -1 ] ] ],
            JM: [ , [ , , "(?:[58]\\d\\d|658|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "8766060\\d{3}|(?:658(?:2(?:[0-8]\\d|9[0-46-9])|[3-9]\\d\\d)|876(?:52[35]|6(?:0[1-3579]|1[0237-9]|[23]\\d|40|5[06]|6[2-589]|7[05]|8[04]|9[4-9])|7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468])))\\d{4}", , , , "8765230123", , , , [ 7 ] ], [ , , "(?:658295|876(?:2(?:0[2-9]|[14-9]\\d|2[013-9]|3[3-9])|[348]\\d\\d|5(?:0[1-9]|[1-9]\\d)|6(?:4[89]|6[67])|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579])))\\d{4}", , , , "8762101234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "JM", 1, "011", "1", , , "1", , , , , , [ , , , , , , , , , [ -1 ] ], , "658|876", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            JO: [ , [ , , "(?:(?:[2689]|7\\d)\\d|32|53)\\d{6}", , , , , , , [ 8, 9 ] ], [ , , "87(?:000|90[01])\\d{3}|(?:2(?:6(?:2[0-35-9]|3[0-578]|4[24-7]|5[0-24-8]|[6-8][023]|9[0-3])|7(?:0[1-79]|10|2[014-7]|3[0-689]|4[019]|5[0-3578]))|32(?:0[1-69]|1[1-35-7]|2[024-7]|3\\d|4[0-3]|[5-7][023])|53(?:0[0-3]|[13][023]|2[0-59]|49|5[0-35-9]|6[15]|7[45]|8[1-6]|9[0-36-9])|6(?:2(?:[05]0|22)|3(?:00|33)|4(?:0[0-25]|1[2-7]|2[0569]|[38][07-9]|4[025689]|6[0-589]|7\\d|9[0-2])|5(?:[01][056]|2[034]|3[0-57-9]|4[178]|5[0-69]|6[0-35-9]|7[1-379]|8[0-68]|9[0239]))|87(?:20|7[078]|99))\\d{4}", , , , "62001234", , , [ 8 ] ], [ , , "7(?:[78][0-25-9]|9\\d)\\d{6}", , , , "790123456", , , [ 9 ] ], [ , , "80\\d{6}", , , , "80012345", , , [ 8 ] ], [ , , "9\\d{7}", , , , "90012345", , , [ 8 ] ], [ , , "85\\d{6}", , , , "85012345", , , [ 8 ] ], [ , , "70\\d{7}", , , , "700123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], "JO", 962, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2356]|87" ], "(0$1)" ], [ , "(\\d{3})(\\d{5,6})", "$1 $2", [ "[89]" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "70" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "7" ], "0$1" ] ], , [ , , "74(?:66|77)\\d{5}", , , , "746612345", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "8(?:10|8\\d)\\d{5}", , , , "88101234", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            JP: [ , [ , , "00[1-9]\\d{6,14}|[257-9]\\d{9}|(?:00|[1-9]\\d\\d)\\d{6}", , , , , , , [ 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ] ], [ , , "(?:1(?:1[235-8]|2[3-6]|3[3-9]|4[2-6]|[58][2-8]|6[2-7]|7[2-9]|9[1-9])|(?:2[2-9]|[36][1-9])\\d|4(?:[2-578]\\d|6[02-8]|9[2-59])|5(?:[2-589]\\d|6[1-9]|7[2-8])|7(?:[25-9]\\d|3[4-9]|4[02-9])|8(?:[2679]\\d|3[2-9]|4[5-9]|5[1-9]|8[03-9])|9(?:[2-58]\\d|[679][1-9]))\\d{6}", , , , "312345678", , , [ 9 ] ], [ , , "[7-9]0[1-9]\\d{7}", , , , "9012345678", , , [ 10 ] ], [ , , "00777(?:[01]|5\\d)\\d\\d|(?:00(?:7778|882[1245])|(?:120|800\\d)\\d\\d)\\d{4}|00(?:37|66|78)\\d{6,13}", , , , "120123456" ], [ , , "990\\d{6}", , , , "990123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "60\\d{7}", , , , "601234567", , , [ 9 ] ], [ , , "50[1-9]\\d{7}", , , , "5012345678", , , [ 10 ] ], "JP", 81, "010", "0", , , "0", , , , [ [ , "(\\d{4})(\\d{4})", "$1-$2", [ "007", "0077", "00777", "00777[01]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1-$2-$3", [ "(?:12|57|99)0" ], "0$1" ], [ , "(\\d{4})(\\d)(\\d{4})", "$1-$2-$3", [ "1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|499|5(?:76|97)|746|8(?:3[89]|47|51|63)|9(?:49|80|9[16])", "1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:76|97)9|7468|8(?:3(?:8[7-9]|96)|477|51[2-9]|636)|9(?:496|802|9(?:1[23]|69))|1(?:45|58)[67]", "1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:769|979[2-69])|7468|8(?:3(?:8[7-9]|96[2457-9])|477|51[2-9]|636[457-9])|9(?:496|802|9(?:1[23]|69))|1(?:45|58)[67]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "60" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1-$2-$3", [ "[36]|4(?:2[09]|7[01])", "[36]|4(?:2(?:0|9[02-69])|7(?:0[019]|1))" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "1(?:1|5[45]|77|88|9[69])|2(?:2[1-37]|3[0-269]|4[59]|5|6[24]|7[1-358]|8[1369]|9[0-38])|4(?:[28][1-9]|3[0-57]|[45]|6[248]|7[2-579]|9[29])|5(?:2|3[045]|4[0-369]|5[29]|8[02389]|9[0-389])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9[2-6])|8(?:2[124589]|3[27-9]|49|51|6|7[0-468]|8[68]|9[019])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9[1-489])", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2(?:[127]|3[014-9])|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9[19])|62|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|8[1-9])|5(?:2|3[045]|4[0-369]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0-2469])|49|51|6(?:[0-24]|36|5[0-3589]|72|9[01459])|7[0-468]|8[68])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3[34]|4[0178]))|(?:49|55|83)[29]|(?:264|837)[016-9]|2(?:57|93)[015-9]|(?:25[0468]|422|838)[01]|(?:47[59]|59[89]|8(?:6[68]|9))[019]", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3[045]|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0169])|3(?:[29]|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[23]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|72|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:8294|96)[1-3]|2(?:57|93)[015-9]|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|8292|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|7[015-9]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17|3[015-9]))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3[045]|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9(?:[019]|4[1-3]|6(?:[0-47-9]|5[01346-9])))|3(?:[29]|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[23]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|72|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|829(?:2|66)|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{4})", "$1-$2-$3", [ "[14]|[289][2-9]|5[3-9]|7[2-4679]" ], "0$1" ], [ , "(\\d{4})(\\d{2})(\\d{3,4})", "$1-$2-$3", [ "007", "0077" ] ], [ , "(\\d{4})(\\d{2})(\\d{4})", "$1-$2-$3", [ "008" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", [ "800" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3", [ "[257-9]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3,4})", "$1-$2-$3", [ "0" ] ], [ , "(\\d{4})(\\d{4})(\\d{4,5})", "$1-$2-$3", [ "0" ] ], [ , "(\\d{4})(\\d{5})(\\d{5,6})", "$1-$2-$3", [ "0" ] ], [ , "(\\d{4})(\\d{6})(\\d{6,7})", "$1-$2-$3", [ "0" ] ] ], [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1-$2-$3", [ "(?:12|57|99)0" ], "0$1" ], [ , "(\\d{4})(\\d)(\\d{4})", "$1-$2-$3", [ "1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|499|5(?:76|97)|746|8(?:3[89]|47|51|63)|9(?:49|80|9[16])", "1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:76|97)9|7468|8(?:3(?:8[7-9]|96)|477|51[2-9]|636)|9(?:496|802|9(?:1[23]|69))|1(?:45|58)[67]", "1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:769|979[2-69])|7468|8(?:3(?:8[7-9]|96[2457-9])|477|51[2-9]|636[457-9])|9(?:496|802|9(?:1[23]|69))|1(?:45|58)[67]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "60" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1-$2-$3", [ "[36]|4(?:2[09]|7[01])", "[36]|4(?:2(?:0|9[02-69])|7(?:0[019]|1))" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "1(?:1|5[45]|77|88|9[69])|2(?:2[1-37]|3[0-269]|4[59]|5|6[24]|7[1-358]|8[1369]|9[0-38])|4(?:[28][1-9]|3[0-57]|[45]|6[248]|7[2-579]|9[29])|5(?:2|3[045]|4[0-369]|5[29]|8[02389]|9[0-389])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9[2-6])|8(?:2[124589]|3[27-9]|49|51|6|7[0-468]|8[68]|9[019])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9[1-489])", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2(?:[127]|3[014-9])|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9[19])|62|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|8[1-9])|5(?:2|3[045]|4[0-369]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0-2469])|49|51|6(?:[0-24]|36|5[0-3589]|72|9[01459])|7[0-468]|8[68])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3[34]|4[0178]))|(?:49|55|83)[29]|(?:264|837)[016-9]|2(?:57|93)[015-9]|(?:25[0468]|422|838)[01]|(?:47[59]|59[89]|8(?:6[68]|9))[019]", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3[045]|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0169])|3(?:[29]|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[23]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|72|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:8294|96)[1-3]|2(?:57|93)[015-9]|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|8292|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|7[015-9]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17|3[015-9]))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3[045]|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9(?:[019]|4[1-3]|6(?:[0-47-9]|5[01346-9])))|3(?:[29]|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[23]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|72|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|829(?:2|66)|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{4})", "$1-$2-$3", [ "[14]|[289][2-9]|5[3-9]|7[2-4679]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", [ "800" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3", [ "[257-9]" ], "0$1" ] ], [ , , "20\\d{8}", , , , "2012345678", , , [ 10 ] ], , , [ , , "00(?:777(?:[01]|(?:5|8\\d)\\d)|882[1245]\\d\\d)\\d\\d|00(?:37|66|78)\\d{6,13}" ], [ , , "570\\d{6}", , , , "570123456", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KE: [ , [ , , "(?:[17]\\d\\d|900)\\d{6}|(?:2|80)0\\d{6,7}|[4-6]\\d{6,8}", , , , , , , [ 7, 8, 9, 10 ] ], [ , , "(?:4[245]|5[1-79]|6[01457-9])\\d{5,7}|(?:4[136]|5[08]|62)\\d{7}|(?:[24]0|66)\\d{6,7}", , , , "202012345", , , [ 7, 8, 9 ] ], [ , , "(?:1(?:0[0-6]|1[0-5]|2[014])|7\\d\\d)\\d{6}", , , , "712123456", , , [ 9 ] ], [ , , "800[24-8]\\d{5,6}", , , , "800223456", , , [ 9, 10 ] ], [ , , "900[02-9]\\d{5}", , , , "900223456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "KE", 254, "000", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{5,7})", "$1 $2", [ "[24-6]" ], "0$1" ], [ , "(\\d{3})(\\d{6})", "$1 $2", [ "[17]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[89]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KG: [ , [ , , "8\\d{9}|(?:[235-8]\\d|99)\\d{7}", , , , , , , [ 9, 10 ], [ 5, 6 ] ], [ , , "312(?:5[0-79]\\d|9(?:[0-689]\\d|7[0-24-9]))\\d{3}|(?:3(?:1(?:2[0-46-8]|3[1-9]|47|[56]\\d)|2(?:22|3[0-479]|6[0-7])|4(?:22|5[6-9]|6\\d)|5(?:22|3[4-7]|59|6\\d)|6(?:22|5[35-7]|6\\d)|7(?:22|3[468]|4[1-9]|59|[67]\\d)|9(?:22|4[1-8]|6\\d))|6(?:09|12|2[2-4])\\d)\\d{5}", , , , "312123456", , , [ 9 ], [ 5, 6 ] ], [ , , "312(?:58\\d|973)\\d{3}|(?:2(?:0[0-35]|2\\d)|5[0-24-7]\\d|7(?:[07]\\d|55)|880|99[05-9])\\d{6}", , , , "700123456", , , [ 9 ] ], [ , , "800\\d{6,7}", , , , "800123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "KG", 996, "00", "0", , , "0", , , , [ [ , "(\\d{4})(\\d{5})", "$1 $2", [ "3(?:1[346]|[24-79])" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[235-79]|88" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d)(\\d{2,3})", "$1 $2 $3 $4", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KH: [ , [ , , "1\\d{9}|[1-9]\\d{7,8}", , , , , , , [ 8, 9, 10 ], [ 6, 7 ] ], [ , , "23(?:4(?:[2-4]|[56]\\d)|[568]\\d\\d)\\d{4}|23[236-9]\\d{5}|(?:2[4-6]|3[2-6]|4[2-4]|[5-7][2-5])(?:(?:[237-9]|4[56]|5\\d)\\d{5}|6\\d{5,6})", , , , "23756789", , , [ 8, 9 ], [ 6, 7 ] ], [ , , "(?:(?:1[28]|3[18]|9[67])\\d|6[016-9]|7(?:[07-9]|[16]\\d)|8(?:[013-79]|8\\d))\\d{6}|(?:1\\d|9[0-57-9])\\d{6}|(?:2[3-6]|3[2-6]|4[2-4]|[5-7][2-5])48\\d{5}", , , , "91234567", , , [ 8, 9 ] ], [ , , "1800(?:1\\d|2[019])\\d{4}", , , , "1800123456", , , [ 10 ] ], [ , , "1900(?:1\\d|2[09])\\d{4}", , , , "1900123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "KH", 855, "00[14-9]", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[1-9]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KI: [ , [ , , "(?:[37]\\d|6[0-79])\\d{6}|(?:[2-48]\\d|50)\\d{3}", , , , , , , [ 5, 8 ] ], [ , , "(?:[24]\\d|3[1-9]|50|65(?:02[12]|12[56]|22[89]|[3-5]00)|7(?:27\\d\\d|3100|5(?:02[12]|12[56]|22[89]|[34](?:00|81)|500))|8[0-5])\\d{3}", , , , "31234" ], [ , , "(?:63\\d{3}|73(?:0[0-5]\\d|140))\\d{3}|[67]200[01]\\d{3}", , , , "72001234", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "30(?:0[01]\\d\\d|12(?:11|20))\\d\\d", , , , "30010000", , , [ 8 ] ], "KI", 686, "00", "0", , , "0", , , , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KM: [ , [ , , "[3478]\\d{6}", , , , , , , [ 7 ], [ 4 ] ], [ , , "7[4-7]\\d{5}", , , , "7712345", , , , [ 4 ] ], [ , , "[34]\\d{6}", , , , "3212345" ], [ , , , , , , , , , [ -1 ] ], [ , , "8\\d{6}", , , , "8001234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "KM", 269, "00", , , , , , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", [ "[3478]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KN: [ , [ , , "(?:[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "869(?:2(?:29|36)|302|4(?:6[015-9]|70)|56[5-7])\\d{4}", , , , "8692361234", , , , [ 7 ] ], [ , , "869(?:48[89]|55[6-8]|66\\d|76[02-7])\\d{4}", , , , "8697652917", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "KN", 1, "011", "1", , , "1|([2-7]\\d{6})$", "869$1", , , , , [ , , , , , , , , , [ -1 ] ], , "869", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KP: [ , [ , , "85\\d{6}|(?:19\\d|[2-7])\\d{7}", , , , , , , [ 8, 10 ], [ 6, 7 ] ], [ , , "(?:(?:195|2)\\d|3[19]|4[159]|5[37]|6[17]|7[39]|85)\\d{6}", , , , "21234567", , , , [ 6, 7 ] ], [ , , "19[1-3]\\d{7}", , , , "1921234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "KP", 850, "00|99", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2-7]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "238[02-9]\\d{4}|2(?:[0-24-9]\\d|3[0-79])\\d{5}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KR: [ , [ , , "00[1-9]\\d{8,11}|(?:[12]|5\\d{3})\\d{7}|[13-6]\\d{9}|(?:[1-6]\\d|80)\\d{7}|[3-6]\\d{4,5}|(?:00|7)0\\d{8}", , , , , , , [ 5, 6, 8, 9, 10, 11, 12, 13, 14 ], [ 3, 4, 7 ] ], [ , , "(?:2|3[1-3]|[46][1-4]|5[1-5])[1-9]\\d{6,7}|(?:3[1-3]|[46][1-4]|5[1-5])1\\d{2,3}", , , , "22123456", , , [ 5, 6, 8, 9, 10 ], [ 3, 4, 7 ] ], [ , , "1(?:05(?:[0-8]\\d|9[0-6])|22[13]\\d)\\d{4,5}|1(?:0[1-46-9]|[16-9]\\d|2[013-9])\\d{6,7}", , , , "1020000000", , , [ 9, 10 ] ], [ , , "00(?:308\\d{6,7}|798\\d{7,9})|(?:00368|80)\\d{7}", , , , "801234567", , , [ 9, 11, 12, 13, 14 ] ], [ , , "60[2-9]\\d{6}", , , , "602345678", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "50\\d{8,9}", , , , "5012345678", , , [ 10, 11 ] ], [ , , "70\\d{8}", , , , "7012345678", , , [ 10 ] ], "KR", 82, "00(?:[125689]|3(?:[46]5|91)|7(?:00|27|3|55|6[126]))", "0", , , "0(8(?:[1-46-8]|5\\d\\d))?", , , , [ [ , "(\\d{5})", "$1", [ "1[016-9]1", "1[016-9]11", "1[016-9]114" ], "0$1" ], [ , "(\\d{2})(\\d{3,4})", "$1-$2", [ "(?:3[1-3]|[46][1-4]|5[1-5])1" ], "0$1", "0$CC-$1" ], [ , "(\\d{4})(\\d{4})", "$1-$2", [ "1" ] ], [ , "(\\d)(\\d{3,4})(\\d{4})", "$1-$2-$3", [ "2" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "60|8" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{3,4})(\\d{4})", "$1-$2-$3", [ "[1346]|5[1-5]" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3", [ "[57]" ], "0$1", "0$CC-$1" ], [ , "(\\d{5})(\\d{3})(\\d{3})", "$1 $2 $3", [ "003", "0030" ] ], [ , "(\\d{2})(\\d{5})(\\d{4})", "$1-$2-$3", [ "5" ], "0$1", "0$CC-$1" ], [ , "(\\d{5})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "0" ] ], [ , "(\\d{5})(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "0" ] ] ], [ [ , "(\\d{2})(\\d{3,4})", "$1-$2", [ "(?:3[1-3]|[46][1-4]|5[1-5])1" ], "0$1", "0$CC-$1" ], [ , "(\\d{4})(\\d{4})", "$1-$2", [ "1" ] ], [ , "(\\d)(\\d{3,4})(\\d{4})", "$1-$2-$3", [ "2" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", [ "60|8" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{3,4})(\\d{4})", "$1-$2-$3", [ "[1346]|5[1-5]" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3", [ "[57]" ], "0$1", "0$CC-$1" ], [ , "(\\d{2})(\\d{5})(\\d{4})", "$1-$2-$3", [ "5" ], "0$1", "0$CC-$1" ] ], [ , , "15\\d{7,8}", , , , "1523456789", , , [ 9, 10 ] ], , , [ , , "00(?:3(?:08\\d{6,7}|68\\d{7})|798\\d{7,9})", , , , , , , [ 11, 12, 13, 14 ] ], [ , , "1(?:5(?:22|33|44|66|77|88|99)|6(?:[07]0|44|6[16]|88)|8(?:00|33|55|77|99))\\d{4}", , , , "15441234", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KW: [ , [ , , "18\\d{5}|(?:[2569]\\d|41)\\d{6}", , , , , , , [ 7, 8 ] ], [ , , "2(?:[23]\\d\\d|4(?:[1-35-9]\\d|44)|5(?:0[034]|[2-46]\\d|5[1-3]|7[1-7]))\\d{4}", , , , "22345678", , , [ 8 ] ], [ , , "(?:41\\d\\d|5(?:(?:[05]\\d|1[0-7]|6[56])\\d|2(?:22|5[25])|7(?:55|77)|88[58])|6(?:(?:0[034679]|5[015-9]|6\\d)\\d|222|333|444|7(?:0[013-9]|[67]\\d)|888|9(?:[069]\\d|3[039]))|9(?:(?:0[09]|22|[4679]\\d|8[057-9])\\d|1(?:1[01]|99)|3(?:00|33)|5(?:00|5\\d)))\\d{4}", , , , "50012345", , , [ 8 ] ], [ , , "18\\d{5}", , , , "1801234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "KW", 965, "00", , , , , , , , [ [ , "(\\d{4})(\\d{3,4})", "$1 $2", [ "[169]|2(?:[235]|4[1-35-9])|52" ] ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "[245]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KY: [ , [ , , "(?:345|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "345(?:2(?:22|3[23]|44|66)|333|444|6(?:23|38|40)|7(?:30|4[35-79]|6[6-9]|77)|8(?:00|1[45]|25|[48]8)|9(?:14|4[035-9]))\\d{4}", , , , "3452221234", , , , [ 7 ] ], [ , , "345(?:32[1-9]|42[0-4]|5(?:1[67]|2[5-79]|4[6-9]|50|76)|649|9(?:1[679]|2[2-9]|3[06-9]|90))\\d{4}", , , , "3453231234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "(?:345976|900[2-9]\\d\\d)\\d{4}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "KY", 1, "011", "1", , , "1|([2-9]\\d{6})$", "345$1", , , , , [ , , "345849\\d{4}", , , , "3458491234" ], , "345", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            KZ: [ , [ , , "(?:33622|8\\d{8})\\d{5}|[78]\\d{9}", , , , , , , [ 10, 14 ], [ 5, 6, 7 ] ], [ , , "(?:33622|7(?:1(?:0(?:[23]\\d|4[0-3]|59|63)|1(?:[23]\\d|4[0-79]|59)|2(?:[23]\\d|59)|3(?:2\\d|3[0-79]|4[0-35-9]|59)|4(?:[24]\\d|3[013-9]|5[1-9])|5(?:2\\d|3[1-9]|4[0-7]|59)|6(?:[2-4]\\d|5[19]|61)|72\\d|8(?:[27]\\d|3[1-46-9]|4[0-5]))|2(?:1(?:[23]\\d|4[46-9]|5[3469])|2(?:2\\d|3[0679]|46|5[12679])|3(?:[2-4]\\d|5[139])|4(?:2\\d|3[1-35-9]|59)|5(?:[23]\\d|4[0-246-8]|59|61)|6(?:2\\d|3[1-9]|4[0-4]|59)|7(?:[2379]\\d|40|5[279])|8(?:[23]\\d|4[0-3]|59)|9(?:2\\d|3[124578]|59))))\\d{5}", , , , "7123456789", , , [ 10 ], [ 5, 6, 7 ] ], [ , , "7(?:0[0-25-8]|47|6[0-4]|7[15-8]|85)\\d{7}", , , , "7710009998", , , [ 10 ] ], [ , , "8(?:00|108\\d{3})\\d{7}", , , , "8001234567" ], [ , , "809\\d{7}", , , , "8091234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "808\\d{7}", , , , "8081234567", , , [ 10 ] ], [ , , "751\\d{7}", , , , "7511234567", , , [ 10 ] ], "KZ", 7, "810", "8", , , "8", , "8~10", , , , [ , , , , , , , , , [ -1 ] ], , "33|7", [ , , "751\\d{7}", , , , , , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LA: [ , [ , , "[23]\\d{9}|3\\d{8}|(?:[235-8]\\d|41)\\d{6}", , , , , , , [ 8, 9, 10 ], [ 6 ] ], [ , , "(?:2[13]|[35-7][14]|41|8[1468])\\d{6}", , , , "21212862", , , [ 8 ], [ 6 ] ], [ , , "(?:20(?:[239]\\d|5[24-9]|7[6-8])|302\\d)\\d{6}", , , , "2023123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LA", 856, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "2[13]|3[14]|[4-8]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "30[013-9]" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "[23]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "30[013-9]\\d{6}", , , , "301234567", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LB: [ , [ , , "[27-9]\\d{7}|[13-9]\\d{6}", , , , , , , [ 7, 8 ] ], [ , , "7(?:62|8[0-7]|9[04-9])\\d{4}|(?:[14-69]\\d|2(?:[14-69]\\d|[78][1-9])|7[2-57]|8[02-9])\\d{5}", , , , "1123456" ], [ , , "793(?:[01]\\d|2[0-4])\\d{3}|(?:(?:3|81)\\d|7(?:[01]\\d|6[013-9]|8[89]|9[12]))\\d{5}", , , , "71123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "9[01]\\d{6}", , , , "90123456", , , [ 8 ] ], [ , , "80\\d{6}", , , , "80123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LB", 961, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "[13-69]|7(?:[2-57]|62|8[0-7]|9[04-9])|8[02-9]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[27-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LC: [ , [ , , "(?:[58]\\d\\d|758|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "758(?:234|4(?:30|5\\d|6[2-9]|8[0-2])|57[0-2]|(?:63|75)8)\\d{4}", , , , "7584305678", , , , [ 7 ] ], [ , , "758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2\\d|3[0-3])|812)\\d{4}", , , , "7582845678", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "LC", 1, "011", "1", , , "1|([2-8]\\d{6})$", "758$1", , , , , [ , , , , , , , , , [ -1 ] ], , "758", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LI: [ , [ , , "[68]\\d{8}|(?:[2378]\\d|90)\\d{5}", , , , , , , [ 7, 9 ] ], [ , , "(?:2(?:01|1[27]|2[02]|3\\d|6[02-578]|96)|3(?:[24]0|33|7[0135-7]|8[048]|9[0269]))\\d{4}", , , , "2345678", , , [ 7 ] ], [ , , "(?:6(?:4(?:5[4-9]|[6-9]\\d)|5[0-4]\\d|6(?:[0245]\\d|[17]0|3[7-9]))\\d|7(?:[37-9]\\d|42|56))\\d{4}", , , , "660234567" ], [ , , "8002[28]\\d\\d|80(?:05\\d|9)\\d{4}", , , , "8002222" ], [ , , "90(?:02[258]|1(?:23|3[14])|66[136])\\d\\d", , , , "9002222", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LI", 423, "00", "0", , , "0|(1001)", , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", [ "[2379]|8(?:0[09]|7)", "[2379]|8(?:0(?:02|9)|7)" ], , "$CC $1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "69" ], , "$CC $1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "6" ], , "$CC $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "870(?:28|87)\\d\\d", , , , "8702812", , , [ 7 ] ], , , [ , , "697(?:42|56|[78]\\d)\\d{4}", , , , "697861234", , , [ 9 ] ] ],
            LK: [ , [ , , "[1-9]\\d{8}", , , , , , , [ 9 ], [ 7 ] ], [ , , "(?:12[2-9]|602|8[12]\\d|9(?:1\\d|22|9[245]))\\d{6}|(?:11|2[13-7]|3[1-8]|4[157]|5[12457]|6[35-7])[2-57]\\d{6}", , , , "112345678", , , , [ 7 ] ], [ , , "7(?:[0-25-8]\\d|4[0-4])\\d{6}", , , , "712345678" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LK", 94, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "7" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[1-689]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "1973\\d{5}", , , , "197312345" ], , , [ , , , , , , , , , [ -1 ] ] ],
            LR: [ , [ , , "(?:2|33|5\\d|77|88)\\d{7}|[4-6]\\d{6}", , , , , , , [ 7, 8, 9 ] ], [ , , "(?:2\\d{3}|33333)\\d{4}", , , , "21234567", , , [ 8, 9 ] ], [ , , "(?:(?:330|555|(?:77|88)\\d)\\d|4[67])\\d{5}|[56]\\d{6}", , , , "770123456", , , [ 7, 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "332(?:02|[34]\\d)\\d{4}", , , , "332021234", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LR", 231, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "[4-6]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[3578]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LS: [ , [ , , "(?:[256]\\d\\d|800)\\d{5}", , , , , , , [ 8 ] ], [ , , "2\\d{7}", , , , "22123456" ], [ , , "[56]\\d{7}", , , , "50123456" ], [ , , "800[256]\\d{4}", , , , "80021234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LS", 266, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[2568]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LT: [ , [ , , "(?:[3469]\\d|52|[78]0)\\d{6}", , , , , , , [ 8 ] ], [ , , "(?:3[1478]|4[124-6]|52)\\d{6}", , , , "31234567" ], [ , , "6\\d{7}", , , , "61234567" ], [ , , "80[02]\\d{5}", , , , "80012345" ], [ , , "9(?:0[0239]|10)\\d{5}", , , , "90012345" ], [ , , "808\\d{5}", , , , "80812345" ], [ , , "70[05]\\d{5}", , , , "70012345" ], [ , , "[89]01\\d{5}", , , , "80123456" ], "LT", 370, "00", "8", , , "[08]", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "52[0-7]" ], "(8-$1)", , 1 ], [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "[7-9]" ], "8 $1", , 1 ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "37|4(?:[15]|6[1-8])" ], "(8-$1)", , 1 ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "[3-6]" ], "(8-$1)", , 1 ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "70[67]\\d{5}", , , , "70712345" ], , , [ , , , , , , , , , [ -1 ] ] ],
            LU: [ , [ , , "35[013-9]\\d{4,8}|6\\d{8}|35\\d{2,4}|(?:[2457-9]\\d|3[0-46-9])\\d{2,9}", , , , , , , [ 4, 5, 6, 7, 8, 9, 10, 11 ] ], [ , , "(?:35[013-9]|80[2-9]|90[89])\\d{1,8}|(?:2[2-9]|3[0-46-9]|[457]\\d|8[13-9]|9[2-579])\\d{2,9}", , , , "27123456" ], [ , , "6(?:[269][18]|5[1568]|7[189]|81)\\d{6}", , , , "628123456", , , [ 9 ] ], [ , , "800\\d{5}", , , , "80012345", , , [ 8 ] ], [ , , "90[015]\\d{5}", , , , "90012345", , , [ 8 ] ], [ , , "801\\d{5}", , , , "80112345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "20(?:1\\d{5}|[2-689]\\d{1,7})", , , , "20201234", , , [ 4, 5, 6, 7, 8, 9, 10 ] ], "LU", 352, "00", , , , "(15(?:0[06]|1[12]|[35]5|4[04]|6[26]|77|88|99)\\d)", , , , [ [ , "(\\d{2})(\\d{3})", "$1 $2", [ "2(?:0[2-689]|[2-9])|[3-57]|8(?:0[2-9]|[13-9])|9(?:0[89]|[2-579])" ], , "$CC $1" ], [ , "(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", [ "2(?:0[2-689]|[2-9])|[3-57]|8(?:0[2-9]|[13-9])|9(?:0[89]|[2-579])" ], , "$CC $1" ], [ , "(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", [ "20[2-689]" ], , "$CC $1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})", "$1 $2 $3 $4", [ "2(?:[0367]|4[3-8])" ], , "$CC $1" ], [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "80[01]|90[015]" ], , "$CC $1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "20" ], , "$CC $1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "6" ], , "$CC $1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})", "$1 $2 $3 $4 $5", [ "2(?:[0367]|4[3-8])" ], , "$CC $1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{1,5})", "$1 $2 $3 $4", [ "[3-57]|8[13-9]|9(?:0[89]|[2-579])|(?:2|80)[2-9]" ], , "$CC $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LV: [ , [ , , "(?:[268]\\d|90)\\d{6}", , , , , , , [ 8 ] ], [ , , "6\\d{7}", , , , "63123456" ], [ , , "2\\d{7}", , , , "21234567" ], [ , , "80\\d{6}", , , , "80123456" ], [ , , "90\\d{6}", , , , "90123456" ], [ , , "81\\d{6}", , , , "81123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LV", 371, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[269]|8[01]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            LY: [ , [ , , "[2-9]\\d{8}", , , , , , , [ 9 ], [ 7 ] ], [ , , "(?:2(?:0[56]|[1-6]\\d|7[124579]|8[124])|3(?:1\\d|2[2356])|4(?:[17]\\d|2[1-357]|5[2-4]|8[124])|5(?:[1347]\\d|2[1-469]|5[13-5]|8[1-4])|6(?:[1-479]\\d|5[2-57]|8[1-5])|7(?:[13]\\d|2[13-79])|8(?:[124]\\d|5[124]|84))\\d{6}", , , , "212345678", , , , [ 7 ] ], [ , , "9[1-6]\\d{7}", , , , "912345678" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "LY", 218, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{7})", "$1-$2", [ "[2-9]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MA: [ , [ , , "[5-8]\\d{8}", , , , , , , [ 9 ] ], [ , , "5(?:29(?:[189][05]|2[29]|3[01])|38[89][05])\\d{4}|5(?:2(?:[0-25-7]\\d|3[1-578]|4[02-46-8]|8[0235-7]|90)|3(?:[0-47]\\d|5[02-9]|6[02-8]|80|9[3-9])|(?:4[067]|5[03])\\d)\\d{5}", , , , "520123456" ], [ , , "(?:6(?:[0-79]\\d|8[0-247-9])|7(?:[01]\\d|6[1267]|7[0-57]))\\d{6}", , , , "650123456" ], [ , , "80\\d{7}", , , , "801234567" ], [ , , "89\\d{7}", , , , "891234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "592(?:4[0-2]|93)\\d{4}", , , , "592401234" ], "MA", 212, "00", "0", , , "0", , , , [ [ , "(\\d{5})(\\d{4})", "$1-$2", [ "5(?:29|38)", "5(?:29|38)[89]", "5(?:29|38)[89]0" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "5[45]" ], "0$1" ], [ , "(\\d{4})(\\d{5})", "$1-$2", [ "5(?:2[2-489]|3[5-9]|9)|892", "5(?:2(?:[2-49]|8[235-9])|3[5-9]|9)|892" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1-$2", [ "8" ], "0$1" ], [ , "(\\d{3})(\\d{6})", "$1-$2", [ "[5-7]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], 1, , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MC: [ , [ , , "(?:[3489]|6\\d)\\d{7}", , , , , , , [ 8, 9 ] ], [ , , "(?:870|9[2-47-9]\\d)\\d{5}", , , , "99123456", , , [ 8 ] ], [ , , "4(?:[46]\\d|5[1-9])\\d{5}|(?:3|6\\d)\\d{7}", , , , "612345678" ], [ , , "(?:800|90\\d)\\d{5}", , , , "90123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MC", 377, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3", [ "87" ] ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "4" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[389]" ] ], [ , "(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "6" ], "0$1" ] ], [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "4" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[389]" ] ], [ , "(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "6" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "8[07]0\\d{5}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MD: [ , [ , , "(?:[235-7]\\d|[89]0)\\d{6}", , , , , , , [ 8 ] ], [ , , "(?:(?:2[1-9]|3[1-79])\\d|5(?:33|5[257]))\\d{5}", , , , "22212345" ], [ , , "562\\d{5}|(?:6\\d|7[16-9])\\d{6}", , , , "62112345" ], [ , , "800\\d{5}", , , , "80012345" ], [ , , "90[056]\\d{5}", , , , "90012345" ], [ , , "808\\d{5}", , , , "80812345" ], [ , , , , , , , , , [ -1 ] ], [ , , "3[08]\\d{6}", , , , "30123456" ], "MD", 373, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{5})", "$1 $2", [ "[89]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "22|3" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "[25-7]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "803\\d{5}", , , , "80312345" ], , , [ , , , , , , , , , [ -1 ] ] ],
            ME: [ , [ , , "(?:20|[3-79]\\d)\\d{6}|80\\d{6,7}", , , , , , , [ 8, 9 ], [ 6 ] ], [ , , "(?:20[2-8]|3(?:[0-2][2-7]|3[24-7])|4(?:0[2-467]|1[2467])|5(?:0[2467]|1[24-7]|2[2-467]))\\d{5}", , , , "30234567", , , [ 8 ], [ 6 ] ], [ , , "6(?:[07-9]\\d|3[024]|6[0-25])\\d{5}", , , , "67622901", , , [ 8 ] ], [ , , "80(?:[0-2578]|9\\d)\\d{5}", , , , "80080002" ], [ , , "9(?:4[1568]|5[178])\\d{5}", , , , "94515151", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "78[1-49]\\d{5}", , , , "78108780", , , [ 8 ] ], "ME", 382, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[2-9]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "77[1-9]\\d{5}", , , , "77273012", , , [ 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MF: [ , [ , , "(?:590|(?:69|80)\\d|976)\\d{6}", , , , , , , [ 9 ] ], [ , , "590(?:0[079]|[14]3|[27][79]|30|5[0-268]|87)\\d{4}", , , , "590271234" ], [ , , "69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))\\d{4}", , , , "690001234" ], [ , , "80[0-5]\\d{6}", , , , "800012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "976[01]\\d{5}", , , , "976012345" ], "MF", 590, "00", "0", , , "0", , , , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MG: [ , [ , , "[23]\\d{8}", , , , , , , [ 9 ], [ 7 ] ], [ , , "2072[29]\\d{4}|20(?:2\\d|4[47]|5[3467]|6[279]|7[35]|8[268]|9[245])\\d{5}", , , , "202123456", , , , [ 7 ] ], [ , , "3[2-489]\\d{7}", , , , "321234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "22\\d{7}", , , , "221234567" ], "MG", 261, "00", "0", , , "0|([24-9]\\d{6})$", "20$1", , , [ [ , "(\\d{2})(\\d{2})(\\d{3})(\\d{2})", "$1 $2 $3 $4", [ "[23]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MH: [ , [ , , "329\\d{4}|(?:[256]\\d|45)\\d{5}", , , , , , , [ 7 ] ], [ , , "(?:247|528|625)\\d{4}", , , , "2471234" ], [ , , "(?:(?:23|54)5|329|45[56])\\d{4}", , , , "2351234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "635\\d{4}", , , , "6351234" ], "MH", 692, "011", "1", , , "1", , , , [ [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[2-6]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MK: [ , [ , , "[2-578]\\d{7}", , , , , , , [ 8 ], [ 6, 7 ] ], [ , , "(?:2(?:[23]\\d|5[0-24578]|6[01]|82)|3(?:1[3-68]|[23][2-68]|4[23568])|4(?:[23][2-68]|4[3-68]|5[2568]|6[25-8]|7[24-68]|8[4-68]))\\d{5}", , , , "22012345", , , , [ 6, 7 ] ], [ , , "7(?:3555|4(?:60\\d|747)|94(?:[01]\\d|2[0-4]))\\d{3}|7(?:[0-25-8]\\d|3[2-4]|42|9[23])\\d{5}", , , , "72345678" ], [ , , "800\\d{5}", , , , "80012345" ], [ , , "5[02-9]\\d{6}", , , , "50012345" ], [ , , "8(?:0[1-9]|[1-9]\\d)\\d{5}", , , , "80123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MK", 389, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[347]" ], "0$1" ], [ , "(\\d{3})(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[58]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ML: [ , [ , , "[24-9]\\d{7}", , , , , , , [ 8 ] ], [ , , "2(?:07[0-8]|12[67])\\d{4}|(?:2(?:02|1[4-689])|4(?:0[0-4]|4[1-39]))\\d{5}", , , , "20212345" ], [ , , "2(?:0(?:01|79)|17\\d)\\d{4}|(?:5[01]|[679]\\d|8[239])\\d{6}", , , , "65012345" ], [ , , "80\\d{6}", , , , "80012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "ML", 223, "00", , , , , , , , [ [ , "(\\d{4})", "$1", [ "67[057-9]|74[045]", "67(?:0[09]|[59]9|77|8[89])|74(?:0[02]|44|55)" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[24-9]" ] ] ], [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[24-9]" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "80\\d{6}" ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MM: [ , [ , , "1\\d{5,7}|95\\d{6}|(?:[4-7]|9[0-46-9])\\d{6,8}|(?:2|8\\d)\\d{5,8}", , , , , , , [ 6, 7, 8, 9, 10 ], [ 5 ] ], [ , , "(?:1(?:(?:2\\d|3[56]|[89][0-6])\\d|4(?:2[2-469]|39|46|6[25]|7[0-3]|83)|6)|2(?:2(?:00|8[34])|4(?:0\\d|2[246]|39|46|62|7[0-3]|83)|51\\d\\d)|4(?:2(?:2\\d\\d|48[0-3])|3(?:20\\d|4(?:70|83)|56)|420\\d|5470)|6(?:0(?:[23]|88\\d)|(?:124|[56]2\\d)\\d|247[23]|3(?:20\\d|470)|4(?:2[04]\\d|47[23])|7(?:(?:3\\d|8[01459])\\d|4(?:39|60|7[013]))))\\d{4}|5(?:2(?:2\\d{5,6}|47[023]\\d{4})|(?:347[23]|4(?:2(?:1|86)|470)|522\\d|6(?:20\\d|483)|7(?:20\\d|48[0-2])|8(?:20\\d|47[02])|9(?:20\\d|47[01]))\\d{4})|7(?:(?:0470|4(?:25\\d|470)|5(?:202|470|96\\d))\\d{4}|1(?:20\\d{4,5}|4(?:70|83)\\d{4}))|8(?:1(?:2\\d{5,6}|4(?:10|7[01]\\d)\\d{3})|2(?:2\\d{5,6}|(?:320|490\\d)\\d{3})|(?:3(?:2\\d\\d|470)|4[24-7]|5(?:2\\d|4[1-9]|51)\\d|6[23])\\d{4})|(?:1[2-6]\\d|4(?:2[24-8]|3[2-7]|[46][2-6]|5[3-5])|5(?:[27][2-8]|3[2-68]|4[24-8]|5[23]|6[2-4]|8[24-7]|9[2-7])|6(?:[19]20|42[03-6]|(?:52|7[45])\\d)|7(?:[04][24-8]|[15][2-7]|22|3[2-4])|8(?:1[2-689]|2[2-8]|[35]2\\d))\\d{4}|25\\d{5,6}|(?:2[2-9]|6(?:1[2356]|[24][2-6]|3[24-6]|5[2-4]|6[2-8]|7[235-7]|8[245]|9[24])|8(?:3[24]|5[245]))\\d{4}", , , , "1234567", , , [ 6, 7, 8, 9 ], [ 5 ] ], [ , , "(?:17[01]|9(?:2(?:[0-4]|[56]\\d\\d)|(?:3(?:[0-36]|4\\d)|(?:6\\d|8[89]|9[4-8])\\d|7(?:3|40|[5-9]\\d))\\d|4(?:(?:[0245]\\d|[1379])\\d|88)|5[0-6])\\d)\\d{4}|9[69]1\\d{6}|9(?:[68]\\d|9[089])\\d{5}", , , , "92123456", , , [ 7, 8, 9, 10 ] ], [ , , "80080(?:[01][1-9]|2\\d)\\d{3}", , , , "8008001234", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "1333\\d{4}|[12]468\\d{4}", , , , "13331234", , , [ 8 ] ], "MM", 95, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{2})(\\d{3})", "$1 $2 $3", [ "16|2" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", [ "[45]|6(?:0[23]|[1-689]|7[235-7])|7(?:[0-4]|5[2-7])|8[1-6]" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[12]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[4-7]|8[1-35]" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{4,6})", "$1 $2 $3", [ "9(?:2[0-4]|[35-9]|4[137-9])" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "92" ], "0$1" ], [ , "(\\d)(\\d{5})(\\d{4})", "$1 $2 $3", [ "9" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MN: [ , [ , , "[12]\\d{7,9}|[57-9]\\d{7}", , , , , , , [ 8, 9, 10 ], [ 4, 5, 6 ] ], [ , , "[12]2[1-3]\\d{5,6}|7(?:0[0-5]\\d|128)\\d{4}|(?:[12](?:1|27)|5[368])\\d{6}|[12](?:3[2-8]|4[2-68]|5[1-4689])\\d{6,7}", , , , "53123456", , , , [ 4, 5, 6 ] ], [ , , "(?:83[01]|920)\\d{5}|(?:5[05]|8[05689]|9[013-9])\\d{6}", , , , "88123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "712[0-79]\\d{4}|7(?:1[013-9]|[5-8]\\d)\\d{5}", , , , "75123456", , , [ 8 ] ], "MN", 976, "001", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", [ "[12]1" ], "0$1" ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[57-9]" ] ], [ , "(\\d{3})(\\d{5,6})", "$1 $2", [ "[12]2[1-3]" ], "0$1" ], [ , "(\\d{4})(\\d{5,6})", "$1 $2", [ "[12](?:27|3[2-8]|4[2-68]|5[1-4689])", "[12](?:27|3[2-8]|4[2-68]|5[1-4689])[0-3]" ], "0$1" ], [ , "(\\d{5})(\\d{4,5})", "$1 $2", [ "[12]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MO: [ , [ , , "0800\\d{3}|(?:28|[68]\\d)\\d{6}", , , , , , , [ 7, 8 ] ], [ , , "(?:28[2-9]|8(?:11|[2-57-9]\\d))\\d{5}", , , , "28212345", , , [ 8 ] ], [ , , "6800[0-79]\\d{3}|6(?:[235]\\d\\d|6(?:0[0-5]|[1-9]\\d)|8(?:0[1-9]|[14-8]\\d|2[5-9]|[39][0-4]))\\d{4}", , , , "66123456", , , [ 8 ] ], [ , , "0800\\d{3}", , , , "0800501", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MO", 853, "00", , , , , , , , [ [ , "(\\d{4})(\\d{3})", "$1 $2", [ "0" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[268]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MP: [ , [ , , "[58]\\d{9}|(?:67|90)0\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "670(?:2(?:3[3-7]|56|8[4-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}", , , , "6702345678", , , , [ 7 ] ], [ , , "670(?:2(?:3[3-7]|56|8[4-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}", , , , "6702345678", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "MP", 1, "011", "1", , , "1|([2-9]\\d{6})$", "670$1", , 1, , , [ , , , , , , , , , [ -1 ] ], , "670", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MQ: [ , [ , , "(?:69|80)\\d{7}|(?:59|97)6\\d{6}", , , , , , , [ 9 ] ], [ , , "596(?:[04-7]\\d|10|2[7-9]|3[04-9]|8[09]|9[4-9])\\d{4}", , , , "596301234" ], [ , , "69(?:6(?:[0-46-9]\\d|5[0-6])|727)\\d{4}", , , , "696201234" ], [ , , "80[0-5]\\d{6}", , , , "800012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "976(?:6\\d|7[0-367])\\d{4}", , , , "976612345" ], "MQ", 596, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[569]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MR: [ , [ , , "(?:[2-4]\\d\\d|800)\\d{5}", , , , , , , [ 8 ] ], [ , , "(?:25[08]|35\\d|45[1-7])\\d{5}", , , , "35123456" ], [ , , "[2-4][0-46-9]\\d{6}", , , , "22123456" ], [ , , "800\\d{5}", , , , "80012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MR", 222, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2-48]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MS: [ , [ , , "(?:[58]\\d\\d|664|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "6644(?:1[0-3]|91)\\d{4}", , , , "6644912345", , , , [ 7 ] ], [ , , "664(?:3(?:49|9[1-6])|49[2-6])\\d{4}", , , , "6644923456", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "MS", 1, "011", "1", , , "1|([34]\\d{6})$", "664$1", , , , , [ , , , , , , , , , [ -1 ] ], , "664", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MT: [ , [ , , "3550\\d{4}|(?:[2579]\\d\\d|800)\\d{5}", , , , , , , [ 8 ] ], [ , , "20(?:3[1-4]|6[059])\\d{4}|2(?:0[19]|[1-357]\\d|60)\\d{5}", , , , "21001234" ], [ , , "(?:7(?:210|[79]\\d\\d)|9(?:[29]\\d\\d|69[67]|8(?:1[1-3]|89|97)))\\d{4}", , , , "96961234" ], [ , , "800[3467]\\d{4}", , , , "80071234" ], [ , , "5(?:0(?:0(?:37|43)|(?:6\\d|70|9[0168])\\d)|[12]\\d0[1-5])\\d{3}", , , , "50037123" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "3550\\d{4}", , , , "35501234" ], "MT", 356, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[2357-9]" ] ] ], , [ , , "7117\\d{4}", , , , "71171234" ], , , [ , , , , , , , , , [ -1 ] ], [ , , "501\\d{5}", , , , "50112345" ], , , [ , , , , , , , , , [ -1 ] ] ],
            MU: [ , [ , , "(?:5|8\\d\\d)\\d{7}|[2-468]\\d{6}", , , , , , , [ 7, 8, 10 ] ], [ , , "(?:2(?:[0346-8]\\d|1[0-7])|4(?:[013568]\\d|2[4-7])|54(?:[3-5]\\d|71)|6\\d\\d|8(?:14|3[129]))\\d{4}", , , , "54480123", , , [ 7, 8 ] ], [ , , "5(?:4(?:2[1-389]|7[1-9])|87[15-8])\\d{4}|5(?:2[5-9]|4[3-589]|[57]\\d|8[0-689]|9[0-8])\\d{5}", , , , "52512345", , , [ 8 ] ], [ , , "802\\d{7}|80[0-2]\\d{4}", , , , "8001234", , , [ 7, 10 ] ], [ , , "30\\d{5}", , , , "3012345", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "3(?:20|9\\d)\\d{4}", , , , "3201234", , , [ 7 ] ], "MU", 230, "0(?:0|[24-7]0|3[03])", , , , , , "020", , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[2-46]|8[013]" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "5" ] ], [ , "(\\d{5})(\\d{5})", "$1 $2", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MV: [ , [ , , "(?:800|9[0-57-9]\\d)\\d{7}|[34679]\\d{6}", , , , , , , [ 7, 10 ] ], [ , , "(?:3(?:0[0-3]|3[0-59])|6(?:[57][02468]|6[024-68]|8[024689]))\\d{4}", , , , "6701234", , , [ 7 ] ], [ , , "46[46]\\d{4}|(?:7\\d|9[13-9])\\d{5}", , , , "7712345", , , [ 7 ] ], [ , , "800\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , "900\\d{7}", , , , "9001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MV", 960, "0(?:0|19)", , , , , , "00", , [ [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[3467]|9[13-9]" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[89]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "4[05]0\\d{4}", , , , "4001234", , , [ 7 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MW: [ , [ , , "(?:[19]\\d|[23]1|77|88)\\d{7}|1\\d{6}", , , , , , , [ 7, 9 ] ], [ , , "(?:1[2-9]|21\\d\\d)\\d{5}", , , , "1234567" ], [ , , "111\\d{6}|(?:31|77|88|9[89])\\d{7}", , , , "991234567", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MW", 265, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "1[2-9]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[137-9]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MX: [ , [ , , "1(?:(?:44|99)[1-9]|65[0-689])\\d{7}|(?:1(?:[017]\\d|[235][1-9]|4[0-35-9]|6[0-46-9]|8[1-79]|9[1-8])|[2-9]\\d)\\d{8}", , , , , , , [ 10, 11 ], [ 7, 8 ] ], [ , , "6571\\d{6}|(?:2(?:0[01]|2[1-9]|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[25-7][1-9]|3[1-8]|4\\d|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[1-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[1-467][1-9]|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[1-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|6[1-9]|7[12]|8[1-8]|9\\d))\\d{7}", , , , "2001234567", , , [ 10 ], [ 7, 8 ] ], [ , , "6571\\d{6}|(?:1(?:2(?:2[1-9]|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[24-7][1-9]|3[1-8]|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[1-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[1-467][1-9]|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[1-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|[69][1-9]|7[12]|8[1-8]))|2(?:2[1-9]|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[25-7][1-9]|3[1-8]|4\\d|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-3689]|6[1-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[1-467][1-9]|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[1-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|6[1-9]|7[12]|8[1-8]|9\\d))\\d{7}", , , , "12221234567", , , , [ 7, 8 ] ], [ , , "8(?:00|88)\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , "900\\d{7}", , , , "9001234567", , , [ 10 ] ], [ , , "300\\d{7}", , , , "3001234567", , , [ 10 ] ], [ , , "500\\d{7}", , , , "5001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], "MX", 52, "0[09]", "01", , , "0(?:[12]|4[45])|1", , "00", , [ [ , "(\\d{5})", "$1", [ "53" ] ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "33|5[56]|81" ], , , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2-9]" ], , , 1 ], [ , "(\\d)(\\d{2})(\\d{4})(\\d{4})", "$2 $3 $4", [ "1(?:33|5[56]|81)" ], , , 1 ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{4})", "$2 $3 $4", [ "1" ], , , 1 ] ], [ [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "33|5[56]|81" ], , , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2-9]" ], , , 1 ], [ , "(\\d)(\\d{2})(\\d{4})(\\d{4})", "$2 $3 $4", [ "1(?:33|5[56]|81)" ], , , 1 ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{4})", "$2 $3 $4", [ "1" ], , , 1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MY: [ , [ , , "1\\d{8,9}|(?:3\\d|[4-9])\\d{7}", , , , , , , [ 8, 9, 10 ], [ 6, 7 ] ], [ , , "(?:3(?:2[0-36-9]|3[0-368]|4[0-278]|5[0-24-8]|6[0-467]|7[1246-9]|8\\d|9[0-57])\\d|4(?:2[0-689]|[3-79]\\d|8[1-35689])|5(?:2[0-589]|[3468]\\d|5[0-489]|7[1-9]|9[23])|6(?:2[2-9]|3[1357-9]|[46]\\d|5[0-6]|7[0-35-9]|85|9[015-8])|7(?:[2579]\\d|3[03-68]|4[0-8]|6[5-9]|8[0-35-9])|8(?:[24][2-8]|3[2-5]|5[2-7]|6[2-589]|7[2-578]|[89][2-9])|9(?:0[57]|13|[25-7]\\d|[3489][0-8]))\\d{5}", , , , "323856789", , , [ 8, 9 ], [ 6, 7 ] ], [ , , "1(?:1888[69]|4400|8(?:47|8[27])[0-4])\\d{4}|1(?:0(?:[23568]\\d|4[0-6]|7[016-9]|9[0-8])|1(?:[1-5]\\d\\d|6(?:0[5-9]|[1-9]\\d)|7(?:[0134]\\d|2[1-9]|5[0-6]))|(?:(?:[269]|59)\\d|[37][1-9]|4[235-9])\\d|8(?:1[23]|[236]\\d|4[06]|5[7-9]|7[016-9]|8[01]|9[0-8]))\\d{5}", , , , "123456789", , , [ 9, 10 ] ], [ , , "1[378]00\\d{6}", , , , "1300123456", , , [ 10 ] ], [ , , "1600\\d{6}", , , , "1600123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "15(?:4(?:6[0-4]\\d|8(?:0[125]|[17]\\d|21|3[01]|4[01589]|5[014]|6[02]))|6(?:32[0-6]|78\\d))\\d{4}", , , , "1546012345", , , [ 10 ] ], "MY", 60, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1-$2 $3", [ "[4-79]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1-$2 $3", [ "1(?:[02469]|[378][1-9])|8" ], "0$1" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1-$2 $3", [ "3" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{2})(\\d{4})", "$1-$2-$3-$4", [ "1[36-8]" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2 $3", [ "15" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1-$2 $3", [ "1" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            MZ: [ , [ , , "(?:2|8\\d)\\d{7}", , , , , , , [ 8, 9 ] ], [ , , "2(?:[1346]\\d|5[0-2]|[78][12]|93)\\d{5}", , , , "21123456", , , [ 8 ] ], [ , , "8[2-79]\\d{7}", , , , "821234567", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "MZ", 258, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "2|8[2-79]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NA: [ , [ , , "[68]\\d{7,8}", , , , , , , [ 8, 9 ] ], [ , , "64426\\d{3}|6(?:1(?:2[2-7]|3[01378]|4[0-4])|254|32[0237]|4(?:27|41|5[25])|52[236-8]|626|7(?:2[2-4]|30))\\d{4,5}|6(?:1(?:(?:0\\d|2[0189]|3[24-69]|4[5-9])\\d|17|69|7[014])|2(?:17|5[0-36-8]|69|70)|3(?:17|2[14-689]|34|6[289]|7[01]|81)|4(?:17|2[0-2]|4[06]|5[0137]|69|7[01])|5(?:17|2[0459]|69|7[01])|6(?:17|25|38|42|69|7[01])|7(?:17|2[569]|3[13]|6[89]|7[01]))\\d{4}", , , , "61221234" ], [ , , "(?:60|8[1245])\\d{7}", , , , "811234567", , , [ 9 ] ], [ , , "80\\d{7}", , , , "800123456", , , [ 9 ] ], [ , , "8701\\d{5}", , , , "870123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "8(?:3\\d\\d|86)\\d{5}", , , , "88612345" ], "NA", 264, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "88" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "6" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "87" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NC: [ , [ , , "[2-57-9]\\d{5}", , , , , , , [ 6 ] ], [ , , "(?:2[03-9]|3[0-5]|4[1-7]|88)\\d{4}", , , , "201234" ], [ , , "(?:5[0-4]|[79]\\d|8[0-79])\\d{4}", , , , "751234" ], [ , , , , , , , , , [ -1 ] ], [ , , "36\\d{4}", , , , "366711" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NC", 687, "00", , , , , , , , [ [ , "(\\d{3})", "$1", [ "5[6-8]" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})", "$1.$2.$3", [ "[2-57-9]" ] ] ], [ [ , "(\\d{2})(\\d{2})(\\d{2})", "$1.$2.$3", [ "[2-57-9]" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NE: [ , [ , , "[027-9]\\d{7}", , , , , , , [ 8 ] ], [ , , "2(?:0(?:20|3[1-8]|4[13-5]|5[14]|6[14578]|7[1-578])|1(?:4[145]|5[14]|6[14-68]|7[169]|88))\\d{4}", , , , "20201234" ], [ , , "(?:23|7[04]|[89]\\d)\\d{6}", , , , "93123456" ], [ , , "08\\d{6}", , , , "08123456" ], [ , , "09\\d{6}", , , , "09123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NE", 227, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "08" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[089]|2[013]|7[04]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NF: [ , [ , , "[13]\\d{5}", , , , , , , [ 6 ], [ 5 ] ], [ , , "(?:1(?:06|17|28|39)|3[0-2]\\d)\\d{3}", , , , "106609", , , , [ 5 ] ], [ , , "(?:14|3[58])\\d{4}", , , , "381234", , , , [ 5 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NF", 672, "00", , , , "([0-258]\\d{4})$", "3$1", , , [ [ , "(\\d{2})(\\d{4})", "$1 $2", [ "1[0-3]" ] ], [ , "(\\d)(\\d{5})", "$1 $2", [ "[13]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NG: [ , [ , , "(?:[124-7]|9\\d{3})\\d{6}|[1-9]\\d{7}|[78]\\d{9,13}", , , , , , , [ 7, 8, 10, 11, 12, 13, 14 ], [ 5, 6 ] ], [ , , "(?:(?:[1-356]\\d|4[02-8]|8[2-9])\\d|9(?:0[3-9]|[1-9]\\d))\\d{5}|7(?:0(?:[013-689]\\d|2[0-24-9])\\d{3,4}|[1-79]\\d{6})|(?:[12]\\d|4[147]|5[14579]|6[1578]|7[1-3578])\\d{5}", , , , "18040123", , , [ 7, 8 ], [ 5, 6 ] ], [ , , "(?:702[0-24-9]|8(?:01|19)[01])\\d{6}|(?:70[13-689]|8(?:0[2-9]|1[0-8])|9(?:0[1-9]|1[2356]))\\d{7}", , , , "8021234567", , , [ 10 ] ], [ , , "800\\d{7,11}", , , , "80017591759", , , [ 10, 11, 12, 13, 14 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NG", 234, "009", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", [ "78" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[12]|9(?:0[3-9]|[1-9])" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2,3})", "$1 $2 $3", [ "[3-7]|8[2-9]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[7-9]" ], "0$1" ], [ , "(\\d{3})(\\d{4})(\\d{4,5})", "$1 $2 $3", [ "[78]" ], "0$1" ], [ , "(\\d{3})(\\d{5})(\\d{5,6})", "$1 $2 $3", [ "[78]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "700\\d{7,11}", , , , "7001234567", , , [ 10, 11, 12, 13, 14 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NI: [ , [ , , "(?:1800|[25-8]\\d{3})\\d{4}", , , , , , , [ 8 ] ], [ , , "2\\d{7}", , , , "21234567" ], [ , , "(?:5(?:5[0-7]|[78]\\d)|6(?:20|3[035]|4[045]|5[05]|77|8[1-9]|9[059])|(?:7[5-8]|8\\d)\\d)\\d{5}", , , , "81234567" ], [ , , "1800\\d{4}", , , , "18001234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NI", 505, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[125-8]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NL: [ , [ , , "(?:[124-7]\\d\\d|3(?:[02-9]\\d|1[0-8]))\\d{6}|[89]\\d{6,9}|1\\d{4,5}", , , , , , , [ 5, 6, 7, 8, 9, 10 ] ], [ , , "(?:1(?:[035]\\d|1[13-578]|6[124-8]|7[24]|8[0-467])|2(?:[0346]\\d|2[2-46-9]|5[125]|9[479])|3(?:[03568]\\d|1[3-8]|2[01]|4[1-8])|4(?:[0356]\\d|1[1-368]|7[58]|8[15-8]|9[23579])|5(?:[0358]\\d|[19][1-9]|2[1-57-9]|4[13-8]|6[126]|7[0-3578])|7\\d\\d)\\d{6}", , , , "101234567", , , [ 9 ] ], [ , , "6[1-58]\\d{7}", , , , "612345678", , , [ 9 ] ], [ , , "800\\d{4,7}", , , , "8001234", , , [ 7, 8, 9, 10 ] ], [ , , "90[069]\\d{4,7}", , , , "9061234", , , [ 7, 8, 9, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:85|91)\\d{7}", , , , "851234567", , , [ 9 ] ], "NL", 31, "00", "0", , , "0", , , , [ [ , "(\\d{4})", "$1", [ "1[238]|[34]" ] ], [ , "(\\d{2})(\\d{3,4})", "$1 $2", [ "14" ] ], [ , "(\\d{6})", "$1", [ "1" ] ], [ , "(\\d{3})(\\d{4,7})", "$1 $2", [ "[89]0" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "66" ], "0$1" ], [ , "(\\d)(\\d{8})", "$1 $2", [ "6" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1[16-8]|2[259]|3[124]|4[17-9]|5[124679]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[1-57-9]" ], "0$1" ] ], [ [ , "(\\d{3})(\\d{4,7})", "$1 $2", [ "[89]0" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "66" ], "0$1" ], [ , "(\\d)(\\d{8})", "$1 $2", [ "6" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1[16-8]|2[259]|3[124]|4[17-9]|5[124679]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[1-57-9]" ], "0$1" ] ], [ , , "66\\d{7}", , , , "662345678", , , [ 9 ] ], , , [ , , "140(?:1[035]|2[0346]|3[03568]|4[0356]|5[0358]|8[458])|140(?:1[16-8]|2[259]|3[124]|4[17-9]|5[124679]|7)\\d", , , , , , , [ 5, 6 ] ], [ , , "140(?:1[035]|2[0346]|3[03568]|4[0356]|5[0358]|8[458])|(?:140(?:1[16-8]|2[259]|3[124]|4[17-9]|5[124679]|7)|8[478]\\d{6})\\d", , , , "14020", , , [ 5, 6, 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NO: [ , [ , , "(?:0|[2-9]\\d{3})\\d{4}", , , , , , , [ 5, 8 ] ], [ , , "(?:2[1-4]|3[1-3578]|5[1-35-7]|6[1-4679]|7[0-8])\\d{6}", , , , "21234567", , , [ 8 ] ], [ , , "(?:4[015-8]|59|9\\d)\\d{6}", , , , "40612345", , , [ 8 ] ], [ , , "80[01]\\d{5}", , , , "80012345", , , [ 8 ] ], [ , , "82[09]\\d{5}", , , , "82012345", , , [ 8 ] ], [ , , "810(?:0[0-6]|[2-8]\\d)\\d{3}", , , , "81021234", , , [ 8 ] ], [ , , "880\\d{5}", , , , "88012345", , , [ 8 ] ], [ , , "85[0-5]\\d{5}", , , , "85012345", , , [ 8 ] ], "NO", 47, "00", , , , , , , , [ [ , "(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", [ "[489]|59" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[235-7]" ] ] ], , [ , , , , , , , , , [ -1 ] ], 1, "[02-689]|7[0-8]", [ , , , , , , , , , [ -1 ] ], [ , , "(?:0[2-9]|81(?:0(?:0[7-9]|1\\d)|5\\d\\d))\\d{3}", , , , "02000" ], , , [ , , "81[23]\\d{5}", , , , "81212345", , , [ 8 ] ] ],
            NP: [ , [ , , "(?:1\\d|9)\\d{9}|[1-9]\\d{7}", , , , , , , [ 8, 10, 11 ], [ 6, 7 ] ], [ , , "(?:1[0-6]\\d|99[02-6])\\d{5}|(?:2[13-79]|3[135-8]|4[146-9]|5[135-7]|6[13-9]|7[15-9]|8[1-46-9]|9[1-7])[2-6]\\d{5}", , , , "14567890", , , [ 8 ], [ 6, 7 ] ], [ , , "9(?:6[0-3]|7[245]|8[0-24-68])\\d{7}", , , , "9841234567", , , [ 10 ] ], [ , , "1(?:66001|800\\d\\d)\\d{5}", , , , "16600101234", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NP", 977, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{7})", "$1-$2", [ "1[2-6]" ], "0$1" ], [ , "(\\d{2})(\\d{6})", "$1-$2", [ "1[01]|[2-8]|9(?:[1-579]|6[2-6])" ], "0$1" ], [ , "(\\d{3})(\\d{7})", "$1-$2", [ "9" ] ], [ , "(\\d{4})(\\d{2})(\\d{5})", "$1-$2-$3", [ "1" ] ] ], [ [ , "(\\d)(\\d{7})", "$1-$2", [ "1[2-6]" ], "0$1" ], [ , "(\\d{2})(\\d{6})", "$1-$2", [ "1[01]|[2-8]|9(?:[1-579]|6[2-6])" ], "0$1" ], [ , "(\\d{3})(\\d{7})", "$1-$2", [ "9" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NR: [ , [ , , "(?:444|(?:55|8\\d)\\d|666)\\d{4}", , , , , , , [ 7 ] ], [ , , "444\\d{4}", , , , "4441234" ], [ , , "(?:55[3-9]|666|8\\d\\d)\\d{4}", , , , "5551234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NR", 674, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[4-68]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NU: [ , [ , , "(?:[47]|888\\d)\\d{3}", , , , , , , [ 4, 7 ] ], [ , , "[47]\\d{3}", , , , "7012", , , [ 4 ] ], [ , , "888[4-9]\\d{3}", , , , "8884012", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "NU", 683, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            NZ: [ , [ , , "[29]\\d{7,9}|50\\d{5}(?:\\d{2,3})?|6[0-35-9]\\d{6}|7\\d{7,8}|8\\d{4,9}|(?:11\\d|[34])\\d{7}", , , , , , , [ 5, 6, 7, 8, 9, 10 ] ], [ , , "24099\\d{3}|(?:3[2-79]|[49][2-9]|6[235-9]|7[2-57-9])\\d{6}", , , , "32345678", , , [ 8 ], [ 7 ] ], [ , , "2[0-27-9]\\d{7,8}|21\\d{6}", , , , "211234567", , , [ 8, 9, 10 ] ], [ , , "508\\d{6,7}|80\\d{6,8}", , , , "800123456", , , [ 8, 9, 10 ] ], [ , , "(?:11\\d{5}|50(?:0[08]|30|66|77|88))\\d{3}|90\\d{6,8}", , , , "900123456", , , [ 7, 8, 9, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70\\d{7}", , , , "701234567", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], "NZ", 64, "0(?:0|161)", "0", , , "0", , "00", , [ [ , "(\\d{2})(\\d{3,8})", "$1 $2", [ "8[1-579]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2,3})", "$1 $2 $3", [ "50[036-8]|[89]0", "50(?:[0367]|88)|[89]0" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{4})", "$1-$2 $3", [ "24|[346]|7[2-57-9]|9[2-9]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "2(?:10|74)|[59]|80" ], "0$1" ], [ , "(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "1|2[028]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,5})", "$1 $2 $3", [ "2(?:[169]|7[0-35-9])|7|86" ], "0$1" ] ], , [ , , "[28]6\\d{6,7}", , , , "26123456", , , [ 8, 9 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "8(?:1[6-9]|22|3\\d|4[045]|5[459]|7[0-3579]|90)\\d{2,7}", , , , "83012378" ], , , [ , , , , , , , , , [ -1 ] ] ],
            OM: [ , [ , , "(?:1505|[279]\\d{3}|500)\\d{4}|800\\d{5,6}", , , , , , , [ 7, 8, 9 ] ], [ , , "2[2-6]\\d{6}", , , , "23123456", , , [ 8 ] ], [ , , "1505\\d{4}|(?:7(?:[1289]\\d|70)|9(?:0[1-9]|[1-9]\\d))\\d{5}", , , , "92123456", , , [ 8 ] ], [ , , "8007\\d{4,5}|(?:500|800[05])\\d{4}", , , , "80071234" ], [ , , "900\\d{5}", , , , "90012345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "OM", 968, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4,6})", "$1 $2", [ "[58]" ] ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "2" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[179]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PA: [ , [ , , "(?:00800|8\\d{3})\\d{6}|[68]\\d{7}|[1-57-9]\\d{6}", , , , , , , [ 7, 8, 10, 11 ] ], [ , , "(?:1(?:0\\d|1[479]|2[37]|3[0137]|4[17]|5[05]|6[58]|7[0167]|8[258]|9[1389])|2(?:[0235-79]\\d|1[0-7]|4[013-9]|8[02-9])|3(?:[089]\\d|1[0-7]|2[0-5]|33|4[0-79]|5[05]|6[068]|7[0-8])|4(?:00|3[0-579]|4\\d|7[0-57-9])|5(?:[01]\\d|2[0-7]|[56]0|79)|7(?:0[09]|2[0-26-8]|3[03]|4[04]|5[05-9]|6[056]|7[0-24-9]|8[6-9]|90)|8(?:09|2[89]|3\\d|4[0-24-689]|5[014]|8[02])|9(?:0[5-9]|1[0135-8]|2[036-9]|3[35-79]|40|5[0457-9]|6[05-9]|7[04-9]|8[35-8]|9\\d))\\d{4}", , , , "2001234", , , [ 7 ] ], [ , , "(?:1[16]1|21[89]|6(?:[02-9]\\d|1[0-8])\\d|8(?:1[01]|7[23]))\\d{4}", , , , "61234567", , , [ 7, 8 ] ], [ , , "800\\d{4,5}|(?:00800|800\\d)\\d{6}", , , , "8001234" ], [ , , "(?:8(?:22|55|60|7[78]|86)|9(?:00|81))\\d{4}", , , , "8601234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "PA", 507, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[1-57-9]" ] ], [ , "(\\d{4})(\\d{4})", "$1-$2", [ "[68]" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PE: [ , [ , , "(?:[14-8]|9\\d)\\d{7}", , , , , , , [ 8, 9 ], [ 6, 7 ] ], [ , , "(?:(?:4[34]|5[14])[0-8]\\d|7(?:173|3[0-8]\\d)|8(?:10[05689]|6(?:0[06-9]|1[6-9]|29)|7(?:0[569]|[56]0)))\\d{4}|(?:1[0-8]|4[12]|5[236]|6[1-7]|7[246]|8[2-4])\\d{6}", , , , "11234567", , , [ 8 ], [ 6, 7 ] ], [ , , "9\\d{8}", , , , "912345678", , , [ 9 ] ], [ , , "800\\d{5}", , , , "80012345", , , [ 8 ] ], [ , , "805\\d{5}", , , , "80512345", , , [ 8 ] ], [ , , "801\\d{5}", , , , "80112345", , , [ 8 ] ], [ , , "80[24]\\d{5}", , , , "80212345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], "PE", 51, "19(?:1[124]|77|90)00", "0", " Anexo ", , "0", , , , [ [ , "(\\d{3})(\\d{5})", "$1 $2", [ "80" ], "(0$1)" ], [ , "(\\d)(\\d{7})", "$1 $2", [ "1" ], "(0$1)" ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "[4-8]" ], "(0$1)" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "9" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PF: [ , [ , , "4\\d{5}(?:\\d{2})?|8\\d{7,8}", , , , , , , [ 6, 8, 9 ] ], [ , , "4(?:0[4-689]|9[4-68])\\d{5}", , , , "40412345", , , [ 8 ] ], [ , , "8[7-9]\\d{6}", , , , "87123456", , , [ 8 ] ], [ , , "80[0-5]\\d{6}", , , , "800012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "499\\d{5}", , , , "49901234", , , [ 8 ] ], "PF", 689, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", [ "44" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "4|8[7-9]" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "44\\d{4}", , , , , , , [ 6 ] ], [ , , "44\\d{4}", , , , "440123", , , [ 6 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PG: [ , [ , , "(?:180|[78]\\d{3})\\d{4}|(?:[2-589]\\d|64)\\d{5}", , , , , , , [ 7, 8 ] ], [ , , "(?:(?:3[0-2]|4[257]|5[34]|9[78])\\d|64[1-9]|85[02-46-9])\\d{4}", , , , "3123456", , , [ 7 ] ], [ , , "(?:7\\d|8[18])\\d{6}", , , , "70123456", , , [ 8 ] ], [ , , "180\\d{4}", , , , "1801234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "2(?:0[0-47]|7[568])\\d{4}", , , , "2751234", , , [ 7 ] ], "PG", 675, "00|140[1-3]", , , , , , "00", , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "18|[2-69]|85" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[78]" ] ] ], , [ , , "27[01]\\d{4}", , , , "2700123", , , [ 7 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PH: [ , [ , , "(?:[2-7]|9\\d)\\d{8}|2\\d{5}|(?:1800|8)\\d{7,9}", , , , , , , [ 6, 8, 9, 10, 11, 12, 13 ], [ 4, 5, 7 ] ], [ , , "(?:(?:2[3-8]|3[2-68]|4[2-9]|5[2-6]|6[2-58]|7[24578])\\d{3}|88(?:22\\d\\d|42))\\d{4}|(?:2|8[2-8]\\d\\d)\\d{5}", , , , "232345678", , , [ 6, 8, 9, 10 ], [ 4, 5, 7 ] ], [ , , "(?:8(?:1[37]|9[5-8])|9(?:0[5-9]|1[0-24-9]|[235-7]\\d|4[2-9]|8[135-9]|9[1-9]))\\d{7}", , , , "9051234567", , , [ 10 ] ], [ , , "1800\\d{7,9}", , , , "180012345678", , , [ 11, 12, 13 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "PH", 63, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{5})", "$1 $2", [ "2" ], "(0$1)" ], [ , "(\\d{4})(\\d{4,6})", "$1 $2", [ "3(?:23|39|46)|4(?:2[3-6]|[35]9|4[26]|76)|544|88[245]|(?:52|64|86)2", "3(?:230|397|461)|4(?:2(?:35|[46]4|51)|396|4(?:22|63)|59[347]|76[15])|5(?:221|446)|642[23]|8(?:622|8(?:[24]2|5[13]))" ], "(0$1)" ], [ , "(\\d{5})(\\d{4})", "$1 $2", [ "346|4(?:27|9[35])|883", "3469|4(?:279|9(?:30|56))|8834" ], "(0$1)" ], [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "2" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[3-7]|8[2-8]" ], "(0$1)" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[89]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ] ], [ , "(\\d{4})(\\d{1,2})(\\d{3})(\\d{4})", "$1 $2 $3 $4", [ "1" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PK: [ , [ , , "122\\d{6}|[24-8]\\d{10,11}|9(?:[013-9]\\d{8,10}|2(?:[01]\\d\\d|2(?:[06-8]\\d|1[01]))\\d{7})|(?:[2-8]\\d{3}|92(?:[0-7]\\d|8[1-9]))\\d{6}|[24-9]\\d{8}|[89]\\d{7}", , , , , , , [ 8, 9, 10, 11, 12 ], [ 5, 6, 7 ] ], [ , , "(?:(?:21|42)[2-9]|58[126])\\d{7}|(?:2[25]|4[0146-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]\\d{6,7}|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8]))[2-9]\\d{5,6}", , , , "2123456789", , , [ 9, 10 ], [ 5, 6, 7, 8 ] ], [ , , "3(?:[014]\\d|2[0-5]|3[0-7]|55|64)\\d{7}", , , , "3012345678", , , [ 10 ] ], [ , , "800\\d{5}(?:\\d{3})?", , , , "80012345", , , [ 8, 11 ] ], [ , , "900\\d{5}", , , , "90012345", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "122\\d{6}", , , , "122044444", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], "PK", 92, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})(\\d{2,7})", "$1 $2 $3", [ "[89]0" ], "0$1" ], [ , "(\\d{4})(\\d{5})", "$1 $2", [ "1" ] ], [ , "(\\d{3})(\\d{6,7})", "$1 $2", [ "2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8])", "9(?:2[3-8]|98)|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:22|3[27-9]|4[2-6]|6[3569]|9[25-7]))[2-9]" ], "(0$1)" ], [ , "(\\d{2})(\\d{7,8})", "$1 $2", [ "(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]" ], "(0$1)" ], [ , "(\\d{5})(\\d{5})", "$1 $2", [ "58" ], "(0$1)" ], [ , "(\\d{3})(\\d{7})", "$1 $2", [ "3" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91" ], "(0$1)" ], [ , "(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "[24-9]" ], "(0$1)" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:2(?:[125]|3[2358]|4[2-4]|9[2-8])|4(?:[0-246-9]|5[3479])|5(?:[1-35-7]|4[2-467])|6(?:0[468]|[1-8])|7(?:[14]|2[236])|8(?:[16]|2[2-689]|3[23578]|4[3478]|5[2356])|9(?:1|22|3[27-9]|4[2-6]|6[3569]|9[2-7]))111\\d{6}", , , , "21111825888", , , [ 11, 12 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PL: [ , [ , , "6\\d{5}(?:\\d{2})?|8\\d{9}|[1-9]\\d{6}(?:\\d{2})?", , , , , , , [ 6, 7, 8, 9, 10 ] ], [ , , "47\\d{7}|(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])(?:[02-9]\\d{6}|1(?:[0-8]\\d{5}|9\\d{3}(?:\\d{2})?))", , , , "123456789", , , [ 7, 9 ] ], [ , , "211(?:1\\d|3[1-5])\\d{4}|(?:45|5[0137]|6[069]|7[2389]|88)\\d{7}", , , , "512345678", , , [ 9 ] ], [ , , "800\\d{6,7}", , , , "800123456", , , [ 9, 10 ] ], [ , , "70[01346-8]\\d{6}", , , , "701234567", , , [ 9 ] ], [ , , "801\\d{6}", , , , "801234567", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "39\\d{7}", , , , "391234567", , , [ 9 ] ], "PL", 48, "00", , , , , , , , [ [ , "(\\d{5})", "$1", [ "19" ] ], [ , "(\\d{3})(\\d{3})", "$1 $2", [ "11|64" ] ], [ , "(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", [ "(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])1", "(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])19" ] ], [ , "(\\d{3})(\\d{2})(\\d{2,3})", "$1 $2 $3", [ "64" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "21|39|45|5[0137]|6[0469]|7[02389]|8(?:0[14]|8)" ] ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "1[2-8]|[2-7]|8[1-79]|9[145]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "8" ] ] ], , [ , , "64\\d{4,7}", , , , "641234567", , , [ 6, 7, 8, 9 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "804\\d{6}", , , , "804123456", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PM: [ , [ , , "(?:[45]|80\\d\\d)\\d{5}", , , , , , , [ 6, 9 ] ], [ , , "(?:4[1-3]|50)\\d{4}", , , , "430123", , , [ 6 ] ], [ , , "(?:4[02-4]|5[05])\\d{4}", , , , "551234", , , [ 6 ] ], [ , , "80[0-5]\\d{6}", , , , "800012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "PM", 508, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", [ "[45]" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PR: [ , [ , , "(?:[589]\\d\\d|787)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "(?:787|939)[2-9]\\d{6}", , , , "7872345678", , , , [ 7 ] ], [ , , "(?:787|939)[2-9]\\d{6}", , , , "7872345678", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "PR", 1, "011", "1", , , "1", , , 1, , , [ , , , , , , , , , [ -1 ] ], , "787|939", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PS: [ , [ , , "[2489]2\\d{6}|(?:1\\d|5)\\d{8}", , , , , , , [ 8, 9, 10 ], [ 7 ] ], [ , , "(?:22[2-47-9]|42[45]|82[014-68]|92[3569])\\d{5}", , , , "22234567", , , [ 8 ], [ 7 ] ], [ , , "5[69]\\d{7}", , , , "599123456", , , [ 9 ] ], [ , , "1800\\d{6}", , , , "1800123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "1700\\d{6}", , , , "1700123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "PS", 970, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "[2489]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "5" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PT: [ , [ , , "1693\\d{5}|(?:[26-9]\\d|30)\\d{7}", , , , , , , [ 9 ] ], [ , , "2(?:[12]\\d|[35][1-689]|4[1-59]|6[1-35689]|7[1-9]|8[1-69]|9[1256])\\d{6}", , , , "212345678" ], [ , , "6[0356]92(?:30|9\\d)\\d{3}|(?:(?:16|6[0356])93|9(?:[1-36]\\d\\d|480))\\d{5}", , , , "912345678" ], [ , , "80[02]\\d{6}", , , , "800123456" ], [ , , "(?:6(?:0[178]|4[68])\\d|76(?:0[1-57]|1[2-47]|2[237]))\\d{5}", , , , "760123456" ], [ , , "80(?:8\\d|9[1579])\\d{5}", , , , "808123456" ], [ , , "884[0-4689]\\d{5}", , , , "884123456" ], [ , , "30\\d{7}", , , , "301234567" ], "PT", 351, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "2[12]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "16|[236-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "70(?:7\\d|8[17])\\d{5}", , , , "707123456" ], , , [ , , "600\\d{6}", , , , "600110000" ] ],
            PW: [ , [ , , "(?:[24-8]\\d\\d|345|900)\\d{4}", , , , , , , [ 7 ] ], [ , , "(?:2(?:55|77)|345|488|5(?:35|44|87)|6(?:22|54|79)|7(?:33|47)|8(?:24|55|76)|900)\\d{4}", , , , "2771234" ], [ , , "(?:46[0-5]|6[2-4689]0)\\d{4}|(?:45|77|88)\\d{5}", , , , "6201234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "PW", 680, "01[12]", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[2-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            PY: [ , [ , , "59\\d{4,6}|9\\d{5,10}|(?:[2-46-8]\\d|5[0-8])\\d{4,7}", , , , , , , [ 6, 7, 8, 9, 10, 11 ], [ 5 ] ], [ , , "(?:[26]1|3[289]|4[1246-8]|7[1-3]|8[1-36])\\d{5,7}|(?:2(?:2[4-68]|[4-68]\\d|7[15]|9[1-5])|3(?:18|3[167]|4[2357]|51|[67]\\d)|4(?:3[12]|5[13]|9[1-47])|5(?:[1-4]\\d|5[02-4])|6(?:3[1-3]|44|7[1-8])|7(?:4[0-4]|5\\d|6[1-578]|75|8[0-8])|858)\\d{5,6}", , , , "212345678", , , [ 7, 8, 9 ], [ 5, 6 ] ], [ , , "9(?:51|6[129]|[78][1-6]|9[1-5])\\d{6}", , , , "961456789", , , [ 9 ] ], [ , , "9800\\d{5,7}", , , , "98000123456", , , [ 9, 10, 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "8700[0-4]\\d{4}", , , , "870012345", , , [ 9 ] ], "PY", 595, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3,6})", "$1 $2", [ "[2-9]0" ], "0$1" ], [ , "(\\d{2})(\\d{5})", "$1 $2", [ "[26]1|3[289]|4[1246-8]|7[1-3]|8[1-36]" ], "(0$1)" ], [ , "(\\d{3})(\\d{4,5})", "$1 $2", [ "2[279]|3[13-5]|4[359]|5|6(?:[34]|7[1-46-8])|7[46-8]|85" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "2[14-68]|3[26-9]|4[1246-8]|6(?:1|75)|7[1-35]|8[1-36]" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "87" ] ], [ , "(\\d{3})(\\d{6})", "$1 $2", [ "9(?:[5-79]|8[1-6])" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2-8]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "9" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "[2-9]0\\d{4,7}", , , , "201234567", , , [ 6, 7, 8, 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            QA: [ , [ , , "[2-7]\\d{7}|800\\d{4}(?:\\d{2})?|2\\d{6}", , , , , , , [ 7, 8, 9 ] ], [ , , "4141\\d{4}|(?:23|4[04])\\d{6}", , , , "44123456", , , [ 8 ] ], [ , , "(?:28|[35-7]\\d)\\d{6}", , , , "33123456", , , [ 8 ] ], [ , , "800\\d{4}(?:\\d{2})?", , , , "8001234", , , [ 7, 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "QA", 974, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "2[126]|8" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[2-7]" ] ] ], , [ , , "2(?:[12]\\d|61)\\d{4}", , , , "2123456", , , [ 7 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            RE: [ , [ , , "9769\\d{5}|(?:26|[68]\\d)\\d{7}", , , , , , , [ 9 ] ], [ , , "26(?:2\\d\\d|30[0-5])\\d{4}", , , , "262161234" ], [ , , "(?:69(?:2\\d\\d|3(?:[06][0-46]|1[013]|2[0-2]|3[0-39]|4\\d|5[0-5]|7[0-27]|8[0-8]|9[0-479]))|9769\\d)\\d{4}", , , , "692123456" ], [ , , "80\\d{7}", , , , "801234567" ], [ , , "89[1-37-9]\\d{6}", , , , "891123456" ], [ , , "8(?:1[019]|2[0156]|84|90)\\d{6}", , , , "810123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "RE", 262, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2689]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], 1, "26[23]|69|[89]", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            RO: [ , [ , , "(?:[2378]\\d|90)\\d{7}|[23]\\d{5}", , , , , , , [ 6, 9 ] ], [ , , "[23][13-6]\\d{7}|(?:2(?:19\\d|[3-6]\\d9)|31\\d\\d)\\d\\d", , , , "211234567" ], [ , , "7020\\d{5}|7(?:0[013-9]|1[0-3]|[2-7]\\d|8[03-8]|9[019])\\d{6}", , , , "712034567", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "90[0136]\\d{6}", , , , "900123456", , , [ 9 ] ], [ , , "801\\d{6}", , , , "801123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "RO", 40, "00", "0", " int ", , "0", , , , [ [ , "(\\d{3})(\\d{3})", "$1 $2", [ "2[3-6]", "2[3-6]\\d9" ], "0$1" ], [ , "(\\d{2})(\\d{4})", "$1 $2", [ "219|31" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[23]1" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[237-9]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:37\\d|80[578])\\d{6}", , , , "372123456", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            RS: [ , [ , , "38[02-9]\\d{6,9}|6\\d{7,9}|90\\d{4,8}|38\\d{5,6}|(?:7\\d\\d|800)\\d{3,9}|(?:[12]\\d|3[0-79])\\d{5,10}", , , , , , , [ 6, 7, 8, 9, 10, 11, 12 ], [ 4, 5 ] ], [ , , "(?:11[1-9]\\d|(?:2[389]|39)(?:0[2-9]|[2-9]\\d))\\d{3,8}|(?:1[02-9]|2[0-24-7]|3[0-8])[2-9]\\d{4,9}", , , , "10234567", , , [ 7, 8, 9, 10, 11, 12 ], [ 4, 5, 6 ] ], [ , , "6(?:[0-689]|7\\d)\\d{6,7}", , , , "601234567", , , [ 8, 9, 10 ] ], [ , , "800\\d{3,9}", , , , "80012345" ], [ , , "(?:78\\d|90[0169])\\d{3,7}", , , , "90012345", , , [ 6, 7, 8, 9, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "RS", 381, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3,9})", "$1 $2", [ "(?:2[389]|39)0|[7-9]" ], "0$1" ], [ , "(\\d{2})(\\d{5,10})", "$1 $2", [ "[1-36]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "7[06]\\d{4,10}", , , , "700123456" ], , , [ , , , , , , , , , [ -1 ] ] ],
            RU: [ , [ , , "8\\d{13}|[347-9]\\d{9}", , , , , , , [ 10, 14 ], [ 7 ] ], [ , , "(?:3(?:0[12]|4[1-35-79]|5[1-3]|65|8[1-58]|9[0145])|4(?:01|1[1356]|2[13467]|7[1-5]|8[1-7]|9[1-689])|8(?:1[1-8]|2[01]|3[13-6]|4[0-8]|5[15]|6[1-35-79]|7[1-37-9]))\\d{7}", , , , "3011234567", , , [ 10 ], [ 7 ] ], [ , , "9\\d{9}", , , , "9123456789", , , [ 10 ] ], [ , , "8(?:0[04]|108\\d{3})\\d{7}", , , , "8001234567" ], [ , , "80[39]\\d{7}", , , , "8091234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "808\\d{7}", , , , "8081234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], "RU", 7, "810", "8", , , "8", , "8~10", , [ [ , "(\\d{3})(\\d{2})(\\d{2})", "$1-$2-$3", [ "[0-79]" ] ], [ , "(\\d{4})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "7(?:1[0-8]|2[1-9])", "7(?:1(?:[0-6]2|7|8[27])|2(?:1[23]|[2-9]2))", "7(?:1(?:[0-6]2|7|8[27])|2(?:13[03-69]|62[013-9]))|72[1-57-9]2" ], "8 ($1)", , 1 ], [ , "(\\d{5})(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "7(?:1[0-68]|2[1-9])", "7(?:1(?:[06][3-6]|[18]|2[35]|[3-5][3-5])|2(?:[13][3-5]|[24-689]|7[457]))", "7(?:1(?:0(?:[356]|4[023])|[18]|2(?:3[013-9]|5)|3[45]|43[013-79]|5(?:3[1-8]|4[1-7]|5)|6(?:3[0-35-9]|[4-6]))|2(?:1(?:3[178]|[45])|[24-689]|3[35]|7[457]))|7(?:14|23)4[0-8]|71(?:33|45)[1-79]" ], "8 ($1)", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "7" ], "8 ($1)", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2-$3-$4", [ "[349]|8(?:[02-7]|1[1-8])" ], "8 ($1)", , 1 ], [ , "(\\d{4})(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "8" ], "8 ($1)" ] ], [ [ , "(\\d{4})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "7(?:1[0-8]|2[1-9])", "7(?:1(?:[0-6]2|7|8[27])|2(?:1[23]|[2-9]2))", "7(?:1(?:[0-6]2|7|8[27])|2(?:13[03-69]|62[013-9]))|72[1-57-9]2" ], "8 ($1)", , 1 ], [ , "(\\d{5})(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "7(?:1[0-68]|2[1-9])", "7(?:1(?:[06][3-6]|[18]|2[35]|[3-5][3-5])|2(?:[13][3-5]|[24-689]|7[457]))", "7(?:1(?:0(?:[356]|4[023])|[18]|2(?:3[013-9]|5)|3[45]|43[013-79]|5(?:3[1-8]|4[1-7]|5)|6(?:3[0-35-9]|[4-6]))|2(?:1(?:3[178]|[45])|[24-689]|3[35]|7[457]))|7(?:14|23)4[0-8]|71(?:33|45)[1-79]" ], "8 ($1)", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "7" ], "8 ($1)", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2-$3-$4", [ "[349]|8(?:[02-7]|1[1-8])" ], "8 ($1)", , 1 ], [ , "(\\d{4})(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "8" ], "8 ($1)" ] ], [ , , , , , , , , , [ -1 ] ], 1, "3[04-689]|[489]", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            RW: [ , [ , , "(?:06|[27]\\d\\d|[89]00)\\d{6}", , , , , , , [ 8, 9 ] ], [ , , "(?:06|2[23568]\\d)\\d{6}", , , , "250123456" ], [ , , "7[2389]\\d{7}", , , , "720123456", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "900\\d{6}", , , , "900123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "RW", 250, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "0" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[7-9]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "2" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SA: [ , [ , , "92\\d{7}|(?:[15]|8\\d)\\d{8}", , , , , , , [ 9, 10 ], [ 7 ] ], [ , , "1(?:1\\d|2[24-8]|3[35-8]|4[3-68]|6[2-5]|7[235-7])\\d{6}", , , , "112345678", , , [ 9 ], [ 7 ] ], [ , , "579[01]\\d{5}|5(?:[013-689]\\d|7[0-36-8])\\d{6}", , , , "512345678", , , [ 9 ] ], [ , , "800\\d{7}", , , , "8001234567", , , [ 10 ] ], [ , , "925\\d{6}", , , , "925012345", , , [ 9 ] ], [ , , "920\\d{6}", , , , "920012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SA", 966, "00", "0", , , "0", , , , [ [ , "(\\d{4})(\\d{5})", "$1 $2", [ "9" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "5" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "81" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "811\\d{7}", , , , "8110123456", , , [ 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SB: [ , [ , , "(?:[1-6]|[7-9]\\d\\d)\\d{4}", , , , , , , [ 5, 7 ] ], [ , , "(?:1[4-79]|[23]\\d|4[0-2]|5[03]|6[0-37])\\d{3}", , , , "40123", , , [ 5 ] ], [ , , "48\\d{3}|(?:(?:7[1-9]|8[4-9])\\d|9(?:1[2-9]|2[013-9]|3[0-2]|[46]\\d|5[0-46-9]|7[0-689]|8[0-79]|9[0-8]))\\d{4}", , , , "7421234" ], [ , , "1[38]\\d{3}", , , , "18123", , , [ 5 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "5[12]\\d{3}", , , , "51123", , , [ 5 ] ], "SB", 677, "0[01]", , , , , , , , [ [ , "(\\d{2})(\\d{5})", "$1 $2", [ "7|8[4-9]|9(?:[1-8]|9[0-8])" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SC: [ , [ , , "8000\\d{3}|(?:[249]\\d|64)\\d{5}", , , , , , , [ 7 ] ], [ , , "4[2-46]\\d{5}", , , , "4217123" ], [ , , "2[5-8]\\d{5}", , , , "2510123" ], [ , , "8000\\d{3}", , , , "8000000" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "971\\d{4}|(?:64|95)\\d{5}", , , , "6412345" ], "SC", 248, "010|0[0-2]", , , , , , "00", , [ [ , "(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", [ "[246]|9[57]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SD: [ , [ , , "[19]\\d{8}", , , , , , , [ 9 ] ], [ , , "1(?:5\\d|8[35-7])\\d{6}", , , , "153123456" ], [ , , "(?:1[0-2]|9[0-3569])\\d{7}", , , , "911231234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SD", 249, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[19]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SE: [ , [ , , "(?:[26]\\d\\d|9)\\d{9}|[1-9]\\d{8}|[1-689]\\d{7}|[1-4689]\\d{6}|2\\d{5}", , , , , , , [ 6, 7, 8, 9, 10, 12 ] ], [ , , "(?:(?:[12][136]|3[356]|4[0246]|6[03]|8\\d)\\d|90[1-9])\\d{4,6}|(?:1(?:2[0-35]|4[0-4]|5[0-25-9]|7[13-6]|[89]\\d)|2(?:2[0-7]|4[0136-8]|5[0138]|7[018]|8[01]|9[0-57])|3(?:0[0-4]|1\\d|2[0-25]|4[056]|7[0-2]|8[0-3]|9[023])|4(?:1[013-8]|3[0135]|5[14-79]|7[0-246-9]|8[0156]|9[0-689])|5(?:0[0-6]|[15][0-5]|2[0-68]|3[0-4]|4\\d|6[03-5]|7[013]|8[0-79]|9[01])|6(?:1[1-3]|2[0-4]|4[02-57]|5[0-37]|6[0-3]|7[0-2]|8[0247]|9[0-356])|9(?:1[0-68]|2\\d|3[02-5]|4[0-3]|5[0-4]|[68][01]|7[0135-8]))\\d{5,6}", , , , "8123456", , , [ 7, 8, 9 ] ], [ , , "7[02369]\\d{7}", , , , "701234567", , , [ 9 ] ], [ , , "20\\d{4,7}", , , , "20123456", , , [ 6, 7, 8, 9 ] ], [ , , "649\\d{6}|9(?:00|39|44)[1-8]\\d{3,6}", , , , "9001234567", , , [ 7, 8, 9, 10 ] ], [ , , "77[0-7]\\d{6}", , , , "771234567", , , [ 9 ] ], [ , , "75[1-8]\\d{6}", , , , "751234567", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], "SE", 46, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{2,3})(\\d{2})", "$1-$2 $3", [ "20" ], "0$1" ], [ , "(\\d{3})(\\d{4})", "$1-$2", [ "9(?:00|39|44)" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})", "$1-$2 $3", [ "[12][136]|3[356]|4[0246]|6[03]|90[1-9]" ], "0$1" ], [ , "(\\d)(\\d{2,3})(\\d{2})(\\d{2})", "$1-$2 $3 $4", [ "8" ], "0$1" ], [ , "(\\d{3})(\\d{2,3})(\\d{2})", "$1-$2 $3", [ "1[2457]|2(?:[247-9]|5[0138])|3[0247-9]|4[1357-9]|5[0-35-9]|6(?:[125689]|4[02-57]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])" ], "0$1" ], [ , "(\\d{3})(\\d{2,3})(\\d{3})", "$1-$2 $3", [ "9(?:00|39|44)" ], "0$1" ], [ , "(\\d{2})(\\d{2,3})(\\d{2})(\\d{2})", "$1-$2 $3 $4", [ "1[13689]|2[0136]|3[1356]|4[0246]|54|6[03]|90[1-9]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1-$2 $3 $4", [ "10|7" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{2})", "$1-$2 $3 $4", [ "8" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1-$2 $3 $4", [ "[13-5]|2(?:[247-9]|5[0138])|6(?:[124-689]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{3})", "$1-$2 $3 $4", [ "9" ], "0$1" ], [ , "(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1-$2 $3 $4 $5", [ "[26]" ], "0$1" ] ], [ [ , "(\\d{2})(\\d{2,3})(\\d{2})", "$1 $2 $3", [ "20" ] ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "9(?:00|39|44)" ] ], [ , "(\\d{2})(\\d{3})(\\d{2})", "$1 $2 $3", [ "[12][136]|3[356]|4[0246]|6[03]|90[1-9]" ] ], [ , "(\\d)(\\d{2,3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ] ], [ , "(\\d{3})(\\d{2,3})(\\d{2})", "$1 $2 $3", [ "1[2457]|2(?:[247-9]|5[0138])|3[0247-9]|4[1357-9]|5[0-35-9]|6(?:[125689]|4[02-57]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])" ] ], [ , "(\\d{3})(\\d{2,3})(\\d{3})", "$1 $2 $3", [ "9(?:00|39|44)" ] ], [ , "(\\d{2})(\\d{2,3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "1[13689]|2[0136]|3[1356]|4[0246]|54|6[03]|90[1-9]" ] ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "10|7" ] ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3 $4", [ "8" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[13-5]|2(?:[247-9]|5[0138])|6(?:[124-689]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", [ "9" ] ], [ , "(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", [ "[26]" ] ] ], [ , , "74[02-9]\\d{6}", , , , "740123456", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "10[1-8]\\d{6}", , , , "102345678", , , [ 9 ] ], , , [ , , "(?:25[245]|67[3-68])\\d{9}", , , , "254123456789", , , [ 12 ] ] ],
            SG: [ , [ , , "(?:(?:1\\d|8)\\d\\d|7000)\\d{7}|[3689]\\d{7}", , , , , , , [ 8, 10, 11 ] ], [ , , "662[0-24-9]\\d{4}|6(?:[1-578]\\d|6[013-57-9]|9[0-35-9])\\d{5}", , , , "61234567", , , [ 8 ] ], [ , , "895[0-2]\\d{4}|(?:8(?:0[1-4]|[1-8]\\d|9[0-4])|9[0-8]\\d)\\d{5}", , , , "81234567", , , [ 8 ] ], [ , , "(?:18|8)00\\d{7}", , , , "18001234567", , , [ 10, 11 ] ], [ , , "1900\\d{7}", , , , "19001234567", , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:3[12]\\d|666)\\d{5}", , , , "31234567", , , [ 8 ] ], "SG", 65, "0[0-3]\\d", , , , , , , , [ [ , "(\\d{4,5})", "$1", [ "1[013-9]|77", "1(?:[013-8]|9(?:0[1-9]|[1-9]))|77" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[369]|8(?:0[1-4]|[1-9])" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ] ], [ , "(\\d{4})(\\d{4})(\\d{3})", "$1 $2 $3", [ "7" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ] ] ], [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[369]|8(?:0[1-4]|[1-9])" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ] ], [ , "(\\d{4})(\\d{4})(\\d{3})", "$1 $2 $3", [ "7" ] ], [ , "(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", [ "1" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "7000\\d{7}", , , , "70001234567", , , [ 11 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SH: [ , [ , , "(?:[256]\\d|8)\\d{3}", , , , , , , [ 4, 5 ] ], [ , , "2(?:[0-57-9]\\d|6[4-9])\\d\\d", , , , "22158" ], [ , , "[56]\\d{4}", , , , "51234", , , [ 5 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "262\\d\\d", , , , "26212", , , [ 5 ] ], "SH", 290, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], 1, "[256]", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SI: [ , [ , , "[1-7]\\d{7}|8\\d{4,7}|90\\d{4,6}", , , , , , , [ 5, 6, 7, 8 ] ], [ , , "(?:[1-357][2-8]|4[24-8])\\d{6}", , , , "12345678", , , [ 8 ], [ 7 ] ], [ , , "65(?:1\\d|55|[67]0)\\d{4}|(?:[37][01]|4[0139]|51|6[489])\\d{6}", , , , "31234567", , , [ 8 ] ], [ , , "80\\d{4,6}", , , , "80123456", , , [ 6, 7, 8 ] ], [ , , "89[1-3]\\d{2,5}|90\\d{4,6}", , , , "90123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:59\\d\\d|8(?:1(?:[67]\\d|8[0-489])|2(?:0\\d|2[0-37-9]|8[0-2489])|3[389]\\d))\\d{4}", , , , "59012345", , , [ 8 ] ], "SI", 386, "00|10(?:22|66|88|99)", "0", , , "0", , "00", , [ [ , "(\\d{2})(\\d{3,6})", "$1 $2", [ "8[09]|9" ], "0$1" ], [ , "(\\d{3})(\\d{5})", "$1 $2", [ "59|8" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[37][01]|4[0139]|51|6" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[1-57]" ], "(0$1)" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SJ: [ , [ , , "0\\d{4}|(?:[489]\\d|[57]9)\\d{6}", , , , , , , [ 5, 8 ] ], [ , , "79\\d{6}", , , , "79123456", , , [ 8 ] ], [ , , "(?:4[015-8]|59|9\\d)\\d{6}", , , , "41234567", , , [ 8 ] ], [ , , "80[01]\\d{5}", , , , "80012345", , , [ 8 ] ], [ , , "82[09]\\d{5}", , , , "82012345", , , [ 8 ] ], [ , , "810(?:0[0-6]|[2-8]\\d)\\d{3}", , , , "81021234", , , [ 8 ] ], [ , , "880\\d{5}", , , , "88012345", , , [ 8 ] ], [ , , "85[0-5]\\d{5}", , , , "85012345", , , [ 8 ] ], "SJ", 47, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , "79", [ , , , , , , , , , [ -1 ] ], [ , , "(?:0[2-9]|81(?:0(?:0[7-9]|1\\d)|5\\d\\d))\\d{3}", , , , "02000" ], , , [ , , "81[23]\\d{5}", , , , "81212345", , , [ 8 ] ] ],
            SK: [ , [ , , "[2-689]\\d{8}|[2-59]\\d{6}|[2-5]\\d{5}", , , , , , , [ 6, 7, 9 ] ], [ , , "(?:2(?:16|[2-9]\\d{3})|(?:(?:[3-5][1-8]\\d|819)\\d|601[1-5])\\d)\\d{4}|(?:2|[3-5][1-8])1[67]\\d{3}|[3-5][1-8]16\\d\\d", , , , "221234567" ], [ , , "909[1-9]\\d{5}|9(?:0[1-8]|1[0-24-9]|4[03-57-9]|5\\d)\\d{6}", , , , "912123456", , , [ 9 ] ], [ , , "800\\d{6}", , , , "800123456", , , [ 9 ] ], [ , , "9(?:00|[78]\\d)\\d{6}", , , , "900123456", , , [ 9 ] ], [ , , "8[5-9]\\d{7}", , , , "850123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "6(?:02|5[0-4]|9[0-6])\\d{6}", , , , "690123456", , , [ 9 ] ], "SK", 421, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{2})(\\d{3,4})", "$1 $2 $3", [ "21" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2,3})", "$1 $2 $3", [ "[3-5][1-8]1", "[3-5][1-8]1[67]" ], "0$1" ], [ , "(\\d{4})(\\d{3})", "$1 $2", [ "909", "9090" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{2})", "$1/$2 $3 $4", [ "2" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[689]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1/$2 $3 $4", [ "[3-5]" ], "0$1" ] ], [ [ , "(\\d)(\\d{2})(\\d{3,4})", "$1 $2 $3", [ "21" ], "0$1" ], [ , "(\\d{2})(\\d{2})(\\d{2,3})", "$1 $2 $3", [ "[3-5][1-8]1", "[3-5][1-8]1[67]" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{3})(\\d{2})", "$1/$2 $3 $4", [ "2" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[689]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1/$2 $3 $4", [ "[3-5]" ], "0$1" ] ], [ , , "9090\\d{3}", , , , "9090123", , , [ 7 ] ], , , [ , , "9090\\d{3}|(?:602|8(?:00|[5-9]\\d)|9(?:00|[78]\\d))\\d{6}", , , , , , , [ 7, 9 ] ], [ , , "96\\d{7}", , , , "961234567", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SL: [ , [ , , "(?:[237-9]\\d|66)\\d{6}", , , , , , , [ 8 ], [ 6 ] ], [ , , "22[2-4][2-9]\\d{4}", , , , "22221234", , , , [ 6 ] ], [ , , "(?:25|3[0-5]|66|7[3-9]|8[08]|9[09])\\d{6}", , , , "25123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SL", 232, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{6})", "$1 $2", [ "[236-9]" ], "(0$1)" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SM: [ , [ , , "(?:0549|[5-7]\\d)\\d{6}", , , , , , , [ 8, 10 ], [ 6 ] ], [ , , "0549(?:8[0157-9]|9\\d)\\d{4}", , , , "0549886377", , , [ 10 ], [ 6 ] ], [ , , "6[16]\\d{6}", , , , "66661212", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "7[178]\\d{6}", , , , "71123456", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "5[158]\\d{6}", , , , "58001110", , , [ 8 ] ], "SM", 378, "00", , , , "([89]\\d{5})$", "0549$1", , , [ [ , "(\\d{6})", "$1", [ "[89]" ] ], [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[5-7]" ] ], [ , "(\\d{4})(\\d{6})", "$1 $2", [ "0" ] ] ], [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[5-7]" ] ], [ , "(\\d{4})(\\d{6})", "$1 $2", [ "0" ] ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SN: [ , [ , , "(?:[378]\\d|93)\\d{7}", , , , , , , [ 9 ] ], [ , , "3(?:0(?:1[0-2]|80)|282|3(?:8[1-9]|9[3-9])|611)\\d{5}", , , , "301012345" ], [ , , "75(?:01|[38]3)\\d{5}|7(?:[06-8]\\d|21|5[4-7]|90)\\d{6}", , , , "701234567" ], [ , , "800\\d{6}", , , , "800123456" ], [ , , "88[4689]\\d{6}", , , , "884123456" ], [ , , "81[02468]\\d{6}", , , , "810123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:3(?:392|9[01]\\d)\\d|93(?:3[13]0|929))\\d{4}", , , , "933301234" ], "SN", 221, "00", , , , , , , , [ [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ] ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[379]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SO: [ , [ , , "[346-9]\\d{8}|[12679]\\d{7}|[1-5]\\d{6}|[1348]\\d{5}", , , , , , , [ 6, 7, 8, 9 ] ], [ , , "(?:1\\d|2[0-79]|3[0-46-8]|4[0-7]|5[57-9])\\d{5}|(?:[134]\\d|8[125])\\d{4}", , , , "4012345", , , [ 6, 7 ] ], [ , , "(?:(?:15|(?:3[59]|4[89]|79|8[08])\\d|6(?:0[5-7]|[1-9]\\d)|9(?:0\\d|[2-9]))\\d|2(?:4\\d|8))\\d{5}|(?:6\\d|7[1-9])\\d{6}", , , , "71123456", , , [ 7, 8, 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SO", 252, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{4})", "$1 $2", [ "8[125]" ] ], [ , "(\\d{6})", "$1", [ "[134]" ] ], [ , "(\\d)(\\d{6})", "$1 $2", [ "[15]|2[0-79]|3[0-46-8]|4[0-7]" ] ], [ , "(\\d)(\\d{7})", "$1 $2", [ "24|[67]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[3478]|64|90" ] ], [ , "(\\d{2})(\\d{5,7})", "$1 $2", [ "1|28|6(?:0[5-7]|[1-35-9])|9[2-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SR: [ , [ , , "(?:[2-5]|68|[78]\\d)\\d{5}", , , , , , , [ 6, 7 ] ], [ , , "(?:2[1-3]|3[0-7]|(?:4|68)\\d|5[2-58])\\d{4}", , , , "211234" ], [ , , "(?:7[124-7]|8[124-9])\\d{5}", , , , "7412345", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "56\\d{4}", , , , "561234", , , [ 6 ] ], "SR", 597, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})", "$1-$2-$3", [ "56" ] ], [ , "(\\d{3})(\\d{3})", "$1-$2", [ "[2-5]" ] ], [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[6-8]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SS: [ , [ , , "[19]\\d{8}", , , , , , , [ 9 ] ], [ , , "1[89]\\d{7}", , , , "181234567" ], [ , , "(?:12|9[1257-9])\\d{7}", , , , "977123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SS", 211, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[19]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ST: [ , [ , , "(?:22|9\\d)\\d{5}", , , , , , , [ 7 ] ], [ , , "22\\d{5}", , , , "2221234" ], [ , , "900[5-9]\\d{3}|9(?:0[1-9]|[89]\\d)\\d{4}", , , , "9812345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "ST", 239, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[29]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SV: [ , [ , , "[267]\\d{7}|[89]00\\d{4}(?:\\d{4})?", , , , , , , [ 7, 8, 11 ] ], [ , , "2(?:[1-6]\\d{3}|[79]90[034]|890[0245])\\d{3}", , , , "21234567", , , [ 8 ] ], [ , , "66(?:[02-9]\\d\\d|1(?:[02-9]\\d|16))\\d{3}|(?:6[0-57-9]|7\\d)\\d{6}", , , , "70123456", , , [ 8 ] ], [ , , "800\\d{4}(?:\\d{4})?", , , , "8001234", , , [ 7, 11 ] ], [ , , "900\\d{4}(?:\\d{4})?", , , , "9001234", , , [ 7, 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SV", 503, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[89]" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[267]" ] ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "[89]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SX: [ , [ , , "7215\\d{6}|(?:[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "7215(?:4[2-8]|8[239]|9[056])\\d{4}", , , , "7215425678", , , , [ 7 ] ], [ , , "7215(?:1[02]|2\\d|5[034679]|8[014-8])\\d{4}", , , , "7215205678", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002123456" ], [ , , "900[2-9]\\d{6}", , , , "9002123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "SX", 1, "011", "1", , , "1|(5\\d{6})$", "721$1", , , , , [ , , , , , , , , , [ -1 ] ], , "721", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SY: [ , [ , , "[1-39]\\d{8}|[1-5]\\d{7}", , , , , , , [ 8, 9 ], [ 6, 7 ] ], [ , , "21\\d{6,7}|(?:1(?:[14]\\d|[2356])|2[235]|3(?:[13]\\d|4)|4[134]|5[1-3])\\d{6}", , , , "112345678", , , , [ 6, 7 ] ], [ , , "9(?:22|[3-689]\\d)\\d{6}", , , , "944567890", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "SY", 963, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[1-5]" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "9" ], "0$1", , 1 ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            SZ: [ , [ , , "0800\\d{4}|(?:[237]\\d|900)\\d{6}", , , , , , , [ 8, 9 ] ], [ , , "[23][2-5]\\d{6}", , , , "22171234", , , [ 8 ] ], [ , , "7[6-9]\\d{6}", , , , "76123456", , , [ 8 ] ], [ , , "0800\\d{4}", , , , "08001234", , , [ 8 ] ], [ , , "900\\d{6}", , , , "900012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70\\d{6}", , , , "70012345", , , [ 8 ] ], "SZ", 268, "00", , , , , , , , [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[0237]" ] ], [ , "(\\d{5})(\\d{4})", "$1 $2", [ "9" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "0800\\d{4}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TA: [ , [ , , "8\\d{3}", , , , , , , [ 4 ] ], [ , , "8\\d{3}", , , , "8999" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TA", 290, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , "8", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TC: [ , [ , , "(?:[58]\\d\\d|649|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "649(?:266|712|9(?:4\\d|50))\\d{4}", , , , "6497121234", , , , [ 7 ] ], [ , , "649(?:2(?:3[129]|4[1-79])|3\\d\\d|4[34][1-3])\\d{4}", , , , "6492311234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , "649(?:71[01]|966)\\d{4}", , , , "6497101234", , , , [ 7 ] ], "TC", 1, "011", "1", , , "1|([2-479]\\d{6})$", "649$1", , , , , [ , , , , , , , , , [ -1 ] ], , "649", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TD: [ , [ , , "(?:22|[69]\\d|77)\\d{6}", , , , , , , [ 8 ] ], [ , , "22(?:[37-9]0|5[0-5]|6[89])\\d{4}", , , , "22501234" ], [ , , "(?:6[023568]|77|9\\d)\\d{6}", , , , "63012345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TD", 235, "00|16", , , , , , "00", , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[2679]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TG: [ , [ , , "[279]\\d{7}", , , , , , , [ 8 ] ], [ , , "2(?:2[2-7]|3[23]|4[45]|55|6[67]|77)\\d{5}", , , , "22212345" ], [ , , "(?:7[09]|9[0-36-9])\\d{6}", , , , "90112345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TG", 228, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[279]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TH: [ , [ , , "(?:001800|[2-57]|[689]\\d)\\d{7}|1\\d{7,9}", , , , , , , [ 8, 9, 10, 13 ] ], [ , , "(?:1[0689]|2\\d|3[2-9]|4[2-5]|5[2-6]|7[3-7])\\d{6}", , , , "21234567", , , [ 8 ] ], [ , , "671[0-8]\\d{5}|(?:14|6[1-6]|[89]\\d)\\d{7}", , , , "812345678", , , [ 9 ] ], [ , , "(?:001800\\d|1800)\\d{6}", , , , "1800123456", , , [ 10, 13 ] ], [ , , "1900\\d{6}", , , , "1900123456", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "6[08]\\d{7}", , , , "601234567", , , [ 9 ] ], "TH", 66, "00[1-9]", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", [ "2" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[13-9]" ], "0$1" ], [ , "(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", [ "1" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TJ: [ , [ , , "(?:00|[1-57-9]\\d)\\d{7}", , , , , , , [ 9 ], [ 3, 5, 6, 7 ] ], [ , , "(?:3(?:1[3-5]|2[245]|3[12]|4[24-7]|5[25]|72)|4(?:46|74|87))\\d{6}", , , , "372123456", , , , [ 3, 5, 6, 7 ] ], [ , , "41[18]\\d{6}|(?:[034]0|1[01]|2[02]|5[05]|7[017]|8[08]|9\\d)\\d{7}", , , , "917123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TJ", 992, "810", , , , , , "8~10", , [ [ , "(\\d{6})(\\d)(\\d{2})", "$1 $2 $3", [ "331", "3317" ] ], [ , "(\\d{3})(\\d{2})(\\d{4})", "$1 $2 $3", [ "[34]7|91[78]" ] ], [ , "(\\d{4})(\\d)(\\d{4})", "$1 $2 $3", [ "3[1-5]" ] ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[0-57-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TK: [ , [ , , "[2-47]\\d{3,6}", , , , , , , [ 4, 5, 6, 7 ] ], [ , , "(?:2[2-4]|[34]\\d)\\d{2,5}", , , , "3101" ], [ , , "7[2-4]\\d{2,5}", , , , "7290" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TK", 690, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TL: [ , [ , , "7\\d{7}|(?:[2-47]\\d|[89]0)\\d{5}", , , , , , , [ 7, 8 ] ], [ , , "(?:2[1-5]|3[1-9]|4[1-4])\\d{5}", , , , "2112345", , , [ 7 ] ], [ , , "7[2-8]\\d{6}", , , , "77212345", , , [ 8 ] ], [ , , "80\\d{5}", , , , "8012345", , , [ 7 ] ], [ , , "90\\d{5}", , , , "9012345", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "70\\d{5}", , , , "7012345", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], "TL", 670, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[2-489]|70" ] ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "7" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TM: [ , [ , , "[1-6]\\d{7}", , , , , , , [ 8 ] ], [ , , "(?:1(?:2\\d|3[1-9])|2(?:22|4[0-35-8])|3(?:22|4[03-9])|4(?:22|3[128]|4\\d|6[15])|5(?:22|5[7-9]|6[014-689]))\\d{5}", , , , "12345678" ], [ , , "6\\d{7}", , , , "66123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TM", 993, "810", "8", , , "8", , "8~10", , [ [ , "(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2-$3-$4", [ "12" ], "(8 $1)" ], [ , "(\\d{3})(\\d)(\\d{2})(\\d{2})", "$1 $2-$3-$4", [ "[1-5]" ], "(8 $1)" ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "6" ], "8 $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TN: [ , [ , , "[2-57-9]\\d{7}", , , , , , , [ 8 ] ], [ , , "81200\\d{3}|(?:3[0-2]|7\\d)\\d{6}", , , , "30010123" ], [ , , "3(?:001|[12]40)\\d{4}|(?:(?:[259]\\d|4[0-7])\\d|3(?:1[1-35]|6[0-4]|91))\\d{5}", , , , "20123456" ], [ , , "8010\\d{4}", , , , "80101234" ], [ , , "88\\d{6}", , , , "88123456" ], [ , , "8[12]10\\d{4}", , , , "81101234" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TN", 216, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2-57-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TO: [ , [ , , "(?:0800|(?:[5-8]\\d\\d|999)\\d)\\d{3}|[2-8]\\d{4}", , , , , , , [ 5, 7 ] ], [ , , "(?:2\\d|3[0-8]|4[0-4]|50|6[09]|7[0-24-69]|8[05])\\d{3}", , , , "20123", , , [ 5 ] ], [ , , "(?:55[4-6]|6(?:[09]\\d|3[02]|8[15-9])|(?:7\\d|8[46-9])\\d|999)\\d{4}", , , , "7715123", , , [ 7 ] ], [ , , "0800\\d{3}", , , , "0800222", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "55[0-37-9]\\d{4}", , , , "5510123", , , [ 7 ] ], "TO", 676, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})", "$1-$2", [ "[2-4]|50|6[09]|7[0-24-69]|8[05]" ] ], [ , "(\\d{4})(\\d{3})", "$1 $2", [ "0" ] ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[5-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TR: [ , [ , , "4\\d{6}|8\\d{11,12}|(?:[2-58]\\d\\d|900)\\d{7}", , , , , , , [ 7, 10, 12, 13 ] ], [ , , "(?:2(?:[13][26]|[28][2468]|[45][268]|[67][246])|3(?:[13][28]|[24-6][2468]|[78][02468]|92)|4(?:[16][246]|[23578][2468]|4[26]))\\d{7}", , , , "2123456789", , , [ 10 ] ], [ , , "56161\\d{5}|5(?:0[15-7]|1[06]|24|[34]\\d|5[1-59]|9[46])\\d{7}", , , , "5012345678", , , [ 10 ] ], [ , , "8(?:00\\d{7}(?:\\d{2,3})?|11\\d{7})", , , , "8001234567", , , [ 10, 12, 13 ] ], [ , , "(?:8[89]8|900)\\d{7}", , , , "9001234567", , , [ 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "592(?:21[12]|461)\\d{4}", , , , "5922121234", , , [ 10 ] ], [ , , "850\\d{7}", , , , "8500123456", , , [ 10 ] ], "TR", 90, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d)(\\d{3})", "$1 $2 $3", [ "444" ], , , 1 ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "512|8[01589]|90" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "5(?:[0-59]|61)", "5(?:[0-59]|616)", "5(?:[0-59]|6161)" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[24][1-8]|3[1-9]" ], "(0$1)", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{6,7})", "$1 $2 $3", [ "80" ], "0$1", , 1 ] ], [ [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "512|8[01589]|90" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "5(?:[0-59]|61)", "5(?:[0-59]|616)", "5(?:[0-59]|6161)" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[24][1-8]|3[1-9]" ], "(0$1)", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{6,7})", "$1 $2 $3", [ "80" ], "0$1", , 1 ] ], [ , , "512\\d{7}", , , , "5123456789", , , [ 10 ] ], , , [ , , "(?:444|811\\d{3})\\d{4}", , , , , , , [ 7, 10 ] ], [ , , "444\\d{4}", , , , "4441444", , , [ 7 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TT: [ , [ , , "(?:[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "868(?:2(?:0[13]|1[89]|[23]\\d|4[0-2])|6(?:0[7-9]|1[02-8]|2[1-9]|[3-69]\\d|7[0-79])|82[124])\\d{4}", , , , "8682211234", , , , [ 7 ] ], [ , , "868(?:(?:2[5-9]|3\\d)\\d|4(?:3[0-6]|[6-9]\\d)|6(?:20|78|8\\d)|7(?:0[1-9]|1[02-9]|[2-9]\\d))\\d{4}", , , , "8682911234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "TT", 1, "011", "1", , , "1|([2-46-8]\\d{6})$", "868$1", , , , , [ , , , , , , , , , [ -1 ] ], , "868", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "868619\\d{4}", , , , "8686191234", , , , [ 7 ] ] ],
            TV: [ , [ , , "(?:2|7\\d\\d|90)\\d{4}", , , , , , , [ 5, 6, 7 ] ], [ , , "2[02-9]\\d{3}", , , , "20123", , , [ 5 ] ], [ , , "(?:7[01]\\d|90)\\d{4}", , , , "901234", , , [ 6, 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "TV", 688, "00", , , , , , , , [ [ , "(\\d{2})(\\d{3})", "$1 $2", [ "2" ] ], [ , "(\\d{2})(\\d{4})", "$1 $2", [ "90" ] ], [ , "(\\d{2})(\\d{5})", "$1 $2", [ "7" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TW: [ , [ , , "[2-689]\\d{8}|7\\d{9,10}|[2-8]\\d{7}|2\\d{6}", , , , , , , [ 7, 8, 9, 10, 11 ] ], [ , , "(?:2[2-8]\\d|370|55[01]|7[1-9])\\d{6}|4(?:(?:0(?:0[1-9]|[2-48]\\d)|1[023]\\d)\\d{4,5}|(?:[239]\\d\\d|4(?:0[56]|12|49))\\d{5})|6(?:[01]\\d{7}|4(?:0[56]|12|24|4[09])\\d{4,5})|8(?:(?:2(?:3\\d|4[0-269]|[578]0|66)|36[24-9]|90\\d\\d)\\d{4}|4(?:0[56]|12|24|4[09])\\d{4,5})|(?:2(?:2(?:0\\d\\d|4(?:0[68]|[249]0|3[0-467]|5[0-25-9]|6[0235689]))|(?:3(?:[09]\\d|1[0-4])|(?:4\\d|5[0-49]|6[0-29]|7[0-5])\\d)\\d)|(?:(?:3[2-9]|5[2-8]|6[0-35-79]|8[7-9])\\d\\d|4(?:2(?:[089]\\d|7[1-9])|(?:3[0-4]|[78]\\d|9[01])\\d))\\d)\\d{3}", , , , "221234567", , , [ 8, 9 ] ], [ , , "(?:40001[0-2]|9[0-8]\\d{4})\\d{3}", , , , "912345678", , , [ 9 ] ], [ , , "80[0-79]\\d{6}|800\\d{5}", , , , "800123456", , , [ 8, 9 ] ], [ , , "20(?:[013-9]\\d\\d|2)\\d{4}", , , , "203123456", , , [ 7, 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "99\\d{7}", , , , "990123456", , , [ 9 ] ], [ , , "7010(?:[0-2679]\\d|3[0-7]|8[0-5])\\d{5}|70\\d{8}", , , , "7012345678", , , [ 10, 11 ] ], "TW", 886, "0(?:0[25-79]|19)", "0", "#", , "0", , , , [ [ , "(\\d{2})(\\d)(\\d{4})", "$1 $2 $3", [ "202" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[258]0" ], "0$1" ], [ , "(\\d)(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "[23568]|4(?:0[02-48]|[1-47-9])|7[1-9]", "[23568]|4(?:0[2-48]|[1-47-9])|(?:400|7)[1-9]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[49]" ], "0$1" ], [ , "(\\d{2})(\\d{4})(\\d{4,5})", "$1 $2 $3", [ "7" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "50[0-46-9]\\d{6}", , , , "500123456", , , [ 9 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            TZ: [ , [ , , "(?:[26-8]\\d|41|90)\\d{7}", , , , , , , [ 9 ] ], [ , , "2[2-8]\\d{7}", , , , "222345678" ], [ , , "77[2-9]\\d{6}|(?:6[1-9]|7[1-689])\\d{7}", , , , "621234567" ], [ , , "80[08]\\d{6}", , , , "800123456" ], [ , , "90\\d{7}", , , , "900123456" ], [ , , "8(?:40|6[01])\\d{6}", , , , "840123456" ], [ , , , , , , , , , [ -1 ] ], [ , , "41\\d{7}", , , , "412345678" ], "TZ", 255, "00[056]", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{2})(\\d{4})", "$1 $2 $3", [ "[89]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[24]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[67]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , "(?:8(?:[04]0|6[01])|90\\d)\\d{6}" ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            UA: [ , [ , , "[89]\\d{9}|[3-9]\\d{8}", , , , , , , [ 9, 10 ], [ 5, 6, 7 ] ], [ , , "(?:3[1-8]|4[13-8]|5[1-7]|6[12459])\\d{7}", , , , "311234567", , , [ 9 ], [ 5, 6, 7 ] ], [ , , "(?:50|6[36-8]|7[1-3]|9[1-9])\\d{7}", , , , "501234567", , , [ 9 ] ], [ , , "800[1-8]\\d{5,6}", , , , "800123456" ], [ , , "900[239]\\d{5,6}", , , , "900212345" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "89[1-579]\\d{6}", , , , "891234567", , , [ 9 ] ], "UA", 380, "00", "0", , , "0", , "0~0", , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "6[12][29]|(?:3[1-8]|4[136-8]|5[12457]|6[49])2|(?:56|65)[24]", "6[12][29]|(?:35|4[1378]|5[12457]|6[49])2|(?:56|65)[24]|(?:3[1-46-8]|46)2[013-9]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "4[45][0-5]|5(?:0|6[37])|6(?:[12][018]|[36-8])|7|89|9[1-9]|(?:48|57)[0137-9]", "4[45][0-5]|5(?:0|6(?:3[14-7]|7))|6(?:[12][018]|[36-8])|7|89|9[1-9]|(?:48|57)[0137-9]" ], "0$1" ], [ , "(\\d{4})(\\d{5})", "$1 $2", [ "[3-6]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[89]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            UG: [ , [ , , "800\\d{6}|(?:[29]0|[347]\\d)\\d{7}", , , , , , , [ 9 ], [ 5, 6, 7 ] ], [ , , "20(?:(?:(?:24|81)0|30[67])\\d|6(?:00[0-2]|30[0-4]))\\d{3}|(?:20(?:[0147]\\d|2[5-9]|32|5[0-4]|6[15-9])|[34]\\d{3})\\d{5}", , , , "312345678", , , , [ 5, 6, 7 ] ], [ , , "726[01]\\d{5}|7(?:[0157-9]\\d|20|36|[46][0-4])\\d{6}", , , , "712345678" ], [ , , "800[1-3]\\d{5}", , , , "800123456" ], [ , , "90[1-3]\\d{6}", , , , "901123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "UG", 256, "00[057]", "0", , , "0", , , , [ [ , "(\\d{4})(\\d{5})", "$1 $2", [ "202", "2024" ], "0$1" ], [ , "(\\d{3})(\\d{6})", "$1 $2", [ "[27-9]|4(?:6[45]|[7-9])" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "[34]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            US: [ , [ , , "[2-9]\\d{9}", , , , , , , [ 10 ], [ 7 ] ], [ , , "5(?:05(?:[2-57-9]\\d\\d|6(?:[0-35-9]\\d|44))|82(?:2(?:0[0-3]|[268]2)|3(?:0[02]|33)|4(?:00|4[24]|65|82)|5(?:00|29|83)|6(?:00|66|82)|777|8(?:00|88)|9(?:00|9[89])))\\d{4}|(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[01356]|3[0-24679]|4[167]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[023578]|58|6[39]|7[0589]|8[04])|5(?:0[1-47-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[0-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[0179]|6[0-279]|78|8[0-29])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[0-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-289]|4[03578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[01579]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}", , , , "2015550123", , , , [ 7 ] ], [ , , "5(?:05(?:[2-57-9]\\d\\d|6(?:[0-35-9]\\d|44))|82(?:2(?:0[0-3]|[268]2)|3(?:0[02]|33)|4(?:00|4[24]|65|82)|5(?:00|29|83)|6(?:00|66|82)|777|8(?:00|88)|9(?:00|9[89])))\\d{4}|(?:2(?:0[1-35-9]|1[02-9]|2[03-589]|3[149]|4[08]|5[1-46]|6[0279]|7[0269]|8[13])|3(?:0[1-57-9]|1[02-9]|2[01356]|3[0-24679]|4[167]|5[12]|6[014]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[023578]|58|6[39]|7[0589]|8[04])|5(?:0[1-47-9]|1[0235-8]|20|3[0149]|4[01]|5[19]|6[1-47]|7[0-5]|8[056])|6(?:0[1-35-9]|1[024-9]|2[03689]|[34][016]|5[0179]|6[0-279]|78|8[0-29])|7(?:0[1-46-8]|1[2-9]|2[04-7]|3[1247]|4[037]|5[47]|6[02359]|7[0-59]|8[156])|8(?:0[1-68]|1[02-8]|2[08]|3[0-289]|4[03578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[01579]|5[12469]|7[0-389]|8[04-69]))[2-9]\\d{6}", , , , "2015550123", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "US", 1, "011", "1", , , "1", , , 1, [ [ , "(\\d{3})(\\d{4})", "$1-$2", [ "[2-9]" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "($1) $2-$3", [ "[2-9]" ], , , 1 ] ], [ [ , "(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", [ "[2-9]" ] ] ], [ , , , , , , , , , [ -1 ] ], 1, , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            UY: [ , [ , , "4\\d{9}|[1249]\\d{7}|(?:[49]\\d|80)\\d{5}", , , , , , , [ 7, 8, 10 ] ], [ , , "(?:1(?:770|987)|(?:2\\d|4[2-7])\\d\\d)\\d{4}", , , , "21231234", , , [ 8 ], [ 7 ] ], [ , , "9[1-9]\\d{6}", , , , "94231234", , , [ 8 ] ], [ , , "(?:4\\d{5}|80[05])\\d{4}|405\\d{4}", , , , "8001234", , , [ 7, 10 ] ], [ , , "90[0-8]\\d{4}", , , , "9001234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "UY", 598, "0(?:0|1[3-9]\\d)", "0", " int. ", , "0", , "00", , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "405|8|90" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "9" ], "0$1" ], [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[124]" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "4" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            UZ: [ , [ , , "(?:33|55|[679]\\d|88)\\d{7}", , , , , , , [ 9 ] ], [ , , "(?:6(?:1(?:22|3[124]|4[1-4]|5[1-3578]|64)|2(?:22|3[0-57-9]|41)|5(?:22|3[3-7]|5[024-8])|6\\d\\d|7(?:[23]\\d|7[69])|9(?:22|4[1-8]|6[135]))|7(?:0(?:5[4-9]|6[0146]|7[124-6]|9[135-8])|(?:1[12]|8\\d)\\d|2(?:22|3[13-57-9]|4[1-3579]|5[14])|3(?:2\\d|3[1578]|4[1-35-7]|5[1-57]|61)|4(?:2\\d|3[1-579]|7[1-79])|5(?:22|5[1-9]|6[1457])|6(?:22|3[12457]|4[13-8])|9(?:22|5[1-9])))\\d{5}", , , , "669050123" ], [ , , "(?:(?:33|88|9[0-57-9])\\d{3}|55(?:50[013]|90\\d)|6(?:1(?:2(?:2[01]|98)|35[0-4]|50\\d|61[23]|7(?:[01][017]|4\\d|55|9[5-9]))|2(?:(?:11|7\\d)\\d|2(?:[12]1|9[01379])|5(?:[126]\\d|3[0-4]))|5(?:19[01]|2(?:27|9[26])|(?:30|59|7\\d)\\d)|6(?:2(?:1[5-9]|2[0367]|38|41|52|60)|(?:3[79]|9[0-3])\\d|4(?:56|83)|7(?:[07]\\d|1[017]|3[07]|4[047]|5[057]|67|8[0178]|9[79]))|7(?:2(?:24|3[237]|4[5-9]|7[15-8])|5(?:7[12]|8[0589])|7(?:0\\d|[39][07])|9(?:0\\d|7[079]))|9(?:2(?:1[1267]|3[01]|5\\d|7[0-4])|(?:5[67]|7\\d)\\d|6(?:2[0-26]|8\\d)))|7(?:[07]\\d{3}|1(?:13[01]|6(?:0[47]|1[67]|66)|71[3-69]|98\\d)|2(?:2(?:2[79]|95)|3(?:2[5-9]|6[0-6])|57\\d|7(?:0\\d|1[17]|2[27]|3[37]|44|5[057]|66|88))|3(?:2(?:1[0-6]|21|3[469]|7[159])|(?:33|9[4-6])\\d|5(?:0[0-4]|5[579]|9\\d)|7(?:[0-3579]\\d|4[0467]|6[67]|8[078]))|4(?:2(?:29|5[0257]|6[0-7]|7[1-57])|5(?:1[0-4]|8\\d|9[5-9])|7(?:0\\d|1[024589]|2[0-27]|3[0137]|[46][07]|5[01]|7[5-9]|9[079])|9(?:7[015-9]|[89]\\d))|5(?:112|2(?:0\\d|2[29]|[49]4)|3[1568]\\d|52[6-9]|7(?:0[01578]|1[017]|[23]7|4[047]|[5-7]\\d|8[78]|9[079]))|6(?:2(?:2[1245]|4[2-4])|39\\d|41[179]|5(?:[349]\\d|5[0-2])|7(?:0[017]|[13]\\d|22|44|55|67|88))|9(?:22[128]|3(?:2[0-4]|7\\d)|57[02569]|7(?:2[05-9]|3[37]|4\\d|60|7[2579]|87|9[07]))))\\d{4}", , , , "912345678" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "UZ", 998, "810", "8", , , "8", , "8~10", , [ [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[35-9]" ], "8 $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            VA: [ , [ , , "0\\d{5,10}|3[0-8]\\d{7,10}|55\\d{8}|8\\d{5}(?:\\d{2,4})?|(?:1\\d|39)\\d{7,8}", , , , , , , [ 6, 7, 8, 9, 10, 11, 12 ] ], [ , , "06698\\d{1,6}", , , , "0669812345", , , [ 6, 7, 8, 9, 10, 11 ] ], [ , , "3[1-9]\\d{8}|3[2-9]\\d{7}", , , , "3123456789", , , [ 9, 10 ] ], [ , , "80(?:0\\d{3}|3)\\d{3}", , , , "800123456", , , [ 6, 9 ] ], [ , , "(?:0878\\d{3}|89(?:2\\d|3[04]|4(?:[0-4]|[5-9]\\d\\d)|5[0-4]))\\d\\d|(?:1(?:44|6[346])|89(?:38|5[5-9]|9))\\d{6}", , , , "899123456", , , [ 6, 8, 9, 10 ] ], [ , , "84(?:[08]\\d{3}|[17])\\d{3}", , , , "848123456", , , [ 6, 9 ] ], [ , , "1(?:78\\d|99)\\d{6}", , , , "1781234567", , , [ 9, 10 ] ], [ , , "55\\d{8}", , , , "5512345678", , , [ 10 ] ], "VA", 39, "00", , , , , , , , , , [ , , , , , , , , , [ -1 ] ], , "06698", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "3[2-8]\\d{9,10}", , , , "33101234501", , , [ 11, 12 ] ] ],
            VC: [ , [ , , "(?:[58]\\d\\d|784|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "784(?:266|3(?:6[6-9]|7\\d|8[0-6])|4(?:38|5[0-36-8]|8[0-8])|5(?:55|7[0-2]|93)|638|784)\\d{4}", , , , "7842661234", , , , [ 7 ] ], [ , , "784(?:4(?:3[0-5]|5[45]|89|9[0-8])|5(?:2[6-9]|3[0-4])|720)\\d{4}", , , , "7844301234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "VC", 1, "011", "1", , , "1|([2-7]\\d{6})$", "784$1", , , , , [ , , , , , , , , , [ -1 ] ], , "784", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            VE: [ , [ , , "[68]00\\d{7}|(?:[24]\\d|[59]0)\\d{8}", , , , , , , [ 10 ], [ 7 ] ], [ , , "(?:2(?:12|3[457-9]|[467]\\d|[58][1-9]|9[1-6])|[4-6]00)\\d{7}", , , , "2121234567", , , , [ 7 ] ], [ , , "4(?:1[24-8]|2[46])\\d{7}", , , , "4121234567" ], [ , , "800\\d{7}", , , , "8001234567" ], [ , , "90[01]\\d{7}", , , , "9001234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "VE", 58, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{7})", "$1-$2", [ "[24-689]" ], "0$1", "$CC $1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "501\\d{7}", , , , "5010123456", , , , [ 7 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            VG: [ , [ , , "(?:284|[58]\\d\\d|900)\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "284496[0-5]\\d{3}|284(?:229|4(?:22|9[45])|774|8(?:52|6[459]))\\d{4}", , , , "2842291234", , , , [ 7 ] ], [ , , "284496[6-9]\\d{3}|284(?:245|3(?:0[0-3]|4[0-7]|68|9[34])|4(?:4[0-6]|68|99)|5(?:4[0-7]|68|9[69]))\\d{4}", , , , "2843001234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "VG", 1, "011", "1", , , "1|([2-578]\\d{6})$", "284$1", , , , , [ , , , , , , , , , [ -1 ] ], , "284", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            VI: [ , [ , , "[58]\\d{9}|(?:34|90)0\\d{7}", , , , , , , [ 10 ], [ 7 ] ], [ , , "340(?:2(?:0[0-38]|2[06-8]|4[49]|77)|3(?:32|44)|4(?:2[23]|44|7[34]|89)|5(?:1[34]|55)|6(?:2[56]|4[23]|77|9[023])|7(?:1[2-57-9]|2[57]|7\\d)|884|998)\\d{4}", , , , "3406421234", , , , [ 7 ] ], [ , , "340(?:2(?:0[0-38]|2[06-8]|4[49]|77)|3(?:32|44)|4(?:2[23]|44|7[34]|89)|5(?:1[34]|55)|6(?:2[56]|4[23]|77|9[023])|7(?:1[2-57-9]|2[57]|7\\d)|884|998)\\d{4}", , , , "3406421234", , , , [ 7 ] ], [ , , "8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", , , , "8002345678" ], [ , , "900[2-9]\\d{6}", , , , "9002345678" ], [ , , , , , , , , , [ -1 ] ], [ , , "52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[12]|33|44|66|77|88)[2-9]\\d{6}", , , , "5002345678" ], [ , , , , , , , , , [ -1 ] ], "VI", 1, "011", "1", , , "1|([2-9]\\d{6})$", "340$1", , 1, , , [ , , , , , , , , , [ -1 ] ], , "340", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            VN: [ , [ , , "[12]\\d{9}|[135-9]\\d{8}|[16]\\d{7}|[16-8]\\d{6}", , , , , , , [ 7, 8, 9, 10 ] ], [ , , "2(?:0[3-9]|1[0-689]|2[0-25-9]|3[2-9]|4[2-8]|5[124-9]|6[0-39]|7[0-7]|8[2-79]|9[0-4679])\\d{7}", , , , "2101234567", , , [ 10 ] ], [ , , "(?:5(?:2[238]|59)|89[689]|99[013-9])\\d{6}|(?:3\\d|5[689]|7[06-9]|8[1-8]|9[0-8])\\d{7}", , , , "912345678", , , [ 9 ] ], [ , , "1800\\d{4,6}|12(?:0[13]|28)\\d{4}", , , , "1800123456", , , [ 8, 9, 10 ] ], [ , , "1900\\d{4,6}", , , , "1900123456", , , [ 8, 9, 10 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "672\\d{6}", , , , "672012345", , , [ 9 ] ], "VN", 84, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[17]99" ], "0$1", , 1 ], [ , "(\\d{2})(\\d{5})", "$1 $2", [ "80" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{4,5})", "$1 $2", [ "69" ], "0$1", , 1 ], [ , "(\\d{4})(\\d{4,6})", "$1 $2", [ "1" ], , , 1 ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[69]" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[3578]" ], "0$1", , 1 ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "2[48]" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{4})(\\d{3})", "$1 $2 $3", [ "2" ], "0$1", , 1 ] ], [ [ , "(\\d{2})(\\d{5})", "$1 $2", [ "80" ], "0$1", , 1 ], [ , "(\\d{4})(\\d{4,6})", "$1 $2", [ "1" ], , , 1 ], [ , "(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "[69]" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[3578]" ], "0$1", , 1 ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "2[48]" ], "0$1", , 1 ], [ , "(\\d{3})(\\d{4})(\\d{3})", "$1 $2 $3", [ "2" ], "0$1", , 1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "[17]99\\d{4}|69\\d{5,6}", , , , , , , [ 7, 8 ] ], [ , , "(?:[17]99|80\\d)\\d{4}|69\\d{5,6}", , , , "1992000", , , [ 7, 8 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            VU: [ , [ , , "[57-9]\\d{6}|(?:[238]\\d|48)\\d{3}", , , , , , , [ 5, 7 ] ], [ , , "(?:38[0-8]|48[4-9])\\d\\d|(?:2[02-9]|3[4-7]|88)\\d{3}", , , , "22123", , , [ 5 ] ], [ , , "(?:[58]\\d|7[013-7])\\d{5}", , , , "5912345", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "9(?:0[1-9]|1[01])\\d{4}", , , , "9010123", , , [ 7 ] ], "VU", 678, "00", , , , , , , , [ [ , "(\\d{3})(\\d{4})", "$1 $2", [ "[57-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "(?:3[03]|900\\d)\\d{3}", , , , "30123" ], , , [ , , , , , , , , , [ -1 ] ] ],
            WF: [ , [ , , "(?:40|72)\\d{4}|8\\d{5}(?:\\d{3})?", , , , , , , [ 6, 9 ] ], [ , , "72\\d{4}", , , , "721234", , , [ 6 ] ], [ , , "(?:72|8[23])\\d{4}", , , , "821234", , , [ 6 ] ], [ , , "80[0-5]\\d{6}", , , , "800012345", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "WF", 681, "00", , , , , , , , [ [ , "(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", [ "[478]" ] ], [ , "(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", [ "8" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "[48]0\\d{4}", , , , "401234", , , [ 6 ] ] ],
            WS: [ , [ , , "(?:[2-6]|8\\d{5})\\d{4}|[78]\\d{6}|[68]\\d{5}", , , , , , , [ 5, 6, 7, 10 ] ], [ , , "6[1-9]\\d{3}|(?:[2-5]|60)\\d{4}", , , , "22123", , , [ 5, 6 ] ], [ , , "(?:7[1-35-7]|8(?:[3-7]|9\\d{3}))\\d{5}", , , , "7212345", , , [ 7, 10 ] ], [ , , "800\\d{3}", , , , "800123", , , [ 6 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "WS", 685, "0", , , , , , , , [ [ , "(\\d{5})", "$1", [ "[2-5]|6[1-9]" ] ], [ , "(\\d{3})(\\d{3,7})", "$1 $2", [ "[68]" ] ], [ , "(\\d{2})(\\d{5})", "$1 $2", [ "7" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            XK: [ , [ , , "[23]\\d{7,8}|(?:4\\d\\d|[89]00)\\d{5}", , , , , , , [ 8, 9 ] ], [ , , "(?:2[89]|39)0\\d{6}|[23][89]\\d{6}", , , , "28012345" ], [ , , "4[3-9]\\d{6}", , , , "43201234", , , [ 8 ] ], [ , , "800\\d{5}", , , , "80001234", , , [ 8 ] ], [ , , "900\\d{5}", , , , "90001234", , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "XK", 383, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{5})", "$1 $2", [ "[89]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[2-4]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[23]" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            YE: [ , [ , , "(?:1|7\\d)\\d{7}|[1-7]\\d{6}", , , , , , , [ 7, 8, 9 ], [ 6 ] ], [ , , "78[0-7]\\d{4}|17\\d{6}|(?:[12][2-68]|3[2358]|4[2-58]|5[2-6]|6[3-58]|7[24-6])\\d{5}", , , , "1234567", , , [ 7, 8 ], [ 6 ] ], [ , , "7[0137]\\d{7}", , , , "712345678", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "YE", 967, "00", "0", , , "0", , , , [ [ , "(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "[1-6]|7[24-68]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "7" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            YT: [ , [ , , "80\\d{7}|(?:26|63)9\\d{6}", , , , , , , [ 9 ] ], [ , , "269(?:0[67]|5[0-3]|6\\d|[78]0)\\d{4}", , , , "269601234" ], [ , , "639(?:0[0-79]|1[019]|[267]\\d|3[09]|40|5[05-9]|9[04-79])\\d{4}", , , , "639012345" ], [ , , "80\\d{7}", , , , "801234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "YT", 262, "00", "0", , , "0", , , , , , [ , , , , , , , , , [ -1 ] ], , "269|63", [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ZA: [ , [ , , "[1-79]\\d{8}|8\\d{4,9}", , , , , , , [ 5, 6, 7, 8, 9, 10 ] ], [ , , "(?:2(?:0330|4302)|52087)0\\d{3}|(?:1[0-8]|2[1-378]|3[1-69]|4\\d|5[1346-8])\\d{7}", , , , "101234567", , , [ 9 ] ], [ , , "(?:1(?:3492[0-25]|4495[0235]|549(?:20|5[01]))|4[34]492[01])\\d{3}|8[1-4]\\d{3,7}|(?:2[27]|47|54)4950\\d{3}|(?:1(?:049[2-4]|9[12]\\d\\d)|(?:6\\d|7[0-46-9])\\d{3}|8(?:5\\d{3}|7(?:08[67]|158|28[5-9]|310)))\\d{4}|(?:1[6-8]|28|3[2-69]|4[025689]|5[36-8])4920\\d{3}|(?:12|[2-5]1)492\\d{4}", , , , "711234567", , , [ 5, 6, 7, 8, 9 ] ], [ , , "80\\d{7}", , , , "801234567", , , [ 9 ] ], [ , , "(?:86[2-9]|9[0-2]\\d)\\d{6}", , , , "862345678", , , [ 9 ] ], [ , , "860\\d{6}", , , , "860123456", , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "87(?:08[0-589]|15[0-79]|28[0-4]|31[1-9])\\d{4}|87(?:[02][0-79]|1[0-46-9]|3[02-9]|[4-9]\\d)\\d{5}", , , , "871234567", , , [ 9 ] ], "ZA", 27, "00", "0", , , "0", , , , [ [ , "(\\d{2})(\\d{3,4})", "$1 $2", [ "8[1-4]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{2,3})", "$1 $2 $3", [ "8[1-4]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "860" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "[1-9]" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "8" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "861\\d{6,7}", , , , "861123456", , , [ 9, 10 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ZM: [ , [ , , "(?:63|80)0\\d{6}|(?:21|[79]\\d)\\d{7}", , , , , , , [ 9 ], [ 6 ] ], [ , , "21[1-8]\\d{6}", , , , "211234567", , , , [ 6 ] ], [ , , "(?:7[679]|9[5-8])\\d{7}", , , , "955123456" ], [ , , "800\\d{6}", , , , "800123456" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "630\\d{6}", , , , "630012345" ], "ZM", 260, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3})", "$1 $2", [ "[1-9]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[28]" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "[79]" ], "0$1" ] ], [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[28]" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "[79]" ], "0$1" ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            ZW: [ , [ , , "2(?:[0-57-9]\\d{6,8}|6[0-24-9]\\d{6,7})|[38]\\d{9}|[35-8]\\d{8}|[3-6]\\d{7}|[1-689]\\d{6}|[1-3569]\\d{5}|[1356]\\d{4}", , , , , , , [ 5, 6, 7, 8, 9, 10 ], [ 3, 4 ] ], [ , , "(?:1(?:(?:3\\d|9)\\d|[4-8])|2(?:(?:(?:0(?:2[014]|5)|(?:2[0157]|31|84|9)\\d\\d|[56](?:[14]\\d\\d|20)|7(?:[089]|2[03]|[35]\\d\\d))\\d|4(?:2\\d\\d|8))\\d|1(?:2|[39]\\d{4}))|3(?:(?:123|(?:29\\d|92)\\d)\\d\\d|7(?:[19]|[56]\\d))|5(?:0|1[2-478]|26|[37]2|4(?:2\\d{3}|83)|5(?:25\\d\\d|[78])|[689]\\d)|6(?:(?:[16-8]21|28|52[013])\\d\\d|[39])|8(?:[1349]28|523)\\d\\d)\\d{3}|(?:4\\d\\d|9[2-9])\\d{4,5}|(?:(?:2(?:(?:(?:0|8[146])\\d|7[1-7])\\d|2(?:[278]\\d|92)|58(?:2\\d|3))|3(?:[26]|9\\d{3})|5(?:4\\d|5)\\d\\d)\\d|6(?:(?:(?:[0-246]|[78]\\d)\\d|37)\\d|5[2-8]))\\d\\d|(?:2(?:[569]\\d|8[2-57-9])|3(?:[013-59]\\d|8[37])|6[89]8)\\d{3}", , , , "1312345", , , , [ 3, 4 ] ], [ , , "7(?:[178]\\d|3[1-9])\\d{6}", , , , "712345678", , , [ 9 ] ], [ , , "80(?:[01]\\d|20|8[0-8])\\d{3}", , , , "8001234", , , [ 7 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "86(?:1[12]|22|30|44|55|77|8[368])\\d{6}", , , , "8686123456", , , [ 10 ] ], "ZW", 263, "00", "0", , , "0", , , , [ [ , "(\\d{3})(\\d{3,5})", "$1 $2", [ "2(?:0[45]|2[278]|[49]8)|3(?:[09]8|17)|6(?:[29]8|37|75)|[23][78]|(?:33|5[15]|6[68])[78]" ], "0$1" ], [ , "(\\d)(\\d{3})(\\d{2,4})", "$1 $2 $3", [ "[49]" ], "0$1" ], [ , "(\\d{3})(\\d{4})", "$1 $2", [ "80" ], "0$1" ], [ , "(\\d{2})(\\d{7})", "$1 $2", [ "24|8[13-59]|(?:2[05-79]|39|5[45]|6[15-8])2", "2(?:02[014]|4|[56]20|[79]2)|392|5(?:42|525)|6(?:[16-8]21|52[013])|8[13-59]" ], "(0$1)" ], [ , "(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", [ "7" ], "0$1" ], [ , "(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "2(?:1[39]|2[0157]|[378]|[56][14])|3(?:12|29)", "2(?:1[39]|2[0157]|[378]|[56][14])|3(?:123|29)" ], "0$1" ], [ , "(\\d{4})(\\d{6})", "$1 $2", [ "8" ], "0$1" ], [ , "(\\d{2})(\\d{3,5})", "$1 $2", [ "1|2(?:0[0-36-9]|12|29|[56])|3(?:1[0-689]|[24-6])|5(?:[0236-9]|1[2-4])|6(?:[013-59]|7[0-46-9])|(?:33|55|6[68])[0-69]|(?:29|3[09]|62)[0-79]" ], "0$1" ], [ , "(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", [ "29[013-9]|39|54" ], "0$1" ], [ , "(\\d{4})(\\d{3,5})", "$1 $2", [ "(?:25|54)8", "258|5483" ], "0$1" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            800: [ , [ , , "(?:005|[1-9]\\d\\d)\\d{5}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:005|[1-9]\\d\\d)\\d{5}", , , , "12345678" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "001", 800, , , , , , , , 1, [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "\\d" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            808: [ , [ , , "[1-9]\\d{7}", , , , , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "[1-9]\\d{7}", , , , "12345678" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "001", 808, , , , , , , , 1, [ [ , "(\\d{4})(\\d{4})", "$1 $2", [ "[1-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            870: [ , [ , , "7\\d{11}|[35-7]\\d{8}", , , , , , , [ 9, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:[356]|774[45])\\d{8}|7[6-8]\\d{7}", , , , "301234567" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "001", 870, , , , , , , , , [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "[35-7]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            878: [ , [ , , "10\\d{10}", , , , , , , [ 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "10\\d{10}", , , , "101234567890" ], "001", 878, , , , , , , , 1, [ [ , "(\\d{2})(\\d{5})(\\d{5})", "$1 $2 $3", [ "1" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            881: [ , [ , , "[0-36-9]\\d{8}", , , , , , , [ 9 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "[0-36-9]\\d{8}", , , , "612345678" ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "001", 881, , , , , , , , , [ [ , "(\\d)(\\d{3})(\\d{5})", "$1 $2 $3", [ "[0-36-9]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            882: [ , [ , , "[13]\\d{6}(?:\\d{2,5})?|285\\d{9}|(?:[19]\\d|49)\\d{6}", , , , , , , [ 7, 8, 9, 10, 11, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "342\\d{4}|(?:337|49)\\d{6}|3(?:2|47|7\\d{3})\\d{7}", , , , "3421234", , , [ 7, 8, 9, 10, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "1(?:3(?:0[0347]|[13][0139]|2[035]|4[013568]|6[0459]|7[06]|8[15-8]|9[0689])\\d{4}|6\\d{5,10})|(?:(?:285\\d\\d|3(?:45|[69]\\d{3}))\\d|9[89])\\d{6}", , , , "390123456789" ], "001", 882, , , , , , , , , [ [ , "(\\d{2})(\\d{5})", "$1 $2", [ "16|342" ] ], [ , "(\\d{2})(\\d{6})", "$1 $2", [ "4" ] ], [ , "(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", [ "[19]" ] ], [ , "(\\d{2})(\\d{4})(\\d{3})", "$1 $2 $3", [ "3[23]" ] ], [ , "(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", [ "1" ] ], [ , "(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", [ "34[57]" ] ], [ , "(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", [ "34" ] ], [ , "(\\d{2})(\\d{4,5})(\\d{5})", "$1 $2 $3", [ "[1-3]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , "348[57]\\d{7}", , , , "34851234567", , , [ 11 ] ] ],
            883: [ , [ , , "(?:210|370\\d\\d)\\d{7}|51\\d{7}(?:\\d{3})?", , , , , , , [ 9, 10, 12 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "(?:210|(?:370[1-9]|51[013]0)\\d)\\d{7}|5100\\d{5}", , , , "510012345" ], "001", 883, , , , , , , , 1, [ [ , "(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", [ "510" ] ], [ , "(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", [ "2" ] ], [ , "(\\d{4})(\\d{4})(\\d{4})", "$1 $2 $3", [ "51[13]" ] ], [ , "(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", [ "[35]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ],
            888: [ , [ , , "\\d{11}", , , , , , , [ 11 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "001", 888, , , , , , , , 1, [ [ , "(\\d{3})(\\d{3})(\\d{5})", "$1 $2 $3" ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , "\\d{11}", , , , "12345678901" ], , , [ , , , , , , , , , [ -1 ] ] ],
            979: [ , [ , , "[1359]\\d{8}", , , , , , , [ 9 ], [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , "[1359]\\d{8}", , , , "123456789", , , , [ 8 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], "001", 979, , , , , , , , 1, [ [ , "(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", [ "[1359]" ] ] ], , [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ], [ , , , , , , , , , [ -1 ] ], , , [ , , , , , , , , , [ -1 ] ] ]
        };
        function K() {
            this.g = {};
        }
        K.i = void 0;
        K.g = function() {
            return K.i ? K.i : K.i = new K;
        };
        var wa = {
            0: "0",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            "０": "0",
            "１": "1",
            "２": "2",
            "３": "3",
            "４": "4",
            "５": "5",
            "６": "6",
            "７": "7",
            "８": "8",
            "９": "9",
            "٠": "0",
            "١": "1",
            "٢": "2",
            "٣": "3",
            "٤": "4",
            "٥": "5",
            "٦": "6",
            "٧": "7",
            "٨": "8",
            "٩": "9",
            "۰": "0",
            "۱": "1",
            "۲": "2",
            "۳": "3",
            "۴": "4",
            "۵": "5",
            "۶": "6",
            "۷": "7",
            "۸": "8",
            "۹": "9"
        }, xa = {
            0: "0",
            1: "1",
            2: "2",
            3: "3",
            4: "4",
            5: "5",
            6: "6",
            7: "7",
            8: "8",
            9: "9",
            "０": "0",
            "１": "1",
            "２": "2",
            "３": "3",
            "４": "4",
            "５": "5",
            "６": "6",
            "７": "7",
            "８": "8",
            "９": "9",
            "٠": "0",
            "١": "1",
            "٢": "2",
            "٣": "3",
            "٤": "4",
            "٥": "5",
            "٦": "6",
            "٧": "7",
            "٨": "8",
            "٩": "9",
            "۰": "0",
            "۱": "1",
            "۲": "2",
            "۳": "3",
            "۴": "4",
            "۵": "5",
            "۶": "6",
            "۷": "7",
            "۸": "8",
            "۹": "9",
            A: "2",
            B: "2",
            C: "2",
            D: "3",
            E: "3",
            F: "3",
            G: "4",
            H: "4",
            I: "4",
            J: "5",
            K: "5",
            L: "5",
            M: "6",
            N: "6",
            O: "6",
            P: "7",
            Q: "7",
            R: "7",
            S: "7",
            T: "8",
            U: "8",
            V: "8",
            W: "9",
            X: "9",
            Y: "9",
            Z: "9"
        }, L = /^[+\uff0b]+/, ya = /([0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9])/, za = /[+\uff0b0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9]/, Aa = /[\\\/] *x/, Ba = /[^0-9\uff10-\uff19\u0660-\u0669\u06f0-\u06f9A-Za-z#]+$/, Ca = /(?:.*?[A-Za-z]){3}.*/;
        function N(a) {
            return "([0-9０-９٠-٩۰-۹]{1," + a + "})";
        }
        function Da() {
            return ";ext=" + N("20") + "|[  \\t,]*(?:e?xt(?:ensi(?:ó?|ó))?n?|ｅ?ｘｔｎ?|доб|anexo)[:\\.．]?[  \\t,-]*" + N("20") + "#?|[  \\t,]*(?:[xｘ#＃~～]|int|ｉｎｔ)[:\\.．]?[  \\t,-]*" + N("9") + "#?|[- ]+" + N("6") + "#|[  \\t]*(?:,{2}|;)[:\\.．]?[  \\t,-]*" + N("15") + "#?|[  \\t]*(?:,)+[:\\.．]?[  \\t,-]*" + N("9") + "#?";
        }
        var Ea = new RegExp("(?:" + Da() + ")$", "i"), Fa = new RegExp("^[0-9０-９٠-٩۰-۹]{2}$|^[+＋]*(?:[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～*]*[0-9０-９٠-٩۰-۹]){3,}[-x‐-―−ー－-／  ­​⁠　()（）［］.\\[\\]/~⁓∼～*A-Za-z0-9０-９٠-٩۰-۹]*(?:" + Da() + ")?$", "i"), Ga = /(\$\d)/;
        function Ha(a) {
            return 2 > a.length ? !1 : O(Fa, a);
        }
        function Ia(a) {
            return O(Ca, a) ? P(a, xa) : P(a, wa);
        }
        function Ja(a) {
            var b = Ia(a.toString());
            a.i = "";
            a.g(b);
        }
        function Ka(a) {
            return null != a && (1 != x(a, 9) || -1 != u(a, 9)[0]);
        }
        function P(a, b) {
            for (var d, c = new E, e = a.length, g = 0; g < e; ++g) d = a.charAt(g), d = b[d.toUpperCase()], 
            null != d && c.g(d);
            return c.toString();
        }
        function Q(a) {
            return null != a && isNaN(a) && a.toUpperCase() in va;
        }
        function La(a, b, c) {
            if (0 == p(b, 2) && null != b.g[5]) {
                var d = w(b, 5);
                if (0 < d.length) return d;
            }
            d = w(b, 1);
            var e = R(b);
            if (0 == c) return Ma(d, 0, e, "");
            if (!(d in J)) return e;
            a = S(a, d, T(d));
            b = null != b.g[3] && 0 != p(b, 3).length ? 3 == c ? ";ext=" + p(b, 3) : null != a.g[13] ? p(a, 13) + w(b, 3) : " ext. " + w(b, 3) : "";
            a: {
                a = 0 == u(a, 20).length || 2 == c ? u(a, 19) : u(a, 20);
                for (var g, f = a.length, h = 0; h < f; ++h) {
                    g = a[h];
                    var l = x(g, 3);
                    if (0 == l || 0 == e.search(p(g, 3, l - 1))) if (l = new RegExp(p(g, 1)), O(l, e)) {
                        a = g;
                        break a;
                    }
                }
                a = null;
            }
            null != a && (f = a, a = w(f, 2), g = new RegExp(p(f, 1)), w(f, 5), f = w(f, 4), 
            e = 2 == c && null != f && 0 < f.length ? e.replace(g, a.replace(Ga, f)) : e.replace(g, a), 
            3 == c && (e = e.replace(/^[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\[\]/~\u2053\u223c\uff5e]+/, ""), 
            e = e.replace(/[-x\u2010-\u2015\u2212\u30fc\uff0d-\uff0f \u00a0\u00ad\u200b\u2060\u3000()\uff08\uff09\uff3b\uff3d.\[\]/~\u2053\u223c\uff5e]+/g, "-")));
            return Ma(d, c, e, b);
        }
        function S(a, b, c) {
            return "001" == c ? U(a, "" + b) : U(a, c);
        }
        function R(a) {
            if (null == a.g[2]) return "";
            var b = "" + p(a, 2);
            return null != a.g[4] && p(a, 4) && 0 < w(a, 8) ? Array(w(a, 8) + 1).join("0") + b : b;
        }
        function Ma(a, b, c, d) {
            switch (b) {
              case 0:
                return "+" + a + c + d;

              case 1:
                return "+" + a + " " + c + d;

              case 3:
                return "tel:+" + a + "-" + c + d;

              default:
                return c + d;
            }
        }
        function V(a, b) {
            switch (b) {
              case 4:
                return p(a, 5);

              case 3:
                return p(a, 4);

              case 1:
                return p(a, 3);

              case 0:
              case 2:
                return p(a, 2);

              case 5:
                return p(a, 6);

              case 6:
                return p(a, 8);

              case 7:
                return p(a, 7);

              case 8:
                return p(a, 21);

              case 9:
                return p(a, 25);

              case 10:
                return p(a, 28);

              default:
                return p(a, 1);
            }
        }
        function W(a, b) {
            return X(a, p(b, 1)) ? X(a, p(b, 5)) ? 4 : X(a, p(b, 4)) ? 3 : X(a, p(b, 6)) ? 5 : X(a, p(b, 8)) ? 6 : X(a, p(b, 7)) ? 7 : X(a, p(b, 21)) ? 8 : X(a, p(b, 25)) ? 9 : X(a, p(b, 28)) ? 10 : X(a, p(b, 2)) ? p(b, 18) || X(a, p(b, 3)) ? 2 : 0 : !p(b, 18) && X(a, p(b, 3)) ? 1 : -1 : -1;
        }
        function U(a, b) {
            if (null == b) return null;
            b = b.toUpperCase();
            var c = a.g[b];
            if (null == c) {
                c = va[b];
                if (null == c) return null;
                c = (new D).g(H.j(), c);
                a.g[b] = c;
            }
            return c;
        }
        function X(a, b) {
            var c = a.length;
            return 0 < x(b, 9) && -1 == u(b, 9).indexOf(c) ? !1 : O(w(b, 2), a);
        }
        function Na(a, b) {
            if (null == b) return null;
            var c = w(b, 1);
            c = J[c];
            if (null == c) a = null; else if (1 == c.length) a = c[0]; else a: {
                b = R(b);
                for (var d, e = c.length, g = 0; g < e; g++) {
                    d = c[g];
                    var f = U(a, d);
                    if (null != f.g[23]) {
                        if (0 == b.search(p(f, 23))) {
                            a = d;
                            break a;
                        }
                    } else if (-1 != W(b, f)) {
                        a = d;
                        break a;
                    }
                }
                a = null;
            }
            return a;
        }
        function T(a) {
            a = J[a];
            return null == a ? "ZZ" : a[0];
        }
        function Y(a, b, c, d) {
            var e = V(c, d), g = 0 == x(e, 9) ? u(p(c, 1), 9) : u(e, 9);
            e = u(e, 10);
            if (2 == d) if (Ka(V(c, 0))) a = V(c, 1), Ka(a) && (g = g.concat(0 == x(a, 9) ? u(p(c, 1), 9) : u(a, 9)), 
            g.sort(), 0 == e.length ? e = u(a, 10) : (e = e.concat(u(a, 10)), e.sort())); else return Y(a, b, c, 1);
            if (-1 == g[0]) return 5;
            b = b.length;
            if (-1 < e.indexOf(b)) return 4;
            c = g[0];
            return c == b ? 0 : c > b ? 2 : g[g.length - 1] < b ? 3 : -1 < g.indexOf(b, 1) ? 0 : 5;
        }
        function Oa(a, b) {
            var c = R(b);
            b = w(b, 1);
            if (!(b in J)) return 1;
            b = S(a, b, T(b));
            return Y(a, c, b, -1);
        }
        function Pa(a, b, c, d, e, g) {
            if (0 == b.length) return 0;
            b = new E(b);
            var f;
            null != c && (f = p(c, 11));
            null == f && (f = "NonMatch");
            var h = b.toString();
            if (0 == h.length) f = 20; else if (L.test(h)) h = h.replace(L, ""), b.i = "", b.g(Ia(h)), 
            f = 1; else {
                h = new RegExp(f);
                Ja(b);
                f = b.toString();
                if (0 == f.search(h)) {
                    h = f.match(h)[0].length;
                    var l = f.substring(h).match(ya);
                    l && null != l[1] && 0 < l[1].length && "0" == P(l[1], wa) ? f = !1 : (b.i = "", 
                    b.g(f.substring(h)), f = !0);
                } else f = !1;
                f = f ? 5 : 20;
            }
            e && q(g, 6, f);
            if (20 != f) {
                if (2 >= b.i.length) throw Error("Phone number too short after IDD");
                a: {
                    a = b.toString();
                    if (0 != a.length && "0" != a.charAt(0)) for (e = a.length, b = 1; 3 >= b && b <= e; ++b) if (c = parseInt(a.substring(0, b), 10), 
                    c in J) {
                        d.g(a.substring(b));
                        d = c;
                        break a;
                    }
                    d = 0;
                }
                if (0 != d) return q(g, 1, d), d;
                throw Error("Invalid country calling code");
            }
            if (null != c && (f = w(c, 10), h = "" + f, l = b.toString(), 0 == l.lastIndexOf(h, 0) && (h = new E(l.substring(h.length)), 
            l = p(c, 1), l = new RegExp(w(l, 2)), Qa(h, c, null), h = h.toString(), !O(l, b.toString()) && O(l, h) || 3 == Y(a, b.toString(), c, -1)))) return d.g(h), 
            e && q(g, 6, 10), q(g, 1, f), f;
            q(g, 1, 0);
            return 0;
        }
        function Qa(a, b, c) {
            var d = a.toString(), e = d.length, g = p(b, 15);
            if (0 != e && null != g && 0 != g.length) {
                var f = new RegExp("^(?:" + g + ")");
                if (e = f.exec(d)) {
                    g = new RegExp(w(p(b, 1), 2));
                    var h = O(g, d), l = e.length - 1;
                    b = p(b, 16);
                    if (null == b || 0 == b.length || null == e[l] || 0 == e[l].length) {
                        if (!h || O(g, d.substring(e[0].length))) null != c && 0 < l && null != e[l] && c.g(e[1]), 
                        a.set(d.substring(e[0].length));
                    } else if (d = d.replace(f, b), !h || O(g, d)) null != c && 0 < l && c.g(e[1]), 
                    a.set(d);
                }
            }
        }
        function Z(a, b, c) {
            if (!Q(c) && 0 < b.length && "+" != b.charAt(0)) throw Error("Invalid country calling code");
            return Ra(a, b, c, !0);
        }
        function Ra(a, b, c, d) {
            if (null == b) throw Error("The string supplied did not seem to be a phone number");
            if (250 < b.length) throw Error("The string supplied is too long to be a phone number");
            var e = new E, g = b.indexOf(";phone-context=");
            if (0 <= g) {
                var f = g + 15;
                if ("+" == b.charAt(f)) {
                    var h = b.indexOf(";", f);
                    0 < h ? e.g(b.substring(f, h)) : e.g(b.substring(f));
                }
                f = b.indexOf("tel:");
                e.g(b.substring(0 <= f ? f + 4 : 0, g));
            } else g = e.g, f = b.search(za), 0 <= f ? (f = b.substring(f), f = f.replace(Ba, ""), 
            h = f.search(Aa), 0 <= h && (f = f.substring(0, h))) : f = "", g.call(e, f);
            g = e.toString();
            f = g.indexOf(";isub=");
            0 < f && (e.i = "", e.g(g.substring(0, f)));
            if (!Ha(e.toString())) throw Error("The string supplied did not seem to be a phone number");
            g = e.toString();
            if (!(Q(c) || null != g && 0 < g.length && L.test(g))) throw Error("Invalid country calling code");
            g = new I;
            d && q(g, 5, b);
            a: {
                b = e.toString();
                f = b.search(Ea);
                if (0 <= f && Ha(b.substring(0, f))) {
                    h = b.match(Ea);
                    for (var l = h.length, z = 1; z < l; ++z) if (null != h[z] && 0 < h[z].length) {
                        e.i = "";
                        e.g(b.substring(0, f));
                        b = h[z];
                        break a;
                    }
                }
                b = "";
            }
            0 < b.length && q(g, 3, b);
            f = U(a, c);
            b = new E;
            h = 0;
            l = e.toString();
            try {
                h = Pa(a, l, f, b, d, g);
            } catch (M) {
                if ("Invalid country calling code" == M.message && L.test(l)) {
                    if (l = l.replace(L, ""), h = Pa(a, l, f, b, d, g), 0 == h) throw M;
                } else throw M;
            }
            0 != h ? (e = T(h), e != c && (f = S(a, h, e))) : (Ja(e), b.g(e.toString()), null != c ? (h = w(f, 10), 
            q(g, 1, h)) : d && (delete g.g[6], g.i && delete g.i[6]));
            if (2 > b.i.length) throw Error("The string supplied is too short to be a phone number");
            null != f && (c = new E, e = new E(b.toString()), Qa(e, f, c), a = Y(a, e.toString(), f, -1), 
            2 != a && 4 != a && 5 != a && (b = e, d && 0 < c.toString().length && q(g, 7, c.toString())));
            d = b.toString();
            a = d.length;
            if (2 > a) throw Error("The string supplied is too short to be a phone number");
            if (17 < a) throw Error("The string supplied is too long to be a phone number");
            if (1 < d.length && "0" == d.charAt(0)) {
                q(g, 4, !0);
                for (a = 1; a < d.length - 1 && "0" == d.charAt(a); ) a++;
                1 != a && q(g, 8, a);
            }
            q(g, 2, parseInt(d, 10));
            return g;
        }
        function O(a, b) {
            return (a = "string" == typeof a ? b.match("^(?:" + a + ")$") : b.match(a)) && a[0].length == b.length ? !0 : !1;
        }
        k("intlTelInputUtils", {});
        k("intlTelInputUtils.formatNumber", (function(a, b, c) {
            try {
                var d = K.g(), e = Z(d, a, b), g = Oa(d, e);
                return 0 == g || 4 == g ? La(d, e, "undefined" == typeof c ? 0 : c) : a;
            } catch (f) {
                return a;
            }
        }));
        k("intlTelInputUtils.getExampleNumber", (function(a, b, c) {
            try {
                var d = K.g();
                a: {
                    if (Q(a)) {
                        var e = V(U(d, a), c);
                        try {
                            if (null != e.g[6]) {
                                var g = p(e, 6);
                                var f = Ra(d, g, a, !1);
                                break a;
                            }
                        } catch (h) {}
                    }
                    f = null;
                }
                return La(d, f, b ? 2 : 1);
            } catch (h) {
                return "";
            }
        }));
        k("intlTelInputUtils.getExtension", (function(a, b) {
            try {
                return p(Z(K.g(), a, b), 3);
            } catch (c) {
                return "";
            }
        }));
        k("intlTelInputUtils.getNumberType", (function(a, b) {
            try {
                var c = K.g();
                var d = Z(c, a, b), e = Na(c, d), g = S(c, w(d, 1), e);
                if (null == g) var f = -1; else {
                    var h = R(d);
                    f = W(h, g);
                }
                return f;
            } catch (l) {
                return -99;
            }
        }));
        k("intlTelInputUtils.getValidationError", (function(a, b) {
            try {
                var c = K.g(), d = Z(c, a, b);
                return Oa(c, d);
            } catch (e) {
                return "Invalid country calling code" == e.message ? 1 : "Phone number too short after IDD" == e.message || "The string supplied is too short to be a phone number" == e.message ? 2 : "The string supplied is too long to be a phone number" == e.message ? 3 : -99;
            }
        }));
        k("intlTelInputUtils.isValidNumber", (function(a, b) {
            try {
                var c = K.g(), d = Z(c, a, b);
                var h, e = Na(c, d), g = w(d, 1), f = S(c, g, e);
                if (!(h = null == f)) {
                    var l;
                    if (l = "001" != e) {
                        var z = U(c, e);
                        if (null == z) throw Error("Invalid region code: " + e);
                        var M = w(z, 10);
                        l = g != M;
                    }
                    h = l;
                }
                if (h) var ua = !1; else {
                    var Sa = R(d);
                    ua = -1 != W(Sa, f);
                }
                return ua;
            } catch (Ta) {
                return !1;
            }
        }));
        k("intlTelInputUtils.numberFormat", {
            E164: 0,
            INTERNATIONAL: 1,
            NATIONAL: 2,
            RFC3966: 3
        });
        k("intlTelInputUtils.numberType", {
            FIXED_LINE: 0,
            MOBILE: 1,
            FIXED_LINE_OR_MOBILE: 2,
            TOLL_FREE: 3,
            PREMIUM_RATE: 4,
            SHARED_COST: 5,
            VOIP: 6,
            PERSONAL_NUMBER: 7,
            PAGER: 8,
            UAN: 9,
            VOICEMAIL: 10,
            UNKNOWN: -1
        });
        k("intlTelInputUtils.validationError", {
            IS_POSSIBLE: 0,
            INVALID_COUNTRY_CODE: 1,
            TOO_SHORT: 2,
            TOO_LONG: 3,
            IS_POSSIBLE_LOCAL_ONLY: 4,
            INVALID_LENGTH: 5
        });
    })();
    const inputPhone = document.querySelectorAll('input[type="tel"]');
    if (inputPhone) inputPhone.forEach((element => {
        var iti = window.intlTelInput(element, {
            initialCountry: "fr",
            separateDialCode: true,
            geoIpLookup: function(success, failure) {
                $.get("https://ipinfo.io", (function() {}), "jsonp").always((function(resp) {
                    var countryCode = resp && resp.country ? resp.country : "br";
                    success(countryCode);
                }));
            },
            utilsScript: "js/libs/utils.js",
            hiddenInput: "full_phone"
        });
        $(element).on("countrychange", (function(event) {
            var selectedCountryData = iti.getSelectedCountryData(), newPlaceholder = intlTelInputUtils.getExampleNumber(selectedCountryData.iso2, true, intlTelInputUtils.numberFormat.INTERNATIONAL);
            iti.setNumber("");
            var mask = newPlaceholder.replace(/[1-9]/g, "0");
            $(this).mask(mask);
        }));
    }));
    function WindowSize() {
        const sectionLine = document.querySelectorAll(".section__line");
        sectionLine.forEach((line => {
            line.replaceChildren();
            let spanWidth, lineWidth = line.clientWidth, span = document.createElement("span");
            span.innerText = "Notre mission";
            line.appendChild(span);
            spanWidth = span.clientWidth;
            for (let i = spanWidth; i < lineWidth; i += spanWidth) line.appendChild(span.cloneNode(true));
        }));
    }
    WindowSize();
    window.addEventListener("resize", WindowSize);
    window["FLS"] = false;
    isWebp();
    menuInit();
    formFieldsInit({
        viewPass: false,
        autoHeight: false
    });
    formSubmit();
})();