var AV = require('leanengine');
var _ = require('lodash');
var Q = require('q');

var moltin = require('moltin')({
    publicId: 'nTmCJeGQdP6B01OoPuUBpJtx4G0sySAsQxxqfNN6',
    secretKey: 'g67UoU27kDu7l44vuvtqJH8sPUhaP3n8pVUMZCSu'
});


var Brand = AV.Object.extend("Brands");
var Category = AV.Object.extend("Categories");
var Product = AV.Object.extend("Products");
var Space = AV.Object.extend("Space");
var InteriorDesign = AV.Object.extend("InteriorDesign");
var InteriorType = AV.Object.extend("InteriorType");


var moltinModule = function() {};

process.on('uncaughtException', function(error) {
    console.log(error.stack);
});

var updateBrand = function() {
    var deferred = Q.defer();


    moltin.Brand.List({
        'offset': 0,
        'limit': 50
    }, function(list, pagination) {

        var data = _.map(list, function(item) {
            var obj = new Brand();
            obj.set('slug', item.slug);
            obj.set('title', item.title);
            obj.set('description', item.description);
            return obj;
        });

        AV.Object.saveAll(data, {
            success: function(result) {
                console.log('updateBrand success');
                deferred.resolve();
            },
            error: function(error) {
                console.log('updateBrand fail');
                deferred.reject(error);
            }
        });
    }, function(error, msg) {
        console.log(error);
        console.log(msg);
    });
    return deferred.promise;
};


var updateCategories = function() {
    var deferred = Q.defer();

    moltin.Category.List({
        'offset': 0,
        'limit': 100
    }, function(list, pagination) {
        //console.log(list);
        var data = _.map(list, function(item) {
            var obj = new Category();
            obj.set('slug', item.slug);
            obj.set('title', item.title);
            obj.set('description', item.description);
            obj.set('order', item.order);
            return obj;
        });

        AV.Object.saveAll(data, {
            success: function(result) {
                console.log('updateCategories success');
                deferred.resolve();
            },
            error: function(error) {
                console.log('updateCategories fail');
                deferred.reject(error);
            }
        });

    }, function(error, msg) {
        console.log(error);
        console.log(msg);
    });
    return deferred.promise;
};



var getAllProduct = function(deferred, offset, list) {
    deferred = deferred || Q.defer();
    offset = offset || 0;
    list = list || [];


    moltin.Product.List({
        'offset': offset,
        'limit': 50
    }, function(result, pagination) {

        list = list.concat(result);
        if (false !== pagination.offsets.next) {
            getAllProduct(deferred, pagination.offsets.next, list);
        } else {
            deferred.resolve(list);
        }
    });
    return deferred.promise;
};

var updateProduct = function() {
    var deferred = Q.defer();
    var query = new AV.Query(Brand);
    var p1 = query.find();

    var categoriesMap = {},
        brandMap = {};

    p1 = p1.then(function(result) {
        _.each(result, function(item) {
            brandMap[item.get('slug')] = item;
        });
        query = new AV.Query(Category);
        return query.find();
    });

    p1 = p1.then(function(result) {

        _.each(result, function(item) {
            categoriesMap[item.get('slug')] = item;
        });
        return getAllProduct();
    });

    p1 = p1.then(function(list) {

        var data = _.map(list, function(item) {
            var obj = new Product();
            obj.set('slug', item.slug);
            obj.set('title', item.title);
            obj.set('description', item.description);
            obj.set('order', item.order);
            obj.set('sku', item.sku);
            obj.set('ar', (_.get(item, 'ar.value', '') === 'Yes'));

            obj.set('android_object_url', item.android_object_url);
            obj.set('ios_object_url', item.ios_object_url);
            obj.set('version', item.version);
            obj.set('weigth', item.weigth);
            obj.set('width', item.width);
            obj.set('height', item.height);
            obj.set('depth', item.depth);
            obj.set('images', _.pluck(item.images, 'url.http'));
            obj.set('brand', brandMap[_.get(item, 'brand.data.slug', '')]);
            obj.set('interior_design', _.get(item, 'interior_design.value', ''));
            obj.set('price', _.get(item, 'price.data.raw.with_tax', 0));
            obj.set('currency', 'USD');

            var categories = [];
            var categorieIDs = [];
            var tmp = _.get(item, 'category.data', []);

            _.each(tmp, function(item) {
                categorieIDs.push(categoriesMap[item.slug].id);
                categories.push(categoriesMap[item.slug]);
            });

            obj.set('category', categories);
            obj.set('categorieIDs', categorieIDs);
            return obj;
        });

        AV.Object.saveAll(data, {
            success: function(result) {
                console.log('updateProduct success');
                deferred.resolve();
            },
            error: function(error) {
                console.log('updateProduct fail');
                deferred.reject(error);
            }
        });
    });
    return deferred.promise;
};

