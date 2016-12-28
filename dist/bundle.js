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
	var LLViz_1 = __webpack_require__(3);
	ReactDOM.render(React.createElement(LLViz_1.LLViz, null), document.getElementById("example"));


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
	var React = __webpack_require__(1);
	var LinkedList_1 = __webpack_require__(4);
	var LLViz = (function (_super) {
	    __extends(LLViz, _super);
	    function LLViz(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = { theList: new LinkedList_1.LinkedList(), lastPopped: "" };
	        return _this;
	    }
	    LLViz.prototype.render = function () {
	        var _this = this;
	        return React.createElement("div", null,
	            "Stack:",
	            React.createElement("div", null,
	                "\"",
	                this.state.theList.toString() || "\u00a0",
	                "\""),
	            React.createElement("div", null,
	                "[",
	                this.state.theList.toArray().map(function (e) { return e.toString() + ", "; }) || "\u00a0",
	                "]"),
	            React.createElement("button", { onClick: function () { _this.state.theList.push("yo" + Math.round(Math.random() * 10)); _this.forceUpdate(); } }, "push"),
	            React.createElement("br", null),
	            React.createElement("button", { onClick: function () { _this.state.lastPopped = _this.state.theList.pop(); _this.forceUpdate(); return; } }, "pop"),
	            React.createElement("span", null, this.state.lastPopped));
	    };
	    return LLViz;
	}(React.Component));
	exports.LLViz = LLViz;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var LLNode = (function () {
	    function LLNode(val, next) {
	        if (next === void 0) { next = null; }
	        this.next = null;
	        this.val = val;
	        this.next = next;
	    }
	    LLNode.prototype.toString = function () {
	        return this.val + "";
	    };
	    return LLNode;
	}());
	var LinkedList = (function () {
	    function LinkedList() {
	        this.head = null;
	    }
	    LinkedList.prototype.push = function (v) {
	        var n = new LLNode(v);
	        n.next = this.head;
	        this.head = n;
	    };
	    LinkedList.prototype.pop = function () {
	        var o = this.head;
	        if (o !== null) {
	            this.head = this.head.next;
	            return o.val;
	        }
	        else {
	            return undefined;
	        }
	    };
	    // push(s:any ) : void {
	    //     if(typeof s === "string") {
	    //     let n: LLNode =new LLNode(s)
	    //     n.next=this.head
	    //     this.head=n
	    //     }
	    // }
	    // push(n:LLNode ) : void
	    // push(n:any ) : void {
	    //     console.log(typeof n)
	    //     if(typeof n === "string") {
	    //         this.push(new LLNode(n))
	    //     }
	    //     else if(typeof n === "LLNode") {
	    //         n.next=this.head
	    //         this.head=n
	    //     }
	    //     else
	    //         throw "er"
	    // }
	    //prints results in reverse insertion order
	    LinkedList.prototype.toString = function () {
	        var n = this.head;
	        var o = "";
	        while (n !== null) {
	            o += n.toString() + "->";
	            n = n.next;
	        }
	        o += "[null]";
	        return o;
	    };
	    //prints results in reverse insertion order
	    LinkedList.prototype.toArray = function () {
	        var n = this.head;
	        var o = [];
	        while (n !== null) {
	            o.push(n.val);
	            n = n.next;
	        }
	        return o;
	    };
	    return LinkedList;
	}());
	exports.LinkedList = LinkedList;
	// let l: Stack<string> = new LinkedList<string>()
	// l.push("yo")
	// l.push("yo2")
	// l.push("yo3")
	// console.log(l.toString())
	// console.log(l.pop())
	// console.log(l.toString())


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map