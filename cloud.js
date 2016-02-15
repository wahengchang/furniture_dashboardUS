var AV = require('leanengine');
var _ = require("underscore");
var moltinAPI = require('./moltin.js')
var checkAPI = require('./cloud/backup_check.js')


AV.Cloud.define('createSuperUser', function(request, response) {
    var user = new AV.User();

    user.set('username', request.params.username);
    user.set('password', request.params.password);
    user.set('level', request.params.level);
    user.set('userType', "iStagingAdmin");
    user.set('Administor', true);

    user.signUp().then(function(user) {
        response.success(user);
    }, function(error) {
        response.error(error);
    });
})

AV.Cloud.define('syncWithMoltin', function(request, response) {
    moltinAPI.syncWithMoltin();
})

AV.Cloud.define("getAllProducts", function(request, response) {
    var date = new Date();
    console.log(date.getSeconds());

    var data = [];

    var queryProduct = new AV.Query("Products");
    //TODO: need to pagination in the future
    queryProduct.limit(1000);
    queryProduct.find().then(function(products) {

        promises = [];
        _.each(products, function(product) {
            var pt = product.toJSON();
            var pObj = {
                objectId: pt.objectId,
                title: pt.title,
                sku: pt.sku,
                depth: pt.depth,
                width: pt.width,
                height: pt.height,
                price: pt.price,
                slut: pt.slut,
                ar: pt.ar,
                images: pt.images,
                description: pt.description,
                android_object_url: pt.android_object_url,
                ios_object_url: pt.ios_object_url,
                createdAt: pt.createdAt,
                brand: {},
                category: []
            }
            data.push(pObj);
        })
        return AV.Promise.when(promises);
    }).then(function() {
        var date = new Date();
        console.log(date.getSeconds());
        response.success(JSON.stringify(data));
    });
})


AV.Cloud.define('checkdownloadlink', function(request, response) {
        checkAPI.hello({
            success: function (returnValue1){

            var brokenlinkArr=returnValue1.result;
            var body;

            if(!brokenlinkArr){
                body="<h4>there is 0 links is broken.</h4><br>"
            }
            else{
                body="<h4>there is "+brokenlinkArr.length+" links is broken.</h4><br>"

                console.log(brokenlinkArr)
                _.each(brokenlinkArr, function(link) { 
                    console.log(link);
                    body+="<p>"+link+"</p><br>"
                });
            }

            // console.log("returnValue1");
            // console.log(returnValue1);
                checkAPI.sendemail(body,{
                    success: function (returnValue2){
                        response.success(returnValue2);
                    },
                    error: function (error2){
                        response.error(error);
                    }
                });
                // response.success(returnValue);
            },
            error: function (error){
                response.error(error);
            }
        });
});


module.exports = AV.Cloud;
