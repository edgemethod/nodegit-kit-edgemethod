'use strict';

var Git = require('nodegit');
var debug = require('debug')('kit:commit');

var add = require('./add');
var config = require('./config');
var status = require('./status');

module.exports = function(repo, o){
    o = o || {};
    var option = {
        'user': o.user || undefined,
        'message': o.message || 'update'
    };
    
    if (o.user) 
      var signature = Git.Signature.create(
        option.user.name, 
        option.user.email, 
        Math.floor(Date.now() / 1000), 
        0
      );
                
    return status(repo)
    .then(function(status){
        if (!status.length){
            debug('nothing to commit');
            return null;
        }

        return add(repo)
        .then(function(oid){
            return Promise.all([
                repo.getTree(oid),
                repo.getHeadCommit()
            ]);
        })
        .then(function(result){
            return {
                'tree': result[0],
                'commit': result[1],
                'author': signature,
                'committer': signature,
                'message': option.message
            };
        })
        .then(function(data){
            debug('create commit');
            return repo.createCommit('HEAD',
                data.author,
                data.committer,
                data.message,
                data.tree,
                [data.commit.id()]
            );
        });
    });

};
