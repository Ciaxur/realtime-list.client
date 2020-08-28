"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var react_1 = require("react");
require("./App.scss");
var react_router_dom_1 = require("react-router-dom");
var react_loading_1 = require("react-loading");
// Styling Libraries
var core_1 = require("@material-ui/core");
// Axios & Socket Library
var socket_io_client_1 = require("socket.io-client");
var axios_1 = require("axios");
// Component Imports
var Item_1 = require("./Item");
// Import Configuration
var config_1 = require("./config");
;
;
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        // Initialize State
        _this.state = {
            socket: null,
            itemList: null,
            redirect: null,
            isItemEdit: false,
            item: null
        };
        // Bind Member Functions
        _this.submitItemAdd = _this.submitItemAdd.bind(_this);
        _this.deleteItem = _this.deleteItem.bind(_this);
        _this.updateItem = _this.updateItem.bind(_this);
        _this.modifyItem = _this.modifyItem.bind(_this);
        return _this;
    }
    App.prototype.componentDidMount = function () {
        var _this = this;
        // Secure Request?
        var secure = process.env.REACT_APP_UNSECURE ? false : true; // Defaulted to True
        // Connect Socket and Attach Listeners
        this.setState({ socket: socket_io_client_1["default"]("ws" + (secure ? 's' : '') + "://" + config_1["default"].SERVER_IP) }, function () {
            var socket = _this.state.socket;
            // SOCKET CONNECT
            socket === null || socket === void 0 ? void 0 : socket.on('connect', function () {
                // Fetch List
                axios_1["default"].get("http" + (secure ? 's' : '') + "://" + config_1["default"].SERVER_IP + "/list")
                    .then(function (res) { return res.data; })
                    .then(function (data) { return _this.setState({ itemList: data }); })["catch"](function (err) {
                    console.log('No List, ', err);
                });
            });
            // SOCKET: Error Messages
            socket === null || socket === void 0 ? void 0 : socket.on('error', function (err) {
                console.log('Socket Error Message:', err);
            });
            // SOCKET: New Item Added
            socket === null || socket === void 0 ? void 0 : socket.on('new-item', function (item) {
                if (!_this.state.itemList)
                    return;
                var itemList = _this.state.itemList;
                itemList.push(item);
                _this.setState({ itemList: itemList });
            });
            // SOCKET: Item Removed
            socket === null || socket === void 0 ? void 0 : socket.on('remove-item', function (item) {
                if (!_this.state.itemList)
                    return;
                var itemList = _this.state.itemList.filter(function (val) { return val._id !== item._id; });
                _this.setState({ itemList: itemList });
            });
            // SOCKET: Item Updated
            socket === null || socket === void 0 ? void 0 : socket.on('update-item', function (item) {
                if (!_this.state.itemList)
                    return;
                // Update the new Item
                var itemList = _this.state.itemList
                    .map(function (val) { return val._id === item._id ? item : val; });
                _this.setState({ itemList: itemList });
            });
        });
    };
    // SERVER: Submit Item Listing to Server
    App.prototype.submitItemAdd = function (item) {
        var _a;
        // Added Item
        if (item) {
            // Emit to Socket to Add to DB
            (_a = this.state.socket) === null || _a === void 0 ? void 0 : _a.emit('item-add', item);
        }
        // Go Home & Update Data
        this.setState({ redirect: '/' });
    };
    // SERVER: Remove Item Listing from Server
    App.prototype.deleteItem = function (item) {
        var _a;
        (_a = this.state.socket) === null || _a === void 0 ? void 0 : _a.emit('item-del', item);
    };
    // SERVER: Update Item Listing on Server
    App.prototype.updateItem = function (item) {
        var _a;
        // Issue an Update to Server
        (_a = this.state.socket) === null || _a === void 0 ? void 0 : _a.emit('item-update', item);
        // Redirect back to Home & Modify State
        this.setState({
            item: null,
            isItemEdit: false,
            redirect: '/'
        });
    };
    // Sets up Modifying an Item
    App.prototype.modifyItem = function (item) {
        // Setup the State for Editing the Item
        this.setState({
            item: item,
            isItemEdit: true,
            redirect: '/edit-item'
        });
    };
    App.prototype.render = function () {
        var _this = this;
        var _a = this.state, itemList = _a.itemList, item = _a.item;
        return (react_1["default"].createElement("div", { className: 'container' },
            react_1["default"].createElement(react_router_dom_1.BrowserRouter, null,
                react_1["default"].createElement("div", { className: 'app-header' },
                    react_1["default"].createElement(react_router_dom_1.Link, { to: '/', onClick: function () { return _this.setState({ redirect: '/' }); } }, "Home"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: '/changes' }, "New Changes"),
                    react_1["default"].createElement(react_router_dom_1.Link, { to: '/about' }, "About")),
                this.state.redirect && react_1["default"].createElement(react_router_dom_1.Redirect, { to: this.state.redirect }),
                react_1["default"].createElement(react_router_dom_1.Switch, null,
                    react_1["default"].createElement(react_router_dom_1.Route, { exact: true, path: '/' },
                        itemList === null &&
                            react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement("h4", { style: { marginBottom: 10 } }, "Loading Data..."),
                                react_1["default"].createElement(react_loading_1["default"], { type: 'spinningBubbles', color: '#2c3e50', width: 40, height: 40 })),
                        itemList && !itemList.length &&
                            react_1["default"].createElement("h3", { style: { color: '#d35400' } }, "No Items..."),
                        itemList && itemList.map(function (val, index) {
                            return react_1["default"].createElement(Item_1.Item, { key: index, item: val, onDelete: _this.deleteItem, onModify: _this.modifyItem });
                        }),
                        itemList !== null &&
                            react_1["default"].createElement("div", { className: 'app-add-item-button' },
                                react_1["default"].createElement(core_1.Button, { variant: 'contained', color: 'primary', onClick: function () { return _this.setState({ redirect: '/add-item' }); } }, "Add Item"))),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: '/add-item' },
                        react_1["default"].createElement(Item_1.ItemInput, { onSubmit: this.submitItemAdd })),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: '/edit-item' }, item && item._id
                        ? react_1["default"].createElement(Item_1.ItemInput, { item: item, onSubmit: this.updateItem })
                        : react_1["default"].createElement("h3", null, "No Item Selected to Edit")),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: '/changes' },
                        react_1["default"].createElement("div", { className: 'app-changelog' },
                            react_1["default"].createElement("h3", null, "Version 1.0.0 (Base Features)"),
                            react_1["default"].createElement("ul", null,
                                react_1["default"].createElement("li", null,
                                    "[x] Start the Project ",
                                    react_1["default"].createElement("span", { "aria-label": 'rocket', role: 'img' }, "\uD83D\uDE80")),
                                react_1["default"].createElement("li", null,
                                    "[x] Add ",
                                    react_1["default"].createElement("code", null, "material-ui")),
                                react_1["default"].createElement("li", null, "[x] Add Server Link to the README.md File, likewise other way"),
                                react_1["default"].createElement("li", null,
                                    "[x] Better Colors and Styles ",
                                    react_1["default"].createElement("strong", null, "UX"),
                                    react_1["default"].createElement("ul", null,
                                        react_1["default"].createElement("li", null,
                                            "Random Color Borders (",
                                            react_1["default"].createElement("em", null, "Store on Server per Creation"),
                                            ")"))),
                                react_1["default"].createElement("li", null,
                                    "[x] ",
                                    react_1["default"].createElement("span", { "aria-label": 'bug', role: 'img' }, "\uD83D\uDC1E"),
                                    " Fix ",
                                    react_1["default"].createElement("strong", null, "Add Item"),
                                    " Overlapping and not Staying on very Bottom")))),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: '/about' },
                        react_1["default"].createElement("strong", null, "About App"))))));
    };
    return App;
}(react_1["default"].Component));
exports["default"] = App;
