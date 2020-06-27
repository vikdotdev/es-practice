// 204-import-schema.es

PUT /movies
{
  "mappings": {
    "properties": {
      "year": {
        "type": "date"
      }
    }
  }
}

// 205-import-single-record.es
GET /movies

POST /movies/_doc
{
  "genre": ["IMAX", "Sci-Fi"],
  "title": "Interstellar",
  "year": 2014
}

GET /movies/_search

// 206-bulk-import.es

// PUT /movies/_bulk --data-binary @movies.json

PUT /movies/_bulk
{ "create" : { "_index" : "movies", "_id" : "135569" } }
{ "id": "135569", "title" : "Star Trek Beyond", "year":2016 , "genre":["Action", "Adventure", "Sci-Fi"] }
{ "create" : { "_index" : "movies", "_id" : "122886" } }
{ "id": "122886", "title" : "Star Wars: Episode VII - The Force Awakens", "year":2015 , "genre":["Action", "Adventure", "Fantasy", "Sci-Fi", "IMAX"] }
{ "create" : { "_index" : "movies", "_id" : "109487" } }
{ "id": "109487", "title" : "Interstellar", "year":2014 , "genre":["Sci-Fi", "IMAX"] }
{ "create" : { "_index" : "movies", "_id" : "58559" } }
{ "id": "58559", "title" : "Dark Knight, The", "year":2008 , "genre":["Action", "Crime", "Drama", "IMAX"] }
{ "create" : { "_index" : "movies", "_id" : "1924" } }
{ "id": "1924", "title" : "Plan 9 from Outer Space", "year":1959 , "genre":["Horror", "Sci-Fi"] }

// 207-update-document.es

POST /movies/_doc/109487/_update
{
  "doc": {
    "title": "Interstellar incorrect"
  }
}
// Warning: 299 Elasticsearch-7.7.0-81a1e9eda8e6183f5237786246f6dced26a10eaf "[types removal] Specifying types in document update requests is deprecated, use the endpoint /{index}/_update/{id} instead."

POST /movies/_update/109487
{
  "doc": {
    "title": "Interstellar"
  }
}

GET /movies/_doc/109487

// 208-deleting-documents.es

DELETE /movies/_doc/qrlc1nIBpBxZ8kB-8fdt

// 210-concurrency.es
...
  "_seq_no" : 8,
  "_primary_term" : 1
...

There is a thing called 'optimistic concurrency control'.

sequence number and primary term (which is a shard number) form a unique chronological record of this document

if two requests are sent at the same time, one will work and increment the sequence number, and the other will fail, because it had outdated sequence number information. If retry on conflicts is turned on it will automatically retry.

GET /movies/_doc/109487

POST /movies/_update/109487?if_seq_no=7&if_primary_term=1
{
  "doc": {
    "title": "Interstellar foo"
  }
}

POST /movies/_update/109487?retry_on_conflict=3
{
  "doc": {
    "title": "Interstellar"
  }
}

// 211-analyzers-tokenizers.es

GET /movies/_search
{
  "query": {
    "match": {
      "title": "Star Trek"
    }
  }
}

// this lead to undesirable results when searching for genre - we dont have a 'sci' genre, but we still find 'Sci-Fi'
GET /movies/_search
{
  "query": {
    "match_phrase": {
      "genre": "sci"
    }
  }
}

DELETE /movies


PUT /movies
{
  "mappings": {
    "properties": {
      "id": {
        "type": "integer"
      },
      "year": {
        "type": "date"
      },
      "genre": {
        "type": "keyword"
      },
      "title": {
        "type": "text",
        "analyzer": "english"
      }
    }
  }
}

// keywords work with exact match
GET /movies/_search
{
  "query": {
    "match": {
      "genre": "Sci-Fi"
    }
  }
}

// 212-data-modeling.es

PUT /series
{
  "mappings": {
    "properties": {
      "film_to_franchise": {
        "type": "join",
        "relations": {
          "franchise": "film"
        }
      }
    }
  }
}


