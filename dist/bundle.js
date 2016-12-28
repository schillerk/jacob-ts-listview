/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var React = __webpack_require__(1);
	var ReactDOM = __webpack_require__(2);
	var ListView_1 = __webpack_require__(3);
	ReactDOM.render(React.createElement(ListView_1.ListView, null), document.getElementById("app-container"));


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ReactDOM;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var __assign = (this && this.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	var React = __webpack_require__(1);
	var GestaltList_1 = __webpack_require__(4);
	var Util = __webpack_require__(6);
	var ListView = (function (_super) {
	    __extends(ListView, _super);
	    function ListView(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = {
	            searchAddBox: "",
	            gestalts: {
	                '0': {
	                    gestaltId: '0',
	                    text: 'hack with jacob!',
	                    relatedIds: ['blah', 'bleh', 'bluh']
	                }
	            }
	        };
	        return _this;
	    }
	    ListView.prototype.componentDidMount = function () {
	        // real way to focus search add box
	    };
	    ListView.prototype.addGestaltAndClearTextBox = function (text) {
	        console.log('add');
	        var uid = Util.getGUID();
	        var newGestalt = {
	            gestaltId: uid,
	            text: text,
	            relatedIds: []
	        };
	        var newGestalts = __assign({}, this.state.gestalts, (_a = {}, _a[uid] = newGestalt, _a));
	        this.setState(__assign({}, this.state, { gestalts: newGestalts, searchAddBox: "" }));
	        var _a;
	    };
	    ListView.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", null,
	            React.createElement("textarea", { placeholder: "Search/add gestalts: ", onKeyDown: function (e) {
	                    console.log(e.keyCode);
	                    var target = e.target;
	                    if (e.keyCode === 13) {
	                        e.preventDefault(); // prevents onChange
	                        _this.addGestaltAndClearTextBox(target.value);
	                    }
	                }, onChange: function (e) {
	                    var target = e.target;
	                    _this.setState(__assign({}, _this.state, { searchAddBox: target.value }));
	                }, ref: function (searchAddBox) { return searchAddBox.focus(); } /* #hack */, tabIndex: 2, cols: 20, value: this.state.searchAddBox }),
	            React.createElement(GestaltList_1.GestaltList, { gestalts: this.state.gestalts })));
	    };
	    return ListView;
	}(React.Component));
	exports.ListView = ListView;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(1);
	var GestaltComponent_1 = __webpack_require__(5);
	var GestaltList = (function (_super) {
	    __extends(GestaltList, _super);
	    function GestaltList(props) {
	        return _super.call(this, props) || this;
	    }
	    GestaltList.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("ul", null, Object.keys(this.props.gestalts).reverse().map(function (id) {
	            return React.createElement(GestaltComponent_1.GestaltComponent, { key: id, gestalt: _this.props.gestalts[id] });
	        })));
	    };
	    return GestaltList;
	}(React.Component));
	exports.GestaltList = GestaltList;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(1);
	var GestaltComponent = (function (_super) {
	    __extends(GestaltComponent, _super);
	    function GestaltComponent(props) {
	        return _super.call(this, props) || this;
	    }
	    GestaltComponent.prototype.render = function () {
	        return (React.createElement("li", null,
	            this.props.gestalt.text,
	            React.createElement("ul", { style: { display: 'inline' } }, this.props.gestalt.relatedIds.map(function (id) {
	                return (React.createElement("li", { style: { display: 'inline-block', border: '1px solid gray', margin: '4px', padding: '2px' } }, id));
	            }))));
	    };
	    return GestaltComponent;
	}(React.Component));
	exports.GestaltComponent = GestaltComponent;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	var count = 0;
	function getGUID() {
	    count++;
	    return "UNIQUE_ID_" + count.toString();
	}
	exports.getGUID = getGUID;
	function objectToArray(object) {
	    var arr = [];
	    for (var key in object) {
	        arr.push(object[key]);
	    }
	    return arr;
	}
	exports.objectToArray = objectToArray;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map