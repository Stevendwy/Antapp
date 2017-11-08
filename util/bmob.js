/* converted by appconverter    	      		  
   on Tuesday, November 7th, 2017, 4:14:24 PM
*/
(function (root) {
    var _ = require('./underscore.js');
    var Bmob = {};
    Bmob.VERSION = 'js0.0.1';
    Bmob._ = _;
    var EmptyConstructor = function () {
    };
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Bmob;
        }
        exports.Bmob = Bmob;
    } else {
        root.Bmob = Bmob;
    }
    var inherits = function (parent, protoProps, staticProps) {
        var child;
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                parent.apply(this, arguments);
            };
        }
        Bmob._.extend(child, parent);
        EmptyConstructor.prototype = parent.prototype;
        child.prototype = new EmptyConstructor();
        if (protoProps) {
            Bmob._.extend(child.prototype, protoProps);
        }
        if (staticProps) {
            Bmob._.extend(child, staticProps);
        }
        child.prototype.constructor = child;
        child.__super__ = parent.prototype;
        return child;
    };
    Bmob.serverURL = 'https://api.bmob.cn';
    Bmob.fileURL = 'http://file.bmob.cn';
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        Bmob._isNode = true;
    }
    Bmob.initialize = function (applicationId, applicationKey, masterKey) {
        Bmob._initialize(applicationId, applicationKey, masterKey);
    };
    Bmob._initialize = function (applicationId, applicationKey, masterKey) {
        Bmob.applicationId = applicationId;
        Bmob.applicationKey = applicationKey;
        Bmob.masterKey = masterKey;
        Bmob._useMasterKey = true;
    };
    if (Bmob._isNode) {
        Bmob.initialize = Bmob._initialize;
    }
    Bmob._getBmobPath = function (path) {
        if (!Bmob.applicationId) {
            throw 'You need to call Bmob.initialize before using Bmob.';
        }
        if (!path) {
            path = '';
        }
        if (!Bmob._.isString(path)) {
            throw 'Tried to get a localStorage path that wasn\'t a String.';
        }
        if (path[0] === '/') {
            path = path.substring(1);
        }
        return 'Bmob/' + Bmob.applicationId + '/' + path;
    };
    Bmob._getBmobPath = function (path) {
        if (!Bmob.applicationId) {
            throw 'You need to call Bmob.initialize before using Bmob.';
        }
        if (!path) {
            path = '';
        }
        if (!Bmob._.isString(path)) {
            throw 'Tried to get a localStorage path that wasn\'t a String.';
        }
        if (path[0] === '/') {
            path = path.substring(1);
        }
        return 'Bmob/' + Bmob.applicationId + '/' + path;
    };
    Bmob._installationId = null;
    Bmob._getInstallationId = function () {
        if (Bmob._installationId) {
            return Bmob._installationId;
        }
        var path = Bmob._getBmobPath('installationId');
        wx.getStorage({
            key: 'key',
            success: function (res) {
                Bmob._installationId = res.data;
                console.log(res.data);
            }
        });
        if (!Bmob._installationId || Bmob._installationId === '') {
            var hexOctet = function () {
                return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
            };
            Bmob._installationId = hexOctet() + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + hexOctet() + hexOctet();
            wx.setStorage({
                key: path,
                data: Bmob._installationId
            });
        }
        return Bmob._installationId;
    };
    Bmob._parseDate = function (iso8601) {
        var regexp = new RegExp('^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})' + 'T' + '([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})' + '(.([0-9]+))?' + 'Z$');
        var match = regexp.exec(iso8601);
        if (!match) {
            return null;
        }
        var year = match[1] || 0;
        var month = (match[2] || 1) - 1;
        var day = match[3] || 0;
        var hour = match[4] || 0;
        var minute = match[5] || 0;
        var second = match[6] || 0;
        var milli = match[8] || 0;
        return new Date(Date.UTC(year, month, day, hour, minute, second, milli));
    };
    Bmob._ajax = function (method, url, data, success, error) {
        var options = {
            success: success,
            error: error
        };
        var promise = new Bmob.Promise();
        var dataObject = JSON.parse(data);
        var error;
        wx.showNavigationBarLoading();
        if (dataObject.category == 'wechatApp') {
            wx.uploadFile({
                url: url,
                filePath: dataObject.base64,
                name: 'file',
                header: { 'X-Bmob-SDK-Type': 'wechatApp' },
                formData: dataObject,
                success: function (res) {
                    console.log(res);
                    var data = JSON.parse(res.data);
                    promise.resolve(data, res.statusCode, res);
                    wx.hideNavigationBarLoading();
                },
                fail: function (e) {
                    console.log(e);
                    promise.reject(e);
                    wx.hideNavigationBarLoading();
                }
            });
        } else {
            wx.request({
                method: method,
                url: url,
                data: data,
                header: { 'content-type': 'text/plain' },
                success: function (res) {
                    if (res.data && res.data.code) {
                        promise.reject(res);
                    } else if (res.statusCode != 200) {
                        promise.reject(res);
                    } else {
                        promise.resolve(res.data, res.statusCode, res);
                    }
                    wx.hideNavigationBarLoading();
                },
                fail: function (e) {
                    promise.reject(e);
                    wx.hideNavigationBarLoading();
                }
            });
        }
        if (error) {
            return Bmob.Promise.error(error);
        }
        return promise._thenRunCallbacks(options);
    };
    Bmob._extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };
    Bmob._request = function (route, className, objectId, method, dataObject) {
        if (!Bmob.applicationId) {
            throw 'You must specify your applicationId using Bmob.initialize';
        }
        if (!Bmob.applicationKey && !Bmob.masterKey) {
            throw 'You must specify a key using Bmob.initialize';
        }
        var url = Bmob.serverURL;
        if (url.charAt(url.length - 1) !== '/') {
            url += '/';
        }
        if (route.indexOf('2/') < 0) {
            url += '1/' + route;
        } else {
            url += route;
        }
        if (className) {
            url += '/' + className;
        }
        if (objectId) {
            url += '/' + objectId;
        }
        if ((route === 'users' || route === 'classes') && method === 'PUT' && dataObject._fetchWhenSave) {
            delete dataObject._fetchWhenSave;
            url += '?new=true';
        }
        dataObject = Bmob._.clone(dataObject || {});
        if (method !== 'POST') {
            dataObject._Method = method;
            method = 'POST';
        }
        dataObject._ApplicationId = Bmob.applicationId;
        dataObject._RestKey = Bmob.applicationKey;
        if (Bmob._useMasterKey && Bmob.masterKey != undefined) {
            dataObject._MasterKey = Bmob.masterKey;
        }
        dataObject._ClientVersion = Bmob.VERSION;
        dataObject._InstallationId = Bmob._getInstallationId();
        var currentUser = Bmob.User.current();
        if (currentUser && currentUser._sessionToken) {
            dataObject._SessionToken = currentUser._sessionToken;
        }
        var data = JSON.stringify(dataObject);
        return Bmob._ajax(method, url, data).then(null, function (response) {
            var error;
            try {
                if (response.data.code) {
                    error = new Bmob.Error(response.data.code, response.data.error);
                }
            } catch (e) {
            }
            error = error || new Bmob.Error(-1, response.data);
            return Bmob.Promise.error(error);
        });
    };
    Bmob._getValue = function (object, prop) {
        if (!(object && object[prop])) {
            return null;
        }
        return Bmob._.isFunction(object[prop]) ? object[prop]() : object[prop];
    };
    Bmob._encode = function (value, seenObjects, disallowObjects) {
        var _ = Bmob._;
        if (value instanceof Bmob.Object) {
            if (disallowObjects) {
                throw 'Bmob.Objects not allowed here';
            }
            if (!seenObjects || _.include(seenObjects, value) || !value._hasData) {
                return value._toPointer();
            }
            if (!value.dirty()) {
                seenObjects = seenObjects.concat(value);
                return Bmob._encode(value._toFullJSON(seenObjects), seenObjects, disallowObjects);
            }
            throw 'Tried to save an object with a pointer to a new, unsaved object.';
        }
        if (value instanceof Bmob.ACL) {
            return value.toJSON();
        }
        if (_.isDate(value)) {
            return {
                '__type': 'Date',
                'iso': value.toJSON()
            };
        }
        if (value instanceof Bmob.GeoPoint) {
            return value.toJSON();
        }
        if (_.isArray(value)) {
            return _.map(value, function (x) {
                return Bmob._encode(x, seenObjects, disallowObjects);
            });
        }
        if (_.isRegExp(value)) {
            return value.source;
        }
        if (value instanceof Bmob.Relation) {
            return value.toJSON();
        }
        if (value instanceof Bmob.Op) {
            return value.toJSON();
        }
        if (value instanceof Bmob.File) {
            if (!value.url()) {
                throw 'Tried to save an object containing an unsaved file.';
            }
            return {
                '__type': 'File',
                'cdn': value.cdn(),
                'filename': value.name(),
                'url': value.url()
            };
        }
        if (_.isObject(value)) {
            var output = {};
            Bmob._objectEach(value, function (v, k) {
                output[k] = Bmob._encode(v, seenObjects, disallowObjects);
            });
            return output;
        }
        return value;
    };
    Bmob._decode = function (key, value) {
        var _ = Bmob._;
        if (!_.isObject(value)) {
            return value;
        }
        if (_.isArray(value)) {
            Bmob._arrayEach(value, function (v, k) {
                value[k] = Bmob._decode(k, v);
            });
            return value;
        }
        if (value instanceof Bmob.Object) {
            return value;
        }
        if (value instanceof Bmob.File) {
            return value;
        }
        if (value instanceof Bmob.Op) {
            return value;
        }
        if (value.__op) {
            return Bmob.Op._decode(value);
        }
        if (value.__type === 'Pointer') {
            var className = value.className;
            var pointer = Bmob.Object._create(className);
            if (value.createdAt) {
                delete value.__type;
                delete value.className;
                pointer._finishFetch(value, true);
            } else {
                pointer._finishFetch({ objectId: value.objectId }, false);
            }
            return pointer;
        }
        if (value.__type === 'Object') {
            var className = value.className;
            delete value.__type;
            delete value.className;
            var object = Bmob.Object._create(className);
            object._finishFetch(value, true);
            return object;
        }
        if (value.__type === 'Date') {
            return value.iso;
        }
        if (value.__type === 'GeoPoint') {
            return new Bmob.GeoPoint({
                latitude: value.latitude,
                longitude: value.longitude
            });
        }
        if (key === 'ACL') {
            if (value instanceof Bmob.ACL) {
                return value;
            }
            return new Bmob.ACL(value);
        }
        if (value.__type === 'Relation') {
            var relation = new Bmob.Relation(null, key);
            relation.targetClassName = value.className;
            return relation;
        }
        if (value.__type === 'File') {
            if (value.url != undefined && value.url != null) {
                if (value.url.indexOf('http') >= 0) {
                    var file = {
                        '_name': value.filename,
                        '_url': value.url,
                        '_group': value.group
                    };
                } else {
                    var file = {
                        '_name': value.filename,
                        '_url': Bmob.fileURL + '/' + value.url,
                        '_group': value.group
                    };
                }
            } else {
                var file = {
                    '_name': value.filename,
                    '_url': value.url,
                    '_group': value.group
                };
            }
            return file;
        }
        Bmob._objectEach(value, function (v, k) {
            value[k] = Bmob._decode(k, v);
        });
        return value;
    };
    Bmob._arrayEach = Bmob._.each;
    Bmob._traverse = function (object, func, seen) {
        if (object instanceof Bmob.Object) {
            seen = seen || [];
            if (Bmob._.indexOf(seen, object) >= 0) {
                return;
            }
            seen.push(object);
            Bmob._traverse(object.attributes, func, seen);
            return func(object);
        }
        if (object instanceof Bmob.Relation || object instanceof Bmob.File) {
            return func(object);
        }
        if (Bmob._.isArray(object)) {
            Bmob._.each(object, function (child, index) {
                var newChild = Bmob._traverse(child, func, seen);
                if (newChild) {
                    object[index] = newChild;
                }
            });
            return func(object);
        }
        if (Bmob._.isObject(object)) {
            Bmob._each(object, function (child, key) {
                var newChild = Bmob._traverse(child, func, seen);
                if (newChild) {
                    object[key] = newChild;
                }
            });
            return func(object);
        }
        return func(object);
    };
    Bmob._objectEach = Bmob._each = function (obj, callback) {
        var _ = Bmob._;
        if (_.isObject(obj)) {
            _.each(_.keys(obj), function (key) {
                callback(obj[key], key);
            });
        } else {
            _.each(obj, callback);
        }
    };
    Bmob._isNullOrUndefined = function (x) {
        return Bmob._.isNull(x) || Bmob._.isUndefined(x);
    };
    Bmob.Error = function (code, message) {
        this.code = code;
        this.message = message;
    };
    _.extend(Bmob.Error, {
        OTHER_CAUSE: -1,
        OBJECT_NOT_FOUND: 101,
        INVALID_QUERY: 102,
        INVALID_CLASS_NAME: 103,
        RELATIONDOCNOTEXISTS: 104,
        INVALID_KEY_NAME: 105,
        INVALID_POINTER: 106,
        INVALID_JSON: 107,
        USERNAME_PASSWORD_REQUIRED: 108,
        INCORRECT_TYPE: 111,
        REQUEST_MUST_ARRAY: 112,
        REQUEST_MUST_OBJECT: 113,
        OBJECT_TOO_LARGE: 114,
        GEO_ERROR: 117,
        EMAIL_VERIFY_MUST_OPEN: 120,
        CACHE_MISS: 120,
        INVALID_DEVICE_TOKEN: 131,
        INVALID_INSTALLID: 132,
        INVALID_DEVICE_TYPE: 133,
        DEVICE_TOKEN_EXIST: 134,
        INSTALLID_EXIST: 135,
        DEVICE_TOKEN_NOT_FOR_ANDROID: 136,
        INVALID_INSTALL_OPERATE: 137,
        READ_ONLY: 138,
        INVALID_ROLE_NAME: 139,
        MISS_PUSH_DATA: 141,
        INVALID_PUSH_TIME: 142,
        INVALID_PUSH_EXPIRE: 143,
        PUSH_TIME_MUST_BEFORE_NOW: 144,
        FILE_SIZE_ERROR: 145,
        FILE_NAME_ERROR: 146,
        FILE_NAME_ERROR: 147,
        FILE_LEN_ERROR: 148,
        FILE_UPLOAD_ERROR: 150,
        FILE_DELETE_ERROR: 151,
        IMAGE_ERROR: 160,
        IMAGE_MODE_ERROR: 161,
        IMAGE_WIDTH_ERROR: 162,
        IMAGE_HEIGHT_ERROR: 163,
        IMAGE_LONGEDGE_ERROR: 164,
        IMAGE_SHORTEDGE_ERROR: 165,
        USER_MISSING: 201,
        USER_NAME_TOKEN: 202,
        EMAIL_EXIST: 203,
        NO_EMAIL: 204,
        NOT_FOUND_EMAIL: 205,
        SESSIONTOKEN_ERROR: 206,
        VALID_ERROR: 301
    });
    Bmob.Events = {
        on: function (events, callback, context) {
            var calls, event, node, tail, list;
            if (!callback) {
                return this;
            }
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});
            event = events.shift();
            while (event) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = {
                    tail: tail,
                    next: list ? list.next : node
                };
                event = events.shift();
            }
            return this;
        },
        off: function (events, callback, context) {
            var event, calls, node, tail, cb, ctx;
            if (!(calls = this._callbacks)) {
                return;
            }
            if (!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }
            events = events ? events.split(eventSplitter) : _.keys(calls);
            event = events.shift();
            while (event) {
                node = calls[event];
                delete calls[event];
                if (!node || !(callback || context)) {
                    continue;
                }
                tail = node.tail;
                node = node.next;
                while (node !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    if (callback && cb !== callback || context && ctx !== context) {
                        this.on(event, cb, ctx);
                    }
                    node = node.next;
                }
                event = events.shift();
            }
            return this;
        },
        trigger: function (events) {
            var event, node, calls, tail, args, all, rest;
            if (!(calls = this._callbacks)) {
                return this;
            }
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);
            event = events.shift();
            while (event) {
                node = calls[event];
                if (node) {
                    tail = node.tail;
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, rest);
                    }
                }
                node = all;
                if (node) {
                    tail = node.tail;
                    args = [event].concat(rest);
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
                event = events.shift();
            }
            return this;
        }
    };
    Bmob.Events.bind = Bmob.Events.on;
    Bmob.Events.unbind = Bmob.Events.off;
    Bmob.GeoPoint = function (arg1, arg2) {
        if (_.isArray(arg1)) {
            Bmob.GeoPoint._validate(arg1[0], arg1[1]);
            this.latitude = arg1[0];
            this.longitude = arg1[1];
        } else if (_.isObject(arg1)) {
            Bmob.GeoPoint._validate(arg1.latitude, arg1.longitude);
            this.latitude = arg1.latitude;
            this.longitude = arg1.longitude;
        } else if (_.isNumber(arg1) && _.isNumber(arg2)) {
            Bmob.GeoPoint._validate(arg1, arg2);
            this.latitude = arg1;
            this.longitude = arg2;
        } else {
            this.latitude = 0;
            this.longitude = 0;
        }
        var self = this;
        if (this.__defineGetter__ && this.__defineSetter__) {
            this._latitude = this.latitude;
            this._longitude = this.longitude;
            this.__defineGetter__('latitude', function () {
                return self._latitude;
            });
            this.__defineGetter__('longitude', function () {
                return self._longitude;
            });
            this.__defineSetter__('latitude', function (val) {
                Bmob.GeoPoint._validate(val, self.longitude);
                self._latitude = val;
            });
            this.__defineSetter__('longitude', function (val) {
                Bmob.GeoPoint._validate(self.latitude, val);
                self._longitude = val;
            });
        }
    };
    Bmob.GeoPoint._validate = function (latitude, longitude) {
        if (latitude < -90) {
            throw 'Bmob.GeoPoint latitude ' + latitude + ' < -90.0.';
        }
        if (latitude > 90) {
            throw 'Bmob.GeoPoint latitude ' + latitude + ' > 90.0.';
        }
        if (longitude < -180) {
            throw 'Bmob.GeoPoint longitude ' + longitude + ' < -180.0.';
        }
        if (longitude > 180) {
            throw 'Bmob.GeoPoint longitude ' + longitude + ' > 180.0.';
        }
    };
    Bmob.GeoPoint.current = function (options) {
        var promise = new Bmob.Promise();
        navigator.geolocation.getCurrentPosition(function (location) {
            promise.resolve(new Bmob.GeoPoint({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            }));
        }, function (error) {
            promise.reject(error);
        });
        return promise._thenRunCallbacks(options);
    };
    Bmob.GeoPoint.prototype = {
        toJSON: function () {
            Bmob.GeoPoint._validate(this.latitude, this.longitude);
            return {
                '__type': 'GeoPoint',
                latitude: this.latitude,
                longitude: this.longitude
            };
        },
        radiansTo: function (point) {
            var d2r = Math.PI / 180;
            var lat1rad = this.latitude * d2r;
            var long1rad = this.longitude * d2r;
            var lat2rad = point.latitude * d2r;
            var long2rad = point.longitude * d2r;
            var deltaLat = lat1rad - lat2rad;
            var deltaLong = long1rad - long2rad;
            var sinDeltaLatDiv2 = Math.sin(deltaLat / 2);
            var sinDeltaLongDiv2 = Math.sin(deltaLong / 2);
            var a = sinDeltaLatDiv2 * sinDeltaLatDiv2 + Math.cos(lat1rad) * Math.cos(lat2rad) * sinDeltaLongDiv2 * sinDeltaLongDiv2;
            a = Math.min(1, a);
            return 2 * Math.asin(Math.sqrt(a));
        },
        kilometersTo: function (point) {
            return this.radiansTo(point) * 6371;
        },
        milesTo: function (point) {
            return this.radiansTo(point) * 3958.8;
        }
    };
    var PUBLIC_KEY = '*';
    Bmob.ACL = function (arg1) {
        var self = this;
        self.permissionsById = {};
        if (_.isObject(arg1)) {
            if (arg1 instanceof Bmob.User) {
                self.setReadAccess(arg1, true);
                self.setWriteAccess(arg1, true);
            } else {
                if (_.isFunction(arg1)) {
                    throw 'Bmob.ACL() called with a function.  Did you forget ()?';
                }
                Bmob._objectEach(arg1, function (accessList, userId) {
                    if (!_.isString(userId)) {
                        throw 'Tried to create an ACL with an invalid userId.';
                    }
                    self.permissionsById[userId] = {};
                    Bmob._objectEach(accessList, function (allowed, permission) {
                        if (permission !== 'read' && permission !== 'write') {
                            throw 'Tried to create an ACL with an invalid permission type.';
                        }
                        if (!_.isBoolean(allowed)) {
                            throw 'Tried to create an ACL with an invalid permission value.';
                        }
                        self.permissionsById[userId][permission] = allowed;
                    });
                });
            }
        }
    };
    Bmob.ACL.prototype.toJSON = function () {
        return _.clone(this.permissionsById);
    };
    Bmob.ACL.prototype._setAccess = function (accessType, userId, allowed) {
        if (userId instanceof Bmob.User) {
            userId = userId.id;
        } else if (userId instanceof Bmob.Role) {
            userId = 'role:' + userId.getName();
        }
        if (!_.isString(userId)) {
            throw 'userId must be a string.';
        }
        if (!_.isBoolean(allowed)) {
            throw 'allowed must be either true or false.';
        }
        var permissions = this.permissionsById[userId];
        if (!permissions) {
            if (!allowed) {
                return;
            } else {
                permissions = {};
                this.permissionsById[userId] = permissions;
            }
        }
        if (allowed) {
            this.permissionsById[userId][accessType] = true;
        } else {
            delete permissions[accessType];
            if (_.isEmpty(permissions)) {
                delete permissions[userId];
            }
        }
    };
    Bmob.ACL.prototype._getAccess = function (accessType, userId) {
        if (userId instanceof Bmob.User) {
            userId = userId.id;
        } else if (userId instanceof Bmob.Role) {
            userId = 'role:' + userId.getName();
        }
        var permissions = this.permissionsById[userId];
        if (!permissions) {
            return false;
        }
        return permissions[accessType] ? true : false;
    };
    Bmob.ACL.prototype.setReadAccess = function (userId, allowed) {
        this._setAccess('read', userId, allowed);
    };
    Bmob.ACL.prototype.getReadAccess = function (userId) {
        return this._getAccess('read', userId);
    };
    Bmob.ACL.prototype.setWriteAccess = function (userId, allowed) {
        this._setAccess('write', userId, allowed);
    };
    Bmob.ACL.prototype.getWriteAccess = function (userId) {
        return this._getAccess('write', userId);
    };
    Bmob.ACL.prototype.setPublicReadAccess = function (allowed) {
        this.setReadAccess(PUBLIC_KEY, allowed);
    };
    Bmob.ACL.prototype.getPublicReadAccess = function () {
        return this.getReadAccess(PUBLIC_KEY);
    };
    Bmob.ACL.prototype.setPublicWriteAccess = function (allowed) {
        this.setWriteAccess(PUBLIC_KEY, allowed);
    };
    Bmob.ACL.prototype.getPublicWriteAccess = function () {
        return this.getWriteAccess(PUBLIC_KEY);
    };
    Bmob.ACL.prototype.getRoleReadAccess = function (role) {
        if (role instanceof Bmob.Role) {
            role = role.getName();
        }
        if (_.isString(role)) {
            return this.getReadAccess('role:' + role);
        }
        throw 'role must be a Bmob.Role or a String';
    };
    Bmob.ACL.prototype.getRoleWriteAccess = function (role) {
        if (role instanceof Bmob.Role) {
            role = role.getName();
        }
        if (_.isString(role)) {
            return this.getWriteAccess('role:' + role);
        }
        throw 'role must be a Bmob.Role or a String';
    };
    Bmob.ACL.prototype.setRoleReadAccess = function (role, allowed) {
        if (role instanceof Bmob.Role) {
            role = role.getName();
        }
        if (_.isString(role)) {
            this.setReadAccess('role:' + role, allowed);
            return;
        }
        throw 'role must be a Bmob.Role or a String';
    };
    Bmob.ACL.prototype.setRoleWriteAccess = function (role, allowed) {
        if (role instanceof Bmob.Role) {
            role = role.getName();
        }
        if (_.isString(role)) {
            this.setWriteAccess('role:' + role, allowed);
            return;
        }
        throw 'role must be a Bmob.Role or a String';
    };
    Bmob.Op = function () {
        this._initialize.apply(this, arguments);
    };
    Bmob.Op.prototype = {
        _initialize: function () {
        }
    };
    _.extend(Bmob.Op, {
        _extend: Bmob._extend,
        _opDecoderMap: {},
        _registerDecoder: function (opName, decoder) {
            Bmob.Op._opDecoderMap[opName] = decoder;
        },
        _decode: function (json) {
            var decoder = Bmob.Op._opDecoderMap[json.__op];
            if (decoder) {
                return decoder(json);
            } else {
                return undefined;
            }
        }
    });
    Bmob.Op._registerDecoder('Batch', function (json) {
        var op = null;
        Bmob._arrayEach(json.ops, function (nextOp) {
            nextOp = Bmob.Op._decode(nextOp);
            op = nextOp._mergeWithPrevious(op);
        });
        return op;
    });
    Bmob.Op.Set = Bmob.Op._extend({
        _initialize: function (value) {
            this._value = value;
        },
        value: function () {
            return this._value;
        },
        toJSON: function () {
            return Bmob._encode(this.value());
        },
        _mergeWithPrevious: function (previous) {
            return this;
        },
        _estimate: function (oldValue) {
            return this.value();
        }
    });
    Bmob.Op._UNSET = {};
    Bmob.Op.Unset = Bmob.Op._extend({
        toJSON: function () {
            return { __op: 'Delete' };
        },
        _mergeWithPrevious: function (previous) {
            return this;
        },
        _estimate: function (oldValue) {
            return Bmob.Op._UNSET;
        }
    });
    Bmob.Op._registerDecoder('Delete', function (json) {
        return new Bmob.Op.Unset();
    });
    Bmob.Op.Increment = Bmob.Op._extend({
        _initialize: function (amount) {
            this._amount = amount;
        },
        amount: function () {
            return this._amount;
        },
        toJSON: function () {
            return {
                __op: 'Increment',
                amount: this._amount
            };
        },
        _mergeWithPrevious: function (previous) {
            if (!previous) {
                return this;
            } else if (previous instanceof Bmob.Op.Unset) {
                return new Bmob.Op.Set(this.amount());
            } else if (previous instanceof Bmob.Op.Set) {
                return new Bmob.Op.Set(previous.value() + this.amount());
            } else if (previous instanceof Bmob.Op.Increment) {
                return new Bmob.Op.Increment(this.amount() + previous.amount());
            } else {
                throw 'Op is invalid after previous op.';
            }
        },
        _estimate: function (oldValue) {
            if (!oldValue) {
                return this.amount();
            }
            return oldValue + this.amount();
        }
    });
    Bmob.Op._registerDecoder('Increment', function (json) {
        return new Bmob.Op.Increment(json.amount);
    });
    Bmob.Op.Add = Bmob.Op._extend({
        _initialize: function (objects) {
            this._objects = objects;
        },
        objects: function () {
            return this._objects;
        },
        toJSON: function () {
            return {
                __op: 'Add',
                objects: Bmob._encode(this.objects())
            };
        },
        _mergeWithPrevious: function (previous) {
            if (!previous) {
                return this;
            } else if (previous instanceof Bmob.Op.Unset) {
                return new Bmob.Op.Set(this.objects());
            } else if (previous instanceof Bmob.Op.Set) {
                return new Bmob.Op.Set(this._estimate(previous.value()));
            } else if (previous instanceof Bmob.Op.Add) {
                return new Bmob.Op.Add(previous.objects().concat(this.objects()));
            } else {
                throw 'Op is invalid after previous op.';
            }
        },
        _estimate: function (oldValue) {
            if (!oldValue) {
                return _.clone(this.objects());
            } else {
                return oldValue.concat(this.objects());
            }
        }
    });
    Bmob.Op._registerDecoder('Add', function (json) {
        return new Bmob.Op.Add(Bmob._decode(undefined, json.objects));
    });
    Bmob.Op.AddUnique = Bmob.Op._extend({
        _initialize: function (objects) {
            this._objects = _.uniq(objects);
        },
        objects: function () {
            return this._objects;
        },
        toJSON: function () {
            return {
                __op: 'AddUnique',
                objects: Bmob._encode(this.objects())
            };
        },
        _mergeWithPrevious: function (previous) {
            if (!previous) {
                return this;
            } else if (previous instanceof Bmob.Op.Unset) {
                return new Bmob.Op.Set(this.objects());
            } else if (previous instanceof Bmob.Op.Set) {
                return new Bmob.Op.Set(this._estimate(previous.value()));
            } else if (previous instanceof Bmob.Op.AddUnique) {
                return new Bmob.Op.AddUnique(this._estimate(previous.objects()));
            } else {
                throw 'Op is invalid after previous op.';
            }
        },
        _estimate: function (oldValue) {
            if (!oldValue) {
                return _.clone(this.objects());
            } else {
                var newValue = _.clone(oldValue);
                Bmob._arrayEach(this.objects(), function (obj) {
                    if (obj instanceof Bmob.Object && obj.id) {
                        var matchingObj = _.find(newValue, function (anObj) {
                            return anObj instanceof Bmob.Object && anObj.id === obj.id;
                        });
                        if (!matchingObj) {
                            newValue.push(obj);
                        } else {
                            var index = _.indexOf(newValue, matchingObj);
                            newValue[index] = obj;
                        }
                    } else if (!_.contains(newValue, obj)) {
                        newValue.push(obj);
                    }
                });
                return newValue;
            }
        }
    });
    Bmob.Op._registerDecoder('AddUnique', function (json) {
        return new Bmob.Op.AddUnique(Bmob._decode(undefined, json.objects));
    });
    Bmob.Op.Remove = Bmob.Op._extend({
        _initialize: function (objects) {
            this._objects = _.uniq(objects);
        },
        objects: function () {
            return this._objects;
        },
        toJSON: function () {
            return {
                __op: 'Remove',
                objects: Bmob._encode(this.objects())
            };
        },
        _mergeWithPrevious: function (previous) {
            if (!previous) {
                return this;
            } else if (previous instanceof Bmob.Op.Unset) {
                return previous;
            } else if (previous instanceof Bmob.Op.Set) {
                return new Bmob.Op.Set(this._estimate(previous.value()));
            } else if (previous instanceof Bmob.Op.Remove) {
                return new Bmob.Op.Remove(_.union(previous.objects(), this.objects()));
            } else {
                throw 'Op is invalid after previous op.';
            }
        },
        _estimate: function (oldValue) {
            if (!oldValue) {
                return [];
            } else {
                var newValue = _.difference(oldValue, this.objects());
                Bmob._arrayEach(this.objects(), function (obj) {
                    if (obj instanceof Bmob.Object && obj.id) {
                        newValue = _.reject(newValue, function (other) {
                            return other instanceof Bmob.Object && other.id === obj.id;
                        });
                    }
                });
                return newValue;
            }
        }
    });
    Bmob.Op._registerDecoder('Remove', function (json) {
        return new Bmob.Op.Remove(Bmob._decode(undefined, json.objects));
    });
    Bmob.Op.Relation = Bmob.Op._extend({
        _initialize: function (adds, removes) {
            this._targetClassName = null;
            var self = this;
            var pointerToId = function (object) {
                if (object instanceof Bmob.Object) {
                    if (!object.id) {
                        throw 'You can\'t add an unsaved Bmob.Object to a relation.';
                    }
                    if (!self._targetClassName) {
                        self._targetClassName = object.className;
                    }
                    if (self._targetClassName !== object.className) {
                        throw 'Tried to create a Bmob.Relation with 2 different types: ' + self._targetClassName + ' and ' + object.className + '.';
                    }
                    return object.id;
                }
                return object;
            };
            this.relationsToAdd = _.uniq(_.map(adds, pointerToId));
            this.relationsToRemove = _.uniq(_.map(removes, pointerToId));
        },
        added: function () {
            var self = this;
            return _.map(this.relationsToAdd, function (objectId) {
                var object = Bmob.Object._create(self._targetClassName);
                object.id = objectId;
                return object;
            });
        },
        removed: function () {
            var self = this;
            return _.map(this.relationsToRemove, function (objectId) {
                var object = Bmob.Object._create(self._targetClassName);
                object.id = objectId;
                return object;
            });
        },
        toJSON: function () {
            var adds = null;
            var removes = null;
            var self = this;
            var idToPointer = function (id) {
                return {
                    __type: 'Pointer',
                    className: self._targetClassName,
                    objectId: id
                };
            };
            var pointers = null;
            if (this.relationsToAdd.length > 0) {
                pointers = _.map(this.relationsToAdd, idToPointer);
                adds = {
                    '__op': 'AddRelation',
                    'objects': pointers
                };
            }
            if (this.relationsToRemove.length > 0) {
                pointers = _.map(this.relationsToRemove, idToPointer);
                removes = {
                    '__op': 'RemoveRelation',
                    'objects': pointers
                };
            }
            if (adds && removes) {
                return {
                    '__op': 'Batch',
                    'ops': [
                        adds,
                        removes
                    ]
                };
            }
            return adds || removes || {};
        },
        _mergeWithPrevious: function (previous) {
            if (!previous) {
                return this;
            } else if (previous instanceof Bmob.Op.Unset) {
                throw 'You can\'t modify a relation after deleting it.';
            } else if (previous instanceof Bmob.Op.Relation) {
                if (previous._targetClassName && previous._targetClassName !== this._targetClassName) {
                    throw 'Related object must be of class ' + previous._targetClassName + ', but ' + this._targetClassName + ' was passed in.';
                }
                var newAdd = _.union(_.difference(previous.relationsToAdd, this.relationsToRemove), this.relationsToAdd);
                var newRemove = _.union(_.difference(previous.relationsToRemove, this.relationsToAdd), this.relationsToRemove);
                var newRelation = new Bmob.Op.Relation(newAdd, newRemove);
                newRelation._targetClassName = this._targetClassName;
                return newRelation;
            } else {
                throw 'Op is invalid after previous op.';
            }
        },
        _estimate: function (oldValue, object, key) {
            if (!oldValue) {
                var relation = new Bmob.Relation(object, key);
                relation.targetClassName = this._targetClassName;
            } else if (oldValue instanceof Bmob.Relation) {
                if (this._targetClassName) {
                    if (oldValue.targetClassName) {
                        if (oldValue.targetClassName !== this._targetClassName) {
                            throw 'Related object must be a ' + oldValue.targetClassName + ', but a ' + this._targetClassName + ' was passed in.';
                        }
                    } else {
                        oldValue.targetClassName = this._targetClassName;
                    }
                }
                return oldValue;
            } else {
                throw 'Op is invalid after previous op.';
            }
        }
    });
    Bmob.Op._registerDecoder('AddRelation', function (json) {
        return new Bmob.Op.Relation(Bmob._decode(undefined, json.objects), []);
    });
    Bmob.Op._registerDecoder('RemoveRelation', function (json) {
        return new Bmob.Op.Relation([], Bmob._decode(undefined, json.objects));
    });
    Bmob.Relation = function (parent, key) {
        this.parent = parent;
        this.key = key;
        this.targetClassName = null;
    };
    Bmob.Relation.reverseQuery = function (parentClass, relationKey, child) {
        var query = new Bmob.Query(parentClass);
        query.equalTo(relationKey, child._toPointer());
        return query;
    };
    Bmob.Relation.prototype = {
        _ensureParentAndKey: function (parent, key) {
            this.parent = this.parent || parent;
            this.key = this.key || key;
            if (this.parent !== parent) {
                throw 'Internal Error. Relation retrieved from two different Objects.';
            }
            if (this.key !== key) {
                throw 'Internal Error. Relation retrieved from two different keys.';
            }
        },
        add: function (objects) {
            if (!_.isArray(objects)) {
                objects = [objects];
            }
            var change = new Bmob.Op.Relation(objects, []);
            this.parent.set(this.key, change);
            this.targetClassName = change._targetClassName;
        },
        remove: function (objects) {
            if (!_.isArray(objects)) {
                objects = [objects];
            }
            var change = new Bmob.Op.Relation([], objects);
            this.parent.set(this.key, change);
            this.targetClassName = change._targetClassName;
        },
        toJSON: function () {
            return {
                '__type': 'Relation',
                'className': this.targetClassName
            };
        },
        query: function () {
            var targetClass;
            var query;
            if (!this.targetClassName) {
                targetClass = Bmob.Object._getSubclass(this.parent.className);
                query = new Bmob.Query(targetClass);
                query._extraOptions.redirectClassNameForKey = this.key;
            } else {
                targetClass = Bmob.Object._getSubclass(this.targetClassName);
                query = new Bmob.Query(targetClass);
            }
            query._addCondition('$relatedTo', 'object', this.parent._toPointer());
            query._addCondition('$relatedTo', 'key', this.key);
            return query;
        }
    };
    Bmob.Promise = function () {
        this._resolved = false;
        this._rejected = false;
        this._resolvedCallbacks = [];
        this._rejectedCallbacks = [];
    };
    _.extend(Bmob.Promise, {
        is: function (promise) {
            return promise && promise.then && _.isFunction(promise.then);
        },
        as: function () {
            var promise = new Bmob.Promise();
            promise.resolve.apply(promise, arguments);
            return promise;
        },
        error: function () {
            var promise = new Bmob.Promise();
            promise.reject.apply(promise, arguments);
            return promise;
        },
        when: function (promises) {
            var objects;
            if (promises && Bmob._isNullOrUndefined(promises.length)) {
                objects = arguments;
            } else {
                objects = promises;
            }
            var total = objects.length;
            var hadError = false;
            var results = [];
            var errors = [];
            results.length = objects.length;
            errors.length = objects.length;
            if (total === 0) {
                return Bmob.Promise.as.apply(this, results);
            }
            var promise = new Bmob.Promise();
            var resolveOne = function () {
                total = total - 1;
                if (total === 0) {
                    if (hadError) {
                        promise.reject(errors);
                    } else {
                        promise.resolve.apply(promise, results);
                    }
                }
            };
            Bmob._arrayEach(objects, function (object, i) {
                if (Bmob.Promise.is(object)) {
                    object.then(function (result) {
                        results[i] = result;
                        resolveOne();
                    }, function (error) {
                        errors[i] = error;
                        hadError = true;
                        resolveOne();
                    });
                } else {
                    results[i] = object;
                    resolveOne();
                }
            });
            return promise;
        },
        _continueWhile: function (predicate, asyncFunction) {
            if (predicate()) {
                return asyncFunction().then(function () {
                    return Bmob.Promise._continueWhile(predicate, asyncFunction);
                });
            }
            return Bmob.Promise.as();
        }
    });
    _.extend(Bmob.Promise.prototype, {
        resolve: function (result) {
            if (this._resolved || this._rejected) {
                throw 'A promise was resolved even though it had already been ' + (this._resolved ? 'resolved' : 'rejected') + '.';
            }
            this._resolved = true;
            this._result = arguments;
            var results = arguments;
            Bmob._arrayEach(this._resolvedCallbacks, function (resolvedCallback) {
                resolvedCallback.apply(this, results);
            });
            this._resolvedCallbacks = [];
            this._rejectedCallbacks = [];
        },
        reject: function (error) {
            if (this._resolved || this._rejected) {
                throw 'A promise was rejected even though it had already been ' + (this._resolved ? 'resolved' : 'rejected') + '.';
            }
            this._rejected = true;
            this._error = error;
            Bmob._arrayEach(this._rejectedCallbacks, function (rejectedCallback) {
                rejectedCallback(error);
            });
            this._resolvedCallbacks = [];
            this._rejectedCallbacks = [];
        },
        then: function (resolvedCallback, rejectedCallback) {
            var promise = new Bmob.Promise();
            var wrappedResolvedCallback = function () {
                var result = arguments;
                if (resolvedCallback) {
                    result = [resolvedCallback.apply(this, result)];
                }
                if (result.length === 1 && Bmob.Promise.is(result[0])) {
                    result[0].then(function () {
                        promise.resolve.apply(promise, arguments);
                    }, function (error) {
                        promise.reject(error);
                    });
                } else {
                    promise.resolve.apply(promise, result);
                }
            };
            var wrappedRejectedCallback = function (error) {
                var result = [];
                if (rejectedCallback) {
                    result = [rejectedCallback(error)];
                    if (result.length === 1 && Bmob.Promise.is(result[0])) {
                        result[0].then(function () {
                            promise.resolve.apply(promise, arguments);
                        }, function (error) {
                            promise.reject(error);
                        });
                    } else {
                        promise.reject(result[0]);
                    }
                } else {
                    promise.reject(error);
                }
            };
            if (this._resolved) {
                wrappedResolvedCallback.apply(this, this._result);
            } else if (this._rejected) {
                wrappedRejectedCallback(this._error);
            } else {
                this._resolvedCallbacks.push(wrappedResolvedCallback);
                this._rejectedCallbacks.push(wrappedRejectedCallback);
            }
            return promise;
        },
        _thenRunCallbacks: function (optionsOrCallback, model) {
            var options;
            if (_.isFunction(optionsOrCallback)) {
                var callback = optionsOrCallback;
                options = {
                    success: function (result) {
                        callback(result, null);
                    },
                    error: function (error) {
                        callback(null, error);
                    }
                };
            } else {
                options = _.clone(optionsOrCallback);
            }
            options = options || {};
            return this.then(function (result) {
                if (options.success) {
                    options.success.apply(this, arguments);
                } else if (model) {
                    model.trigger('sync', model, result, options);
                }
                return Bmob.Promise.as.apply(Bmob.Promise, arguments);
            }, function (error) {
                if (options.error) {
                    if (!_.isUndefined(model)) {
                        options.error(model, error);
                    } else {
                        options.error(error);
                    }
                } else if (model) {
                    model.trigger('error', model, error, options);
                }
                return Bmob.Promise.error(error);
            });
        },
        _continueWith: function (continuation) {
            return this.then(function () {
                return continuation(arguments, null);
            }, function (error) {
                return continuation(null, error);
            });
        }
    });
    var b64Digit = function (number) {
        if (number < 26) {
            return String.fromCharCode(65 + number);
        }
        if (number < 52) {
            return String.fromCharCode(97 + (number - 26));
        }
        if (number < 62) {
            return String.fromCharCode(48 + (number - 52));
        }
        if (number === 62) {
            return '+';
        }
        if (number === 63) {
            return '/';
        }
        throw 'Tried to encode large digit ' + number + ' in base64.';
    };
    var encodeBase64 = function (str) {
        var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = '';
        while (i < len) {
            c1 = str.charCodeAt(i++) & 255;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 3) << 4);
                out += '==';
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
                out += base64EncodeChars.charAt((c2 & 15) << 2);
                out += '=';
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 3) << 4 | (c2 & 240) >> 4);
            out += base64EncodeChars.charAt((c2 & 15) << 2 | (c3 & 192) >> 6);
            out += base64EncodeChars.charAt(c3 & 63);
        }
        return out;
    };
    var utf16to8 = function (str) {
        var out, i, len, c;
        out = '';
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if (c >= 1 && c <= 127) {
                out += str.charAt(i);
            } else if (c > 2047) {
                out += String.fromCharCode(224 | c >> 12 & 15);
                out += String.fromCharCode(128 | c >> 6 & 63);
                out += String.fromCharCode(128 | c >> 0 & 63);
            } else {
                out += String.fromCharCode(192 | c >> 6 & 31);
                out += String.fromCharCode(128 | c >> 0 & 63);
            }
        }
        return out;
    };
    var mimeTypes = {
        ai: 'application/postscript',
        aif: 'audio/x-aiff',
        aifc: 'audio/x-aiff',
        aiff: 'audio/x-aiff',
        asc: 'text/plain',
        atom: 'application/atom+xml',
        au: 'audio/basic',
        avi: 'video/x-msvideo',
        bcpio: 'application/x-bcpio',
        bin: 'application/octet-stream',
        bmp: 'image/bmp',
        cdf: 'application/x-netcdf',
        cgm: 'image/cgm',
        'class': 'application/octet-stream',
        cpio: 'application/x-cpio',
        cpt: 'application/mac-compactpro',
        csh: 'application/x-csh',
        css: 'text/css',
        dcr: 'application/x-director',
        dif: 'video/x-dv',
        dir: 'application/x-director',
        djv: 'image/vnd.djvu',
        djvu: 'image/vnd.djvu',
        dll: 'application/octet-stream',
        dmg: 'application/octet-stream',
        dms: 'application/octet-stream',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.' + 'document',
        dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.' + 'template',
        docm: 'application/vnd.ms-word.document.macroEnabled.12',
        dotm: 'application/vnd.ms-word.template.macroEnabled.12',
        dtd: 'application/xml-dtd',
        dv: 'video/x-dv',
        dvi: 'application/x-dvi',
        dxr: 'application/x-director',
        eps: 'application/postscript',
        etx: 'text/x-setext',
        exe: 'application/octet-stream',
        ez: 'application/andrew-inset',
        gif: 'image/gif',
        gram: 'application/srgs',
        grxml: 'application/srgs+xml',
        gtar: 'application/x-gtar',
        hdf: 'application/x-hdf',
        hqx: 'application/mac-binhex40',
        htm: 'text/html',
        html: 'text/html',
        ice: 'x-conference/x-cooltalk',
        ico: 'image/x-icon',
        ics: 'text/calendar',
        ief: 'image/ief',
        ifb: 'text/calendar',
        iges: 'model/iges',
        igs: 'model/iges',
        jnlp: 'application/x-java-jnlp-file',
        jp2: 'image/jp2',
        jpe: 'image/jpeg',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        js: 'application/x-javascript',
        kar: 'audio/midi',
        latex: 'application/x-latex',
        lha: 'application/octet-stream',
        lzh: 'application/octet-stream',
        m3u: 'audio/x-mpegurl',
        m4a: 'audio/mp4a-latm',
        m4b: 'audio/mp4a-latm',
        m4p: 'audio/mp4a-latm',
        m4u: 'video/vnd.mpegurl',
        m4v: 'video/x-m4v',
        mac: 'image/x-macpaint',
        man: 'application/x-troff-man',
        mathml: 'application/mathml+xml',
        me: 'application/x-troff-me',
        mesh: 'model/mesh',
        mid: 'audio/midi',
        midi: 'audio/midi',
        mif: 'application/vnd.mif',
        mov: 'video/quicktime',
        movie: 'video/x-sgi-movie',
        mp2: 'audio/mpeg',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        mpe: 'video/mpeg',
        mpeg: 'video/mpeg',
        mpg: 'video/mpeg',
        mpga: 'audio/mpeg',
        ms: 'application/x-troff-ms',
        msh: 'model/mesh',
        mxu: 'video/vnd.mpegurl',
        nc: 'application/x-netcdf',
        oda: 'application/oda',
        ogg: 'application/ogg',
        pbm: 'image/x-portable-bitmap',
        pct: 'image/pict',
        pdb: 'chemical/x-pdb',
        pdf: 'application/pdf',
        pgm: 'image/x-portable-graymap',
        pgn: 'application/x-chess-pgn',
        pic: 'image/pict',
        pict: 'image/pict',
        png: 'image/png',
        pnm: 'image/x-portable-anymap',
        pnt: 'image/x-macpaint',
        pntg: 'image/x-macpaint',
        ppm: 'image/x-portable-pixmap',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.' + 'presentation',
        potx: 'application/vnd.openxmlformats-officedocument.presentationml.' + 'template',
        ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.' + 'slideshow',
        ppam: 'application/vnd.ms-powerpoint.addin.macroEnabled.12',
        pptm: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        potm: 'application/vnd.ms-powerpoint.template.macroEnabled.12',
        ppsm: 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
        ps: 'application/postscript',
        qt: 'video/quicktime',
        qti: 'image/x-quicktime',
        qtif: 'image/x-quicktime',
        ra: 'audio/x-pn-realaudio',
        ram: 'audio/x-pn-realaudio',
        ras: 'image/x-cmu-raster',
        rdf: 'application/rdf+xml',
        rgb: 'image/x-rgb',
        rm: 'application/vnd.rn-realmedia',
        roff: 'application/x-troff',
        rtf: 'text/rtf',
        rtx: 'text/richtext',
        sgm: 'text/sgml',
        sgml: 'text/sgml',
        sh: 'application/x-sh',
        shar: 'application/x-shar',
        silo: 'model/mesh',
        sit: 'application/x-stuffit',
        skd: 'application/x-koan',
        skm: 'application/x-koan',
        skp: 'application/x-koan',
        skt: 'application/x-koan',
        smi: 'application/smil',
        smil: 'application/smil',
        snd: 'audio/basic',
        so: 'application/octet-stream',
        spl: 'application/x-futuresplash',
        src: 'application/x-wais-source',
        sv4cpio: 'application/x-sv4cpio',
        sv4crc: 'application/x-sv4crc',
        svg: 'image/svg+xml',
        swf: 'application/x-shockwave-flash',
        t: 'application/x-troff',
        tar: 'application/x-tar',
        tcl: 'application/x-tcl',
        tex: 'application/x-tex',
        texi: 'application/x-texinfo',
        texinfo: 'application/x-texinfo',
        tif: 'image/tiff',
        tiff: 'image/tiff',
        tr: 'application/x-troff',
        tsv: 'text/tab-separated-values',
        txt: 'text/plain',
        ustar: 'application/x-ustar',
        vcd: 'application/x-cdlink',
        vrml: 'model/vrml',
        vxml: 'application/voicexml+xml',
        wav: 'audio/x-wav',
        wbmp: 'image/vnd.wap.wbmp',
        wbmxl: 'application/vnd.wap.wbxml',
        wml: 'text/vnd.wap.wml',
        wmlc: 'application/vnd.wap.wmlc',
        wmls: 'text/vnd.wap.wmlscript',
        wmlsc: 'application/vnd.wap.wmlscriptc',
        wrl: 'model/vrml',
        xbm: 'image/x-xbitmap',
        xht: 'application/xhtml+xml',
        xhtml: 'application/xhtml+xml',
        xls: 'application/vnd.ms-excel',
        xml: 'application/xml',
        xpm: 'image/x-xpixmap',
        xsl: 'application/xml',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.' + 'template',
        xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        xltm: 'application/vnd.ms-excel.template.macroEnabled.12',
        xlam: 'application/vnd.ms-excel.addin.macroEnabled.12',
        xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        xslt: 'application/xslt+xml',
        xul: 'application/vnd.mozilla.xul+xml',
        xwd: 'image/x-xwindowdump',
        xyz: 'chemical/x-xyz',
        zip: 'application/zip'
    };
    var readAsync = function (file, type) {
        var promise = new Bmob.Promise();
        if (typeof FileReader === 'undefined') {
            return Bmob.Promise.error(new Bmob.Error(-1, 'Attempted to use a FileReader on an unsupported browser.'));
        }
        var reader = new FileReader();
        reader.onloadend = function () {
            promise.resolve(reader.result);
        };
        reader.readAsBinaryString(file);
        return promise;
    };
    Bmob.File = function (name, data, type) {
        data = data[0];
        this._name = name;
        var currentUser = Bmob.User.current();
        this._metaData = { owner: currentUser != null ? currentUser.id : 'unknown' };
        var extension = /\.([^.]*)$/.exec(name);
        if (extension) {
            extension = extension[1].toLowerCase();
        }
        var guessedType = type || mimeTypes[extension] || 'text/plain';
        this._guessedType = guessedType;
        if (typeof File !== 'undefined' && data instanceof File) {
            this._source = readAsync(data, type);
        } else {
            this._source = Bmob.Promise.as(data, guessedType);
            this._metaData.size = data.length;
        }
    };
    Bmob.File.prototype = {
        name: function () {
            return this._name;
        },
        setName: function (name) {
            this._name = name;
        },
        url: function () {
            return this._url;
        },
        setUrl: function (url) {
            this._url = url;
        },
        cdn: function () {
            return this._cdn;
        },
        metaData: function (attr, value) {
            if (attr != null && value != null) {
                this._metaData[attr] = value;
                return this;
            } else if (attr != null) {
                return this._metaData[attr];
            } else {
                return this._metaData;
            }
        },
        destroy: function (options) {
            if (!this._url && !this._cdn)
                return Bmob.Promise.error('The file url and cdn is not eixsts.')._thenRunCallbacks(options);
            var data = {
                cdn: this._cdn,
                _ContentType: 'application/json',
                url: this._url,
                metaData: self._metaData
            };
            var request = Bmob._request('2/files', null, null, 'DELETE', data);
            return request._thenRunCallbacks(options);
        },
        save: function (options) {
            var self = this;
            if (!self._previousSave) {
                if (self._source) {
                    self._previousSave = self._source.then(function (base64, type) {
                        var data = {
                            base64: base64,
                            _ContentType: 'text/plain',
                            mime_type: 'text/plain',
                            metaData: self._metaData,
                            category: 'wechatApp'
                        };
                        if (!self._metaData.size) {
                            self._metaData.size = base64.length;
                        }
                        return Bmob._request('2/files', self._name, null, 'POST', data);
                    }).then(function (response) {
                        self._name = response.filename;
                        self._url = response.url;
                        self._cdn = response.cdn;
                        return self;
                    });
                } else {
                    throw 'not source file';
                }
            }
            return self._previousSave._thenRunCallbacks(options);
        }
    };
    Bmob.Files = Bmob.Files || {};
    Bmob.Files.del = function (urls, options) {
        var _url = urls.split('.com');
        if (!_url) {
            return Bmob.Promise.error('The file url and cdn is not eixsts.')._thenRunCallbacks(options);
        }
        var data = { _ContentType: 'application/json' };
        var request = Bmob._request('2/files/upyun', _url[1], null, 'DELETE', data);
        return request.then(function (resp) {
            return Bmob._decode(null, resp);
        })._thenRunCallbacks(options);
    };
    Bmob.Object = function (attributes, options) {
        if (_.isString(attributes)) {
            return Bmob.Object._create.apply(this, arguments);
        }
        attributes = attributes || {};
        if (options && options.parse) {
            attributes = this.parse(attributes);
        }
        var defaults = Bmob._getValue(this, 'defaults');
        if (defaults) {
            attributes = _.extend({}, defaults, attributes);
        }
        if (options && options.collection) {
            this.collection = options.collection;
        }
        this._serverData = {};
        this._opSetQueue = [{}];
        this.attributes = {};
        this._hashedJSON = {};
        this._escapedAttributes = {};
        this.cid = _.uniqueId('c');
        this.changed = {};
        this._silent = {};
        this._pending = {};
        if (!this.set(attributes, { silent: true })) {
            throw new Error('Can\'t create an invalid Bmob.Object');
        }
        this.changed = {};
        this._silent = {};
        this._pending = {};
        this._hasData = true;
        this._previousAttributes = _.clone(this.attributes);
        this.initialize.apply(this, arguments);
    };
    Bmob.Object.saveAll = function (list, options) {
        return Bmob.Object._deepSaveAsync(list)._thenRunCallbacks(options);
    };
    _.extend(Bmob.Object.prototype, Bmob.Events, {
        _existed: false,
        _fetchWhenSave: false,
        initialize: function () {
        },
        fetchWhenSave: function (enable) {
            if (typeof enable !== 'boolean') {
                throw 'Expect boolean value for fetchWhenSave';
            }
            this._fetchWhenSave = enable;
        },
        toJSON: function () {
            var json = this._toFullJSON();
            Bmob._arrayEach([
                '__type',
                'className'
            ], function (key) {
                delete json[key];
            });
            return json;
        },
        _toFullJSON: function (seenObjects) {
            var json = _.clone(this.attributes);
            Bmob._objectEach(json, function (val, key) {
                json[key] = Bmob._encode(val, seenObjects);
            });
            Bmob._objectEach(this._operations, function (val, key) {
                json[key] = val;
            });
            if (_.has(this, 'id')) {
                json.objectId = this.id;
            }
            if (_.has(this, 'createdAt')) {
                if (_.isDate(this.createdAt)) {
                    json.createdAt = this.createdAt.toJSON();
                } else {
                    json.createdAt = this.createdAt;
                }
            }
            if (_.has(this, 'updatedAt')) {
                if (_.isDate(this.updatedAt)) {
                    json.updatedAt = this.updatedAt.toJSON();
                } else {
                    json.updatedAt = this.updatedAt;
                }
            }
            json.__type = 'Object';
            json.className = this.className;
            return json;
        },
        _refreshCache: function () {
            var self = this;
            if (self._refreshingCache) {
                return;
            }
            self._refreshingCache = true;
            Bmob._objectEach(this.attributes, function (value, key) {
                if (value instanceof Bmob.Object) {
                    value._refreshCache();
                } else if (_.isObject(value)) {
                    if (self._resetCacheForKey(key)) {
                        self.set(key, new Bmob.Op.Set(value), { silent: true });
                    }
                }
            });
            delete self._refreshingCache;
        },
        dirty: function (attr) {
            this._refreshCache();
            var currentChanges = _.last(this._opSetQueue);
            if (attr) {
                return currentChanges[attr] ? true : false;
            }
            if (!this.id) {
                return true;
            }
            if (_.keys(currentChanges).length > 0) {
                return true;
            }
            return false;
        },
        _toPointer: function () {
            return {
                __type: 'Pointer',
                className: this.className,
                objectId: this.id
            };
        },
        get: function (attr) {
            return this.attributes[attr];
        },
        relation: function (attr) {
            var value = this.get(attr);
            if (value) {
                if (!(value instanceof Bmob.Relation)) {
                    throw 'Called relation() on non-relation field ' + attr;
                }
                value._ensureParentAndKey(this, attr);
                return value;
            } else {
                return new Bmob.Relation(this, attr);
            }
        },
        escape: function (attr) {
            var html = this._escapedAttributes[attr];
            if (html) {
                return html;
            }
            var val = this.attributes[attr];
            var escaped;
            if (Bmob._isNullOrUndefined(val)) {
                escaped = '';
            } else {
                escaped = _.escape(val.toString());
            }
            this._escapedAttributes[attr] = escaped;
            return escaped;
        },
        has: function (attr) {
            return !Bmob._isNullOrUndefined(this.attributes[attr]);
        },
        _mergeMagicFields: function (attrs) {
            var model = this;
            var specialFields = [
                'id',
                'objectId',
                'createdAt',
                'updatedAt'
            ];
            Bmob._arrayEach(specialFields, function (attr) {
                if (attrs[attr]) {
                    if (attr === 'objectId') {
                        model.id = attrs[attr];
                    } else {
                        model[attr] = attrs[attr];
                    }
                    delete attrs[attr];
                }
            });
        },
        _startSave: function () {
            this._opSetQueue.push({});
        },
        _cancelSave: function () {
            var self = this;
            var failedChanges = _.first(this._opSetQueue);
            this._opSetQueue = _.rest(this._opSetQueue);
            var nextChanges = _.first(this._opSetQueue);
            Bmob._objectEach(failedChanges, function (op, key) {
                var op1 = failedChanges[key];
                var op2 = nextChanges[key];
                if (op1 && op2) {
                    nextChanges[key] = op2._mergeWithPrevious(op1);
                } else if (op1) {
                    nextChanges[key] = op1;
                }
            });
            this._saving = this._saving - 1;
        },
        _finishSave: function (serverData) {
            var fetchedObjects = {};
            Bmob._traverse(this.attributes, function (object) {
                if (object instanceof Bmob.Object && object.id && object._hasData) {
                    fetchedObjects[object.id] = object;
                }
            });
            var savedChanges = _.first(this._opSetQueue);
            this._opSetQueue = _.rest(this._opSetQueue);
            this._applyOpSet(savedChanges, this._serverData);
            this._mergeMagicFields(serverData);
            var self = this;
            Bmob._objectEach(serverData, function (value, key) {
                self._serverData[key] = Bmob._decode(key, value);
                var fetched = Bmob._traverse(self._serverData[key], function (object) {
                    if (object instanceof Bmob.Object && fetchedObjects[object.id]) {
                        return fetchedObjects[object.id];
                    }
                });
                if (fetched) {
                    self._serverData[key] = fetched;
                }
            });
            this._rebuildAllEstimatedData();
            this._saving = this._saving - 1;
        },
        _finishFetch: function (serverData, hasData) {
            this._opSetQueue = [{}];
            this._mergeMagicFields(serverData);
            var self = this;
            Bmob._objectEach(serverData, function (value, key) {
                self._serverData[key] = Bmob._decode(key, value);
            });
            this._rebuildAllEstimatedData();
            this._refreshCache();
            this._opSetQueue = [{}];
            this._hasData = hasData;
        },
        _applyOpSet: function (opSet, target) {
            var self = this;
            Bmob._objectEach(opSet, function (change, key) {
                target[key] = change._estimate(target[key], self, key);
                if (target[key] === Bmob.Op._UNSET) {
                    delete target[key];
                }
            });
        },
        _resetCacheForKey: function (key) {
            var value = this.attributes[key];
            if (_.isObject(value) && !(value instanceof Bmob.Object) && !(value instanceof Bmob.File)) {
                value = value.toJSON ? value.toJSON() : value;
                var json = JSON.stringify(value);
                if (this._hashedJSON[key] !== json) {
                    this._hashedJSON[key] = json;
                    return true;
                }
            }
            return false;
        },
        _rebuildEstimatedDataForKey: function (key) {
            var self = this;
            delete this.attributes[key];
            if (this._serverData[key]) {
                this.attributes[key] = this._serverData[key];
            }
            Bmob._arrayEach(this._opSetQueue, function (opSet) {
                var op = opSet[key];
                if (op) {
                    self.attributes[key] = op._estimate(self.attributes[key], self, key);
                    if (self.attributes[key] === Bmob.Op._UNSET) {
                        delete self.attributes[key];
                    } else {
                        self._resetCacheForKey(key);
                    }
                }
            });
        },
        _rebuildAllEstimatedData: function () {
            var self = this;
            var previousAttributes = _.clone(this.attributes);
            this.attributes = _.clone(this._serverData);
            Bmob._arrayEach(this._opSetQueue, function (opSet) {
                self._applyOpSet(opSet, self.attributes);
                Bmob._objectEach(opSet, function (op, key) {
                    self._resetCacheForKey(key);
                });
            });
            Bmob._objectEach(previousAttributes, function (oldValue, key) {
                if (self.attributes[key] !== oldValue) {
                    self.trigger('change:' + key, self, self.attributes[key], {});
                }
            });
            Bmob._objectEach(this.attributes, function (newValue, key) {
                if (!_.has(previousAttributes, key)) {
                    self.trigger('change:' + key, self, newValue, {});
                }
            });
        },
        set: function (key, value, options) {
            var attrs, attr;
            if (_.isObject(key) || Bmob._isNullOrUndefined(key)) {
                attrs = key;
                Bmob._objectEach(attrs, function (v, k) {
                    attrs[k] = Bmob._decode(k, v);
                });
                options = value;
            } else {
                attrs = {};
                attrs[key] = Bmob._decode(key, value);
            }
            options = options || {};
            if (!attrs) {
                return this;
            }
            if (attrs instanceof Bmob.Object) {
                attrs = attrs.attributes;
            }
            if (options.unset) {
                Bmob._objectEach(attrs, function (unused_value, key) {
                    attrs[key] = new Bmob.Op.Unset();
                });
            }
            var dataToValidate = _.clone(attrs);
            var self = this;
            Bmob._objectEach(dataToValidate, function (value, key) {
                if (value instanceof Bmob.Op) {
                    dataToValidate[key] = value._estimate(self.attributes[key], self, key);
                    if (dataToValidate[key] === Bmob.Op._UNSET) {
                        delete dataToValidate[key];
                    }
                }
            });
            if (!this._validate(attrs, options)) {
                return false;
            }
            this._mergeMagicFields(attrs);
            options.changes = {};
            var escaped = this._escapedAttributes;
            var prev = this._previousAttributes || {};
            Bmob._arrayEach(_.keys(attrs), function (attr) {
                var val = attrs[attr];
                if (val instanceof Bmob.Relation) {
                    val.parent = self;
                }
                if (!(val instanceof Bmob.Op)) {
                    val = new Bmob.Op.Set(val);
                }
                var isRealChange = true;
                if (val instanceof Bmob.Op.Set && _.isEqual(self.attributes[attr], val.value)) {
                    isRealChange = false;
                }
                if (isRealChange) {
                    delete escaped[attr];
                    if (options.silent) {
                        self._silent[attr] = true;
                    } else {
                        options.changes[attr] = true;
                    }
                }
                var currentChanges = _.last(self._opSetQueue);
                currentChanges[attr] = val._mergeWithPrevious(currentChanges[attr]);
                self._rebuildEstimatedDataForKey(attr);
                if (isRealChange) {
                    self.changed[attr] = self.attributes[attr];
                    if (!options.silent) {
                        self._pending[attr] = true;
                    }
                } else {
                    delete self.changed[attr];
                    delete self._pending[attr];
                }
            });
            if (!options.silent) {
                this.change(options);
            }
            return this;
        },
        unset: function (attr, options) {
            options = options || {};
            options.unset = true;
            return this.set(attr, null, options);
        },
        increment: function (attr, amount) {
            if (_.isUndefined(amount) || _.isNull(amount)) {
                amount = 1;
            }
            return this.set(attr, new Bmob.Op.Increment(amount));
        },
        add: function (attr, item) {
            return this.set(attr, new Bmob.Op.Add([item]));
        },
        addUnique: function (attr, item) {
            return this.set(attr, new Bmob.Op.AddUnique([item]));
        },
        remove: function (attr, item) {
            return this.set(attr, new Bmob.Op.Remove([item]));
        },
        op: function (attr) {
            return _.last(this._opSetQueue)[attr];
        },
        clear: function (options) {
            options = options || {};
            options.unset = true;
            var keysToClear = _.extend(this.attributes, this._operations);
            return this.set(keysToClear, options);
        },
        _getSaveJSON: function () {
            var json = _.clone(_.first(this._opSetQueue));
            Bmob._objectEach(json, function (op, key) {
                json[key] = op.toJSON();
            });
            return json;
        },
        _canBeSerialized: function () {
            return Bmob.Object._canBeSerializedAsValue(this.attributes);
        },
        fetch: function (options) {
            var self = this;
            var request = Bmob._request('classes', this.className, this.id, 'GET');
            return request.then(function (response, status, xhr) {
                self._finishFetch(self.parse(response, status, xhr), true);
                return self;
            })._thenRunCallbacks(options, this);
        },
        save: function (arg1, arg2, arg3) {
            var i, attrs, current, options, saved;
            if (_.isObject(arg1) || Bmob._isNullOrUndefined(arg1)) {
                attrs = arg1;
                options = arg2;
            } else {
                attrs = {};
                attrs[arg1] = arg2;
                options = arg3;
            }
            if (!options && attrs) {
                var extra_keys = _.reject(attrs, function (value, key) {
                    return _.include([
                        'success',
                        'error',
                        'wait'
                    ], key);
                });
                if (extra_keys.length === 0) {
                    var all_functions = true;
                    if (_.has(attrs, 'success') && !_.isFunction(attrs.success)) {
                        all_functions = false;
                    }
                    if (_.has(attrs, 'error') && !_.isFunction(attrs.error)) {
                        all_functions = false;
                    }
                    if (all_functions) {
                        return this.save(null, attrs);
                    }
                }
            }
            options = _.clone(options) || {};
            if (options.wait) {
                current = _.clone(this.attributes);
            }
            var setOptions = _.clone(options) || {};
            if (setOptions.wait) {
                setOptions.silent = true;
            }
            var setError;
            setOptions.error = function (model, error) {
                setError = error;
            };
            if (attrs && !this.set(attrs, setOptions)) {
                return Bmob.Promise.error(setError)._thenRunCallbacks(options, this);
            }
            var model = this;
            model._refreshCache();
            var unsavedChildren = [];
            var unsavedFiles = [];
            Bmob.Object._findUnsavedChildren(model.attributes, unsavedChildren, unsavedFiles);
            if (unsavedChildren.length + unsavedFiles.length > 0) {
                return Bmob.Object._deepSaveAsync(this.attributes).then(function () {
                    return model.save(null, options);
                }, function (error) {
                    return Bmob.Promise.error(error)._thenRunCallbacks(options, model);
                });
            }
            this._startSave();
            this._saving = (this._saving || 0) + 1;
            this._allPreviousSaves = this._allPreviousSaves || Bmob.Promise.as();
            this._allPreviousSaves = this._allPreviousSaves._continueWith(function () {
                var method = model.id ? 'PUT' : 'POST';
                var json = model._getSaveJSON();
                if (method === 'PUT' && model._fetchWhenSave) {
                    json._fetchWhenSave = true;
                }
                var route = 'classes';
                var className = model.className;
                if (model.className === '_User' && !model.id) {
                    route = 'users';
                    className = null;
                }
                var request = Bmob._request(route, className, model.id, method, json);
                request = request.then(function (resp, status, xhr) {
                    var serverAttrs = model.parse(resp, status, xhr);
                    if (options.wait) {
                        serverAttrs = _.extend(attrs || {}, serverAttrs);
                    }
                    model._finishSave(serverAttrs);
                    if (options.wait) {
                        model.set(current, setOptions);
                    }
                    return model;
                }, function (error) {
                    model._cancelSave();
                    return Bmob.Promise.error(error);
                })._thenRunCallbacks(options, model);
                return request;
            });
            return this._allPreviousSaves;
        },
        destroy: function (options) {
            options = options || {};
            var model = this;
            var triggerDestroy = function () {
                model.trigger('destroy', model, model.collection, options);
            };
            if (!this.id) {
                return triggerDestroy();
            }
            if (!options.wait) {
                triggerDestroy();
            }
            var request = Bmob._request('classes', this.className, this.id, 'DELETE');
            return request.then(function () {
                if (options.wait) {
                    triggerDestroy();
                }
                return model;
            })._thenRunCallbacks(options, this);
        },
        parse: function (resp, status, xhr) {
            var output = _.clone(resp);
            _([
                'createdAt',
                'updatedAt'
            ]).each(function (key) {
                if (output[key]) {
                    output[key] = output[key];
                }
            });
            if (!output.updatedAt) {
                output.updatedAt = output.createdAt;
            }
            if (status) {
                this._existed = status !== 201;
            }
            return output;
        },
        clone: function () {
            return new this.constructor(this.attributes);
        },
        isNew: function () {
            return !this.id;
        },
        change: function (options) {
            options = options || {};
            var changing = this._changing;
            this._changing = true;
            var self = this;
            Bmob._objectEach(this._silent, function (attr) {
                self._pending[attr] = true;
            });
            var changes = _.extend({}, options.changes, this._silent);
            this._silent = {};
            Bmob._objectEach(changes, function (unused_value, attr) {
                self.trigger('change:' + attr, self, self.get(attr), options);
            });
            if (changing) {
                return this;
            }
            var deleteChanged = function (value, attr) {
                if (!self._pending[attr] && !self._silent[attr]) {
                    delete self.changed[attr];
                }
            };
            while (!_.isEmpty(this._pending)) {
                this._pending = {};
                this.trigger('change', this, options);
                Bmob._objectEach(this.changed, deleteChanged);
                self._previousAttributes = _.clone(this.attributes);
            }
            this._changing = false;
            return this;
        },
        existed: function () {
            return this._existed;
        },
        hasChanged: function (attr) {
            if (!arguments.length) {
                return !_.isEmpty(this.changed);
            }
            return this.changed && _.has(this.changed, attr);
        },
        changedAttributes: function (diff) {
            if (!diff) {
                return this.hasChanged() ? _.clone(this.changed) : false;
            }
            var changed = {};
            var old = this._previousAttributes;
            Bmob._objectEach(diff, function (diffVal, attr) {
                if (!_.isEqual(old[attr], diffVal)) {
                    changed[attr] = diffVal;
                }
            });
            return changed;
        },
        previous: function (attr) {
            if (!arguments.length || !this._previousAttributes) {
                return null;
            }
            return this._previousAttributes[attr];
        },
        previousAttributes: function () {
            return _.clone(this._previousAttributes);
        },
        isValid: function () {
            return !this.validate(this.attributes);
        },
        validate: function (attrs, options) {
            if (_.has(attrs, 'ACL') && !(attrs.ACL instanceof Bmob.ACL)) {
                return new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'ACL must be a Bmob.ACL.');
            }
            return false;
        },
        _validate: function (attrs, options) {
            if (options.silent || !this.validate) {
                return true;
            }
            attrs = _.extend({}, this.attributes, attrs);
            var error = this.validate(attrs, options);
            if (!error) {
                return true;
            }
            if (options && options.error) {
                options.error(this, error, options);
            } else {
                this.trigger('error', this, error, options);
            }
            return false;
        },
        getACL: function () {
            return this.get('ACL');
        },
        setACL: function (acl, options) {
            return this.set('ACL', acl, options);
        }
    });
    Bmob.Object.createWithoutData = function (className, id, hasData) {
        var result = new Bmob.Object(className);
        result.id = id;
        result._hasData = hasData;
        return result;
    };
    Bmob.Object.destroyAll = function (objects, options) {
        if (objects == null || objects.length == 0) {
            return Bmob.Promise.as()._thenRunCallbacks(options);
        }
        var className = objects[0].className;
        var id = '';
        var wasFirst = true;
        objects.forEach(function (obj) {
            if (obj.className != className)
                throw 'Bmob.Object.destroyAll requires the argument object array\'s classNames must be the same';
            if (!obj.id)
                throw 'Could not delete unsaved object';
            if (wasFirst) {
                id = obj.id;
                wasFirst = false;
            } else {
                id = id + ',' + obj.id;
            }
        });
        var request = Bmob._request('classes', className, id, 'DELETE');
        return request._thenRunCallbacks(options);
    };
    Bmob.Object._getSubclass = function (className) {
        if (!_.isString(className)) {
            throw 'Bmob.Object._getSubclass requires a string argument.';
        }
        var ObjectClass = Bmob.Object._classMap[className];
        if (!ObjectClass) {
            ObjectClass = Bmob.Object.extend(className);
            Bmob.Object._classMap[className] = ObjectClass;
        }
        return ObjectClass;
    };
    Bmob.Object._create = function (className, attributes, options) {
        var ObjectClass = Bmob.Object._getSubclass(className);
        return new ObjectClass(attributes, options);
    };
    Bmob.Object._classMap = {};
    Bmob.Object._extend = Bmob._extend;
    Bmob.Object.extend = function (className, protoProps, classProps) {
        if (!_.isString(className)) {
            if (className && _.has(className, 'className')) {
                return Bmob.Object.extend(className.className, className, protoProps);
            } else {
                throw new Error('Bmob.Object.extend\'s first argument should be the className.');
            }
        }
        if (className === 'User') {
            className = '_User';
        }
        var NewClassObject = null;
        if (_.has(Bmob.Object._classMap, className)) {
            var OldClassObject = Bmob.Object._classMap[className];
            NewClassObject = OldClassObject._extend(protoProps, classProps);
        } else {
            protoProps = protoProps || {};
            protoProps.className = className;
            NewClassObject = this._extend(protoProps, classProps);
        }
        NewClassObject.extend = function (arg0) {
            if (_.isString(arg0) || arg0 && _.has(arg0, 'className')) {
                return Bmob.Object.extend.apply(NewClassObject, arguments);
            }
            var newArguments = [className].concat(Bmob._.toArray(arguments));
            return Bmob.Object.extend.apply(NewClassObject, newArguments);
        };
        Bmob.Object._classMap[className] = NewClassObject;
        return NewClassObject;
    };
    Bmob.Object._findUnsavedChildren = function (object, children, files) {
        Bmob._traverse(object, function (object) {
            if (object instanceof Bmob.Object) {
                object._refreshCache();
                if (object.dirty()) {
                    children.push(object);
                }
                return;
            }
            if (object instanceof Bmob.File) {
                if (!object.url()) {
                    files.push(object);
                }
                return;
            }
        });
    };
    Bmob.Object._canBeSerializedAsValue = function (object) {
        var canBeSerializedAsValue = true;
        if (object instanceof Bmob.Object) {
            canBeSerializedAsValue = !!object.id;
        } else if (_.isArray(object)) {
            Bmob._arrayEach(object, function (child) {
                if (!Bmob.Object._canBeSerializedAsValue(child)) {
                    canBeSerializedAsValue = false;
                }
            });
        } else if (_.isObject(object)) {
            Bmob._objectEach(object, function (child) {
                if (!Bmob.Object._canBeSerializedAsValue(child)) {
                    canBeSerializedAsValue = false;
                }
            });
        }
        return canBeSerializedAsValue;
    };
    Bmob.Object._deepSaveAsync = function (object) {
        var unsavedChildren = [];
        var unsavedFiles = [];
        Bmob.Object._findUnsavedChildren(object, unsavedChildren, unsavedFiles);
        var promise = Bmob.Promise.as();
        _.each(unsavedFiles, function (file) {
            promise = promise.then(function () {
                return file.save();
            });
        });
        var objects = _.uniq(unsavedChildren);
        var remaining = _.uniq(objects);
        return promise.then(function () {
            return Bmob.Promise._continueWhile(function () {
                return remaining.length > 0;
            }, function () {
                var batch = [];
                var newRemaining = [];
                Bmob._arrayEach(remaining, function (object) {
                    if (batch.length > 20) {
                        newRemaining.push(object);
                        return;
                    }
                    if (object._canBeSerialized()) {
                        batch.push(object);
                    } else {
                        newRemaining.push(object);
                    }
                });
                remaining = newRemaining;
                if (batch.length === 0) {
                    return Bmob.Promise.error(new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'Tried to save a batch with a cycle.'));
                }
                var readyToStart = Bmob.Promise.when(_.map(batch, function (object) {
                    return object._allPreviousSaves || Bmob.Promise.as();
                }));
                var batchFinished = new Bmob.Promise();
                Bmob._arrayEach(batch, function (object) {
                    object._allPreviousSaves = batchFinished;
                });
                return readyToStart._continueWith(function () {
                    return Bmob._request('batch', null, null, 'POST', {
                        requests: _.map(batch, function (object) {
                            var json = object._getSaveJSON();
                            var method = 'POST';
                            var path = '/1/classes/' + object.className;
                            if (object.id) {
                                path = path + '/' + object.id;
                                method = 'PUT';
                            }
                            object._startSave();
                            return {
                                method: method,
                                path: path,
                                body: json
                            };
                        })
                    }).then(function (response, status, xhr) {
                        var error;
                        Bmob._arrayEach(batch, function (object, i) {
                            if (response[i].success) {
                                object._finishSave(object.parse(response[i].success, status, xhr));
                            } else {
                                error = error || response[i].error;
                                object._cancelSave();
                            }
                        });
                        if (error) {
                            return Bmob.Promise.error(new Bmob.Error(error.code, error.error));
                        }
                    }).then(function (results) {
                        batchFinished.resolve(results);
                        return results;
                    }, function (error) {
                        batchFinished.reject(error);
                        return Bmob.Promise.error(error);
                    });
                });
            });
        }).then(function () {
            return object;
        });
    };
    Bmob.Role = Bmob.Object.extend('_Role', {
        constructor: function (name, acl) {
            if (_.isString(name) && acl instanceof Bmob.ACL) {
                Bmob.Object.prototype.constructor.call(this, null, null);
                this.setName(name);
                this.setACL(acl);
            } else {
                Bmob.Object.prototype.constructor.call(this, name, acl);
            }
        },
        getName: function () {
            return this.get('name');
        },
        setName: function (name, options) {
            return this.set('name', name, options);
        },
        getUsers: function () {
            return this.relation('users');
        },
        getRoles: function () {
            return this.relation('roles');
        },
        validate: function (attrs, options) {
            if ('name' in attrs && attrs.name !== this.getName()) {
                var newName = attrs.name;
                if (this.id && this.id !== attrs.objectId) {
                    return new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'A role\'s name can only be set before it has been saved.');
                }
                if (!_.isString(newName)) {
                    return new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'A role\'s name must be a String.');
                }
                if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
                    return new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'A role\'s name can only contain alphanumeric characters, _,' + ' -, and spaces.');
                }
            }
            if (Bmob.Object.prototype.validate) {
                return Bmob.Object.prototype.validate.call(this, attrs, options);
            }
            return false;
        }
    });
    Bmob.Collection = function (models, options) {
        options = options || {};
        if (options.comparator) {
            this.comparator = options.comparator;
        }
        if (options.model) {
            this.model = options.model;
        }
        if (options.query) {
            this.query = options.query;
        }
        this._reset();
        this.initialize.apply(this, arguments);
        if (models) {
            this.reset(models, {
                silent: true,
                parse: options.parse
            });
        }
    };
    _.extend(Bmob.Collection.prototype, Bmob.Events, {
        model: Bmob.Object,
        initialize: function () {
        },
        toJSON: function () {
            return this.map(function (model) {
                return model.toJSON();
            });
        },
        add: function (models, options) {
            var i, index, length, model, cid, id, cids = {}, ids = {};
            options = options || {};
            models = _.isArray(models) ? models.slice() : [models];
            for (i = 0, length = models.length; i < length; i++) {
                models[i] = this._prepareModel(models[i], options);
                model = models[i];
                if (!model) {
                    throw new Error('Can\'t add an invalid model to a collection');
                }
                cid = model.cid;
                if (cids[cid] || this._byCid[cid]) {
                    throw new Error('Duplicate cid: can\'t add the same model ' + 'to a collection twice');
                }
                id = model.id;
                if (!Bmob._isNullOrUndefined(id) && (ids[id] || this._byId[id])) {
                    throw new Error('Duplicate id: can\'t add the same model ' + 'to a collection twice');
                }
                ids[id] = model;
                cids[cid] = model;
            }
            for (i = 0; i < length; i++) {
                (model = models[i]).on('all', this._onModelEvent, this);
                this._byCid[model.cid] = model;
                if (model.id) {
                    this._byId[model.id] = model;
                }
            }
            this.length += length;
            index = Bmob._isNullOrUndefined(options.at) ? this.models.length : options.at;
            this.models.splice.apply(this.models, [
                index,
                0
            ].concat(models));
            if (this.comparator) {
                this.sort({ silent: true });
            }
            if (options.silent) {
                return this;
            }
            for (i = 0, length = this.models.length; i < length; i++) {
                model = this.models[i];
                if (cids[model.cid]) {
                    options.index = i;
                    model.trigger('add', model, this, options);
                }
            }
            return this;
        },
        remove: function (models, options) {
            var i, l, index, model;
            options = options || {};
            models = _.isArray(models) ? models.slice() : [models];
            for (i = 0, l = models.length; i < l; i++) {
                model = this.getByCid(models[i]) || this.get(models[i]);
                if (!model) {
                    continue;
                }
                delete this._byId[model.id];
                delete this._byCid[model.cid];
                index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if (!options.silent) {
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                this._removeReference(model);
            }
            return this;
        },
        get: function (id) {
            return id && this._byId[id.id || id];
        },
        getByCid: function (cid) {
            return cid && this._byCid[cid.cid || cid];
        },
        at: function (index) {
            return this.models[index];
        },
        sort: function (options) {
            options = options || {};
            if (!this.comparator) {
                throw new Error('Cannot sort a set without a comparator');
            }
            var boundComparator = _.bind(this.comparator, this);
            if (this.comparator.length === 1) {
                this.models = this.sortBy(boundComparator);
            } else {
                this.models.sort(boundComparator);
            }
            if (!options.silent) {
                this.trigger('reset', this, options);
            }
            return this;
        },
        pluck: function (attr) {
            return _.map(this.models, function (model) {
                return model.get(attr);
            });
        },
        reset: function (models, options) {
            var self = this;
            models = models || [];
            options = options || {};
            Bmob._arrayEach(this.models, function (model) {
                self._removeReference(model);
            });
            this._reset();
            this.add(models, {
                silent: true,
                parse: options.parse
            });
            if (!options.silent) {
                this.trigger('reset', this, options);
            }
            return this;
        },
        fetch: function (options) {
            options = _.clone(options) || {};
            if (options.parse === undefined) {
                options.parse = true;
            }
            var collection = this;
            var query = this.query || new Bmob.Query(this.model);
            return query.find().then(function (results) {
                if (options.add) {
                    collection.add(results, options);
                } else {
                    collection.reset(results, options);
                }
                return collection;
            })._thenRunCallbacks(options, this);
        },
        create: function (model, options) {
            var coll = this;
            options = options ? _.clone(options) : {};
            model = this._prepareModel(model, options);
            if (!model) {
                return false;
            }
            if (!options.wait) {
                coll.add(model, options);
            }
            var success = options.success;
            options.success = function (nextModel, resp, xhr) {
                if (options.wait) {
                    coll.add(nextModel, options);
                }
                if (success) {
                    success(nextModel, resp);
                } else {
                    nextModel.trigger('sync', model, resp, options);
                }
            };
            model.save(null, options);
            return model;
        },
        parse: function (resp, xhr) {
            return resp;
        },
        chain: function () {
            return _(this.models).chain();
        },
        _reset: function (options) {
            this.length = 0;
            this.models = [];
            this._byId = {};
            this._byCid = {};
        },
        _prepareModel: function (model, options) {
            if (!(model instanceof Bmob.Object)) {
                var attrs = model;
                options.collection = this;
                model = new this.model(attrs, options);
                if (!model._validate(model.attributes, options)) {
                    model = false;
                }
            } else if (!model.collection) {
                model.collection = this;
            }
            return model;
        },
        _removeReference: function (model) {
            if (this === model.collection) {
                delete model.collection;
            }
            model.off('all', this._onModelEvent, this);
        },
        _onModelEvent: function (ev, model, collection, options) {
            if ((ev === 'add' || ev === 'remove') && collection !== this) {
                return;
            }
            if (ev === 'destroy') {
                this.remove(model, options);
            }
            if (model && ev === 'change:objectId') {
                delete this._byId[model.previous('objectId')];
                this._byId[model.id] = model;
            }
            this.trigger.apply(this, arguments);
        }
    });
    var methods = [
        'forEach',
        'each',
        'map',
        'reduce',
        'reduceRight',
        'find',
        'detect',
        'filter',
        'select',
        'reject',
        'every',
        'all',
        'some',
        'any',
        'include',
        'contains',
        'invoke',
        'max',
        'min',
        'sortBy',
        'sortedIndex',
        'toArray',
        'size',
        'first',
        'initial',
        'rest',
        'last',
        'without',
        'indexOf',
        'shuffle',
        'lastIndexOf',
        'isEmpty',
        'groupBy'
    ];
    Bmob._arrayEach(methods, function (method) {
        Bmob.Collection.prototype[method] = function () {
            return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
        };
    });
    Bmob.Collection.extend = Bmob._extend;
    Bmob.View = function (options) {
        this.cid = _.uniqueId('view');
        this._configure(options || {});
        this._ensureElement();
        this.initialize.apply(this, arguments);
        this.delegateEvents();
    };
    var eventSplitter = /^(\S+)\s*(.*)$/;
    var viewOptions = [
        'model',
        'collection',
        'el',
        'id',
        'attributes',
        'className',
        'tagName'
    ];
    _.extend(Bmob.View.prototype, Bmob.Events, {
        tagName: 'div',
        $: function (selector) {
            return this.$el.find(selector);
        },
        initialize: function () {
        },
        render: function () {
            return this;
        },
        remove: function () {
            this.$el.remove();
            return this;
        },
        make: function (tagName, attributes, content) {
            var el = document.createElement(tagName);
            if (attributes) {
                Bmob.$(el).attr(attributes);
            }
            if (content) {
                Bmob.$(el).html(content);
            }
            return el;
        },
        setElement: function (element, delegate) {
            this.$el = Bmob.$(element);
            this.el = this.$el[0];
            if (delegate !== false) {
                this.delegateEvents();
            }
            return this;
        },
        delegateEvents: function (events) {
            events = events || Bmob._getValue(this, 'events');
            if (!events) {
                return;
            }
            this.undelegateEvents();
            var self = this;
            Bmob._objectEach(events, function (method, key) {
                if (!_.isFunction(method)) {
                    method = self[events[key]];
                }
                if (!method) {
                    throw new Error('Event "' + events[key] + '" does not exist');
                }
                var match = key.match(eventSplitter);
                var eventName = match[1], selector = match[2];
                method = _.bind(method, self);
                eventName += '.delegateEvents' + self.cid;
                if (selector === '') {
                    self.$el.bind(eventName, method);
                } else {
                    self.$el.delegate(selector, eventName, method);
                }
            });
        },
        undelegateEvents: function () {
            this.$el.unbind('.delegateEvents' + this.cid);
        },
        _configure: function (options) {
            if (this.options) {
                options = _.extend({}, this.options, options);
            }
            var self = this;
            _.each(viewOptions, function (attr) {
                if (options[attr]) {
                    self[attr] = options[attr];
                }
            });
            this.options = options;
        },
        _ensureElement: function () {
            if (!this.el) {
                var attrs = Bmob._getValue(this, 'attributes') || {};
                if (this.id) {
                    attrs.id = this.id;
                }
                if (this.className) {
                    attrs['class'] = this.className;
                }
                this.setElement(this.make(this.tagName, attrs), false);
            } else {
                this.setElement(this.el, false);
            }
        }
    });
    Bmob.View.extend = Bmob._extend;
    Bmob.User = Bmob.Object.extend('_User', {
        _isCurrentUser: false,
        _mergeMagicFields: function (attrs) {
            if (attrs.sessionToken) {
                this._sessionToken = attrs.sessionToken;
                delete attrs.sessionToken;
            }
            Bmob.User.__super__._mergeMagicFields.call(this, attrs);
        },
        _cleanupAuthData: function () {
            if (!this.isCurrent()) {
                return;
            }
            var authData = this.get('authData');
            if (!authData) {
                return;
            }
            Bmob._objectEach(this.get('authData'), function (value, key) {
                if (!authData[key]) {
                    delete authData[key];
                }
            });
        },
        _synchronizeAllAuthData: function () {
            var authData = this.get('authData');
            if (!authData) {
                return;
            }
            var self = this;
            Bmob._objectEach(this.get('authData'), function (value, key) {
                self._synchronizeAuthData(key);
            });
        },
        _synchronizeAuthData: function (provider) {
            if (!this.isCurrent()) {
                return;
            }
            var authType;
            if (_.isString(provider)) {
                authType = provider;
                provider = Bmob.User._authProviders[authType];
            } else {
                authType = provider.getAuthType();
            }
            var authData = this.get('authData');
            if (!authData || !provider) {
                return;
            }
            var success = provider.restoreAuthentication(authData[authType]);
            if (!success) {
                this._unlinkFrom(provider);
            }
        },
        _handleSaveResult: function (makeCurrent) {
            if (makeCurrent) {
                this._isCurrentUser = true;
            }
            this._cleanupAuthData();
            this._synchronizeAllAuthData();
            delete this._serverData.password;
            this._rebuildEstimatedDataForKey('password');
            this._refreshCache();
            if (makeCurrent || this.isCurrent()) {
                Bmob.User._saveCurrentUser(this);
            }
        },
        _linkWith: function _linkWith(provider, data) {
            var _this = this;
            var authType;
            if (_.isString(provider)) {
                authType = provider;
                provider = Bmob.User._authProviders[provider];
            } else {
                authType = provider.getAuthType();
            }
            if (data) {
                var authData = this.get('authData') || {};
                authData[authType] = data;
                this.set('authData', authData);
                var promise = new Bmob.Promise();
                this.save({ 'authData': authData }, newOptions).then(function (model) {
                    model._handleSaveResult(true);
                    promise.resolve(model);
                });
                return promise._thenRunCallbacks({});
                var newOptions = _.clone(data) || {};
                newOptions.success = function (model) {
                    model._handleSaveResult(true);
                    if (data.success) {
                        data.success.apply(this, arguments);
                    }
                };
                return this.save({ 'authData': authData }, newOptions);
            } else {
                return provider.authenticate().then(function (result) {
                    return _this._linkWith(provider, result);
                });
            }
        },
        loginWithWeapp: function (code) {
            var that = this;
            var promise = new Bmob.Promise();
            Bmob.User.requestOpenId(code, {
                success: function (authData) {
                    var platform = 'weapp';
                    var user = Bmob.Object._create('_User');
                    user._linkWith(platform, authData).then(function (resp) {
                        promise.resolve(resp);
                    }, function (error) {
                        promise.reject(error);
                    });
                },
                error: function (error) {
                    promise.reject(error);
                }
            });
            return promise._thenRunCallbacks({});
        },
        _unlinkFrom: function (provider, options) {
            var authType;
            if (_.isString(provider)) {
                authType = provider;
                provider = Bmob.User._authProviders[provider];
            } else {
                authType = provider.getAuthType();
            }
            var newOptions = _.clone(options);
            var self = this;
            newOptions.authData = null;
            newOptions.success = function (model) {
                self._synchronizeAuthData(provider);
                if (options.success) {
                    options.success.apply(this, arguments);
                }
            };
            return this._linkWith(provider, newOptions);
        },
        _isLinked: function (provider) {
            var authType;
            if (_.isString(provider)) {
                authType = provider;
            } else {
                authType = provider.getAuthType();
            }
            var authData = this.get('authData') || {};
            return !!authData[authType];
        },
        _logOutWithAll: function () {
            var authData = this.get('authData');
            if (!authData) {
                return;
            }
            var self = this;
            Bmob._objectEach(this.get('authData'), function (value, key) {
                self._logOutWith(key);
            });
        },
        _logOutWith: function (provider) {
            if (!this.isCurrent()) {
                return;
            }
            if (_.isString(provider)) {
                provider = Bmob.User._authProviders[provider];
            }
            if (provider && provider.deauthenticate) {
                provider.deauthenticate();
            }
        },
        signUp: function (attrs, options) {
            var error;
            options = options || {};
            var username = attrs && attrs.username || this.get('username');
            if (!username || username === '') {
                error = new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'Cannot sign up user with an empty name.');
                if (options && options.error) {
                    options.error(this, error);
                }
                return Bmob.Promise.error(error);
            }
            var password = attrs && attrs.password || this.get('password');
            if (!password || password === '') {
                error = new Bmob.Error(Bmob.Error.OTHER_CAUSE, 'Cannot sign up user with an empty password.');
                if (options && options.error) {
                    options.error(this, error);
                }
                return Bmob.Promise.error(error);
            }
            var newOptions = _.clone(options);
            newOptions.success = function (model) {
                model._handleSaveResult(true);
                if (options.success) {
                    options.success.apply(this, arguments);
                }
            };
            return this.save(attrs, newOptions);
        },
        logIn: function (options) {
            var model = this;
            var request = Bmob._request('login', null, null, 'GET', this.toJSON());
            return request.then(function (resp, status, xhr) {
                var serverAttrs = model.parse(resp, status, xhr);
                model._finishFetch(serverAttrs);
                model._handleSaveResult(true);
                return model;
            })._thenRunCallbacks(options, this);
        },
        save: function (arg1, arg2, arg3) {
            var i, attrs, current, options, saved;
            if (_.isObject(arg1) || _.isNull(arg1) || _.isUndefined(arg1)) {
                attrs = arg1;
                options = arg2;
            } else {
                attrs = {};
                attrs[arg1] = arg2;
                options = arg3;
            }
            options = options || {};
            var newOptions = _.clone(options);
            newOptions.success = function (model) {
                model._handleSaveResult(false);
                if (options.success) {
                    options.success.apply(this, arguments);
                }
            };
            return Bmob.Object.prototype.save.call(this, attrs, newOptions);
        },
        fetch: function (options) {
            var newOptions = options ? _.clone(options) : {};
            newOptions.success = function (model) {
                model._handleSaveResult(false);
                if (options && options.success) {
                    options.success.apply(this, arguments);
                }
            };
            return Bmob.Object.prototype.fetch.call(this, newOptions);
        },
        isCurrent: function () {
            return this._isCurrentUser;
        },
        getUsername: function () {
            return this.get('username');
        },
        setUsername: function (username, options) {
            return this.set('username', username, options);
        },
        setPassword: function (password, options) {
            return this.set('password', password, options);
        },
        getEmail: function () {
            return this.get('email');
        },
        setEmail: function (email, options) {
            return this.set('email', email, options);
        },
        authenticated: function () {
            return !!this._sessionToken && (Bmob.User.current() && Bmob.User.current().id === this.id);
        }
    }, {
        _currentUser: null,
        _currentUserMatchesDisk: false,
        _CURRENT_USER_KEY: 'currentUser',
        _authProviders: {},
        signUp: function (username, password, attrs, options) {
            attrs = attrs || {};
            attrs.username = username;
            attrs.password = password;
            var user = Bmob.Object._create('_User');
            return user.signUp(attrs, options);
        },
        logIn: function (username, password, options) {
            var user = Bmob.Object._create('_User');
            user._finishFetch({
                username: username,
                password: password
            });
            return user.logIn(options);
        },
        logOut: function () {
            if (Bmob.User._currentUser !== null) {
                Bmob.User._currentUser._logOutWithAll();
                Bmob.User._currentUser._isCurrentUser = false;
            }
            Bmob.User._currentUserMatchesDisk = true;
            Bmob.User._currentUser = null;
            wx.removeStorage({
                key: Bmob._getBmobPath(Bmob.User._CURRENT_USER_KEY),
                success: function (res) {
                    console.log(res.data);
                }
            });
        },
        requestPasswordReset: function (email, options) {
            var json = { email: email };
            var request = Bmob._request('requestPasswordReset', null, null, 'POST', json);
            return request._thenRunCallbacks(options);
        },
        requestEmailVerify: function (email, options) {
            var json = { email: email };
            var request = Bmob._request('requestEmailVerify', null, null, 'POST', json);
            return request._thenRunCallbacks(options);
        },
        requestOpenId: function (code, options) {
            var json = { code: code };
            var request = Bmob._request('wechatApp', code, null, 'POST', json);
            return request._thenRunCallbacks(options);
        },
        current: function () {
            if (Bmob.User._currentUser) {
                return Bmob.User._currentUser;
            }
            if (Bmob.User._currentUserMatchesDisk) {
                return Bmob.User._currentUser;
            }
            Bmob.User._currentUserMatchesDisk = true;
            var userData = false;
            try {
                var userData = wx.getStorageSync(Bmob._getBmobPath(Bmob.User._CURRENT_USER_KEY));
                if (userData) {
                    Bmob.User._currentUser = Bmob.Object._create('_User');
                    Bmob.User._currentUser._isCurrentUser = true;
                    var json = JSON.parse(userData);
                    Bmob.User._currentUser.id = json._id;
                    delete json._id;
                    Bmob.User._currentUser._sessionToken = json._sessionToken;
                    delete json._sessionToken;
                    Bmob.User._currentUser.set(json);
                    Bmob.User._currentUser._synchronizeAllAuthData();
                    Bmob.User._currentUser._refreshCache();
                    Bmob.User._currentUser._opSetQueue = [{}];
                    return Bmob.User._currentUser;
                }
            } catch (e) {
                return null;
            }
        },
        _saveCurrentUser: function (user) {
            if (Bmob.User._currentUser !== user) {
                Bmob.User.logOut();
            }
            user._isCurrentUser = true;
            Bmob.User._currentUser = user;
            Bmob.User._currentUserMatchesDisk = true;
            var json = user.toJSON();
            json._id = user.id;
            json._sessionToken = user._sessionToken;
            wx.setStorage({
                key: Bmob._getBmobPath(Bmob.User._CURRENT_USER_KEY),
                data: JSON.stringify(json)
            });
        },
        _registerAuthenticationProvider: function (provider) {
            Bmob.User._authProviders[provider.getAuthType()] = provider;
            if (Bmob.User.current()) {
                Bmob.User.current()._synchronizeAuthData(provider.getAuthType());
            }
        },
        _logInWith: function (provider, options) {
            var user = Bmob.Object._create('_User');
            return user._linkWith(provider, options);
        }
    });
    Bmob.Query = function (objectClass) {
        if (_.isString(objectClass)) {
            objectClass = Bmob.Object._getSubclass(objectClass);
        }
        this.objectClass = objectClass;
        this.className = objectClass.prototype.className;
        this._where = {};
        this._include = [];
        this._limit = -1;
        this._skip = 0;
        this._extraOptions = {};
    };
    Bmob.Query.or = function () {
        var queries = _.toArray(arguments);
        var className = null;
        Bmob._arrayEach(queries, function (q) {
            if (_.isNull(className)) {
                className = q.className;
            }
            if (className !== q.className) {
                throw 'All queries must be for the same class';
            }
        });
        var query = new Bmob.Query(className);
        query._orQuery(queries);
        return query;
    };
    Bmob.Query._extend = Bmob._extend;
    Bmob.Query.prototype = {
        _processResult: function (obj) {
            return obj;
        },
        get: function (objectId, options) {
            var self = this;
            self.equalTo('objectId', objectId);
            return self.first().then(function (response) {
                if (response) {
                    return response;
                }
                var errorObject = new Bmob.Error(Bmob.Error.OBJECT_NOT_FOUND, 'Object not found.');
                return Bmob.Promise.error(errorObject);
            })._thenRunCallbacks(options, null);
        },
        toJSON: function () {
            var params = { where: this._where };
            if (this._include.length > 0) {
                params.include = this._include.join(',');
            }
            if (this._select) {
                params.keys = this._select.join(',');
            }
            if (this._limit >= 0) {
                params.limit = this._limit;
            }
            if (this._skip > 0) {
                params.skip = this._skip;
            }
            if (this._order !== undefined) {
                params.order = this._order;
            }
            Bmob._objectEach(this._extraOptions, function (v, k) {
                params[k] = v;
            });
            return params;
        },
        _newObject: function (response) {
            if (typeof obj === 'undefined') {
                var obj;
            }
            if (response && response.className) {
                obj = new Bmob.Object(response.className);
            } else {
                obj = new this.objectClass();
            }
            return obj;
        },
        _createRequest: function (params) {
            return Bmob._request('classes', this.className, null, 'GET', params || this.toJSON());
        },
        find: function (options) {
            var self = this;
            var request = this._createRequest();
            return request.then(function (response) {
                return _.map(response.results, function (json) {
                    var obj = self._newObject(response);
                    obj._finishFetch(self._processResult(json), true);
                    return obj;
                });
            })._thenRunCallbacks(options);
        },
        destroyAll: function (options) {
            var self = this;
            return self.find().then(function (objects) {
                return Bmob.Object.destroyAll(objects);
            })._thenRunCallbacks(options);
        },
        count: function (options) {
            var params = this.toJSON();
            params.limit = 0;
            params.count = 1;
            var request = this._createRequest(params);
            return request.then(function (response) {
                return response.count;
            })._thenRunCallbacks(options);
        },
        first: function (options) {
            var self = this;
            var params = this.toJSON();
            params.limit = 1;
            var request = this._createRequest(params);
            return request.then(function (response) {
                return _.map(response.results, function (json) {
                    var obj = self._newObject();
                    obj._finishFetch(self._processResult(json), true);
                    return obj;
                })[0];
            })._thenRunCallbacks(options);
        },
        collection: function (items, options) {
            options = options || {};
            return new Bmob.Collection(items, _.extend(options, {
                model: this._objectClass || this.objectClass,
                query: this
            }));
        },
        skip: function (n) {
            this._skip = n;
            return this;
        },
        limit: function (n) {
            this._limit = n;
            return this;
        },
        equalTo: function (key, value) {
            this._where[key] = Bmob._encode(value);
            return this;
        },
        _addCondition: function (key, condition, value) {
            if (!this._where[key]) {
                this._where[key] = {};
            }
            this._where[key][condition] = Bmob._encode(value);
            return this;
        },
        notEqualTo: function (key, value) {
            this._addCondition(key, '$ne', value);
            return this;
        },
        lessThan: function (key, value) {
            this._addCondition(key, '$lt', value);
            return this;
        },
        greaterThan: function (key, value) {
            this._addCondition(key, '$gt', value);
            return this;
        },
        lessThanOrEqualTo: function (key, value) {
            this._addCondition(key, '$lte', value);
            return this;
        },
        greaterThanOrEqualTo: function (key, value) {
            this._addCondition(key, '$gte', value);
            return this;
        },
        containedIn: function (key, values) {
            this._addCondition(key, '$in', values);
            return this;
        },
        notContainedIn: function (key, values) {
            this._addCondition(key, '$nin', values);
            return this;
        },
        containsAll: function (key, values) {
            this._addCondition(key, '$all', values);
            return this;
        },
        exists: function (key) {
            this._addCondition(key, '$exists', true);
            return this;
        },
        doesNotExist: function (key) {
            this._addCondition(key, '$exists', false);
            return this;
        },
        matches: function (key, regex, modifiers) {
            this._addCondition(key, '$regex', regex);
            if (!modifiers) {
                modifiers = '';
            }
            if (regex.ignoreCase) {
                modifiers += 'i';
            }
            if (regex.multiline) {
                modifiers += 'm';
            }
            if (modifiers && modifiers.length) {
                this._addCondition(key, '$options', modifiers);
            }
            return this;
        },
        matchesQuery: function (key, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, '$inQuery', queryJSON);
            return this;
        },
        doesNotMatchQuery: function (key, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, '$notInQuery', queryJSON);
            return this;
        },
        matchesKeyInQuery: function (key, queryKey, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, '$select', {
                key: queryKey,
                query: queryJSON
            });
            return this;
        },
        doesNotMatchKeyInQuery: function (key, queryKey, query) {
            var queryJSON = query.toJSON();
            queryJSON.className = query.className;
            this._addCondition(key, '$dontSelect', {
                key: queryKey,
                query: queryJSON
            });
            return this;
        },
        _orQuery: function (queries) {
            var queryJSON = _.map(queries, function (q) {
                return q.toJSON().where;
            });
            this._where.$or = queryJSON;
            return this;
        },
        _quote: function (s) {
            return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
        },
        contains: function (key, value) {
            this._addCondition(key, '$regex', this._quote(value));
            return this;
        },
        startsWith: function (key, value) {
            this._addCondition(key, '$regex', '^' + this._quote(value));
            return this;
        },
        endsWith: function (key, value) {
            this._addCondition(key, '$regex', this._quote(value) + '$');
            return this;
        },
        ascending: function (key) {
            if (Bmob._isNullOrUndefined(this._order)) {
                this._order = key;
            } else {
                this._order = this._order + ',' + key;
            }
            return this;
        },
        cleanOrder: function (key) {
            this._order = null;
            return this;
        },
        descending: function (key) {
            if (Bmob._isNullOrUndefined(this._order)) {
                this._order = '-' + key;
            } else {
                this._order = this._order + ',-' + key;
            }
            return this;
        },
        near: function (key, point) {
            if (!(point instanceof Bmob.GeoPoint)) {
                point = new Bmob.GeoPoint(point);
            }
            this._addCondition(key, '$nearSphere', point);
            return this;
        },
        withinRadians: function (key, point, distance) {
            this.near(key, point);
            this._addCondition(key, '$maxDistance', distance);
            return this;
        },
        withinMiles: function (key, point, distance) {
            return this.withinRadians(key, point, distance / 3958.8);
        },
        withinKilometers: function (key, point, distance) {
            return this.withinRadians(key, point, distance / 6371);
        },
        withinGeoBox: function (key, southwest, northeast) {
            if (!(southwest instanceof Bmob.GeoPoint)) {
                southwest = new Bmob.GeoPoint(southwest);
            }
            if (!(northeast instanceof Bmob.GeoPoint)) {
                northeast = new Bmob.GeoPoint(northeast);
            }
            this._addCondition(key, '$within', {
                '$box': [
                    southwest,
                    northeast
                ]
            });
            return this;
        },
        include: function () {
            var self = this;
            Bmob._arrayEach(arguments, function (key) {
                if (_.isArray(key)) {
                    self._include = self._include.concat(key);
                } else {
                    self._include.push(key);
                }
            });
            return this;
        },
        select: function () {
            var self = this;
            this._select = this._select || [];
            Bmob._arrayEach(arguments, function (key) {
                if (_.isArray(key)) {
                    self._select = self._select.concat(key);
                } else {
                    self._select.push(key);
                }
            });
            return this;
        },
        each: function (callback, options) {
            options = options || {};
            if (this._order || this._skip || this._limit >= 0) {
                var error = 'Cannot iterate on a query with sort, skip, or limit.';
                return Bmob.Promise.error(error)._thenRunCallbacks(options);
            }
            var promise = new Bmob.Promise();
            var query = new Bmob.Query(this.objectClass);
            query._limit = options.batchSize || 100;
            query._where = _.clone(this._where);
            query._include = _.clone(this._include);
            query.ascending('objectId');
            var finished = false;
            return Bmob.Promise._continueWhile(function () {
                return !finished;
            }, function () {
                return query.find().then(function (results) {
                    var callbacksDone = Bmob.Promise.as();
                    Bmob._.each(results, function (result) {
                        callbacksDone = callbacksDone.then(function () {
                            return callback(result);
                        });
                    });
                    return callbacksDone.then(function () {
                        if (results.length >= query._limit) {
                            query.greaterThan('objectId', results[results.length - 1].id);
                        } else {
                            finished = true;
                        }
                    });
                });
            })._thenRunCallbacks(options);
        }
    };
    Bmob.FriendShipQuery = Bmob.Query._extend({
        _objectClass: Bmob.User,
        _newObject: function () {
            return new Bmob.User();
        },
        _processResult: function (json) {
            var user = json[this._friendshipTag];
            if (user.__type === 'Pointer' && user.className === '_User') {
                delete user.__type;
                delete user.className;
            }
            return user;
        }
    });
    Bmob.History = function () {
        this.handlers = [];
        _.bindAll(this, 'checkUrl');
    };
    var routeStripper = /^[#\/]/;
    var isExplorer = /msie [\w.]+/;
    Bmob.History.started = false;
    _.extend(Bmob.History.prototype, Bmob.Events, {
        interval: 50,
        getHash: function (windowOverride) {
            var loc = windowOverride ? windowOverride.location : window.location;
            var match = loc.href.match(/#(.*)$/);
            return match ? match[1] : '';
        },
        getFragment: function (fragment, forcePushState) {
            if (Bmob._isNullOrUndefined(fragment)) {
                if (this._hasPushState || forcePushState) {
                    fragment = window.location.pathname;
                    var search = window.location.search;
                    if (search) {
                        fragment += search;
                    }
                } else {
                    fragment = this.getHash();
                }
            }
            if (!fragment.indexOf(this.options.root)) {
                fragment = fragment.substr(this.options.root.length);
            }
            return fragment.replace(routeStripper, '');
        },
        start: function (options) {
            if (Bmob.History.started) {
                throw new Error('Bmob.history has already been started');
            }
            Bmob.History.started = true;
            this.options = _.extend({}, { root: '/' }, this.options, options);
            this._wantsHashChange = this.options.hashChange !== false;
            this._wantsPushState = !!this.options.pushState;
            this._hasPushState = !!(this.options.pushState && window.history && window.history.pushState);
            var fragment = this.getFragment();
            var docMode = document.documentMode;
            var oldIE = isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7);
            if (oldIE) {
                this.iframe = Bmob.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
                this.navigate(fragment);
            }
            if (this._hasPushState) {
                Bmob.$(window).bind('popstate', this.checkUrl);
            } else if (this._wantsHashChange && 'onhashchange' in window && !oldIE) {
                Bmob.$(window).bind('hashchange', this.checkUrl);
            } else if (this._wantsHashChange) {
                this._checkUrlInterval = window.setInterval(this.checkUrl, this.interval);
            }
            this.fragment = fragment;
            var loc = window.location;
            var atRoot = loc.pathname === this.options.root;
            if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
                this.fragment = this.getFragment(null, true);
                window.location.replace(this.options.root + '#' + this.fragment);
                return true;
            } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
                this.fragment = this.getHash().replace(routeStripper, '');
                window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
            }
            if (!this.options.silent) {
                return this.loadUrl();
            }
        },
        stop: function () {
            Bmob.$(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
            window.clearInterval(this._checkUrlInterval);
            Bmob.History.started = false;
        },
        route: function (route, callback) {
            this.handlers.unshift({
                route: route,
                callback: callback
            });
        },
        checkUrl: function (e) {
            var current = this.getFragment();
            if (current === this.fragment && this.iframe) {
                current = this.getFragment(this.getHash(this.iframe));
            }
            if (current === this.fragment) {
                return false;
            }
            if (this.iframe) {
                this.navigate(current);
            }
            if (!this.loadUrl()) {
                this.loadUrl(this.getHash());
            }
        },
        loadUrl: function (fragmentOverride) {
            var fragment = this.fragment = this.getFragment(fragmentOverride);
            var matched = _.any(this.handlers, function (handler) {
                if (handler.route.test(fragment)) {
                    handler.callback(fragment);
                    return true;
                }
            });
            return matched;
        },
        navigate: function (fragment, options) {
            if (!Bmob.History.started) {
                return false;
            }
            if (!options || options === true) {
                options = { trigger: options };
            }
            var frag = (fragment || '').replace(routeStripper, '');
            if (this.fragment === frag) {
                return;
            }
            if (this._hasPushState) {
                if (frag.indexOf(this.options.root) !== 0) {
                    frag = this.options.root + frag;
                }
                this.fragment = frag;
                var replaceOrPush = options.replace ? 'replaceState' : 'pushState';
                window.history[replaceOrPush]({}, document.title, frag);
            } else if (this._wantsHashChange) {
                this.fragment = frag;
                this._updateHash(window.location, frag, options.replace);
                if (this.iframe && frag !== this.getFragment(this.getHash(this.iframe))) {
                    if (!options.replace) {
                        this.iframe.document.open().close();
                    }
                    this._updateHash(this.iframe.location, frag, options.replace);
                }
            } else {
                window.location.assign(this.options.root + fragment);
            }
            if (options.trigger) {
                this.loadUrl(fragment);
            }
        },
        _updateHash: function (location, fragment, replace) {
            if (replace) {
                var s = location.toString().replace(/(javascript:|#).*$/, '');
                location.replace(s + '#' + fragment);
            } else {
                location.hash = fragment;
            }
        }
    });
    Bmob.Router = function (options) {
        options = options || {};
        if (options.routes) {
            this.routes = options.routes;
        }
        this._bindRoutes();
        this.initialize.apply(this, arguments);
    };
    var namedParam = /:\w+/g;
    var splatParam = /\*\w+/g;
    var escapeRegExp = /[\-\[\]{}()+?.,\\\^\$\|#\s]/g;
    _.extend(Bmob.Router.prototype, Bmob.Events, {
        initialize: function () {
        },
        route: function (route, name, callback) {
            Bmob.history = Bmob.history || new Bmob.History();
            if (!_.isRegExp(route)) {
                route = this._routeToRegExp(route);
            }
            if (!callback) {
                callback = this[name];
            }
            Bmob.history.route(route, _.bind(function (fragment) {
                var args = this._extractParameters(route, fragment);
                if (callback) {
                    callback.apply(this, args);
                }
                this.trigger.apply(this, ['route:' + name].concat(args));
                Bmob.history.trigger('route', this, name, args);
            }, this));
            return this;
        },
        navigate: function (fragment, options) {
            Bmob.history.navigate(fragment, options);
        },
        _bindRoutes: function () {
            if (!this.routes) {
                return;
            }
            var routes = [];
            for (var route in this.routes) {
                if (this.routes.hasOwnProperty(route)) {
                    routes.unshift([
                        route,
                        this.routes[route]
                    ]);
                }
            }
            for (var i = 0, l = routes.length; i < l; i++) {
                this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
            }
        },
        _routeToRegExp: function (route) {
            route = route.replace(escapeRegExp, '\\$&').replace(namedParam, '([^/]+)').replace(splatParam, '(.*?)');
            return new RegExp('^' + route + '$');
        },
        _extractParameters: function (route, fragment) {
            return route.exec(fragment).slice(1);
        }
    });
    Bmob.Router.extend = Bmob._extend;
    Bmob.Image = Bmob.Image || {};
    _.extend(Bmob.Image, {
        thumbnail: function (data, options) {
            var request = Bmob._request('images/thumbnail', null, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return resp;
            });
        },
        watermark: function (data, options) {
            var request = Bmob._request('images/watermark', null, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return resp;
            });
        }
    });
    Bmob.generateCode = Bmob.generateCode || {};
    Bmob.generateCode = function (data, options) {
        var request = Bmob._request('wechatApp/qr/generatecode', null, null, 'POST', Bmob._encode(data, null, true));
        return request.then(function (resp) {
            return Bmob._decode(null, resp);
        })._thenRunCallbacks(options);
    };
    Bmob.Sms = Bmob.Sms || {};
    _.extend(Bmob.Sms, {
        requestSms: function (data, options) {
            var request = Bmob._request('requestSms', null, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return Bmob._decode(null, resp);
            })._thenRunCallbacks(options);
        },
        requestSmsCode: function (data, options) {
            var request = Bmob._request('requestSmsCode', null, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return Bmob._decode(null, resp);
            })._thenRunCallbacks(options);
        },
        verifySmsCode: function (mob, verifyCode, options) {
            var data = { 'mobilePhoneNumber': mob };
            var request = Bmob._request('verifySmsCode/' + verifyCode, null, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return Bmob._decode(null, resp);
            })._thenRunCallbacks(options);
        },
        querySms: function (smsId, options) {
            var request = Bmob._request('querySms/' + smsId, null, null, 'GET', null);
            return request.then(function (resp) {
                return Bmob._decode(null, resp);
            })._thenRunCallbacks(options);
        }
    });
    Bmob.Pay = Bmob.Pay || {};
    _.extend(Bmob.Pay, {
        wechatPay: function (price, product_name, body, openid, options) {
            var data = {
                'order_price': price,
                'product_name': product_name,
                'body': body,
                'open_id': openid,
                'pay_type': 4
            };
            var request = Bmob._request('pay', null, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return Bmob._decode(null, resp);
            })._thenRunCallbacks(options);
        },
        queryOrder: function (orderId, options) {
            var request = Bmob._request('pay/' + orderId, null, null, 'GET', null);
            return request.then(function (resp) {
                return Bmob._decode(null, resp);
            })._thenRunCallbacks(options);
        }
    });
    Bmob.Cloud = Bmob.Cloud || {};
    _.extend(Bmob.Cloud, {
        run: function (name, data, options) {
            var request = Bmob._request('functions', name, null, 'POST', Bmob._encode(data, null, true));
            return request.then(function (resp) {
                return Bmob._decode(null, resp).result;
            })._thenRunCallbacks(options);
        }
    });
    Bmob.Installation = Bmob.Object.extend('_Installation');
    Bmob.Push = Bmob.Push || {};
    Bmob.Push.send = function (data, options) {
        if (data.where) {
            data.where = data.where.toJSON().where;
        }
        if (data.push_time) {
            data.push_time = data.push_time.toJSON();
        }
        if (data.expiration_time) {
            data.expiration_time = data.expiration_time.toJSON();
        }
        if (data.expiration_time && data.expiration_time_interval) {
            throw 'Both expiration_time and expiration_time_interval can\'t be set';
        }
        var request = Bmob._request('push', null, null, 'POST', data);
        return request._thenRunCallbacks(options);
    };
}.call(this));