PUT /series/_bulk
{ "create" : { "_index" : "series", "_id" : "1", "routing" : 1} }
{ "id": "1", "film_to_franchise": {"name": "franchise"}, "title" : "Star Wars" }
{ "create" : { "_index" : "series", "_id" : "260", "routing" : 1} }
{ "id": "260", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode IV - A New Hope", "year":"1977" , "genre":["Action", "Adventure", "Sci-Fi"] }
{ "create" : { "_index" : "series", "_id" : "1196", "routing" : 1} }
{ "id": "1196", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode V - The Empire Strikes Back", "year":"1980" , "genre":["Action", "Adventure", "Sci-Fi"] }
{ "create" : { "_index" : "series", "_id" : "1210", "routing" : 1} }
{ "id": "1210", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode VI - Return of the Jedi", "year":"1983" , "genre":["Action", "Adventure", "Sci-Fi"] }
{ "create" : { "_index" : "series", "_id" : "2628", "routing" : 1} }
{ "id": "2628", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode I - The Phantom Menace", "year":"1999" , "genre":["Action", "Adventure", "Sci-Fi"] }
{ "create" : { "_index" : "series",  "_id" : "5378", "routing" : 1} }
{ "id": "5378", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode II - Attack of the Clones", "year":"2002" , "genre":["Action", "Adventure", "Sci-Fi", "IMAX"] }
{ "create" : { "_index" : "series", "_id" : "33493", "routing" : 1} }
{ "id": "33493", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode III - Revenge of the Sith", "year":"2005" , "genre":["Action", "Adventure", "Sci-Fi"] }
{ "create" : { "_index" : "series", "_id" : "122886", "routing" : 1} }
{ "id": "122886", "film_to_franchise": {"name": "film", "parent": "1"}, "title" : "Star Wars: Episode VII - The Force Awakens", "year":"2015" , "genre":["Action", "Adventure", "Fantasy", "Sci-Fi", "IMAX"] }

GET /series/_search
{
  "query": {
    "has_parent": {
      "parent_type": "franchise",
      "query": {
        "match": {
          "title": "Star Wars"
        }
      }
    }
  }
}

GET /series/_search
{
  "query": {
    "has_child": {
      "type": "film",
      "query": {
        "match": {
          "title": "the force awakens"
        }
      }
    }
  }
}

// 303-json-querying.es

two types of querying: filters(true/false) and queries(based on relevancy)
filters are more efficient

must == and
should == or
must_not == !


types of queries
match_all is default
match - one field - search analyzed results, such as text
multi_match for multiple fields
bool - works like bool filter but sorted for relevancy

queries are wrapper around "query" block
filters are wrapper around "filter" block

they can be combined inside one another

GET /movies/_search
{
  "query": {
    "match": {
      "title": "star"
    }
  }
}


GET /movies/_search
{
  "query": {
    "bool": {
      "must": {
        "term": {
          "title": "trek"
        }
      },
      "filter": {
        "range": {
          "year": {
            "gte": 2010
          }
        }
      }
    }
  }
}

// 304-match-phrases.es

match_phrase - find all terms in specified order

slop is used to satisfy even phrases with some unrelated words inbetween
quick brown fox == quick fox with slop 1, or
fox is quick == quick fox slop 1

is aswell useful for proximity query, assigns higher score the closer the words are

GET /movies/_search
{
  "query": {
    "match_phrase": {
      "title": "star wars"
    }
  }
}


GET /movies/_search
{
  "query": {
    "match_phrase": {
      "title": {
        "query": "star beyond",
        "slop": 1
      }
    }
  }
}

// 305-exercise.es

GET /series/_search
{
  "query": {
    "bool": {
      "must": {
        "match_phrase": {
          "title": "star wars"
          }
        },
      "filter": {
        "range": {
          "year": {
            "gte": 1980
          }
        }
      }
    }
  }
}

// 306-pagination.es

GET /movies/_search
{
  "from": 0, // offset
  "size": 2, // limit
  "query": {
    "match": {
      "title": "star"
    }
  }
}

// 307-sorting.es

sorting is tricky when dealing with analyzed fields (should use a subfield)

GET /movies/_search?sort=year

DELETE /movies

PUT /movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "raw": {
            "type": "keyword"
          }
        }
      }
    }
  }
}

GET /movies/_search?sort=title.raw

GET /movies/_search
{
  "sort": {
    "title.raw": "desc"
  }
}

// 309-exercise.es

GET /movies/_search
{
  "sort": {
    "title.raw": "asc"
  },
  "query": {
    "bool": {
      "must": {
        "match": {
          "genre": "sci-fi"
        }
      },
      "filter": {
        "range": {
          "year": {
            "lt": 1960
          }
        }
      }
    }
  }
}

// 310-fuzziness
levenstein edit distance
substitutions -> intersteller
insertions -> intersstellar
deletions -> interstelar

all of above have edit distance of 1

fuzziness `auto` changes value based on string lenght

GET /movies/_search
{
  "query": {
    "match": {
      "title": "interstellar"
    }
  }
}


GET /movies/_search
{
  "query": {
    "fuzzy": {
      "title": {
        "value": "intersteller",
        "fuzziness": 1
      }
    }
  }
}

GET /movies/_search
{
  "query": {
    "fuzzy": {
      "title": {
        "value": "intersteler",
        "fuzziness": "auto"
      }
    }
  }
}

// notice that `fuzzy` replaces `match`

// 311 partial matches?

DELETE /movies

PUT /movies
{
  "mappings":{
    "properties": {
      "year": {
        "type": "text"
      }
    }
  }
}

GET /movies

// bulk import movies from earlier...

GET /movies/_search
{
  "query": {
    "prefix": {
      "year": "201"
    }
  }
}

// prefix/wildcard query does not work on date type?

GET /movies/_search
{
  "query": {
    "wildcard": {
      "year": "1*"
    }
  }
}

// there's also regex query, which uses Apache Lucene regex syntax

// 312 match-query-prefix for autocomplete

// and easy way to achieve autocomplete
// but it's not optimal
GET /movies/_search
{
  "query": {
    "match_phrase_prefix": {
      "title": {
        "query": "star awa",
        "slop": 10
      }
    }
  }
}


// 313 ngrams
// take word `star`
// unigrams s t a r
// bigrams st ta ar
// trigrams sta tar
// 4-grams star

// edge n-grams
// s
// st
// sta
// star

// there's also such a thing as `completion suggester` which is a mechanism to manually control your autocompletion

DELETE /movies

PUT /movies
{
  "settings": {
    "analysis": {
      "filter": {
        "autocomplete": {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 20
        }
      },
      "analyzer": {
        "autocomplete": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "autocomplete"
          ]
        }
      }
    }
  }
}

// test analyzer
GET /movies/_analyze
{
  "analyzer": "autocomplete",
  "text": "StA"
}

// notice how here we use mappings in url
PUT /movies/_mappings
{
  "properties": {
    "title": {
      "type": "text",
      "analyzer": "autocomplete"
    }
  }
}

// bulk import movies here

GET /movies/_search
{
  "query": {
    "match": {
      "title": "sta"
    }
  }
}

// this came back and it's not how it's supposed to work
// "title" : "Plan 9 from Outer Space", (because of "S... in Space")
// that's because we're mapped the autocomplete analyzer on index time instead of query time

GET /movies/_search
{
  "query": {
    "match": {
      "title": {
        "query": "sta",
        "analyzer": "standard"
      }
    }
  }
}

// it's not working as intended if we try to search for star trek only
GET /movies/_search
{
  "query": {
    "match": {
      "title": {
        "query": "star tr",
        "analyzer": "standard"
      }
    }
  }
}


// 402 importing from csv with python

DELETE /movies

PUT /_bulk --data-binary @moremovies.json

PUT /_bulk

// ... insert bulk info here if data-binary isn't working

GET /movies/_search
{
  "query": {
    "match": {
      "title": "whiplash"
    }
  }
}
