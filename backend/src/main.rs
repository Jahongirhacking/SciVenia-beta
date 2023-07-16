extern crate core;

#[macro_use] extern crate rocket;

mod graph;
mod requests_to_python;

use crate::requests_to_python::get_coauthors_by_id;
use std::string::String;
use graph::{ScientistsSocialGraph, ScientistProfile};
use requests_to_python::get_author_info;
use rocket::{Build, Rocket, Request, Response, Config};
use rocket::http::{Method, Status};
use rocket::http::Header;
use rocket::serde::Deserialize;
use serde::Serialize;
use rocket::fairing::{Fairing, Info, Kind};
use rocket::serde::json::Value;

pub struct Cors;

#[rocket::async_trait]
impl Fairing for Cors {
    fn info(&self) -> Info {
        Info {
            name: "Cross-Origin-Resource-Sharing Fairing",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, PATCH, PUT, DELETE, HEAD, OPTIONS, GET",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));

        if _request.method() == Method::Options {
            response.set_status(Status::Ok);
        }
    }
}

#[derive(Serialize, Deserialize)]
struct JsonForID {
    search_metadata: SearchMetaData,
    search_parameters: SearchParameters,
    profiles : Option<Vec<ProfileSmall>>,
}
#[derive(Serialize, Deserialize)]
struct SearchMetaData {
    id : String,
    status : String,
    json_endpoint : String,
    created_at : String,
    processed_at : String,
    google_scholar_profiles_url : Option<String>,
    google_scholar_author_url : Option<String>,
    raw_html_file : String,
    total_time_taken : f32
}

#[derive(Serialize, Deserialize)]
struct SearchParameters {
    engine : String,
    mauthors : Option<String>,
    author_id : Option<String>,
    hl : String
}
#[derive(Serialize, Deserialize)]
struct ProfileSmall {
    name : String,
    link : String,
    serpapi_link : String,
    author_id : String,
    affiliations : String,
    email : String,
    cited_by : i128,
    /*interests : Option<Vec <Interest>>,*/
    thumbnail : String
}
#[derive(Serialize, Deserialize)]
struct InterestId {
    title : String,
    serpapi_link : String,
    link : String
}


#[derive(Serialize, Deserialize)]
struct AuthorFullProfile {
    search_metadata : SearchMetaData,
    search_parameters : SearchParameters,
    co_authors : Option<Vec<CoAuthor>>
}
#[derive(Serialize, Deserialize)]
struct CoAuthor {
    name : String,
    link : String,
    affiliations : String
}

async fn get_coauthors_with_pubs_data(id: &str) -> Vec<(graph::ScientistGraphVertex, usize, usize)> {
  let coauthors_pubs = get_coauthors_by_id(id).await;

  let mut coauthors = Vec::new();
  let mut second_step = Vec::new();
  
  match &coauthors_pubs {
    Some(collaborators) => {
      for (name, pubs_info) in collaborators.iter() {
        match get_author_info(name).await {
            Some(curent_author) => {
              second_step.push(());
              coauthors.push((curent_author.to_scientist_graph_vertex(),
              pubs_info["number_pub"] as usize,
              pubs_info["year"] as usize));
            },
            None => {}
        };
        
      }
    }
    None => {}
  }

  coauthors
}

#[get("/")]
async fn home_page() -> &'static str {
    "Hello, world"
}


#[get("/get_graph_vertex/<id>")]
async fn get_graph_vertex(id : &str) -> Value {
  match get_author_info(id).await {
    Some(author) => {
      author.to_scientist_graph_vertex().to_json()
    }
    None => return Value::Null
  }
}

#[get("/get_graph/<id>")]
async fn get_graph(id: &str) -> Value {
  let author = get_author_info(id);
  let coauthors_async = get_coauthors_with_pubs_data(id);
  let mut coauthors;
  let mut graph;
  match author.await {
    Some(root) => {
      coauthors = coauthors_async.await;
      graph = ScientistsSocialGraph::create_from_list(root.to_scientist_graph_vertex(), 
                                                                                  coauthors.clone());
    }
    None => return Value::Null
  }
  for coauthor in &coauthors {
    for source in &coauthor.0.coauthors {
      let second_coauthors = get_coauthors_with_pubs_data(source).await;
      for target in &second_coauthors {
        graph.add_scientist(target.0.clone());
        let source_vertex = graph.get_scientist_by_scholar_id(source.clone()).unwrap();
        let target_vertex = graph.get_scientist_by_scholar_id(target.0.scholar_id.clone()).unwrap();
        graph.connect_scientists(source_vertex.inner_graph_id, target_vertex.inner_graph_id, target.1, target.2);
      }
    }
  }
  graph.to_json()
}

#[launch]
fn rocket() -> Rocket<Build>{
  let fig = Config :: figment().merge(("port", 8000)).merge(("address", "0.0.0.0"));
  rocket :: custom(fig).mount("/", routes![home_page, get_graph_vertex, get_graph]).attach(Cors)
}


