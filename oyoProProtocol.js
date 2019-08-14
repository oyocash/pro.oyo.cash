var getOyoProQuery = function(address, type, appName, appUrl, beginTimestamp, endTimestamp) {
  var query = {
    "$and": [{
      "out.s1": address
    }, {
      "out.s2": type
    }, {
      "out.s3": appName
    }, {
      "out.e.a": address
    }, {
      "$or": [{
        "blk.t": {
              "$gte": beginTimestamp,
              "$lte": endTimestamp
            }
        },
        {"blk": null}
      ]
    }]
  }
  return query
}

var getOyoProAggregatedQuery = function(address, type, appName, appUrl, beginTimestamp, endTimestamp) {
  var query = {
    "v": 3,
    "q": {
      "aggregate": [{
        "$match": getOyoProQuery(address, type, appName, appUrl, beginTimestamp, endTimestamp)
      }, {
        '$project': {
          "out.s3":1, "out.s4": 1,
          'satoshis': {
            '$cond': {
              'if': {
                '$eq': [{'$arrayElemAt': ['$out.e.a', 0]}, address]
              },
              'then': {
                '$arrayElemAt': ['$out.e.v', 0]
              },
              'else': {
                '$cond': {
                  'if': {
                    '$eq': [{'$arrayElemAt': ['$out.e.a', 1]}, address]
                  },
                  'then': {
                    '$arrayElemAt': ['$out.e.v', 1]
                  },
                  'else': {
                    '$cond': {
                      'if': {
                        '$eq': [{'$arrayElemAt': ['$out.e.a', 2]}, address]
                      },
                      'then': {
                        '$arrayElemAt': ['$out.e.v', 2]
                      },
                      'else': 0
                    }
                  }
                }
              }
            }
          }
        }
      }, {
        "$group": {
            "_id": {
              "name": "$out.s3",
              "url": "$out.s4"
            },
            "satoshis": {
              "$sum": "$satoshis"
            }
        }
      }],
      "limit": 10000,
      "sort": {"satoshis": -1}
    }
  }
  return query
}