var updateSpace = function() {
    var deferred = Q.defer();

    moltin.Entry.List('space', {
        'offset': 0,
        'limit': 100
    }, function(list, pagination) {


        var data = _.map(list, function(item) {
            var obj = new Space();
            obj.set('seq', item.seq);
            obj.set('title', item.title);
            return obj;
        });

        AV.Object.saveAll(data, {
            success: function(result) {
                console.log('updateSpace success');
                deferred.resolve();
            },
            error: function(error) {
                console.log('updateSpace fail');
                deferred.reject(error);
            }
        });
    }, function(error, msg) {
        console.log(error);
        console.log(msg);
    });
    return deferred.promise;
};


var updateInteriorType = function() {
    var deferred = Q.defer();

    moltin.Entry.List('interior_type', {
        'offset': 0,
        'limit': 100
    }, function(list, pagination) {

        var data = _.map(list, function(item) {
            var obj = new InteriorType();
            obj.set('slug', item.slug);
            obj.set('title', item.title);
            return obj;
        });

        AV.Object.saveAll(data, {
            success: function(result) {
                console.log('updateInteriorType success');
                deferred.resolve();
            },
            error: function(error) {
                console.log('updateInteriorType fail');
                deferred.reject(error);
            }
        });
    }, function(error, msg) {
        console.log(error);
        console.log(msg);
    });
    return deferred.promise;
};

var updateInteriorDesign = function() {
    var deferred = Q.defer();

    var query = new AV.Query(InteriorType);
    var p1 = query.find();

    var spaceMap = {},
        interiorTypeMap = {},
        productMap = {},
        productIdMap = {};

    p1 = p1.then(function(result) {
        _.each(result, function(item) {
            interiorTypeMap[item.get('slug')] = item;
        });
        query = new AV.Query(Space);
        return query.find();
    });

    p1 = p1.then(function(result) {
        _.each(result, function(item) {
            spaceMap[item.get('title')] = item;
        });
        query = new AV.Query(Product);
        query.notEqualTo("interior_design", "");

        return query.find();
    });

    p1 = p1.then(function(result) {
        _.each(result, function(item) {

            if (!item.get('interior_design'))
                return;

            if (!productMap[item.get('interior_design')]) {
                productMap[item.get('interior_design')] = [];
                productIdMap[item.get('interior_design')] = [];
            }

            productMap[item.get('interior_design')].push(item);
            productIdMap[item.get('interior_design')].push(item.id);

        });

        moltin.Entry.List('interior_design', {
            'offset': 0,
            'limit': 100
        }, function(list, pagination) {

            var data = _.map(list, function(item) {
                var obj = new InteriorDesign();
                obj.set('slug', item.slug);
                obj.set('title', item.title);
                obj.set('description', item.description);
                obj.set('android_object_url', item.android_object_url);
                obj.set('ios_object_url', item.ios_object_url);
                obj.set('mode', item.mode);
                obj.set('products', productMap[item.title] || []);
                obj.set('productIds', productIdMap[item.title] || []);
                obj.set('version', item.version);
                obj.set('images', _.pluck(item.images, 'url.http'));
                obj.set('space', spaceMap[_.get(item, 'space.data.title', '')]);
                obj.set('type', interiorTypeMap[_.get(item, 'type.data.slug', '')]);
                return obj;
            });

            AV.Object.saveAll(data, {
                success: function(result) {
                    console.log('updateInteriorDesign success');
                    deferred.resolve();
                },
                error: function(error) {
                    console.log('updateInteriorDesign fail');
                    deferred.reject(error);
                }
            });

        }, function(error, msg) {
            console.log(error);
            console.log(msg);
        });
    });
    return deferred.promise;
};


moltinModule.syncWithMoltin = function() {

    moltin.Authenticate(function() {

        var p1 = updateBrand();

        p1 = p1.then(function() {
            return updateCategories();
        });

        p1 = p1.then(function() {
            return updateProduct();
        });

        p1 = p1.then(function() {
            return updateSpace();
        });

        p1 = p1.then(function() {
            return updateInteriorType();
        });

        p1 = p1.then(function() {
            return updateInteriorDesign();
        });
    });
};


module.exports = moltinModule;
