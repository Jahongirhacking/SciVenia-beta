from functools import cache

from pprint import pprint
from urllib.parse import unquote

from scholarly import scholarly, ProxyGenerator

from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os

app = FastAPI()

pg = ProxyGenerator()
while not (success := pg.ScraperAPI("7e8e27f86ff1c387d4121ca0e3726788")):
    pass
scholarly.use_proxy(pg)
    
@cache
@app.get("/publication/{title}")
async def get_publication(title):
    search_query = scholarly.search_pubs(unquote(title))
    publication = next(search_query)
    
    response = JSONResponse(content=publication)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response

@cache
@app.get("/name/co_authors/{author_name}")
async def get_coauthors_by_name(author):
    search_query = scholarly.search_author(author)
    author = scholarly.fill(next(search_query), sections=['coauthors', 'publications'])
    publications = list(map(scholarly.fill, author['publications']))
    authors_extra = dict()
    default_author = {
        "year": 10000,
        "number_pub": 0,
    }

    for publication in publications:
        authors: str = publication['bib']['author']
        year = publication['bib'].get('pub_year', 10000)
        for pub_author in authors.split(' and '):
            author_prev_data = authors_extra.get(pub_author, default_author)
            authors_extra[pub_author] = {
                "year": min(year, author_prev_data["year"]),
                "number_pub": author_prev_data["number_pub"] + 1,
            }
    result = []
    for coauthor in author['coauthors']:
        coauthor['year'] = authors_extra[coauthor['name']]['year']
        coauthor['number'] = authors_extra[coauthor['name']]['number_pub']
        result.append(coauthor)

    response = JSONResponse(content=result)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response


@cache
@app.get("/name/author_info/{author_name}")
async def get_author_info_by_name(author):
    search_query = scholarly.search_author(author)
    result = scholarly.fill(next(search_query), sections=['indices', 'basics', 'counts'])
    response = JSONResponse(content=result)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response


@cache
@app.get("/id/coauthors/{author_id}")
async def get_coauthors_by_id(author_id):
    search_query = scholarly.search_author_id(author_id)
    author = scholarly.fill(search_query, sections=['coauthors', 'publications'])
    
    response = JSONResponse(content=author)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response


@cache
@app.get("/id/author_info/{author_id}")
async def get_author_info_by_id(author_id):
    search_query = scholarly.search_author_id(author_id)
    result = scholarly.fill(search_query, sections=['indices', 'basics', 'counts', 'coauthors', 'publications'])
    response = JSONResponse(content=result)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response


@cache
@app.get("/id/light_author_info/{author_id}")
async def get_light_data(author_id):
    result = scholarly.search_author_id(author_id)
    response = JSONResponse(content=result)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response
@cache
@app.get("/id/get_some_info/{author_id}")
async def get_some_info_by_id(author_id):
    search_query = scholarly.search_author_id(author_id)
    me = scholarly.fill(search_query, sections=['indices', 'basics', 'counts', 'coauthors', 'publications'])
    result = dict()
    result['root'] = {
        'affiliation' : me.get('affiliation', "not found"),
        'name' : me.get('name', 'not found'),
        'organization' : me.get('organization', -1),
        'scholar_id' : me.get('scholar_id', 'not found'),
        'inner_graph_id' : 0,                               # WHAT IS IT?
        'url_picture' : me.get('url_picture', 'not found'),
        'coauthors' : me.get('coauthors', []),
        "inner_graph_coauthors": [],                        # WHAT IS IT?
        "visited": False,
    }
    
    edges = list()
        
    nodes = [{
        "affiliation": me.get('affiliation', "not found"),
        "citedby": me.get('citedby', -1),
        "citedby5y": me.get('citedby5y', -1),
        "coauthors": me.get('coauthors', []),
        "email_domain": me.get('email_domain', 'not found'),
        "interests": me.get('interests', []),
        "name": me.get('name', 'not found'),
        "organization": me.get('organization', -1),
        "scholar_id": me.get('scholar_id', 'not found'),
        "url_picture": me.get('url_picture', 'not found'),
    }]
    
    for author in me['coauthors']:
        author = scholarly.fill(author, sections=['basics'])
        edges.append({
            "id" : len(edges),
            "source" : me.get('scholar_id', 'not found'),
            "target" : author.get('scholar_id', 'not found'),
        })
        
        nodes.append({
            "affiliation": author.get('affiliation', "not found"),
            "citedby": author.get('citedby', -1),
            "citedby5y": author.get('citedby5y', -1),
            "coauthors": author.get('coauthors', []),
            "email_domain": author.get('email_domain', 'not found'),
            "interests": author.get('interests', []),
            "name": author.get('name', 'not found'),
            "organization": author.get('organization', -1),
            "scholar_id": author.get('scholar_id', 'not found'),
            "url_picture": author.get('url_picture', 'not found'),
        })
        
    
    result['graph'] = {
        "edges" : edges,
        "nodes" : nodes,
    }
    
    response = JSONResponse(content=result)

    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"

    return response



if __name__ == "__main__":
    
    os.system("uvicorn api:app --reload --host 0.0.0.0 --port 3000")
